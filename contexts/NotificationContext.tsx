// frontend/src/contexts/NotificationContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

// Simplified Notification Interface (matches backend NotificationDto structure)
interface WsNotification {
  message: string;
  orderId: number;
  newStatus: string;
  timestamp: string;
}

// Frontend Display Notification
interface DisplayNotification {
  id: number;
  icon: string;
  text: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface NotificationContextType {
  notifications: DisplayNotification[];
  unreadCount: number;
  markAsRead: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const API_BASE_URL = 'https://localhost:2099';
const WS_URL = `${API_BASE_URL}/ws`;
const GENERAL_TOPIC = '/topic/orders/updates';

// Helper to convert Backend Status to Frontend Display
const mapBackendToFrontend = (wsNotification: WsNotification): DisplayNotification => {
  const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  let type: DisplayNotification['type'] = 'info';
  let icon: string = 'assignment';
  
  switch (wsNotification.newStatus) {
    case 'TERMINEE_STOCK':
    case 'LIVRAISON_VALIDE':
      type = 'success';
      icon = 'check-circle';
      break;
    case 'EN_DESIGN':
    case 'EN_IMPRESSION':
    case 'EN_LIVRAISON':
      type = 'info';
      icon = 'timelapse';
      break;
    case 'REJETEE':
      type = 'error';
      icon = 'cancel';
      break;
    default:
      type = 'info';
  }

  return {
    id: Date.now() + Math.random(),
    icon: icon,
    text: wsNotification.message,
    time: `à ${timestamp}`,
    type: type,
  };
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<DisplayNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Check if permissions are needed and request them
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }

    // Initialize STOMP client using SockJS
    const socket = new SockJS(WS_URL);
    // Use Stomp.over to wrap the SockJS connection
    const stompClient = Stomp.over(socket);
    stompClient.reconnectDelay = 5000; 

    stompClient.connect({}, (frame) => {
      console.log('Connected to WebSocket: ' + frame);

      // Subscribe to the general topic for order updates
      stompClient.subscribe(GENERAL_TOPIC, (message) => {
        try {
            const payload: WsNotification = JSON.parse(message.body);
            const newNotif = mapBackendToFrontend(payload);

            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Mise à Jour Commande', { 
                    body: newNotif.text,
                    icon: '/path/to/icon.png' // Replace with your app icon path
                });
            }
        } catch (e) {
            console.error("Error processing WebSocket message:", e);
        }
      });
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup function
    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => {
          console.log('Disconnected from WebSocket');
        });
      }
    };
  }, []);

  const markAsRead = () => {
    setUnreadCount(0); 
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};