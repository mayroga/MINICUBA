from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from datetime import datetime
import shutil, json
from fpdf import FPDF
import docx2txt
import PyPDF2
import re

app = FastAPI(title="MINICUBA PRO")

# ------------------- CORS -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Si se usa mismo dominio, puede ser ["*"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Carpetas -------------------
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
HIST_FILE = Path("historial.json")
if not HIST_FILE.exists():
    HIST_FILE.write_text("[]")

# ------------------- Frontend -------------------
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

# ------------------- Funciones de lectura de documentos -------------------
def leer_pdf(file_path):
    texto = ""
    try:
        with open(file_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                t = page.extract_text()
                if t: texto += t + "\n"
    except:
        texto = ""
    return texto

def leer_docx(file_path):
    try:
        return docx2txt.process(str(file_path))
    except:
        return ""

def extraer_texto(file_path):
    if str(file_path).lower().endswith(".pdf"):
        return leer_pdf(file_path)
    elif str(file_path).lower().endswith(".docx"):
        return leer_docx(file_path)
    else:
        return file_path.read_text(encoding='utf-8')

# ------------------- Subir archivo -------------------
@app.post("/subir_archivo")
async def subir_archivo(file: UploadFile = File(...)):
    save_path = UPLOAD_DIR / file.filename
    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"nombre": file.filename, "fecha": datetime.now().isoformat()}

# ------------------- Procesar archivos y extraer trabajadores -------------------
@app.get("/procesar_archivos")
async def procesar_archivos():
    resultados = []
    for f in UPLOAD_DIR.iterdir():
        texto = extraer_texto(f)
        # Buscar nombres y salarios por patrón simple (ejemplo)
        # Suponemos: Nombre completo seguido de número
        matches = re.findall(r"([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+ [A-ZÁÉÍÓÚÑ][a-záéíóúñ]+).*?(\d+)", texto)
        for nombre, salario in matches:
            resultados.append({"nombre": nombre, "salario": float(salario)})
    return resultados

# ------------------- Generar nómina completa -------------------
@app.get("/nomina_trabajadores")
async def nomina_trabajadores():
    trabajadores = await procesar_archivos()
    nomina = []
    for t in trabajadores:
        salario_base = t["salario"]
        seguridad = round(salario_base * 0.05,2)
        impuesto = round(salario_base * 0.03,2)
        neto = round(salario_base - seguridad - impuesto,2)
        nomina.append({
            "nombre": t["nombre"],
            "salario_base": salario_base,
            "seguridad_social": seguridad,
            "impuestos": impuesto,
            "pago_neto": neto,
        })
    return {"nomina": nomina, "mensaje": "⚠️ Cálculo orientativo conforme a normas vigentes. Confirmar con MFP."}

# ------------------- Generar contrato/formulario -------------------
@app.post("/generar_contrato")
async def generar_contrato(titulo: str = Form(...), contenido: str = Form(...)):
    texto = f"""
CONTRATO / FORMULARIO – MIPYME CUBA

Título: {titulo}

Contenido:
{contenido}

Cláusulas:
1. Cumplimiento de leyes cubanas vigentes.
2. Obligaciones fiscales y laborales.
3. Vigencia por acuerdo mutuo.

Documento orientativo, sin firmas.
"""
    return {"contrato": texto}

# ------------------- IA administrativa -------------------
@app.post("/ia")
async def ia_local(texto: str = Form(...)):
    texto = texto.lower()
    if "impuesto" in texto:
        respuesta = "Verifica con MFP: impuestos según régimen fiscal cubano."
    elif "contrato" in texto:
        respuesta = "Revisa objeto, vigencia, obligaciones y firmas. Evita cláusulas ambiguas."
    else:
        respuesta = "Consulta recibida. Revisión orientativa conforme a prácticas administrativas."
    return {"respuesta": respuesta}

# ------------------- Organizar documentos -------------------
@app.get("/organizar_documentos")
async def organizar_documentos():
    archivos = []
    for f in sorted(UPLOAD_DIR.iterdir()):
        archivos.append({"nombre": f.name, "cuantia": "No detectada"})
    return archivos

# ------------------- Guardar historial -------------------
@app.post("/guardar_historial")
async def guardar_historial(texto: str = Form(...)):
    h = json.loads(HIST_FILE.read_text())
    h.append({"texto": texto, "fecha": datetime.now().isoformat()})
    HIST_FILE.write_text(json.dumps(h, indent=2))
    return {"status": "ok"}

# ------------------- Cargar historial -------------------
@app.get("/historial")
async def historial():
    h = json.loads(HIST_FILE.read_text())
    return h

# ------------------- Generar PDF -------------------
@app.post("/generar_pdf")
async def generar_pdf(texto: str = Form(...)):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    for line in texto.split("\n"):
        pdf.multi_cell(0, 10, line)
    file_path = UPLOAD_DIR / f"minicuba_{datetime.now().timestamp()}.pdf"
    pdf.output(str(file_path))
    return FileResponse(str(file_path), filename="MINICUBA.pdf")
