import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : window.location.origin;

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected:', newSocket.id);
    });

    newSocket.on('user_notification', (notif) => {
      console.log('🔔 Received Notification:', notif);
      if (!notif.userId || (user && (user._id === notif.userId || user.id === notif.userId))) {
        setNotifications((prev) => [
          { ...notif, id: Date.now() + Math.random() },
          ...prev.slice(0, 4)
        ]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const removeNotification = (id) => {
    setNotifications((prev) => fontNotifs.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider value={{ socket, notifications, removeNotification }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
