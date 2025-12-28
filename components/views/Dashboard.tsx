import React, { useEffect, useState } from 'react';
// Correct import path assuming OrderKanbanView is in components/orders/
import OrderKanbanView from '../views/OrderKanbanView'; 
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import { UserRole } from '../../types';
import { api } from '@/services/api';
import { DashboardStats } from '../../types';

// --- COMPONENTS (StatCard & BarChart) ---

const StatCard: React.FC<{ title: string; value: string | number; icon: string; trend?: any; color?: string }> = ({ 
  title, value, icon, trend, color = 'blue'
}) => {
  const colorClasses: any = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-3">
            <p className="text-3xl font-bold text-slate-800 truncate">{value}</p>
            {trend && (
              <span className="flex items-center text-sm font-medium px-2 py-1 rounded-full text-green-600 bg-green-50">
                <Icon name="trending-up" className="h-4 w-4 mr-1" /> {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]}`}>
          <Icon name={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 w-24 truncate font-medium">{item.label}</span>
            <div className="flex-1 bg-slate-50 rounded-full h-4 overflow-hidden border border-slate-100">
              <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </div>
            <span className="text-sm font-bold text-slate-800 w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---

const Dashboard: React.FC = () => {
  const { currentUser } = useAppContext();
  const isAdmin = currentUser?.role === UserRole.ADMINISTRATEUR;
  const [loading, setLoading] = useState(true);
  
  // State is populated exclusively from Backend API
  const [stats, setStats] = useState<DashboardStats>({
    newOrders: 0,
    inProgress: 0,
    completed: 0,
    breakdown: {}
  });

  // Fetch Data from Backend
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.log("Fetching dashboard stats from Backend...");
        const dashboardData = await api.getDashboardStats();
        setStats(dashboardData);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Map the Backend 'breakdown' map to the UI
  // Note: We use the specific Backend ENUM keys ('CREEE', 'EN_DESIGN', etc.) to map to the correct colors.
  const ordersByStatusData = [
    { label: 'Nouveau', value: stats.breakdown['CREEE'] || 0, color: 'bg-blue-500' },
    { label: 'Design', value: stats.breakdown['EN_DESIGN'] || 0, color: 'bg-purple-500' },
    { label: 'Impression', value: stats.breakdown['EN_IMPRESSION'] || 0, color: 'bg-indigo-500' },
    { label: 'Validé (Imp)', value: stats.breakdown['IMPRESSION_VALIDE'] || 0, color: 'bg-teal-500' },
    { label: 'Livraison', value: stats.breakdown['EN_LIVRAISON'] || 0, color: 'bg-orange-500' },
    { label: 'Validé (Liv)', value: stats.breakdown['LIVRAISON_VALIDE'] || 0, color: 'bg-green-600' },
    { label: 'Terminé', value: stats.completed, color: 'bg-green-500' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {currentUser?.username || "Utilisateur"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Voici les statistiques en temps réel de votre système
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-3 mt-4 lg:mt-0 backdrop-blur-sm border border-white/10">
            <Icon name="calendar" className="h-5 w-5 text-blue-200" />
            <span className="text-blue-100 font-medium">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </section>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
             title="Nouvelles Commandes"
             value={stats.newOrders}
             icon="assignment"
             trend={{ value: 0, isPositive: true }} // You can calculate trend if you have historical data
             color="blue"
           />
           <StatCard
             title="En Cours"
             value={stats.inProgress}
             icon="task"
             color="orange"
           />
           <StatCard
             title="Terminées (Stock)"
             value={stats.completed}
             icon="check-circle"
             color="purple"
           />
        </div>
      </section>

      <section>
        <div className="w-full">
          <BarChart 
            data={ordersByStatusData}
            title="Répartition des Commandes"
          />
        </div>
      </section>

      {isAdmin && (
        <section>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Flux de Travail</h2>
            </div>
            <div className="w-full">
              <OrderKanbanView />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;