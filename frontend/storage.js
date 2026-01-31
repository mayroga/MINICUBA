// Solo respaldo local
function organizarLocal(){
  let base = JSON.parse(localStorage.getItem("MINICUBA_FILES")) || [];
  base.sort((a,b)=>a.nombre.localeCompare(b.nombre));
  localStorage.setItem("MINICUBA_FILES",JSON.stringify(base));
}
