from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# Add src/lib to path so python_docx_exporter can be imported natively by Vercel
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, '..'))
lib_dir = os.path.join(root_dir, 'src', 'lib')
plantillas_dir = os.path.join(root_dir, 'plantillas')

if lib_dir not in sys.path:
    sys.path.append(lib_dir)

from python_docx_exporter import generar_consolidado_multi_estudiante, find_gold_template


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            students = data.get('students', [])
            field_positions = data.get('fieldPositions', {})
            coordinates = data.get('coordinates', {})

            if coordinates and not field_positions:
                field_positions = {}
                for cid, c in coordinates.items():
                    fk = c.get('fieldKey', '')
                    if fk:
                        key = 'ano_egreso' if fk in ['año_egreso', 'ano_egreso'] else \
                              'nombre_estudiante' if fk in ['estudiante_nombre', 'nombre_estudiante'] else \
                              'cedula_estudiante' if fk in ['estudiante_cedula', 'cedula_estudiante'] else \
                              fk.replace('firmante_', '') if fk.startswith('firmante_') else fk
                        field_positions[key] = {
                            'top': round((c.get('y_mm', 0) / 215.9) * 100, 1),
                            'left': round((c.get('x_mm', 0) / 279.4) * 100, 1),
                            'width': round((c.get('width_mm', 0) / 279.4) * 100, 1),
                        }

            if isinstance(students, dict):
                students = [students]

            if not students:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'No se enviaron estudiantes.'}).encode('utf-8'))
                return

            tmp_output = os.path.join('/tmp', f'output_{os.getpid()}.docx')
            template_file = find_gold_template(plantillas_dir)

            generar_consolidado_multi_estudiante(template_file, students, tmp_output, field_positions)

            with open(tmp_output, 'rb') as f:
                file_bytes = f.read()

            try:
                if os.path.exists(tmp_output):
                    os.remove(tmp_output)
            except Exception:
                pass

            if len(students) == 1:
                st = students[0]
                raw_name = st.get('estudiante_nombre') or st.get('nombre_estudiante') or 'estudiante'
                import re
                clean_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', raw_name)[:40]
                filename = f"titulo_{clean_name}.docx"
            else:
                filename = f"titulos_consolidado_{len(students)}_estudiantes.docx"

            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
            self.end_headers()
            self.wfile.write(file_bytes)

        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
