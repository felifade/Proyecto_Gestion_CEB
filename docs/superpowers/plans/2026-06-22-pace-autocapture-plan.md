# PACE AutoCapture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a local web application that automates grading capture in the DGB PACE portal by reading a PDF file, displaying an editable preview table with statistics and validations, and injecting keystrokes (grade + TAB) on macOS using AppleScript.

**Architecture:** Monorepo with a React frontend served via Vite (port 5173) and an Express backend (port 3001) that handles local file reading and system keyboard injection using macOS `osascript` CLI commands.

**Tech Stack:** React 18, Vite, TypeScript, Tailwind CSS, pdfjs-dist, Express, child_process (macOS osascript).

---

## Proposed File Structure & Creation Mapping

We will establish a dedicated subdirectory named `pace-autocapture` under `/Users/felipelopezsalazar/Developer/Proyecto_Gestion_CEB/`:

*   `pace-autocapture/`
    *   `package.json` (Root package.json to manage backend & frontend startup scripts)
    *   `pdf_muestras/` (Local folder for test PDFs)
    *   `backend/`
        *   `package.json` (Node backend dependencies)
        *   `server.js` (Express main entry point)
        *   `services/`
            *   `captureService.js` (Keystroke simulation interface & AppleScript runner)
            *   `historyService.js` (Manejo de historial local en formato JSON)
    *   `frontend/` (Vite-scaffolded React application)
        *   `package.json`
        *   `vite.config.ts`
        *   `tailwind.config.js`
        *   `postcss.config.js`
        *   `src/`
            *   `main.tsx`
            *   `App.tsx`
            *   `index.css`
            *   `components/`
                *   `UploadCard.tsx`
                *   `StatsPanel.tsx`
                *   `PreviewTable.tsx`
                *   `AutomationPanel.tsx`
                *   `HistoryDrawer.tsx`
            *   `utils/`
                *   `pdfParser.ts`
                *   `exportUtils.ts`

---

## Tasks

### Task 1: Scaffolding and Directory Setup

**Files:**
- Create: `pace-autocapture/package.json`
- Create: `pace-autocapture/pdf_muestras/README.md`
- Create: `pace-autocapture/backend/package.json`
- Create: `pace-autocapture/backend/server.js`

- [ ] **Step 1: Create root package.json**
  Write package.json in `pace-autocapture/package.json` to manage development scripts for frontend and backend:
  ```json
  {
    "name": "pace-autocapture-root",
    "version": "1.0.0",
    "private": true,
    "scripts": {
      "install-all": "npm install && cd backend && npm install && cd ../frontend && npm install",
      "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
      "dev:backend": "cd backend && npm run dev",
      "dev:frontend": "cd frontend && npm run dev"
    },
    "devDependencies": {
      "concurrently": "^8.2.2"
    }
  }
  ```

- [ ] **Step 2: Create backend package.json**
  Write package.json in `pace-autocapture/backend/package.json`:
  ```json
  {
    "name": "pace-autocapture-backend",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
      "start": "node server.js",
      "dev": "nodemon server.js"
    },
    "dependencies": {
      "cors": "^2.8.5",
      "express": "^4.19.2"
    },
    "devDependencies": {
      "nodemon": "^3.1.0"
    }
  }
  ```

- [ ] **Step 3: Initialize pdf_muestras directory**
  Create the folder `pace-autocapture/pdf_muestras/` and write a README.md explaining its purpose:
  ```markdown
  # Muestras de PDF para PACE AutoCapture
  
  Coloca en esta carpeta tus archivos PDF de Sábana de Calificaciones reales para realizar pruebas de lectura y parsing.
  ```

- [ ] **Step 4: Commit setup**
  Run:
  ```bash
  git add pace-autocapture/package.json pace-autocapture/backend/package.json pace-autocapture/pdf_muestras/README.md
  git commit -m "chore: setup project folders and configurations"
  ```

