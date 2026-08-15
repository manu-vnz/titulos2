import glob
import zipfile
import xml.etree.ElementTree as ET
import re

def parse_full(path):
    with zipfile.ZipFile(path) as z:
        xml_content = z.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        raw_tokens = []
        for p in tree.iter():
            if p.tag.endswith('}p'):
                txt = ''.join([node.text for node in p.iter() if node.tag.endswith('}t') and node.text]).strip()
                if txt:
                    parts = [pt.strip() for pt in re.split(r'\s{2,}|\t', txt) if pt.strip()]
                    for pt in parts:
                        if pt not in raw_tokens:
                            raw_tokens.append(pt)
                            
    data = {
        'plantel': '',
        'codigo_plantel': '',
        'titulo_otorgado': 'BACHILLER',
        'plan_estudio': '',
        'estudiante_nombre': '',
        'estudiante_cedula': '',
        'lugar_nacimiento': '',
        'fecha_nacimiento': '',
        'lugar_fecha_expedicion': '',
        'año_egreso': '',
        'firmante_director_nombre': '',
        'firmante_director_cedula': '',
        'firmante_coordinador_nombre': '',
        'firmante_coordinador_cedula': '',
        'firmante_funcionario_nombre': '',
        'firmante_funcionario_cedula': ''
    }

    cedulas = []
    fechas = []
    names = []

    for t in raw_tokens:
        if re.search(r'COMPLEJO|UNIDAD|LICEO|COLEGIO|ZONA\s+EDUCATIVA', t, re.I) and not data['plantel']:
            data['plantel'] = t
        elif re.search(r'^[A-Z]\d{4}[A-Z0-9]\d{4}$|^[A-Z0-9]{9,11}$', t) and not data['codigo_plantel']:
            data['codigo_plantel'] = t
        elif re.search(r'EDUCACI[ÓO]N\s+MEDIA\s+GENERAL', t, re.I) and not data['plan_estudio']:
            data['plan_estudio'] = t
        elif re.search(r'VENEZUELA|MUNICIPIO', t, re.I) and not re.search(r'VALENCIA.*DE.*20\d{2}', t, re.I) and not data['lugar_nacimiento']:
            data['lugar_nacimiento'] = t
        elif re.search(r'(VALENCIA|CARABOBO|CARACAS).*DE.*20\d{2}', t, re.I) and not data['lugar_fecha_expedicion']:
            data['lugar_fecha_expedicion'] = t
        elif re.search(r'^20\d{2}$', t) and not data['año_egreso']:
            data['año_egreso'] = t

        # Cedula
        c_match = re.search(r'V\s*[\.-]?\s*\d{1,2}[\.\s]\d{3}[\.\s]\d{3}', t, re.I)
        if c_match:
            c_val = c_match.group(0).upper().replace('  ', ' ')
            if c_val not in cedulas:
                cedulas.append(c_val)

        # Fecha nac
        f_match = re.search(r'\d{2}\s+DE\s+[A-ZÁÉÍÓÚÑ]+\s+DE\s+200\d|\d{2}\s+DE\s+[A-ZÁÉÍÓÚÑ]+\s+DE\s+201[0-4]', t, re.I)
        if f_match and not data['fecha_nacimiento']:
            data['fecha_nacimiento'] = f_match.group(0)

        # Person Names
        words = t.split()
        if 2 <= len(words) <= 5 and re.match(r'^[A-ZÁÉÍÓÚÑ\s]+$', t, re.I):
            if not re.search(r'EDUCACIÓN|BACHILLER|COMPLEJO|UNIDAD|VENEZUELA|MUNICIPIO|VALENCIA|CARABOBO|JULIO|JUNIO|ENERO|FEBRERO|MARZO|ABRIL|MAYO|AGOSTO|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE|LICEO|COLEGIO|ZONA', t, re.I):
                if t not in names:
                    names.append(t)

    # Sort cedulas
    if cedulas:
        student_cedula = max(cedulas, key=lambda c: int(re.sub(r'\D', '', c) or 0))
        data['estudiante_cedula'] = student_cedula
        signer_cedulas = [c for c in cedulas if c != student_cedula]
    else:
        signer_cedulas = []

    if names:
        data['estudiante_nombre'] = names[0]
        signer_names = names[1:]
    else:
        signer_names = []

    # Map Signer names & cedulas
    if len(signer_names) >= 3:
        data['firmante_director_nombre'] = signer_names[0]
        data['firmante_coordinador_nombre'] = signer_names[1]
        data['firmante_funcionario_nombre'] = signer_names[2]
    if len(signer_cedulas) >= 3:
        data['firmante_director_cedula'] = signer_cedulas[0]
        data['firmante_coordinador_cedula'] = signer_cedulas[1]
        data['firmante_funcionario_cedula'] = signer_cedulas[2]

    print('=== PARSED:', path.split('\\')[-1], '===')
    for k, v in data.items():
        print(f'  {k}: {v}')

for filepath in glob.glob(r'f:\intento 2\plantillas\*.docx'):
    parse_full(filepath)
