## 🏆 **19th TESA Top Gun Rally - Defense Innovation**

**โปรเจกต์แข่งขันจาก TESA (Thai Embedded Systems Association)**  
**ร่วมกับ โรงเรียนนายร้อยพระจุลจอมเกล้า (CRMA)**

# 🚁 Drone Tracking API

> **Backend สำหรับระบบติดตามโดรน (Drone Tracking System)**  
> รับข้อมูลจาก MQTT และ WebSocket  แล้วส่งต่อให้ Client ผ่าน Socket.IO พร้อมเก็บข้อมูลใน MongoDB

### 📡 **แหล่งข้อมูล**
- **Raspberry Pi (ตรวจจับโดรนศัตรู)**  
  ML model ตรวจจับโดรนจากกล้อง + คำนวณพิกัด lat/long → **WebSocket**
- **โดรนฝ่ายเรา (ติดตามตำแหน่ง)**  
  พิกัด lat/long แบบเรียลไทม์ → **MQTT**
---

## ✨ Features

- 📡 **MQTT Integration** - รับข้อมูลจาก MQTT Broker (เช่น EMQX)
- 🔌 **WebSocket (Socket.IO)** - ส่งข้อมูลแบบ Real-time ให้ Client
- 🗄️ **MongoDB** - เก็บข้อมูล Drone และ Log
- 📖 **Swagger API Docs** - เอกสาร API อัตโนมัติ
- 🐳 **Docker Support** - พร้อมใช้งานกับ Docker Compose

---

## 📂 Project Structure

```
mqtt-backend-tesa-demo/
├── src/
│   ├── config/
│   │   ├── db.js           # MongoDB connection
│   │   ├── mqtt.js         # MQTT client setup
│   │   ├── mqttHandler.js  # MQTT message handler
│   │   └── socket.js       # Socket.IO setup
│   ├── controllers/
│   │   └── droneController.js  # API controllers
│   ├── models/
│   │   ├── Drone.js        # Drone model
│   │   └── DroneLog.js     # Drone log model
│   ├── routes/
│   │   ├── drone.js        # Drone routes
│   │   └── index.js        # Index routes
│   ├── server.js           # Entry point
│   └── swagger.js          # Swagger config
├── docker-compose.yml      # Docker Compose config
├── package.json
└── .env                    # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **MongoDB** (local หรือ Docker)
- **MQTT Broker** (ใช้ `broker.emqx.io` เป็น default)

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd mqtt-backend-tesa-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   
   สร้างไฟล์ `.env` จาก template:
   ```env
   # Server
   PORT=3000
   SERVER_HOST=http://localhost

   # MongoDB
   MONGO_URI=mongodb://root:example@localhost:27017/drone_tracking?authSource=admin

   # MQTT
   MQTT_BROKER_URL=mqtt://broker.emqx.io:1883
   MQTT_TOPIC=tesa/drone_data
   ```

4. **Start MongoDB (ถ้าใช้ Docker)**
   ```bash
   docker-compose up -d
   ```

5. **Run the server**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

   Server จะรันที่ `http://localhost:3000`

---

## 📖 API Documentation

เมื่อ Server รันแล้ว สามารถเข้าดู API Docs ได้ที่:

🔗 **Swagger UI**: `http://localhost:3000/api-docs`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drones` | ดึงรายการ Drone ทั้งหมด (filter, sort, pagination) |
| `GET` | `/api/drones/:id` | ดึงข้อมูล Drone ตาม ID |
| `GET` | `/api/drones/:id/logs` | ดึง Log ของ Drone |
| `GET` | `/api/drones/logs/off` | ดึง Log ฝั่ง Offensive |

### Query Parameters

**GET /api/drones**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by drone type |
| `side` | string | Filter by side (`def` / `off`) |
| `sort` | string | Sort by field (`first_seen`, `type`, `first_cam_id`) |
| `order` | string | Sort order (`asc` / `desc`) |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Items per page (default: 10) |

---

## 🔌 WebSocket Events

### Client → Server

| Event | Description | Payload |
|-------|-------------|---------|
| `pi_telemetry` | ข้อมูล Telemetry จาก Raspberry Pi | `{ cam_info, object, side, time }` |
| `pi_stream` | Video frame จาก Pi | `{ cam_id, drone_id, time, imgbase64 }` |

### Server → Client

| Event | Description | Payload |
|-------|-------------|---------|
| `drone_update` | อัพเดทข้อมูล Drone | `{ timestamp, side, lat, lon, alt, ... }` |
| `drone_frame` | Video frame | `{ cam_id, drone_id, time, imgbase64 }` |


---

## 📡 MQTT Configuration

โปรเจกต์จะ Subscribe ไปยัง MQTT Topic และส่งข้อมูลต่อให้ Client ผ่าน Socket.IO

### Default Configuration

- **Broker**: `mqtt://broker.emqx.io:1883`
- **Topic**: `tesa/drone_data`

### Message Format

```json
{
  "timestamp": 1703312135,
  "side": "off",
  "lat": 13.7563,
  "lon": 100.5018,
  "alt": 50
}
```

---

## 🗄️ Data Models

### Drone

| Field | Type | Description |
|-------|------|-------------|
| `drone_id` | Number | Drone identifier |
| `type` | String | Drone type |
| `first_seen` | Date | First detection time |
| `first_cam_id` | String | Camera ID ที่ตรวจพบครั้งแรก |
| `image_path` | String | Path หรือ Base64 ของรูป |
| `side` | String | ฝั่ง (`def` / `off`) |

### DroneLog

| Field | Type | Description |
|-------|------|-------------|
| `drone_id` | Number | Drone identifier |
| `timestamp` | Date | Log timestamp |
| `cam_id` | String | Camera ID |
| `side` | String | ฝั่ง (`def` / `off`) |
| `lat` | Number | Latitude |
| `lon` | Number | Longitude |
| `velocity` | Number | ความเร็ว |
| `direction` | Number | ทิศทาง (องศา) |

---

## 🐳 Docker Compose

### Services

| Service | Port | Description |
|---------|------|-------------|
| `mongo` | 27017 | MongoDB Database |
| `mongo-express` | 8081 | MongoDB Web UI |

### Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```


---

## 🛠️ Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | รัน production server |
| `npm run dev` | รัน development server (nodemon) |
| `npm run testdef` | รัน test script |

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Realtime**: Socket.IO
- **Messaging**: MQTT
- **API Docs**: Swagger (OpenAPI 3.0)

---


## 👥 Authors

- RMUTT TESA 2025

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [MQTT.js](https://github.com/mqttjs/MQTT.js)
- [Mongoose](https://mongoosejs.com/)
- [Swagger](https://swagger.io/)
