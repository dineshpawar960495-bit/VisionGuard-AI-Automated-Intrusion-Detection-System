import React, { useEffect, useState, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Wifi,
  WifiOff,
  Video,
  Camera,
  Clock,
  Circle,
  Maximize,
  Minimize,
  Focus,
  ZoomIn,
  Activity,
  Cpu,
  RefreshCw
} from "lucide-react";

export default function LiveFeed({
  cameraName = "CAM 01",
  status = "secure",
  streamUrl,
}) {
  const [time, setTime] = useState(new Date());
  const [streamError, setStreamError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const containerRef = useRef(null);

  // Compute clean fallback target for local FastAPI server
  const getActiveStreamUrl = () => {
    if (!streamUrl) return "http://localhost:8001/video_feed";
    if (streamUrl.startsWith("http://") || streamUrl.startsWith("https://")) {
      return streamUrl;
    }
    return `http://${streamUrl.includes(":") ? streamUrl : `${streamUrl}:8001`}/video_feed`;
  };

  const activeUrl = getActiveStreamUrl();

  // Time and Recording Counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Retry Connection
  const handleRetry = () => {
    setIsLoading(true);
    setStreamError(false);
    setRetryKey((prev) => prev + 1);
  };

  // Trigger Snapshot Download
  const handleTakeSnapshot = () => {
    const snapshotUrl = activeUrl.replace("/video_feed", "/snapshot");
    const link = document.createElement("a");
    link.href = `${snapshotUrl}?t=${Date.now()}`;
    link.download = `sentinel_${cameraName.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format recording time (HH:MM:SS)
  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div
      ref={containerRef}
      className={`
        group relative overflow-hidden rounded-2xl
        bg-slate-950 flex flex-col transition-all duration-500 select-none
        ${isFullscreen ? "h-screen w-screen rounded-none" : "h-[580px] lg:h-[650px] border border-slate-700/60 shadow-2xl hover:border-cyan-500/50"}
      `}
    >
      {/* --- CYBER BORDER GLOW --- */}
      {!isFullscreen && (
        <div className="absolute inset-0 z-0 pointer-events-none rounded-2xl shadow-[inset_0_0_50px_rgba(6,182,212,0.1)] group-hover:shadow-[inset_0_0_80px_rgba(6,182,212,0.2)] transition-shadow duration-700"></div>
      )}

      {/* --- MAIN VIDEO CONTAINER --- */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        
        {/* Animated Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.07] z-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #06b6d4 1px, transparent 1px),
              linear-gradient(to bottom, #06b6d4 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        ></div>

        {/* AI Scanner Line */}
        {!streamError && !isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.8)] z-20 pointer-events-none opacity-50 scanner-line"></div>
        )}

        {/* 4 Corner Brackets */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-cyan-500/50 z-20 rounded-tl-lg pointer-events-none hidden sm:block"></div>
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-cyan-500/50 z-20 rounded-tr-lg pointer-events-none hidden sm:block"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-cyan-500/50 z-20 rounded-bl-lg pointer-events-none hidden sm:block"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-cyan-500/50 z-20 rounded-br-lg pointer-events-none hidden sm:block"></div>

        {/* Video Loader Screen */}
        {isLoading && !streamError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-30">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
            <div className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">ESTABLISHING SECURE LINK...</div>
          </div>
        )}

        {/* Stream Offline / Error State */}
        {streamError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 z-30 p-6">
            <Video className="w-16 h-16 text-slate-700 mb-4 animate-bounce" />
            <div className="text-slate-300 text-sm font-semibold tracking-widest mb-1">FEED OFFLINE</div>
            <div className="text-slate-500 text-xs font-mono mb-4 text-center">TARGET: {activeUrl}</div>
            
            <div className="flex items-center gap-2 text-red-400 text-xs font-mono bg-red-950/40 px-4 py-2 rounded border border-red-900/50 mb-6">
              <WifiOff size={14} /> NO SIGNAL FROM CAMERA ENGINE
            </div>

            <button 
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 hover:text-cyan-300 font-mono text-xs font-bold rounded-lg border border-cyan-700/50 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className="animate-spin-slow" /> RETRY CONNECTION
            </button>
          </div>
        ) : (
          /* Live Stream Image Tag bound directly to native handlers */
          <img
            key={retryKey}
            src={`${activeUrl}?retry=${retryKey}`}
            alt={cameraName}
            className={`h-full w-full object-contain z-0 transition-transform duration-500 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 group-hover:scale-[1.01]"
            }`}
            onLoad={() => {
              setIsLoading(false);
              setStreamError(false);
            }}
            onError={() => {
              setIsLoading(false);
              setStreamError(true);
            }}
          />
        )}

        {/* --- FLOATING HEADER OVERLAY --- */}
        <div className="absolute top-0 left-0 right-0 z-40 flex items-start justify-between p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
          
          {/* Top Left: Title & Status */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50">
              <Camera className="w-4 h-4 text-cyan-400" />
              <h3 className="text-slate-100 font-bold tracking-wider text-sm">{cameraName}</h3>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold tracking-wider border backdrop-blur-md w-fit
              ${status === "breach" ? "bg-red-950/80 border-red-500 text-red-400 animate-pulse" : "bg-emerald-950/60 border-emerald-500/50 text-emerald-400"}`}
            >
              {status === "breach" ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
              {status === "breach" ? "BREACH DETECTED" : "SYSTEM SECURE"}
            </div>
          </div>

          {/* Top Right: Network & Recording */}
          <div className="flex flex-col items-end gap-2 pointer-events-auto">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-700/50">
              {streamError ? <WifiOff size={14} className="text-red-400" /> : <Wifi size={14} className="text-cyan-400" />}
              <span className="text-xs font-mono text-slate-300">{streamError ? "LINK LOST" : "98% SIGNAL"}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Circle size={10} className="fill-red-500 text-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-mono font-bold">{formatTime(recordingSeconds)}</span>
            </div>
          </div>
        </div>

        {/* --- FLOATING FOOTER OVERLAY --- */}
        <div className="absolute bottom-0 left-0 right-0 z-40 flex items-end justify-between p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
          
          {/* Bottom Left: Metadata */}
          <div className="flex flex-col gap-1.5 pointer-events-auto hidden sm:flex">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded w-fit border border-cyan-900/40">
              <Cpu size={12} /> YOLOv8 + ByteTrack Engine
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded w-fit border border-slate-800">
              <span className="flex items-center gap-1"><Activity size={12}/> 30 FPS</span>
              <span className="text-slate-600">|</span>
              <span>1080P HD</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">12ms PING</span>
            </div>
          </div>

          {/* Bottom Right: Interactive Controls */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center text-xs font-mono text-slate-400 mr-2 bg-black/60 backdrop-blur-sm px-2.5 py-1.5 rounded border border-slate-800">
              <Clock size={12} className="mr-1.5 text-cyan-400" /> {time.toLocaleTimeString()}
            </div>
            
            <button 
              onClick={handleTakeSnapshot}
              className="p-2 bg-slate-900/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500 transition-colors backdrop-blur-md cursor-pointer" 
              title="Download Snapshot"
            >
              <Focus size={16} />
            </button>

            <button 
              onClick={() => setIsZoomed((prev) => !prev)}
              className={`p-2 rounded border transition-colors backdrop-blur-md cursor-pointer ${
                isZoomed 
                  ? "bg-cyan-950 text-cyan-400 border-cyan-500" 
                  : "bg-slate-900/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 border-slate-700 hover:border-cyan-500"
              }`} 
              title="Toggle Digital Zoom"
            >
              <ZoomIn size={16} />
            </button>

            <button 
              onClick={toggleFullscreen}
              className="p-2 bg-slate-900/80 hover:bg-cyan-950 text-slate-300 hover:text-cyan-400 rounded border border-slate-700 hover:border-cyan-500 transition-colors backdrop-blur-md cursor-pointer" 
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        {/* --- BREACH SIREN OVERLAY --- */}
        {status === "breach" && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
            {/* Full screen red tint pulse */}
            <div className="absolute inset-0 bg-red-600/10 animate-pulse mix-blend-color-burn"></div>
            {/* Heavy Red Border */}
            <div className="absolute inset-0 border-[4px] sm:border-[8px] border-red-600/80 shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]"></div>
            
            {/* Center Warning Banner */}
            <div className="bg-red-950/90 backdrop-blur-xl px-6 sm:px-10 py-4 sm:py-6 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.4)] border-2 border-red-500 transform scale-100 animate-[bounce_1s_infinite]">
              <div className="text-red-500 text-xl sm:text-3xl font-black tracking-[0.2em] text-center drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
                ⚠ SECURITY BREACH
              </div>
              <div className="text-red-200 text-xs sm:text-sm font-mono text-center mt-2 tracking-widest uppercase">
                Zone Intrusion Confirmed
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CSS Keyframes Injection --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateY(0%); }
          100% { transform: translateY(580px); }
        }
        .scanner-line {
          animation: scan 3s linear infinite;
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 3s linear infinite;
        }
      `}} />
    </div>
  );
}