# Auditor de Expedientes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete macOS local desktop web application ("Auditor de Expedientes") using FastAPI, SQLite, and Gemini API to automate the document auditing of local directories synchronized with Google Drive, matching them against dynamic Excel Checklists.

**Architecture:** A monolithic local FastAPI application serving a Bootstrap 5 responsive UI with Chart.js and DataTables. The app stores files and audit caches in SQLite to minimize extraction overhead and Gemini API token consumption. The app scans files locally on-demand and allows dynamic mapping of Excel checklist columns.

**Tech Stack:** Python 3.12+, FastAPI, Uvicorn, SQLite, SQLAlchemy, PyMuPDF, pdfplumber, pytesseract (OCR), python-docx, openpyxl, reportlab, pandas, and Google Generative AI SDK (Gemini API).

---

## Proposed Changes and Task List

### Task 1: Project Scaffolding and macOS Setup
Set up the python virtual environment, installer script, and macOS shortcut launcher to start the application with double-click.

**Files:**
- Create: `auditor-expedientes/requirements.txt`
- Create: `auditor-expedientes/install.sh`
- Create: `auditor-expedientes/Auditor_Expedientes.command`

- [ ] **Step 1: Write requirements.txt**
  Create `auditor-expedientes/requirements.txt` listing all necessary Python packages.
  ```text
  fastapi>=0.111.0
  uvicorn>=0.30.0
  sqlalchemy>=2.0.30
  pydantic>=2.7.0
  jinja2>=3.1.4
  pandas>=2.2.2
  openpyxl>=3.1.4
  pymupdf>=1.24.5
  pdfplumber>=0.11.1
  pytesseract>=0.3.10
  pdf2image>=1.17.0
  python-docx>=1.1.2
  reportlab>=4.2.0
  google-generativeai>=0.5.4
  python-multipart>=0.0.9
  ```

- [ ] **Step 2: Write install.sh**
  Create `auditor-expedientes/install.sh` to automate environment provisioning, library compilation (like PyMuPDF/pillow), virtual environment setup, and permission granting on macOS.
  ```bash
  #!/bin/bash
  echo "== Instalandor del Auditor de Expedientes =="
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --upgrade pip
  pip install -r requirements.txt
  chmod +x Auditor_Expedientes.command
  echo "Instalación completada. Ahora puedes ejecutar Auditor_Expedientes.command"
  ```

- [ ] **Step 3: Write Auditor_Expedientes.command**
  Create a clickable desktop launcher `auditor-expedientes/Auditor_Expedientes.command`.
  ```bash
  #!/bin/bash
  cd "$(dirname "$0")"
  source .venv/bin/activate
  echo "Iniciando servidor local de Auditor de Expedientes..."
  open "http://localhost:8000"
  uvicorn app.main:app --port 8000
  ```

- [ ] **Step 4: Verify task setup**
  Run: `chmod +x install.sh && ./install.sh`
  Expected: Successful virtual environment creation and package installation.

- [ ] **Step 5: Commit scaffolding**
  Run: `git add auditor-expedientes/ && git commit -m "feat: add project scaffolding and installer"`

---

### Task 2: SQLite Database Integration & Models
Create the SQLite database connection management, database schemas, and SQLAlchemy models to support persistence and cache.

**Files:**
- Create: `auditor-expedientes/app/database.py`
- Create: `auditor-expedientes/app/models.py`
- Create: `auditor-expedientes/app/schemas.py`

- [ ] **Step 1: Implement database.py**
  Establish SQLAlchemy connection settings pointing to a local `auditor.db` file.
  ```python
  from sqlalchemy import create_engine
  from sqlalchemy.ext.declarative import declarative_base
  from sqlalchemy.orm import sessionmaker

  SQLALCHEMY_DATABASE_URL = "sqlite:///./auditor.db"
  engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
  SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
  Base = declarative_base()

  def get_db():
      db = SessionLocal()
      try:
          yield db
      finally:
          db.close()
  ```

