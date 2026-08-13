import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, Clock, TrendingUp, CheckCircle } from 'lucide-react';

export default function SystemStatus() {
  const [status, setStatus] = useState({
    status: 'online',
    camera_connected: true,
    total_breaches: 0,
    recent_alerts: 0,
    active_targets: 0,
    current_breach: false,
    uptime: 'active'
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/system-status');
        const data = await response.json();
        setStatus(data);
      } catch (e) {
        console.error('Failed to fetch system status:', e);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      label: 'System Status',
      value: status.status.toUpperCase(),
      icon: status.status === 'online' ? CheckCircle : AlertTriangle,
      color: status.status === 'online' ? 'text-emerald-400' : 'text-red-400',
      bgColor: status.status === 'online' ? 'bg-emerald-500/10' : 'bg-red-500/10'
    },
    {
      label: 'Camera Connection',
      value: status.camera_connected ? 'CONNECTED' : 'DISCONNECTED',
      icon: Shield,
      color: status.camera_connected ? 'text-emerald-400' : 'text-red-400',
      bgColor: status.camera_connected ? 'bg-emerald-500/10' : 'bg-red-500/10'
    },
    {
      label: 'Total Breaches',
      value: status.total_breaches,
      icon: AlertTriangle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      label: 'Recent Alerts (1h)',
      value: status.recent_alerts,
      icon: Activity,
      color: status.recent_alerts > 0 ? 'text-red-400' : 'text-emerald-400',
      bgColor: status.recent_alerts > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'
    },
    {
      label: 'Active Targets',
      value: status.active_targets,
      icon: TrendingUp,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10'
    },
    {
      label: 'Current Breach',
      value: status.current_breach ? 'DETECTED' : 'SECURE',
      icon: status.current_breach ? AlertTriangle : CheckCircle,
      color: status.current_breach ? 'text-red-400' : 'text-emerald-400',
      bgColor: status.current_breach ? 'bg-red-500/10' : 'bg-emerald-500/10'
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-lg">
      <h3 className="text-cyan-400 font-bold mb-4 flex items-center gap-2">
        <Activity size={16} /> SYSTEM STATUS DASHBOARD
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className={`${stat.bgColor} border border-slate-800 rounded-lg p-3`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon size={14} className={stat.color} />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className={`text-lg font-bold ${stat.color} font-mono`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock size={12} />
            <span>Uptime: {status.uptime}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span>Live Monitoring</span>
          </div>
        </div>
      </div>
    </div>
  );
}
