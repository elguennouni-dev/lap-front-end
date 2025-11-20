import React from 'react';
import OrderKanbanView from './OrderKanbanView';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

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

// Simple Bar Chart Component
const BarChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 w-20 truncate">{item.label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-800 w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple Line Chart Component
const LineChart: React.FC<{ data: { label: string; value: number }[]; title: string }> = ({ data, title }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const minValue = Math.min(...data.map(item => item.value));
  const range = maxValue - minValue;
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="relative h-40">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="border-t border-slate-100" />
          ))}
        </div>
        
        {/* Chart line */}
        <div className="absolute inset-0 flex items-end">
          <div className="flex-1 flex items-end space-x-2 px-2">
            {data.map((item, index) => {
              const height = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-3 bg-gradient-to-t from-blue-500 to-blue-600 rounded-t transition-all duration-1000 ease-out"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-slate-500 mt-2">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Data points */}
        <div className="absolute inset-0 flex items-end">
          <div className="flex-1 flex space-x-2 px-2">
            {data.map((item, index) => {
              const height = range > 0 ? ((item.value - minValue) / range) * 100 : 50;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-2 h-2 bg-blue-600 rounded-full border-2 border-white shadow-sm"
                    style={{ marginBottom: `calc(${height}% - 4px)` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Pie Chart Component
const PieChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6">
        <div className="relative w-32 h-32 mx-auto lg:mx-0">
          <svg viewBox="0 0 32 32" className="w-32 h-32 transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const x1 = 16 + 16 * Math.cos(currentAngle * Math.PI / 180);
              const y1 = 16 + 16 * Math.sin(currentAngle * Math.PI / 180);
              currentAngle += angle;
              const x2 = 16 + 16 * Math.cos(currentAngle * Math.PI / 180);
              const y2 = 16 + 16 * Math.sin(currentAngle * Math.PI / 180);
              
              const pathData = [
                `M 16 16`,
                `L ${x1} ${y1}`,
                `A 16 16 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-1000 ease-out"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-slate-800">{total}</span>
          </div>
        </div>
        
        <div className="flex-1 space-y-3 mt-4 lg:mt-0">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-600 flex-1">{item.label}</span>
              <span className="text-sm font-semibold text-slate-800">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { currentUser } = useAppContext();

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
      title: "Propriétés Actives",
      value: "12",
      icon: "business",
      trend: { value: 8, isPositive: true },
      color: "green"
    },
    {
      title: "Commandes Terminées",
      value: "42",
      icon: "order-completed",
      trend: { value: 15, isPositive: true },
      color: "purple"
    }
  ];

  // Chart data
  const ordersByStatusData = [
    { label: 'Nouveau', value: 3, color: 'bg-blue-500' },
    { label: 'Design', value: 5, color: 'bg-purple-500' },
    { label: 'Production', value: 8, color: 'bg-orange-500' },
    { label: 'Terminé', value: 12, color: 'bg-green-500' },
  ];

  const weeklyOrdersData = [
    { label: 'Lun', value: 8 },
    { label: 'Mar', value: 12 },
    { label: 'Mer', value: 10 },
    { label: 'Jeu', value: 15 },
    { label: 'Ven', value: 18 },
    { label: 'Sam', value: 5 },
    { label: 'Dim', value: 2 },
  ];

  const productTypeData = [
    { label: 'Panneaux', value: 25, color: 'bg-blue-500' },
    { label: 'OneWay', value: 18, color: 'bg-green-500' },
    { label: 'Signalétique', value: 12, color: 'bg-purple-500' },
    { label: 'Autres', value: 8, color: 'bg-orange-500' },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {currentUser?.first_name || "Utilisateur"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-3 mt-4 lg:mt-0">
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

      {/* Stats Grid */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Charts Section */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <BarChart 
            data={ordersByStatusData}
            title="Commandes par Statut"
          />
          <LineChart 
            data={weeklyOrdersData}
            title="Commandes de la Semaine"
          />
          <PieChart 
            data={productTypeData}
            title="Types de Produits"
          />
        </div>
      </section>

      {/* Orders Section - Full Width */}
      <section>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
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
    </div>
  );
};

export default Dashboard;