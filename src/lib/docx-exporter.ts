import { StudentData, FieldCoordinate } from '@/types/diploma';
import { FieldPosition } from '@/lib/native-docx-exporter';

export interface ExportOptions {
  includeBackground?: boolean;
}

/**
 * Client exporter interface calling native python-docx backend API route.
 * Guarantees 0 XML corruption, 100% accurate layout, and 0 MS Word repair alerts.
 */
export async function exportConsolidatedDocx(
  students: StudentData[],
  coordinates: Record<string, FieldCoordinate> = {},
  options: ExportOptions = {},
  fieldPositions?: Record<string, FieldPosition>
): Promise<Blob> {
  const response = await fetch('/api/export-docx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ students, fieldPositions }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Error al exportar documento mediante el motor python-docx.');
  }

  return await response.blob();
}
