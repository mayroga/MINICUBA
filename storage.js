function guardarArchivos(files){
  let base = JSON.parse(localStorage.getItem("MINICUBA_FILES")) || [];
  for(let f of files){
    base.push({
      nombre:f.name,
      letra:f.name[0].toUpperCase(),
      fecha:new Date().toLocaleString()
    });
  }
  localStorage.setItem("MINICUBA_FILES",JSON.stringify(base));
}

function guardarHistorial(texto){
  let h = JSON.parse(localStorage.getItem("MINICUBA_HIST")) || [];
  h.push({texto,fecha:new Date().toLocaleString()});
  localStorage.setItem("MINICUBA_HIST",JSON.stringify(h));
}

function cargarHistorial(){
  let h = JSON.parse(localStorage.getItem("MINICUBA_HIST")) || [];
  let html = "";
  h.forEach(i=>{
    html+=`<p><b>${i.fecha}</b><br>${i.texto}</p><hr>`;
  });
  document.getElementById("historial").innerHTML = html;
}
