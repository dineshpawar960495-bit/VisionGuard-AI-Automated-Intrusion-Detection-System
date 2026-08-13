import cv2
import json
import asyncio
import numpy as np
import threading
import time
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ultralytics import YOLO
from shapely.geometry import Point, Polygon
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
from typing import List, Tuple
from contextlib import asynccontextmanager

# Pydantic model for zone configuration updates
class ZoneUpdateRequest(BaseModel):
    coords: List[Tuple[int, int]]

# Global variable for the Event Loop
MAIN_LOOP = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global MAIN_LOOP
    MAIN_LOOP = asyncio.get_running_loop()
    yield
    # Cleanup if needed

# --- SYSTEM INITIALIZATION ---
app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# MongoDB Setup
try:
    MONGO_CLIENT = AsyncIOMotorClient("mongodb://localhost:27017/")
    DB = MONGO_CLIENT.sentinel_db
    LOGS_COLLECTION = DB.breach_logs
    print("[INFO] MongoDB Connected.")
except Exception as e:
    print(f"[ERROR] MongoDB Connection failed: {e}")

print("[INFO] Loading YOLOv8 & ByteTrack...")
model = YOLO("yolov8n.pt")

# Zone configuration constants
CANVAS_W = 1280
CANVAS_H = 720

# --- CAMERA INGESTION (DECOUPLED) ---
class CameraStream:
    def __init__(self, src):
        # Use DirectShow backend on Windows for better camera compatibility
        if isinstance(src, int) and src == 0:
            self.stream = cv2.VideoCapture(src, cv2.CAP_DSHOW)
        else:
            self.stream = cv2.VideoCapture(src)
        self.stream.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        self.ret, self.frame = self.stream.read()
        self.running = True
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.daemon = True
        self.thread.start()

    def update(self):
        while self.running:
            ret, frame = self.stream.read()
            if ret: self.ret, self.frame = ret, frame
            else: time.sleep(0.01)

    def read(self): return self.ret, self.frame

# Camera source - change to your IP camera URL or use 0 for default webcam
# Examples: 
#   - Webcam: cam = CameraStream(0)
#   - IP Camera: cam = CameraStream("http://YOUR_IP:8080/video")
#   - Video file: cam = CameraStream("path/to/video.mp4")
cam = CameraStream(0)  # Default to webcam (IP camera not accessible)

system_state = {"breach": False, "count": 0, "active_objects": []}
RESTRICTED_ZONE_COORDS = [(150, 150), (450, 150), (550, 400), (50, 400)]
zone_polygon = Polygon(RESTRICTED_ZONE_COORDS)
breach_cooldowns = {}
track_history = {}  # Store last position for tracking trails 

async def log_breach_to_db(track_id, class_name):
    """Async MongoDB Writer"""
    await LOGS_COLLECTION.insert_one({
        "timestamp": datetime.now().isoformat(),
        "track_id": int(track_id),
        "class": class_name,
        "location": "Zone Alpha"
    })

