import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X, CheckCircle } from 'lucide-react';

export const NotificationToast = () => {
  const { notifications, removeNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-slate-900/95 border border-teal-500/40 text-slate-100 rounded-xl p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-right duration-300"
        >
          <div className="p-2 bg-teal-500/20 text-teal-400 rounded-lg shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-teal-300">{notif.title || 'Notification'}</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
