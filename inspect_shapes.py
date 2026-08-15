import zipfile
import xml.etree.ElementTree as ET

path_ref = r'f:\intento 2\plantillas\JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx'

with zipfile.ZipFile(path_ref) as z:
    xml_content = z.read('word/document.xml')
    tree = ET.fromstring(xml_content)
    
    shapes = list(tree.iter('{urn:schemas-microsoft-com:vml}shape'))
    print(f"Total VML Shapes found: {len(shapes)}")
    
    for idx, s in enumerate(shapes):
        style = s.get('style', '')
        t_nodes = list(s.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))
        text = ''.join([t.text for t in t_nodes if t.text]).strip()
        print(f"Shape #{idx}: text='{text}'")
        print(f"   style='{style}'\n")
