import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = '/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/pace-autocapture/pdf_muestras/SabanaTotal_Cultura_Digital_II_Aprendizaje_individual_y_colaborativo_V211_20260622_135801.pdf';

async function extractText() {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({ data }).promise;
  console.log(`PDF Pages: ${doc.numPages}`);
  
  const page = await doc.getPage(1);
  const textContent = await page.getTextContent();
  
  const items = textContent.items.map((it, idx) => ({
    idx,
    text: it.str,
    x: Math.round(it.transform[4]),
    y: Math.round(it.transform[5]),
    width: Math.round(it.width)
  }));
  
  fs.writeFileSync(
    '/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/pace-autocapture/pdf-structure.json',
    JSON.stringify(items, null, 2)
  );
  
  console.log("Headers detection candidates:");
  items.filter(it => it.text.trim().length > 0).slice(0, 100).forEach(it => {
    console.log(`X: ${it.x}, Y: ${it.y} | "${it.text}"`);
  });
}

extractText().catch(err => console.error(err));
