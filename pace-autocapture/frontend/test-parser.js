import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = '/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/pace-autocapture/pdf_muestras/SabanaTotal_Cultura_Digital_II_Aprendizaje_individual_y_colaborativo_V211_20260622_135801.pdf';

const fileArrayBuffer = fs.readFileSync(pdfPath).buffer;

const getValueAfterLabel = (label, items) => {
  const labelItemIndex = items.findIndex(it => it.str.toUpperCase().includes(label));
  if (labelItemIndex === -1) return '';
  const labelItem = items[labelItemIndex];
  const labelY = Math.round(labelItem.transform[5]);
  const labelX = labelItem.transform[4];
  
  const rowItems = items.filter(it => 
    Math.abs(Math.round(it.transform[5]) - labelY) <= 3 && 
    it.transform[4] > labelX && 
    it.str.trim().length > 0
  );
  
  rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
  return rowItems.map(it => it.str.trim()).join(' ');
};

const parseSabanaPDF = async (fileArrayBuffer) => {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileArrayBuffer) });
  const pdf = await loadingTask.promise;
  
  let fullTextItems = [];
  
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  fullTextItems = textContent.items;

  // 1. Extract raw metadata using coordinates mapping
  const subject = getValueAfterLabel('MATERIA', fullTextItems) || 'Desconocida';
  const group = getValueAfterLabel('GRUPO', fullTextItems) || 'Desconocido';
  const teacher = getValueAfterLabel('DOCENTE', fullTextItems) || 'Desconocido';

  // 2. Identify header column X coordinates
  let nameColX = 0;
  let finalGradeColX = 0;

  for (const item of fullTextItems) {
    const text = item.str.toUpperCase().trim();
    if (text.includes('ALUMNO')) {
      nameColX = item.transform[4];
    }
    if (text.includes('CALIF. FINAL') || text.includes('CALIF.FINAL') || text.includes('FINAL')) {
      finalGradeColX = item.transform[4];
    }
  }

  if (nameColX === 0) nameColX = 50;
  if (finalGradeColX === 0) finalGradeColX = 450;

  // 3. Group text items into rows (by Y-coordinate)
  const rowsMap = new Map();
  for (const item of fullTextItems) {
    const y = Math.round(item.transform[5]);
    let matchedY = Array.from(rowsMap.keys()).find(k => Math.abs(k - y) <= 3);
    if (matchedY !== undefined) {
      rowsMap.get(matchedY).push(item);
    } else {
      rowsMap.set(y, [item]);
    }
  }

  const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);
  const grades = [];
  let id = 1;

  for (const y of sortedY) {
    const items = rowsMap.get(y);
    items.sort((a, b) => a.transform[4] - b.transform[4]);
    
    const lineText = items.map(it => it.str).join(' ').trim();
    
    // Filter out headers, empty lines, and metadata
    if (
      lineText.toUpperCase().includes('MATERIA') || 
      lineText.toUpperCase().includes('DOCENTE') || 
      lineText.toUpperCase().includes('GRUPO') || 
      lineText.toUpperCase().includes('ALUMNO') || 
      lineText.toUpperCase().includes('CALIF') || 
      lineText.toUpperCase().includes('CICLO') || 
      lineText.toUpperCase().includes('CLASES') || 
      lineText.toUpperCase().includes('FIRMA') || 
      lineText.toUpperCase().includes('EMITIDO') || 
      lineText.includes('____') ||
      lineText.length < 5
    ) {
      continue;
    }

    const nameItem = items.find(it => it.transform[4] < 160 && /[a-zA-Z]/.test(it.str) && !/^\d+$/.test(it.str.trim()));
    if (!nameItem) continue;

    const name = nameItem.str.trim();

    const gradeItem = items.find(it => Math.abs(it.transform[4] - finalGradeColX) <= 50 && /^\d+(\.\d+)?$/.test(it.str.trim()))
      || [...items].reverse().find(it => /^\d+(\.\d+)?$/.test(it.str.trim()) && it.transform[4] > 400);
    
    let rawGrade = gradeItem ? gradeItem.str.trim() : '';
    let status = 'approved';
    let warningMessage = '';

    if (rawGrade === '') {
      status = 'empty';
      warningMessage = 'Falta calificación final';
    } else {
      const val = parseFloat(rawGrade);
      if (isNaN(val)) {
        status = 'warning';
        warningMessage = 'Calificación no numérica';
      } else if (val < 5.0) {
        status = 'failed';
        warningMessage = 'Reprobado (menor a 5.0)';
      } else if (val > 10.0) {
        status = 'warning';
        warningMessage = 'Calificación excede el rango 10.0';
      }
    }

    grades.push({
      id: id++,
      name,
      grade: rawGrade,
      status,
      warningMessage
    });
  }

  return {
    metadata: {
      subject,
      group,
      teacher,
      totalStudents: grades.length
    },
    grades
  };
};

parseSabanaPDF(fileArrayBuffer).then(res => {
  console.log("--- Extraction Result ---");
  console.log("Metadata:", res.metadata);
  console.log(`Extracted ${res.grades.length} students.`);
  if (res.grades.length > 0) {
    console.log("First 3 student grades:");
    console.log(res.grades.slice(0, 3));
  }
}).catch(err => console.error("Error running test parser:", err));
