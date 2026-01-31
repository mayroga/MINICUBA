async function exportarPDF(){
  const texto = document.getElementById("respuesta").innerText;
  const form = new FormData();
  form.append("texto", texto);
  window.open(`${API_URL}/generar_pdf`, "_blank");
}

function enviarWhatsApp(){
  const texto = encodeURIComponent(document.getElementById("respuesta").innerText);
  window.open("https://wa.me/?text="+texto,"_blank");
}
