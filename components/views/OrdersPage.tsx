import React, { useState, useEffect } from 'react';
import { Order, Customer, Product, OrderStatus, UserRole } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import CreateOrderModal from '../modals/CreateOrderModal';

const OrdersPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts()
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customers.find(c => c.customer_id === order.customer_id)?.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.NEW_ORDER]: { 
        color: 'bg-blue-500/10 text-blue-600 border-blue-200', 
        icon: 'add-circle',
        badge: 'Nouveau'
      },
      [OrderStatus.DESIGN_ASSIGNED]: { 
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', 
        icon: 'assignment',
        badge: 'Design Assigné'
      },
      [OrderStatus.DESIGN_IN_PROGRESS]: { 
        color: 'bg-purple-500/10 text-purple-600 border-purple-200', 
        icon: 'design',
        badge: 'Design en Cours'
      },
      [OrderStatus.DESIGN_PENDING_APPROVAL]: { 
        color: 'bg-orange-500/10 text-orange-600 border-orange-200', 
        icon: 'pending',
        badge: 'En Attente'
      },
      [OrderStatus.DESIGN_APPROVED]: { 
        color: 'bg-green-500/10 text-green-600 border-green-200', 
        icon: 'check-circle',
        badge: 'Design Approuvé'
      },
      [OrderStatus.PRODUCTION_ASSIGNED]: { 
        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200', 
        icon: 'print',
        badge: 'Production Assignée'
      },
      [OrderStatus.PRODUCTION_IN_PROGRESS]: { 
        color: 'bg-pink-500/10 text-pink-600 border-pink-200', 
        icon: 'build',
        badge: 'Production en Cours'
      },
      [OrderStatus.PRODUCTION_COMPLETE]: { 
        color: 'bg-teal-500/10 text-teal-600 border-teal-200', 
        icon: 'assignment-turned-in',
        badge: 'Production Terminée'
      },
      [OrderStatus.FINAL_PENDING_APPROVAL]: { 
        color: 'bg-amber-500/10 text-amber-600 border-amber-200', 
        icon: 'verified',
        badge: 'Approbation Finale'
      },
      [OrderStatus.COMPLETED]: { 
        color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', 
        icon: 'verified',
        badge: 'Terminée'
      },
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: 'help', badge: status };
  };

  const handleOrderCreated = (newOrder: Order) => {
    fetchData();
  };

  const canCreateOrder = currentUser?.roles.includes(UserRole.ADMIN) || 
                        currentUser?.roles.includes(UserRole.COMMERCIAL);

  if (loading && orders.length === 0) {
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
                    placeholder="Rechercher une commande..."
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
              const customer = customers.find(c => c.customer_id === order.customer_id);
              const statusConfig = getStatusConfig(order.status);
              
              return (
                <div key={order.order_id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-slate-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl">
                        <Icon name="order" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl mb-1">{order.order_number}</h3>
                        <p className="text-slate-600 text-lg">{customer?.company_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                        <Icon name={statusConfig.icon} className="h-4 w-4 mr-2" />
                        {statusConfig.badge}
                      </span>
                      <span className="font-bold text-slate-800 text-2xl">
                        {order.total_amount.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Icon name="calendar" className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-slate-600 block text-sm">Date commande</span>
                        <p className="text-slate-800 font-medium">
                          {new Date(order.order_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <Icon name="delivery" className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="text-slate-600 block text-sm">Date livraison</span>
                        <p className="text-slate-800 font-medium">
                          {new Date(order.delivery_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <Icon name="priority" className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-slate-600 block text-sm">Priorité</span>
                        <p className="text-slate-800 font-medium">{order.priority}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="text-sm text-slate-500 flex items-center space-x-2">
                      <Icon name="schedule" className="h-4 w-4" />
                      <span>Créé le {new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-6 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-blue-500/25">
                      <span>Voir détails</span>
                      <Icon name="chevron-right" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon name="analytics" className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">Aperçu</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Total commandes</span>
                <span className="text-xl font-bold">{orders.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">En attente</span>
                <span className="text-xl font-bold">
                  {orders.filter(o => o.status === OrderStatus.DESIGN_PENDING_APPROVAL).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">En cours</span>
                <span className="text-xl font-bold">
                  {orders.filter(o => 
                    o.status === OrderStatus.DESIGN_IN_PROGRESS || 
                    o.status === OrderStatus.PRODUCTION_IN_PROGRESS
                  ).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <Icon name="filter-list" className="h-5 w-5 text-slate-600" />
              <span>Statuts rapides</span>
            </h3>
            <div className="space-y-2">
              {[
                { status: 'ALL' as const, label: 'Toutes', count: orders.length },
                { status: OrderStatus.NEW_ORDER, label: 'Nouvelles', count: orders.filter(o => o.status === OrderStatus.NEW_ORDER).length },
                { status: OrderStatus.DESIGN_PENDING_APPROVAL, label: 'En attente', count: orders.filter(o => o.status === OrderStatus.DESIGN_PENDING_APPROVAL).length },
                { status: OrderStatus.COMPLETED, label: 'Terminées', count: orders.filter(o => o.status === OrderStatus.COMPLETED).length },
              ].map(item => (
                <button
                  key={item.status}
                  onClick={() => setFilterStatus(item.status)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    filterStatus === item.status 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    filterStatus === item.status 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
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
              : "Commencez par créer votre première commande pour votre entreprise."
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

      {canCreateOrder && (
        <CreateOrderModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onOrderCreated={handleOrderCreated}
          customers={customers}
          products={products}
        />
      )}
    </div>
  );
};

export default OrdersPage;