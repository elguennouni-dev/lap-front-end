import React from 'react';
import OrderKanbanView from './OrderKanbanView';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import { UserRole } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const trendColors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
          <div className="flex items-baseline space-x-3">
            <p className="text-3xl font-bold text-slate-800 truncate">{value}</p>
            {trend && (
              <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${
                trend.isPositive ? trendColors[color as keyof typeof trendColors] : 'text-red-600 bg-red-50'
              }`}>
                <Icon 
                  name={trend.isPositive ? "trending-up" : "trending-down"} 
                  className="h-4 w-4 mr-1" 
                />
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
          <Icon name={icon} className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 w-24 truncate font-medium">{item.label}</span>
            <div className="flex-1 bg-slate-50 rounded-full h-4 overflow-hidden border border-slate-100">
              <div 
                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-800 w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser } = useAppContext();
  const isAdmin = currentUser?.roles?.includes(UserRole.ADMIN);

  const statsData = [
    {
      title: "Nouvelles Commandes",
      value: "3",
      icon: "order",
      trend: { value: 12, isPositive: true },
      color: "blue"
    },
    {
      title: "Tâches Assignées",
      value: "8",
      icon: "task",
      trend: { value: 5, isPositive: false },
      color: "orange"
    },
    {
      title: "Commandes Terminées",
      value: "42",
      icon: "order-completed",
      trend: { value: 15, isPositive: true },
      color: "purple"
    }
  ];

  const ordersByStatusData = [
    { label: 'Nouveau', value: 3, color: 'bg-blue-500' },
    { label: 'Design', value: 5, color: 'bg-purple-500' },
    { label: 'Production', value: 8, color: 'bg-orange-500' },
    { label: 'Terminé', value: 12, color: 'bg-green-500' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {currentUser?.first_name || "Utilisateur"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Voici un aperçu de votre activité aujourd'hui
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
          {statsData.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              color={stat.color}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="w-full">
          <BarChart 
            data={ordersByStatusData}
            title="Commandes par Statut"
          />
        </div>
      </section>

      {isAdmin && (
        <section>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Commandes en Cours</h2>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Nouveau</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>En Cours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Terminé</span>
                </div>
              </div>
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