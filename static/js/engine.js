// =========================================================
// KAMIZEN ENGINE OPTIMIZED FULL VERSION
// =========================================================

let state={userName:"Warrior",stories:[],missions:[],currentIndex:0,currentBlock:0,phase:"loading",speechLocked:false,initialized:false,timer:null,timeLeft:0,sessionStartTime:null,audioCtx:null,oscillator:null,gainNode:null,filterNode:null,musicInterval:null,companionToggle:true,player:{x:78,y:0,holding:false,score:0},sessionEnded:false,masterTimeout:null,keyboardEnabled:false};

const $=e=>document.getElementById(e),card=t=>`<div class="card">${t}</div>`,timerUI=`<div class="card center timerCard"><h1 id="timerDisplay">00:00</h1></div>`;

const loot=[["RESPECT","🛡️"],["LOVE","🏡"],["FOCUS","📚"],["HEALTH","🏎️"],["JOY","🪙"],["WEALTH","🏰"]];

function avatar(name,color,id=""){
return `<div ${id?`id="${id}"`:""} class="avatarWrap" style="position:absolute;bottom:15px;${id?`left:${state.player.x}%;transition:left .08s linear;`:`left:8%;`}width:60px;height:110px;"><div class="avatarName" style="font-size:11px;font-weight:bold;color:${color}">${name.toUpperCase()}</div><div class="cube-model-inner"><div class="avatarHead" style="width:24px;height:24px;background:#ffdbac;border-radius:4px;border:2px solid #000;margin:auto;"><div style="display:flex;justify-content:space-around;margin-top:5px"><span style="width:4px;height:4px;background:#000;border-radius:50%"></span><span style="width:4px;height:4px;background:#000;border-radius:50%"></span></div><div class="avatar-mouth" style="width:8px;height:3px;background:#7f1d1d;margin:4px auto"></div></div><div class="avatarBody" style="width:40px;height:34px;background:${color};border:2px solid #000;margin:auto;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold">${name[0].toUpperCase()}</div></div></div>`;
}

function saveProgress(){localStorage.setItem('kamizen_save',JSON.stringify({currentIndex:state.currentIndex,currentBlock:state.currentBlock,userName:state.userName,player:state.player}))}

function loadProgress(){const s=localStorage.getItem('kamizen_save');if(!s)return;const d=JSON.parse(s);state.currentIndex=d.currentIndex||0;state.currentBlock=d.currentBlock||0;state.userName=d.userName||"Warrior";if(d.player)state.player=d.player}

addEventListener("load",async()=>{loadProgress();await loadAllData();showIntro()});

async function loadAllData(){const app=$("app");app.innerHTML=card("<h2>SYSTEM BOOTING...</h2><p>Loading Missions...</p>");try{const[r1,r2]=await Promise.all([fetch('/api/stories'),fetch('/api/missions')]);const s=await r1.json(),m=await r2.json();state.stories=Array.isArray(s.stories)?s.stories.sort((a,b)=>a.id-b.id):[];state.missions=Array.isArray(m.missions)?m.missions.sort((a,b)=>a.id-b.id):[];state.initialized=true}catch(e){console.error(e);app.innerHTML=card('<h2>BOOT ERROR</h2>')}}

function startDopamineMusic(){try{if(!state.audioCtx)state.audioCtx=new(window.AudioContext||window.webkitAudioContext)();state.oscillator=state.audioCtx.createOscillator();state.gainNode=state.audioCtx.createGain();state.filterNode=state.audioCtx.createBiquadFilter();state.oscillator.type='sine';state.oscillator.frequency.setValueAtTime(288,state.audioCtx.currentTime);state.filterNode.type='lowpass';state.filterNode.frequency.setValueAtTime(600,state.audioCtx.currentTime);state.gainNode.gain.setValueAtTime(.04,state.audioCtx.currentTime);state.oscillator.connect(state.filterNode);state.filterNode.connect(state.gainNode);state.gainNode.connect(state.audioCtx.destination);state.oscillator.start();const notes=[288,324,384,432];let i=0;state.musicInterval=setInterval(()=>{if(state.oscillator){i=(i+1)%notes.length;state.oscillator.frequency.linearRampToValueAtTime(notes[i],state.audioCtx.currentTime+.1)}},800)}catch(e){}}

function stopDopamineMusic(){if(state.musicInterval)clearInterval(state.musicInterval);if(state.oscillator){try{state.oscillator.stop();state.oscillator.disconnect()}catch(e){}state.oscillator=null}}

