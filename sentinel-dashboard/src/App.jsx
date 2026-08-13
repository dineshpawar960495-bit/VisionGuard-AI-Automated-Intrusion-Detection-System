import React, { useState, useEffect } from 'react';
import LiveFeed from './components/LiveFeed';
import AlertBox from './components/AlertBox';
import DetectionCard from './components/DetectionCard';
import HistoryLog from './components/HistoryLog';
import ZoneEditor from './components/ZoneEditor';
import ToastContainer from './components/ToastContainer';
import CameraManager from './components/CameraManager';
import SystemStatus from './components/SystemStatus';
import { Shield, Server, Activity, Clock, Cpu, Settings, Layers, Bell, Database, Network, Thermometer, LayoutGrid } from 'lucide-react';

function App() {
  const [systemState, setSystemState] = useState({
    breach: false,
    count: 0,
    active_objects: []
  });

  const [zoneCoords, setZoneCoords] = useState([
    {x: 150, y: 150}, {x: 450, y: 150}, {x: 550, y: 400}, {x: 50, y: 400}
  ]);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toasts, setToasts] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    cpu: 0,
    memory: 0,
    network: 0,
    storage: 0
  });
  const [activeTab, setActiveTab] = useState('monitor'); // 'monitor' or 'cameras'

  const addToast = (type, message, duration = 5000) => {
    const id = Date.now();
    // Auto-remove excess alerts (keep max 5)
    setToasts(prev => {
      const newToasts = [...prev, { id, type, message, duration }];
      if (newToasts.length > 5) {
        // Remove oldest toast
        return newToasts.slice(-5);
      }
      return newToasts;
    });
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Global Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial zone configuration
  useEffect(() => {
    fetch('http://localhost:8000/settings')
      .then(res => res.json())
      .then(data => {
        if (data.coords) {
          // Convert backend format [[x,y], ...] to frontend format [{x,y}, ...]
          const frontendCoords = data.coords.map(c => ({ x: c[0], y: c[1] }));
          setZoneCoords(frontendCoords);
        }
      })
      .catch(err => console.error("Could not fetch zone settings"));
  }, []);

  // Live WebSocket Telemetry with breach detection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    let previousBreachState = false;
    
    ws.onopen = () => {
      console.log("Telemetry channel connected.");
      addToast('success', 'System connected successfully');
    };
    
    ws.onmessage = (event) => {
      try {
        const newState = JSON.parse(event.data);
        setSystemState(newState);
        
        // Trigger alert on breach state change
        if (newState.breach && !previousBreachState) {
          addToast('error', 'SECURITY BREACH DETECTED - Zone Alpha', 10000);
          playAlertSound();
        } else if (!newState.breach && previousBreachState) {
          addToast('success', 'Zone secured - No active threats', 3000);
        }
        
        previousBreachState = newState.breach;
      } catch (e) {
        console.error("Failed to parse telemetry data:", e);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      addToast('error', 'Connection lost to surveillance system');
    };
    
    ws.onclose = () => {
      console.log("Telemetry channel disconnected.");
      addToast('warning', 'Telemetry channel disconnected');
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, []);

  // System health monitoring simulation
  useEffect(() => {
    const updateHealth = () => {
      setSystemHealth({
        cpu: Math.floor(Math.random() * 30) + 20,
        memory: Math.floor(Math.random() * 40) + 30,
        network: Math.floor(Math.random() * 20) + 70,
        storage: Math.floor(Math.random() * 10) + 40
      });
    };

    updateHealth();
    const interval = setInterval(updateHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const playAlertSound = () => {
    // Create a more professional alarm sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playBeep = (frequency, startTime, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Play alarm pattern: high-low-high-low
    const now = audioContext.currentTime;
    playBeep(880, now, 0.15);      // High A
    playBeep(440, now + 0.15, 0.15); // Low A
    playBeep(880, now + 0.3, 0.15);   // High A
    playBeep(440, now + 0.45, 0.15);  // Low A
  };

  return (
    <div className={`min-h-screen bg-[#060b14] text-slate-50 font-sans selection:bg-cyan-500/30 relative overflow-hidden transition-all duration-500 ${
      systemState.breach ? 'animate-pulse' : ''
    }`}>
      
      {/* Breach Alert Overlay */}
      {systemState.breach && (
        <div className="fixed inset-0 bg-red-500/10 pointer-events-none z-40 animate-pulse" />
      )}
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Background Ambient FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-900/20 to-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-gradient-to-t from-emerald-900/10 to-transparent blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="relative z-10 max-w-[1920px] mx-auto p-4 lg:p-6 flex flex-col h-screen">
        
        {/* PREMIUM HEADER */}
        <header className="flex flex-wrap justify-between items-center mb-6 bg-gradient-to-r from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl shadow-cyan-500/5">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 p-3 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-xl animate-pulse" />
              <Shield className="text-cyan-400 w-6 h-6 relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-cyan-400 animate-gradient">SENTINEL</h1>
              <div className="text-cyan-500/80 font-mono text-[9px] tracking-widest uppercase flex items-center gap-1">
                <Cpu size={10} /> Edge Compute Command
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* System Health Indicators */}
            <div className="hidden lg:flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <Cpu size={12} className="text-cyan-400" />
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full transition-all" style={{ width: `${systemHealth.cpu}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{systemHealth.cpu}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Database size={12} className="text-purple-400" />
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${systemHealth.memory}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{systemHealth.memory}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Network size={12} className="text-emerald-400" />
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${systemHealth.network}%` }} />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{systemHealth.network}%</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800">
              <Activity size={12} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 uppercase">Targets:</span>
              <span className="text-xs font-bold text-slate-200 font-mono">{String(systemState.count).padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-lg border border-emerald-900/30">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sys Online</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors">
              <Bell size={14} className="text-slate-400" />
              {toasts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                  {toasts.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors">
              <LayoutGrid size={14} className="text-slate-400" />
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <main className="grid grid-cols-1 xl:grid-cols-4 gap-6 flex-grow min-h-0">
          
          {/* Main Feed */}
          <div className="xl:col-span-3 flex flex-col min-h-[400px]">
            <LiveFeed 
              cameraName="CAM 01: Perimeter Acquisition" 
              status={systemState.breach ? "breach" : "secure"} 
              streamUrl="http://localhost:8000/video_feed"
            />
          </div>

          {/* Telemetry Sidebar */}
          <div className="xl:col-span-1 flex flex-col h-full gap-4 min-h-0 overflow-y-auto pb-10 scrollbar-hide">
            
            {/* Tab Navigation */}
            <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('monitor')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'monitor' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MONITOR
              </button>
              <button
                onClick={() => setActiveTab('cameras')}
                className={`flex-1 py-2 px-3 rounded-md text-xs font-bold transition-all ${
                  activeTab === 'cameras' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CAMERAS
              </button>
            </div>

            {activeTab === 'monitor' ? (
              <>
                {/* Alert Layer */}
                <div className={`transition-all duration-500 ease-in-out ${systemState.breach ? 'h-[140px] opacity-100' : 'h-0 opacity-0 overflow-hidden'}`}> 
                  <AlertBox active={systemState.breach} location="Zone Alpha" time={currentTime.toLocaleTimeString()} />
                </div>

                {/* Tracking List */}
                <div className="flex-none h-[280px]">
                  <DetectionCard objects={systemState.active_objects} />
                </div>

                {/* Zone Strategy Editor */}
                <div className="flex-none">
                  <ZoneEditor currentCoords={zoneCoords} onSave={(newCoords) => setZoneCoords(newCoords)} />
                </div>

                {/* Event Audit Log */}
                <div className="flex-grow min-h-[200px]">
                  <HistoryLog />
                </div>
              </>
            ) : (
              <>
                {/* Camera Management */}
                <div className="flex-none">
                  <CameraManager />
                </div>

                {/* System Status Dashboard */}
                <div className="flex-none">
                  <SystemStatus />
                </div>
              </>
            )}
            
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;