import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('public/plantilla_base_titulo.docx') as z:
    xml_content = z.read('word/document.xml').decode('utf-8')
    tree = ET.fromstring(xml_content)
    
    shapes = list(tree.iter('{urn:schemas-microsoft-com:vml}shape'))
    print("=== TEMPLATE SHAPES ===")
    for idx, s in enumerate(shapes):
        shape_id = s.get('id')
        spid = s.get('{urn:schemas-microsoft-com:office:office}spid')
        print(f"Shape #{idx}: id='{shape_id}', spid='{spid}'")