function startMasterTimer(){clearTimeout(state.masterTimeout);state.masterTimeout=setTimeout(()=>{state.sessionEnded=true;finishSession()},600000)}

function finishSession(){state.sessionEnded=true;window.speechSynthesis.cancel();stopDopamineMusic();clearInterval(state.timer);$("app").innerHTML=`<div class="card center"><h2 style="color:#22c55e">🌟 SESSION COMPLETE 🌟</h2><p>Amazing work ${state.userName.toUpperCase()}!</p><div class="rewardCard"><p>✔ Start your class</p><p>✔ Go play outside</p><p>✔ Talk with your family</p><p>✔ Come back tomorrow stronger</p></div><button onclick="location.reload()">FINISH SESSION</button></div>`;narrate(`Session complete ${state.userName}. Go enjoy the real world now.`,false)}

function narrate(text,isAvatar,cb){if(!text||state.sessionEnded){if(cb)cb();return}state.speechLocked=true;window.speechSynthesis.cancel();document.querySelectorAll('.cube-model-inner').forEach(e=>e.classList.add('talking-avatar'));const s=new SpeechSynthesisUtterance(text);s.lang='en-US';s.rate=1;s.pitch=1.1;s.onend=()=>{state.speechLocked=false;document.querySelectorAll('.cube-model-inner').forEach(e=>e.classList.remove('talking-avatar'));if(cb)cb()};speechSynthesis.speak(s)}

function setupPlayerControls(){if(state.keyboardEnabled)return;state.keyboardEnabled=true;addEventListener('keydown',e=>{if(state.sessionEnded)return;if(e.key==='ArrowLeft'||e.key==='a')state.player.x-=3;if(e.key==='ArrowRight'||e.key==='d')state.player.x+=3;state.player.x=Math.max(0,Math.min(90,state.player.x));updatePlayerPosition();detectGrab()});const g=document.querySelector('.landscape-background');if(g)g.onmousemove=e=>{const r=g.getBoundingClientRect();state.player.x=Math.max(0,Math.min(90,((e.clientX-r.left)/r.width)*100));updatePlayerPosition();detectGrab()}}

function updatePlayerPosition(){const a=$("playerAvatar");if(a)a.style.left=state.player.x+'%'}

function detectGrab(){if(state.player.holding)return;const p=$("playerAvatar"),o=$("gameObject");if(!p||!o)return;const a=p.getBoundingClientRect(),b=o.getBoundingClientRect();const c=a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;if(c){state.player.holding=true;state.player.score++;o.style.transform='scale(1.8)';o.style.opacity='0';playGrabEffect();narrate(`Excellent ${state.userName}! Treasure collected!`,true)}}

function playGrabEffect(){try{const c=new(window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.03;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.15)}catch(e){}}

function jumpToBlock(){if(state.sessionEnded)return;const id=prompt('MISSION ID');if(id!==null&&id!==""){const idx=state.missions.findIndex(m=>m.id===Number(id));if(idx!==-1){speechSynthesis.cancel();stopDopamineMusic();clearInterval(state.timer);state.currentIndex=idx;state.currentBlock=0;state.phase='story';render()}else alert('Mission not found')}}

function goBack(){if(state.sessionEnded)return;speechSynthesis.cancel();stopDopamineMusic();clearInterval(state.timer);state.speechLocked=false;if(state.currentBlock>0)state.currentBlock--;else if(state.currentIndex>0){state.currentIndex--;state.currentBlock=0;state.phase='story'}render()}

function restartSystem(){if(confirm('Restart all progress?')){localStorage.clear();state.userName='Warrior';state.currentIndex=0;state.currentBlock=0;state.player={x:78,y:0,holding:false,score:0};state.phase='story';render()}}

function startCountdown(sec,done){clearInterval(state.timer);state.timeLeft=sec;const d=$("timerDisplay");state.timer=setInterval(()=>{if(state.sessionEnded){clearInterval(state.timer);return}state.timeLeft--;const m=Math.floor(state.timeLeft/60),s=state.timeLeft%60;if(d)d.innerText=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(state.timeLeft<=0){clearInterval(state.timer);if(done)done()}},1000)}

function showIntro(){$('app').innerHTML=`<div class="card center"><h1>KAMIZEN LIFE SYSTEM</h1><p>Training • Awareness • Control</p><button onclick="askNameAndStart()">CONTINUE</button><button onclick="restartSystem()" style="background:#ef4444;margin-top:10px">RESET</button></div>`}

