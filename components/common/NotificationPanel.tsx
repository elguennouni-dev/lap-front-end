import React, { useEffect } from 'react'; // <-- ADD useEffect here
import { Icon } from './Icon';
import { useNotifications } from '../../contexts/NotificationContext'; // Import the hook

// Simplified Notification Interface
interface DisplayNotification {
  id: number;
  icon: string;
  text: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const getNotificationIconColor = (type: DisplayNotification['type']) => {
  switch (type) {
    case 'success': return 'text-green-600';
    case 'warning': return 'text-amber-600';
    case 'error': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

const getNotificationBackgroundColor = (type: DisplayNotification['type']) => {
  switch (type) {
    case 'success': return 'bg-green-100';
    case 'warning': return 'bg-amber-100';
    case 'error': return 'bg-red-100';
    default: return 'bg-blue-100';
  }
};

const NotificationPanel: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();

  // Mark all notifications as read when the panel is opened
  useEffect(() => {
      markAsRead(0); // Arbitrary ID, marks all as read
  }, [markAsRead]);


  return (
    <div className="bg-white flex flex-col h-full max-h-[85vh]">
      {/* Simple Header */}
      <div className="p-4 border-b border-slate-100 flex-shrink-0">
        <h3 className="font-bold text-slate-800 text-lg">Notifications</h3>
      </div>

      {/* Notifications List - Live Data */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 p-8 text-center">
            <p className="text-sm font-medium">Aucune notification en direct</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notification => (
              <div
                key={notification.id}
                className="p-4 flex items-start space-x-4 hover:bg-slate-50 transition-colors"
              >
                {/* Icon */}
                <div className={`p-2 rounded-xl flex-shrink-0 ${getNotificationBackgroundColor(notification.type)}`}>
                  <Icon 
                    name={notification.icon} 
                    className={`h-5 w-5 ${getNotificationIconColor(notification.type)}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm text-slate-800 font-medium leading-snug">
                    {notification.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
{/*       <div className="p-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
        <button className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
          <span>Voir tout l'historique</span>
          <Icon name="chevron-right" className="h-3 w-3" />
        </button>
      </div> */}
    </div>
  );
};

export default NotificationPanel;