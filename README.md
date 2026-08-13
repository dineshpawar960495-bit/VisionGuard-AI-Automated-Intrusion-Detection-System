# VisionGuard AI - Automated Intrusion Detection System

A premium industrial-grade AI-powered CCTV surveillance system with real-time object detection, multi-object tracking, zone monitoring, and breach alerts.

## 🚀 Quick Start for Team Members

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- MongoDB (optional - for event logging)
- A camera source (webcam, IP camera, or video file)

### One-Command Setup

**Windows:**
```bash
# Clone the repository
git clone https://github.com/dineshpawar960495-bit/VisionGuard-AI-Automated-Intrusion-Detection-System.git
cd VisionGuard-AI-Automated-Intrusion-Detection-System

# Setup backend (creates virtual environment and installs dependencies)
python -m venv cctv_env
cctv_env\Scripts\activate
pip install -r requirements.txt

# Setup frontend
cd sentinel-dashboard
npm install
```

**Linux/Mac:**
```bash
# Clone the repository
git clone https://github.com/dineshpawar960495-bit/VisionGuard-AI-Automated-Intrusion-Detection-System.git
cd VisionGuard-AI-Automated-Intrusion-Detection-System

# Setup backend
python3 -m venv cctv_env
source cctv_env/bin/activate
pip install -r requirements.txt

# Setup frontend
cd sentinel-dashboard
npm install
```

### Running the Application

**Terminal 1 - Backend Server:**
```bash
# From project root
cctv_env\Scripts\activate  # Windows
# or source cctv_env/bin/activate  # Linux/Mac
python server.py
```

**Terminal 2 - Frontend Server:**
```bash
cd sentinel-dashboard
npm run dev
```

**Access the Dashboard:** Open `http://localhost:5173` in your browser

## ✨ Features

### Core Capabilities
- **Real-time Multi-Object Detection**: YOLOv8 with ByteTrack for smooth tracking of multiple objects
- **Interactive Zone Editor**: Drag-and-drop polygon configuration for restricted areas
- **Premium Industrial UI**: Gradient effects, glass morphism, and smooth animations
- **Voice Alarm System**: Web Audio API for breach alerts
- **System Health Monitoring**: CPU, memory, network indicators in real-time
- **Camera Management**: Support for multiple camera sources (webcam, IP, video files)
- **Professional Status Dashboard**: Comprehensive breach metrics and system status
- **MongoDB Integration**: Async event logging for breach history
- **WebSocket Telemetry**: Real-time updates without page refresh
- **Color-Coded Tracking**: Visual trails for object movement with class-specific colors

### Detection Features
- **Multi-Object Support**: Track up to 100 objects simultaneously
- **Smooth Tracking**: Optimized ByteTrack parameters for stable ID persistence
- **Confidence Display**: Real-time detection confidence percentages
- **Class Detection**: Support for all COCO classes (person, car, truck, bicycle, etc.)
- **Zone Breach Detection**: Polygon containment with automatic coordinate scaling

## 🏗️ Architecture

### Backend (FastAPI)
- **AI Model**: YOLOv8n (Nano) for efficient object detection
- **Tracking**: ByteTrack algorithm with optimized parameters
- **Database**: MongoDB async integration for event logging
- **Streaming**: MJPEG video feed with real-time overlays
- **WebSocket**: Real-time telemetry for live updates

### Frontend (React + Vite)
- **UI Framework**: React with modern hooks
- **Styling**: TailwindCSS with premium design system
- **Real-time**: WebSocket integration for live updates
- **Components**: Modular architecture with reusable components

## 📁 Project Structure

```
VisionGuard-AI-Automated-Intrusion-Detection-System/
├── server.py                 # Main FastAPI server
├── bytetrack.yaml           # ByteTrack configuration
├── requirements.txt         # Python dependencies
├── sentinel-dashboard/      # Frontend application
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── components/     # React components
│   │   │   ├── ZoneEditor.jsx
│   │   │   ├── DetectionCard.jsx
│   │   │   ├── AlertBox.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── CameraManager.jsx
│   │   │   ├── SystemStatus.jsx
│   │   │   └── ...
│   │   └── index.css       # Global styles
│   ├── package.json        # Node dependencies
│   └── vite.config.js      # Vite configuration
└── README.md              # This file
```

