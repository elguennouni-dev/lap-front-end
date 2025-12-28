import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { useAppContext } from '../../contexts/AppContext';
import { UserRole, TaskStatus } from '../../types';
import { api } from '../../services/api';

// --- NavLink Component (Unchanged) ---
interface NavLinkProps {
	icon: string;
	label: string;
	active?: boolean;
	badge?: number;
	onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ icon, label, active = false, badge, onClick }) => {
	const containerClasses = `flex items-center justify-between w-full px-4 py-3.5 mb-1 rounded-xl transition-all duration-200 group ${
		active 
			? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 translate-x-1' 
			: 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
	}`;

	return (
		<button onClick={onClick} className={containerClasses}>
			<div className="flex items-center space-x-3.5">
				<Icon 
					name={icon} 
					className={`h-[22px] w-[22px] flex-shrink-0 transition-transform duration-200 ${
						active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
					}`} 
				/>
				<span className={`text-sm tracking-wide ${active ? 'font-semibold' : 'font-medium'}`}>
					{label}
				</span>
			</div>
			
			{badge && badge > 0 && (
				<span className={`flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold ${
					active ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'
				}`}>
					{badge > 99 ? '99+' : badge}
				</span>
			)}
		</button>
	);
};
// --- END NavLink Component ---

const Sidebar: React.FC<{ className?: string }> = ({ className = '' }) => {
	const { currentUser, currentView, setCurrentView, logout } = useAppContext();
	const [pendingTaskCount, setPendingTaskCount] = useState(0);

	// Effect to fetch pending task count for the badge
	useEffect(() => {
		if (!currentUser) return;

		const fetchCount = async () => {
			try {
				// Fetch ALL tasks visible to the user (Admin: all, Employee: their own)
				// This uses the updated logic in api.ts to derive visible tasks
				const tasks = await api.getTasksByUser(currentUser.id);
				
				// Count tasks that are ASSIGNEE (newly assigned) or REJETEE (need re-work)
				const pendingCount = tasks.filter(t => 
					t.status === TaskStatus.ASSIGNEE || t.status === TaskStatus.REJETEE
				).length;

				setPendingTaskCount(pendingCount);
			} catch (error) {
				console.error("Failed to fetch pending task count", error);
				setPendingTaskCount(0);
			}
		};

		fetchCount();
		// Poll for updates every 30 seconds
		const interval = setInterval(fetchCount, 30000); 

		return () => clearInterval(interval);
	}, [currentUser]);

	const navigationItems = [
		{ id: 'dashboard', icon: 'dashboard', label: 'Tableau de bord'},
		{ id: 'orders', icon: 'assignment', label: 'Commandes de travaux' },
		{ id: 'tasks', icon: 'task', label: 'Tâches Production', badge: pendingTaskCount },
		{ id: 'users', icon: 'people', label: 'Équipe', adminOnly: true },
		{ id: 'settings', icon: 'settings', label: 'Parametre', adminOnly: true},
	];

	const isAdmin = currentUser?.role === UserRole.ADMINISTRATEUR;
	const filteredNavigationItems = navigationItems.filter(item => !item.adminOnly || isAdmin);

	const handleLogout = () => {
		if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
			logout();
		}
	};

	return (
		<aside className={`w-72 bg-white border-r border-slate-100 flex-shrink-0 flex flex-col h-screen font-sans ${className}`}>
			
			<div className="h-24 flex items-center px-8 flex-shrink-0">
				<div className="flex items-center gap-4 w-full">
					<div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
						<Icon name="logo" className="h-6 w-6 text-white" />
					</div>
					
					<div className="flex flex-col justify-center">
						<h1 className="text-lg font-bold text-slate-900 leading-tight">
							LAP
						</h1>
						<span className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest">
							Gestion d'équipe
						</span>
					</div>
				</div>
			</div>

			<nav className="flex-1 px-4 overflow-y-auto py-2">
				<div className="px-4 mb-3 mt-2">
					<h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
						Menu Principal
					</h2>
				</div>
				
				<div className="space-y-1">
					{filteredNavigationItems.map(item => (
						<NavLink
							key={item.id}
							icon={item.icon}
							label={item.label}
							active={currentView === item.id}
							onClick={() => setCurrentView(item.id)}
							badge={item.id === 'tasks' ? pendingTaskCount : undefined} // Apply badge only to Tasks
						/>
					))}
				</div>
			</nav>

			<div className="p-4 border-t border-slate-100">
				<button 
					onClick={handleLogout}
					className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors duration-200 group"
				>
					<Icon name="logout" className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
					<span className="text-sm font-medium">Déconnexion</span>
				</button>
			</div>

		</aside>
	);
};

export default Sidebar;