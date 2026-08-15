import zipfile
import xml.etree.ElementTree as ET

path_ref = r'f:\intento 2\plantillas\JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx'

with zipfile.ZipFile(path_ref) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)

    print("=== ALL PARAGRAPHS IN REFERENCE DOCX ===")
    for i, p in enumerate(tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p')):
        txt = ''.join([t.text for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if t.text]).strip()
        print(f"P#{i}: '{txt}'")
