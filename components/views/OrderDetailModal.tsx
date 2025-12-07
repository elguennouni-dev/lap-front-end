import React, { useState, useEffect, useCallback } from 'react';
import { Order, Customer, Product, UserRole, OrderStatus, TaskStatus, Task } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import DesignUploadModal from '../modals/DesignUploadModal';
import DesignPreviewModal from '../modals/DesignPreviewModal';

interface OrderDetailModalProps {
  orderId: number;
  onClose: (updatedOrder?: Order) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ orderId, onClose }) => {
  const { currentUser, users } = useAppContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignee, setAssignee] = useState<string>('');
  const [showDesignUpload, setShowDesignUpload] = useState(false);
  const [showDesignPreview, setShowDesignPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'tasks'>('overview');

  const designers = users.filter(u => u.roles.includes(UserRole.DESIGNER));
  const imprimeurs = users.filter(u => u.roles.includes(UserRole.IMPRIMEUR));

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.NEW_ORDER]: { 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: 'add-circle',
        badge: 'Nouveau',
        gradient: 'from-blue-500 to-blue-600'
      },
      [OrderStatus.DESIGN_ASSIGNED]: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: 'assignment',
        badge: 'Design Assigné',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      [OrderStatus.DESIGN_IN_PROGRESS]: { 
        color: 'bg-purple-100 text-purple-700 border-purple-200', 
        icon: 'design',
        badge: 'Design en Cours',
        gradient: 'from-purple-500 to-purple-600'
      },
      [OrderStatus.DESIGN_PENDING_APPROVAL]: { 
        color: 'bg-orange-100 text-orange-700 border-orange-200', 
        icon: 'pending',
        badge: 'En Attente',
        gradient: 'from-orange-500 to-orange-600'
      },
      [OrderStatus.DESIGN_APPROVED]: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: 'check-circle',
        badge: 'Design Approuvé',
        gradient: 'from-green-500 to-green-600'
      },
      [OrderStatus.PRODUCTION_ASSIGNED]: { 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200', 
        icon: 'print',
        badge: 'Production Assignée',
        gradient: 'from-indigo-500 to-indigo-600'
      },
      [OrderStatus.PRODUCTION_IN_PROGRESS]: { 
        color: 'bg-pink-100 text-pink-700 border-pink-200', 
        icon: 'build',
        badge: 'Production en Cours',
        gradient: 'from-pink-500 to-pink-600'
      },
      [OrderStatus.PRODUCTION_COMPLETE]: { 
        color: 'bg-teal-100 text-teal-700 border-teal-200', 
        icon: 'assignment-turned-in',
        badge: 'Production Terminée',
        gradient: 'from-teal-500 to-teal-600'
      },
      [OrderStatus.FINAL_PENDING_APPROVAL]: { 
        color: 'bg-amber-100 text-amber-700 border-amber-200', 
        icon: 'verified',
        badge: 'Approbation Finale',
        gradient: 'from-amber-500 to-amber-600'
      },
      [OrderStatus.COMPLETED]: { 
        color: 'bg-emerald-100 text-emerald-700 border-emerald-200', 
        icon: 'verified',
        badge: 'Terminée',
        gradient: 'from-emerald-500 to-emerald-600'
      },
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'dashboard', badge: status, gradient: 'from-gray-500 to-gray-600' };
  };

  const getTaskStatusConfig = (status: TaskStatus) => {
    const configs = {
      [TaskStatus.PENDING]: { color: 'bg-yellow-100 text-yellow-700', icon: 'pending' },
      [TaskStatus.ACCEPTED]: { color: 'bg-blue-100 text-blue-700', icon: 'check-circle' },
      [TaskStatus.REJECTED]: { color: 'bg-red-100 text-red-700', icon: 'close' },
      [TaskStatus.COMPLETED]: { color: 'bg-green-100 text-green-700', icon: 'verified' },
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-700', icon: 'dashboard' };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedOrder, allCustomers, allProducts] = await Promise.all([
        api.getOrder(orderId),
        api.getCustomers(),
        api.getProducts()
      ]);

      if (fetchedOrder) {
        setOrder(fetchedOrder);
        const orderCustomer = allCustomers.find(c => c.customer_id === fetchedOrder.customer_id);
        setCustomer(orderCustomer || null);
      }
      setProducts(allProducts);
    } catch (error) {
      console.error("Failed to fetch order details", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action: () => Promise<any>) => {
    setActionLoading(true);
    try {
      await action();
      await fetchData();
    } catch (error) {
      console.error("Action failed:", error);
      alert("Une erreur est survenue lors de l'action.");
    } finally {
      setActionLoading(false);
    }
  };

  const getDesignTask = () => {
    if (!order) return null;
    return order.tasks.find(t => t.step_name === 'Design');
  };

  const hasDesignFiles = () => {
    const designTask = getDesignTask();
    return designTask?.design_files && designTask.design_files.length > 0;
  };

  const renderOverviewTab = () => {
    if (!order || !customer) return null;

    const statusConfig = getStatusConfig(order.status);

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-lg`}>
                <Icon name={statusConfig.icon} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{order.order_number}</h1>
                <p className="text-slate-600 mt-1">{customer.company_name}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Icon name="calendar" className="h-4 w-4" />
                    <span>Créé le {new Date(order.order_date).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${statusConfig.color}`}>
                <Icon name={statusConfig.icon} className="h-3 w-3 mr-1.5" />
                {statusConfig.badge}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="inventory" className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Articles</p>
            <p className="text-lg font-semibold text-slate-800">{order.items.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="assignment" className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Tâches</p>
            <p className="text-lg font-semibold text-slate-800">{order.tasks.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Icon name="priority" className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Priorité</p>
            <p className="text-lg font-semibold text-slate-800">{order.priority}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center space-x-2">
            <Icon name="person" className="h-5 w-5 text-slate-600" />
            <span>Informations Client</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Entreprise</p>
              <p className="font-semibold text-slate-800">{customer.company_name}</p>
            </div>
            {customer.contact_name && (
              <div>
                <p className="text-sm text-slate-600">Contact</p>
                <p className="font-semibold text-slate-800">{customer.contact_name}</p>
              </div>
            )}
            {customer.email && (
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-semibold text-slate-800">{customer.email}</p>
              </div>
            )}
            {customer.phone && (
              <div>
                <p className="text-sm text-slate-600">Téléphone</p>
                <p className="font-semibold text-slate-800">{customer.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderItemsTab = () => {
    if (!order) return null;

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Articles de la commande</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {order.items.map((item, index) => {
              const product = products.find(p => p.product_id === item.product_id);
              return (
                <div key={item.order_item_id || index} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                        <Icon name="inventory" className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{product?.product_name || 'Produit'}</p>
                        <p className="text-sm text-slate-600">Quantité: {item.quantity}</p>
                         {item.panneaux && (
                            <p className="text-xs text-slate-500 mt-1">
                               {Array.isArray(item.panneaux) ? `${item.panneaux.length} panneau(x) configuré(s)` : 'Panneaux configurés'}
                            </p>
                         )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">Article #{index + 1}</p>
                      <p className="text-sm text-slate-600">
                        {order.status === OrderStatus.COMPLETED ? 'Terminé' : 'En traitement'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 font-medium">Total des articles</span>
              <span className="text-lg font-bold text-slate-800">{order.items.length}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasksTab = () => {
    if (!order) return null;

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-800">Tâches et Progression</h3>
          </div>
          <div className="divide-y divide-slate-200">
            {order.tasks.length > 0 ? (
              order.tasks.map(task => {
                const assigneeUser = users.find(u => u.user_id === task.assigned_to);
                const hasFiles = task.design_files && task.design_files.length > 0;
                const statusConfig = getTaskStatusConfig(task.status);
                
                return (
                  <div key={task.task_id} className="p-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                          <Icon name={statusConfig.icon} className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{task.step_name}</p>
                          <p className="text-sm text-slate-600">
                            Assigné à: {assigneeUser ? `${assigneeUser.first_name} ${assigneeUser.last_name}` : 'Non assigné'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} border border-current opacity-90`}>
                        {task.status}
                      </span>
                    </div>
                    {hasFiles && (
                      <div className="flex items-center space-x-2 text-blue-600 text-sm bg-blue-50 rounded-lg px-3 py-2 mt-2 w-fit">
                        <Icon name="cloud-upload" className="h-4 w-4" />
                        <span>{task.design_files!.length} fichier(s) attaché(s)</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <Icon name="assignment" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Aucune tâche assignée pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!order || !currentUser) return null;

    const isAdmin = currentUser.roles.includes(UserRole.ADMIN);
    const isDesigner = currentUser.roles.includes(UserRole.DESIGNER);
    const userTasks = order.tasks.filter(t => t.assigned_to === currentUser.user_id && t.status === TaskStatus.PENDING);
    const designTask = getDesignTask();

    const activeTask = order.tasks.find(
      t => t.assigned_to === currentUser.user_id && t.status === TaskStatus.ACCEPTED
    );

    return (
      <div className="bg-white border-t border-slate-200 p-6 space-y-4">
        
        {isDesigner && order.status === OrderStatus.DESIGN_IN_PROGRESS && 
         designTask?.assigned_to === currentUser.user_id && 
         designTask?.status === TaskStatus.ACCEPTED && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="cloud-upload" className="h-5 w-5 text-blue-600" />
              <label className="text-sm font-medium text-slate-800">Upload du Design</label>
            </div>
            <button 
              onClick={() => setShowDesignUpload(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25 hover:shadow-xl"
            >
              <Icon name="cloud-upload" className="h-5 w-5" />
              <span>Uploader le Design</span>
            </button>
            {hasDesignFiles() && (
              <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 rounded-lg p-3">
                <Icon name="check-circle" className="h-4 w-4" />
                <span>Design uploadé - En attente d'approbation</span>
              </div>
            )}
          </div>
        )}

        {isAdmin && order.status === OrderStatus.DESIGN_PENDING_APPROVAL && hasDesignFiles() && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="visibility" className="h-5 w-5 text-purple-600" />
              <label className="text-sm font-medium text-slate-800">Approbation du Design</label>
            </div>
            <button 
              onClick={() => setShowDesignPreview(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/25"
            >
              <Icon name="visibility" className="h-5 w-5" />
              <span>Voir et Approuver le Design</span>
            </button>
          </div>
        )}

        {isAdmin && (
          <>
            {order.status === OrderStatus.NEW_ORDER && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name="assignment" className="h-5 w-5 text-slate-600" />
                  <label className="text-sm font-medium text-slate-800">Assigner à un designer</label>
                </div>
                <div className="flex gap-2">
                    <select 
                    value={assignee} 
                    onChange={e => setAssignee(e.target.value)} 
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="">Sélectionner un designer</option>
                    {designers.map(d => (
                        <option key={d.user_id} value={d.user_id}>
                        {d.first_name} {d.last_name}
                        </option>
                    ))}
                    </select>
                    <button 
                    disabled={!assignee || actionLoading}
                    onClick={() => handleAction(() => api.assignTask(order.order_id, 'Design', parseInt(assignee), currentUser.user_id))}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
                    >
                    {actionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                        <Icon name="assignment" className="h-4 w-4" />
                    )}
                    <span>Assigner</span>
                    </button>
                </div>
              </div>
            )}

            {order.status === OrderStatus.DESIGN_PENDING_APPROVAL && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name="check-circle" className="h-5 w-5 text-slate-600" />
                  <label className="text-sm font-medium text-slate-800">Décision Rapide</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAction(() => api.updateOrderStatus(order.order_id, OrderStatus.DESIGN_APPROVED))}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25"
                  >
                    <Icon name="check-circle" className="h-4 w-4" />
                    <span>Approuver</span>
                  </button>
                  <button 
                    onClick={() => handleAction(() => api.updateOrderStatus(order.order_id, OrderStatus.DESIGN_ASSIGNED))}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25"
                  >
                    <Icon name="close" className="h-4 w-4" />
                    <span>Rejeter</span>
                  </button>
                </div>
              </div>
            )}

            {order.status === OrderStatus.DESIGN_APPROVED && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name="print" className="h-5 w-5 text-slate-600" />
                  <label className="text-sm font-medium text-slate-800">Assigner à un imprimeur</label>
                </div>
                <div className="flex gap-2">
                    <select 
                    value={assignee} 
                    onChange={e => setAssignee(e.target.value)} 
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                    <option value="">Sélectionner un imprimeur</option>
                    {imprimeurs.map(d => (
                        <option key={d.user_id} value={d.user_id}>
                        {d.first_name} {d.last_name}
                        </option>
                    ))}
                    </select>
                    <button 
                    disabled={!assignee || actionLoading}
                    onClick={() => handleAction(() => api.assignTask(order.order_id, 'Production', parseInt(assignee), currentUser.user_id))}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
                    >
                    {actionLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                        <Icon name="print" className="h-4 w-4" />
                    )}
                    <span>Assigner</span>
                    </button>
                </div>
              </div>
            )}

            {order.status === OrderStatus.PRODUCTION_COMPLETE && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name="chevron-right" className="h-5 w-5 text-slate-600" />
                  <label className="text-sm font-medium text-slate-800">Étape suivante</label>
                </div>
                <button 
                  onClick={() => handleAction(() => api.updateOrderStatus(order.order_id, OrderStatus.FINAL_PENDING_APPROVAL))}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/25"
                >
                  <Icon name="assignment-turned-in" className="h-4 w-4" />
                  <span>Prêt pour Approbation Finale</span>
                </button>
              </div>
            )}

            {order.status === OrderStatus.FINAL_PENDING_APPROVAL && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Icon name="verified" className="h-5 w-5 text-slate-600" />
                  <label className="text-sm font-medium text-slate-800">Approbation Finale</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAction(() => api.updateOrderStatus(order.order_id, OrderStatus.COMPLETED))}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/25"
                  >
                    <Icon name="verified" className="h-4 w-4" />
                    <span>Terminer</span>
                  </button>
                  <button 
                    onClick={() => handleAction(() => api.updateOrderStatus(order.order_id, OrderStatus.PRODUCTION_ASSIGNED))}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25"
                  >
                    <Icon name="close" className="h-4 w-4" />
                    <span>Rejeter</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {userTasks.map(task => (
          <div key={task.task_id} className="border border-yellow-200 bg-yellow-50 rounded-xl p-4 space-y-3 animate-fade-in-up">
            <div className="flex items-center space-x-2">
              <Icon name="pending" className="h-5 w-5 text-yellow-600" />
              <p className="font-semibold text-yellow-800">Nouvelle tâche : {task.step_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleAction(() => api.updateTaskStatus(order.order_id, task.task_id, TaskStatus.ACCEPTED))}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm"
              >
                Accepter
              </button>
              <button 
                onClick={() => handleAction(() => api.updateTaskStatus(order.order_id, task.task_id, TaskStatus.REJECTED))}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-sm"
              >
                Rejeter
              </button>
            </div>
          </div>
        ))}

        {activeTask && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="check-circle" className="h-5 w-5 text-slate-600" />
              <label className="text-sm font-medium text-slate-800">Progression de la tâche ({activeTask.step_name})</label>
            </div>
            <button 
              onClick={() => handleAction(() => api.updateTaskStatus(order.order_id, activeTask.task_id, TaskStatus.COMPLETED))}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
            >
              <Icon name="check-circle" className="h-4 w-4" />
              <span>Marquer comme Terminée</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-800 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => onClose()}>
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl" onClick={e => e.stopPropagation()}>
          <Icon name="delete" className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Commande non trouvée</h3>
          <p className="text-slate-600 mb-6">La commande que vous recherchez n'existe pas ou a été supprimée.</p>
          <button 
            onClick={() => onClose()}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 shadow-lg"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const designTask = getDesignTask();

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => onClose(order)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Détails de la Commande</h2>
              <p className="text-slate-500 text-sm mt-1">Gestion et suivi de la production</p>
            </div>
            <button 
              onClick={() => onClose(order)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="px-6 flex space-x-6">
            {[
              { id: 'overview', label: 'Aperçu', icon: 'dashboard' },
              { id: 'items', label: 'Articles', icon: 'inventory' },
              { id: 'tasks', label: 'Tâches', icon: 'assignment' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-all text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon name={tab.icon} className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="p-6">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'items' && renderItemsTab()}
            {activeTab === 'tasks' && renderTasksTab()}
          </div>
        </div>

        {renderActions()}

        {showDesignUpload && designTask && (
          <DesignUploadModal
            isOpen={showDesignUpload}
            onClose={() => setShowDesignUpload(false)}
            task={designTask}
            onUploadComplete={() => {
              fetchData();
              api.updateOrderStatus(order.order_id, OrderStatus.DESIGN_PENDING_APPROVAL);
              setShowDesignUpload(false);
            }}
          />
        )}

        {showDesignPreview && designTask && (
          <DesignPreviewModal
            isOpen={showDesignPreview}
            onClose={() => setShowDesignPreview(false)}
            task={designTask}
            onStatusChange={(newStatus) => {
                fetchData();
                setShowDesignPreview(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;