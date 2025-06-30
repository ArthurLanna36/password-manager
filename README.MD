## How to use:

### .\venv\Scripts\activate
### uvicorn main:app --reload

#### Requests for test in (http://127.0.0.1:8000/docs#/default/check_log_anomaly_check_log_post) for seed test:

{
  "user_id": "8500fa7d-b1d7-431f-8cfd-6d9ad364d2bb",
  "log_type": "LOGIN_SUCCESS",
  "log_date": "2025-06-30T14:30:00Z",
  "location_lat": -19.95,
  "location_lon": -44.18
}

Response: False

{
  "user_id": "8500fa7d-b1d7-431f-8cfd-6d9ad364d2bb",
  "log_type": "LOGIN_SUCCESS",
  "log_date": "2025-06-30T03:00:00Z",
  "location_lat": -19.96,
  "location_lon": -44.19
}

Response: True for login time

{
  "user_id": "8500fa7d-b1d7-431f-8cfd-6d9ad364d2bb",
  "log_type": "LOGIN_SUCCESS",
  "log_date": "2025-06-30T11:00:00Z",
  "location_lat": -22.9068,
  "location_lon": -43.1729
}

Response: True for location

{
  "user_id": "8500fa7d-b1d7-431f-8cfd-6d9ad364d2bb",
  "log_type": "LOGIN_SUCCESS",
  "log_date": "2025-06-30T23:30:00Z",
  "location_lat": -25.4284,
  "location_lon": -49.2733
}

Response: True for location (but is for both)