- [ ] **Step 2: Implement models.py**
  Define database models for Configuration, Criteria, Folders (Expedientes), Files, and Audit Results.
  ```python
  from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
  from sqlalchemy.orm import relationship
  from datetime import datetime
  from .database import Base

  class Configuration(Base):
      __tablename__ = "configuracion"
      id = Column(Integer, primary_key=True, index=True)
      ruta_expedientes = Column(String, nullable=True)
      ruta_lista_cotejo = Column(String, nullable=True)
      mapeo_columnas = Column(Text, nullable=True) # JSON string
      gemini_api_key = Column(String, nullable=True)
      created_at = Column(DateTime, default=datetime.utcnow)

  class Criteria(Base):
      __tablename__ = "criterios_cotejo"
      id = Column(Integer, primary_key=True, index=True)
      criterio = Column(String, index=True)
      tipo = Column(String, nullable=True)
      peso = Column(Float, default=1.0)
      documento_esperado = Column(String, nullable=True)
      activo = Column(Boolean, default=True)

  class Expediente(Base):
      __tablename__ = "expedientes"
      id = Column(Integer, primary_key=True, index=True)
      nombre_carpeta = Column(String, unique=True, index=True)
      ruta_relativa = Column(String)
      fecha_deteccion = Column(DateTime, default=datetime.utcnow)
      fecha_analisis = Column(DateTime, nullable=True)
      estado_analisis = Column(String, default="Pendiente")
      porcentaje_cumplimiento = Column(Float, default=0.0)
      resultado_global = Column(String, default="Sin analizar")
      error_mensaje = Column(Text, nullable=True)
      
      documentos = relationship("Documento", back_populates="expediente", cascade="all, delete-orphan")
      resultados = relationship("ResultadoAuditoria", back_populates="expediente", cascade="all, delete-orphan")

  class Documento(Base):
      __tablename__ = "documentos_expediente"
      id = Column(Integer, primary_key=True, index=True)
      expediente_id = Column(Integer, ForeignKey("expedientes.id"))
      nombre_archivo = Column(String, index=True)
      ruta_relativa = Column(String)
      tipo_archivo = Column(String)
      tamano_bytes = Column(Integer)
      texto_extraido = Column(Text, nullable=True)
      paginas_totales = Column(Integer, default=0)

      expediente = relationship("Expediente", back_populates="documentos")

  class ResultadoAuditoria(Base):
      __tablename__ = "resultados_auditoria"
      id = Column(Integer, primary_key=True, index=True)
      expediente_id = Column(Integer, ForeignKey("expedientes.id"))
      criterio_id = Column(Integer, ForeignKey("criterios_cotejo.id"))
      estado = Column(String) # Cumple, Cumple parcialmente, No cumple, No aplica
      observacion = Column(Text, nullable=True)
      evidencia_documento = Column(String, nullable=True)
      evidencia_pagina = Column(Integer, nullable=True)
      evidencia_texto = Column(Text, nullable=True)
      fecha_auditoria = Column(DateTime, default=datetime.utcnow)

      expediente = relationship("Expediente", back_populates="resultados")
      criterio = relationship("Criteria")
  ```

- [ ] **Step 3: Implement schemas.py**
  Define Pydantic structures for database API operations.
  ```python
  from pydantic import BaseModel
  from datetime import datetime
  from typing import Optional, List, Dict

  class ConfigurationSchema(BaseModel):
      ruta_expedientes: str
      ruta_lista_cotejo: str
      mapeo_columnas: Dict[str, str]
      gemini_api_key: Optional[str] = None

      class Config:
          from_attributes = True

  class AuditResultResponse(BaseModel):
      criterio_id: int
      estado: str
      observacion: str
      evidencia_documento: Optional[str] = None
      evidencia_pagina: Optional[int] = None
      evidencia_texto: Optional[str] = None
  ```

- [ ] **Step 4: Verify Database migrations and schemas**
  Create a temporary script to initialize the database:
  Run: `python -c "from app.database import Base, engine; from app.models import Base as MBase; Base.metadata.create_all(bind=engine)"`
  Expected: Successfully generated `auditor.db` locally.

- [ ] **Step 5: Commit models**
  Run: `git add auditor-expedientes/app/ && git commit -m "feat: add SQLite connection and SQLAlchemy models"`

---

### Task 3: Document Parser Service
Implement the pipeline to extract raw text content from PDF and Excel files, utilizing PyMuPDF (`fitz`), pdfplumber, pytesseract OCR, and pandas.

**Files:**
- Create: `auditor-expedientes/app/services/parser.py`

- [ ] **Step 1: Write text extraction helpers in parser.py**
  Implement PDF parsing using PyMuPDF and `pdfplumber`, and Tesseract OCR when text extraction yields less than 50 characters.
  ```python
  import fitz  # PyMuPDF
  import pdfplumber
  import pandas as pd
  import pytesseract
  from PIL import Image
  import io

  def extract_text_from_pdf(file_path: str) -> tuple[str, int]:
      text = ""
      total_pages = 0
      try:
          doc = fitz.open(file_path)
          total_pages = len(doc)
          for page in doc:
              text += page.get_text()
          doc.close()
          
          # Fallback to pdfplumber if fitz returns empty (sometimes occurs with tables)
          if len(text.strip()) < 50:
              text = ""
              with pdfplumber.open(file_path) as pdf:
                  for page in pdf.pages:
                      text += page.extract_text() or ""
                      
          # Fallback to Tesseract OCR if still empty (scanned image PDFs)
          if len(text.strip()) < 50:
              text = ""
              doc = fitz.open(file_path)
              for page_num in range(len(doc)):
                  page = doc.load_page(page_num)
                  pix = page.get_pixmap()
                  image_data = pix.tobytes("png")
                  image = Image.open(io.BytesIO(image_data))
                  page_text = pytesseract.image_to_string(image, lang='spa')
                  text += f"\n--- Página {page_num + 1} ---\n" + page_text
              doc.close()
              
      except Exception as e:
          text = f"Error al extraer texto del PDF: {str(e)}"
      return text, total_pages

  def extract_text_from_excel(file_path: str) -> str:
      try:
          xls = pd.ExcelFile(file_path)
          sheet_texts = []
          for sheet_name in xls.sheet_names:
              df = pd.read_excel(xls, sheet_name=sheet_name)
              sheet_texts.append(f"Hoja: {sheet_name}\n" + df.to_string())
          return "\n\n".join(sheet_texts)
      except Exception as e:
          return f"Error al extraer texto de Excel: {str(e)}"
  ```

