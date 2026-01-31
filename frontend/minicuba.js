const API_URL = "https://TU-DOMINIO-RENDER"; // Cambiar por tu URL Render

async function procesar(){
  const rol = document.getElementById("rol").value;
  const modulo = document.getElementById("modulo").value;
  const texto = document.getElementById("consulta").value;
  const archivos = document.getElementById("archivo").files;
  let resultado = "";

  if(archivos.length>0) await guardarArchivos(archivos);

  if(modulo==="revision") resultado = await revisarDocumento(texto);
  if(modulo==="nomina") resultado = await calcularNomina();
  if(modulo==="contrato") resultado = generarContrato(texto);
  if(modulo==="organizar") resultado = organizarArchivos();
  if(modulo==="ia") resultado = await consultaIA(texto);

  await guardarHistorial(resultado);

  document.getElementById("respuesta").innerText = resultado;

  if(rol==="admin"){
    document.getElementById("adminPanel").style.display="block";
    cargarHistorial();
  }
}

// ------------------- Funciones -------------------
async function guardarArchivos(files){
  for(let f of files){
    let form = new FormData();
    form.append("file", f);
    await fetch(`${API_URL}/subir_archivo`, {method:"POST", body:form});
  }
  alert("Archivos subidos correctamente");
}

function generarContrato(texto){
  return `
CONTRATO ADMINISTRATIVO – MIPYME CUBA

Objeto:
${texto}

Cláusulas:
1. Cumplimiento de leyes vigentes de la República de Cuba.
2. Obligaciones fiscales y laborales.
3. Vigencia por acuerdo mutuo.

Documento orientativo.
`;
}

function organizarArchivos(){
  return "Archivos clasificados alfabéticamente y por cuantía.";
}

// ------------------- IA -------------------
async function consultaIA(texto){
  const form = new FormData();
  form.append("texto", texto);
  const res = await fetch(`${API_URL}/ia`, {method:"POST", body:form});
  const data = await res.json();
  return data.respuesta;
}

// ------------------- Historial -------------------
async function guardarHistorial(texto){
  const form = new FormData();
  form.append("texto", texto);
  await fetch(`${API_URL}/guardar_historial`, {method:"POST", body:form});
}

async function cargarHistorial(){
  const res = await fetch(`${API_URL}/historial`);
  const data = await res.json();
  let html="";
  data.forEach(i=>{
    html+=`<p><b>${i.fecha}</b><br>${i.texto}</p><hr>`;
  });
  document.getElementById("historial").innerHTML = html;
}

// ------------------- Nómina -------------------
async function calcularNomina(){
  const res = await fetch(`${API_URL}/nomina`, {method:"POST"});
  const data = await res.json();
  return `
NÓMINA MIPYME – CUBA
Salario base: ${data.salario_base} CUP
Seguridad social: ${data.seguridad_social} CUP
Impuestos: ${data.impuestos} CUP
Pago neto: ${data.pago_neto} CUP
${data.mensaje}`;
}
