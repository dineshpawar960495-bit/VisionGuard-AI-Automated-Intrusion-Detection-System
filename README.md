# SENTINEL CCTV Surveillance System

A real-time AI-powered CCTV surveillance system with object detection, zone monitoring, and breach alerts.

## Features

- **Real-time Object Detection**: Uses YOLOv8 with ByteTrack for accurate tracking
- **Zone Monitoring**: Define restricted zones and get instant breach alerts
- **Live Dashboard**: React-based dashboard with real-time telemetry via WebSocket
- **Event Logging**: MongoDB integration for storing breach events
- **Mobile Camera Support**: Connect to IP cameras (e.g., IP Webcam app)

## Architecture

- **Backend**: FastAPI with YOLOv8, OpenCV, MongoDB
- **Frontend**: React + Vite with TailwindCSS
- **AI Model**: YOLOv8n (Nano) for efficient object detection
- **Tracking**: ByteTrack algorithm for object tracking

## Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB (optional - for event logging)
- A camera source (webcam, IP camera, or mobile camera)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to project root
cd c:\Users\dines\CCTV

# Create and activate virtual environment
python -m venv cctv_env
cctv_env\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Camera Configuration

Edit `server.py` line 59 to set your camera source:

```python
# For webcam (default)
cam = CameraStream(0)

# For IP camera (e.g., IP Webcam app)
cam = CameraStream("http://YOUR_IP:8080/video")

# For video file
cam = CameraStream("path/to/video.mp4")
```

### 3. MongoDB Setup (Optional)

If you want event logging, install MongoDB and ensure it's running on localhost:27017. The system will work without MongoDB but won't persist breach logs.

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd sentinel-dashboard

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

### 5. Running the Application

**Terminal 1 - Backend Server:**
```bash
cd c:\Users\dines\CCTV
cctv_env\Scripts\activate
python server.py
```

**Terminal 2 - Frontend Server:**
```bash
cd c:\Users\dines\CCTV\sentinel-dashboard
npm run dev
```

### 6. Access the Dashboard

Open your browser and navigate to the frontend URL (usually `http://localhost:5173`)

## Usage

1. **View Live Feed**: The main dashboard shows the live camera feed with object detection overlays
2. **Zone Configuration**: Use the Zone Geometry Config panel to adjust restricted zone coordinates
3. **Monitor Alerts**: Breach alerts appear automatically when objects enter restricted zones
4. **View History**: The Event Audit Log shows historical breach events

## Configuration Files

- `server.py`: Main FastAPI server with detection logic
- `bytetrack.yaml`: ByteTrack tracker configuration
- `requirements.txt`: Python dependencies
- `sentinel-dashboard/src/App.jsx`: Main React application

## API Endpoints

- `GET /video_feed`: MJPEG video stream
- `GET /ws`: WebSocket for real-time telemetry
- `GET /logs`: Fetch breach event logs
- `GET /settings`: Get current zone configuration
- `POST /settings`: Update zone configuration

## Troubleshooting

**Camera not connecting:**
- Verify your camera URL is correct
- Check firewall settings for IP cameras
- Ensure camera app is streaming

**MongoDB connection errors:**
- The system will work without MongoDB (logs won't persist)
- Install MongoDB from https://www.mongodb.com/try/download/community

**Frontend not connecting to backend:**
- Ensure backend server is running on port 8000
- Check CORS settings in server.py (currently allows all origins)

**YOLO model not found:**
- The model will auto-download on first run
- Ensure you have internet connection for first run

## Mobile Camera Setup

To use your phone as a camera:

1. Install "IP Webcam" (Android) or "Webcam Monitor" (iOS)
2. Start the server on your phone
3. Note the IP address shown
4. Update `server.py` with your phone's IP: `http://YOUR_PHONE_IP:8080/video`

## License

MIT License