- [ ] **Step 2: Add validation tests for the parser**
  Create a test script `auditor-expedientes/tests/test_parser.py` and run tests on sample PDFs or files if available.
  Expected: Text and page count returned correctly.

- [ ] **Step 3: Commit parser**
  Run: `git add auditor-expedientes/app/services/parser.py && git commit -m "feat: implement document parser pipeline with OCR fallback"`

---

### Task 4: Gemini API Auditor Service
Build the audit engine that reads criteria, identifies matching files in the folder (fuzzy matches by document category name), constructs the structured prompt, calls Gemini API, and updates SQLite.

**Files:**
- Create: `auditor-expedientes/app/services/auditor.py`

- [ ] **Step 1: Write Gemini API helper and prompt builder**
  Write code in `auditor-expedientes/app/services/auditor.py` using `google-generativeai` with JSON schema enforcement.
  ```python
  import os
  import json
  import google.generativeai as genai
  from sqlalchemy.orm import Session
  from ..models import Criteria, Expediente, Documento, ResultadoAuditoria, Configuration
  from .parser import extract_text_from_pdf, extract_text_from_excel

  def configure_gemini(db: Session):
      config = db.query(Configuration).first()
      api_key = os.environ.get("GEMINI_API_KEY")
      if config and config.gemini_api_key:
          api_key = config.gemini_api_key
      if not api_key:
          raise ValueError("API Key de Gemini no configurada")
      genai.configure(api_key=api_key)

  def audit_expediente_against_criteria(db: Session, expediente_id: int):
      expediente = db.query(Expediente).filter(Expediente.id == expediente_id).first()
      if not expediente:
          return
      
      configure_gemini(db)
      criterios = db.query(Criteria).filter(Criteria.activo == True).all()
      
      # Clear previous audit results for this expediente
      db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente_id).delete()
      
      # Prepare documents cache
      docs = db.query(Documento).filter(Documento.expediente_id == expediente_id).all()
      
      model = genai.GenerativeModel('gemini-2.5-flash')
      
      for criterio in criterios:
          # Fuzzy match expected document by filename
          matching_docs = []
          for doc in docs:
              if criterio.documento_esperado.lower() in doc.nombre_archivo.lower():
                  matching_docs.append(doc)
          
          if not matching_docs:
              # Expected document does not exist
              resultado = ResultadoAuditoria(
                  expediente_id=expediente_id,
                  criterio_id=criterio.id,
                  estado="No cumple",
                  observacion=f"No se identificó evidencia documental del archivo esperado: '{criterio.documento_esperado}'."
              )
              db.add(resultado)
              continue
          
          # Collect text from matching docs
          combined_text = ""
          for m_doc in matching_docs:
              combined_text += f"\nArchivo: {m_doc.nombre_archivo}\n{m_doc.texto_extraido}\n"
          
          prompt = f"""
          Actúa como un Auditor Administrativo Gubernamental experto.
          Evalúa el siguiente CRITERIO de auditoría sobre los documentos proporcionados:
          
          Criterio: {criterio.criterio}
          Documento Esperado: {criterio.documento_esperado}
          
          Textos de los documentos del expediente:
          {combined_text[:12000]} # Safe limit for token boundaries
          
          Determina si el expediente cumple con el criterio.
          Debes retornar estrictamente un objeto JSON con las siguientes llaves:
          - estado: "Cumple", "Cumple parcialmente", "No cumple", o "No aplica"
          - observacion: Una explicación administrativa formal detallando los hallazgos en español
          - evidencia_documento: Nombre exacto del archivo que contiene la evidencia
          - evidencia_pagina: Número de página (entero, 1-based)
          - evidencia_texto: Frase literal donde se corrobora la evidencia
          """
          
          try:
              response = model.generate_content(
                  prompt,
                  generation_config={"response_mime_type": "application/json"}
              )
              data = json.loads(response.text)
              
              resultado = ResultadoAuditoria(
                  expediente_id=expediente_id,
                  criterio_id=criterio.id,
                  estado=data.get("estado", "No cumple"),
                  observacion=data.get("observacion", ""),
                  evidencia_documento=data.get("evidencia_documento"),
                  evidencia_pagina=data.get("evidencia_pagina"),
                  evidencia_texto=data.get("evidencia_texto")
              )
              db.add(resultado)
          except Exception as e:
              resultado = ResultadoAuditoria(
                  expediente_id=expediente_id,
                  criterio_id=criterio.id,
                  estado="No cumple",
                  observacion=f"Error durante el análisis del criterio: {str(e)}"
              )
              db.add(resultado)
      
      # Calculate compliance percentage and update
      resultados_eval = db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == expediente_id).all()
      total_weighted = 0.0
      earned_weighted = 0.0
      cumple_count = 0
      
      for r in resultados_eval:
          peso = r.criterio.peso
          total_weighted += peso
          if r.estado == "Cumple":
              earned_weighted += peso
              cumple_count += 1
          elif r.estado == "Cumple parcialmente":
              earned_weighted += (peso * 0.5)
              
      expediente.porcentaje_cumplimiento = (earned_weighted / total_weighted * 100) if total_weighted > 0 else 0.0
      
      if cumple_count == len(resultados_eval):
          expediente.resultado_global = "Cumple"
      elif earned_weighted > (total_weighted * 0.5):
          expediente.resultado_global = "Cumple parcialmente"
      else:
          expediente.resultado_global = "No cumple"
          
      expediente.estado_analisis = "Completado"
      expediente.fecha_analisis = datetime.utcnow()
      db.commit()
  ```

