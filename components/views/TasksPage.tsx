import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

const TasksPage: React.FC = () => {
  const { currentUser, users } = useAppContext();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const orders = await api.getOrders();
      const allTasks = orders.flatMap(order => order.tasks);
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const userTasks = tasks.filter(task => 
    task.assigned_to === currentUser?.user_id && 
    (filterStatus === 'ALL' || task.status === filterStatus)
  );

  const getTaskStatusConfig = (status: TaskStatus) => {
    const configs = {
      [TaskStatus.PENDING]: { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: 'pending',
        gradient: 'from-yellow-500 to-yellow-600'
      },
      [TaskStatus.ACCEPTED]: { 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: 'check-circle',
        gradient: 'from-blue-500 to-blue-600'
      },
      [TaskStatus.REJECTED]: { 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: 'close',
        gradient: 'from-red-500 to-red-600'
      },
      [TaskStatus.COMPLETED]: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: 'verified',
        gradient: 'from-green-500 to-green-600'
      },
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'help', gradient: 'from-gray-500 to-gray-600' };
  };

  if (loading) {
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Mes Tâches</h1>
          <p className="text-slate-600 text-lg">Gestion des tâches assignées</p>
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
          className="bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ALL">Tous les statuts</option>
          <option value={TaskStatus.PENDING}>En attente</option>
          <option value={TaskStatus.ACCEPTED}>Accepté</option>
          <option value={TaskStatus.COMPLETED}>Terminé</option>
          <option value={TaskStatus.REJECTED}>Rejeté</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="text-slate-600 font-medium">
                {userTasks.length} tâche{userTasks.length !== 1 ? 's' : ''} trouvée{userTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userTasks.map(task => {
              const assigner = users.find(u => u.user_id === task.assigned_by);
              const statusConfig = getTaskStatusConfig(task.status);
              
              return (
                <div key={task.task_id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-slate-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-xl bg-gradient-to-br ${statusConfig.gradient}`}>
                        <Icon name={statusConfig.icon} className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{task.step_name}</h3>
                        <p className="text-slate-600 text-sm">Assigné par {assigner ? `${assigner.first_name} ${assigner.last_name}` : 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {task.estimated_hours && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Icon name="schedule" className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-slate-600 block text-xs">Estimé</span>
                            <span className="text-slate-800 font-medium">{task.estimated_hours}h</span>
                          </div>
                        </div>
                      )}

                      {task.actual_hours && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <Icon name="timer" className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <span className="text-slate-600 block text-xs">Réel</span>
                            <span className="text-slate-800 font-medium">{task.actual_hours}h</span>
                          </div>
                        </div>
                      )}

                      {task.start_date && (
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Icon name="calendar" className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-slate-600 block text-xs">Début</span>
                            <span className="text-slate-800 font-medium text-xs">
                              {new Date(task.start_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {task.comments && (
                      <div className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-700">{task.comments}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4 border-t border-slate-200">
                      {task.status === TaskStatus.PENDING && (
                        <>
                          <button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-green-500/25">
                            <Icon name="check" className="h-4 w-4" />
                            <span>Accepter</span>
                          </button>
                          <button className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-red-500/25">
                            <Icon name="close" className="h-4 w-4" />
                            <span>Rejeter</span>
                          </button>
                        </>
                      )}
                      
                      {task.status === TaskStatus.ACCEPTED && (
                        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25">
                          <Icon name="verified" className="h-4 w-4" />
                          <span>Marquer comme Terminé</span>
                        </button>
                      )}
                    </div>
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
                <span className="text-blue-100">Total tâches</span>
                <span className="text-xl font-bold">{userTasks.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">En attente</span>
                <span className="text-xl font-bold">
                  {userTasks.filter(t => t.status === TaskStatus.PENDING).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">En cours</span>
                <span className="text-xl font-bold">
                  {userTasks.filter(t => t.status === TaskStatus.ACCEPTED).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Terminées</span>
                <span className="text-xl font-bold">
                  {userTasks.filter(t => t.status === TaskStatus.COMPLETED).length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center space-x-2">
              <Icon name="filter-list" className="h-5 w-5 text-slate-600" />
              <span>Filtres Rapides</span>
            </h3>
            <div className="space-y-2">
              {[
                { status: 'ALL' as const, label: 'Toutes', count: userTasks.length },
                { status: TaskStatus.PENDING, label: 'En attente', count: userTasks.filter(t => t.status === TaskStatus.PENDING).length },
                { status: TaskStatus.ACCEPTED, label: 'Acceptées', count: userTasks.filter(t => t.status === TaskStatus.ACCEPTED).length },
                { status: TaskStatus.COMPLETED, label: 'Terminées', count: userTasks.filter(t => t.status === TaskStatus.COMPLETED).length },
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

      {userTasks.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon name="assignment" className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-3">Aucune tâche trouvée</h3>
          <p className="text-slate-600 text-lg max-w-md mx-auto mb-6">
            {filterStatus !== 'ALL' 
              ? "Aucune tâche ne correspond à vos critères de filtrage."
              : "Vous n'avez aucune tâche assignée pour le moment."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default TasksPage;