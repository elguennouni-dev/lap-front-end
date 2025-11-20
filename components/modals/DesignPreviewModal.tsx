// components/modals/DesignPreviewModal.tsx
import React, { useState } from 'react';
import { Task, FileAttachment } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';

interface DesignPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onStatusChange: () => void;
}

const DesignPreviewModal: React.FC<DesignPreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onStatusChange 
}) => {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const designFiles = task.design_files || [];

  const handleApprove = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await api.updateOrderStatus(task.order_id, 'DESIGN_APPROVED');
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Failed to approve design', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      await api.updateOrderStatus(task.order_id, 'DESIGN_ASSIGNED');
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Failed to reject design', error);
    } finally {
      setLoading(false);
    }
  };

  const isPDF = selectedFile?.file_type === 'application/pdf';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Aperçu du Design</h2>
              <p className="text-text-secondary text-sm mt-1">
                Commande: {task.order_id} - {task.step_name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-xl transition-colors"
            >
              <Icon name="close" className="h-6 w-6 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* File List Sidebar */}
          <div className="w-80 border-r border-border bg-surface-hover overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-text-primary mb-3">Fichiers uploadés</h3>
              <div className="space-y-2">
                {designFiles.map((file) => (
                  <button
                    key={file.file_id}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedFile?.file_id === file.file_id
                        ? 'bg-primary text-white'
                        : 'hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon 
                        name={file.file_type === 'application/pdf' ? 'picture-as-pdf' : 'image'} 
                        className="h-4 w-4" 
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs opacity-75">
                          {new Date(file.uploaded_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col">
            {selectedFile ? (
              <>
                {/* Preview Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{selectedFile.file_name}</h3>
                    <p className="text-text-secondary text-sm">
                      Uploadé le {new Date(selectedFile.uploaded_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  
                  {isPDF && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                        disabled={currentPage === 1}
                      >
                        <Icon name="chevron-left" className="h-4 w-4" />
                      </button>
                      <span className="text-sm text-text-secondary">
                        Page {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                      >
                        <Icon name="chevron-right" className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview Content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
                  {isPDF ? (
                    <div className="bg-white shadow-lg rounded-lg p-8 max-w-full max-h-full overflow-auto">
                      <div className="text-center">
                        <Icon name="picture-as-pdf" className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <p className="text-text-primary font-medium">Aperçu PDF</p>
                        <p className="text-text-secondary text-sm mt-1">
                          Page {currentPage} - {selectedFile.file_name}
                        </p>
                        <p className="text-text-secondary text-xs mt-4">
                          Dans une application réelle, un vrai lecteur PDF serait intégré ici
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-full max-h-full">
                      <img 
                        src={selectedFile.file_url} 
                        alt={selectedFile.file_name}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-secondary">
                <div className="text-center">
                  <Icon name="visibility" className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un fichier pour voir l'aperçu</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              {designFiles.length} fichier(s) uploadé(s)
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-3 text-text-secondary hover:text-text-primary font-medium transition-colors"
              >
                Fermer
              </button>
              
              {currentUser && currentUser.roles.includes('ADMIN') && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Icon name="close" className="h-4 w-4" />
                    <span>Rejeter le design</span>
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
                  >
                    <Icon name="check" className="h-4 w-4" />
                    <span>Approuver le design</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignPreviewModal;