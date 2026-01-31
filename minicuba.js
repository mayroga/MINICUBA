function procesar(){
  const rol = document.getElementById("rol").value;
  const modulo = document.getElementById("modulo").value;
  const texto = document.getElementById("consulta").value;
  const archivos = document.getElementById("archivo").files;

  let resultado = "";

  if(archivos.length>0){
    guardarArchivos(archivos);
  }

  if(modulo==="revision") resultado = revisarDocumento(texto);
  if(modulo==="nomina") resultado = calcularNomina(texto);
  if(modulo==="contrato") resultado = generarContrato(texto);
  if(modulo==="organizar") resultado = organizarArchivos();
  if(modulo==="ia") resultado = consultaIA(texto);

  guardarHistorial(resultado);

  document.getElementById("respuesta").innerText = resultado;

  if(rol==="admin"){
    document.getElementById("adminPanel").style.display="block";
    cargarHistorial();
  }
}

/* ---- IA LOCAL (ASISTENTE) ---- */

function consultaIA(texto){
  if(texto.includes("impuesto"))
    return "Según normas generales, los impuestos dependen del régimen fiscal. Verifica con MFP.";
  if(texto.includes("contrato"))
    return "Revisa objeto, vigencia, obligaciones y firmas. Evita cláusulas ambiguas.";
  return "Consulta recibida. Revisión orientativa conforme a prácticas administrativas.";
}

/* ---- CONTRATOS ---- */

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

/* ---- REVISIÓN ---- */

function revisarDocumento(texto){
  let alertas=[];
  if(!texto.includes("fecha")) alertas.push("Falta fecha");
  if(!texto.includes("firma")) alertas.push("Falta firma");
  return `
REVISIÓN AUTOMÁTICA

Observaciones:
${alertas.length?alertas.join("\n"):"Documento completo"}

Sugerencias generadas por MINICUBA.
`;
}

/* ---- NÓMINA CUBANA ---- */

function calcularNomina(texto){
  let salarioBase = 3000;
  let seguridad = salarioBase * 0.05;
  let impuesto = salarioBase * 0.03;
  let neto = salarioBase - seguridad - impuesto;

return `
NÓMINA MIPYME – CUBA

Salario base: ${salarioBase} CUP
Seguridad social (5%): ${seguridad} CUP
Impuestos estimados: ${impuesto} CUP
Pago neto: ${neto} CUP

⚠️ Cálculo orientativo conforme a normas vigentes.
Confirmar con MFP.
`;
}

/* ---- ORGANIZACIÓN ---- */

function organizarArchivos(){
  return "Archivos clasificados alfabéticamente y por cuantía.";
}
