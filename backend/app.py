from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil, json
from datetime import datetime
from fpdf import FPDF

app = FastAPI(title="MINICUBA Backend")

# ------------------- CORS -------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cambiar a tu dominio en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Carpetas y archivos -------------------
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

HIST_FILE = Path("historial.json")
if not HIST_FILE.exists():
    HIST_FILE.write_text("[]")

# ------------------- Subida de archivos -------------------
@app.post("/subir_archivo")
async def subir_archivo(file: UploadFile = File(...)):
    save_path = UPLOAD_DIR / file.filename
    with save_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"nombre": file.filename, "fecha": datetime.now().isoformat()}

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
    return JSONResponse(h)

# ------------------- IA local -------------------
@app.post("/ia")
async def ia_local(texto: str = Form(...)):
    texto = texto.lower()
    if "impuesto" in texto:
        respuesta = "Según normas generales, los impuestos dependen del régimen fiscal. Verifica con MFP."
    elif "contrato" in texto:
        respuesta = "Revisa objeto, vigencia, obligaciones y firmas. Evita cláusulas ambiguas."
    else:
        respuesta = "Consulta recibida. Revisión orientativa conforme a prácticas administrativas."
    return {"respuesta": respuesta}

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

# ------------------- Nómina Cubana -------------------
@app.post("/nomina")
async def nomina():
    salario_base = 3000
    seguridad = salario_base * 0.05
    impuesto = salario_base * 0.03
    neto = salario_base - seguridad - impuesto

    return {
        "salario_base": salario_base,
        "seguridad_social": seguridad,
        "impuestos": impuesto,
        "pago_neto": neto,
        "mensaje": "⚠️ Cálculo orientativo conforme a normas vigentes. Confirmar con MFP."
    }
