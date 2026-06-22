import React, { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';

interface UploadCardProps {
  onFileLoaded: (arrayBuffer: ArrayBuffer, fileName: string) => void;
  fileName: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onFileLoaded, fileName }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const loadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        onFileLoaded(reader.result, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[200px] text-center ${
        isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-white hover:border-gray-400'
      }`}
    >
      <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {fileName ? <FileText className="w-6 h-6 text-blue-500" /> : <Upload className="w-6 h-6 text-gray-500" />}
      </div>
      <h4 className="font-semibold text-lg text-gray-900">
        {fileName ? fileName : 'Arrastra tu Sábana de Calificaciones PDF aquí'}
      </h4>
      <p className="text-sm text-gray-500 mt-1">o haz clic para explorar en tu equipo</p>
    </div>
  );
};
