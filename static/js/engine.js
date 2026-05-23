// =========================================================
// KAMIZEN ENGINE V4 - FULL SYSTEM (AVATARS + OBSTACLES + TREASURE RUN + 10MIN HARD STOP)
// =========================================================

let state={
userName:"Warrior",
stories:[],missions:[],currentIndex:0,currentBlock:0,
phase:"loading",
speechLocked:false,
initialized:false,
timer:null,timeLeft:0,
sessionStartTime:null,
masterTimer:null,

audioCtx:null,oscillator:null,gainNode:null,filterNode:null,musicInterval:null,

player:{x:50,y:0,vy:0,onGround:true,alive:true,score:0},

obstacles:[],keys:{},treasure:{x:85,y:40,collected:false,active:false}
};

const $=id=>document.getElementById(id);
const card=t=>`<div class="card">${t}</div>`;

// =========================================================
// LOAD
// =========================================================

window.addEventListener("load",async()=>{loadProgress();await loadAll();intro();});

function loadProgress(){const s=localStorage.getItem("kamizen");if(s)Object.assign(state,JSON.parse(s));}
function save(){localStorage.setItem("kamizen",JSON.stringify(state));}

async function loadAll(){
const app=$("app");app.innerHTML=card("LOADING...");
const [a,b]=await Promise.all([fetch("/api/stories"),fetch("/api/missions")]);
state.stories=(await a.json()).stories||[];
state.missions=(await b.json()).missions||[];
state.initialized=true;
}

// =========================================================
// 10 MIN HARD STOP
// =========================================================

function startMasterTimer(){
clearTimeout(state.masterTimer);
state.masterTimer=setTimeout(endSession,600000);
}

function endSession(){
stopAll();
document.getElementById("app").innerHTML=card(`<h2>SESSION COMPLETE</h2><p>${state.userName} finished training</p>`);
narrate("Session complete. Good job.");
}

function stopAll(){
speechSynthesis.cancel();
clearInterval(state.timer);
state.obstacles=[];
state.treasure.collected=false;
}

// =========================================================
// SPEECH (READ EVERYTHING)
// =========================================================

function narrate(t){
if(!t)return;
state.speechLocked=true;
speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(t);
u.onend=()=>state.speechLocked=false;
speechSynthesis.speak(u);
}

// =========================================================
// INTRO
// =========================================================

function intro(){
app.innerHTML=`

<div class="card center">
<h1>KAMIZEN ENGINE</h1>
<button onclick="start()">START</button>
</div>`;
}

function start(){startMasterTimer();showStory();}

// =========================================================
// STORY
// =========================================================

function showStory(){
const s=state.stories[state.currentIndex]||{t:"Story",en:"Training begins"};
app.innerHTML=card(`<h2>${s.t}</h2><p>${s.en}</p>`)+`<button onclick='startMission()'>CONTINUE</button>`;
narrate(s.t+". "+s.en);
}

function startMission(){state.currentBlock=0;state.phase="game";startLoop();}

// =========================================================
// OBSTACLES + GAME WORLD
// =========================================================

function spawnObstacle(){
const type=Math.random()<0.6?"rock":"bad";
state.obstacles.push({x:100,y:0,type});
}

function update(){
if(state.phase!="game")return;

// physics
state.player.vy-=0.8;
state.player.y+=state.player.vy;
if(state.player.y<0){state.player.y=0;state.player.vy=0;state.player.onGround=true;}

// move obstacles
state.obstacles.forEach(o=>o.x-=2.2);

// spawn terrain irregularities
if(Math.random()<0.05)spawnObstacle();

// collision
state.obstacles.forEach(o=>{
if(o.x<22 && o.x>15 && state.player.y<8){
state.player.alive=false;
narrate("Obstacle hit. Mission failed.");
}
});

// treasure logic (moves toward player)
if(!state.treasure.collected){
state.treasure.x-=0.3;
if(state.player.alive && state.player.y>0 && state.treasure.x<25){
state.treasure.collected=true;
state.player.score++;
narrate("Treasure captured!");
}
}

renderGame();
requestAnimationFrame(update);
}

function startLoop(){update();}

// =========================================================
// CONTROLS (SPACE JUMP)
// =========================================================

addEventListener("keydown",e=>{
if(e.code=="Space" && state.player.onGround){
state.player.vy=12;
state.player.onGround=false;
}
});

// =========================================================
// RENDER GAME (IMPROVED AVATARS + LANDSCAPE)
// =========================================================

function renderGame(){

let obs="";
state.obstacles.forEach(o=>{
obs+=`<div style='position:absolute;left:${o.x}%;bottom:20px;font-size:22px'>${o.type=="bad"?"⚠️":"🪨"}</div>`;
});

const terrain=`linear-gradient(180deg,#bae6fd 0%,#e0f2fe 50%,#22c55e 50%,#15803d 100%)`;

app.innerHTML=`

<div class='card'><h2>MISSION RUN</h2><p>SPACE = JUMP • Avoid obstacles • Reach treasure</p></div>

<div style='height:260px;position:relative;overflow:hidden;border-radius:20px;background:${terrain}'>

<!-- TREASURE -->

<div style='position:absolute;left:${state.treasure.x}%;bottom:${state.treasure.y}px;font-size:34px;transition:.2s'>💎</div>

<!-- AVATARS (MORE REALISTIC) -->

<div style='position:absolute;left:15%;bottom:${state.player.y}px;font-size:28px'>🧍‍♂️ MICHAEL</div>
<div style='position:absolute;left:5%;bottom:0;font-size:28px'>🧍‍♂️ ${state.userName.toUpperCase()}</div>

${obs}

</div>

<button onclick='tryCollect()'>ATTEMPT COLLECT</button>
`;

// ALWAYS READ SCREEN
narrate("Jump over obstacles. Avoid rocks and traps. Reach the moving treasure.");
}

// =========================================================
// COLLECT SYSTEM
// =========================================================

function tryCollect(){
if(state.player.alive && state.treasure.collected){
narrate("Success. Treasure secured.");
}else{
narrate("Failed. Try again next mission.");
}
}

// =========================================================
// START GAME LOOP
// =========================================================

function startGameLoop(){update();}
