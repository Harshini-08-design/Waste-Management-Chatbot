import requests
import json

url = "http://127.0.0.1:8000/chat"
data = {"question": "how to dispose plastic?", "user_id": 1}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=data, headers=headers, timeout=60)
    print(f"Status Code: {response.status_code}")
    # Force UTF-8 encoding for printing to terminal
    print(response.text.encode('utf-8').decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
