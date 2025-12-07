import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, Order } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

// Helper type to include Order context with the Task
type TaskWithContext = Task & { order: Order };

const TasksPage: React.FC = () => {
  const { currentUser, users } = useAppContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const ordersData = await api.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusUpdate = async (orderId: number, taskId: number, newStatus: TaskStatus) => {
    setProcessingId(taskId);
    try {
      await api.updateTaskStatus(orderId, taskId, newStatus);
      await fetchTasks(); // Refresh data to update UI
    } catch (error) {
      console.error('Failed to update task status', error);
      alert("Impossible de mettre à jour le statut. Veuillez réessayer.");
    } finally {
      setProcessingId(null);
    }
  };

  // Derive all tasks assigned to the current user with Order Context
  const allUserTasks: TaskWithContext[] = orders.flatMap(order => 
    order.tasks
      .filter(task => task.assigned_to === currentUser?.user_id)
      .map(task => ({ ...task, order }))
  );

  const filteredTasks = allUserTasks.filter(task => 
    filterStatus === 'ALL' || task.status === filterStatus
  );

  const getTaskStatusConfig = (status: TaskStatus) => {
    const configs = {
      [TaskStatus.PENDING]: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: 'pending',
        gradient: 'from-yellow-500 to-yellow-600',
        label: 'En attente'
      },
      [TaskStatus.ACCEPTED]: { 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: 'check-circle',
        gradient: 'from-blue-500 to-blue-600',
        label: 'En cours'
      },
      [TaskStatus.REJECTED]: { 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: 'close',
        gradient: 'from-red-500 to-red-600',
        label: 'Rejetée'
      },
      [TaskStatus.COMPLETED]: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: 'verified',
        gradient: 'from-green-500 to-green-600',
        label: 'Terminée'
      },
    };
    return configs[status] || { 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: 'dashboard', 
        gradient: 'from-gray-500 to-gray-600',
        label: status 
    };
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 text-lg">Chargement des tâches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Mes Tâches</h1>
          <p className="text-slate-600 text-lg">Gérez votre charge de travail et vos priorités</p>
        </div>
        
        <div className="flex items-center space-x-4 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <span className="pl-3 text-slate-500 font-medium hidden sm:block">Filtrer par:</span>
           <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
            className="bg-transparent py-2 pl-2 pr-8 text-slate-800 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value={TaskStatus.PENDING}>En attente</option>
            <option value={TaskStatus.ACCEPTED}>En cours</option>
            <option value={TaskStatus.COMPLETED}>Terminées</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Task List */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between">
             <h2 className="font-bold text-slate-800 text-lg">Liste des tâches</h2>
             <div className="text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-lg text-sm">
                {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTasks.map(task => {
              const assigner = users.find(u => u.user_id === task.assigned_by);
              const statusConfig = getTaskStatusConfig(task.status);
              const isProcessing = processingId === task.task_id;
              
              return (
                <div key={task.task_id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-200 flex flex-col h-full">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-md`}>
                        <Icon name={statusConfig.icon} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{task.step_name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {task.order.order_number}
                            </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="space-y-4 flex-1">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Assigné par</span>
                                <span className="text-slate-700 font-medium">
                                    {assigner ? `${assigner.first_name} ${assigner.last_name}` : 'Système'}
                                </span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date</span>
                                <span className="text-slate-700 font-medium">
                                    {new Date(task.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {task.start_date && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Icon name="calendar" className="h-4 w-4 text-purple-500" />
                          <span className="text-slate-600">Début: <strong>{new Date(task.start_date).toLocaleDateString('fr-FR')}</strong></span>
                        </div>
                    )}

                    {task.comments && (
                      <div className="text-sm text-slate-600 italic bg-amber-50 p-3 rounded-lg border border-amber-100">
                        "{task.comments}"
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    {task.status === TaskStatus.PENDING && (
                      <button 
                          disabled={isProcessing}
                          onClick={() => handleStatusUpdate(task.order.order_id, task.task_id, TaskStatus.ACCEPTED)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-green-200"
                      >
                          {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Icon name="check" className="h-4 w-4" />}
                          <span>Accepter</span>
                      </button>
                    )}
                    
                    {task.status === TaskStatus.ACCEPTED && (
                      <button 
                        disabled={isProcessing}
                        onClick={() => handleStatusUpdate(task.order.order_id, task.task_id, TaskStatus.COMPLETED)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md shadow-blue-200"
                      >
                        {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Icon name="verified" className="h-4 w-4" />}
                        <span>Marquer comme Terminé</span>
                      </button>
                    )}

                    {task.status === TaskStatus.COMPLETED && (
                        <div className="text-center text-xs text-slate-400 font-medium py-2 flex items-center justify-center space-x-2">
                            <Icon name="verified" className="h-4 w-4 text-green-500" />
                            <span>Tâche terminée</span>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredTasks.length === 0 && (
                <div className="col-span-1 lg:col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name="assignment" className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune tâche trouvée</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">
                    {filterStatus !== 'ALL' 
                      ? "Essayez de modifier vos filtres pour voir plus de résultats."
                      : "Bonne nouvelle ! Vous n'avez aucune tâche assignée pour le moment."
                    }
                  </p>
                </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Stats */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                <Icon name="analytics" className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold">Vue d'ensemble</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <span className="text-blue-100 text-sm font-medium">Total tâches</span>
                <span className="text-xl font-bold">{allUserTasks.length}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-2xl font-bold mb-1">{allUserTasks.filter(t => t.status === TaskStatus.PENDING).length}</div>
                    <div className="text-xs text-blue-200 font-medium">En attente</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-2xl font-bold mb-1">{allUserTasks.filter(t => t.status === TaskStatus.ACCEPTED).length}</div>
                    <div className="text-xs text-blue-200 font-medium">En cours</div>
                  </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                 <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-200 uppercase font-semibold tracking-wider">Terminées</span>
                    <span className="text-lg font-bold text-green-300">
                        {allUserTasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                    </span>
                 </div>
                 {/* Progress Bar */}
                 <div className="mt-2 w-full bg-black/20 rounded-full h-1.5">
                    <div 
                        className="bg-green-400 h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${allUserTasks.length > 0 ? (allUserTasks.filter(t => t.status === TaskStatus.COMPLETED).length / allUserTasks.length) * 100 : 0}%` }}
                    />
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2 text-sm uppercase tracking-wide">
              <Icon name="filter-list" className="h-4 w-4 text-slate-500" />
              <span>Filtres Rapides</span>
            </h3>
            <div className="space-y-2">
              {[
                { status: 'ALL' as const, label: 'Toutes les tâches', count: allUserTasks.length },
                { status: TaskStatus.PENDING, label: 'À traiter (En attente)', count: allUserTasks.filter(t => t.status === TaskStatus.PENDING).length },
                { status: TaskStatus.ACCEPTED, label: 'En cours de traitement', count: allUserTasks.filter(t => t.status === TaskStatus.ACCEPTED).length },
                { status: TaskStatus.COMPLETED, label: 'Terminées', count: allUserTasks.filter(t => t.status === TaskStatus.COMPLETED).length },
              ].map(item => (
                <button
                  key={item.status}
                  onClick={() => setFilterStatus(item.status)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-sm ${
                    filterStatus === item.status 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold shadow-sm' 
                      : 'hover:bg-slate-50 text-slate-600 font-medium'
                  }`}
                >
                  <span>{item.label}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs ${
                    filterStatus === item.status 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;