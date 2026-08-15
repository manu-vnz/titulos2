const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

function stripAccents(str) {
  return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

const templatePath = path.join(__dirname, 'plantillas', 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx');
const docxBuffer = fs.readFileSync(templatePath);
const zip = new PizZip(docxBuffer);
const rawXml = zip.file('word/document.xml').asText();

const domParser = new DOMParser();
const xmlDoc = domParser.parseFromString(rawXml, 'text/xml');

const studentData = {
  estudiante_nombre: 'REINALDO DAVID GARCÍA CAMPOS (FULL POPULATED)',
  estudiante_cedula: 'V 32.666.328',
  plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
  codigo_plantel: 'S0163D0814',
  titulo_otorgado: 'BACHILLER',
  plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
  lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO VALENCIA',
  fecha_nacimiento: '21 DE ENERO DE 2009',
  lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
  'año_egreso': '2026',
  firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
  firmante_director_cedula: 'V 18.361.899',
  firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
  firmante_coordinador_cedula: 'V 13.601.460',
  firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
  firmante_funcionario_cedula: 'V 9.445.225',
};

const replacements = [
  ['CARABOBO, VALENCIA, 17 DE JULIO DE 2026', studentData.lugar_fecha_expedicion],
  ['VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA', studentData.lugar_nacimiento],
  ['EDUCACIÓN MEDIA GENERAL, 31059', studentData.plan_estudio],
  ['EDUCACION MEDIA GENERAL, 31059', studentData.plan_estudio],
  ['JESUS MANUEL VARGAS NOGUERA', studentData.estudiante_nombre],
  ['COMPLEJO EDUCATIVO RUÍZ PINEDA I', studentData.plantel],
  ['COMPLEJO EDUCATIVO RUIZ PINEDA I', studentData.plantel],
  ['JOSÉ ALBERTO RUÍZ ÁLVAREZ', studentData.firmante_coordinador_nombre],
  ['JOSÉ ALBERTO RUÍZ ÀLVAREZ', studentData.firmante_coordinador_nombre],
  ['JOSE ALBERTO RUIZ ALVAREZ', studentData.firmante_coordinador_nombre],
  ['WILMER JOSÉ LUGO RODRÍGUEZ', studentData.firmante_funcionario_nombre],
  ['WILMER JOSE LUGO RODRIGUEZ', studentData.firmante_funcionario_nombre],
  ['JOHN DANIEL ZAPATA MIRELES', studentData.firmante_director_nombre],
  ['09 DE JULIO DE 2009', studentData.fecha_nacimiento],
  ['V 33.479.449', studentData.estudiante_cedula],
  ['V 18.361.899', studentData.firmante_director_cedula],
  ['V 13.601.460', studentData.firmante_coordinador_cedula],
  ['V 9.445.225', studentData.firmante_funcionario_cedula],
  ['S0163D0814', studentData.codigo_plantel],
  ['BACHILLER', studentData.titulo_otorgado],
  ['2026', studentData['año_egreso']],
];

// Helper to replace text in a specific paragraph using direct child runs ONLY
function processParagraph(p) {
  const directRuns = [];
  for (let c = 0; c < p.childNodes.length; c++) {
    const child = p.childNodes.item(c);
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

// 1. Process all paragraphs inside <v:txbxContent> (VML textboxes)
const txbxContents = xmlDoc.getElementsByTagName('w:txbxContent');
for (let t = 0; t < txbxContents.length; t++) {
  const txbxP = txbxContents[t].getElementsByTagName('w:p');
  for (let pIdx = 0; pIdx < txbxP.length; pIdx++) {
    processParagraph(txbxP[pIdx]);
  }
}

// 2. Process all paragraphs in body
const bodyPs = xmlDoc.getElementsByTagName('w:p');
for (let pIdx = 0; pIdx < bodyPs.length; pIdx++) {
  // Only process if paragraph is not inside a txbxContent
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
    processParagraph(bodyPs[pIdx]);
  }
}

const xmlSerializer = new XMLSerializer();
const finalXml = xmlSerializer.serializeToString(xmlDoc);

zip.file('word/document.xml', finalXml);
const outBuffer = zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
fs.writeFileSync(path.join(__dirname, 'test_full_populated.docx'), outBuffer);
console.log("Saved test_full_populated.docx (%d bytes)!", outBuffer.length);
