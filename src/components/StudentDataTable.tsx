'use client';

import React, { useState } from 'react';
import { StudentData, FieldKey } from '@/types/diploma';
import { Trash2, Plus, AlertTriangle, Check, Search, Download } from 'lucide-react';

interface StudentDataTableProps {
  students: StudentData[];
  selectedStudentIndex: number;
  onSelectStudent: (index: number) => void;
  onUpdateStudent: (index: number, updated: StudentData) => void;
  onDeleteStudent: (index: number) => void;
  onAddStudent: () => void;
  onExportSingle?: (index: number, withBackground: boolean) => void;
  onExportAll?: (withBackground: boolean) => void;
}

export const StudentDataTable: React.FC<StudentDataTableProps> = ({
  students,
  selectedStudentIndex,
  onSelectStudent,
  onUpdateStudent,
  onDeleteStudent,
  onAddStudent,
  onExportSingle,
  onExportAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleFieldChange = (index: number, key: FieldKey, value: string) => {
    const student = students[index];
    const updated: StudentData = {
      ...student,
      [key]: value,
    };
    onUpdateStudent(index, updated);
  };

  const filteredStudents = students.filter(s =>
    s.estudiante_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.estudiante_cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-slate-100">
            Listado de Estudiantes ({students.length})
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            Editables en tiempo real
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-950 text-slate-200 text-xs rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>

          {onExportAll && students.length > 0 && (
            <button
              onClick={() => onExportAll(false)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
              title="Descargar todos los estudiantes en un solo archivo DOCX"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Todos ({students.length})
            </button>
          )}

          <button
            onClick={onAddStudent}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar Estudiante
          </button>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto max-h-96 rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Estudiante</th>
              <th className="p-3">Cédula</th>
              <th className="p-3">Lugar Nac.</th>
              <th className="p-3">Fecha Nac.</th>
              <th className="p-3">Plantel</th>
              <th className="p-3">Cód. Plantel</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
            {filteredStudents.map((s, idx) => {
              const originalIndex = students.findIndex(st => st.id === s.id);
              const isSelected = originalIndex === selectedStudentIndex;

              return (
                <tr
                  key={s.id}
                  onClick={() => onSelectStudent(originalIndex)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600/15 text-slate-100 font-medium' : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="p-3 text-slate-500">{originalIndex + 1}</td>
                  
                  {/* Nombre */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={s.estudiante_nombre}
                      onChange={e => handleFieldChange(originalIndex, 'estudiante_nombre', e.target.value)}
                      className="w-full bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </td>

                  {/* Cédula */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={s.estudiante_cedula}
                      onChange={e => handleFieldChange(originalIndex, 'estudiante_cedula', e.target.value)}
                      className="w-32 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </td>

                  {/* Lugar Nac. */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={s.lugar_nacimiento}
                      onChange={e => handleFieldChange(originalIndex, 'lugar_nacimiento', e.target.value)}
                      className="w-48 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none truncate"
                    />
                  </td>

                  {/* Fecha Nac. */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={s.fecha_nacimiento}
                      onChange={e => handleFieldChange(originalIndex, 'fecha_nacimiento', e.target.value)}
                      className="w-36 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none"
                    />
                  </td>

                  {/* Plantel */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={s.plantel}
                      onChange={e => handleFieldChange(originalIndex, 'plantel', e.target.value)}
                      className="w-48 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none truncate"
                    />
                  </td>

                  {/* Código Plantel */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={s.codigo_plantel}
                      onChange={e => handleFieldChange(originalIndex, 'codigo_plantel', e.target.value)}
                      className="w-28 bg-slate-950/80 px-2 py-1 rounded border border-slate-800 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </td>

                  {/* Acciones */}
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onExportSingle && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onExportSingle(originalIndex, false);
                          }}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded-lg transition-colors"
                          title={`Descargar DOCX solo de ${s.estudiante_nombre || 'este estudiante'}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDeleteStudent(originalIndex);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
