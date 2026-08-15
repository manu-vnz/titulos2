import zipfile
import xml.etree.ElementTree as ET

path = r'f:\intento 2\plantillas\JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx'

with zipfile.ZipFile(path) as z:
    xml_content = z.read('word/document.xml')
    
    # Print raw namespaces
    tree = ET.fromstring(xml_content)
    
    # Look for textbox / shape elements in various namespaces
    ns_map = {
        'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'wp': 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
        'wps': 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
        'v': 'urn:schemas-microsoft-com:vml',
        'mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
        'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
    }
    
    # Check for VML shapes (v:shape, v:textbox)
    vml_shapes = list(tree.iter('{urn:schemas-microsoft-com:vml}shape'))
    print(f"VML shapes found: {len(vml_shapes)}")
    
    for i, shape in enumerate(vml_shapes):
        style = shape.get('style', '')
        txt_nodes = shape.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        text = ''.join([t.text for t in txt_nodes if t.text]).strip()
        if text:
            print(f"\n--- VML Shape #{i} ---")
            print(f"  Style: {style}")
            print(f"  Text: {text[:100]}")
    
    # Check for wps:wsp (Word Processing Shape)
    wps_shapes = list(tree.iter('{http://schemas.microsoft.com/office/word/2010/wordprocessingShape}wsp'))
    print(f"\nWPS shapes found: {len(wps_shapes)}")
    
    for i, wsp in enumerate(wps_shapes):
        txt_nodes = wsp.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        text = ''.join([t.text for t in txt_nodes if t.text]).strip()
        
        # Get position from parent drawing
        if text:
            print(f"\n--- WPS Shape #{i} ---")
            print(f"  Text: {text[:100]}")
    
    # Check wp:anchor and wp:inline for positioning
    anchors = list(tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}anchor'))
    inlines = list(tree.iter('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}inline'))
    print(f"\nwp:anchor elements: {len(anchors)}")
    print(f"wp:inline elements: {len(inlines)}")
    
    for i, anc in enumerate(anchors):
        posH = anc.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}positionH')
        posV = anc.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}positionV')
        extent = anc.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}extent')
        
        hOffset = '?'
        vOffset = '?'
        if posH is not None:
            off = posH.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}posOffset')
            if off is not None and off.text:
                hOffset = off.text
        if posV is not None:
            off = posV.find('{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}posOffset')
            if off is not None and off.text:
                vOffset = off.text
        
        cx = extent.get('cx', '?') if extent is not None else '?'
        cy = extent.get('cy', '?') if extent is not None else '?'
        
        # Get text inside this anchor
        txt_nodes = anc.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
        text = ''.join([t.text for t in txt_nodes if t.text]).strip()
        
        if text:
            print(f"\n--- Anchor #{i} ---")
            print(f"  H offset (EMU): {hOffset}, V offset (EMU): {vOffset}")
            if hOffset != '?':
                print(f"  H mm: {int(hOffset)/36000:.1f}, V mm: {int(vOffset)/36000:.1f}")
            print(f"  Size cx={cx}, cy={cy}")
            if cx != '?':
                print(f"  Width mm: {int(cx)/36000:.1f}, Height mm: {int(cy)/36000:.1f}")
            print(f"  Text: {text[:100]}")