def generate_frames():
    global MAIN_LOOP
    frame_count = 0
    while True:
        ret, frame = cam.read()
        if not ret or frame is None: continue
        
        frame_count += 1
        frame_height, frame_width = frame.shape[:2]
        
        # TRACKING ENGINE - Optimized for multi-object tracking
        results = model.track(
            frame, 
            persist=True, 
            tracker="bytetrack.yaml", 
            imgsz=640,           # Higher resolution for better detection
            conf=0.25,           # Lower confidence threshold for more detections
            iou=0.5,             # IoU threshold for NMS
            max_det=100,         # Maximum number of detections
            verbose=False, 
            device="cpu",
            augment=True,        # Enable augmentation for better detection
            agnostic_nms=True    # Class-agnostic NMS for better multi-class tracking
        )
        
        is_breached_this_frame = False
        current_objects = []
        
        if results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.int().cpu().tolist()
            ids = results[0].boxes.id.int().cpu().tolist()
            classes = results[0].boxes.cls.int().cpu().tolist()
            
            for box, tid, cid in zip(boxes, ids, classes):
                name = model.names[cid]
                confidence = results[0].boxes.conf.cpu().tolist()[len(current_objects)] if results[0].boxes.conf is not None else 0.0
                
                # Scale zone coordinates to actual frame size
                scaled_zone_coords = [(int(x * frame_width / CANVAS_W), int(y * frame_height / CANVAS_H)) for x, y in RESTRICTED_ZONE_COORDS]
                scaled_polygon = Polygon(scaled_zone_coords)
                
                # Use bottom center of bounding box for breach detection
                foot_point = Point((box[0] + box[2]) / 2, box[3])
                is_in_zone = scaled_polygon.contains(foot_point)
                
                if is_in_zone:
                    is_breached_this_frame = True
                    # Log breach if cooldown passed
                    last_breach = breach_cooldowns.get(tid, 0)
                    if time.time() - last_breach > 5:
                        breach_cooldowns[tid] = time.time()
                        print(f"[ALERT] Breach detected: Track ID {tid}, Class {name}, Zone coords: {scaled_zone_coords}")
                        if MAIN_LOOP:
                            asyncio.run_coroutine_threadsafe(log_breach_to_db(tid, name), MAIN_LOOP)
                
                current_objects.append({
                    "id": tid, 
                    "class": name.upper(), 
                    "breach": is_in_zone,
                    "confidence": round(confidence * 100, 1)
                })
                
                # Enhanced visualization with color coding by class
                color_map = {
                    'person': (0, 255, 0),      # Green for people
                    'car': (255, 165, 0),       # Orange for vehicles
                    'truck': (255, 100, 0),     # Dark orange for trucks
                    'bicycle': (0, 255, 255),  # Cyan for bicycles
                    'motorcycle': (255, 0, 255) # Magenta for motorcycles
                }
                color = color_map.get(name.lower(), (0, 0, 255)) if not is_in_zone else (0, 0, 255)
                
                # Draw bounding box with rounded corners effect
                cv2.rectangle(frame, (box[0], box[1]), (box[2], box[3]), color, 2)
                
                # Draw ID badge with background
                label = f"ID:{tid} {name.upper()} {confidence:.0f}%"
                (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
                cv2.rectangle(frame, (box[0], box[1] - label_h - 8), (box[0] + label_w + 4, box[1]), color, -1)
                cv2.putText(frame, label, (box[0] + 2, box[1] - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                
                # Draw tracking trail (last position)
                if tid in track_history:
                    prev_pos = track_history[tid]
                    cv2.line(frame, prev_pos, ((box[0] + box[2]) // 2, box[3]), color, 2)
                
                track_history[tid] = ((box[0] + box[2]) // 2, box[3])

        system_state.update({"breach": is_breached_this_frame, "count": len(current_objects), "active_objects": current_objects})
        
        # Draw Zone - scale to actual frame size
        scaled_zone_coords = [(int(x * frame_width / CANVAS_W), int(y * frame_height / CANVAS_H)) for x, y in RESTRICTED_ZONE_COORDS]
        cv2.polylines(frame, [np.array(scaled_zone_coords, np.int32).reshape((-1, 1, 2))], True, (0, 0, 255) if is_breached_this_frame else (0, 255, 0), 3)
        
        # Add frame info for debugging
        if frame_count % 30 == 0:  # Log every 30 frames
            print(f"[DEBUG] Frame {frame_count}: Objects={len(current_objects)}, Breach={is_breached_this_frame}, Zone={scaled_zone_coords}")
        
        _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.get("/video_feed")
def video_feed(): return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/logs")
async def get_logs():
    logs = await LOGS_COLLECTION.find().sort("timestamp", -1).limit(50).to_list(length=50)
    for log in logs: log["_id"] = str(log["_id"])
    return logs

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        await websocket.send_text(json.dumps(system_state))
        await asyncio.sleep(0.05)

@app.get("/settings")
async def get_settings():
    """Get current zone configuration."""
    try:
        setting = await DB.settings.find_one({"_id": "zone_config"})
        if setting:
            return {"coords": setting["coords"]}
        return {"coords": RESTRICTED_ZONE_COORDS}
    except:
        return {"coords": RESTRICTED_ZONE_COORDS}

@app.post("/settings")
async def update_settings(data: ZoneUpdateRequest):
    """Update zone configuration."""
    
    # Convert frontend format [{x,y}, ...] to backend format [(x,y), ...]
    coords = [(c["x"], c["y"]) if isinstance(c, dict) else tuple(c) for c in data.coords]
    
    # Save to database for persistence
    if DB is not None:
        await DB.settings.update_one(
            {"_id": "zone_config"}, 
            {"$set": {"coords": coords}}, 
            upsert=True
        )
    # Update global polygon dynamically
    global zone_polygon, RESTRICTED_ZONE_COORDS
    RESTRICTED_ZONE_COORDS = coords
    zone_polygon = Polygon(coords)
    print(f"[INFO] Zone updated: {coords}")
    print(f"[INFO] Polygon created: {zone_polygon}")
    return {"status": "success", "new_coords": coords}

@app.get("/alerts")
async def get_alerts():
    """Get recent security alerts."""
    try:
        alerts = await LOGS_COLLECTION.find().sort("timestamp", -1).limit(20).to_list(length=20)
        for alert in alerts: alert["_id"] = str(alert["_id"])
        return {"alerts": alerts, "total": len(alerts)}
    except Exception as e:
        return {"alerts": [], "total": 0, "error": str(e)}

@app.get("/system-status")
async def get_system_status():
    """Get overall system health status."""
    try:
        # Get recent breach count
        breach_count = await LOGS_COLLECTION.count_documents({})
        
        # Get alerts from last hour
        from datetime import datetime, timedelta
        one_hour_ago = datetime.now() - timedelta(hours=1)
        recent_alerts = await LOGS_COLLECTION.count_documents({
            "timestamp": {"$gte": one_hour_ago.isoformat()}
        })
        
        return {
            "status": "online",
            "camera_connected": True,
            "total_breaches": breach_count,
            "recent_alerts": recent_alerts,
            "active_targets": system_state["count"],
            "current_breach": system_state["breach"],
            "uptime": "active"
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)