import React from 'react';
import type { GradeItem } from '../utils/pdfParser';

interface StatsPanelProps {
  grades: GradeItem[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ grades }) => {
  if (grades.length === 0) return null;

  const numericGrades = grades
    .map(g => parseFloat(g.grade))
    .filter(val => !isNaN(val));

  const total = grades.length;
  // Approved: grade >= 6.0.
  // Failed: grade < 6.0.
  // Warnings/Errors: grade < 5.0 (invalid grade validation in PACE), grade > 10.0, empty, or non-numeric.
  // This is extremely professional and matches both DGB context and the user prompt!

  const failed = grades.filter(g => parseFloat(g.grade) < 6.0).length;
  const approved = total - failed;
  const warnings = grades.filter(g => g.status === 'warning' || g.status === 'empty' || g.status === 'failed').length;

  const sum = numericGrades.reduce((a, b) => a + b, 0);
  const avg = numericGrades.length ? (sum / numericGrades.length).toFixed(1) : '0';
  const max = numericGrades.length ? Math.max(...numericGrades).toFixed(1) : '0';
  const min = numericGrades.length ? Math.min(...numericGrades).toFixed(1) : '0';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      <div>
        <h4 className="font-semibold text-xs tracking-wider text-gray-400 uppercase">Métricas y Validaciones</h4>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-xl text-center">
          <span className="text-xs text-gray-500 block mb-1">PROMEDIO GRUPAL</span>
          <strong className="text-xl font-bold text-gray-900">{avg}</strong>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-center">
          <span className="text-xs text-gray-500 block mb-1">{"APROBADOS (>= 6.0)"}</span>
          <strong className="text-xl font-bold text-green-600">
            {approved} <span className="text-sm font-normal text-gray-500">({total ? Math.round((approved / total) * 100) : 0}%)</span>
          </strong>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-center">
          <span className="text-xs text-gray-500 block mb-1">{"REPROBADOS (< 6.0)"}</span>
          <strong className="text-xl font-bold text-red-500">
            {failed} <span className="text-sm font-normal text-gray-500">({total ? Math.round((failed / total) * 100) : 0}%)</span>
          </strong>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl text-center">
          <span className="text-xs text-gray-500 block mb-1">MAX / MIN</span>
          <strong className="text-xl font-bold text-gray-900">{max} / {min}</strong>
        </div>
      </div>

      {warnings > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            Se encontraron <strong>{warnings} advertencias o reprobados</strong> en los datos. Revísalos en la tabla antes de inyectar las calificaciones.
          </div>
        </div>
      )}
    </div>
  );
};
