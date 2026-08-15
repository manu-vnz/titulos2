const fs = require('fs');
const pizzip = require('pizzip');

// Mapping of shape index in template to student field key
const SHAPE_FIELD_KEYS = [
  'plantel',                    // Shape #0
  'estudiante_cedula',          // Shape #1
  'estudiante_nombre',          // Shape #2
  'lugar_fecha_expedicion',     // Shape #3
  'fecha_nacimiento',           // Shape #4
  'año_egreso',                 // Shape #5
  'titulo_otorgado',            // Shape #6
  'codigo_plantel',             // Shape #7
  'plan_estudio',               // Shape #8
  'lugar_nacimiento',           // Shape #9
  'firmante_director_cedula',   // Shape #10
  'firmante_coordinador_cedula',// Shape #11
  'firmante_funcionario_cedula',// Shape #12
  'firmante_director_nombre',   // Shape #13
  'firmante_coordinador_nombre',// Shape #14
  'firmante_funcionario_nombre',// Shape #15
];

const studentDemo = {
  plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
  codigo_plantel: 'S0163D0814',
  titulo_otorgado: 'BACHILLER',
  plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
  estudiante_nombre: 'RICHARD EDUARDO SUAREZ TISOY',
  estudiante_cedula: 'V 33.506.482',
  lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA',
  fecha_nacimiento: '07 DE JULIO DE 2009',
  lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
  año_egreso: '2026',
  firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
  firmante_director_cedula: 'V 18.361.899',
  firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
  firmante_coordinador_cedula: 'V 13.601.460',
  firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
  firmante_funcionario_cedula: 'V 9.445.225',
};

const buf = fs.readFileSync('public/plantilla_base_titulo.docx');
const zip = new pizzip(buf);
let masterXml = zip.file('word/document.xml').asText();

let shapeIdx = 0;
masterXml = masterXml.replace(/<v:shape\b[\s\S]*?<\/v:shape>/g, (shapeXml) => {
  const fieldKey = SHAPE_FIELD_KEYS[shapeIdx];
  shapeIdx++;

  if (!fieldKey) return shapeXml;
  const newVal = studentDemo[fieldKey];
  if (!newVal) return shapeXml;

  // Replace all text inside the shape's <w:t> tags
  let firstReplaced = false;
  shapeXml = shapeXml.replace(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g, (tTag, oldText) => {
    if (!firstReplaced) {
      firstReplaced = true;
      return tTag.replace(oldText, newVal);
    } else {
      return tTag.replace(oldText, '');
    }
  });

  return shapeXml;
});

zip.file('word/document.xml', masterXml);
const outBuf = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('test_perfect_shape_export.docx', outBuf);
console.log('Successfully replaced all 16 VML shape texts!');