function askNameAndStart(){const n=prompt('Enter your name');state.userName=n&&n.trim()!==''?n.trim():'Warrior';saveProgress();startSystem()}

function startSystem(){startMasterTimer();showPrefaceGuide()}

function showPrefaceGuide(){$('app').innerHTML=`<div class="card"><h2>🗺️ THE 6 KINGDOMS</h2><div class="rewardCard"><p>🛡️ RESPECT FIELD</p><p>🏡 LOVE CASTLE</p><p>📚 FOCUS ZONE</p><p>🏎️ HEALTH ENGINE</p><p>🪙 GOLDEN JOY</p><p>🏰 WEALTH EMPIRE</p></div><button onclick="exitPreface()">START QUEST</button></div>`;narrate('Welcome to the six kingdoms.',false)}

function exitPreface(){state.phase='story';render()}

function render(){if(!state.initialized||state.sessionEnded)return;saveProgress();const app=$("app"),story=state.stories[state.currentIndex],mission=state.missions[state.currentIndex];if(!story||!mission){state.currentIndex=0;state.currentBlock=0;state.phase='story';return render()}const nav=`<div class="navBar"><div></div><div style="display:flex;gap:5px"><button onclick="goBack()">BACK</button><button onclick="jumpToBlock()">JUMP</button><button onclick="restartSystem()">RESET</button></div><div>🎮 GAME ONLINE</div></div>`;if(state.phase==='story'){app.innerHTML=nav+card(`<h2>STORY ${story.id}</h2><h3>${story.t||''}</h3><p>${story.en||''}</p>`)+`<button id="continueBtn" disabled>NARRATING...</button>`;narrate(`${story.t}. ${story.en}`,false,()=>setTimeout(startMission,1500))}else if(state.phase==='mission'){const block=mission.b[state.currentBlock];if(!block){nextStory();return}renderBlock(block,nav)}}

