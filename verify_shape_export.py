import zipfile

with zipfile.ZipFile('test_perfect_shape_export.docx') as z:
    xml_content = z.read('word/document.xml').decode('utf-8')
    print("=== VERIFYING REPLACED FIELDS IN EXPORTED DOCX ===")
    print("RICHARD EDUARDO SUAREZ TISOY in DOCX:", 'RICHARD EDUARDO SUAREZ TISOY' in xml_content)
    print("V 33.506.482 in DOCX:", 'V 33.506.482' in xml_content)
    print("07 DE JULIO DE 2009 in DOCX:", '07 DE JULIO DE 2009' in xml_content)
    print("JOHN DANIEL ZAPATA MIRELES in DOCX:", 'JOHN DANIEL ZAPATA MIRELES' in xml_content)
    print("WILMER JOSÉ LUGO RODRÍGUEZ in DOCX:", 'WILMER JOSÉ LUGO RODRÍGUEZ' in xml_content)