---

### Task 2: Backend API and server.js Setup

**Files:**
- Modify: `pace-autocapture/backend/server.js`

- [ ] **Step 1: Write Express server with basic endpoint structure**
  Implement `pace-autocapture/backend/server.js`:
  ```javascript
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const fs = require('fs');

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/api/status', (req, res) => {
    res.json({ status: 'active', platform: process.platform });
  });

  // Start listening
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
  ```

- [ ] **Step 2: Test backend startup**
  Run command in `pace-autocapture/backend`: `npm install && npm run start`
  Verify server starts and shows standard log output.

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add pace-autocapture/backend/server.js
  git commit -m "feat: add initial Express server structure"
  ```

---

### Task 3: Keystroke Simulation Service (AppleScript)

**Files:**
- Create: `pace-autocapture/backend/services/captureService.js`
- Modify: `pace-autocapture/backend/server.js`

- [ ] **Step 1: Write CaptureService with AppleScript simulation**
  Create `pace-autocapture/backend/services/captureService.js`. Implement sequential AppleScript typing with adjustable delay:
  ```javascript
  const { exec } = require('child_process');

  const executeAppleScript = (script) => {
    return new Promise((resolve, reject) => {
      exec(`osascript -e '${script.replace(/'/g, "'\\''")}'`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Strategy Pattern Interface
  class AppleScriptCaptureService {
    async capture(grades, delayMs) {
      console.log(`Starting capture process for ${grades.length} grades. Delay: ${delayMs}ms.`);
      
      for (let i = 0; i < grades.length; i++) {
        const { grade } = grades[i];
        
        // Command to keystroke the grade value followed by key code 48 (TAB)
        const script = `tell application "System Events"
          keystroke "${grade}"
          key code 48
        end tell`;
        
        await executeAppleScript(script);
        await sleep(delayMs);
      }
      return { success: true, count: grades.length };
    }
  }

  module.exports = new AppleScriptCaptureService();
  ```

- [ ] **Step 2: Bind POST /api/capture endpoint in server.js**
  Modify `pace-autocapture/backend/server.js` to include the capture endpoint:
  ```javascript
  const captureService = require('./services/captureService');

  app.post('/api/capture', async (req, res) => {
    const { grades, delayMs } = req.body;
    if (!grades || !Array.isArray(grades)) {
      return res.status(400).json({ error: 'grades array is required' });
    }
    
    const delay = delayMs ? parseInt(delayMs, 10) : 150;
    
    try {
      const result = await captureService.capture(grades, delay);
      res.json({ success: true, result });
    } catch (error) {
      console.error('Error during capture simulation:', error);
      res.status(500).json({ error: 'Failed to inject keystrokes', details: error.message });
    }
  });
  ```

- [ ] **Step 3: Commit capture service**
  Run:
  ```bash
  git add pace-autocapture/backend/services/captureService.js pace-autocapture/backend/server.js
  git commit -m "feat: implement AppleScript keystroke injector service"
  ```

---

### Task 4: Scaffold React Frontend (Vite + TypeScript)

**Files:**
- Create: `pace-autocapture/frontend/` (via create-vite or manual scaffolding)
- Create: `pace-autocapture/frontend/vite.config.ts`
- Create: `pace-autocapture/frontend/tailwind.config.js`
- Create: `pace-autocapture/frontend/src/index.css`

- [ ] **Step 1: Scaffold Vite App**
  Run from root directory `pace-autocapture`:
  `npx -y create-vite@latest frontend --template react-ts`
  Verify package folder structure.

- [ ] **Step 2: Install UI dependencies**
  Run in `pace-autocapture/frontend`:
  `npm install -D tailwindcss postcss autoprefixer && npm install lucide-react pdfjs-dist xlsx`
  Initialize tailwind config using commands.

- [ ] **Step 3: Configure Tailwind CSS**
  Update `pace-autocapture/frontend/tailwind.config.js`:
  ```javascript
  /** @type {import('tailwindcss').Config} */
  module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        },
      },
    },
    plugins: [],
  }
  ```
  Write index.css:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  body {
    background-color: #fbfbfd;
    color: #1d1d1f;
  }
  ```

