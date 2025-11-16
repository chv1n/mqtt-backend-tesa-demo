import socketio
import time
import base64
import cv2
import os

# ==============================
SERVER_URL = os.getenv("SERVER_URL", "http://localhost:3000")
CAM_ID = "cam001"
DRONE_ID = "testdrone01"
FPS = 17
# ==============================

sio = socketio.Client()

@sio.event
def connect():
    print("✅ Connected to server")

@sio.event
def disconnect():
    print("❌ Disconnected from server")

@sio.event
def connect_error(err):
    print("⚠️ Connection error:", err)

sio.connect(SERVER_URL)

# เปิดกล้องหรือใช้ภาพตัวอย่าง (ถ้าไม่มีกล้อง)
cap = cv2.VideoCapture(0)  # 0 = webcam

if not cap.isOpened():
    print("⚠️ No camera found, using static image instead.")
    test_image = "test.jpg"  # เตรียมภาพชื่อ test.jpg ในโฟลเดอร์เดียวกัน

interval = 1 / FPS
print(f"🎥 Sending stream from {CAM_ID} at {FPS} FPS")

try:
    while True:
        if cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
        else:
            frame = cv2.imread(test_image)

        # ปรับขนาดภาพเล็กลงเพื่อลด bandwidth
        frame = cv2.resize(frame, (320, 240))

        # เข้ารหัสเป็น JPEG และ Base64
        _, buffer = cv2.imencode(".jpg", frame)
        img_b64 = base64.b64encode(buffer).decode("utf-8")

        # สร้าง packet ส่ง
        packet = {
            "cam_id": CAM_ID,
            "drone_id": DRONE_ID,
            "time": int(time.time()),
            "imgbase64": img_b64
        }

        # ส่ง event ไปยัง server
        sio.emit("pi_stream", packet)

        print(f"📤 Sent frame from {CAM_ID}")
        time.sleep(interval)

except KeyboardInterrupt:
    print("🛑 Stopped by user.")
finally:
    if cap.isOpened():
        cap.release()
    sio.disconnect()
