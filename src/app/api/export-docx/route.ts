import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { generateNativeConsolidatedDocx } from '@/lib/native-docx-exporter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { students, fieldPositions } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No se enviaron datos de estudiantes para exportar.' }, { status: 400 });
    }

    // Try multiple possible locations for the plantillas directory
    const possibleBases = [
      process.cwd(),
      path.join(process.cwd(), '.next', 'server'),
      path.dirname(process.argv[1] || ''),
    ];

    let templatePath = '';
    const goldFileName = 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx';

    for (const base of possibleBases) {
      const candidate = path.join(base, 'plantillas', goldFileName);
      if (fs.existsSync(candidate)) {
        templatePath = candidate;
        break;
      }
    }

    // Fallback: search in cwd plantillas for any docx
    if (!templatePath) {
      const plantillasDir = path.join(process.cwd(), 'plantillas');
      if (fs.existsSync(plantillasDir)) {
        const files = fs.readdirSync(plantillasDir);
        const docxFile = files.find(f => f.endsWith('.docx') && !f.includes('chueco') && !f.includes('output') && !f.includes('consolidado'));
        if (docxFile) {
          templatePath = path.join(plantillasDir, docxFile);
        }
      }
    }

    if (!templatePath) {
      return NextResponse.json({
        error: 'No se encontró la plantilla base .docx en el servidor.',
        debug: {
          cwd: process.cwd(),
          plantillasExists: fs.existsSync(path.join(process.cwd(), 'plantillas')),
          plantillasContents: fs.existsSync(path.join(process.cwd(), 'plantillas'))
            ? fs.readdirSync(path.join(process.cwd(), 'plantillas')).slice(0, 10)
            : [],
        }
      }, { status: 500 });
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
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    }, { status: 500 });
  }
}
