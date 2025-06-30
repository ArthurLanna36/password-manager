import os
import random
from datetime import datetime, timedelta, timezone # ✅ Importa timezone

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()
print("Iniciando script para gerar dados de teste (UTC)...")

USER_IDS_TO_SEED = [
    "8500fa7d-b1d7-431f-8cfd-6d9ad364d2bb",
]
NUM_LOGS_PER_USER = 50

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

all_logs = []
log_types = ['LOGIN_SUCCESS', 'PASSWORD_REVEALED', 'PASSWORD_COPIED', 'LOGOUT']

for user_id in USER_IDS_TO_SEED:
    print(f"Gerando {NUM_LOGS_PER_USER} logs para o usuário {user_id}...")
    base_lat = -19.967
    base_lon = -44.197

    for i in range(NUM_LOGS_PER_USER):
        # ✅ Gera o tempo diretamente em UTC
        log_time_utc = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30))
        
        # 80% de chance de ser em um horário "normal" UTC (8h às 18h)
        if random.random() < 0.8:
            log_time_utc = log_time_utc.replace(hour=random.randint(8, 18), minute=random.randint(0, 59))
        else:
            log_time_utc = log_time_utc.replace(hour=random.randint(0, 7), minute=random.randint(0, 59))

        if random.random() < 0.9:
            lat, lon = (base_lat + random.uniform(-0.05, 0.05), base_lon + random.uniform(-0.05, 0.05))
        else:
            lat, lon = (base_lat + random.uniform(1, 5), base_lon + random.uniform(1, 5))

        log_entry = {
            "user_id": user_id,
            "log_type": random.choice(log_types),
            "log_date": log_time_utc.isoformat(), # O .isoformat() em um datetime ciente de fuso inclui o +00:00
            "location_lat": str(lat),
            "location_lon": str(lon),
            "ip_address": f"177.155.12{random.randint(0,9)}.{random.randint(1,254)}",
            "details": "Log UTC gerado por script de teste."
        }
        all_logs.append(log_entry)

print(f"\nTotal de {len(all_logs)} logs gerados. Inserindo no banco de dados...")
try:
    response = supabase.from_("audit_log").insert(all_logs).execute()
    if response.data:
         print("Dados inseridos com sucesso!")
    else:
        print("A API não retornou dados, verifique o painel do Supabase.")
except Exception as e:
    print(f"Ocorreu um erro ao inserir os dados: {e}")