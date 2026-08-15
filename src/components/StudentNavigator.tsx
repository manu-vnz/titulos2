'use client';

import React from 'react';
import { StudentData } from '@/types/diploma';
import { ChevronLeft, ChevronRight, Download, FileText, Image as ImageIcon, Users, User, Loader2 } from 'lucide-react';

interface StudentNavigatorProps {
  students: StudentData[];
  currentIndex: number;
  onSelectStudent: (index: number) => void;
  onExportSingle: (studentIndex: number, withBackground: boolean) => void;
  onExportAll: (withBackground: boolean) => void;
  isExportingSingle?: boolean;
  isExportingAll?: boolean;
}

export const StudentNavigator: React.FC<StudentNavigatorProps> = ({
  students,
  currentIndex,
  onSelectStudent,
  onExportSingle,
  onExportAll,
  isExportingSingle = false,
  isExportingAll = false,
}) => {
  if (students.length === 0) return null;

  const currentStudent = students[currentIndex];
  const isAnyExporting = isExportingSingle || isExportingAll;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Student Navigation & Quick Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              disabled={currentIndex === 0 || isAnyExporting}
              onClick={() => onSelectStudent(currentIndex - 1)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-200 transition-colors"
              title="Anterior Estudiante"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Quick dropdown student selector */}
            <select
              value={currentIndex}
              onChange={(e) => onSelectStudent(Number(e.target.value))}
              disabled={isAnyExporting}
              className="bg-transparent text-xs font-semibold text-slate-200 px-2 py-1 focus:outline-none cursor-pointer max-w-[190px] sm:max-w-[240px] truncate"
              title="Seleccionar estudiante para previsualizar"
            >
              {students.map((st, idx) => (
                <option key={st.id || idx} value={idx} className="bg-slate-900 text-slate-200">
                  {idx + 1}. {st.estudiante_nombre || 'Sin nombre'} ({st.estudiante_cedula || 'S/C'})
                </option>
              ))}
            </select>

            <button
              disabled={currentIndex === students.length - 1 || isAnyExporting}
              onClick={() => onSelectStudent(currentIndex + 1)}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-200 transition-colors"
              title="Siguiente Estudiante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="hidden md:flex flex-col">
            <span className="text-xs font-bold text-slate-100 truncate max-w-[220px]">
              {currentStudent?.estudiante_nombre || 'Sin nombre'}
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">
              {currentStudent?.estudiante_cedula || 'N/A'} • {currentIndex + 1} de {students.length}
            </span>
          </div>
        </div>

        {/* Right: Export Options (Single vs All) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Section 1: Descargar Estudiante Actual */}
          <div className="flex items-center gap-1.5 bg-indigo-950/40 p-1 rounded-xl border border-indigo-500/30">
            <button
              disabled={isAnyExporting}
              onClick={() => onExportSingle(currentIndex, false)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              title={`Descargar DOCX de ${currentStudent?.estudiante_nombre || 'este estudiante'} (Solo texto para imprimir en papel de título)`}
            >
              {isExportingSingle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <User className="w-3.5 h-3.5 text-indigo-200" />
              )}
              <span>Descargar Este ({currentIndex + 1})</span>
            </button>

            <button
              disabled={isAnyExporting}
              onClick={() => onExportSingle(currentIndex, true)}
              className="p-1.5 bg-indigo-900/60 hover:bg-indigo-800/80 disabled:opacity-50 text-indigo-300 hover:text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
              title="Descargar este estudiante con fondo digital"
            >
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline text-[11px]">Digital</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Section 2: Descargar Todos los Estudiantes */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              disabled={isAnyExporting}
              onClick={() => onExportAll(false)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              title={`Descargar archivo consolidado con los ${students.length} estudiantes (Solo texto)`}
            >
              {isExportingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Users className="w-3.5 h-3.5 text-emerald-200" />
              )}
              <span>Descargar Todos ({students.length})</span>
            </button>

            <button
              disabled={isAnyExporting}
              onClick={() => onExportAll(true)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white rounded-lg transition-colors text-xs font-medium flex items-center gap-1 border border-slate-800"
              title="Descargar todos los estudiantes con fondo digital"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">Digital</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

