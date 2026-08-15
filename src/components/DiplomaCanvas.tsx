'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { StudentData, FieldCoordinate } from '@/types/diploma';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Edit3, Move, MousePointer2, CheckCircle2, Download } from 'lucide-react';

// Letter Landscape dimensions (11" x 8.5" = 279.4mm x 215.9mm)
const LETTER_WIDTH_MM = 279.4;
const LETTER_HEIGHT_MM = 215.9;

// ─── Default positions (% of canvas) and widths for each field ──────────────
export interface FieldPosition {
  top: number;   // % from top
  left: number;  // % from left
  width?: number; // % width
}

export const DEFAULT_FIELD_POSITIONS: Record<string, FieldPosition> = {
  plantel:                 { top: 29.0,  left: 32.5,  width: 50  },
  codigo_plantel:          { top: 32.0,  left: 20.0,  width: 25  },
  titulo_otorgado:         { top: 35.0,  left: 20.0,  width: 30  },
  plan_estudio:            { top: 37.8,  left: 36.5,  width: 45  },
  nombre_estudiante:       { top: 40.6,  left: 25.5,  width: 45  },
  cedula_estudiante:       { top: 43.5,  left: 31.5,  width: 28  },
  lugar_nacimiento:        { top: 46.2,  left: 22.5,  width: 55  },
  fecha_nacimiento:        { top: 49.0,  left: 19.5,  width: 35  },
  lugar_fecha_expedicion:  { top: 57.0,  left: 37.0,  width: 48  },
  ano_egreso:              { top: 59.8,  left: 23.0,  width: 20  },
  coordinador_nombre:      { top: 70.8,  left: 22.0,  width: 28  },
  coordinador_cedula:      { top: 73.0,  left: 22.0,  width: 28  },
  funcionario_nombre:      { top: 70.8,  left: 50.0,  width: 28  },
  funcionario_cedula:      { top: 73.0,  left: 50.0,  width: 28  },
  director_nombre:         { top: 70.8,  left: 78.0,  width: 28  },
  director_cedula:         { top: 73.0,  left: 78.0,  width: 28  },
};

interface DiplomaCanvasProps {
  student: StudentData | null;
  onUpdateStudentField?: (fieldKey: string, newValue: string) => void;
  coordinates?: Record<string, FieldCoordinate>;
  selectedFieldId?: string | null;
  onSelectField?: (id: string) => void;
  onUpdateCoordinate?: (id: string, newCoords: Partial<FieldCoordinate>) => void;
  showGrid?: boolean;
  fieldPositions?: Record<string, FieldPosition>;
  onUpdateFieldPositions?: (positions: Record<string, FieldPosition>) => void;
  onExportStudent?: (withBackground: boolean) => void;
}

