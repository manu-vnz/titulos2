import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { generateNativeConsolidatedDocx } from '@/lib/native-docx-exporter';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  let payloadPath = '';
  let positionsPath = '';
  let runnerPath = '';
  let outputPath = '';

  try {
    let { students, fieldPositions, coordinates } = await req.json();

    if (coordinates && (!fieldPositions || Object.keys(fieldPositions).length === 0)) {
      fieldPositions = {};
      for (const [, c] of Object.entries(coordinates as Record<string, any>)) {
        const fk = c?.fieldKey || '';
        if (fk) {
          const key = fk === 'año_egreso' ? 'ano_egreso' :
                      fk === 'estudiante_nombre' ? 'nombre_estudiante' :
                      fk === 'estudiante_cedula' ? 'cedula_estudiante' :
                      fk.startsWith('firmante_') ? fk.replace(/^firmante_/, '') : fk;
          fieldPositions[key] = {
            top: parseFloat((( (c.y_mm || 0) / 215.9) * 100).toFixed(1)),
            left: parseFloat((( (c.x_mm || 0) / 279.4) * 100).toFixed(1)),
            width: parseFloat((( (c.width_mm || 0) / 279.4) * 100).toFixed(1)),
          };
        }
      }
    }

    if (students && !Array.isArray(students)) {
      students = [students];
    }

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'No se enviaron datos de estudiantes para exportar.' }, { status: 400 });
    }

    const tmpDir = os.tmpdir();
    const timestamp = Date.now();
    payloadPath = path.join(tmpDir, `payload_${timestamp}.json`);
    positionsPath = path.join(tmpDir, `positions_${timestamp}.json`);
    outputPath = path.join(tmpDir, `output_${timestamp}.docx`);
    runnerPath = path.join(tmpDir, `runner_${timestamp}.py`);

    const libDir = path.join(process.cwd(), 'src', 'lib');
    const plantillasDir = path.join(process.cwd(), 'plantillas');

    const goldFileName = 'titulo_BREINER_BALDALLO_LUNA_V34857655_solo_texto cuadre.docx';
    let templatePath = path.join(plantillasDir, goldFileName);
    if (!fs.existsSync(templatePath)) {
      const files = fs.existsSync(plantillasDir) ? fs.readdirSync(plantillasDir) : [];
      const docxFile = files.find(f => f.endsWith('.docx') && !f.includes('chueco') && !f.includes('output') && !f.includes('consolidado'));
      if (docxFile) {
        templatePath = path.join(plantillasDir, docxFile);
      } else {
        templatePath = '';
      }
    }

    fs.writeFileSync(payloadPath, JSON.stringify(students, null, 2), 'utf-8');
    fs.writeFileSync(positionsPath, JSON.stringify(fieldPositions || {}, null, 2), 'utf-8');

    const pyScript = `import sys, json, os

lib_dir = r"${libDir.replace(/\\/g, '/')}"
if lib_dir not in sys.path:
    sys.path.append(lib_dir)

from python_docx_exporter import generar_consolidado_multi_estudiante, find_gold_template

payload_file = r"${payloadPath.replace(/\\/g, '/')}"
positions_file = r"${positionsPath.replace(/\\/g, '/')}"
plantillas_dir = r"${plantillasDir.replace(/\\/g, '/')}"
output_file = r"${outputPath.replace(/\\/g, '/')}"
template_file = r"${templatePath.replace(/\\/g, '/')}"

if not template_file or not os.path.exists(template_file):
    template_file = find_gold_template(plantillas_dir)

with open(payload_file, "r", encoding="utf-8") as f:
    students = json.load(f)

with open(positions_file, "r", encoding="utf-8") as f:
    field_positions = json.load(f)

generar_consolidado_multi_estudiante(template_file, students, output_file, field_positions)
print("PYTHON SUCCESS")
`;

    fs.writeFileSync(runnerPath, pyScript, 'utf-8');

    let pythonSuccess = false;
    // 1. Try python command (local environment)
    try {
      await execPromise(`python "${runnerPath}"`);
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        pythonSuccess = true;
      }
    } catch (pyErr1) {
      // 2. Try python3 command (Linux environment)
      try {
        await execPromise(`python3 "${runnerPath}"`);
        if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
          pythonSuccess = true;
        }
      } catch (pyErr2) {
        pythonSuccess = false;
      }
    }

    let fileBuffer: Buffer;

    if (pythonSuccess && fs.existsSync(outputPath)) {
      fileBuffer = fs.readFileSync(outputPath);
    } else {
      // Fallback: use native JS exporter
      if (!fs.existsSync(templatePath)) {
        throw new Error('No se encontró la plantilla base .docx');
      }
      const templateBuffer = fs.readFileSync(templatePath);
      fileBuffer = generateNativeConsolidatedDocx(templateBuffer, students, fieldPositions || {});
    }

    // Cleanup temp files
    try {
      if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath);
      if (fs.existsSync(positionsPath)) fs.unlinkSync(positionsPath);
      if (fs.existsSync(runnerPath)) fs.unlinkSync(runnerPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) {
      // ignore cleanup errors
    }

    let downloadFilename = `titulos_consolidado_${timestamp}.docx`;
    if (students.length === 1) {
      const rawName = students[0]?.estudiante_nombre || students[0]?.nombre_estudiante || 'estudiante';
      const cleanName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 40);
      downloadFilename = `titulo_${cleanName}.docx`;
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${downloadFilename}"`,
      },
    });
  } catch (err: any) {
    console.error('Error en export-docx route:', err);
    return NextResponse.json({
      error: err.message || 'Error al exportar documento.',
    }, { status: 500 });
  }
}
