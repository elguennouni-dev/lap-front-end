import React from 'react';
import { Icon } from './Icon';
import { useAppContext } from '../../contexts/AppContext';
import { UserRole } from '../../types';

interface NavLinkProps {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
  adminOnly?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active = false, badge, onClick, adminOnly = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:shadow-sm'
      }`}
  >
    <div className="flex items-center space-x-3">
      <Icon name={icon} className={`h-5 w-5 ${active ? 'text-white' : 'text-current group-hover:scale-110'} transition-transform`} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {badge && badge > 0 && (
      <span className={`flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-xs font-semibold ${active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
        }`}>
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

const Sidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { currentUser, currentView, setCurrentView } = useAppContext();

  const navigationItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord' },
    { id: 'orders', icon: 'assignment', label: 'Commandes de travaux' },
    { id: 'customers', icon: 'business', label: 'Propriétés' },
    { id: 'products', icon: 'inventory', label: 'Produits LAP' },
    { id: 'tasks', icon: 'task', label: 'Tâches Production' },
    { id: 'users', icon: 'people', label: 'Équipe', adminOnly: true },
    { id: 'reports', icon: 'analytics', label: 'Rapports', adminOnly: true },
  ];

  const bottomNavigationItems = [
    // { id: 'settings', icon: 'settings', label: 'Paramètres' },
    // { id: 'help', icon: 'help', label: 'Aide & Support' },
  ];

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const filteredNavigationItems = navigationItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside className={`w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col h-screen ${className}`}>
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <Icon name="apartment" className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">LAP</h1>
            <p className="text-xs text-slate-600">Signalétique</p>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200">
          <Icon name="menu" className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="px-2 mb-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Navigation</h2>
        </div>
        {filteredNavigationItems.map(item => (
          <NavLink
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
            adminOnly={item.adminOnly}
          />
        ))}
      </nav>

      {/* Quick Stats Section */}
      <div className="px-4 py-3 border-t border-slate-200">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="trending-up" className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Aujourd'hui</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-slate-800">12</div>
              <div className="text-slate-600">Commandes</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-slate-800">8</div>
              <div className="text-slate-600">En production</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section & Profile */}
      <div className="p-4 border-t border-slate-200 space-y-1">
        {bottomNavigationItems.map(item => (
          <NavLink
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentView === item.id}
            onClick={() => setCurrentView(item.id)}
          />
        ))}

        {/* <div className="pt-4 mt-4 border-t border-slate-200">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <Icon name="person" className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {currentUser?.firstName} {currentUser?.lastName}
              </p>
              <p className="text-xs text-slate-600 truncate capitalize">
                {currentUser?.role && currentUser.role.toLowerCase()}
              </p>
            </div>
            <Icon name="chevron-down" className="h-4 w-4 text-slate-600" />
          </div>
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;