- [ ] **Step 2: Commit auditor service**
  Run: `git add auditor-expedientes/app/services/auditor.py && git commit -m "feat: implement Gemini API auditor logic with structured outputs"`

---

### Task 5: Report Generators Service
Implement the logic to export consolidated audit logs to formatted Excel files, Word executive documents, and closed PDF reports.

**Files:**
- Create: `auditor-expedientes/app/services/reports.py`

- [ ] **Step 1: Write report formats using pandas, docx, and reportlab**
  Create formatting functions inside `auditor-expedientes/app/services/reports.py`.
  ```python
  import pandas as pd
  from openpyxl import Workbook
  from openpyxl.styles import PatternFill, Font, Alignment
  from docx import Document
  from docx.shared import Inches, Pt
  from reportlab.lib.pagesizes import letter
  from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
  from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
  from reportlab.lib import colors
  from sqlalchemy.orm import Session
  from ..models import Expediente, ResultadoAuditoria, Criteria

  def generate_consolidated_excel(db: Session, output_path: str):
      expedientes = db.query(Expediente).all()
      criterios = db.query(Criteria).all()
      
      wb = Workbook()
      ws = wb.active
      ws.title = "Consolidado Auditoría"
      
      # Header Row
      headers = ["Expediente", "Resultado Global", "% Cumplimiento"] + [c.criterio for c in criterios]
      ws.append(headers)
      
      # Data rows
      fill_green = PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid")
      fill_yellow = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
      fill_red = PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid")
      
      for exp in expedientes:
          row = [exp.nombre_carpeta, exp.resultado_global, f"{exp.porcentaje_cumplimiento:.1f}%"]
          for crit in criterios:
              res = db.query(ResultadoAuditoria).filter(
                  ResultadoAuditoria.expediente_id == exp.id,
                  ResultadoAuditoria.criterio_id == crit.id
              ).first()
              row.append(res.estado if res else "Sin analizar")
          ws.append(row)
          
      # Add color styling to headers and cells
      for col in range(1, len(headers) + 1):
          ws.cell(row=1, column=col).font = Font(bold=True)
          
      wb.save(output_path)

  def generate_executive_word(db: Session, output_path: str):
      doc = Document()
      doc.add_heading("Reporte Ejecutivo: Auditor de Expedientes", level=0)
      
      expedientes = db.query(Expediente).all()
      
      doc.add_paragraph("Este reporte sintetiza el cumplimiento administrativo de las carpetas sincronizadas.")
      
      for exp in expedientes:
          doc.add_heading(f"Expediente: {exp.nombre_carpeta}", level=1)
          doc.add_paragraph(f"Cumplimiento: {exp.porcentaje_cumplimiento:.1f}% ({exp.resultado_global})")
          
          table = doc.add_table(rows=1, cols=3)
          hdr_cells = table.rows[0].cells
          hdr_cells[0].text = 'Criterio'
          hdr_cells[1].text = 'Estado'
          hdr_cells[2].text = 'Observación'
          
          resultados = db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == exp.id).all()
          for r in resultados:
              row_cells = table.add_row().cells
              row_cells[0].text = r.criterio.criterio
              row_cells[1].text = r.estado
              row_cells[2].text = r.observacion or ""
              
      doc.save(output_path)

  def generate_executive_pdf(db: Session, output_path: str):
      doc = SimpleDocTemplate(output_path, pagesize=letter)
      styles = getSampleStyleSheet()
      story = []
      
      story.append(Paragraph("Reporte Ejecutivo de Auditoría", styles['Title']))
      story.append(Spacer(1, 12))
      
      expedientes = db.query(Expediente).all()
      for exp in expedientes:
          story.append(Paragraph(f"<b>Expediente:</b> {exp.nombre_carpeta}", styles['Heading2']))
          story.append(Paragraph(f"Cumplimiento: {exp.porcentaje_cumplimiento:.1f}% ({exp.resultado_global})", styles['Normal']))
          story.append(Spacer(1, 8))
          
      doc.build(story)
  ```

- [ ] **Step 2: Commit reports**
  Run: `git add auditor-expedientes/app/services/reports.py && git commit -m "feat: implement reports exporter engine for Excel, Word, and PDF"`

---

### Task 6: FastAPI Routing and Backend Services
Define all HTTP API endpoints, setup request controllers, initialize database models, and mount endpoints.

**Files:**
- Create: `auditor-expedientes/app/main.py`

