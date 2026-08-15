const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs');

const execPromise = util.promisify(exec);

async function testPythonExec() {
  const libDir = path.join(__dirname, 'src', 'lib');
  const plantillasDir = path.join(__dirname, 'plantillas');
  const templatePath = path.join(plantillasDir, 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx');

  const students = [
    {
      plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
      codigo_plantel: 'S0163D0814',
      titulo_otorgado: 'BACHILLER',
      plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
      estudiante_nombre: 'JESUS MANUEL VARGAS NOGUERA',
      estudiante_cedula: 'V 33.479.449',
      lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA',
      fecha_nacimiento: '09 DE JULIO DE 2009',
      lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
      'año_egreso': '2026',
      firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
      firmante_director_cedula: 'V 18.361.899',
      firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
      firmante_coordinador_cedula: 'V 13.601.460',
      firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
      firmante_funcionario_cedula: 'V 9.445.225',
    }
  ];

  const payloadPath = path.join(__dirname, 'test_py_payload.json');
  const positionsPath = path.join(__dirname, 'test_py_positions.json');
  const outputPath = path.join(__dirname, 'test_py_output.docx');
  const runnerPath = path.join(__dirname, 'test_py_runner.py');

  fs.writeFileSync(payloadPath, JSON.stringify(students, null, 2));
  fs.writeFileSync(positionsPath, JSON.stringify({}, null, 2));

  const runnerCode = `import sys, json, os

lib_dir = r"${libDir.replace(/\\/g, '/')}"
if lib_dir not in sys.path:
    sys.path.append(lib_dir)

from python_docx_exporter import generar_consolidado_multi_estudiante

payload_file = r"${payloadPath.replace(/\\/g, '/')}"
positions_file = r"${positionsPath.replace(/\\/g, '/')}"
template_file = r"${templatePath.replace(/\\/g, '/')}"
output_file = r"${outputPath.replace(/\\/g, '/')}"

with open(payload_file, "r", encoding="utf-8") as f:
    students = json.load(f)

with open(positions_file, "r", encoding="utf-8") as f:
    field_positions = json.load(f)

generar_consolidado_multi_estudiante(template_file, students, output_file, field_positions)
print("PYTHON SUCCESS")
`;

  fs.writeFileSync(runnerPath, runnerCode);

  try {
    const res = await execPromise(`python "${runnerPath}"`);
    console.log("Stdout:", res.stdout);
    console.log("Output file generated:", fs.existsSync(outputPath), fs.statSync(outputPath).size, "bytes");
  } catch (err) {
    console.error("Python exec failed:", err);
  }
}

testPythonExec();
