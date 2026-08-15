const fs = require('fs');
const pizzip = require('pizzip');

const fieldToOriginalMap = {
  plantel: 'COMPLEJO EDUCATIVO RUÍZ PINEDA I',
  estudiante_cedula: 'V 33.479.449',
  estudiante_nombre: 'JESUS MANUEL VARGAS NOGUERA',
  lugar_fecha_expedicion: 'CARABOBO, VALENCIA, 17 DE JULIO DE 2026',
  fecha_nacimiento: '09 DE JULIO DE 2009',
  año_egreso: '2026',
  titulo_otorgado: 'BACHILLER',
  codigo_plantel: 'S0163D0814',
  plan_estudio: 'EDUCACIÓN MEDIA GENERAL, 31059',
  lugar_nacimiento: 'VENEZUELA, CARABOBO, MUNICIPIO NAGUANAGUA',
  firmante_director_cedula: 'V 18.361.899',
  firmante_coordinador_cedula: 'V 13.601.460',
  firmante_funcionario_cedula: 'V 9.445.225',
  firmante_director_nombre: 'JOHN DANIEL ZAPATA MIRELES',
  firmante_coordinador_nombre: 'JOSÉ ALBERTO RUÍZ ÁLVAREZ',
  firmante_funcionario_nombre: 'WILMER JOSÉ LUGO RODRÍGUEZ',
};

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
let docXml = zip.file('word/document.xml').asText();

// Replace values
Object.entries(fieldToOriginalMap).forEach(([fieldKey, origVal]) => {
  const newVal = studentDemo[fieldKey];
  if (newVal && origVal) {
    docXml = docXml.split(origVal).join(newVal);
  }
});

zip.file('word/document.xml', docXml);
const outBuf = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('test_perfect_export.docx', outBuf);
console.log('Saved test_perfect_export.docx using base template!');
