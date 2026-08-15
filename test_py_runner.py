import sys, json, os

lib_dir = r"F:/intento 2/src/lib"
if lib_dir not in sys.path:
    sys.path.append(lib_dir)

from python_docx_exporter import generar_consolidado_multi_estudiante

payload_file = r"F:/intento 2/test_py_payload.json"
positions_file = r"F:/intento 2/test_py_positions.json"
template_file = r"F:/intento 2/plantillas/JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx"
output_file = r"F:/intento 2/test_py_output.docx"

with open(payload_file, "r", encoding="utf-8") as f:
    students = json.load(f)

with open(positions_file, "r", encoding="utf-8") as f:
    field_positions = json.load(f)

generar_consolidado_multi_estudiante(template_file, students, output_file, field_positions)
print("PYTHON SUCCESS")
