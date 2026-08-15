import { StudentData, FieldCoordinate } from '@/types/diploma';
import { FieldPosition } from '@/lib/native-docx-exporter';

export interface ExportOptions {
  includeBackground?: boolean;
}

/**
 * Client exporter calling native Vercel Python Function (/api/export_docx)
 * with fallback to Next.js route (/api/export-docx).
 * Guarantees 100% identical document generation between local and Vercel environments.
 */
export async function exportConsolidatedDocx(
  students: StudentData[],
  coordinates: Record<string, FieldCoordinate> = {},
  options: ExportOptions = {},
  fieldPositions?: Record<string, FieldPosition>
): Promise<Blob> {
  // 1. Try native Vercel Python Serverless Function endpoint (/api/export_docx)
  let response: Response | null = await fetch('/api/export_docx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ students, fieldPositions }),
  }).catch(() => null);

  // 2. Fallback to Next.js API route (/api/export-docx) if Python endpoint is not available
  if (!response || !response.ok) {
    response = await fetch('/api/export-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ students, fieldPositions }),
    });
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || 'Error al exportar documento.');
  }

  return await response.blob();
}
