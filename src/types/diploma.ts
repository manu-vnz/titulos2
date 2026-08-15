export interface StudentData {
  id: string;
  filename: string;
  plantel: string;
  codigo_plantel: string;
  titulo_otorgado: string;
  plan_estudio: string;
  estudiante_nombre: string;
  estudiante_cedula: string;
  lugar_nacimiento: string;
  fecha_nacimiento: string;
  lugar_fecha_expedicion: string;
  año_egreso: string;
  firmante_director_nombre: string;
  firmante_director_cedula: string;
  firmante_coordinador_nombre: string;
  firmante_coordinador_cedula: string;
  firmante_funcionario_nombre: string;
  firmante_funcionario_cedula: string;
  raw_tokens: string[];
  is_valid: boolean;
  parse_warnings: string[];
  extracted_coordinates?: Record<string, Partial<FieldCoordinate>>;
}

export type FieldKey = keyof Omit<StudentData, 'id' | 'filename' | 'raw_tokens' | 'is_valid' | 'parse_warnings' | 'extracted_coordinates'>;

export interface FieldCoordinate {
  id: string; // unique key, e.g. "plantel_1" or "plantel_2"
  fieldKey: FieldKey;
  label: string;
  x_mm: number;
  y_mm: number;
  width_mm: number;
  font_size_pt: number;
  font_family: string;
  font_weight: 'normal' | 'bold' | '500' | '600' | '700';
  letter_spacing_pt: number;
  text_align: 'left' | 'center' | 'right';
  color?: string;
  is_second_copy: boolean; // if this belongs to lower half of continuous title
  is_visible: boolean;
}

export interface TemplatePreset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  coordinates: Record<string, FieldCoordinate>;
  fieldPositions?: Record<string, { top: number; left: number; width?: number }>;
}