- [ ] **Step 4: Configure Vite proxy to Backend**
  Update `pace-autocapture/frontend/vite.config.ts`:
  ```typescript
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    }
  })
  ```

- [ ] **Step 5: Commit scaffolding**
  Run:
  ```bash
  git add pace-autocapture/frontend/
  git commit -m "chore: scaffold React Vite frontend with Tailwind CSS"
  ```

---

### Task 5: PDF Parser Utility

**Files:**
- Create: `pace-autocapture/frontend/src/utils/pdfParser.ts`

- [ ] **Step 1: Write pdfParser utility using pdf.js**
  Create parser that extracts student rows (coordinates-based layout) and metadata:
  ```typescript
  import * as pdfjsLib from 'pdfjs-dist';

  // Set worker path manually to CDN to avoid bundler setup complexity
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
    
    // Read only first page for metadata and initial analysis
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
  ```

- [ ] **Step 2: Commit parser**
  Run:
  ```bash
  git add pace-autocapture/frontend/src/utils/pdfParser.ts
  git commit -m "feat: implement coords-based PDF grades extractor utility"
  ```

---

### Task 6: UI Component Scaffolding (Cards & Stats)

**Files:**
- Create: `pace-autocapture/frontend/src/components/UploadCard.tsx`
- Create: `pace-autocapture/frontend/src/components/StatsPanel.tsx`

- [ ] **Step 1: Write UploadCard component**
  Create file `pace-autocapture/frontend/src/components/UploadCard.tsx` implementing a modern drag-and-drop card:
  ```tsx
  import React, { useState, useRef } from 'react';
  import { FileText, Upload } from 'lucide-react';

  interface UploadCardProps {
    onFileLoaded: (arrayBuffer: ArrayBuffer, fileName: string) => void;
    fileName: string;
  }

  export const UploadCard: React.FC<UploadCardProps> = ({ onFileLoaded, fileName }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    };

    const handleDragLeave = () => {
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    };

    const loadFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onFileLoaded(reader.result, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    };

    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[200px] text-center ${
          isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
      >
        <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          {fileName ? <FileText className="w-6 h-6 text-blue-500" /> : <Upload className="w-6 h-6 text-gray-500" />}
        </div>
        <h4 className="font-semibold text-lg text-gray-900">
          {fileName ? fileName : 'Arrastra tu Sábana de Calificaciones PDF aquí'}
        </h4>
        <p className="text-sm text-gray-500 mt-1">o haz clic para explorar en tu equipo</p>
      </div>
    );
  };
  ```

- [ ] **Step 2: Write StatsPanel component**
  Create file `pace-autocapture/frontend/src/components/StatsPanel.tsx` calculating approved, failed, mean, max, and min:
  ```tsx
  import React from 'react';
  import { GradeItem } from '../utils/pdfParser';

  interface StatsPanelProps {
    grades: GradeItem[];
  }

  export const StatsPanel: React.FC<StatsPanelProps> = ({ grades }) => {
    if (grades.length === 0) return null;

    const numericGrades = grades
      .map(g => parseFloat(g.grade))
      .filter(val => !isNaN(val));

    const total = grades.length;
    const approved = grades.filter(g => parseFloat(g.grade) >= 5.0).length;
    const failed = grades.filter(g => parseFloat(g.grade) < 5.0).length;
    const warnings = grades.filter(g => g.status === 'warning' || g.status === 'empty').length;

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
            <span className="text-xs text-gray-500 block mb-1">APROBADOS</span>
            <strong className="text-xl font-bold text-green-600">{approved} <span className="text-sm font-normal text-gray-500">({total ? Math.round((approved/total)*100) : 0}%)</span></strong>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl text-center">
            <span className="text-xs text-gray-500 block mb-1">REPROBADOS</span>
            <strong className="text-xl font-bold text-red-500">{failed} <span className="text-sm font-normal text-gray-500">({total ? Math.round((failed/total)*100) : 0}%)</span></strong>
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
              Se encontraron <strong>{warnings} advertencias</strong> en los datos. Revísalos en la tabla antes de inyectar.
            </div>
          </div>
        )}
      </div>
    );
  };
  ```

