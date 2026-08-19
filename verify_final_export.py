import sys
import os
import json
import zipfile
import xml.etree.ElementTree as ET

sys.path.append(os.path.join(os.getcwd(), 'src', 'lib'))
from python_docx_exporter import generar_consolidado_multi_estudiante, find_gold_template

plantillas_dir = os.path.join(os.getcwd(), 'plantillas')
template_path = find_gold_template(plantillas_dir)
print(f"Selected Gold Template: {template_path}")

assert "titulo_BREINER_BALDALLO_LUNA_V34857655_solo_texto cuadre.docx" in template_path, "Template should be Breiner!"

test_students = [
    {
        'plantel': 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
        'codigo_plantel': 'S0163D0814',
        'titulo_otorgado': 'BACHILLER',
        'plan_estudio': 'EDUCACIÓN MEDIA GENERAL, 31059',
        'estudiante_nombre': 'CARLOS ALBERTO MENDOZA SILVA',
        'estudiante_cedula': 'V 31.999.888',
        'lugar_nacimiento': 'VENEZUELA, CARABOBO, MUNICIPIO VALENCIA',
        'fecha_nacimiento': '15 DE MARZO DE 2008',
        'lugar_fecha_expedicion': 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
        'año_egreso': '2026',
        'firmante_director_nombre': 'JOHN DANIEL ZAPATA MIRELES',
        'firmante_director_cedula': 'V 18.361.899',
        'firmante_coordinador_nombre': 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
        'firmante_coordinador_cedula': 'V 13.601.460',
        'firmante_funcionario_nombre': 'WILMER JOSÉ LUGO RODRÍGUEZ',
        'firmante_funcionario_cedula': 'V 9.445.225',
    }
]

output_file = "verify_final_output.docx"
generar_consolidado_multi_estudiante(template_path, test_students, output_file)

# Inspect generated DOCX XML
with zipfile.ZipFile(output_file) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)

    inlines = list(tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}inline'))
    anchors = list(tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}anchor'))

    print(f"\nVerification Results:")
    print(f"  wp:inline count: {len(inlines)} (Expected: 0)")
    print(f"  wp:anchor count: {len(anchors)}")

    assert len(inlines) == 0, "All inline elements should have been converted to anchor!"
    assert len(anchors) > 0, "There should be floating anchor elements!"

    for idx, anc in enumerate(anchors):
        behind_doc = anc.get('behindDoc')
        rel_height = anc.get('relativeHeight')
        wrap_none = anc.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}wrapNone')
        assert behind_doc == '0', f"Anchor #{idx} behindDoc should be '0', got {behind_doc}"
        assert wrap_none is not None, f"Anchor #{idx} must have <wp:wrapNone/> element!"
        assert int(rel_height or 0) > 0, f"Anchor #{idx} relativeHeight should be positive, got {rel_height}"

    # Verify text replacements
    txt_nodes = tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
    full_text = ''.join([t.text for t in txt_nodes if t.text])
    print(f"  Contains new student name ('CARLOS ALBERTO MENDOZA SILVA'): {'CARLOS ALBERTO MENDOZA SILVA' in full_text}")
    print(f"  Contains new cedula ('V 31.999.888'): {'V 31.999.888' in full_text}")
    assert 'CARLOS ALBERTO MENDOZA SILVA' in full_text, "New student name should be in the exported DOCX!"

print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")
