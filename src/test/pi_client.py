import socketio
import time
import random
import math
import os
from datetime import datetime

# =============== CONFIG ===============
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:3000")
CAM_COUNT = int(os.getenv("CAM_COUNT", "2"))
PUB_INTERVAL_MS = int(os.getenv("PUB_INTERVAL_MS", "2000"))
CENTER_LAT = float(os.getenv("CENTER_LAT", "14.30000"))
CENTER_LON = float(os.getenv("CENTER_LON", "101.17000"))
SIDE = "def"
FAKE_IMG = os.getenv("FAKE_IMG", "data:image/jpeg;base64,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")
# ======================================

print("🚀 Starting Pi5 Drone Simulator (Python)")
print("Server:", SERVER_URL)

# ตัวช่วย
def rand(min_val, max_val):
    return random.uniform(min_val, max_val)

def pick(arr):
    return random.choice(arr)

def pick_multiple(arr, count):
    arr_copy = arr[:]
    random.shuffle(arr_copy)
    return arr_copy[:count]

# กล้องจำลอง
cameras = [
    {
        "cam_id": f"cam{str(i+1).zfill(3)}",
        "cam_lat": CENTER_LAT + rand(-0.005, 0.005),
        "cam_lon": CENTER_LON + rand(-0.005, 0.005),
        "cam_bat": int(rand(85, 100)),
    }
    for i in range(CAM_COUNT)
]

# โดรนจำลอง
drones = [
    {
        "id": i,
        "type": pick(["DJIMavic", "DJIAir", "ParrotAnafi", "AutelEvo"]),
        "lat": CENTER_LAT + rand(-0.01, 0.01),
        "lon": CENTER_LON + rand(-0.01, 0.01),
        "velocity": rand(3, 10),
        "direction": rand(0, 360),
    }
    for i in range(5)
]

# อัปเดตตำแหน่งโดรน
def move_drones():
    for d in drones:
        distance = d["velocity"] * 0.00005
        rad = math.radians(d["direction"])
        d["lat"] += math.cos(rad) * distance + rand(-0.0001, 0.0001)
        d["lon"] += math.sin(rad) * distance + rand(-0.0001, 0.0001)
        d["direction"] += rand(-8, 8)
        if d["direction"] < 0:
            d["direction"] += 360
        if d["direction"] > 360:
            d["direction"] -= 360

# สร้าง packet ต่อกล้อง
def generate_packet(cam):
    move_drones()
    visible_count = random.randint(1, len(drones))
    visible = pick_multiple(drones, visible_count)
    return {
        "time": int(time.time()),
        "side": SIDE,
        "cam_info": [cam],
        "object": [
            {
                "frame": random.randint(100, 200),
                "id": d["id"],
                "type": d["type"],
                "lat": round(d["lat"], 5),
                "lon": round(d["lon"], 5),
                "velocity": round(d["velocity"], 2),
                "direction": round(d["direction"], 1),
                "imgbase64": FAKE_IMG,
            }
            for d in visible
        ],
    }

# ================= SOCKET.IO CLIENT =================
sio = socketio.Client()

@sio.event
def connect():
    print("✅ Connected to server!")
    send_loop()

@sio.event
def disconnect():
    print("❌ Disconnected from server")

@sio.event
def connect_error(err):
    print("⚠️ Connection error:", err)

def send_loop():
    try:
        while True:
            for cam in cameras:
                packet = generate_packet(cam)
                sio.emit("pi_telemetry", packet)
                print(f"[SIM] {cam['cam_id']} sent {len(packet['object'])} drone(s)")
            time.sleep(PUB_INTERVAL_MS / 1000.0)
    except KeyboardInterrupt:
        sio.disconnect()

# เริ่มเชื่อมต่อ
try:
    sio.connect(SERVER_URL, transports=["websocket"])
    sio.wait()
except KeyboardInterrupt:
    print("🛑 Stopped by user.")
