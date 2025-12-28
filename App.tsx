import React from 'react';
import { useAppContext } from './contexts/AppContext';
import LoginScreen from './components/views/LoginScreen';
import Dashboard from './components/views/Dashboard';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import OtpScreen from './components/views/OtpScreen';
// import CustomersPage from './components/views/CustomersPage'; // Not used in render
// import ProductsPage from './components/views/ProductsPage'; // Not used in render
import TasksPage from './components/views/TasksPage';
import UsersPage from './components/views/UsersPage';
import OrdersPage from './components/views/OrdersPage';
import Settings from './components/views/Settings';

const AppContent: React.FC = () => {
	const { currentUser, isAwaitingOtp, currentView } = useAppContext();

	const renderCurrentView = () => {
		switch (currentView) {
			case 'dashboard':
				return <Dashboard />;
			case 'orders':
				return <OrdersPage />;
			case 'tasks':
				return <TasksPage />;
			case 'users':
				return <UsersPage />;
			case 'settings':
				return <Settings />;
			default:
				return <Dashboard />;
		}
	};

	if (!currentUser) {
		return isAwaitingOtp ? <OtpScreen /> : <LoginScreen />;
	}

	return (
		<div className="flex h-screen bg-slate-50">
			<Sidebar />
			<div className="flex-1 flex flex-col overflow-hidden">
				<Header />
				<main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
					{renderCurrentView()}
				</main>
			</div>
		</div>
	);
};

const App: React.FC = () => {
	return (
		<div className="min-h-screen font-sans text-slate-800">
			<AppContent />
		</div>
	);
};

export default App;