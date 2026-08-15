'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, FolderPlus } from 'lucide-react';
import { StudentData } from '@/types/diploma';
import { parseStudentDocx } from '@/lib/docx-parser';

interface FileUploadZoneProps {
  onStudentsParsed: (students: StudentData[]) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onStudentsParsed,
  isProcessing,
  setIsProcessing,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileProgress, setFileProgress] = useState<{ name: string; status: 'pending' | 'success' | 'error' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const docxFiles = Array.from(files).filter(
      f => f.name.endsWith('.docx') || f.type.includes('wordprocessingml')
    );

    if (docxFiles.length === 0) return;

    setIsProcessing(true);
    setFileProgress(docxFiles.map(f => ({ name: f.name, status: 'pending' })));

    const parsedResults: StudentData[] = [];

    for (let i = 0; i < docxFiles.length; i++) {
      const file = docxFiles[i];
      try {
        const student = await parseStudentDocx(file);
        parsedResults.push(student);
        setFileProgress(prev =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'success' } : item))
        );
      } catch (err) {
        console.error(`Error parsing ${file.name}:`, err);
        setFileProgress(prev =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'error' } : item))
        );
      }
    }

    setIsProcessing(false);
    if (parsedResults.length > 0) {
      onStudentsParsed(parsedResults);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />

        <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 ring-1 ring-indigo-500/20">
          <Upload className="w-10 h-10 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-2">
          Arrastra y suelta tus plantillas de Títulos (.DOCX) aquí
        </h3>
        <p className="text-sm text-slate-400 mb-6 text-center max-w-md">
          Soporta carga masiva simultánea. El motor inteligente extraerá y clasificará automáticamente los datos de cada estudiante.
        </p>

        <button
          type="button"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          Seleccionar Archivos desde el Equipo
        </button>
      </div>

      {/* Progress list */}
      {fileProgress.length > 0 && (
        <div className="mt-6 bg-slate-900/80 rounded-xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Progreso de Extracción ({fileProgress.filter(f => f.status === 'success').length} / {fileProgress.length})
            </h4>
            {isProcessing && (
              <span className="text-xs text-indigo-400 flex items-center gap-1.5 animate-spin">
                <RefreshCw className="w-3.5 h-3.5" /> Procesando...
              </span>
            )}
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {fileProgress.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950/50 border border-slate-800/60"
              >
                <span className="text-slate-300 truncate max-w-md">{file.name}</span>
                {file.status === 'pending' && <span className="text-amber-400">Leyendo...</span>}
                {file.status === 'success' && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Éxito
                  </span>
                )}
                {file.status === 'error' && (
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Error
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
