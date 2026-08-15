const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');

function stripAccents(str) {
  return str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

const FIELD_TO_TEMPLATE_TEXT = {
  plantel:                 'COMPLEJO EDUCATIVO',
  nombre_estudiante:       'JESUS MANUEL VARGAS NOGUERA',
  cedula_estudiante:       'V 33.479.449',
  lugar_fecha_expedicion:  'CARABOBO, VALENCIA, 17 DE JULIO',
  fecha_nacimiento:        '09 DE JULIO DE 2009',
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

const DEFAULT_PREVIEW_POSITIONS = {
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

function processSingleStudentXml(baseXml, studentData, fieldPositions = {}) {
  let xml = baseXml;

  // 1. Process VML position deltas
  if (fieldPositions && Object.keys(fieldPositions).length > 0) {
    for (const [fieldKey, searchStr] of Object.entries(FIELD_TO_TEMPLATE_TEXT)) {
      if (!fieldPositions[fieldKey]) continue;
      const newPos = fieldPositions[fieldKey];
      const defPos = DEFAULT_PREVIEW_POSITIONS[fieldKey];
      if (!defPos) continue;

      const deltaTopPct = newPos.top - defPos.top;
      const deltaLeftPct = newPos.left - defPos.left;
      if (Math.abs(deltaTopPct) < 0.05 && Math.abs(deltaLeftPct) < 0.05) continue;

      const deltaTopPt = deltaTopPct * SCALE_Y;
      const deltaLeftPt = deltaLeftPct * SCALE_X;

      const shapeRegex = new RegExp(`(<v:shape[^>]*style="([^"]*)"[^>]*>([\\s\\S]*?)</v:shape>)`, 'gi');
      xml = xml.replace(shapeRegex, (match, shapeTag, styleAttr, innerContent) => {
        if (stripAccents(innerContent.toUpperCase()).includes(stripAccents(searchStr.toUpperCase()))) {
          const mlMatch = styleAttr.match(/margin-left:\s*(-?[\d.]+)pt/i);
          const mtMatch = styleAttr.match(/margin-top:\s*(-?[\d.]+)pt/i);
          if (mlMatch && mtMatch) {
            const currentMl = parseFloat(mlMatch[1]);
            const currentMt = parseFloat(mtMatch[1]);
            const newMl = Math.max(0, currentMl + deltaLeftPt);
            const newMt = Math.max(0, currentMt + deltaTopPt);

            let newStyle = styleAttr.replace(/margin-left:\s*-?[\d.]+pt/i, `margin-left:${newMl.toFixed(2)}pt`);
            newStyle = newStyle.replace(/margin-top:\s*-?[\d.]+pt/i, `margin-top:${newMt.toFixed(2)}pt`);
            return match.replace(styleAttr, newStyle);
          }
        }
        return match;
      });
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

  for (const [targetStr, replacementStr] of replacements) {
    if (!replacementStr) continue;
    const targetNorm = stripAccents(targetStr.toUpperCase());

    const pRegex = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/gi;
    xml = xml.replace(pRegex, (pXml) => {
      const pText = pXml.replace(/<[^>]+>/g, '');
      const pNorm = stripAccents(pText.toUpperCase());

      if (pNorm.includes(targetNorm)) {
        let runReplaced = false;
        return pXml.replace(/<w:r\b[^>]*>[\s\S]*?<\/w:r>/gi, (rXml) => {
          if (!runReplaced) {
            runReplaced = true;
            const boldProp = rXml.includes('<w:rPr>') ? rXml.replace('<w:rPr>', '<w:rPr><w:b/>') : '<w:rPr><w:b/></w:rPr>';
            return `<w:r>${boldProp}<w:t xml:space="preserve">${replacementStr}</w:t></w:r>`;
          }
          return '';
        });
      }
      return pXml;
    });
  }

  // Ensure bold on all runs
  xml = xml.replace(/<w:r\b([^>]*)>([\s\S]*?)<\/w:r>/gi, (match, attrs, content) => {
    if (content.includes('<w:t') && !content.includes('<w:b/>')) {
      if (content.includes('<w:rPr>')) {
        return `<w:r${attrs}>${content.replace('<w:rPr>', '<w:rPr><w:b/>')}</w:r>`;
      } else {
        return `<w:r${attrs}><w:rPr><w:b/></w:rPr>${content}</w:r>`;
      }
    }
    return match;
  });

  return xml;
}

function generateNativeDocx(templateBuffer, students, fieldPositions = {}) {
  if (!students || students.length === 0) {
    throw new Error('La lista de estudiantes está vacía.');
  }

  const zip = new PizZip(templateBuffer);
  const baseDocumentXml = zip.file('word/document.xml').asText();

  if (students.length === 1) {
    const finalXml = processSingleStudentXml(baseDocumentXml, students[0], fieldPositions);
    zip.file('word/document.xml', finalXml);
    return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
  }

  // For multi-students: process student 0 as master
  let masterXml = processSingleStudentXml(baseDocumentXml, students[0], fieldPositions);

  // Extract master section properties (<w:sectPr ...> </w:sectPr>) before final </w:body>
  const sectPrMatch = masterXml.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/i);
  const masterSectPr = sectPrMatch ? sectPrMatch[0] : '';
  const nextPageSectPr = masterSectPr.includes('<w:type')
    ? masterSectPr.replace(/<w:type\s+w:val="[^"]*"\/>/i, '<w:type w:val="nextPage"/>')
    : masterSectPr.replace('</w:sectPr>', '<w:type w:val="nextPage"/></w:sectPr>');

  // Split masterXml at </w:body>
  const bodyEndIdx = masterXml.lastIndexOf('</w:body>');
  let masterBodyContent = masterXml.substring(0, bodyEndIdx);
  const masterBodySuffix = masterXml.substring(bodyEndIdx);

  for (let i = 1; i < students.length; i++) {
    const subXml = processSingleStudentXml(baseDocumentXml, students[i], fieldPositions);
    
    // Extract inner body content of subXml (between <w:body> and </w:body>, removing its final <w:sectPr>)
    const subBodyStart = subXml.indexOf('<w:body>') + 8;
    const subBodyEnd = subXml.lastIndexOf('</w:body>');
    let subContent = subXml.substring(subBodyStart, subBodyEnd);
    subContent = subContent.replace(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/gi, '');

    // Append section break + subContent
    const sectionBreak = `<w:p><w:pPr>${nextPageSectPr}</w:pPr></w:p>`;
    masterBodyContent += sectionBreak + subContent;
  }

  const finalDocumentXml = masterBodyContent + masterBodySuffix;
  zip.file('word/document.xml', finalDocumentXml);
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// Test multi-student export
const templateBuffer = fs.readFileSync(path.join(__dirname, 'plantillas', 'JESUS MANUEL VARGAS NOGUERA COMPLEJO EDUCATIVO RUIZPINEDA I 2026.docx'));
const testStudents = [
  { estudiante_nombre: 'STUDENT 1 (NODE NATIVE)', estudiante_cedula: 'V 11.111.111' },
  { estudiante_nombre: 'STUDENT 2 (NODE NATIVE)', estudiante_cedula: 'V 22.222.222' }
];

const multiBuffer = generateNativeDocx(templateBuffer, testStudents);
fs.writeFileSync(path.join(__dirname, 'test_multi_node_output.docx'), multiBuffer);
console.log("Successfully generated multi-page test_multi_node_output.docx (%d bytes)!", multiBuffer.length);