- [ ] **Step 1: Write routing and API controllers in main.py**
  Create all web routes: Dashboard, detail viewing, configuration uploading, manual folder scanning, single audit execution, and export downloads.
  ```python
  import os
  import json
  from fastapi import FastAPI, Depends, Request, Form, BackgroundTasks
  from fastapi.templating import Jinja2Templates
  from fastapi.staticfiles import StaticFiles
  from fastapi.responses import FileResponse, RedirectResponse
  from sqlalchemy.orm import Session
  import pandas as pd
  from datetime import datetime

  from .database import engine, Base, get_db
  from .models import Configuration, Criteria, Expediente, Documento, ResultadoAuditoria
  from .services.parser import extract_text_from_pdf, extract_text_from_excel
  from .services.auditor import audit_expediente_against_criteria
  from .services.reports import generate_consolidated_excel, generate_executive_word, generate_executive_pdf

  # Initialize DB tables
  Base.metadata.create_all(bind=engine)

  app = FastAPI(title="Auditor de Expedientes")

  # Setup Templates and Static files directories
  app.mount("/static", StaticFiles(directory="static"), name="static")
  templates = Jinja2Templates(directory="app/templates")

  @app.get("/")
  def read_dashboard(request: Request, db: Session = Depends(get_db)):
      expedientes = db.query(Expediente).all()
      total = len(expedientes)
      completados = sum(1 for e in expedientes if e.resultado_global == "Cumple")
      parciales = sum(1 for e in expedientes if e.resultado_global == "Cumple parcialmente")
      no_cumple = sum(1 for e in expedientes if e.resultado_global == "No cumple")
      pendientes = sum(1 for e in expedientes if e.estado_analisis == "Pendiente")
      
      cumplimiento_promedio = sum(e.porcentaje_cumplimiento for e in expedientes) / total if total > 0 else 0.0
      
      return templates.TemplateResponse("dashboard.html", {
          "request": request,
          "expedientes": expedientes,
          "total": total,
          "cumplimiento_promedio": cumplimiento_promedio,
          "completados": completados,
          "parciales": parciales,
          "no_cumple": no_cumple,
          "pendientes": pendientes
      })

  @app.get("/configuracion")
  def get_config(request: Request, db: Session = Depends(get_db)):
      config = db.query(Configuration).first()
      headers = []
      if config and config.ruta_lista_cotejo and os.path.exists(config.ruta_lista_cotejo):
          try:
              df = pd.read_excel(config.ruta_lista_cotejo, nrows=1)
              headers = list(df.columns)
          except:
              pass
      mapeo = json.loads(config.mapeo_columnas) if (config and config.mapeo_columnas) else {}
      
      return templates.TemplateResponse("configuracion.html", {
          "request": request,
          "config": config,
          "headers": headers,
          "mapeo": mapeo
      })

  @app.post("/configuracion")
  def save_config(
      ruta_expedientes: str = Form(...),
      ruta_lista_cotejo: str = Form(...),
      gemini_api_key: str = Form(None),
      col_criterio: str = Form("Criterio"),
      col_tipo: str = Form("Tipo"),
      col_peso: str = Form("Peso"),
      col_documento: str = Form("Documento esperado"),
      db: Session = Depends(get_db)
  ):
      config = db.query(Configuration).first()
      mapeo = {
          "criterio": col_criterio,
          "tipo": col_tipo,
          "peso": col_peso,
          "documento_esperado": col_documento
      }
      mapeo_str = json.dumps(mapeo)
      
      if not config:
          config = Configuration(
              ruta_expedientes=ruta_expedientes,
              ruta_lista_cotejo=ruta_lista_cotejo,
              mapeo_columnas=mapeo_str,
              gemini_api_key=gemini_api_key
          )
          db.add(config)
      else:
          config.ruta_expedientes = ruta_expedientes
          config.ruta_lista_cotejo = ruta_lista_cotejo
          config.mapeo_columnas = mapeo_str
          if gemini_api_key:
              config.gemini_api_key = gemini_api_key
              
      db.commit()
      
      # Reload Criteria from new Checklist
      if os.path.exists(ruta_lista_cotejo):
          try:
              df = pd.read_excel(ruta_lista_cotejo)
              db.query(Criteria).delete()
              for _, row in df.iterrows():
                  crit = Criteria(
                      criterio=str(row[col_criterio]),
                      tipo=str(row.get(col_tipo, "General")),
                      peso=float(row.get(col_peso, 1.0)),
                      documento_esperado=str(row[col_documento]),
                      activo=True
                  )
                  db.add(crit)
              db.commit()
          except Exception as e:
              print(f"Error cargando lista de cotejo: {str(e)}")
              
      return RedirectResponse(url="/configuracion", status_code=303)

  @app.post("/scan")
  def scan_folders(db: Session = Depends(get_db)):
      config = db.query(Configuration).first()
      if not config or not config.ruta_expedientes or not os.path.exists(config.ruta_expedientes):
          return RedirectResponse(url="/configuracion", status_code=303)
          
      # Scan local directory to find child directories (representing folders/expedientes)
      root = config.ruta_expedientes
      for entry in os.listdir(root):
          full_path = os.path.join(root, entry)
          if os.path.isdir(full_path):
              # Check if already in db
              exp = db.query(Expediente).filter(Expediente.nombre_carpeta == entry).first()
              if not exp:
                  exp = Expediente(
                      nombre_carpeta=entry,
                      ruta_relativa=entry,
                      estado_analisis="Pendiente"
                  )
                  db.add(exp)
                  db.commit()
                  db.refresh(exp)
              
              # Scan and add documents inside this folder
              for root_sub, dirs_sub, files_sub in os.walk(full_path):
                  for file in files_sub:
                      if file.startswith(".") or file == "Thumbs.db":
                          continue
                      file_path = os.path.join(root_sub, file)
                      rel_path = os.path.relpath(file_path, full_path)
                      
                      doc_entry = db.query(Documento).filter(
                          Documento.expediente_id == exp.id,
                          Documento.nombre_archivo == file,
                          Documento.ruta_relativa == rel_path
                      ).first()
                      
                      if not doc_entry:
                          # Parse content immediately during file walk
                          text_extracted = ""
                          total_pages = 0
                          if file.lower().endswith(".pdf"):
                              text_extracted, total_pages = extract_text_from_pdf(file_path)
                          elif file.lower().endswith((".xlsx", ".xls")):
                              text_extracted = extract_text_from_excel(file_path)
                              total_pages = 1
                              
                          doc_entry = Documento(
                              expediente_id=exp.id,
                              nombre_archivo=file,
                              ruta_relativa=rel_path,
                              tipo_archivo=file.split(".")[-1] if "." in file else "otro",
                              tamano_bytes=os.path.getsize(file_path),
                              texto_extraido=text_extracted,
                              paginas_totales=total_pages
                          )
                          db.add(doc_entry)
              db.commit()
      return RedirectResponse(url="/", status_code=303)

  @app.post("/audit/{exp_id}")
  def run_audit(exp_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
      exp = db.query(Expediente).filter(Expediente.id == exp_id).first()
      if exp:
          exp.estado_analisis = "Analizando"
          db.commit()
          background_tasks.add_task(audit_expediente_against_criteria, db, exp_id)
      return RedirectResponse(url="/", status_code=303)

  @app.get("/expediente/{exp_id}")
  def get_expediente_detail(exp_id: int, request: Request, db: Session = Depends(get_db)):
      exp = db.query(Expediente).filter(Expediente.id == exp_id).first()
      resultados = db.query(ResultadoAuditoria).filter(ResultadoAuditoria.expediente_id == exp_id).all()
      return templates.TemplateResponse("detalle.html", {
          "request": request,
          "expediente": exp,
          "resultados": resultados
      })

  @app.get("/export/excel")
  def download_excel(db: Session = Depends(get_db)):
      output_path = "/tmp/consolidado.xlsx"
      generate_consolidated_excel(db, output_path)
      return FileResponse(output_path, filename="Consolidado_Auditoria.xlsx")

  @app.get("/export/word")
  def download_word(db: Session = Depends(get_db)):
      output_path = "/tmp/reporte.docx"
      generate_executive_word(db, output_path)
      return FileResponse(output_path, filename="Reporte_Ejecutivo.docx")

  @app.get("/export/pdf")
  def download_pdf(db: Session = Depends(get_db)):
      output_path = "/tmp/reporte.pdf"
      generate_executive_pdf(db, output_path)
      return FileResponse(output_path, filename="Reporte_Ejecutivo.pdf")
  ```

