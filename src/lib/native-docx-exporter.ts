import PizZip from 'pizzip';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';

export interface FieldPosition {
  top: number;
  left: number;
  width?: number;
}

function stripAccents(str: string): string {
  return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

const FIELD_TO_TEMPLATE_TEXT: Record<string, string> = {
  plantel:                 'COMPLEJO EDUCATIVO',
  nombre_estudiante:       'BREINER BALDALLO LUNA',
  cedula_estudiante:       'V 34.857.655',
  lugar_fecha_expedicion:  'CARABOBO, VALENCIA, 17 DE JULIO',
  fecha_nacimiento:        '08 DE OCTUBRE DE 2009',
  ano_egreso:              '2026',
  titulo_otorgado:         'BACHILLER',
  codigo_plantel:          'S0163D0814',
  plan_estudio:            'MEDIA GENERAL',
  lugar_nacimiento:        'VENEZUELA, CARABOBO, MUNICIPIO',
  director_cedula:         'V 18.361.899',
  coordinador_cedula:      'V 13.601.460',
  funcionario_cedula:      'V 9.445.225',
  director_nombre:         'JOHN DANIEL ZAPATA',
  coordinador_nombre:      'ALBERTO',
  funcionario_nombre:      'WILMER',
};

const DEFAULT_PREVIEW_POSITIONS: Record<string, { top: number; left: number }> = {
  plantel:                 { top: 29.0,  left: 32.5 },
  codigo_plantel:          { top: 32.0,  left: 20.0 },
  titulo_otorgado:         { top: 35.0,  left: 20.0 },
  plan_estudio:            { top: 37.8,  left: 36.5 },
  nombre_estudiante:       { top: 40.6,  left: 25.5 },
  cedula_estudiante:       { top: 43.5,  left: 31.5 },
  lugar_nacimiento:        { top: 46.2,  left: 22.5 },
  fecha_nacimiento:        { top: 49.0,  left: 19.5 },
  lugar_fecha_expedicion:  { top: 57.0,  left: 37.0 },
  ano_egreso:              { top: 59.8,  left: 23.0 },
  coordinador_nombre:      { top: 70.8,  left: 22.0 },
  coordinador_cedula:      { top: 73.0,  left: 22.0 },
  funcionario_nombre:      { top: 70.8,  left: 50.0 },
  funcionario_cedula:      { top: 73.0,  left: 50.0 },
  director_nombre:         { top: 70.8,  left: 78.0 },
  director_cedula:         { top: 73.0,  left: 78.0 },
};

const SCALE_X = 792.0 / 100.0;
const SCALE_Y = 612.0 / 100.0;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processParagraphNode(
  p: any,
  xmlDoc: any,
  replacements: Array<[string, string]>
) {
  const directRuns: Element[] = [];
  for (let c = 0; c < p.childNodes.length; c++) {
    const child = p.childNodes.item(c) as Element;
    if (child && child.nodeName === 'w:r') {
      directRuns.push(child);
    }
  }

  if (directRuns.length === 0) return;

  let directText = '';
  for (const r of directRuns) {
    const ts = r.getElementsByTagName('w:t');
    for (let tIdx = 0; tIdx < ts.length; tIdx++) {
      directText += ts[tIdx].textContent || '';
    }
  }

  if (!directText.trim()) return;
  const directNorm = stripAccents(directText.toUpperCase());

  for (const [targetStr, replacementStr] of replacements) {
    if (!replacementStr) continue;
    const targetNorm = stripAccents(targetStr.toUpperCase());

    if (directNorm.includes(targetNorm)) {
      const startIdx = directNorm.indexOf(targetNorm);
      const endIdx = startIdx + targetNorm.length;
      const newFullText = directText.substring(0, startIdx) + replacementStr + directText.substring(endIdx);

      let tElem = directRuns[0].getElementsByTagName('w:t')[0];
      if (!tElem) {
        tElem = xmlDoc.createElement('w:t');
        directRuns[0].appendChild(tElem);
      }
      tElem.setAttribute('xml:space', 'preserve');
      tElem.textContent = newFullText;

      let rPrElem = directRuns[0].getElementsByTagName('w:rPr')[0];
      if (!rPrElem) {
        rPrElem = xmlDoc.createElement('w:rPr');
        directRuns[0].insertBefore(rPrElem, directRuns[0].firstChild);
      }
      let bElem = rPrElem.getElementsByTagName('w:b')[0];
      if (!bElem) {
        bElem = xmlDoc.createElement('w:b');
        rPrElem.appendChild(bElem);
      }

      for (let rIdx = 1; rIdx < directRuns.length; rIdx++) {
        const ts = directRuns[rIdx].getElementsByTagName('w:t');
        for (let tIdx = 0; tIdx < ts.length; tIdx++) {
          ts[tIdx].textContent = '';
        }
      }
      break;
    }
  }
}

function getMatchingFieldPosition(matchedField: string, fieldPositions: Record<string, FieldPosition>): FieldPosition | undefined {
  if (!fieldPositions) return undefined;
  const aliases = [
    matchedField,
    matchedField === 'nombre_estudiante' ? 'estudiante_nombre' : matchedField,
    matchedField === 'cedula_estudiante' ? 'estudiante_cedula' : matchedField,
    matchedField === 'ano_egreso' ? 'año_egreso' : matchedField,
    `firmante_${matchedField}`,
    matchedField.replace(/^firmante_/, ''),
  ];
  for (const alias of aliases) {
    if (fieldPositions[alias]) return fieldPositions[alias];
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function processSingleStudentDom(
  rawXml: string,
  studentData: Record<string, any>,
  fieldPositions: Record<string, FieldPosition> = {}
): any {
  const domParser = new DOMParser();
  const xmlDoc = domParser.parseFromString(rawXml, 'text/xml');

  // 1. Process VML shape positions via DOM
  if (fieldPositions && Object.keys(fieldPositions).length > 0) {
    const shapes = xmlDoc.getElementsByTagName('v:shape');
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      const style = shape.getAttribute('style') || '';
      if (!style) continue;

      const shapeText = shape.textContent || '';
      if (!shapeText.trim()) continue;

      let matchedField: string | null = null;
      for (const [fieldKey, searchStr] of Object.entries(FIELD_TO_TEMPLATE_TEXT)) {
        if (stripAccents(shapeText.toUpperCase()).includes(stripAccents(searchStr.toUpperCase()))) {
          matchedField = fieldKey;
          break;
        }
      }

      if (!matchedField) continue;
      const newPos = getMatchingFieldPosition(matchedField, fieldPositions);
      if (!newPos) continue;

      const defPos = DEFAULT_PREVIEW_POSITIONS[matchedField];
      if (!defPos) continue;

      const deltaTopPct = newPos.top - defPos.top;
      const deltaLeftPct = newPos.left - defPos.left;
      if (Math.abs(deltaTopPct) < 0.05 && Math.abs(deltaLeftPct) < 0.05) continue;

      const deltaTopPt = deltaTopPct * SCALE_Y;
      const deltaLeftPt = deltaLeftPct * SCALE_X;

      const mlMatch = style.match(/margin-left:\s*(-?[\d.]+)pt/i);
      const mtMatch = style.match(/margin-top:\s*(-?[\d.]+)pt/i);
      if (mlMatch && mtMatch) {
        const currentMl = parseFloat(mlMatch[1]);
        const currentMt = parseFloat(mtMatch[1]);
        const newMl = Math.max(0, currentMl + deltaLeftPt);
        const newMt = Math.max(0, currentMt + deltaTopPt);

        let newStyle = style.replace(/margin-left:\s*-?[\d.]+pt/i, `margin-left:${newMl.toFixed(2)}pt`);
        newStyle = newStyle.replace(/margin-top:\s*-?[\d.]+pt/i, `margin-top:${newMt.toFixed(2)}pt`);
        shape.setAttribute('style', newStyle);
      }
    }
  }

  // 2. Build text replacements
  const nombre_nuevo = studentData.estudiante_nombre || studentData.nombre_estudiante || studentData.nombre || '';
  const cedula_nueva = studentData.estudiante_cedula || studentData.cedula_estudiante || studentData.cedula || '';
  const plantel_nuevo = studentData.plantel || studentData.zona_educativa_plantel || '';
  const codigo_nuevo = studentData.codigo_plantel || '';
  const titulo_nuevo = studentData.titulo_otorgado || '';
  const plan_nuevo = studentData.plan_estudio || '';
  const lugar_nac_nuevo = studentData.lugar_nacimiento || '';
  const fecha_nac_nueva = studentData.fecha_nacimiento || '';
  const expedicion_nueva = studentData.lugar_fecha_expedicion || '';
  const ano_egreso_nuevo = String(studentData.año_egreso || studentData.ano_egreso || '2026');

  const director_nom = studentData.firmante_director_nombre || studentData.director_nombre || 'JOHN DANIEL ZAPATA MIRELES';
  const director_ci = studentData.firmante_director_cedula || studentData.director_cedula || 'V 18.361.899';
  const coord_nom = studentData.firmante_coordinador_nombre || studentData.coordinador_nombre || 'JOSÉ ALBERTO RUÍZ ÁLVAREZ';
  const coord_ci = studentData.firmante_coordinador_cedula || studentData.coordinador_cedula || 'V 13.601.460';
  const func_nom = studentData.firmante_funcionario_nombre || studentData.funcionario_nombre || 'WILMER JOSÉ LUGO RODRÍGUEZ';
  const func_ci = studentData.firmante_funcionario_cedula || studentData.funcionario_cedula || 'V 9.445.225';

  const replacements: Array<[string, string]> = [];
  if (expedicion_nueva) replacements.push(['CARABOBO, VALENCIA, 17 DE JULIO DE 2026', expedicion_nueva]);
  if (lugar_nac_nuevo) {
    replacements.push(['VENEZUELA, CARABOBO, MUNICIPIO VALENCIA', lugar_nac_nuevo]);
    replacements.push(['VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA', lugar_nac_nuevo]);
  }
  if (plan_nuevo) {
    replacements.push(['EDUCACIÓN MEDIA GENERAL, 31059', plan_nuevo]);
    replacements.push(['EDUCACION MEDIA GENERAL, 31059', plan_nuevo]);
  }
  if (nombre_nuevo) {
    replacements.push(['BREINER BALDALLO LUNA', nombre_nuevo]);
    replacements.push(['JESUS MANUEL VARGAS NOGUERA', nombre_nuevo]);
  }
  if (plantel_nuevo) {
    replacements.push(['COMPLEJO EDUCATIVO RUÍZ PINEDA I', plantel_nuevo]);
    replacements.push(['COMPLEJO EDUCATIVO RUIZ PINEDA I', plantel_nuevo]);
  }
  if (coord_nom) {
    replacements.push(['JOSÉ ALBERTO RUÍZ ÁLVAREZ', coord_nom]);
    replacements.push(['JOSÉ ALBERTO RUÍZ ÀLVAREZ', coord_nom]);
    replacements.push(['JOSE ALBERTO RUIZ ALVAREZ', coord_nom]);
  }
  if (func_nom) {
    replacements.push(['WILMER JOSÉ LUGO RODRÍGUEZ', func_nom]);
    replacements.push(['WILMER JOSE LUGO RODRIGUEZ', func_nom]);
  }
  if (director_nom) replacements.push(['JOHN DANIEL ZAPATA MIRELES', director_nom]);
  if (fecha_nac_nueva) {
    replacements.push(['08 DE OCTUBRE DE 2009', fecha_nac_nueva]);
    replacements.push(['09 DE JULIO DE 2009', fecha_nac_nueva]);
  }
  if (cedula_nueva) {
    replacements.push(['V 34.857.655', cedula_nueva]);
    replacements.push(['V 33.479.449', cedula_nueva]);
  }
  if (director_ci) replacements.push(['V 18.361.899', director_ci]);
  if (coord_ci) replacements.push(['V 13.601.460', coord_ci]);
  if (func_ci) replacements.push(['V 9.445.225', func_ci]);
  if (codigo_nuevo) replacements.push(['S0163D0814', codigo_nuevo]);
  if (titulo_nuevo) replacements.push(['BACHILLER', titulo_nuevo]);
  if (ano_egreso_nuevo) replacements.push(['2026', ano_egreso_nuevo]);

  // A. Process all paragraphs inside <w:txbxContent> (VML textboxes)
  const txbxContents = xmlDoc.getElementsByTagName('w:txbxContent');
  for (let t = 0; t < txbxContents.length; t++) {
    const txbxP = txbxContents[t].getElementsByTagName('w:p');
    for (let pIdx = 0; pIdx < txbxP.length; pIdx++) {
      processParagraphNode(txbxP[pIdx], xmlDoc, replacements);
    }
  }

  // B. Process all paragraphs outside textboxes
  const bodyPs = xmlDoc.getElementsByTagName('w:p');
  for (let pIdx = 0; pIdx < bodyPs.length; pIdx++) {
    let parent = bodyPs[pIdx].parentNode;
    let insideTxbx = false;
    while (parent) {
      if (parent.nodeName === 'w:txbxContent') {
        insideTxbx = true;
        break;
      }
      parent = parent.parentNode;
    }
    if (!insideTxbx) {
      processParagraphNode(bodyPs[pIdx], xmlDoc, replacements);
    }
  }

  // C. Convert any wp:inline drawings to floating wp:anchor (in front of text) with wrapNone
  convertInlinesToAnchors(xmlDoc);

  return xmlDoc;
}

function convertInlinesToAnchors(xmlDoc: any) {
  const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';

  // 1. Convert wp:inline elements to wp:anchor
  const inlines = Array.from(xmlDoc.getElementsByTagName('wp:inline')) as any[];
  for (const inline of inlines) {
    const anchor = xmlDoc.createElementNS(WP_NS, 'wp:anchor');
    anchor.setAttribute('behindDoc', '0');
    anchor.setAttribute('relativeHeight', '251659264');
    anchor.setAttribute('simplePos', '0');
    anchor.setAttribute('locked', '0');
    anchor.setAttribute('layoutInCell', '1');
    anchor.setAttribute('allowOverlap', '1');
    anchor.setAttribute('distT', inline.getAttribute('distT') || '0');
    anchor.setAttribute('distB', inline.getAttribute('distB') || '0');
    anchor.setAttribute('distL', inline.getAttribute('distL') || '0');
    anchor.setAttribute('distR', inline.getAttribute('distR') || '0');

    const simplePos = xmlDoc.createElementNS(WP_NS, 'wp:simplePos');
    simplePos.setAttribute('x', '0');
    simplePos.setAttribute('y', '0');
    anchor.appendChild(simplePos);

    const posH = xmlDoc.createElementNS(WP_NS, 'wp:positionH');
    posH.setAttribute('relativeFrom', 'margin');
    const posOffsetH = xmlDoc.createElementNS(WP_NS, 'wp:posOffset');
    posOffsetH.textContent = '0';
    posH.appendChild(posOffsetH);
    anchor.appendChild(posH);

    const posV = xmlDoc.createElementNS(WP_NS, 'wp:positionV');
    posV.setAttribute('relativeFrom', 'paragraph');
    const posOffsetV = xmlDoc.createElementNS(WP_NS, 'wp:posOffset');
    posOffsetV.textContent = '0';
    posV.appendChild(posOffsetV);
    anchor.appendChild(posV);

    while (inline.firstChild) {
      const child = inline.firstChild;
      const localName = child.localName || child.nodeName;
      if (['wrapSquare', 'wrapTight', 'wrapThrough', 'wrapTopAndBottom', 'wp:wrapSquare', 'wp:wrapTight', 'wp:wrapThrough', 'wp:wrapTopAndBottom'].includes(localName)) {
        inline.removeChild(child);
      } else {
        anchor.appendChild(child);
      }
    }

    const wrapNones = anchor.getElementsByTagName('wp:wrapNone');
    if (!wrapNones || wrapNones.length === 0) {
      const wrapNone = xmlDoc.createElementNS(WP_NS, 'wp:wrapNone');
      const docPrs = anchor.getElementsByTagName('wp:docPr');
      if (docPrs && docPrs.length > 0) {
        anchor.insertBefore(wrapNone, docPrs[0]);
      } else {
        anchor.appendChild(wrapNone);
      }
    }

    if (inline.parentNode) {
      inline.parentNode.replaceChild(anchor, inline);
    }
  }

  // 2. Enforce behindDoc="0", relativeHeight, and wrapNone on existing wp:anchor elements
  const anchors = Array.from(xmlDoc.getElementsByTagName('wp:anchor')) as any[];
  for (const anchor of anchors) {
    anchor.setAttribute('behindDoc', '0');
    if (!anchor.getAttribute('relativeHeight') || anchor.getAttribute('relativeHeight') === '0') {
      anchor.setAttribute('relativeHeight', '251659264');
    }
    anchor.setAttribute('allowOverlap', '1');

    for (const wrapTag of ['wp:wrapSquare', 'wp:wrapTight', 'wp:wrapThrough', 'wp:wrapTopAndBottom', 'wrapSquare', 'wrapTight', 'wrapThrough', 'wrapTopAndBottom']) {
      const oldWraps = anchor.getElementsByTagName(wrapTag);
      for (let w = oldWraps.length - 1; w >= 0; w--) {
        const ow = oldWraps[w];
        if (ow && ow.parentNode) ow.parentNode.removeChild(ow);
      }
    }

    const wrapNones = anchor.getElementsByTagName('wp:wrapNone');
    if (!wrapNones || wrapNones.length === 0) {
      const wrapNone = xmlDoc.createElementNS(WP_NS, 'wp:wrapNone');
      const docPrs = anchor.getElementsByTagName('wp:docPr');
      if (docPrs && docPrs.length > 0) {
        anchor.insertBefore(wrapNone, docPrs[0]);
      } else {
        anchor.appendChild(wrapNone);
      }
    }
  }
}

export function generateNativeConsolidatedDocx(
  templateBuffer: Buffer,
  students: Record<string, any>[],
  fieldPositions: Record<string, FieldPosition> = {}
): Buffer {
  if (!students || students.length === 0) {
    throw new Error('La lista de estudiantes está vacía.');
  }

  const zip = new PizZip(templateBuffer);
  const rawXml = zip.file('word/document.xml')?.asText() || '';

  if (!rawXml) {
    throw new Error('No se pudo leer el archivo word/document.xml de la plantilla.');
  }

  const xmlSerializer = new XMLSerializer();

  if (students.length === 1) {
    const xmlDoc = processSingleStudentDom(rawXml, students[0], fieldPositions);
    const finalXml = xmlSerializer.serializeToString(xmlDoc as any);
    zip.file('word/document.xml', finalXml);
    return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  // Multi-student consolidation via DOM tree merging
  const masterDoc = processSingleStudentDom(rawXml, students[0], fieldPositions);
  const masterBody = masterDoc.getElementsByTagName('w:body')[0];

  const masterSectPrs = masterBody.getElementsByTagName('w:sectPr');
  const finalSectPr = masterSectPrs.length > 0 ? masterSectPrs[masterSectPrs.length - 1] : null;

  for (let sIdx = 1; sIdx < students.length; sIdx++) {
    const subDoc = processSingleStudentDom(rawXml, students[sIdx], fieldPositions);
    const subBody = subDoc.getElementsByTagName('w:body')[0];

    const breakP = masterDoc.createElement('w:p');
    const breakPPr = masterDoc.createElement('w:pPr');
    const breakSectPr = masterDoc.createElement('w:sectPr');
    const breakType = masterDoc.createElement('w:type');
    breakType.setAttribute('w:val', 'nextPage');
    breakSectPr.appendChild(breakType);
    breakPPr.appendChild(breakSectPr);
    breakP.appendChild(breakPPr);

    if (finalSectPr) {
      masterBody.insertBefore(breakP, finalSectPr);
    } else {
      masterBody.appendChild(breakP);
    }

    const childNodes = subBody.childNodes;
    for (let c = 0; c < childNodes.length; c++) {
      const node = childNodes.item(c);
      if (!node || node.nodeName === 'w:sectPr') continue;
      const importedNode = masterDoc.importNode(node, true);
      if (finalSectPr) {
        masterBody.insertBefore(importedNode, finalSectPr);
      } else {
        masterBody.appendChild(importedNode);
      }
    }
  }

  const finalXml = xmlSerializer.serializeToString(masterDoc as any);
  zip.file('word/document.xml', finalXml);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}
