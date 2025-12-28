import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, UserRole } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import CreateOrderModal from '../modals/CreateOrderModal';
import OrderDetailModal from './OrderDetailModal';

const OrdersPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersData = await api.getOrders();
      // Ensure we have a valid array
      const validOrders = Array.isArray(ordersData) ? ordersData : [];
      // Double filtering to be absolutely safe against nulls in state
      setOrders(validOrders.filter(o => o !== null && o !== undefined));
    } catch (error) {
      console.error('Failed to fetch data', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getAccessibleOrders = () => {
    if (!currentUser) return [];
    if (!orders || orders.length === 0) return [];

    if (currentUser.role === UserRole.ADMINISTRATEUR) {
      return orders;
    }

    return orders.filter(order => {
      // 1. Safety Check: If order is null, skip it
      if (!order) return false;

      if (currentUser.role === UserRole.COMMERCIAL) {
        return true; 
      }
      
      // 2. Safety Check: Ensure tasks array exists
      const tasks = order.tasks || [];
      
      // 3. Safety Check: Check if any task is assigned to current user
      return tasks.some(t => t && t.assignee && t.assignee.id === currentUser.id);
    });
  };

  // Get safe list
  const accessibleOrders = getAccessibleOrders();

  let filteredOrders = accessibleOrders.filter(order => {
    // Redundant but safe check
    if (!order) return false;

    const matchesStatus = filterStatus === 'ALL' || order.etat === filterStatus;
    
    // Search Safety: Ensure properties exist before calling toLowerCase()
    const idMatch = String(order.id || '').includes(searchTerm);
    const nameMatch = (order.nomPropriete || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && (idMatch || nameMatch);
  });

    // 🛑 NEW CODE: Sorting from newest to oldest (A-Z or Date descending)
    filteredOrders = filteredOrders.sort((a, b) => {
        // Fallback to ID if createdDate is missing, though createdDate is preferred.
        const dateA = a.createdDate ? new Date(a.createdDate).getTime() : a.id;
        const dateB = b.createdDate ? new Date(b.createdDate).getTime() : b.id;
        
        // Sort descending (b - a = Newest first)
        return dateB - dateA; 
    });
    // 🛑 END NEW CODE

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.CREEE]: { 
        color: 'bg-blue-500/10 text-blue-600 border-blue-200', 
        icon: 'add-circle',
        badge: 'Nouveau'
      },
      [OrderStatus.EN_DESIGN]: { 
        color: 'bg-purple-500/10 text-purple-600 border-purple-200', 
        icon: 'design',
        badge: 'Design en Cours'
      },
      [OrderStatus.EN_IMPRESSION]: { 
        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', 
        icon: 'print',
        badge: 'En Impression'
      },
      [OrderStatus.IMPRESSION_VALIDE]: { 
        color: 'bg-teal-500/10 text-teal-600 border-teal-200', 
        icon: 'check-circle',
        badge: 'Impression Validée'
      },
      [OrderStatus.EN_LIVRAISON]: { 
        color: 'bg-orange-500/10 text-orange-600 border-orange-200', 
        icon: 'delivery',
        badge: 'En Livraison'
      },
      [OrderStatus.LIVRAISON_VALIDE]: { 
        color: 'bg-green-500/10 text-green-600 border-green-200', 
        icon: 'verified',
        badge: 'Livré & Validé'
      },
      [OrderStatus.TERMINEE_STOCK]: { 
        color: 'bg-gray-500/10 text-gray-600 border-gray-200', 
        icon: 'inventory',
        badge: 'En Stock / Terminé'
      },
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'help', badge: status || 'Inconnu' };
  };

  const handleOrderCreated = (newOrder: Order) => {
    fetchData();
  };

  const canCreateOrder = currentUser?.role === UserRole.ADMINISTRATEUR || 
                         currentUser?.role === UserRole.COMMERCIAL;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-text-secondary text-lg">Chargement des commandes...</p>
        </div>
        
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Commandes</h1>
          <p className="text-slate-600 text-lg">Gestion des commandes clients</p>
        </div>
        
        {canCreateOrder && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
          >
            <Icon name="add" className="h-5 w-5" />
            <span className="text-lg">Nouvelle Commande</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon name="search" className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher (ID, Propriété)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
                  className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">Tous les statuts</option>
                  {Object.values(OrderStatus).map(status => (
                    <option key={status} value={status}>
                      {getStatusConfig(status).badge}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-slate-600 font-medium">
                {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredOrders.map(order => {
              if (!order) return null; // Final check

              const statusConfig = getStatusConfig(order.etat);
              const dateStr = order.createdDate ? new Date(order.createdDate).toLocaleDateString('fr-FR') : '-';
              
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-slate-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl">
                        <Icon name="order" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl mb-1">#{order.id}</h3>
                        <p className="text-slate-600 text-lg">{order.nomPropriete || 'Sans Nom'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                        <Icon name={statusConfig.icon} className="h-4 w-4 mr-2" />
                        {statusConfig.badge}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Icon name="calendar" className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-slate-600 block text-sm">Date</span>
                        <p className="text-slate-800 font-medium">{dateStr}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Icon name="location" className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-slate-600 block text-sm">Zone</span>
                        <p className="text-slate-800 font-medium">{order.zone?.nom || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="text-sm text-slate-500 flex items-center space-x-2">
                      <Icon name="schedule" className="h-4 w-4" />
                      <span>Type: {order.typeTravaux}</span>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-blue-500/25"
                    >
                      <span>Voir détails</span>
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white sticky top-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon name="analytics" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Aperçu</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Total commandes</span>
                <span className="text-xl font-bold">{accessibleOrders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">En cours</span>
                <span className="text-xl font-bold">
                  {accessibleOrders.filter(o => 
                    o && [OrderStatus.EN_DESIGN, OrderStatus.EN_IMPRESSION, OrderStatus.EN_LIVRAISON].includes(o.etat)
                  ).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Terminées</span>
                <span className="text-xl font-bold">
                  {accessibleOrders.filter(o => o && o.etat === OrderStatus.TERMINEE_STOCK).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon name="assignment" className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">Aucune commande trouvée</h3>
          <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
            {searchTerm || filterStatus !== 'ALL' 
              ? "Aucune commande ne correspond à vos critères de recherche."
              : "Aucune commande associée à votre compte pour le moment."
            }
          </p>
          {canCreateOrder && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl inline-flex items-center space-x-3 shadow-lg shadow-blue-500/25 transition-all duration-200"
            >
              <Icon name="add" className="h-5 w-5" />
              <span>Créer une commande</span>
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {canCreateOrder && (
        <CreateOrderModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onOrderCreated={handleOrderCreated}
          customers={[]} 
          products={[]} 
        />
      )}

      {selectedOrder && (
        <OrderDetailModal
          orderId={selectedOrder.id}
          onClose={() => {
            setSelectedOrder(null);
            fetchData(); 
          }}
        />
      )}
    </div>
  );
};

export default OrdersPage;