function renderBlock(block,nav){const app=$("app");let html=nav,text="",sim=block.t==='sim';

if(block.t==='v'||block.t==='h'){html+=card(`<h2>${block.tx?.en||''}</h2>`);text=block.tx?.en}
if(block.story){html+=card(`<p>${block.story.en||''}</p>`);text=block.story.en}

if(block.t==='br'||block.t==='breath_auto'){html+=timerUI+card(`<div class="center"><div class="breath-circle" id="breathCircle"><span id="breathLabel">READY</span></div><h3>${block.tx?.en||''}</h3><p>${block.inf?.en||''}</p></div>`);text=`${block.tx?.en}. ${block.inf?.en}`}

if(block.t==='sil'){html+=timerUI+card(`<h3>${block.tx?.en||''}</h3><p>${block.inf?.en||''}</p>`);text=`${block.tx?.en}. ${block.inf?.en}`}

if(block.t==='sim'){
startDopamineMusic();
state.player.holding=false;
const[lbl,icon]=loot[state.currentIndex%6];
const phrase=block.sub?.en||block.tx?.en||'COLLECT';
text=`${state.userName}, avoid the obstacles and collect the treasure.`;
html+=`${timerUI}

<style>
@keyframes itemFloat{0%{transform:translateY(0)}50%{transform:translateY(-8px)}100%{transform:translateY(0)}}
@keyframes moveClouds{from{background-position-x:0}to{background-position-x:1000px}}
@keyframes obstacleMove{from{right:-60px}to{right:120%}}
@keyframes mouthSpeak{0%{transform:scaleY(.3)}100%{transform:scaleY(1.3)}}
.talking-avatar .avatar-mouth{animation:mouthSpeak .15s infinite alternate}
.obstacle{position:absolute;bottom:18px;width:34px;height:34px;background:#dc2626;border:3px solid #000;border-radius:8px;animation:obstacleMove 4s linear infinite;z-index:6}
.jump{animation:jumpAnim .8s ease}
@keyframes jumpAnim{0%{bottom:15px}50%{bottom:95px}100%{bottom:15px}}
</style>

<div class="card sim-gaming-container" style="border:4px solid #facc15;background:#020617;padding:15px;border-radius:20px;text-align:center;position:relative;box-shadow:0 0 25px rgba(250,204,21,.5)">
<div class="landscape-background" style="display:block;height:230px;background:linear-gradient(180deg,#7dd3fc 0%,#e0f2fe 55%,#4ade80 55%,#22c55e 100%);border:3px solid #334155;border-radius:20px;margin:auto;overflow:hidden;position:relative">
<div style="position:absolute;top:10px;left:0;width:100%;height:40px;background:radial-gradient(circle,#fff 20%,transparent 20%) 0 0,radial-gradient(circle,#fff 20%,transparent 20%) 40px 10px;background-size:80px 40px;opacity:.5;animation:moveClouds 25s linear infinite"></div>
<div style="position:absolute;bottom:45%;left:15%;width:0;height:0;border-left:40px solid transparent;border-right:40px solid transparent;border-bottom:35px solid #86efac;opacity:.6"></div>
<div style="position:absolute;bottom:45%;left:60%;width:0;height:0;border-left:55px solid transparent;border-right:55px solid transparent;border-bottom:45px solid #65a30d;opacity:.5"></div>
<div class="obstacle" id="obs1" style="animation-delay:0s"></div>
<div class="obstacle" id="obs2" style="animation-delay:2s"></div>
<div id="gameObject" style="position:absolute;bottom:58px;left:calc(50% - 40px);width:80px;text-align:center;animation:itemFloat 2s infinite ease-in-out;z-index:8"><div style="font-size:42px;filter:drop-shadow(0 4px 8px rgba(0,0,0,.4))">${icon}</div><div style="background:#1e1b4b;color:#facc15;font-size:10px;font-weight:900;padding:3px 5px;border-radius:5px;border:1px solid #facc15">${lbl}</div></div>
${avatar('Michael','#0ea5e9')}
${avatar(state.userName,'#f43f5e','playerAvatar')}
</div>
<div class="rewardCard"><p>${phrase}</p><p>⬅️ ➡️ Move • SPACE Jump</p></div>
</div>`}

if(block.t==='d'){html+=`<div class="card"><h3>${block.q?.en||''}</h3>`;block.op?.forEach((o,i)=>html+=`<div class="answer" onclick="selectAnswer(${i},${block.c},${JSON.stringify(block.ex).replace(/"/g,'&quot;')})">${o}</div>`);html+='</div>';text=block.q?.en}

if(block.t==='c'){html+=card(`<p>${block.tx?.en||''}</p>`);text=block.tx?.en}

if(block.t==='r'){html+=`<div class="card center rewardCard"><h2>⭐ ${block.tx||'REWARD'}</h2><p style="font-size:2rem">+${block.p||0} XP</p></div>`;text='Reward unlocked'}

if(block.t!=='d')html+=`<button id="continueBtn" disabled>NARRATING...</button>`;

app.innerHTML=html;

narrate(text,sim,()=>{
if(block.t==='br'||block.t==='breath_auto'){startCountdown(24,nextBlock);startGuidedBreathing();unlockContinue('SKIP',nextBlock)}
else if(block.t==='sil'){startCountdown(block.d||24,nextBlock);unlockContinue('SKIP',nextBlock)}
else if(block.t==='sim'){startCountdown(block.d||30,nextBlock);setupPlayerControls();unlockContinue('SKIP GAME',nextBlock)}
else if(block.t==='d'){}
else setTimeout(nextBlock,1500)
})}

function startGuidedBreathing(){const c=$("breathCircle"),l=$("breathLabel");if(!c||!l)return;let inhale=true;const step=()=>{if(!$("breathCircle")||state.timeLeft<=0)return;l.innerText=inhale?'INHALE':'EXHALE';c.style.transition='transform 4000ms ease-in-out';c.style.transform=inhale?'scale(1.4)':'scale(.8)';inhale=!inhale};step();const i=setInterval(()=>{if(!$("breathCircle")||state.timeLeft<=0){clearInterval(i);return}step()},4000)}

function selectAnswer(i,c,ex){if(state.speechLocked)return;const ok=i===c,msg=ex?.[i]||'';const w=document.createElement('div');w.innerHTML=`<div class="card" style="border:3px solid ${ok?'#22c55e':'#ef4444'}"><h3>${ok?'EXCELLENT':'KEEP LEARNING'}</h3><p>${msg}</p></div><button id="continueBtn" disabled>NARRATING...</button>`;$('app').appendChild(w);narrate(msg,false,()=>unlockContinue('NEXT STEP',nextBlock))}

function nextBlock(){stopDopamineMusic();clearInterval(state.timer);state.currentBlock++;render()}
function startMission(){state.phase='mission';state.currentBlock=0;render()}
function nextStory(){stopDopamineMusic();state.currentIndex++;if(state.currentIndex>=state.missions.length)state.currentIndex=0;state.phase='story';state.currentBlock=0;render()}
function unlockContinue(label,action){const b=$("continueBtn");if(b){b.disabled=false;b.innerText=label;b.onclick=action}}
