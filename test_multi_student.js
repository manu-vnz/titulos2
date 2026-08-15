const fs = require('fs');
const pizzip = require('pizzip');

const buf = fs.readFileSync('public/plantilla_base_titulo.docx');

const students = [
  { nombre: 'JESUS MANUEL VARGAS NOGUERA', cedula: 'V 33.479.449' },
  { nombre: 'RICHARD EDUARDO SUAREZ TISOY', cedula: 'V 33.506.482' },
  { nombre: 'REINALDO DAVID GARCÍA CAMPOS', cedula: 'V 32.666.328' },
  { nombre: 'JUAN DAVID GUANIPA BALLEN', cedula: 'V 34.271.788' }
];

const zip = new pizzip(buf);
let masterXml = zip.file('word/document.xml').asText();

const bodyMatch = masterXml.match(/<w:body>([\s\S]*?)<\/w:body>/);
const fullBodyInner = bodyMatch[1];
const sectPrMatch = fullBodyInner.match(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/);
const sectPrXml = sectPrMatch ? sectPrMatch[0] : '';
const bodyContentTemplate = fullBodyInner.replace(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/, '');

let combinedBody = '';

students.forEach((st, idx) => {
  let studentXml = bodyContentTemplate;
  studentXml = studentXml.split('JESUS MANUEL VARGAS NOGUERA').join(st.nombre);
  studentXml = studentXml.split('V 33.479.449').join(st.cedula);

  combinedBody += studentXml;
  
  if (idx < students.length - 1) {
    combinedBody += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
  }
});

combinedBody += sectPrXml;

const newXml = masterXml.replace(/<w:body>[\s\S]*?<\/w:body>/, '<w:body>' + combinedBody + '</w:body>');
zip.file('word/document.xml', newXml);

const finalBuf = zip.generate({ type: 'nodebuffer' });
fs.writeFileSync('test_multi_student_consolidated.docx', finalBuf);
console.log('Saved test_multi_student_consolidated.docx with', students.length, 'pages!');
