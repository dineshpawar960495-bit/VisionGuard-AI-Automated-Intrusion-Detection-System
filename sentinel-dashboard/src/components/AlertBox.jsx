import React from 'react';
import { AlertTriangle, Shield, Clock, XOctagon, MapPin } from 'lucide-react';

export default function AlertBox({ active, location, time }) {
  if (!active) return null;

  return (
    <div className="bg-gradient-to-br from-red-950/95 via-red-900/90 to-red-950/95 backdrop-blur-2xl border border-red-500/50 rounded-2xl p-4 shadow-2xl shadow-red-500/30 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/30 to-red-600/20 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50 flex-shrink-0">
          <AlertTriangle className="text-red-400 w-7 h-7" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-red-500 font-black text-lg tracking-[0.15em] drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] uppercase">
            System Breach
          </h3>
          <div className="text-red-300/80 text-[10px] font-mono tracking-widest uppercase mt-0.5">
            Critical Security Alert
          </div>

          {/* Details Section */}
          <div className="bg-black/50 rounded-xl p-3.5 border border-red-900/50 flex flex-col gap-3 shadow-inner mt-3">
            <div className="flex items-center gap-2 text-red-200">
              <XOctagon size={15} className="text-red-500" />
              <span className="text-xs font-bold tracking-wider uppercase">Unauthorized Intrusion Detected</span>
            </div>
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 bg-red-950/40 p-2.5 rounded-lg border border-red-900/40">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400/80 uppercase">
                  <MapPin size={12} /> Origin Zone
                </div>
                <div className="text-xs font-mono font-bold text-red-100 tracking-wide">{location}</div>
              </div>
              
              <div className="flex flex-col gap-1 bg-red-950/40 p-2.5 rounded-lg border border-red-900/40">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400/80 uppercase">
                  <Clock size={12} /> Timestamp
                </div>
                <div className="text-xs font-mono font-bold text-red-100 tracking-wide">{time}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}