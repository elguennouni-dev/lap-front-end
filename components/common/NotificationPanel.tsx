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
    icon: 'people', 
    text: "Le client Al Baraka Market a été ajouté.", 
    time: "il y a 3 heures",
    read: true,
    type: 'info'
  },
  { 
    id: 4, 
    icon: 'verified', 
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
    case 'warning': return 'text-amber-600';
    case 'error': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

const getNotificationBackgroundColor = (type: Notification['type']) => {
  switch (type) {
    case 'success': return 'bg-green-100';
    case 'warning': return 'bg-amber-100';
    case 'error': return 'bg-red-100';
    default: return 'bg-blue-100';
  }
};

const NotificationPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const filteredNotifications = notifications.filter(notif => 
    activeFilter === 'all' ? true : !notif.read
  );

  return (
    <div className="bg-white flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex items-center justify-center px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all duration-200 ${
              activeFilter === 'all' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Toutes
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`flex-1 text-xs font-bold py-2 px-3 rounded-lg transition-all duration-200 ${
              activeFilter === 'unread' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Non lues
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Icon name="notifications-off" className="h-8 w-8 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-600">Aucune notification</p>
            <p className="text-xs mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 flex items-start space-x-4 transition-all duration-200 cursor-pointer group ${
                  notification.read 
                    ? 'bg-white hover:bg-slate-50' 
                    : 'bg-blue-50/50 hover:bg-blue-50'
                }`}
              >
                {/* Icon */}
                <div className={`p-2.5 rounded-xl flex-shrink-0 ${getNotificationBackgroundColor(notification.type)}`}>
                  <Icon 
                    name={notification.icon} 
                    className={`h-5 w-5 ${getNotificationIconColor(notification.type)}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className={`text-sm leading-snug ${
                    notification.read ? 'text-slate-600' : 'text-slate-900 font-semibold'
                  }`}>
                    {notification.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center">
                    {notification.time}
                  </p>
                </div>

                {/* Status Dot / Action */}
                <div className="flex flex-col items-center justify-center pt-2 pl-2">
                  {!notification.read && (
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full mb-2 group-hover:hidden"></span>
                  )}
                  {!notification.read && (
                    <button
                        title="Marquer comme lu"
                        className="hidden group-hover:flex p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                        }}
                    >
                        <Icon name="check" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
        <button className="w-full flex items-center justify-center space-x-2 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200 font-medium border border-transparent hover:border-slate-200">
          <span>Voir l'historique complet</span>
          <Icon name="list" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;