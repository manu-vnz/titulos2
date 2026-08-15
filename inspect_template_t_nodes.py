import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('public/plantilla_base_titulo.docx') as z:
    xml_content = z.read('word/document.xml').decode('utf-8')
    
    # Find all w:t text nodes
    tree = ET.fromstring(xml_content)
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    print("=== ALL TEXT NODES IN TEMPLATE ===")
    for i, t in enumerate(tree.findall('.//w:t', ns)):
        print(f"t[{i}]: '{t.text}'")