- [ ] **Step 2: Commit main routing**
  Run: `git add auditor-expedientes/app/main.py && git commit -m "feat: implement FastAPI controllers, database sync, folder scanning, background workers, and exports"`

---

### Task 7: Premium UI Styling & JavaScript App logic
Create static files with customized Glassmorphism design systems, transitions, responsive metrics dashboards, and theme toggling engines.

**Files:**
- Create: `auditor-expedientes/static/css/style.css`
- Create: `auditor-expedientes/static/js/app.js`

- [ ] **Step 1: Write custom styles in style.css**
  Implement theme custom variables, custom animations, custom scrollbars, and card properties.
  ```css
  :root {
    --bg-primary: #f8fafc;
    --bg-card: #ffffff;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --accent: #4f46e5;
    --border-color: #e2e8f0;
    --glass-bg: rgba(255, 255, 255, 0.7);
    --glass-border: rgba(226, 232, 240, 0.8);
    --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
  }

  [data-theme="dark"] {
    --bg-primary: #090d16;
    --bg-card: #131c2e;
    --text-main: #f1f5f9;
    --text-muted: #94a3b8;
    --accent: #6366f1;
    --border-color: #1e293b;
    --glass-bg: rgba(19, 28, 46, 0.7);
    --glass-border: rgba(30, 41, 59, 0.8);
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-main);
    font-family: 'Outfit', sans-serif;
  }

  .glass-panel {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    box-shadow: var(--shadow);
    padding: 24px;
  }
  ```

- [ ] **Step 2: Implement app.js**
  Write client-side interactivity, Chart.js initialization, and local state management for the theme toggle.
  ```javascript
  document.addEventListener("DOMContentLoaded", () => {
    // Local storage theme checks
    const theme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", theme);

    window.toggleTheme = () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    };
  });
  ```

- [ ] **Step 3: Commit static files**
  Run: `git add auditor-expedientes/static/ && git commit -m "feat: add premium css styling and interactive js themes"`

---

### Task 8: Frontend HTML Pages and Templates
Create the pages base layout, dashboard visuals, details analysis details viewing panel, mapping configuration and parameters saving page.

**Files:**
- Create: `auditor-expedientes/app/templates/base.html`
- Create: `auditor-expedientes/app/templates/dashboard.html`
- Create: `auditor-expedientes/app/templates/detalle.html`
- Create: `auditor-expedientes/app/templates/configuracion.html`

