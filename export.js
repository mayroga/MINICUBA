function exportarPDF(){
  const texto = document.getElementById("respuesta").innerText;
  const blob = new Blob([texto],{type:"application/pdf"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url;
  a.download="MINICUBA.pdf";
  a.click();
}

function enviarWhatsApp(){
  const texto = encodeURIComponent(
    document.getElementById("respuesta").innerText
  );
  window.open("https://wa.me/?text="+texto,"_blank");
}
