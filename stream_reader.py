import cv2
import threading
import time
from ultralytics import YOLO

class CameraStream:
    """
    Decoupled execution thread that continuously overwrites a shared memory buffer 
    with the most recent frame, eliminating network lag buffers.
    """
    def __init__(self, src=0):
        self.stream = cv2.VideoCapture(src)
        self.ret, self.frame = self.stream.read()
        self.running = True
        
        self.thread = threading.Thread(target=self.update, args=())
        self.thread.daemon = True
        self.thread.start()

    def update(self):
        while self.running:
            ret, frame = self.stream.read()
            if ret:
                self.ret = ret
                self.frame = frame
            else:
                time.sleep(0.01)

    def read(self):
        return self.ret, self.frame

    def stop(self):
        self.running = False
        self.thread.join()
        self.stream.release()

if __name__ == '__main__':
    # REPLACE with your actual phone IP address!
    video_source = "http://10.211.19.215:8080/video"
    
    print("[INFO] Loading YOLOv8 Vision Engine...")
    # The script will automatically download the lightweight 'nano' model weights the first time it runs
    model = YOLO("yolov8n.pt")
    
    print("[INFO] Starting asynchronous mobile camera stream...")
    cam = CameraStream(video_source)
    time.sleep(2.0)

    try:
        while True:
            ret, frame = cam.read()
            if not ret or frame is None:
                continue
                
            # --- VISION CORE ENGINE ---
            # Run inference on the current frame
            # verbose=False stops the terminal from being flooded with log messages
            results = model.predict(frame, verbose=False)
            
            # Extract the frame with the bounding boxes and class labels drawn on it
            annotated_frame = results[0].plot()
            
            # Display the annotated frame
            cv2.imshow("Vision Core Engine - YOLOv8", annotated_frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        print("[INFO] Stopping stream...")
        cam.stop()
        cv2.destroyAllWindows()