import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';
import OrderDetailModal from './OrderDetailModal';
import { Icon } from '../common/Icon';

// This defines the Visual Order of columns on the screen.
// The DATA inside them comes from the Backend.
const statusOrder: OrderStatus[] = [
  OrderStatus.CREEE,
  OrderStatus.EN_DESIGN,
  OrderStatus.EN_IMPRESSION,
  OrderStatus.IMPRESSION_VALIDE,
  OrderStatus.EN_LIVRAISON,
  OrderStatus.LIVRAISON_VALIDE,
  OrderStatus.TERMINEE_STOCK,
];

const getStatusColorInfo = (status: OrderStatus): { border: string, text: string, bg: string, gradient: string } => {
  const colors = {
    [OrderStatus.CREEE]: { border: 'border-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', gradient: 'from-blue-500 to-blue-600' },
    [OrderStatus.EN_DESIGN]: { border: 'border-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', gradient: 'from-purple-500 to-purple-600' },
    [OrderStatus.EN_IMPRESSION]: { border: 'border-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', gradient: 'from-indigo-500 to-indigo-600' },
    [OrderStatus.IMPRESSION_VALIDE]: { border: 'border-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', gradient: 'from-teal-500 to-teal-600' },
    [OrderStatus.EN_LIVRAISON]: { border: 'border-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', gradient: 'from-orange-500 to-orange-600' },
    [OrderStatus.LIVRAISON_VALIDE]: { border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-50', gradient: 'from-green-500 to-green-600' },
    [OrderStatus.TERMINEE_STOCK]: { border: 'border-gray-500', text: 'text-gray-600', bg: 'bg-gray-50', gradient: 'from-gray-500 to-gray-600' },
  };
  return colors[status] || { border: 'border-gray-500', text: 'text-gray-600', bg: 'bg-gray-50', gradient: 'from-gray-500 to-gray-600' };
};

const getStatusIcon = (status: OrderStatus): string => {
  const icons = {
    [OrderStatus.CREEE]: 'add-circle',
    [OrderStatus.EN_DESIGN]: 'design',
    [OrderStatus.EN_IMPRESSION]: 'print',
    [OrderStatus.IMPRESSION_VALIDE]: 'check-circle',
    [OrderStatus.EN_LIVRAISON]: 'delivery',
    [OrderStatus.LIVRAISON_VALIDE]: 'verified',
    [OrderStatus.TERMINEE_STOCK]: 'inventory',
  };
  return icons[status] || 'assignment';
};

const OrderCard: React.FC<{ order: Order; onClick: () => void }> = ({ order, onClick }) => {
  if (!order) return null;

  const colorInfo = getStatusColorInfo(order.etat);
  
  const dateStr = order.createdDate 
    ? new Date(order.createdDate).toLocaleDateString('fr-FR') 
    : 'Date inconnue';

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-slate-200 cursor-pointer hover:shadow-xl hover:border-slate-300 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${colorInfo.gradient}`}>
            <Icon name={getStatusIcon(order.etat)} className="h-4 w-4 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-800">#{order.id}</p>
        </div>
        <p className="text-xs text-slate-500">{dateStr}</p>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-800 truncate" title={order.nomPropriete}>
            {order.nomPropriete || 'Sans nom'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
            {order.zone?.nom || 'Zone ?'}
          </span>
          <Icon name="chevron-right" className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>
    </div>
  );
};

const StatusSection: React.FC<{ 
  title: OrderStatus; 
  orders: Order[]; 
  onCardClick: (order: Order) => void; 
}> = ({ title, orders, onCardClick }) => {
  const colorInfo = getStatusColorInfo(title);
  
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${colorInfo.gradient}`}>
            <Icon name={getStatusIcon(title)} className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm capitalize">
              {title.toLowerCase().replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-slate-500">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${colorInfo.bg} ${colorInfo.text}`}>
          {orders.length}
        </span>
      </div>
      
      <div className="space-y-3 min-h-[100px]">
        {orders.map(order => (
          order ? (
            <OrderCard 
              key={order.id} 
              order={order} 
              onClick={() => onCardClick(order)}
            />
          ) : null
        ))}
        
        {orders.length === 0 && (
          <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-xs">Aucune commande</p>
          </div>
        )}
      </div>
    </div>
  );
}

const OrderKanbanView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');

  // FETCHING DATA FROM BACKEND
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const fetchedOrders = await api.getOrders();
      
      if (Array.isArray(fetchedOrders)) {
          setOrders(fetchedOrders.filter(o => o !== null));
      } else {
          setOrders([]);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCloseModal = (updatedOrder?: Order) => {
    if(updatedOrder) {
      setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    } else {
      fetchAllData();
    }
    setSelectedOrder(null);
  };
  
  const ordersByStatus = useMemo(() => {
    return orders.reduce((acc, order) => {
      // Safety check
      if (order && order.etat) {
          (acc[order.etat] = acc[order.etat] || []).push(order);
      }
      return acc;
    }, {} as Record<OrderStatus, Order[]>);
  }, [orders]);

  const filteredStatuses = filterStatus === 'ALL' 
    ? statusOrder 
    : [filterStatus];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-800 font-medium">Chargement des commandes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-slate-600 font-medium">{orders.length} commande{orders.length !== 1 ? 's' : ''} au total</p>
        </div>
        
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
          className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">Toutes les étapes</option>
          {statusOrder.map(status => (
            <option key={status} value={status}>
              {status.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex space-x-6 min-w-max">
          {filteredStatuses.map(status => (
            <div key={status} className="w-80 flex-shrink-0">
              <StatusSection 
                title={status}
                orders={ordersByStatus[status] || []}
                onCardClick={setSelectedOrder}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          orderId={selectedOrder.id}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OrderKanbanView;