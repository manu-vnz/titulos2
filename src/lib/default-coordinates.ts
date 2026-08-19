import { FieldCoordinate } from '@/types/diploma';

// LANDSCAPE Letter (Carta Horizontal): 11" x 8.5" = 279.4mm x 215.9mm
export const LETTER_WIDTH_MM = 279.4;   // 11 inches (width)
export const LETTER_HEIGHT_MM = 215.9;  // 8.5 inches (height)

// Page size in DXA for DOCX export
export const LETTER_WIDTH_DXA = 12240;
export const LETTER_HEIGHT_DXA = 15840;

// Reference margins (in DXA and mm)
export const MARGIN_TOP_DXA = 1701;
export const MARGIN_LEFT_DXA = 1417;
export const MARGIN_BOTTOM_DXA = 1701;
export const MARGIN_RIGHT_DXA = 1417;

/**
 * MAPEO EXPLÍCITO campo-por-campo, sin bucles sobre índices.
 * Cada fieldKey coincide exactamente con la propiedad de StudentData.
 * Las coordenadas Y están alineadas línea-a-línea con la imagen de fondo del título.
 */
export const DEFAULT_FIELD_COORDINATES: Record<string, FieldCoordinate> = {
  // ─── LÍNEA 1: Zona Educativa / Plantel ───
  plantel_1: {
    id: 'plantel_1',
    fieldKey: 'plantel',
    label: 'Zona Educativa / Plantel',
    x_mm: 90.8,
    y_mm: 62.6,
    width_mm: 139.7,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 2: Código DEA ───
  codigo_plantel_1: {
    id: 'codigo_plantel_1',
    fieldKey: 'codigo_plantel',
    label: 'Código DEA',
    x_mm: 55.9,
    y_mm: 69.1,
    width_mm: 69.9,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 3: Título Otorgado ───
  titulo_otorgado_1: {
    id: 'titulo_otorgado_1',
    fieldKey: 'titulo_otorgado',
    label: 'Título de',
    x_mm: 55.9,
    y_mm: 75.6,
    width_mm: 83.8,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0.5,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 4: Plan de Estudio ───
  plan_estudio_1: {
    id: 'plan_estudio_1',
    fieldKey: 'plan_estudio',
    label: 'Plan de estudio, Código Nro.',
    x_mm: 102.0,
    y_mm: 81.6,
    width_mm: 125.7,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 5: Nombre del Estudiante ───
  estudiante_nombre_1: {
    id: 'estudiante_nombre_1',
    fieldKey: 'estudiante_nombre',
    label: 'Que se otorga a (Estudiante)',
    x_mm: 71.2,
    y_mm: 87.7,
    width_mm: 125.7,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0.5,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 6: Cédula de Identidad ───
  estudiante_cedula_1: {
    id: 'estudiante_cedula_1',
    fieldKey: 'estudiante_cedula',
    label: 'Cédula de Identidad Nro.',
    x_mm: 88.0,
    y_mm: 93.9,
    width_mm: 78.2,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 7: Lugar de Nacimiento ───
  lugar_nacimiento_1: {
    id: 'lugar_nacimiento_1',
    fieldKey: 'lugar_nacimiento',
    label: 'Nacido (a) en',
    x_mm: 62.9,
    y_mm: 99.7,
    width_mm: 153.7,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 8: Fecha de Nacimiento ───
  fecha_nacimiento_1: {
    id: 'fecha_nacimiento_1',
    fieldKey: 'fecha_nacimiento',
    label: 'En Fecha',
    x_mm: 54.5,
    y_mm: 105.8,
    width_mm: 97.8,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 9: Lugar y Fecha de Expedición ───
  lugar_fecha_expedicion_1: {
    id: 'lugar_fecha_expedicion_1',
    fieldKey: 'lugar_fecha_expedicion',
    label: 'Lugar y Fecha de expedición',
    x_mm: 103.4,
    y_mm: 123.1,
    width_mm: 134.1,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ─── LÍNEA 10: Año de Egreso ───
  año_egreso_1: {
    id: 'año_egreso_1',
    fieldKey: 'año_egreso',
    label: 'Año de Egreso',
    x_mm: 64.3,
    y_mm: 129.1,
    width_mm: 55.9,
    font_size_pt: 10,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'left',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // ═══ FIRMANTES ═══
  // Columna Izquierda: Coordinador de Control de Estudio
  firmante_coordinador_nombre_1: {
    id: 'firmante_coordinador_nombre_1',
    fieldKey: 'firmante_coordinador_nombre',
    label: 'Nombre Coordinador C.E.',
    x_mm: 61.5,
    y_mm: 152.9,
    width_mm: 78.2,
    font_size_pt: 8,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'center',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },
  firmante_coordinador_cedula_1: {
    id: 'firmante_coordinador_cedula_1',
    fieldKey: 'firmante_coordinador_cedula',
    label: 'C.I. Coordinador C.E.',
    x_mm: 61.5,
    y_mm: 157.6,
    width_mm: 78.2,
    font_size_pt: 8,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'center',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // Columna Centro: Funcionario Designado MPPE
  firmante_funcionario_nombre_1: {
    id: 'firmante_funcionario_nombre_1',
    fieldKey: 'firmante_funcionario_nombre',
    label: 'Nombre Funcionario MPPE',
    x_mm: 139.7,
    y_mm: 152.9,
    width_mm: 78.2,
    font_size_pt: 8,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'center',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },
  firmante_funcionario_cedula_1: {
    id: 'firmante_funcionario_cedula_1',
    fieldKey: 'firmante_funcionario_cedula',
    label: 'C.I. Funcionario MPPE',
    x_mm: 139.7,
    y_mm: 157.6,
    width_mm: 78.2,
    font_size_pt: 8,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'center',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },

  // Columna Derecha: Director del Plantel
  firmante_director_nombre_1: {
    id: 'firmante_director_nombre_1',
    fieldKey: 'firmante_director_nombre',
    label: 'Nombre Director Plantel',
    x_mm: 217.9,
    y_mm: 152.9,
    width_mm: 78.2,
    font_size_pt: 8,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'center',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },
  firmante_director_cedula_1: {
    id: 'firmante_director_cedula_1',
    fieldKey: 'firmante_director_cedula',
    label: 'C.I. Director Plantel',
    x_mm: 217.9,
    y_mm: 157.6,
    width_mm: 78.2,
    font_size_pt: 8,
    font_family: 'Arial',
    font_weight: 'bold',
    letter_spacing_pt: 0,
    text_align: 'center',
    color: '#000000',
    is_second_copy: false,
    is_visible: true,
  },
};

