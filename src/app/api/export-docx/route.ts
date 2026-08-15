import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { generateNativeConsolidatedDocx } from '@/lib/native-docx-exporter';

export async function POST(req: NextRequest) {
  try {
    const { students, fieldPositions } = await req.json();

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No se enviaron datos de estudiantes para exportar.' }, { status: 400 });
    }

    const plantillasDir = path.join(process.cwd(), 'plantillas');
    let templatePath = path.join(plantillasDir, 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx');

    if (!fs.existsSync(templatePath)) {
      const files = fs.readdirSync(plantillasDir);
      const docxFile = files.find(f => f.endsWith('.docx') && !f.includes('chueco') && !f.includes('output'));
      if (docxFile) {
        templatePath = path.join(plantillasDir, docxFile);
      } else {
        return NextResponse.json({ error: 'No se encontró la plantilla base .docx.' }, { status: 500 });
      }
    }

    const templateBuffer = fs.readFileSync(templatePath);
    const outputBuffer = generateNativeConsolidatedDocx(templateBuffer, students, fieldPositions || {});

    const timestamp = Date.now();
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="titulos_consolidado_${timestamp}.docx"`,
      },
    });
  } catch (err: any) {
    console.error('Error en export-docx route:', err);
    return NextResponse.json({
      error: err.message || 'Error al exportar documento.',
    }, { status: 500 });
  }
}
