import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  let payloadPath = '';
  let runnerPath = '';
  let outputPath = '';
  let positionsPath = '';

  try {
    const { students, templateFilename, fieldPositions } = await req.json();

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

    let templatePath = path.join(plantillasDir, 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx');
    if (!fs.existsSync(templatePath)) {
      templatePath = '';
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

template_file = r"${templatePath.replace(/\\/g, '/')}" if r"${templatePath.replace(/\\/g, '/')}" and os.path.exists(r"${templatePath.replace(/\\/g, '/')}") else find_gold_template(plantillas_dir)

with open(payload_file, "r", encoding="utf-8") as f:
    students = json.load(f)

with open(positions_file, "r", encoding="utf-8") as f:
    field_positions = json.load(f)

generar_consolidado_multi_estudiante(template_file, students, output_file, field_positions)
print("SUCCESS")
`;

    fs.writeFileSync(runnerPath, pyScript, 'utf-8');

    let stdout = '';
    let stderr = '';
    try {
      const execResult = await execPromise(`python3 "${runnerPath}"`);
      stdout = execResult.stdout;
      stderr = execResult.stderr;
    } catch (cmdErr1: any) {
      try {
        const execResult = await execPromise(`python "${runnerPath}"`);
        stdout = execResult.stdout;
        stderr = execResult.stderr;
      } catch (cmdErr2: any) {
        console.error('Python execution error:', cmdErr2);
        return NextResponse.json({
          error: 'Error al ejecutar el script de python-docx.',
          details: cmdErr2.message,
          stderr: cmdErr2.stderr || cmdErr1.stderr || '',
          stdout: cmdErr2.stdout || cmdErr1.stdout || '',
        }, { status: 500 });
      }
    }

    if (!fs.existsSync(outputPath)) {
      return NextResponse.json({
        error: 'El motor de python no generó el archivo de salida.',
        stdout,
        stderr,
      }, { status: 500 });
    }

    const fileBuffer = fs.readFileSync(outputPath);

    try {
      if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath);
      if (fs.existsSync(positionsPath)) fs.unlinkSync(positionsPath);
      if (fs.existsSync(runnerPath)) fs.unlinkSync(runnerPath);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    } catch (e) {
      console.warn('Temp file cleanup warning:', e);
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="titulos_consolidado_${timestamp}.docx"`,
      },
    });
  } catch (err: any) {
    console.error('Unhandled error in /api/export-docx:', err);
    return NextResponse.json({
      error: err.message || 'Error no controlado en la exportación.',
    }, { status: 500 });
  }
}
