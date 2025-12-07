import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { UserRole } from '../../types';
import { Icon } from './Icon';

const getRoleClass = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'bg-red-100 text-red-700 border-red-200';
    case UserRole.COMMERCIAL: return 'bg-blue-100 text-blue-700 border-blue-200';
    case UserRole.DESIGNER: return 'bg-purple-100 text-purple-700 border-purple-200';
    case UserRole.IMPRIMEUR: return 'bg-green-100 text-green-700 border-green-200';
    case UserRole.LOGISTIQUE: return 'bg-orange-100 text-orange-700 border-orange-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getRoleDisplayName = (role: UserRole) => {
  switch (role) {
    case UserRole.ADMIN: return 'Admin';
    case UserRole.COMMERCIAL: return 'Commercial';
    case UserRole.DESIGNER: return 'Designer';
    case UserRole.IMPRIMEUR: return 'Imprimeur';
    case UserRole.LOGISTIQUE: return 'Logistique';
    default: return role;
  }
};

const Header: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex-shrink-0 z-30 relative">
      <div className="flex items-center justify-between w-full">
        {/* Spacer to push content to the right */}
        <div className="flex-1"></div>

        <div className="flex items-center space-x-4">
          
          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
            >
              <div className="text-right hidden md:block">
                <p className="font-bold text-sm text-slate-800 leading-tight">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <div className="flex justify-end flex-wrap gap-1 mt-1">
                  {currentUser.roles.slice(0, 1).map((role, index) => (
                    <span
                      key={index}
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getRoleClass(role)}`}
                    >
                      {getRoleDisplayName(role)}
                    </span>
                  ))}
                  {currentUser.roles.length > 1 && (
                     <span className="text-[10px] text-slate-500 font-medium self-center">+{currentUser.roles.length - 1}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md transform group-hover:scale-105 transition-transform duration-200">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </div>
                <Icon
                  name="chevron-down"
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 overflow-hidden ring-1 ring-black ring-opacity-5">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <p className="font-bold text-slate-900 text-base">
                    {currentUser.first_name} {currentUser.last_name}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate">{currentUser.email}</p>
                </div>

                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-3 py-2.5 text-left text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 group"
                  >
                    <Icon name="logout" className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold">Déconnexion</span>
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