import zipfile
import xml.etree.ElementTree as ET

def verify():
    # Run node script test_multi_student.js first
    with zipfile.ZipFile('test_multi_student_consolidated.docx') as z:
        xml_content = z.read('word/document.xml').decode('utf-8')
        print("DOCUMENT XML LENGTH:", len(xml_content))
        
        # Check student names in XML
        for name in ['JESUS MANUEL VARGAS NOGUERA', 'RICHARD EDUARDO SUAREZ TISOY', 'REINALDO DAVID GARCÍA CAMPOS', 'JUAN DAVID GUANIPA BALLEN']:
            count = xml_content.count(name)
            print(f"Name '{name}' found {count} time(s) in exported DOCX")

verify()
