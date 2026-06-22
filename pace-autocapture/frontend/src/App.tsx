import React, { useState } from 'react';
import { UploadCard } from './components/UploadCard';
import { StatsPanel } from './components/StatsPanel';
import { PreviewTable } from './components/PreviewTable';
import { AutomationPanel } from './components/AutomationPanel';
import { parseSabanaPDF, type GradeItem, type SabanaMetadata } from './utils/pdfParser';
import { exportToCSV, exportToExcel } from './utils/exportUtils';
import { Database } from 'lucide-react';

const App: React.FC = () => {
  const [fileName, setFileName] = useState('');
  const [metadata, setMetadata] = useState<SabanaMetadata | null>(null);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleFileLoaded = async (arrayBuffer: ArrayBuffer, name: string) => {
    try {
      setFileName(name);
      const result = await parseSabanaPDF(arrayBuffer);
      setMetadata(result.metadata);
      setGrades(result.grades);
    } catch (error) {
      console.error('Error parsing PDF SABANA:', error);
      alert('Ocurrió un error al procesar el archivo PDF. Intenta con otra sábana.');
    }
  };

  const handleGradeChange = (id: number, newGrade: string) => {
    setGrades(prev =>
      prev.map(g => {
        if (g.id !== id) return g;
        
        let status: 'approved' | 'failed' | 'warning' | 'empty' = 'approved';
        let warningMessage = '';
        const val = parseFloat(newGrade);
        
        if (newGrade.trim() === '') {
          status = 'empty';
          warningMessage = 'Falta calificación final';
        } else if (isNaN(val)) {
          status = 'warning';
          warningMessage = 'Calificación no numérica';
        } else if (val < 5.0) {
          status = 'failed';
          warningMessage = 'Reprobado (menor a 5.0)';
        } else if (val > 10.0) {
          status = 'warning';
          warningMessage = 'Calificación excede el rango 10.0';
        }

        return {
          ...g,
          grade: newGrade,
          status,
          warningMessage
        };
      })
    );
  };

  const triggerAutomation = async (delayMs: number) => {
    setIsCapturing(true);
    try {
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grades: grades.map(g => ({ name: g.name, grade: g.grade })),
          delayMs
        })
      });
      const data = await response.json();
      if (data.success && data.result.success !== false) {
        alert('¡Captura automática completada!');
      } else if (data.result && data.result.message === 'Cancelled by user') {
        alert('Captura detenida por el usuario.');
      } else {
        alert('Ocurrió un error durante la captura.');
      }
    } catch (err) {
      console.error('Error post capture:', err);
      alert('Error al conectar con el servidor local.');
    } finally {
      setIsCapturing(false);
    }
  };

  const cancelAutomation = async () => {
    try {
      const response = await fetch('/api/cancel', {
        method: 'POST'
      });
      await response.json();
    } catch (err) {
      console.error('Error cancel capture:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-600" /> PACE AutoCapture
          </h1>
          <p className="text-xs text-gray-500">Automatización Inteligente de Calificaciones DGB</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Servidor Local Conectado
          </span>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <UploadCard onFileLoaded={handleFileLoaded} fileName={fileName} />
          </div>
          
          {/* File details panel */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <h4 className="font-semibold text-xs tracking-wider text-gray-400 uppercase">Detalles del Archivo</h4>
            <div className="flex-1 flex flex-col justify-center gap-3 my-4">
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Materia:</span>
                <span className="font-semibold text-gray-800 text-right truncate max-w-[160px]" title={metadata?.subject}>
                  {metadata?.subject || '---'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Grupo:</span>
                <span className="font-semibold text-gray-800">{metadata?.group || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Docente:</span>
                <span className="font-semibold text-gray-800 text-right max-w-[160px] truncate" title={metadata?.teacher}>
                  {metadata?.teacher || '---'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm py-2">
                <span className="text-gray-500">Alumnos:</span>
                <span className="font-semibold text-gray-800">{metadata?.totalStudents || 0}</span>
              </div>
            </div>
          </div>
        </div>

        <StatsPanel grades={grades} />

        {grades.length > 0 && (
          <>
            <PreviewTable
              grades={grades}
              onGradeChange={handleGradeChange}
              onExportCSV={() => exportToCSV(grades, fileName)}
              onExportExcel={() => exportToExcel(grades, fileName)}
            />
            <AutomationPanel
              grades={grades}
              onStartCapture={triggerAutomation}
              onCancelCapture={cancelAutomation}
              isCapturing={isCapturing}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
