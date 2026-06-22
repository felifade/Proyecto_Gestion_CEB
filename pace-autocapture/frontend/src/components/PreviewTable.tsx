import React, { useState } from 'react';
import type { GradeItem } from '../utils/pdfParser';
import { Search, ArrowUpDown } from 'lucide-react';

interface PreviewTableProps {
  grades: GradeItem[];
  onGradeChange: (id: number, newGrade: string) => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  grades,
  onGradeChange,
  onExportCSV,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'id' | 'name' | 'grade'>('id');
  const [sortAsc, setSortAsc] = useState(true);

  const handleInputChange = (id: number, val: string) => {
    onGradeChange(id, val);
  };

  const handleSort = (field: 'id' | 'name' | 'grade') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filter and then Sort grades
  const processedGrades = grades
    .filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'grade') {
        const floatA = parseFloat(a.grade) || 0;
        const floatB = parseFloat(b.grade) || 0;
        valA = floatA;
        valB = floatB;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h4 className="font-semibold text-xs tracking-wider text-gray-400 uppercase">Vista Previa de Alumnos</h4>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar Alumno..."
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:border-blue-500"
            />
          </div>
          <button onClick={onExportCSV} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-2.5 rounded-lg font-medium">Exportar CSV</button>
          <button onClick={onExportExcel} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-2.5 rounded-lg font-medium">Exportar Excel</button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[350px] border border-gray-100 rounded-xl">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 font-semibold text-gray-600 sticky top-0 z-10">
            <tr>
              <th onClick={() => handleSort('id')} className="px-6 py-3 w-20 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center gap-1">No <ArrowUpDown className="h-3.5 w-3.5" /></div>
              </th>
              <th onClick={() => handleSort('name')} className="px-6 py-3 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center gap-1">Alumno <ArrowUpDown className="h-3.5 w-3.5" /></div>
              </th>
              <th onClick={() => handleSort('grade')} className="px-6 py-3 w-32 cursor-pointer hover:bg-gray-100">
                <div className="flex items-center gap-1">Calif. FINAL <ArrowUpDown className="h-3.5 w-3.5" /></div>
              </th>
              <th className="px-6 py-3 w-44">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {processedGrades.map((g, index) => (
              <tr
                key={g.id}
                className={
                  g.status === 'failed'
                    ? 'bg-red-50/20'
                    : g.status === 'warning' || g.status === 'empty'
                    ? 'bg-yellow-50/20'
                    : 'hover:bg-gray-50/30'
                }
              >
                <td className="px-6 py-4">{index + 1}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{g.name}</td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={g.grade}
                    onChange={e => handleInputChange(g.id, e.target.value)}
                    className={`w-20 px-2 py-1 border rounded text-center text-sm font-semibold focus:outline-none focus:ring-1 ${
                      g.status === 'failed'
                        ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500'
                        : g.status === 'warning' || g.status === 'empty'
                        ? 'border-yellow-500 bg-yellow-50 focus:ring-yellow-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  />
                </td>
                <td className="px-6 py-4">
                  {g.status === 'approved' && <span className="text-green-600 font-semibold">Aprobado</span>}
                  {g.status === 'failed' && <span className="text-red-600 font-semibold">Reprobado</span>}
                  {(g.status === 'warning' || g.status === 'empty') && (
                    <span className="text-yellow-600 font-semibold text-xs">{g.warningMessage}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
