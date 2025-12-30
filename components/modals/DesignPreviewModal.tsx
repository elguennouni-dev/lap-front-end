import React, { useState } from 'react';
import { Task, UserRole } from '../../types';
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

  const fileUrl = task.uploadFile
    ? `http://localhost:2099/workflow/uploads/${task.uploadFile}`
    : null;

  const isImage = fileUrl ? /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl) : false;
  const isPdf = fileUrl ? /\.pdf$/i.test(fileUrl) : false;

  const handleApprove = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await api.validateTask(task.id, true);
      onStatusChange();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await api.validateTask(task.id, false);
      onStatusChange();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Aperçu du Fichier</h2>
            <p className="text-gray-500 text-sm mt-1">
              Tâche #{task.id} - {task.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <Icon name="close" className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 bg-gray-100 flex items-center justify-center p-6">
          {fileUrl ? (
            isImage ? (
              <img
                src={fileUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
              />
            ) : isPdf ? (
              <iframe
                src={fileUrl}
                title="PDF Preview"
                className="w-full h-full rounded-lg shadow-lg bg-white"
              />
            ) : (
              <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <Icon name="attachment" className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-4">
                  Fichier non prévisualisable
                </p>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Télécharger le fichier
                </a>
              </div>
            )
          ) : (
            <div className="text-center text-gray-400">
              <Icon name="image" className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Aucun fichier uploadé pour cette tâche</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            Fermer
          </button>

          {currentUser && currentUser.role === UserRole.ADMINISTRATEUR && (
            <>
              <button
                onClick={handleReject}
                disabled={loading || !fileUrl}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 flex items-center space-x-2"
              >
                <Icon name="close" className="h-4 w-4" />
                <span>Rejeter</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={loading || !fileUrl}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl disabled:opacity-50 flex items-center space-x-2"
              >
                <Icon name="check" className="h-4 w-4" />
                <span>Valider</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignPreviewModal;
