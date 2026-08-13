import React, { useEffect, useState } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-r from-emerald-950/95 to-emerald-900/95',
    border: 'border-emerald-500/50',
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
    glow: 'shadow-emerald-500/20'
  },
  error: {
    bg: 'bg-gradient-to-r from-red-950/95 to-red-900/95',
    border: 'border-red-500/50',
    icon: AlertTriangle,
    iconColor: 'text-red-400',
    glow: 'shadow-red-500/20'
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-950/95 to-amber-900/95',
    border: 'border-amber-500/50',
    icon: AlertCircle,
    iconColor: 'text-amber-400',
    glow: 'shadow-amber-500/20'
  },
  info: {
    bg: 'bg-gradient-to-r from-cyan-950/95 to-cyan-900/95',
    border: 'border-cyan-500/50',
    icon: Info,
    iconColor: 'text-cyan-400',
    glow: 'shadow-cyan-500/20'
  }
};

export default function Toast({ type = 'info', message, duration = 5000, onClose }) {
  const style = toastStyles[type] || toastStyles.info;
  const Icon = style.icon;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div 
      className={`${style.bg} backdrop-blur-xl border ${style.border} rounded-xl shadow-2xl ${style.glow} flex items-center gap-3 px-4 py-3 min-w-[320px] max-w-md transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'
      }`}
    >
      <div className={`${style.iconColor} animate-pulse`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 text-sm font-medium text-slate-100">
        {message}
      </div>
      <button
        onClick={handleClose}
        className="text-slate-400 hover:text-slate-200 transition-all hover:scale-110 active:scale-95"
      >
        <X size={16} />
      </button>
    </div>
  );
}
