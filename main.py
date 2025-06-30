import os
from datetime import datetime, timezone
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from sklearn.cluster import DBSCAN
from supabase import Client, create_client
import requests

load_dotenv()
app = FastAPI()
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

class LogCheckRequest(BaseModel):
    user_id: str
    log_type: str
    log_date: str
    location_lat: float | None = None
    location_lon: float | None = None

def analyze_time_anomaly(new_log_time_utc: datetime, user_logs: pd.DataFrame) -> bool:
    """
    Analisa a anomalia de tempo focando apenas no cluster de atividade principal do usuário.
    """
    if len(user_logs) < 10:
        return False

    minutes = user_logs['log_date'].dt.hour * 60 + user_logs['log_date'].dt.minute
    user_logs['sin_time'] = np.sin(2 * np.pi * minutes / 1440)
    user_logs['cos_time'] = np.cos(2 * np.pi * minutes / 1440)

    time_clusterer = DBSCAN(eps=0.5, min_samples=5)
    user_logs['time_cluster'] = time_clusterer.fit_predict(user_logs[['sin_time', 'cos_time']])
    
    real_clusters = user_logs[user_logs['time_cluster'] != -1]
    if real_clusters.empty:
        print("Análise de Tempo: Nenhum padrão de horário encontrado.")
        return True

    dominant_cluster_id = real_clusters['time_cluster'].mode()[0]
    normal_logs = real_clusters[real_clusters['time_cluster'] == dominant_cluster_id]
    
    print(f"Análise de Tempo: Cluster de horário dominante encontrado: {dominant_cluster_id}")

    cluster_center_sin = normal_logs['sin_time'].mean()
    cluster_center_cos = normal_logs['cos_time'].mean()

    new_log_minutes = new_log_time_utc.hour * 60 + new_log_time_utc.minute
    new_sin = np.sin(2 * np.pi * new_log_minutes / 1440)
    new_cos = np.cos(2 * np.pi * new_log_minutes / 1440)
    
    distance = np.sqrt((new_sin - cluster_center_sin)**2 + (new_cos - cluster_center_cos)**2)
    threshold = 0.7 
    
    print(f"Análise de Tempo: Distância ao centroide do cluster dominante: {distance:.4f}")
    
    return distance > threshold

def analyze_location_anomaly(lat: float, lon: float, user_logs: pd.DataFrame) -> bool:
    coords = user_logs[['location_lat', 'location_lon']].dropna()
    if len(coords) < 3: 
        print("Análise de Localização: Poucos dados para análise.")
        return False
    dbscan = DBSCAN(eps=50/6371, min_samples=2, metric='haversine', algorithm='ball_tree')
    coords_rad = np.radians(coords.to_numpy())
    labels = dbscan.fit_predict(coords_rad)
    if not np.any(labels != -1):
        print("Análise de Localização: Nenhum cluster de localização conhecido foi formado.")
        return True
    new_point_rad = np.radians([[lat, lon]])
    all_points_rad = np.vstack([coords_rad, new_point_rad])
    all_labels = dbscan.fit_predict(all_points_rad)
    new_point_label = all_labels[-1]
    print(f"Análise de Localização: Novo ponto foi classificado no cluster: {new_point_label}")
    return new_point_label == -1

def send_push_notification(token: str, reason: str):
    if not token:
        print("Usuário não tem um push token, notificação não enviada.")
        return
    try:
        response = requests.post('https://exp.host/--/api/v2/push/send', json={
            'to': token, 'title': 'Alerta de Segurança',
            'body': f'Detectamos uma atividade incomum: {reason}', 'sound': 'default',
        })
        response.raise_for_status()
        print(f"Notificação push enviada com sucesso para o token: {token[:10]}...")
    except requests.exceptions.HTTPError as e:
        print(f"Erro HTTP ao enviar notificação push: {e.response.status_code}")
        print("Corpo da resposta de erro:", e.response.text)
    except Exception as e:
        print(f"Erro geral ao enviar notificação push: {e}")

@app.post("/check-log")
async def check_log_anomaly(request: LogCheckRequest):
    user_id = request.user_id
    response = supabase.from_("audit_log").select("log_id, log_date, location_lat, location_lon").eq("user_id", user_id).order('log_date', desc=True).limit(100).execute()
    
    def handle_anomaly(reason: str, log_id: str | None = None):
        profile_res = supabase.from_("user_profiles").select("push_token").eq("id", user_id).single().execute()
        push_token = profile_res.data.get('push_token') if profile_res.data else None
        print(f"Salvando alerta no banco de dados... Razão: {reason}")
        supabase.from_("security_alerts").insert({"user_id": user_id, "reason": reason, "log_id": log_id}).execute()
        send_push_notification(push_token, reason)
        return {"anomaly": True, "reason": reason}
        
    if not response.data or len(response.data) < 10:
        return {"anomaly": False, "reason": "Insufficient historical data"}

    user_logs_df = pd.DataFrame(response.data)
    user_logs_df['log_date'] = pd.to_datetime(user_logs_df['log_date']).dt.tz_convert('UTC')
    new_log_time = datetime.fromisoformat(request.log_date.replace('Z', '+00:00')).astimezone(timezone.utc)
    user_logs_df['location_lat'] = pd.to_numeric(user_logs_df['location_lat'], errors='coerce')
    user_logs_df['location_lon'] = pd.to_numeric(user_logs_df['location_lon'], errors='coerce')
    
    last_log_id = response.data[0]['log_id']

    if request.location_lat and request.location_lon:
        if analyze_location_anomaly(request.location_lat, request.location_lon, user_logs_df.copy()):
            return handle_anomaly("Unusual location detected.", last_log_id)
    
    if analyze_time_anomaly(new_log_time, user_logs_df.copy()):
        return handle_anomaly("Unusual login time detected.", last_log_id)
    
    return {"anomaly": False}
