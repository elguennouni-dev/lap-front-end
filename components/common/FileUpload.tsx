// components/common/FileUpload.tsx
import React, { useState, useRef } from 'react';
import { Icon } from './Icon';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelected, 
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.ai,.psd',
  maxFiles = 5,
  maxSize = 10 // 10MB
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setError('');

    // Validate file count
    if (fileArray.length > maxFiles) {
      setError(`Vous ne pouvez uploader que ${maxFiles} fichiers maximum`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError(`Certains fichiers dépassent la taille maximale de ${maxSize}MB`);
      return;
    }

    onFilesSelected(fileArray);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary/50 hover:bg-surface-hover'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Icon name="cloud-upload" className="h-12 w-12 text-text-secondary mx-auto mb-3" />
        
        <div className="space-y-1">
          <p className="text-text-primary font-medium">
            Glissez-déposez vos fichiers ici
          </p>
          <p className="text-text-secondary text-sm">
            ou <span className="text-primary font-medium">cliquez pour parcourir</span>
          </p>
          <p className="text-text-secondary text-xs">
            Formats acceptés: PDF, JPG, PNG, AI, PSD (max {maxSize}MB par fichier)
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <Icon name="error" className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;