export const DiplomaCanvas: React.FC<DiplomaCanvasProps> = ({
  student,
  onUpdateStudentField,
  coordinates,
  selectedFieldId,
  onSelectField,
  onUpdateCoordinate,
  showGrid = true,
  fieldPositions: externalPositions,
  onUpdateFieldPositions,
  onExportStudent,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isDragMode, setIsDragMode] = useState(false);
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startTop: number; startLeft: number } | null>(null);

  const [internalPositions, setInternalPositions] = useState<Record<string, FieldPosition>>(
    () => JSON.parse(JSON.stringify(DEFAULT_FIELD_POSITIONS))
  );

  const positions = externalPositions || internalPositions;

  const updatePositions = useCallback((newPositions: Record<string, FieldPosition>) => {
    if (onUpdateFieldPositions) {
      onUpdateFieldPositions(newPositions);
    } else {
      setInternalPositions(newPositions);
    }
  }, [onUpdateFieldPositions]);

  const data = student || ({} as StudentData);

  const estudiante = {
    plantel: (data.plantel || 'COMPLEJO EDUCATIVO RUÍZ PINEDA I').toUpperCase(),
    codigo_plantel: (data.codigo_plantel || 'S0163D0814').toUpperCase(),
    titulo_otorgado: (data.titulo_otorgado || 'BACHILLER').toUpperCase(),
    plan_estudio: (data.plan_estudio || 'EDUCACIÓN MEDIA GENERAL, 31059').toUpperCase(),
    nombre_estudiante: (data.estudiante_nombre || (data as any).nombre_estudiante || (data as any).nombre || 'JESUS MANUEL VARGAS NOGUERA').toUpperCase(),
    cedula_estudiante: (data.estudiante_cedula || (data as any).cedula_estudiante || (data as any).cedula || 'V 33.479.449').toUpperCase(),
    lugar_nacimiento: (data.lugar_nacimiento || 'VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA').toUpperCase(),
    fecha_nacimiento: (data.fecha_nacimiento || '09 DE JULIO DE 2009').toUpperCase(),
    lugar_fecha_expedicion: (data.lugar_fecha_expedicion || 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026').toUpperCase(),
    ano_egreso: (data.año_egreso || (data as any).ano_egreso || '2026').toUpperCase(),
    director_nombre: (data.firmante_director_nombre || (data as any).director_nombre || 'JOHN DANIEL ZAPATA MIRELES').toUpperCase(),
    director_cedula: (data.firmante_director_cedula || (data as any).director_cedula || 'V 18.361.899').toUpperCase(),
    coordinador_nombre: (data.firmante_coordinador_nombre || (data as any).coordinador_nombre || 'JOSÉ ALBERTO RUÍZ ÁLVAREZ').toUpperCase(),
    coordinador_cedula: (data.firmante_coordinador_cedula || (data as any).coordinador_cedula || 'V 13.601.460').toUpperCase(),
    funcionario_nombre: (data.firmante_funcionario_nombre || (data as any).funcionario_nombre || 'WILMER JOSÉ LUGO RODRÍGUEZ').toUpperCase(),
    funcionario_cedula: (data.firmante_funcionario_cedula || (data as any).funcionario_cedula || 'V 9.445.225').toUpperCase(),
  };

  const handleFieldChange = (key: string, value: string) => {
    if (onUpdateStudentField) {
      onUpdateStudentField(key, value);
    }
  };

  // ─── Field Definitions mapped to Calibration Coordinates ────────────────
  type FieldDef = {
    key: string;
    coordId: string;
    value: string;
    onChange: string;
    centered?: boolean;
    bold?: boolean;
    textClass?: string;
  };

  const fields: FieldDef[] = [
    { key: 'plantel',                coordId: 'plantel_1',                   value: estudiante.plantel,                onChange: 'plantel',                      bold: true },
    { key: 'codigo_plantel',         coordId: 'codigo_plantel_1',            value: estudiante.codigo_plantel,         onChange: 'codigo_plantel',               bold: true },
    { key: 'titulo_otorgado',        coordId: 'titulo_otorgado_1',           value: estudiante.titulo_otorgado,        onChange: 'titulo_otorgado',              bold: true },
    { key: 'plan_estudio',           coordId: 'plan_estudio_1',              value: estudiante.plan_estudio,           onChange: 'plan_estudio',                 bold: true },
    { key: 'nombre_estudiante',      coordId: 'estudiante_nombre_1',         value: estudiante.nombre_estudiante,      onChange: 'estudiante_nombre',            bold: true, textClass: 'text-indigo-950' },
    { key: 'cedula_estudiante',      coordId: 'estudiante_cedula_1',         value: estudiante.cedula_estudiante,      onChange: 'estudiante_cedula',            bold: true },
    { key: 'lugar_nacimiento',       coordId: 'lugar_nacimiento_1',          value: estudiante.lugar_nacimiento,       onChange: 'lugar_nacimiento',             bold: true },
    { key: 'fecha_nacimiento',       coordId: 'fecha_nacimiento_1',          value: estudiante.fecha_nacimiento,       onChange: 'fecha_nacimiento',             bold: true },
    { key: 'lugar_fecha_expedicion', coordId: 'lugar_fecha_expedicion_1',    value: estudiante.lugar_fecha_expedicion, onChange: 'lugar_fecha_expedicion',       bold: true },
    { key: 'ano_egreso',             coordId: 'año_egreso_1',                value: estudiante.ano_egreso,             onChange: 'año_egreso',                   bold: true },
    { key: 'coordinador_nombre',     coordId: 'firmante_coordinador_nombre_1', value: estudiante.coordinador_nombre,     onChange: 'firmante_coordinador_nombre',  bold: true, centered: true },
    { key: 'coordinador_cedula',     coordId: 'firmante_coordinador_cedula_1', value: estudiante.coordinador_cedula,     onChange: 'firmante_coordinador_cedula',  centered: true },
    { key: 'funcionario_nombre',     coordId: 'firmante_funcionario_nombre_1', value: estudiante.funcionario_nombre,     onChange: 'firmante_funcionario_nombre',  bold: true, centered: true },
    { key: 'funcionario_cedula',     coordId: 'firmante_funcionario_cedula_1', value: estudiante.funcionario_cedula,     onChange: 'firmante_funcionario_cedula',  centered: true },
    { key: 'director_nombre',        coordId: 'firmante_director_nombre_1',    value: estudiante.director_nombre,        onChange: 'firmante_director_nombre',     bold: true, centered: true },
    { key: 'director_cedula',        coordId: 'firmante_director_cedula_1',    value: estudiante.director_cedula,        onChange: 'firmante_director_cedula',     centered: true },
  ];

  // ─── Sync coordinates prop from CalibrationPanel into positions ─────────
  useEffect(() => {
    if (!coordinates) return;
    const updatedPos = { ...positions };
    let hasChanges = false;

    fields.forEach(field => {
      const coord = coordinates[field.coordId];
      if (coord && (coord.x_mm !== undefined || coord.y_mm !== undefined || coord.width_mm !== undefined)) {
        const topFromMM = (coord.y_mm / LETTER_HEIGHT_MM) * 100;
        const leftFromMM = (coord.x_mm / LETTER_WIDTH_MM) * 100;
        const widthFromMM = (coord.width_mm / LETTER_WIDTH_MM) * 100;

        const currentPos = updatedPos[field.key] || DEFAULT_FIELD_POSITIONS[field.key];
        if (
          Math.abs(currentPos.top - topFromMM) > 0.1 ||
          Math.abs(currentPos.left - leftFromMM) > 0.1 ||
          (currentPos.width && Math.abs(currentPos.width - widthFromMM) > 0.1)
        ) {
          updatedPos[field.key] = {
            top: parseFloat(topFromMM.toFixed(1)),
            left: parseFloat(leftFromMM.toFixed(1)),
            width: parseFloat(widthFromMM.toFixed(1)),
          };
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      updatePositions(updatedPos);
    }
  }, [coordinates]);

  // ─── Drag Handling & 2-Way Sync to CalibrationPanel Coordinates ─────────
  const handleDragStart = useCallback((fieldKey: string, coordId: string, e: React.MouseEvent) => {
    if (!isDragMode) return;
    e.preventDefault();
    e.stopPropagation();

    if (onSelectField) {
      onSelectField(coordId);
    }

    const pos = positions[fieldKey];
    if (!pos) return;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startTop: pos.top,
      startLeft: pos.left,
    };
    setDraggingField(fieldKey);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dx = (moveEvent.clientX - dragStartRef.current.mouseX) / rect.width * 100;
      const dy = (moveEvent.clientY - dragStartRef.current.mouseY) / rect.height * 100;

      const newTop = Math.max(0, Math.min(95, dragStartRef.current.startTop + dy));
      const newLeft = Math.max(0, Math.min(95, dragStartRef.current.startLeft + dx));

      const newTopFixed = parseFloat(newTop.toFixed(1));
      const newLeftFixed = parseFloat(newLeft.toFixed(1));

      // Update positions
      updatePositions({
        ...positions,
        [fieldKey]: {
          ...positions[fieldKey],
          top: newTopFixed,
          left: newLeftFixed,
        },
      });

      // Update CalibrationPanel coordinates (convert % to mm)
      if (onUpdateCoordinate) {
        const x_mm = parseFloat(((newLeftFixed / 100) * LETTER_WIDTH_MM).toFixed(1));
        const y_mm = parseFloat(((newTopFixed / 100) * LETTER_HEIGHT_MM).toFixed(1));
        onUpdateCoordinate(coordId, { x_mm, y_mm });
      }
    };

    const handleMouseUp = () => {
      setDraggingField(null);
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isDragMode, positions, updatePositions, onSelectField, onUpdateCoordinate]);

  // ─── Field Renderer ─────────────────────────────────────
  const renderField = (field: FieldDef) => {
    const pos = positions[field.key] || DEFAULT_FIELD_POSITIONS[field.key];
    if (!pos) return null;

    const coord = coordinates?.[field.coordId];
    const isSelected = selectedFieldId === field.coordId;
    const isBeingDragged = draggingField === field.key;
    const isVisible = coord?.is_visible !== false;

    if (!isVisible) return null;

    // Derived styles from CalibrationPanel coordinates
    const fontSizeStyle = coord?.font_size_pt ? `${coord.font_size_pt * 1.1}px` : undefined;
    const letterSpacingStyle = coord?.letter_spacing_pt ? `${coord.letter_spacing_pt}px` : undefined;
    const textAlignStyle = coord?.text_align || (field.centered ? 'center' : 'left');
    const isBold = coord?.font_weight ? (coord.font_weight === 'bold' || coord.font_weight === '700') : field.bold;

    return (
      <div
        key={field.key}
        onClick={() => onSelectField?.(field.coordId)}
        className={`absolute transition-shadow ${field.centered ? '-translate-x-1/2' : ''} ${isDragMode ? 'group' : ''}`}
        style={{
          top: `${pos.top}%`,
          left: `${pos.left}%`,
          width: `${pos.width}%`,
          zIndex: isSelected ? 40 : (isBeingDragged ? 50 : 1),
        }}
      >
        {/* Selected Field Ring Indicator from Calibration Panel */}
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-indigo-500 rounded-lg ring-4 ring-indigo-500/20 pointer-events-none z-30 animate-pulse">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5" /> {coord?.label || field.key}
            </span>
          </div>
        )}

        {/* Drag handle indicator (visible in drag mode) */}
        {isDragMode && (
          <div
            className={`absolute inset-0 border-2 border-dashed rounded transition-colors pointer-events-none ${
              isBeingDragged
                ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20'
                : 'border-indigo-400/40 group-hover:border-indigo-400 group-hover:bg-indigo-400/5'
            }`}
          />
        )}

        <input
          type="text"
          value={field.value}
          onChange={(e) => handleFieldChange(field.onChange, e.target.value)}
          onFocus={() => onSelectField?.(field.coordId)}
          readOnly={isDragMode}
          onMouseDown={(e) => handleDragStart(field.key, field.coordId, e)}
          className={`w-full bg-transparent hover:bg-indigo-50/50 focus:bg-white/90 border border-transparent focus:border-indigo-500 rounded px-1 uppercase outline-none transition-all text-[11px] ${
            isBold ? 'font-bold' : 'font-normal'
          } ${field.textClass || 'text-black'} ${
            isDragMode ? 'cursor-move select-none' : ''
          }`}
          style={{
            textAlign: textAlignStyle as any,
            fontSize: fontSizeStyle,
            letterSpacing: letterSpacingStyle,
            pointerEvents: isDragMode ? 'none' : 'auto',
          }}
        />

        {/* Invisible drag overlay (only in drag mode) */}
        {isDragMode && (
          <div
            className="absolute inset-0 cursor-move"
            onMouseDown={(e) => handleDragStart(field.key, field.coordId, e)}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full ${isFullScreen ? 'fixed inset-0 z-50 bg-slate-950/95 p-6 overflow-auto backdrop-blur-lg' : ''}`}>
      {/* Canvas Top Bar Controls */}
      <div className="w-full flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">
            Escala: {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale(prev => Math.min(prev + 0.15, 2.0))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            <ZoomIn className="w-3.5 h-3.5" /> +
          </button>
          <button
            onClick={() => setZoomScale(prev => Math.max(prev - 0.15, 0.7))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            <ZoomOut className="w-3.5 h-3.5" /> −
          </button>
          <button
            onClick={() => setZoomScale(1)}
            className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs rounded-lg border border-indigo-500/30"
          >
            1:1
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* MODE TOGGLE: Editar vs Arrastrar */}
          <button
            onClick={() => setIsDragMode(false)}
            className={`px-3 py-1.5 text-xs font-bold rounded-l-xl flex items-center gap-1.5 transition-all border ${
              !isDragMode
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <MousePointer2 className="w-3.5 h-3.5" /> Editar Texto
          </button>
          <button
            onClick={() => setIsDragMode(true)}
            className={`px-3 py-1.5 text-xs font-bold rounded-r-xl flex items-center gap-1.5 transition-all border -ml-px ${
              isDragMode
                ? 'bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-600/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Move className="w-3.5 h-3.5" /> Mover Campos
          </button>

          {/* Reset positions */}
          {isDragMode && (
            <button
              onClick={() => updatePositions(JSON.parse(JSON.stringify(DEFAULT_FIELD_POSITIONS)))}
              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs rounded-xl border border-red-500/30 font-medium transition-all"
            >
              Restaurar Posiciones
            </button>
          )}

          {onExportStudent && student && (
            <button
              onClick={() => onExportStudent(false)}
              className="px-2.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs rounded-lg border border-indigo-500/40 font-semibold transition-all flex items-center gap-1"
              title={`Descargar DOCX de este estudiante (${estudiante.nombre_estudiante})`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar Este DOCX</span>
            </button>
          )}

          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-xs flex items-center gap-1.5 font-medium"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4 text-amber-400" /> : <Maximize2 className="w-4 h-4 text-indigo-400" />}
            {isFullScreen ? 'Salir' : 'Completa'}
          </button>
        </div>
      </div>

      {/* Mode indicator bar */}
      <div className={`w-full text-center py-1.5 mb-2 rounded-lg text-xs font-bold transition-all ${
        isDragMode
          ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
          : 'bg-indigo-950/60 text-indigo-300 border border-indigo-800'
      }`}>
        {isDragMode ? (
          <span className="flex items-center justify-center gap-2">
            <Move className="w-3.5 h-3.5" /> MODO POSICIÓN: Arrastra los campos para moverlos — Sincronizado con el Panel de Calibración
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Edit3 className="w-3.5 h-3.5 text-amber-400" /> MODO EDICIÓN: Clic en cualquier campo lo selecciona en el Panel de Calibración
          </span>
        )}
      </div>

      {/* CANVAS */}
      <div className="w-full overflow-auto flex justify-center py-2">
        <div
          ref={containerRef}
          className={`relative w-full aspect-[297/210] max-w-[1000px] bg-white overflow-hidden border-2 select-none shadow-2xl transition-all duration-150 origin-top text-[13px] font-sans ${
            isDragMode ? 'border-amber-500/50' : 'border-slate-700'
          }`}
          style={{
            transform: `scale(${zoomScale})`,
          }}
        >
          {/* Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
          )}

          {/* Render all fields dynamically */}
          {fields.map(renderField)}
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-400 flex items-center gap-4">
        <span>📐 Canvas A4 Horizontal — Conectado al Panel de Calibración</span>
        <span>✍️ Selección bidireccional activada</span>
      </div>
    </div>
  );
};