- [ ] **Step 3: Commit UI components**
  Run:
  ```bash
  git add pace-autocapture/frontend/src/components/UploadCard.tsx pace-autocapture/frontend/src/components/StatsPanel.tsx
  git commit -m "feat: build UploadCard and StatsPanel components"
  ```

---

### Task 7: Interactive Table Component

**Files:**
- Create: `pace-autocapture/frontend/src/components/PreviewTable.tsx`

- [ ] **Step 1: Write PreviewTable Component**
  Create file `pace-autocapture/frontend/src/components/PreviewTable.tsx` to handle inline editing, search filtering, and grade status coloring:
  ```tsx
  import React, { useState } from 'react';
  import { GradeItem } from '../utils/pdfParser';
  import { Search } from 'lucide-react';

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

    const filteredGrades = grades.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (id: number, val: string) => {
      onGradeChange(id, val);
    };

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
            <button onClick={onExportCSV} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-2 rounded-lg font-medium">CSV</button>
            <button onClick={onExportExcel} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs px-3 py-2 rounded-lg font-medium">Excel</button>
          </div>
        </div>

        <div className="overflow-x-auto max-height-[300px] border border-gray-100 rounded-xl">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 font-medium text-gray-500">
              <tr>
                <th className="px-6 py-3 w-16">No</th>
                <th className="px-6 py-3">Alumno</th>
                <th className="px-6 py-3 w-32">Calif. FINAL</th>
                <th className="px-6 py-3 w-40">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredGrades.map((g, index) => (
                <tr
                  key={g.id}
                  className={
                    g.status === 'failed'
                      ? 'bg-red-50/20'
                      : g.status === 'warning' || g.status === 'empty'
                      ? 'bg-yellow-50/20'
                      : ''
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
  ```

- [ ] **Step 2: Commit PreviewTable**
  Run:
  ```bash
  git add pace-autocapture/frontend/src/components/PreviewTable.tsx
  git commit -m "feat: build PreviewTable component with inline editing"
  ```

---

### Task 8: Automation Control Panel & Simulation API

**Files:**
- Create: `pace-autocapture/frontend/src/components/AutomationPanel.tsx`
- Modify: `pace-autocapture/frontend/src/App.tsx`

- [ ] **Step 1: Write AutomationPanel with countdown**
  Create file `pace-autocapture/frontend/src/components/AutomationPanel.tsx` containing the countdown sequence overlay and adjustable delay input:
  ```tsx
  import React, { useState } from 'react';
  import { GradeItem } from '../utils/pdfParser';

  interface AutomationPanelProps {
    grades: GradeItem[];
    onStartCapture: (delay: number) => Promise<void>;
  }

  export const AutomationPanel: React.FC<AutomationPanelProps> = ({ grades, onStartCapture }) => {
    const [delay, setDelay] = useState(150);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);

    const handleStartCapture = async () => {
      // 5-second countdown
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
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-lg text-center font-semibold text-sm"
              />
              <span className="text-xs text-gray-500 font-medium">ms</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSimulation}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold px-5 py-2.5 rounded-full"
            >
              Simular Captura
            </button>
            <button
              onClick={handleStartCapture}
              disabled={grades.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-md shadow-blue-500/10"
            >
              Iniciar Captura
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
              <div className="flex justify-between items-center border-bottom pb-3 mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Consola de Simulación</h3>
                <button onClick={() => setIsSimulating(false)} className="text-gray-400 hover:text-gray-600 text-sm">Cerrar</button>
              </div>
              <div className="overflow-y-auto flex-1 font-mono text-xs bg-gray-950 text-green-400 p-4 rounded-xl gap-2">
                {simulatedLogs.map((log, index) => (
                  <div key={index} className="py-1 border-b border-gray-900">{log}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  ```

