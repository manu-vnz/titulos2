'use client';

import React, { useRef } from 'react';
import { FieldCoordinate, TemplatePreset } from '@/types/diploma';
import { FieldPosition } from '@/components/DiplomaCanvas';
import { Sliders, RotateCcw, Save, Upload, Eye, EyeOff, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface CalibrationPanelProps {
  coordinates: Record<string, FieldCoordinate>;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onUpdateCoordinate: (id: string, updated: Partial<FieldCoordinate>) => void;
  onResetCoordinates: () => void;
  onLoadPreset: (preset: TemplatePreset) => void;
  fieldPositions?: Record<string, FieldPosition>;
}

export const CalibrationPanel: React.FC<CalibrationPanelProps> = ({
  coordinates,
  selectedFieldId,
  onSelectField,
  onUpdateCoordinate,
  onResetCoordinates,
  onLoadPreset,
  fieldPositions,
}) => {
  const jsonFileInputRef = useRef<HTMLInputElement>(null);

  const selectedCoord = selectedFieldId ? coordinates[selectedFieldId] : null;

  const handleExportJSON = () => {
    const preset: TemplatePreset = {
      id: `preset_${Date.now()}`,
      name: 'Calibración Título de Bachiller (Carta Horizontal)',
      createdAt: new Date().toISOString(),
      coordinates,
      fieldPositions: fieldPositions || {},
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `plantilla_coordenadas_titulo_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.coordinates || parsed.fieldPositions) {
          onLoadPreset(parsed);
          alert('¡Plantilla de coordenadas y posiciones cargada con éxito!');
        } else {
          alert('El archivo JSON no tiene un formato válido de plantilla de coordenadas.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON de plantilla.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input file
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Panel de Calibración (Carta Horizontal)
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onResetCoordinates}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-1"
            title="Restablecer coordenadas por defecto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restablecer
          </button>
        </div>
      </div>

      {/* Presets Import/Export */}
      <div className="flex gap-2">
        <button
          onClick={handleExportJSON}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          title="Guardar archivo JSON de coordenadas"
        >
          <Save className="w-3.5 h-3.5 text-emerald-400" /> Guardar JSON Presets
        </button>

        <button
          onClick={() => jsonFileInputRef.current?.click()}
          className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
          title="Cargar archivo JSON de coordenadas"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" /> Cargar JSON Presets
        </button>
        <input
          ref={jsonFileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportJSON}
        />
      </div>

      {/* Field Selector Dropdown */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          Seleccionar Campo a Calibrar:
        </label>
        <select
          value={selectedFieldId || ''}
          onChange={e => onSelectField(e.target.value)}
          className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl p-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
        >
          <option value="" disabled>-- Elige un campo del título --</option>
          {Object.values(coordinates).map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Field Detail Controls */}
      {selectedCoord ? (
        <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <span className="text-xs font-bold text-indigo-300 truncate">
              {selectedCoord.label}
            </span>
            <button
              onClick={() => onUpdateCoordinate(selectedCoord.id, { is_visible: !selectedCoord.is_visible })}
              className={`p-1 rounded text-xs flex items-center gap-1 ${
                selectedCoord.is_visible ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500'
              }`}
            >
              {selectedCoord.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {selectedCoord.is_visible ? 'Visible' : 'Oculto'}
            </button>
          </div>

          {/* Position X / Y / Width */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Posición X (mm)</label>
              <input
                type="number"
                step="0.5"
                value={selectedCoord.x_mm}
                onChange={e => onUpdateCoordinate(selectedCoord.id, { x_mm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Posición Y (mm)</label>
              <input
                type="number"
                step="0.5"
                value={selectedCoord.y_mm}
                onChange={e => onUpdateCoordinate(selectedCoord.id, { y_mm: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Ancho (mm)</label>
              <input
                type="number"
                step="1"
                value={selectedCoord.width_mm}
                onChange={e => onUpdateCoordinate(selectedCoord.id, { width_mm: parseFloat(e.target.value) || 10 })}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Typography Controls */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium flex items-center gap-1">
                <Type className="w-3 h-3 text-indigo-400" /> Tamaño Fuente (pt)
              </label>
              <input
                type="number"
                step="0.5"
                value={selectedCoord.font_size_pt}
                onChange={e => onUpdateCoordinate(selectedCoord.id, { font_size_pt: parseFloat(e.target.value) || 6 })}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Espaciado Letras (pt)</label>
              <input
                type="number"
                step="0.1"
                value={selectedCoord.letter_spacing_pt}
                onChange={e => onUpdateCoordinate(selectedCoord.id, { letter_spacing_pt: parseFloat(e.target.value) || 0 })}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Alignment & Weight */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Estilo</label>
              <select
                value={selectedCoord.font_weight}
                onChange={e => onUpdateCoordinate(selectedCoord.id, { font_weight: e.target.value as any })}
                className="w-full bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Negrita (Bold)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1 font-medium">Alineación</label>
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => onUpdateCoordinate(selectedCoord.id, { text_align: 'left' })}
                  className={`flex-1 p-1 rounded text-center flex justify-center ${
                    selectedCoord.text_align === 'left' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateCoordinate(selectedCoord.id, { text_align: 'center' })}
                  className={`flex-1 p-1 rounded text-center flex justify-center ${
                    selectedCoord.text_align === 'center' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdateCoordinate(selectedCoord.id, { text_align: 'right' })}
                  className={`flex-1 p-1 rounded text-center flex justify-center ${
                    selectedCoord.text_align === 'right' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-slate-950/40 rounded-xl border border-slate-800/80 text-center text-xs text-slate-500">
          Haz clic sobre cualquier elemento del título en el lienzo para ajustar su calibración precisa.
        </div>
      )}
    </div>
  );
};
