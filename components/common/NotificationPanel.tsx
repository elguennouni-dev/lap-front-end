import React, { useState } from 'react';
import { Icon } from './Icon';

interface Notification {
  id: number;
  icon: string;
  text: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const mockNotifications: Notification[] = [
  { 
    id: 1, 
    icon: 'check-circle', 
    text: "La commande CMD-005 est terminée.", 
    time: "il y a 5 minutes",
    read: false,
    type: 'success'
  },
  { 
    id: 2, 
    icon: 'assignment', 
    text: "Nouvelle tâche 'Design' assignée pour CMD-002.", 
    time: "il y a 1 heure",
    read: false,
    type: 'info'
  },
  { 
    id: 3, 
    icon: 'person-add', 
    text: "Le client Wayne Enterprises a été ajouté.", 
    time: "il y a 3 heures",
    read: true,
    type: 'info'
  },
  { 
    id: 4, 
    icon: 'approval', 
    text: "Le design pour CMD-004 a été approuvé.", 
    time: "hier",
    read: true,
    type: 'success'
  },
  { 
    id: 5, 
    icon: 'warning', 
    text: "Retard détecté sur la commande CMD-003.", 
    time: "il y a 2 jours",
    read: true,
    type: 'warning'
  },
];

const getNotificationIconColor = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-yellow-600';
    case 'error': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

const getNotificationBackgroundColor = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'bg-green-100';
    case 'warning': return 'bg-yellow-100';
    case 'error': return 'bg-red-100';
    default: return 'bg-blue-100';
  }
};

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter(notif => 
    activeFilter === 'all' ? true : !notif.read
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-800 text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-3 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
              activeFilter === 'all' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`flex-1 text-sm font-medium py-2 px-3 rounded-md transition-colors ${
              activeFilter === 'unread' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Non lues
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Icon name="notifications-off" className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-base font-medium">Aucune notification</p>
            <p className="text-sm mt-1">Toutes les notifications sont à jour</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 flex items-start space-x-3 transition-colors duration-150 group cursor-pointer ${
                  notification.read 
                    ? 'bg-white' 
                    : 'bg-blue-50 border-l-2 border-l-blue-600'
                } hover:bg-slate-50`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* Icon */}
                <div className={`p-2 rounded-xl flex-shrink-0 ${getNotificationBackgroundColor(notification.type)}`}>
                  <Icon 
                    name={notification.icon} 
                    className={`h-5 w-5 ${getNotificationIconColor(notification.type)}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    notification.read ? 'text-slate-800' : 'text-slate-800 font-semibold'
                  }`}>
                    {notification.text}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-600">{notification.time}</p>
                    {!notification.read && (
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        <span className="text-xs text-blue-600 font-medium">Nouveau</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all duration-200 hover:bg-slate-200"
                  title="Marquer comme lu"
                >
                  <Icon name="check" className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
        <button className="w-full flex items-center justify-center space-x-2 py-3 text-base text-blue-600 hover:text-blue-800 font-semibold transition-colors">
          <Icon name="list" className="h-5 w-5" />
          <span>Voir toutes les notifications</span>
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;