'use client';

import React from 'react';
import { StudentData } from '@/types/diploma';
import { ChevronLeft, ChevronRight, Download, FileText, Image as ImageIcon } from 'lucide-react';

interface StudentNavigatorProps {
  students: StudentData[];
  currentIndex: number;
  onSelectStudent: (index: number) => void;
  onExportDocx: (withBackground: boolean) => void;
  isExporting: boolean;
}

export const StudentNavigator: React.FC<StudentNavigatorProps> = ({
  students,
  currentIndex,
  onSelectStudent,
  onExportDocx,
  isExporting,
}) => {
  if (students.length === 0) return null;

  const currentStudent = students[currentIndex];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Student Navigation Controls */}
        <div className="flex items-center gap-3">
          <button
            disabled={currentIndex === 0}
            onClick={() => onSelectStudent(currentIndex - 1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
            title="Anterior Estudiante"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-100 truncate max-w-xs">
              {currentStudent?.estudiante_nombre || 'Sin nombre'}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Cédula: {currentStudent?.estudiante_cedula || 'N/A'} • Estudiante {currentIndex + 1} de {students.length}
            </span>
          </div>

          <button
            disabled={currentIndex === students.length - 1}
            onClick={() => onSelectStudent(currentIndex + 1)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
            title="Siguiente Estudiante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          {/* Export Text Only for Pre-printed Paper */}
          <button
            disabled={isExporting}
            onClick={() => onExportDocx(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Exportar DOCX (Solo Texto)
          </button>

          {/* Export Digital with Background */}
          <button
            disabled={isExporting}
            onClick={() => onExportDocx(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            title="Exportar archivo Word completo incluyendo imagen de fondo del diploma"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            Con Fondo (Digital)
          </button>
        </div>
      </div>
    </div>
  );
};