- [ ] **Step 1: Implement templates/base.html**
  Set standard dependencies (Bootstrap, Bootstrap Icons, Chart.js, Outfit Fonts) and generic header bar.
  ```html
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Auditor{% endblock %}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/static/css/style.css">
  </head>
  <body>
    <nav class="navbar navbar-expand-lg border-bottom">
      <div class="container">
        <a class="navbar-brand fw-bold" href="/"><i class="bi bi-shield-check text-primary"></i> Auditor de Expedientes</a>
        <div class="d-flex gap-2">
          <a href="/" class="btn btn-sm btn-outline-secondary">Dashboard</a>
          <a href="/configuracion" class="btn btn-sm btn-outline-secondary">Configuración</a>
          <button class="btn btn-sm btn-outline-dark" onclick="toggleTheme()"><i class="bi bi-moon-stars-fill"></i></button>
        </div>
      </div>
    </nav>
    <div class="container my-4">
      {% block content %}{% endblock %}
    </div>
    <script src="/static/js/app.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Implement templates/dashboard.html**
  Implement the dashboard with compliance percentages, cards, scan button, and results datatable.
  ```html
  {% extends "base.html" %}
  {% block content %}
  <div class="row g-4 mb-4">
    <div class="col-md-3">
      <div class="glass-panel text-center">
        <h6 class="text-muted text-uppercase">Total Expedientes</h6>
        <h2>{{ total }}</h2>
      </div>
    </div>
    <div class="col-md-3">
      <div class="glass-panel text-center">
        <h6 class="text-muted text-uppercase">Cumplimiento Global</h6>
        <h2>{{ "%.1f"|format(cumplimiento_promedio) }}%</h2>
      </div>
    </div>
    <div class="col-md-3">
      <div class="glass-panel text-center text-danger">
        <h6 class="text-muted text-uppercase">Con Observaciones</h6>
        <h2>{{ no_cumple }}</h2>
      </div>
    </div>
    <div class="col-md-3">
      <div class="glass-panel text-center text-primary">
        <h6 class="text-muted text-uppercase">Pendientes</h6>
        <h2>{{ pendientes }}</h2>
      </div>
    </div>
  </div>

  <div class="glass-panel mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold">Expedientes Detectados</h5>
      <div class="d-flex gap-2">
        <form action="/scan" method="post"><button class="btn btn-primary btn-sm"><i class="bi bi-folder-fill"></i> Escanear Carpeta</button></form>
        <a href="/export/excel" class="btn btn-success btn-sm"><i class="bi bi-file-earmark-excel"></i> Exportar Excel</a>
        <a href="/export/word" class="btn btn-primary btn-sm"><i class="bi bi-file-word"></i> Exportar Word</a>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Nombre del Expediente</th>
            <th>Estado Análisis</th>
            <th>Cumplimiento</th>
            <th>Resultado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {% for exp in expedientes %}
          <tr>
            <td class="fw-bold">{{ exp.nombre_carpeta }}</td>
            <td>{{ exp.estado_analisis }}</td>
            <td>{{ "%.1f"|format(exp.porcentaje_cumplimiento) }}%</td>
            <td>
              {% if exp.resultado_global == 'Cumple' %}
              <span class="badge bg-success">Cumple</span>
              {% elif exp.resultado_global == 'Cumple parcialmente' %}
              <span class="badge bg-warning">Parcial</span>
              {% else %}
              <span class="badge bg-danger">No cumple</span>
              {% endif %}
            </td>
            <td class="text-end">
              <a href="/expediente/{{ exp.id }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye"></i> Ver</a>
              <form action="/audit/{{ exp.id }}" method="post" class="d-inline">
                <button class="btn btn-sm btn-outline-success"><i class="bi bi-play-fill"></i> Auditar</button>
              </form>
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </div>
  {% endblock %}
  ```

- [ ] **Step 3: Implement templates/detalle.html**
  Create the detail sheet presenting compliant parameters, text chunks, and citations.
  ```html
  {% extends "base.html" %}
  {% block content %}
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="fw-bold">Detalle de Expediente: {{ expediente.nombre_carpeta }}</h3>
    <a href="/" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-left"></i> Volver al Dashboard</a>
  </div>

  <div class="glass-panel mb-4">
    <h5>Resultado Global: {{ expediente.resultado_global }} ({{ "%.1f"|format(expediente.porcentaje_cumplimiento) }}%)</h5>
    <p class="text-muted">Analizado el: {{ expediente.fecha_analisis }}</p>
  </div>

  <div class="row g-4">
    {% for res in resultados %}
    <div class="col-12">
      <div class="glass-panel border-start border-4 {% if res.estado == 'Cumple' %}border-success{% elif res.estado == 'Cumple parcialmente' %}border-warning{% else %}border-danger{% endif %}">
        <div class="d-flex justify-content-between">
          <h6 class="fw-bold">{{ res.criterio.criterio }}</h6>
          <span class="badge {% if res.estado == 'Cumple' %}bg-success{% elif res.estado == 'Cumple parcialmente' %}bg-warning{% else %}bg-danger{% endif %}">{{ res.estado }}</span>
        </div>
        <p class="mt-2">{{ res.observacion }}</p>
        {% if res.evidencia_texto %}
        <div class="p-3 bg-light rounded mt-2 border-start border-3 border-secondary">
          <small class="text-muted d-block">Evidencia en <b>{{ res.evidencia_documento }} (Pág. {{ res.evidencia_pagina }})</b>:</small>
          <em class="small">"{{ res.evidencia_texto }}"</em>
        </div>
        {% endif %}
      </div>
    </div>
    {% endfor %}
  </div>
  {% endblock %}
  ```

- [ ] **Step 4: Implement templates/configuracion.html**
  Build the configuration screen, mapping selector rows, and Gemini API keys.
  ```html
  {% extends "base.html" %}
  {% block content %}
  <h3 class="fw-bold mb-4">Configuración de Rutas y Mapeo</h3>
  <div class="glass-panel">
    <form action="/configuracion" method="post">
      <div class="mb-3">
        <label class="form-label">Ruta de Carpeta de Expedientes</label>
        <input type="text" class="form-control" name="ruta_expedientes" value="{{ config.ruta_expedientes if config else '' }}" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Ruta Archivo Lista de Cotejo (.xlsx)</label>
        <input type="text" class="form-control" name="ruta_lista_cotejo" value="{{ config.ruta_lista_cotejo if config else '' }}" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Gemini API Key</label>
        <input type="password" class="form-control" name="gemini_api_key" value="{{ config.gemini_api_key if config else '' }}">
      </div>
      <h5 class="fw-bold mt-4 mb-3">Mapeo de Columnas del Excel</h5>
      <div class="row g-3">
        <div class="col-md-3">
          <label class="form-label">Criterio</label>
          <select class="form-select" name="col_criterio">
            {% for h in headers %}<option value="{{ h }}" {% if mapeo.criterio == h %}selected{% endif %}>{{ h }}</option>{% endfor %}
            <option value="Criterio" {% if not mapeo or mapeo.criterio == 'Criterio' %}selected{% endif %}>Criterio</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Tipo / Categoría</label>
          <select class="form-select" name="col_tipo">
            {% for h in headers %}<option value="{{ h }}" {% if mapeo.tipo == h %}selected{% endif %}>{{ h }}</option>{% endfor %}
            <option value="Tipo" {% if not mapeo or mapeo.tipo == 'Tipo' %}selected{% endif %}>Tipo</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Peso Ponderado</label>
          <select class="form-select" name="col_peso">
            {% for h in headers %}<option value="{{ h }}" {% if mapeo.peso == h %}selected{% endif %}>{{ h }}</option>{% endfor %}
            <option value="Peso" {% if not mapeo or mapeo.peso == 'Peso' %}selected{% endif %}>Peso</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Documento Esperado</label>
          <select class="form-select" name="col_documento">
            {% for h in headers %}<option value="{{ h }}" {% if mapeo.documento_esperado == h %}selected{% endif %}>{{ h }}</option>{% endfor %}
            <option value="Documento esperado" {% if not mapeo or mapeo.documento_esperado == 'Documento esperado' %}selected{% endif %}>Documento esperado</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary mt-4" type="submit">Guardar Configuración</button>
    </form>
  </div>
  {% endblock %}
  ```

- [ ] **Step 5: Commit templates**
  Run: `git add auditor-expedientes/app/templates/ && git commit -m "feat: implement templates for dashboard, detail audit results, and excel column mapping configuration"`

---

### Task 9: User Manual & Final Verification
Create a complete local user manual detailing usage, API setup, Excel requirements, and launch steps. Verify server deployment.

**Files:**
- Create: `auditor-expedientes/MANUAL.md`

- [ ] **Step 1: Write user manual in MANUAL.md**
  Write comprehensive manual explaining installation, configuring directories, Excel columns mapping, Gemini setup, auditing, and exports.
  ```markdown
  # Manual de Usuario - Auditor de Expedientes

  Este sistema automatiza la revisión documental de expedientes sincronizados con Google Drive.

  ## Requisitos
  * macOS (Apple Silicon M1/M2/M3/M4 o Intel)
  * Python 3.12+
  * Tesseract OCR (Opcional, para digitalizar imágenes): `brew install tesseract`

  ## Instalación
  1. Abre la terminal en el directorio del proyecto.
  2. Ejecuta el script de instalación:
     ```bash
     ./install.sh
     ```

  ## Ejecución
  1. Haz doble clic en el archivo `Auditor_Expedientes.command` en el directorio.
  2. La aplicación abrirá automáticamente una ventana en el navegador en `http://localhost:8000`.

  ## Uso de la aplicación
  1. **Configuración Inicial:**
     * Ingresa la ruta de la carpeta principal de expedientes.
     * Ingresa la ruta del archivo de Lista de Cotejo de Excel.
     * Ingresa tu API Key de Gemini.
     * Guarda la configuración.
  2. **Escaneo de Expedientes:**
     * En el Dashboard, haz clic en **Escanear Carpeta** para detectar los directorios y archivos.
  3. **Auditar:**
     * Presiona el botón **Auditar** en el expediente deseado para iniciar el análisis con IA.
  4. **Reportes:**
     * Utiliza los botones superiores en el Dashboard para descargar reportes en formatos Excel, Word o PDF.
  ```

- [ ] **Step 2: Commit User Manual**
  Run: `git add auditor-expedientes/MANUAL.md && git commit -m "docs: write comprehensive manual of use for final users"`

- [ ] **Step 3: Verification**
  Run all Python syntax check validation commands.
  Run: `source .venv/bin/activate && python -m py_compile app/main.py app/database.py app/models.py app/schemas.py app/services/parser.py app/services/auditor.py app/services/reports.py`
  Expected: Successful compilation without warnings or syntax errors.
