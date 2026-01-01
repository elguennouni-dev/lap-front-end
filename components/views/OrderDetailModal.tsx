import React, { useState, useEffect, useCallback } from 'react';
import { Order, UserRole, OrderStatus, TaskStatus, TaskType } from '../../types';
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
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignee, setAssignee] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  const [showDesignUpload, setShowDesignUpload] = useState(false);
  const [showDesignPreview, setShowDesignPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'tasks'>('overview');

  const [zoomLevel, setZoomLevel] = useState(1);

  const designers = users.filter(u => u.role === UserRole.DESIGNER);
  const imprimeurs = users.filter(u => u.role === UserRole.IMPRIMEUR);
  const livreurs = users.filter(u => u.role === UserRole.LOGISTIQUE);

  const findTask = (type: TaskType) => {
    return order?.tasks?.find(t => t.type === type) || null;
  };

  const getStatusConfig = (status: OrderStatus) => {
    const configs = {
      [OrderStatus.CREEE]: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: 'add-circle', badge: 'Nouveau', gradient: 'from-blue-500 to-blue-600' },
      [OrderStatus.EN_DESIGN]: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: 'design', badge: 'Design en Cours', gradient: 'from-purple-500 to-purple-600' },
      [OrderStatus.EN_IMPRESSION]: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: 'print', badge: 'En Impression', gradient: 'from-indigo-500 to-indigo-600' },
      [OrderStatus.IMPRESSION_VALIDE]: { color: 'bg-teal-100 text-teal-700 border-teal-200', icon: 'check-circle', badge: 'Design Validé', gradient: 'from-teal-500 to-teal-600' },
      [OrderStatus.EN_LIVRAISON]: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: 'delivery', badge: 'En Livraison', gradient: 'from-orange-500 to-orange-600' },
      [OrderStatus.LIVRAISON_VALIDE]: { color: 'bg-green-100 text-green-700 border-green-200', icon: 'verified', badge: 'Prêt pour Stock', gradient: 'from-green-500 to-green-600' },
      [OrderStatus.TERMINEE_STOCK]: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: 'inventory', badge: 'Terminé', gradient: 'from-gray-600 to-gray-700' },
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-700', icon: 'dashboard', badge: status, gradient: 'from-gray-500' };
  };

  const getTaskStatusConfig = (status: TaskStatus) => {
    const configs = {
      [TaskStatus.ASSIGNEE]: { color: 'bg-yellow-100 text-yellow-700', icon: 'pending' },
      [TaskStatus.EN_COURS]: { color: 'bg-blue-100 text-blue-700', icon: 'timelapse' },
      [TaskStatus.TERMINEE]: { color: 'bg-purple-100 text-purple-700', icon: 'check-circle' },
      [TaskStatus.VALIDEE]: { color: 'bg-green-100 text-green-700', icon: 'verified' },
      [TaskStatus.REJETEE]: { color: 'bg-red-100 text-red-700', icon: 'cancel' },
    };
    return configs[status] || { color: 'bg-gray-100', icon: 'help' };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedOrder = await api.getOrder(orderId);
      if (fetchedOrder) {
        if (!fetchedOrder.tasks) fetchedOrder.tasks = [];
        setOrder(fetchedOrder);
      }
    } catch (error) {
      console.error("Échec de la récupération des détails de la commande", error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (action: () => Promise<any>, successMessage: string, closeOnSuccess: boolean = false) => {
    setActionLoading(true);
    try {
      await action();
      await fetchData();
      setShowSuccess(successMessage);
      setAssignee('');
      if (closeOnSuccess) {
        setTimeout(() => {
          onClose(order || undefined);
        }, 1500);
      } else {
        setTimeout(() => setShowSuccess(null), 2000);
      }
    } catch (error) {
      console.error("Échec de l'action:", error);
      alert("Une erreur est survenue lors de l'action.");
      setShowSuccess(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompleteSimpleTask = async (task: any) => {
    if (!task.id || !task.order?.id) return;
    setActionLoading(true);
    try {
      await api.completeTaskSimple(task.id);
      const completedAt = new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'medium' });
      const receiptHtml = `
            <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #ccc; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #1e40af; font-size: 24px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 20px;">
                    RÉCEPTION DE TERMINAISON DE TÂCHE
                </h1>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="padding: 5px; font-weight: bold; width: 40%; color: #4b5563;">ID Commande:</td>
                        <td style="padding: 5px; width: 60%; color: #1f2937;">#${task.order.id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; font-weight: bold; color: #4b5563;">Propriété:</td>
                        <td style="padding: 5px; color: #1f2937;">${task.order.nomPropriete || 'Inconnu'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; font-weight: bold; color: #4b5563;">Type de Travaux:</td>
                        <td style="padding: 5px; color: #1f2937;">${task.order.typeTravaux}</td>
                    </tr>
                </table>
                <h2 style="font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; color: #1f2937;">Détails de la Tâche</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px; font-weight: bold; width: 40%; color: #4b5563;">Type de Tâche:</td>
                        <td style="padding: 5px; color: #1f2937;">${task.type}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; font-weight: bold; color: #4b5563;">ID Tâche:</td>
                        <td style="padding: 5px; color: #1f2937;">#${task.id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px; font-weight: bold; color: #4b5563;">Assigné à:</td>
                        <td style="padding: 5px; color: #1f2937;">${currentUser?.username || 'N/A'}</td>
                    </tr>
                </table>
                <div style="margin-top: 30px; border-top: 2px solid #10b981; padding-top: 15px;">
                    <p style="font-weight: bold; color: #10b981;">Statut de Validation:</p>
                    <p style="margin-top: 5px;">La tâche a été marquée comme terminée avec succès.</p>
                    <p style="margin-top: 10px; font-size: 14px; color: #4b5563;">
                        Date et Heure: ${completedAt}
                    </p>
                </div>
            </div>
        `;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Reçu_Tâche_Commande_' + task.order.id + '</title>');
        printWindow.document.write('<style>@media print { @page { size: A4; margin: 15mm; } }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(receiptHtml);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        throw new Error("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les pop-ups.");
      }
      await fetchData();
      setShowSuccess(`Tâche ${task.type} marquée comme terminée. Reçu PDF généré.`);
      setTimeout(() => setShowSuccess(null), 3000);
    } catch (error) {
      console.error("Échec de l'action:", error);
      alert("Une erreur est survenue lors de la mise à jour du statut.");
      setShowSuccess(null);
    } finally {
      setActionLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!order) return null;
    const config = getStatusConfig(order.etat);
    const designTask = findTask(TaskType.DESIGN);

    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-2xl bg-gradient-to-r ${config.gradient} text-white shadow-lg`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/80 text-sm font-medium">Statut Actuel</p>
              <h3 className="text-2xl font-bold mt-1">{config.badge}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
              <Icon name={config.icon} className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Propriété</span>
                <p className="text-slate-800 font-semibold mt-1">{order.nomPropriete || 'N/A'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Type de Travaux</span>
                <p className="text-slate-800 font-semibold mt-1">{order.typeTravaux || 'N/A'}</p>
              </div>
            </div>

            {/* نظام معاينة الصورة المطور */}
            {designTask?.designUrl && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <Icon name="image" className="h-4 w-4 text-blue-500" />
                    Aperçu du Design
                  </h4>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))} 
                      className="p-1.5 hover:bg-white rounded-md border border-slate-200 shadow-sm transition-all"
                      title="Zoom Out"
                    >
                      <Icon name="zoom_out" className="h-4 w-4 text-slate-600" />
                    </button>
                    <span className="text-xs font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button 
                      onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.2))} 
                      className="p-1.5 hover:bg-white rounded-md border border-slate-200 shadow-sm transition-all"
                      title="Zoom In"
                    >
                      <Icon name="zoom_in" className="h-4 w-4 text-slate-600" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 mx-1" />
                    <button 
                      onClick={() => handleDownload(designTask.designUrl!, `Design_Order_${order.id}`)}
                      className="p-1.5 hover:bg-blue-50 rounded-md border border-slate-200 shadow-sm transition-all group"
                      title="Download"
                    >
                      <Icon name="download" className="h-4 w-4 text-slate-600 group-hover:text-blue-600" />
                    </button>
                    <button 
                      onClick={() => setShowDesignPreview(true)} 
                      className="p-1.5 hover:bg-blue-600 bg-blue-500 rounded-md shadow-sm transition-all group"
                      title="Full Screen"
                    >
                      <Icon name="fullscreen" className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="relative h-[400px] bg-slate-100 overflow-auto flex items-center justify-center cursor-move p-4">
                  <img 
                    src={designTask.designUrl} 
                    alt="Design Preview" 
                    className="transition-transform duration-200 ease-out shadow-lg max-w-none"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />
                </div>
                <div className="p-2 bg-slate-50 text-[10px] text-center text-slate-400 italic">
                  Utilisez les boutons en haut pour zoomer ou voir en plein écran.
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Icon name="history" className="h-4 w-4 text-slate-500" />
                  Chronologie
                </h4>
                <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                   {order.tasks?.map((t) => (
                     <div key={t.id} className="relative pl-8">
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-slate-50 flex items-center justify-center ${t.status === TaskStatus.VALIDEE ? 'bg-green-500' : 'bg-slate-300'}`}>
                           {t.status === TaskStatus.VALIDEE && <Icon name="check" className="h-3 w-3 text-white" />}
                        </div>
                        <p className="text-xs font-bold text-slate-700">{t.type}</p>
                        <p className="text-[10px] text-slate-500">{t.status}</p>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsTab = () => {
    if (!order) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Icon name="inventory" className="h-4 w-4 text-blue-600" />
            Spécifications
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Dimensions</span>
              <span className="font-medium text-slate-800">{order.dimensions || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-slate-500">Matière</span>
              <span className="font-medium text-slate-800">{order.matiere || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
            <Icon name="description" className="h-4 w-4 text-blue-600" />
            Notes
          </h4>
          <div className="p-4 bg-slate-50 rounded-xl text-slate-600 text-sm italic min-h-[100px]">
            {order.description || "Aucune note particulière pour cette commande."}
          </div>
        </div>
      </div>
    );
  };

  const renderTasksTab = () => {
    if (!order?.tasks || order.tasks.length === 0) {
      return (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Icon name="assignment_late" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Aucune tâche assignée pour le moment.</p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {order.tasks.map((t) => {
          const config = getTaskStatusConfig(t.status);
          return (
            <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon name={config.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-800">{t.type}</h5>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Icon name="person" className="h-3 w-3" />
                    {t.assignee?.username || 'Non assigné'}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.color}`}>
                {t.status}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderActions = () => {
    if (!order || !currentUser) return null;
    const isAdmin = currentUser.role === UserRole.ADMINISTRATEUR;
    const isDesigner = currentUser.role === UserRole.DESIGNER;
    const isPrinter = currentUser.role === UserRole.IMPRIMEUR;
    const isDriver = currentUser.role === UserRole.LOGISTIQUE;

    const renderActionButton = (onClick: () => void, label: string, iconName: string, colorClass: string, disabled: boolean = false) => (
      <button
        disabled={disabled || actionLoading}
        onClick={onClick}
        className={`w-full ${colorClass} text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50`}
      >
        {actionLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <Icon name={iconName} className="h-5 w-5" />
        )}
        <span>{actionLoading ? "En cours..." : label}</span>
      </button>
    );

    if (order.etat === OrderStatus.CREEE && isAdmin) {
      return (
        <div className="bg-white border-t border-slate-200 p-6">
          <label className="text-sm font-medium text-slate-800 block mb-2">Assigner le Design</label>
          <div className="flex gap-2">
            <select
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3"
            >
              <option value="">Sélectionner un designer</option>
              {designers.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
            </select>
            {renderActionButton(
              () => handleAction(
                () => api.assignTask(order.id, parseInt(assignee), TaskType.DESIGN),
                `Tâche Design assignée à ${users.find(u => u.id === parseInt(assignee))?.username}`,
                false
              ),
              'Assigner',
              'assignment',
              'bg-blue-600 hover:bg-blue-700',
              !assignee
            )}
          </div>
        </div>
      );
    }

    if (order.etat === OrderStatus.EN_DESIGN) {
      const currentTask = findTask(TaskType.DESIGN);
      if (isDesigner && currentTask?.assignee?.id === currentUser.id && currentTask.status !== TaskStatus.TERMINEE) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            {renderActionButton(() => setShowDesignUpload(true), 'Uploader la Maquette', 'cloud-upload', 'bg-blue-600 hover:bg-blue-700')}
          </div>
        );
      }
      if (isAdmin && currentTask?.status === TaskStatus.TERMINEE) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            {renderActionButton(() => setShowDesignPreview(true), 'Vérifier & Valider Design', 'visibility', 'bg-purple-600 hover:bg-purple-700')}
          </div>
        );
      }
    }

    if (order.etat === OrderStatus.IMPRESSION_VALIDE) {
      const printTask = findTask(TaskType.IMPRESSION);
      if (!printTask && isAdmin) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            <label className="text-sm font-medium text-slate-800 block mb-2">Assigner l'Impression</label>
            <div className="flex gap-2">
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value="">Sélectionner un imprimeur</option>
                {imprimeurs.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
              </select>
              {renderActionButton(
                () => handleAction(
                  () => api.assignTask(order.id, parseInt(assignee), TaskType.IMPRESSION),
                  `Tâche Impression assignée à ${users.find(u => u.id === parseInt(assignee))?.username}`,
                  false
                ),
                'Assigner',
                'assignment',
                'bg-indigo-600 hover:bg-indigo-700',
                !assignee
              )}
            </div>
          </div>
        );
      }
    }

    if (order.etat === OrderStatus.EN_IMPRESSION) {
      const printTask = findTask(TaskType.IMPRESSION);
      if (printTask && isPrinter && printTask.assignee?.id === currentUser.id && printTask.status !== TaskStatus.TERMINEE) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            {renderActionButton(() => handleCompleteSimpleTask(printTask), 'Marquer comme Imprimé', 'check', 'bg-indigo-600 hover:bg-indigo-700')}
          </div>
        );
      }
      if (printTask && isAdmin && printTask.status === TaskStatus.TERMINEE) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            {renderActionButton(() => setShowDesignPreview(true), 'Vérifier & Valider Impression', 'check-circle', 'bg-teal-600 hover:bg-teal-700')}
          </div>
        );
      }
    }

    if (order.etat === OrderStatus.LIVRAISON_VALIDE) {
      const deliveryTask = findTask(TaskType.LIVRAISON);
      if (!deliveryTask && isAdmin) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            <label className="text-sm font-medium text-slate-800 block mb-2">Assigner la Livraison</label>
            <div className="flex gap-2">
              <select
                value={assignee}
                onChange={e => setAssignee(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value="">Sélectionner un livreur</option>
                {livreurs.map(d => <option key={d.id} value={d.id}>{d.username}</option>)}
              </select>
              {renderActionButton(
                () => handleAction(
                  () => api.assignTask(order.id, parseInt(assignee), TaskType.LIVRAISON),
                  `Tâche Livraison assignée à ${users.find(u => u.id === parseInt(assignee))?.username}`,
                  false
                ),
                'Assigner',
                'assignment',
                'bg-orange-600 hover:bg-orange-700',
                !assignee
              )}
            </div>
          </div>
        );
      }
    }

    if (order.etat === OrderStatus.EN_LIVRAISON) {
      const deliveryTask = findTask(TaskType.LIVRAISON);
      if (deliveryTask && isDriver && deliveryTask.assignee?.id === currentUser.id && deliveryTask.status !== TaskStatus.TERMINEE) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            {renderActionButton(() => handleCompleteSimpleTask(deliveryTask), 'Marquer comme Livré', 'check', 'bg-orange-600 hover:bg-orange-700')}
          </div>
        );
      }
      if (deliveryTask && isAdmin && deliveryTask.status === TaskStatus.TERMINEE) {
        return (
          <div className="bg-white border-t border-slate-200 p-6">
            {renderActionButton(() => setShowDesignPreview(true), 'Valider la Livraison', 'verified', 'bg-green-600 hover:bg-green-700')}
          </div>
        );
      }
    }

    if (order.etat === OrderStatus.LIVRAISON_VALIDE && isAdmin) {
      return (
        <div className="bg-white border-t border-slate-200 p-6">
          {renderActionButton(
            () => handleAction(() => api.moveOrderToStock(order.id), 'Commande terminée et déplacée vers le stock.', true),
            'Déplacer vers Stock (Terminer)', 'inventory', 'bg-black hover:bg-gray-800'
          )}
        </div>
      );
    }
    return null;
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

  if (!order) return null;

  let activeTask = null;
  if (order.etat === OrderStatus.EN_DESIGN) activeTask = findTask(TaskType.DESIGN);
  else if (order.etat === OrderStatus.EN_IMPRESSION) activeTask = findTask(TaskType.IMPRESSION);
  else if (order.etat === OrderStatus.EN_LIVRAISON) activeTask = findTask(TaskType.LIVRAISON);

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => onClose(order)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl font-bold text-slate-800">Commande #{order.id}</h2>
                 <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">PROPRIÉTÉ: {order.nomPropriete || 'N/A'}</span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Gestion et suivi de la production en temps réel</p>
            </div>
            <button
              onClick={() => onClose(order)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>
        </div>
        {showSuccess && (
          <div className="bg-green-500 text-white p-3 flex items-center justify-center space-x-2 animate-slide-down">
            <Icon name="check-circle" className="h-5 w-5" />
            <span className="font-medium">{showSuccess}</span>
          </div>
        )}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="px-6 flex space-x-6">
            {[
              { id: 'overview', label: 'Tableau de bord', icon: 'dashboard' },
              { id: 'details', label: 'Spécifications', icon: 'inventory' },
              { id: 'tasks', label: 'Tâches & Flux', icon: 'assignment' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-all text-sm font-medium ${activeTab === tab.id
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
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'tasks' && renderTasksTab()}
          </div>
          {actionLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-3"></div>
                <p className="font-semibold text-slate-700">Mise à jour...</p>
              </div>
            </div>
          )}
        </div>
        {renderActions()}
        {showDesignUpload && activeTask && (
          <DesignUploadModal
            isOpen={showDesignUpload}
            onClose={() => setShowDesignUpload(false)}
            task={activeTask}
            onUploadComplete={() => {
              fetchData();
              setShowDesignUpload(false);
            }}
          />
        )}
        {showDesignPreview && activeTask && (
          <DesignPreviewModal
            isOpen={showDesignPreview}
            onClose={() => setShowDesignPreview(false)}
            task={activeTask}
            onStatusChange={() => {
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