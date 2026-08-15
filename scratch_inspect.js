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

// Simulate exact payload from frontend for student 2
const studentData = {
  estudiante_nombre: 'REINALDO DAVID GARCÍA CAMPOS',
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

// Build replacements exactly like native-docx-exporter.ts does
const nombre_nuevo = studentData.estudiante_nombre || '';
const cedula_nueva = studentData.estudiante_cedula || '';
const plantel_nuevo = studentData.plantel || '';
const codigo_nuevo = studentData.codigo_plantel || '';
const titulo_nuevo = studentData.titulo_otorgado || '';
const plan_nuevo = studentData.plan_estudio || '';
const lugar_nac_nuevo = studentData.lugar_nacimiento || '';
const fecha_nac_nueva = studentData.fecha_nacimiento || '';
const expedicion_nueva = studentData.lugar_fecha_expedicion || '';
const ano_egreso_nuevo = String(studentData['año_egreso'] || '2026');
const director_nom = studentData.firmante_director_nombre || 'JOHN DANIEL ZAPATA MIRELES';
const director_ci = studentData.firmante_director_cedula || 'V 18.361.899';
const coord_nom = studentData.firmante_coordinador_nombre || 'JOSÉ ALBERTO RUÍZ ÁLVAREZ';
const coord_ci = studentData.firmante_coordinador_cedula || 'V 13.601.460';
const func_nom = studentData.firmante_funcionario_nombre || 'WILMER JOSÉ LUGO RODRÍGUEZ';
const func_ci = studentData.firmante_funcionario_cedula || 'V 9.445.225';

const replacements = [];
if (expedicion_nueva) replacements.push(['CARABOBO, VALENCIA, 17 DE JULIO DE 2026', expedicion_nueva]);
if (lugar_nac_nuevo) replacements.push(['VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA', lugar_nac_nuevo]);
if (plan_nuevo) {
  replacements.push(['EDUCACIÓN MEDIA GENERAL, 31059', plan_nuevo]);
  replacements.push(['EDUCACION MEDIA GENERAL, 31059', plan_nuevo]);
}
if (nombre_nuevo) replacements.push(['JESUS MANUEL VARGAS NOGUERA', nombre_nuevo]);
if (plantel_nuevo) {
  replacements.push(['COMPLEJO EDUCATIVO RUÍZ PINEDA I', plantel_nuevo]);
  replacements.push(['COMPLEJO EDUCATIVO RUIZ PINEDA I', plantel_nuevo]);
}
if (coord_nom) {
  replacements.push(['JOSÉ ALBERTO RUÍZ ÁLVAREZ', coord_nom]);
  replacements.push(['JOSE ALBERTO RUIZ ALVAREZ', coord_nom]);
}
if (func_nom) {
  replacements.push(['WILMER JOSÉ LUGO RODRÍGUEZ', func_nom]);
  replacements.push(['WILMER JOSE LUGO RODRIGUEZ', func_nom]);
}
if (director_nom) replacements.push(['JOHN DANIEL ZAPATA MIRELES', director_nom]);
if (fecha_nac_nueva) replacements.push(['09 DE JULIO DE 2009', fecha_nac_nueva]);
if (cedula_nueva) replacements.push(['V 33.479.449', cedula_nueva]);
if (director_ci) replacements.push(['V 18.361.899', director_ci]);
if (coord_ci) replacements.push(['V 13.601.460', coord_ci]);
if (func_ci) replacements.push(['V 9.445.225', func_ci]);
if (codigo_nuevo) replacements.push(['S0163D0814', codigo_nuevo]);
if (titulo_nuevo) replacements.push(['BACHILLER', titulo_nuevo]);
if (ano_egreso_nuevo) replacements.push(['2026', ano_egreso_nuevo]);

// Test matching against ALL paragraphs
const paragraphs = xmlDoc.getElementsByTagName('w:p');
let matchCount = 0;
for (let i = 0; i < paragraphs.length; i++) {
  const p = paragraphs[i];
  const pText = (p.textContent || '').trim();
  if (!pText) continue;
  const pNorm = stripAccents(pText.toUpperCase());

  for (const [targetStr, replacementStr] of replacements) {
    const targetNorm = stripAccents(targetStr.toUpperCase());
    if (pNorm.includes(targetNorm)) {
      const runs = p.getElementsByTagName('w:r');
      console.log(`MATCH P[${i}]: "${targetStr}" -> "${replacementStr}" (${runs.length} runs)`);
      matchCount++;
      break;
    }
  }
}
console.log(`\nTotal paragraph matches: ${matchCount} / ${paragraphs.length} paragraphs`);

// Also test matching against VML textbox content
const textboxes = xmlDoc.getElementsByTagName('v:textbox');
let tbMatchCount = 0;
for (let i = 0; i < textboxes.length; i++) {
  const tb = textboxes[i];
  const tbText = (tb.textContent || '').trim();
  if (!tbText) continue;
  const tbNorm = stripAccents(tbText.toUpperCase());

  for (const [targetStr, replacementStr] of replacements) {
    const targetNorm = stripAccents(targetStr.toUpperCase());
    if (tbNorm.includes(targetNorm)) {
      console.log(`MATCH TB[${i}]: "${targetStr}" -> "${replacementStr}"`);
      tbMatchCount++;
      break;
    }
  }
}
console.log(`\nTotal textbox matches: ${tbMatchCount} / ${textboxes.length} textboxes`);
