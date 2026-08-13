import React from 'react';
import { User, AlertTriangle, CheckCircle, Activity, Target, Zap } from 'lucide-react';

export default function DetectionCard({ objects = [] }) {
  if (objects.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl shadow-cyan-500/10">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold mb-3 flex items-center gap-2">
          <Activity size={16} className="text-cyan-400" /> ACTIVE TRACKS
        </h3>
        <div className="text-center py-8 text-slate-500 text-sm">
          <Target size={32} className="mx-auto mb-2 opacity-50" />
          No objects detected
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl shadow-cyan-500/10">
      <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-bold mb-3 flex items-center gap-2">
        <Activity size={16} className="text-cyan-400" /> ACTIVE TRACKS ({objects.length})
      </h3>
      <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide">
        {objects.map((obj, idx) => (
          <div 
            key={`${obj.id}-${idx}`}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02] ${
              obj.breach 
                ? 'bg-gradient-to-r from-red-950/50 to-red-900/30 border-red-500/50 shadow-lg shadow-red-500/20' 
                : 'bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-slate-700/50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              obj.breach ? 'bg-gradient-to-br from-red-500/30 to-red-600/20' : 'bg-gradient-to-br from-cyan-500/30 to-cyan-600/20'
            } shadow-lg`}>
              <User size={18} className={obj.breach ? 'text-red-400' : 'text-cyan-400'} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100 font-mono">ID:{obj.id}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 font-medium">{obj.class}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  {obj.breach ? (
                    <AlertTriangle size={12} className="text-red-400 animate-pulse" />
                  ) : (
                    <CheckCircle size={12} className="text-emerald-400" />
                  )}
                  <span className={`text-xs font-bold ${obj.breach ? 'text-red-400' : 'text-emerald-400'}`}>
                    {obj.breach ? 'BREACH' : 'SECURE'}
                  </span>
                </div>
                {obj.confidence && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Zap size={10} className="text-amber-400" />
                    <span className="font-mono">{obj.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}