- [ ] **Step 2: Commit automation panel**
  Run:
  ```bash
  git add pace-autocapture/frontend/src/components/AutomationPanel.tsx
  git commit -m "feat: implement AutomationPanel component with countdown overlay and simulation logs"
  ```

---

### Task 9: Export Utilities (CSV & XLSX)

**Files:**
- Create: `pace-autocapture/frontend/src/utils/exportUtils.ts`

- [ ] **Step 1: Implement CSV & Excel Export Functions**
  Create file `pace-autocapture/frontend/src/utils/exportUtils.ts` incorporating `xlsx` for Excel generation:
  ```typescript
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
  ```

- [ ] **Step 2: Commit export utils**
  Run:
  ```bash
  git add pace-autocapture/frontend/src/utils/exportUtils.ts
  git commit -m "feat: add CSV and XLSX grade sheet export utilities"
  ```

---

### Task 10: Assembly of App.tsx Main Dashboard

**Files:**
- Modify: `pace-autocapture/frontend/src/App.tsx`

- [ ] **Step 1: Write primary App.tsx orchestration**
  Assemble components, hook file upload parsing, handle inline changes, and post grades array to backend API:
  ```tsx
  import React, { useState } from 'react';
  import { UploadCard } from './components/UploadCard';
  import { StatsPanel } from './components/StatsPanel';
  import { PreviewTable } from './components/PreviewTable';
  import { AutomationPanel } from './components/AutomationPanel';
  import { parseSabanaPDF, GradeItem, SabanaMetadata } from './utils/pdfParser';
  import { exportToCSV, exportToExcel } from './utils/exportUtils';
  import { History, ShieldAlert } from 'lucide-react';

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
        if (data.success) {
          alert('¡Captura automática completada!');
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

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">PACE AutoCapture</h1>
            <p className="text-xs text-gray-500">Automatización Inteligente de Calificaciones DGB</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> Servidor Conectado
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
                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-500">Materia:</span>
                  <span className="font-semibold text-gray-800">{metadata?.subject || '---'}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-500">Grupo:</span>
                  <span className="font-semibold text-gray-800">{metadata?.group || '---'}</span>
                </div>
                <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                  <span className="text-gray-500">Docente:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-[150px] truncate">{metadata?.teacher || '---'}</span>
                </div>
                <div className="flex justify-between text-sm py-1">
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
              <AutomationPanel grades={grades} onStartCapture={triggerAutomation} />
            </>
          )}
        </main>
      </div>
    );
  };

  export default App;
  ```

- [ ] **Step 2: Commit App**
  Run:
  ```bash
  git add pace-autocapture/frontend/src/App.tsx
  git commit -m "feat: assemble main dashboard App.tsx orchestrator"
  ```

---

## Verification Plan

### Automated Verification
*   Execute backend start script:
    Run: `cd pace-autocapture/backend && npm run start`
    Expected: Logs "Backend server running on http://localhost:3001" and GET `/api/status` returns status active.
*   Execute frontend build script:
    Run: `cd pace-autocapture/frontend && npm run build`
    Expected: Vite compiles successfully with zero TypeScript compilation errors.

### Manual Verification
*   Open an Excel sheet or a blank Google Sheet locally.
*   Focus the cursor on cell A1.
*   In the web app, click "Iniciar Captura", focus back the spreadsheet during the 5s countdown.
*   Verify that the mock grades are typed sequentially and the focus moves downwards or rightwards matching the `TAB` key events.
