// components/modals/DesignUploadModal.tsx
import React, { useState, useCallback } from 'react';
import { Task, FileAttachment } from '../../types';
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
      for (const design of designs) {
        setUploadProgress(prev => ({ ...prev, [design.id]: 0 }));
        
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploadProgress(prev => ({ ...prev, [design.id]: progress }));
        }

        await api.uploadDesignFile(task.task_id, design.file, currentUser.user_id);
        URL.revokeObjectURL(design.previewUrl);
      }

      onUploadComplete();
      onClose();
      setDesigns([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Failed to upload files', error);
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
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="p-8 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-text-primary">Upload Designs</h2>
              <p className="text-text-secondary text-lg mt-2">
                Commande: {task.order_id} - {task.step_name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-surface-hover rounded-xl transition-colors"
            >
              <Icon name="close" className="h-7 w-7 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">Select Files</h3>
                <FileUpload 
                  onFilesSelected={handleFilesSelected}
                  acceptedTypes=".pdf,.jpg,.jpeg,.png,.ai,.psd,.webp"
                  maxFiles={10}
                  maxSize={20}
                />
              </div>

              {designs.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">
                    Selected Designs ({designs.length})
                  </h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {designs.map((design, index) => (
                      <div 
                        key={design.id}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          index === selectedDesignIndex ? 'bg-primary/20 border-2 border-primary' : 'bg-surface-hover hover:bg-surface-hover/80'
                        }`}
                        onClick={() => setSelectedDesignIndex(index)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-surface rounded-lg overflow-hidden flex items-center justify-center">
                            {getFileType(design.file.name) === 'image' ? (
                              <img 
                                src={design.previewUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Icon 
                                name={getFileType(design.file.name) === 'pdf' ? 'picture-as-pdf' : 'description'} 
                                className="h-6 w-6 text-primary" 
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text-primary truncate">{design.file.name}</p>
                            <p className="text-text-secondary text-sm">{formatFileSize(design.file.size)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {uploadProgress[design.id] !== undefined && uploadProgress[design.id] < 100 && (
                            <div className="w-24 bg-border rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all duration-300"
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
              <h3 className="text-xl font-semibold text-text-primary">Design Preview</h3>
              
              {selectedDesign ? (
                <div className="bg-surface-hover rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-text-primary truncate">
                      {selectedDesign.file.name}
                    </h4>
                    <span className="px-3 py-1 bg-primary/20 text-primary text-sm font-medium rounded-full">
                      {getFileType(selectedDesign.file.name).toUpperCase()}
                    </span>
                  </div>

                  <div className="bg-black/5 rounded-xl p-4 flex items-center justify-center min-h-[400px] max-h-[500px] overflow-auto">
                    {getFileType(selectedDesign.file.name) === 'image' ? (
                      <img 
                        src={selectedDesign.previewUrl} 
                        alt="Design preview" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : getFileType(selectedDesign.file.name) === 'pdf' ? (
                      <div className="text-center space-y-4">
                        <Icon name="picture-as-pdf" className="h-20 w-20 text-red-600 mx-auto" />
                        <p className="text-text-secondary text-lg">PDF Preview</p>
                        <p className="text-text-secondary text-sm">File: {selectedDesign.file.name}</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <Icon name="description" className="h-20 w-20 text-primary mx-auto" />
                        <p className="text-text-secondary text-lg">Source File</p>
                        <p className="text-text-secondary text-sm">File: {selectedDesign.file.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Size: </span>
                      <span className="text-text-primary font-medium">
                        {formatFileSize(selectedDesign.file.size)}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Type: </span>
                      <span className="text-text-primary font-medium">
                        {selectedDesign.file.type || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-hover rounded-2xl p-12 text-center space-y-4">
                  <Icon name="image" className="h-16 w-16 text-text-secondary/50 mx-auto" />
                  <p className="text-text-secondary text-lg">No design selected</p>
                  <p className="text-text-secondary text-sm">Select or upload designs to preview them here</p>
                </div>
              )}

              {designs.length > 1 && (
                <div className="flex items-center justify-between bg-surface-hover rounded-xl p-4">
                  <button
                    onClick={() => setSelectedDesignIndex(prev => Math.max(0, prev - 1))}
                    disabled={selectedDesignIndex === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Icon name="arrow-back" className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                  
                  <span className="text-text-primary font-medium">
                    {selectedDesignIndex + 1} of {designs.length}
                  </span>
                  
                  <button
                    onClick={() => setSelectedDesignIndex(prev => Math.min(designs.length - 1, prev + 1))}
                    disabled={selectedDesignIndex === designs.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Next</span>
                    <Icon name="arrow-forward" className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <Icon name="info" className="h-6 w-6 text-blue-600 mt-0.5" />
              <div className="text-base text-blue-800">
                <p className="font-medium text-lg">Upload Instructions:</p>
                <ul className="mt-2 list-disc list-inside space-y-2">
                  <li>Upload final designs in PDF format for approval</li>
                  <li>You can attach source files (AI, PSD, etc.)</li>
                  <li>Check that all elements are properly positioned</li>
                  <li>Ensure colors and fonts are correct</li>
                  <li>Multiple designs can be uploaded at once</li>
                  <li>Preview each design before submitting</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-6 pt-8 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-text-secondary hover:text-text-primary font-medium text-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={loading || designs.length === 0}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Icon name="cloud-upload" className="h-5 w-5" />
                  <span>Upload Designs ({designs.length})</span>
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