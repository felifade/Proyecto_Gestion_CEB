import React, { useState } from 'react';
import { GradeItem } from '../utils/pdfParser';

interface AutomationPanelProps {
  grades: GradeItem[];
  onStartCapture: (delay: number) => Promise<void>;
  onCancelCapture: () => Promise<void>;
  isCapturing: boolean;
}

export const AutomationPanel: React.FC<AutomationPanelProps> = ({
  grades,
  onStartCapture,
  onCancelCapture,
  isCapturing,
}) => {
  const [delay, setDelay] = useState(150);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

  const handleStartCapture = async () => {
    let count = 5;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(timer);
        setCountdown(null);
        onStartCapture(delay);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleSimulation = () => {
    setIsSimulating(true);
    const logs: string[] = [];
    grades.forEach((g, idx) => {
      logs.push(`[Alumno ${idx + 1}]: ${g.name} ➔ Escribe "${g.grade}" ➔ Presiona TAB ➔ Espera ${delay}ms`);
    });
    setSimulatedLogs(logs);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
      <div>
        <h4 className="font-semibold text-gray-900 text-base">Panel de Automatización</h4>
        <p className="text-xs text-gray-500 mt-1">
          Ajusta la velocidad y el método antes de inyectar las calificaciones en PACE.
        </p>
      </div>

      <div className="flex items-center gap-6 w-full md:w-auto justify-end">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 tracking-wider">RETARDO ENTRE ENTRADAS</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={delay}
              onChange={e => setDelay(Math.max(50, parseInt(e.target.value, 10) || 150))}
              className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-center font-semibold text-sm focus:outline-none focus:border-blue-500"
            />
            <span className="text-xs text-gray-500 font-medium">ms</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSimulation}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-full transition-colors duration-150"
          >
            Simular Captura
          </button>
          <button
            onClick={handleStartCapture}
            disabled={grades.length === 0 || isCapturing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-md shadow-blue-500/10 transition-colors duration-150"
          >
            {isCapturing ? 'Capturando...' : 'Iniciar Captura'}
          </button>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Prepárate para la Captura!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Coloca el cursor en el primer campo de calificación de PACE/SAGyC.
            </p>
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-4xl font-extrabold text-blue-600 mb-2 animate-bounce">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {/* Simulation Output Drawer/Modal */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl mx-4">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Consola de Simulación</h3>
              <button onClick={() => setIsSimulating(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cerrar</button>
            </div>
            <div className="overflow-y-auto flex-1 font-mono text-xs bg-gray-950 text-green-400 p-4 rounded-xl flex flex-col gap-1">
              {simulatedLogs.map((log, index) => (
                <div key={index} className="py-1 border-b border-gray-900">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Capture Cancel Modal */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse text-blue-600">Captura en Progreso</h2>
            <p className="text-sm text-gray-600 mb-6">
              Simulando teclado en el equipo. Por favor, <strong>no hagas clics</strong> ni cambies el foco de la pantalla.
            </p>
            
            <div className="flex justify-center mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            </div>

            <button
              onClick={onCancelCapture}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-full shadow-lg shadow-red-600/20 transition-all duration-150 w-full"
            >
              Detener Captura (Pánico)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
