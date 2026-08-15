'use client';

import React, { useState } from 'react';
import { StudentData, FieldCoordinate, TemplatePreset } from '@/types/diploma';
import { DEFAULT_FIELD_COORDINATES } from '@/lib/default-coordinates';
import { exportConsolidatedDocx } from '@/lib/docx-exporter';
import { FileUploadZone } from '@/components/FileUploadZone';
import { StudentDataTable } from '@/components/StudentDataTable';
import { DiplomaCanvas, FieldPosition, DEFAULT_FIELD_POSITIONS } from '@/components/DiplomaCanvas';
import { CalibrationPanel } from '@/components/CalibrationPanel';
import { StudentNavigator } from '@/components/StudentNavigator';
import { GraduationCap, UploadCloud, Table, Sliders, Sparkles, FileCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import saveAs from 'file-saver';

// Sample students built-in for instant demo testing
const DEMO_STUDENTS: StudentData[] = [
  {
    id: 'demo_1',
    filename: 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx',
    plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
    codigo_plantel: 'S0163D0814',
    titulo_otorgado: 'BACHILLER',
    plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
    estudiante_nombre: 'JESUS MANUEL VARGAS NOGUERA',
    estudiante_cedula: 'V 33.479.449',
    lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA',
    fecha_nacimiento: '09 DE JULIO DE 2009',
    lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
    año_egreso: '2026',
    firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
    firmante_director_cedula: 'V 18.361.899',
    firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
    firmante_coordinador_cedula: 'V 13.601.460',
    firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
    firmante_funcionario_cedula: 'V 9.445.225',
    raw_tokens: [],
    is_valid: true,
    parse_warnings: [],
  },
  {
    id: 'demo_2',
    filename: 'REINALDO DAVID GARCÍA CAMPOS COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx',
    plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
    codigo_plantel: 'S0163D0814',
    titulo_otorgado: 'BACHILLER',
    plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
    estudiante_nombre: 'REINALDO DAVID GARCÍA CAMPOS',
    estudiante_cedula: 'V 32.666.328',
    lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO VALENCIA',
    fecha_nacimiento: '21 DE ENERO DE 2009',
    lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
    año_egreso: '2026',
    firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
    firmante_director_cedula: 'V 18.361.899',
    firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
    firmante_coordinador_cedula: 'V 13.601.460',
    firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
    firmante_funcionario_cedula: 'V 9.445.225',
    raw_tokens: [],
    is_valid: true,
    parse_warnings: [],
  },
];

export default function HomePage() {
  const [students, setStudents] = useState<StudentData[]>(DEMO_STUDENTS);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number>(0);
  const [coordinates, setCoordinates] = useState<Record<string, FieldCoordinate>>(DEFAULT_FIELD_COORDINATES);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('estudiante_nombre_1');
  const [activeTab, setActiveTab] = useState<'upload' | 'table' | 'canvas'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [fieldPositions, setFieldPositions] = useState<Record<string, FieldPosition>>(
    () => JSON.parse(JSON.stringify(DEFAULT_FIELD_POSITIONS))
  );

  const handleStudentsParsed = (newStudents: StudentData[]) => {
    setStudents(prev => [...prev, ...newStudents]);
    setSelectedStudentIndex(0);
    setActiveTab('canvas');
  };

  const handleLoadDemo = () => {
    setStudents(DEMO_STUDENTS);
    setSelectedStudentIndex(0);
    setActiveTab('canvas');
  };

  const handleUpdateStudent = (index: number, updated: StudentData) => {
    setStudents(prev => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  const handleUpdateStudentField = (fieldKey: string, newValue: string) => {
    if (students.length === 0) return;
    setStudents(prev => {
      const next = [...prev];
      const current = { ...next[selectedStudentIndex] };
      (current as any)[fieldKey] = newValue;
      next[selectedStudentIndex] = current;
      return next;
    });
  };

  const handleDeleteStudent = (index: number) => {
    setStudents(prev => prev.filter((_, i) => i !== index));
    if (selectedStudentIndex >= students.length - 1) {
      setSelectedStudentIndex(Math.max(0, students.length - 2));
    }
  };

  const handleAddStudent = () => {
    const newStudent: StudentData = {
      id: `manual_${Date.now()}`,
      filename: 'Nuevo_Estudiante.docx',
      plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
      codigo_plantel: 'S0163D0814',
      titulo_otorgado: 'BACHILLER',
      plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
      estudiante_nombre: 'NUEVO ESTUDIANTE',
      estudiante_cedula: 'V 00.000.000',
      lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA',
      fecha_nacimiento: '01 DE ENERO DE 2009',
      lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
      año_egreso: '2026',
      firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
      firmante_director_cedula: 'V 18.361.899',
      firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
      firmante_coordinador_cedula: 'V 13.601.460',
      firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
      firmante_funcionario_cedula: 'V 9.445.225',
      raw_tokens: [],
      is_valid: true,
      parse_warnings: [],
    };
    setStudents(prev => [...prev, newStudent]);
    setSelectedStudentIndex(students.length);
  };

  const handleUpdateCoordinate = (id: string, updated: Partial<FieldCoordinate>) => {
    setCoordinates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updated,
      },
    }));
  };

  const handleResetCoordinates = () => {
    setCoordinates(DEFAULT_FIELD_COORDINATES);
    setFieldPositions(JSON.parse(JSON.stringify(DEFAULT_FIELD_POSITIONS)));
  };

  const handleLoadPreset = (preset: TemplatePreset) => {
    if (preset.coordinates) {
      setCoordinates(preset.coordinates);
    }
    if (preset.fieldPositions && Object.keys(preset.fieldPositions).length > 0) {
      setFieldPositions(preset.fieldPositions as Record<string, FieldPosition>);
    }
  };

  /**
   * Export DOCX for a single student
   */
  const handleExportSingle = async (studentIndex: number = selectedStudentIndex, withBackground: boolean = false) => {
    if (students.length === 0 || !students[studentIndex]) return;

    const student = students[studentIndex];
    setIsExportingSingle(true);
    try {
      const docxBlob = await exportConsolidatedDocx([student], coordinates, {
        includeBackground: withBackground,
      }, fieldPositions);

      const rawName = student.estudiante_nombre || (student as any).nombre_estudiante || 'estudiante';
      const cleanName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 35);
      const cleanCedula = (student.estudiante_cedula || '').replace(/[^a-zA-Z0-9]/g, '');
      const modeName = withBackground ? 'digital_fondo' : 'solo_texto';
      const filename = `titulo_${cleanName}${cleanCedula ? '_' + cleanCedula : ''}_${modeName}.docx`;

      saveAs(docxBlob, filename);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      console.error('Error generating single student DOCX:', err);
      alert('Ocurrió un error al exportar el archivo DOCX del estudiante: ' + (err.message || ''));
    } finally {
      setIsExportingSingle(false);
    }
  };

  /**
   * Export consolidated DOCX for all students
   */
  const handleExportAll = async (withBackground: boolean = false) => {
    if (students.length === 0) return;

    setIsExportingAll(true);
    try {
      const docxBlob = await exportConsolidatedDocx(students, coordinates, {
        includeBackground: withBackground,
      }, fieldPositions);

      const modeName = withBackground ? 'digital_completo' : 'impresion_texto';
      saveAs(docxBlob, `titulos_bachiller_consolidado_${students.length}_estudiantes_${modeName}_${Date.now()}.docx`);

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Error generating consolidated DOCX:', err);
      alert('Ocurrió un error al exportar el archivo DOCX consolidado: ' + (err.message || ''));
    } finally {
      setIsExportingAll(false);
    }
  };

  const currentStudent = students[selectedStudentIndex] || null;

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 pb-28 text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl ring-1 ring-indigo-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                Título Bachiller PRO
              </h1>
              <p className="text-xs text-slate-400">
                Reordenador Inteligente & Calibración Visual Tamaño Carta Horizontal (11&quot; x 8.5&quot;)
              </p>
            </div>
          </div>

          {/* Action pills & demo buttons */}
          <div className="flex items-center gap-3">
            {students.length === 0 && (
              <button
                onClick={handleLoadDemo}
                className="px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/30 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Cargar Ejemplos (JESUS y REINALDO)
              </button>
            )}

            <div className="px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Carta Horizontal
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 border-t border-slate-800/60 pt-2 pb-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <UploadCloud className="w-4 h-4" /> 1. Carga Masiva (.DOCX)
          </button>

          <button
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'table'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Table className="w-4 h-4" /> 2. Datos Extraídos ({students.length})
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'canvas'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" /> 3. Lienzo Horizontal & Edición
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6 flex-1">
        {/* Tab 1: Upload */}
        {activeTab === 'upload' && (
          <div className="py-6">
            <FileUploadZone
              onStudentsParsed={handleStudentsParsed}
              isProcessing={isProcessing}
              setIsProcessing={setIsProcessing}
            />
          </div>
        )}

        {/* Tab 2: Table Data */}
        {activeTab === 'table' && (
          <div>
            <StudentDataTable
              students={students}
              selectedStudentIndex={selectedStudentIndex}
              onSelectStudent={idx => {
                setSelectedStudentIndex(idx);
                setActiveTab('canvas');
              }}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddStudent={handleAddStudent}
              onExportSingle={handleExportSingle}
              onExportAll={handleExportAll}
            />
          </div>
        )}

        {/* Tab 3: Visual Canvas & Calibration */}
        {activeTab === 'canvas' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 p-5 border border-slate-800 rounded-2xl shadow-xl flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-400" />
                  Previsualización & Edición Directa en Lienzo Carta Horizontal (11&quot; x 8.5&quot;)
                </span>
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={e => setShowGrid(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                  />
                  Mostrar Cuadrícula mm
                </label>
              </div>

              <DiplomaCanvas
                student={currentStudent}
                onUpdateStudentField={handleUpdateStudentField}
                coordinates={coordinates}
                selectedFieldId={selectedFieldId}
                onSelectField={id => setSelectedFieldId(id)}
                onUpdateCoordinate={handleUpdateCoordinate}
                showGrid={showGrid}
                fieldPositions={fieldPositions}
                onUpdateFieldPositions={setFieldPositions}
                onExportStudent={withBg => handleExportSingle(selectedStudentIndex, withBg)}
              />
            </div>

            {/* Right: Calibration Panel (5 cols) */}
            <div className="lg:col-span-5">
              <CalibrationPanel
                coordinates={coordinates}
                selectedFieldId={selectedFieldId}
                onSelectField={id => setSelectedFieldId(id)}
                onUpdateCoordinate={handleUpdateCoordinate}
                onResetCoordinates={handleResetCoordinates}
                onLoadPreset={handleLoadPreset}
                fieldPositions={fieldPositions}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigator */}
      <StudentNavigator
        students={students}
        currentIndex={selectedStudentIndex}
        onSelectStudent={setSelectedStudentIndex}
        onExportSingle={handleExportSingle}
        onExportAll={handleExportAll}
        isExportingSingle={isExportingSingle}
        isExportingAll={isExportingAll}
      />
    </main>
  );
}
