import { GradeItem } from './pdfParser';
import * as XLSX from 'xlsx';

export const exportToCSV = (grades: GradeItem[], fileName: string) => {
  const headers = 'Alumno,Calificacion\n';
  const rows = grades
    .map(g => `"${g.name.replace(/"/g, '""')}",${g.grade}`)
    .join('\n');
  
  const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.replace('.pdf', '') + '_calificaciones.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToExcel = (grades: GradeItem[], fileName: string) => {
  const data = grades.map(g => ({
    'Alumno': g.name,
    'Calificación': g.grade
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Calificaciones');
  
  XLSX.writeFile(workbook, fileName.replace('.pdf', '') + '_calificaciones.xlsx');
};
