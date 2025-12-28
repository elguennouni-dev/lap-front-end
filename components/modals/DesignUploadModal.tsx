import React, { useState, useCallback } from 'react';
import { Task } from '../../types';
import { api } from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';
import { Icon } from '../common/Icon';
import FileUpload from '../common/FileUpload';

interface DesignUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onUploadComplete: () => void;
}

interface DesignFile {
  file: File;
  previewUrl: string;
  id: string;
}

const DesignUploadModal: React.FC<DesignUploadModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onUploadComplete 
}) => {
  const { currentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [designs, setDesigns] = useState<DesignFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedDesignIndex, setSelectedDesignIndex] = useState<number>(0);

  const handleFilesSelected = useCallback((files: File[]) => {
    // In this simplified backend version, we might only want one final proof.
    // However, keeping the UI capable of multiple selections for flexibility.
    const newDesigns = files.map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    setDesigns(prev => [...prev, ...newDesigns]);
  }, []);

  const handleUpload = async () => {
    if (!currentUser || designs.length === 0) return;

    setLoading(true);
    
    try {
      // We take the LAST selected file as the "Final Proof" for the backend
      // In a real app with multiple file support, we would loop.
      const designToUpload = designs[designs.length - 1]; 
      
      setUploadProgress(prev => ({ ...prev, [designToUpload.id]: 0 }));
      
      // Simulate progress for UI feedback
      for (let progress = 0; progress <= 90; progress += 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [designToUpload.id]: progress }));
      }

      // API Call: Completes the task with the uploaded file
      await api.completeTask(task.id, designToUpload.file);
      
      setUploadProgress(prev => ({ ...prev, [designToUpload.id]: 100 }));

      // Clean up object URLs
      designs.forEach(d => URL.revokeObjectURL(d.previewUrl));

      onUploadComplete();
      onClose();
      setDesigns([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Failed to upload files', error);
      alert("Erreur lors de l'upload");
    } finally {
      setLoading(false);
    }
  };

  const removeDesign = (designId: string) => {
    setDesigns(prev => {
      const newDesigns = prev.filter(design => design.id !== designId);
      if (selectedDesignIndex >= newDesigns.length && newDesigns.length > 0) {
        setSelectedDesignIndex(newDesigns.length - 1);
      } else if (newDesigns.length === 0) {
        setSelectedDesignIndex(0);
      }
      return newDesigns;
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[designId];
      return newProgress;
    });

    const designToRemove = designs.find(d => d.id === designId);
    if (designToRemove) {
      URL.revokeObjectURL(designToRemove.previewUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['ai', 'psd'].includes(ext || '')) return 'source';
    return 'other';
  };

  if (!isOpen) return null;

  const selectedDesign = designs[selectedDesignIndex];

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Upload Designs</h2>
              <p className="text-gray-500 text-lg mt-2">
                Tâche: #{task.id} - {task.type}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Icon name="close" className="h-7 w-7 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Files</h3>
                <FileUpload 
                  onFilesSelected={handleFilesSelected}
                  acceptedTypes=".pdf,.jpg,.jpeg,.png,.ai,.psd,.webp"
                  maxFiles={5}
                  maxSize={20}
                />
              </div>

              {designs.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Selected Designs ({designs.length})
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {designs.map((design, index) => (
                      <div 
                        key={design.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          index === selectedDesignIndex ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedDesignIndex(index)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-200">
                            {getFileType(design.file.name) === 'image' ? (
                              <img 
                                src={design.previewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon 
                                name={getFileType(design.file.name) === 'pdf' ? 'picture-as-pdf' : 'description'} 
                                className="h-6 w-6 text-blue-600" 
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{design.file.name}</p>
                            <p className="text-gray-500 text-sm">{formatFileSize(design.file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {uploadProgress[design.id] !== undefined && uploadProgress[design.id] < 100 && (
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[design.id]}%` }}
                              ></div>
                            </div>
                          )}
                          
                          {uploadProgress[design.id] === 100 ? (
                            <Icon name="check-circle" className="h-5 w-5 text-green-600" />
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeDesign(design.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Icon name="delete" className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800">Preview</h3>
              
              {selectedDesign ? (
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-800 truncate">
                      {selectedDesign.file.name}
                    </h4>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {getFileType(selectedDesign.file.name).toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-center min-h-[400px] max-h-[500px] overflow-auto">
                    {getFileType(selectedDesign.file.name) === 'image' ? (
                      <img 
                        src={selectedDesign.previewUrl} 
                        alt="Design preview" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center space-y-4">
                        <Icon name="description" className="h-20 w-20 text-blue-400 mx-auto" />
                        <p className="text-gray-500 text-lg">Aperçu non disponible pour ce format</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-12 text-center space-y-4 border border-gray-200 border-dashed">
                  <Icon name="image" className="h-16 w-16 text-gray-300 mx-auto" />
                  <p className="text-gray-500 text-lg">Aucun fichier sélectionné</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-6 pt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-gray-600 hover:text-gray-800 font-medium text-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || designs.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Icon name="cloud-upload" className="h-5 w-5" />
                  <span>Envoyer ({designs.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignUploadModal;