import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus, Order, UserRole, TaskType } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import DesignUploadModal from '../modals/DesignUploadModal';
import DesignPreviewModal from '../modals/DesignPreviewModal';

const createReceiptContent = (task: Task) => {
    const taskTypeLabel = task.type === TaskType.IMPRESSION ? "Impression" : "Livraison";
    const completedAt = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' });

    return `
        REÇU DE TERMINAISON DE TÂCHE

        Détails de la Commande:
        ID Commande: #${task.order?.id || 'N/A'}
        Propriété: ${task.order?.nomPropriete || 'Inconnu'}
        Type de Travaux: ${task.order?.typeTravaux || 'N/A'}

        Détails de la Tâche:
        Type: ${taskTypeLabel}
        ID Tâche: #${task.id}
        Assigné à: ${task.assignee?.username || 'N/A'}
        Statut: Terminé

        Validation:
        Heure de Complétion: ${completedAt}
        Opérateur: ${task.assignee?.username || 'N/A'}

        Ceci confirme que la tâche de ${taskTypeLabel} pour la commande #${task.order?.id} a été complétée avec succès.
        `;
        };

const TasksPage: React.FC = () => {
    const { currentUser } = useAppContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
    
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const fetchTasks = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const orders = await api.getOrders();
            let derivedTasks: Task[] = [];

            orders.forEach(o => {
                (o.tasks || []).forEach(t => {
                    const isAssignedToMe = t.assignee && t.assignee.id === currentUser.id;
                    const isAdmin = currentUser.role === UserRole.ADMINISTRATEUR;

                    if (isAdmin || isAssignedToMe) {
                        derivedTasks.push({ ...t, order: o });
                    }
                });
            });

            derivedTasks.sort((a, b) => {
                const statusA = a.status === TaskStatus.ASSIGNEE || a.status === TaskStatus.REJETEE ? 0 : 1;
                const statusB = b.status === TaskStatus.ASSIGNEE || b.status === TaskStatus.REJETEE ? 0 : 1;
                if (statusA !== statusB) return statusA - statusB;
                
                return (b.id || 0) - (a.id || 0); 
            });


            setTasks(derivedTasks);
        } catch (error) {
            console.error('Échec de la récupération des tâches', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCompleteTask = async (task: Task) => {
        if (!currentUser || !task.id || !task.order?.id) return;

        setActionLoadingId(task.id);
        try {
            
            if (currentUser.role === UserRole.DESIGNER) {
                 alert("Pour la conception, veuillez ouvrir les détails de la tâche pour télécharger le fichier.");
                 setSelectedTask(task);
                 return;
            }
            
            if (currentUser.role === UserRole.IMPRIMEUR || currentUser.role === UserRole.LOGISTIQUE) {
                 await api.completeTaskSimple(task.id);
                 
                 const receiptContent = createReceiptContent(task);
                 const blob = new Blob([receiptContent], { type: 'text/plain' });
                 const url = URL.createObjectURL(blob);
                 const a = document.createElement('a');
                 a.href = url;
                 a.download = `Recu_Tache_${task.type}_Commande_${task.order.id}.txt`;
                 document.body.appendChild(a);
                 a.click();
                 document.body.removeChild(a);
                 URL.revokeObjectURL(url);


                 alert(`Tâche #${task.id} marquée comme terminée. Reçu téléchargé.`);
            }
            
            await fetchTasks();
            
        } catch (error) {
            console.error("Échec de la complétion de la tâche:", error);
            alert("Erreur lors de la mise à jour du statut.");
        } finally {
            setActionLoadingId(null);
        }
    };
    
    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
    };

    const filteredTasks = tasks.filter(task => 
        filterStatus === 'ALL' || task.status === filterStatus
    );

    const getTaskStatusConfig = (status: TaskStatus) => {
        const configs = {
            [TaskStatus.ASSIGNEE]: { color: 'bg-yellow-100 text-yellow-700', icon: 'pending', label: 'Assignée' },
            [TaskStatus.EN_COURS]: { color: 'bg-blue-100 text-blue-700', icon: 'timelapse', label: 'En cours' },
            [TaskStatus.REJETEE]: { color: 'bg-red-100 text-red-700', icon: 'close', label: 'Rejetée' },
            [TaskStatus.TERMINEE]: { color: 'bg-purple-100 text-purple-700', icon: 'check-circle', label: 'Terminée' },
            [TaskStatus.VALIDEE]: { color: 'bg-green-100 text-green-700', icon: 'verified', label: 'Validée' },
        };
        return configs[status] || { color: 'bg-gray-100', icon: 'help', label: status };
    };

    const isAssignedToCurrentUser = (task: Task) => task.assignee?.id === currentUser?.id;
    
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {currentUser?.role === UserRole.ADMINISTRATEUR ? 'Toutes les Tâches' : 'Mes Tâches'}
                    </h1>
                    <p className="text-slate-600">
                        {currentUser?.role === UserRole.ADMINISTRATEUR 
                            ? 'Vue globale de la production' 
                            : 'Gérez votre charge de travail'}
                    </p>
                </div>
                
                <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center">
                    <span className="pl-3 text-slate-500 font-medium text-sm">Filtrer:</span>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'ALL')}
                        className="bg-transparent py-2 pl-2 pr-8 text-slate-800 font-medium focus:outline-none text-sm cursor-pointer"
                    >
                        <option value="ALL">Tout</option>
                        <option value={TaskStatus.ASSIGNEE}>Assignée</option>
                        <option value={TaskStatus.EN_COURS}>En cours</option>
                        <option value={TaskStatus.TERMINEE}>Terminée</option>
                        <option value={TaskStatus.VALIDEE}>Validée</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => {
                        const statusConfig = getTaskStatusConfig(task.status);
                        const isPending = task.status === TaskStatus.ASSIGNEE || task.status === TaskStatus.REJETEE;
                        const canComplete = isAssignedToCurrentUser(task) && isPending;
                        const isLoading = actionLoadingId === task.id;

                        return (
                            <div 
                                key={task.id} 
                                onClick={() => handleTaskClick(task)}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all flex flex-col cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                                            <Icon name={statusConfig.icon} className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{task.type}</h3>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit mt-1">
                                                    #{task.id}
                                                </span>
                                                {currentUser?.role === UserRole.ADMINISTRATEUR && task.assignee && (
                                                    <span className="text-xs text-blue-600 mt-1">
                                                        Assigné à: {task.assignee.username}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs text-slate-500 uppercase font-semibold">Commande</p>
                                        <p className="text-slate-800 font-medium truncate">
                                            {task.order?.nomPropriete || "Client Inconnu"}
                                        </p>
                                    </div>
                                    
                                    {task.uploadFile && (
                                        <div className="flex items-center space-x-2 text-blue-600 text-sm bg-blue-50 p-2 rounded-lg">
                                            <Icon name="attachment" className="h-4 w-4" />
                                            <span>Fichier joint disponible</span>
                                        </div>
                                    )}
                                </div>
                                
                                {canComplete && (
                                    <div className="mt-6 pt-4 border-t border-slate-100">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCompleteTask(task);
                                            }}
                                            disabled={isLoading}
                                            className={`w-full font-semibold py-2.5 px-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 text-sm ${
                                                task.type === TaskType.DESIGN 
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                            }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                    <span>En cours...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Icon name={task.type === TaskType.DESIGN ? 'cloud-upload' : 'check'} className="h-5 w-5" />
                                                    <span>
                                                        {task.type === TaskType.DESIGN ? 'Détails / Téléchargement' : 'Marquer comme terminée'}
                                                    </span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <Icon name="assignment" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Aucune tâche trouvée</p>
                    </div>
                )}
            </div>
            
            {selectedTask && selectedTask.order && (
                (isAssignedToCurrentUser(selectedTask) && selectedTask.type === TaskType.DESIGN && (selectedTask.status === TaskStatus.ASSIGNEE || selectedTask.status === TaskStatus.REJETEE)) ? (
                    <DesignUploadModal
                        isOpen={true}
                        onClose={() => setSelectedTask(null)}
                        task={selectedTask}
                        onUploadComplete={() => {
                            fetchTasks();
                            setSelectedTask(null);
                        }}
                    />
                ) : (
                    <DesignPreviewModal
                        isOpen={true}
                        onClose={() => setSelectedTask(null)}
                        task={selectedTask}
                        onStatusChange={() => {
                            fetchTasks();
                            setSelectedTask(null);
                        }}
                    />
                )
            )}
        </div>
    );
};

export default TasksPage;