## 🔧 Configuration

### Camera Setup

Edit `server.py` line 81 to configure your camera source:

```python
# Webcam (default)
cam = CameraStream(0)

# IP Camera
cam = CameraStream("http://YOUR_IP:8080/video")

# Video file
cam = CameraStream("path/to/video.mp4")
```

### Zone Configuration

- Use the interactive Zone Editor in the dashboard
- Drag control points to define your restricted area
- Click "SAVE ZONE" to persist configuration
- Coordinates automatically scale to video resolution

### ByteTrack Parameters

Edit `bytetrack.yaml` to adjust tracking behavior:
- `track_thresh`: Detection threshold (default: 0.25)
- `track_buffer`: Tracking buffer size (default: 60)
- `match_thresh`: Matching threshold for stable IDs (default: 0.8)

## 🌐 API Endpoints

- `GET /video_feed` - MJPEG video stream with detection overlays
- `GET /ws` - WebSocket for real-time telemetry
- `GET /logs` - Fetch breach event logs
- `GET /settings` - Get current zone configuration
- `POST /settings` - Update zone configuration
- `GET /alerts` - Get recent security alerts
- `GET /system-status` - Get overall system health status

## 🎯 Usage Guide

1. **Start Servers**: Run backend and frontend as shown above
2. **Access Dashboard**: Open `http://localhost:5173`
3. **Configure Zone**: Use Zone Editor to define restricted areas
4. **Monitor Live Feed**: View real-time detection with tracking
5. **Check Alerts**: Automatic breach notifications with voice alerts
6. **View History**: Access historical breach events in the log

## 📱 Mobile Camera Setup

To use your phone as a camera:

1. **Android**: Install "IP Webcam" app
2. **iOS**: Install "Webcam Monitor" app
3. Start the server on your phone
4. Note the IP address shown
5. Update `server.py`: `cam = CameraStream("http://YOUR_PHONE_IP:8080/video")`

## 🔍 Troubleshooting

### Camera Issues
- **Not connecting**: Verify camera URL and check firewall settings
- **Black screen**: Ensure camera is not in use by another application
- **IP camera**: Test URL in browser first to confirm stream is accessible

### Backend Issues
- **Port 8000 in use**: Stop conflicting process or change port in `server.py`
- **MongoDB errors**: System works without MongoDB (logs won't persist)
- **YOLO model not found**: Auto-downloads on first run (requires internet)

### Frontend Issues
- **Blank page**: Check browser console for errors
- **WebSocket connection failed**: Ensure backend is running on port 8000
- **Not connecting to backend**: Verify CORS settings (currently allows all origins)

### Performance Issues
- **Slow detection**: Reduce `imgsz` parameter in `server.py` or use GPU
- **High CPU usage**: Increase `conf` threshold to reduce detections
- **Lagging video**: Reduce video quality in MJPEG encoding

## 🛠️ Development

### Adding New Features
1. Backend: Add new endpoints in `server.py`
2. Frontend: Create new components in `sentinel-dashboard/src/components/`
3. Styling: Use TailwindCSS classes for consistency
4. State Management: Use React hooks for local state

### Testing
- Backend: Test endpoints using `curl` or Postman
- Frontend: Test components in isolation
- Integration: Test full system with real camera feed

## 📊 Performance Metrics

- **Detection Speed**: ~15-30 FPS on CPU (varies with hardware)
- **Tracking Accuracy**: Stable IDs with ByteTrack optimization
- **Memory Usage**: ~2GB RAM for detection + tracking
- **Network**: Minimal bandwidth for WebSocket telemetry

## 🤝 Team Collaboration

### Git Workflow
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Description of your changes"

# Push and create PR
git push origin feature/your-feature-name
```

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ESLint configuration provided
- **Components**: Keep components small and focused
- **Comments**: Document complex logic

## 📝 License

MIT License - Feel free to use for personal and commercial projects

## 👥 Team Members

- **Dinesh Pawar** - Project Lead
- **Team Members** - Contributors

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Check existing issues for solutions
- Review troubleshooting section above
