import React, { useEffect, useState } from 'react';
import { History, ShieldAlert, Clock } from 'lucide-react';

export default function HistoryLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:8000/logs');
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      }
    };
    
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    
    <div className="bg-slate-950 rounded-2xl border border-slate-700/60 flex flex-col h-[300px] overflow-hidden shadow-2xl">
      <div className="px-5 py-4 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md flex items-center gap-3">
        <History className="text-cyan-400 w-4 h-4" />
        <h2 className="text-sm font-bold tracking-widest text-slate-100 uppercase">Event Audit Log</h2>
      </div>

      <div className="overflow-y-auto flex-grow scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900/50 text-[10px] uppercase text-slate-500 tracking-wider">
              <th className="px-4 py-2">Timestamp</th>
              <th className="px-4 py-2">Target ID</th>
              <th className="px-4 py-2">Event</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                <td className="px-4 py-2 text-[11px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-4 py-2 text-[11px] font-mono text-cyan-400 font-bold">
                  #{String(log.track_id).padStart(4, '0')}
                </td>
                <td className="px-4 py-2 text-[11px] text-red-400 flex items-center gap-2">
                  <ShieldAlert size={12} /> BREACH
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    
  );
}