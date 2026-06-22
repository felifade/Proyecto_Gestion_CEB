import * as pdfjsLib from 'pdfjs-dist';

// Set worker path manually to CDN to avoid Vite asset worker bundler setup complexity
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface GradeItem {
  id: number;
  name: string;
  grade: string;
  status: 'approved' | 'failed' | 'warning' | 'empty';
  warningMessage?: string;
}

export interface SabanaMetadata {
  subject: string;
  group: string;
  teacher: string;
  totalStudents: number;
}

export interface ParseResult {
  metadata: SabanaMetadata;
  grades: GradeItem[];
}

export const parseSabanaPDF = async (fileArrayBuffer: ArrayBuffer): Promise<ParseResult> => {
  const loadingTask = pdfjsLib.getDocument({ data: fileArrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullTextItems: any[] = [];
  
  // Read first page for metadata and initial analysis
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  fullTextItems = textContent.items;

  // 1. Extract raw metadata
  let subject = 'Desconocida';
  let group = 'Desconocido';
  let teacher = 'Desconocido';

  for (let i = 0; i < fullTextItems.length; i++) {
    const item = fullTextItems[i];
    const text = item.str.toUpperCase();
    
    if (text.includes('MATERIA:') || text.includes('ASIGNATURA:')) {
      subject = fullTextItems[i + 1]?.str || 'Detectando...';
    }
    if (text.includes('GRUPO:')) {
      group = fullTextItems[i + 1]?.str || 'Detectando...';
    }
    if (text.includes('DOCENTE:') || text.includes('PROFESOR:')) {
      teacher = fullTextItems[i + 1]?.str || 'Detectando...';
    }
  }

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

  // fallback X positions if headers not found explicitly
  if (nameColX === 0) nameColX = 50;
  if (finalGradeColX === 0) finalGradeColX = 450;

  // 3. Group text items into rows (by Y-coordinate)
  const rowsMap = new Map<number, any[]>();
  for (const item of fullTextItems) {
    const y = Math.round(item.transform[5]);
    let matchedY = Array.from(rowsMap.keys()).find(k => Math.abs(k - y) <= 3);
    if (matchedY !== undefined) {
      rowsMap.get(matchedY)!.push(item);
    } else {
      rowsMap.set(y, [item]);
    }
  }

  // Sort rows by Y descending
  const sortedY = Array.from(rowsMap.keys()).sort((a, b) => b - a);
  const grades: GradeItem[] = [];
  let id = 1;

  for (const y of sortedY) {
    const items = rowsMap.get(y)!;
    // Sort items inside row by X ascending
    items.sort((a, b) => a.transform[4] - b.transform[4]);
    
    const lineText = items.map(it => it.str).join(' ').trim();
    
    // Filter out headers, empty lines, and metadata
    if (
      lineText.includes('MATERIA') || 
      lineText.includes('DOCENTE') || 
      lineText.includes('GRUPO') || 
      lineText.includes('ALUMNO') || 
      lineText.includes('CALIF') || 
      lineText.length < 5
    ) {
      continue;
    }

    // Check if line contains student name pattern (text starting on left name column X)
    const nameItem = items.find(it => Math.abs(it.transform[4] - nameColX) <= 60 && /[A-Z]/.test(it.str));
    if (!nameItem) continue;

    const name = nameItem.str.trim();

    // Find final grade item aligning with finalGradeColX
    const gradeItem = items.find(it => Math.abs(it.transform[4] - finalGradeColX) <= 50 && /^\d+(\.\d+)?$/.test(it.str.trim()));
    
    let rawGrade = gradeItem ? gradeItem.str.trim() : '';
    let status: 'approved' | 'failed' | 'warning' | 'empty' = 'approved';
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
