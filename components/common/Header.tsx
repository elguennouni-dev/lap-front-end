import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UserRole } from '../../types';
import { Icon } from './Icon';
import NotificationPanel from './NotificationPanel';

const getRoleClass = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'bg-red-100 text-red-700 border-red-200';
    case UserRole.COMMERCIAL: return 'bg-blue-100 text-blue-700 border-blue-200';
    case UserRole.DESIGNER: return 'bg-purple-100 text-purple-700 border-purple-200';
    case UserRole.IMPRIMEUR: return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'Admin';
    case UserRole.COMMERCIAL: return 'Commercial';
    case UserRole.DESIGNER: return 'Designer';
    case UserRole.IMPRIMEUR: return 'Imprimeur';
    default: return role;
  }
};

const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
    }
  };

  if (!currentUser) return null;

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        <div className="flex-1"></div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className={`relative p-2 rounded-xl transition-all duration-200 ${showNotifications
                ? 'bg-blue-100 text-blue-600'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Icon name="notification" className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 border-2 border-white"></span>
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50">
                <NotificationPanel />
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 transition-colors duration-200 group"
              aria-label="Menu utilisateur"
              aria-expanded={showUserMenu}
            >
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-slate-800 text-left">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {currentUser.roles.map((role, index) => (
                    <span
                      key={index}
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getRoleClass(role)}`}
                      title={getRoleDisplayName(role)}
                    >
                      {getRoleDisplayName(role)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </div>
                <Icon
                  name="chevron-down"
                  className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''
                    }`}
                />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200">
                  <p className="font-semibold text-slate-800">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">{currentUser.email}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {currentUser.roles.map((role, index) => (
                      <span key={index} className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getRoleClass(role)}`}>
                        {getRoleDisplayName(role)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="py-2">
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors duration-200 rounded-lg mx-1">
                    <Icon name="user" className="h-4 w-4" />
                    <span className="text-sm">Mon profil</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors duration-200 rounded-lg mx-1">
                    <Icon name="settings" className="h-4 w-4" />
                    <span className="text-sm">Paramètres</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg mx-2"
                    aria-label="Déconnexion"
                  >
                    <Icon name="logout" className="h-4 w-4" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;