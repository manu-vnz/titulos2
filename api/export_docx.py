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

            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            self.send_header('Content-Disposition', 'attachment; filename="titulos_consolidado.docx"')
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
