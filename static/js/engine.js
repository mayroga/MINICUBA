/* =========================================================
   KAMIZEN ENGINE V20 - REAL LANDSCAPE AVATAR SYSTEM
   ✔ Persistencia Local Completa (LocalStorage)
   ✔ Registro de Nombre de Usuario para Despedida Personalizada
   ✔ Dual-Avatar Completo con Brazos, Piernas y Pies Funcionales
   ✔ Animación de Desplazamiento Lateral (Caminar y Ejercicios)
   ✔ Entorno Visual de Paisaje Real Dinámico y Responsivo
   ✔ Música de Dopamina Suave y Segura (Sine Wave + Low Pass Filter)
   ✔ Master Timer Reducido: 10 Minutes Total Focus
   ✔ Soporte completo e intacto: v, h, story, br, sil, d, r, c, sim
   ========================================================= */

let state = {
    userName: "Warrior",
    stories: [],
    missions: [],
    currentIndex: 0,
    currentBlock: 0,
    phase: "loading",
    speechLocked: false,
    initialized: false,
    timer: null,
    timeLeft: 0,
    sessionStartTime: null,
    audioCtx: null,
    oscillator: null,
    gainNode: null,
    filterNode: null,
    musicInterval: null,
    companionToggle: true
};

/* =========================
   SISTEMA DE PERSISTENCIA
========================= */
function saveProgress() {
    localStorage.setItem('kamizen_save', JSON.stringify({
        currentIndex: state.currentIndex,
        currentBlock: state.currentBlock,
        userName: state.userName
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('kamizen_save');
    if (saved) {
        const data = JSON.parse(saved);
        state.currentIndex = data.currentIndex || 0;
        state.currentBlock = data.currentBlock || 0;
        state.userName = data.userName || "Warrior";
    }
}

/* =========================
   INICIALIZACIÓN DEL SISTEMA
========================= */
window.addEventListener("load", async () => {
    loadProgress();
    await loadAllData();
    showIntro();
});

async function loadAllData() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="card"><h2>SYSTEM BOOTING...</h2><p>Loading Data (Missions 1-63)...</p></div>`;
    try {
        const [storiesReq, missionsReq] = await Promise.all([
            fetch("/api/stories"),
            fetch("/api/missions")
        ]);
        const storiesData = await storiesReq.json();
        const missionsData = await missionsReq.json();

        state.stories = Array.isArray(storiesData.stories) ? storiesData.stories.sort((a, b) => a.id - b.id) : [];
        state.missions = Array.isArray(missionsData.missions) ? missionsData.missions.sort((a, b) => a.id - b.id) : [];
        
        state.initialized = true;
    } catch (err) {
        console.error(err);
        app.innerHTML = `<div class="card"><h2>BOOT ERROR</h2><p>Check API Connection</p></div>`;
    }
}

/* =========================
   SISTEMA DE MÚSICA DE DOPAMINA AGRADABLE Y SEGURA
========================= */
function startDopamineMusic() {
    try {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        state.oscillator = state.audioCtx.createOscillator();
        state.gainNode = state.audioCtx.createGain();
        state.filterNode = state.audioCtx.createBiquadFilter();
        
        // Onda sinusoidal pura y suave para proteger el oído
        state.oscillator.type = 'sine'; 
        state.oscillator.frequency.setValueAtTime(288, state.audioCtx.currentTime); // Frecuencia de enfoque ideal
        
        // Filtro de paso bajo para suavizar los picos de sonido
        state.filterNode.type = 'lowpass';
        state.filterNode.frequency.setValueAtTime(600, state.audioCtx.currentTime);
        
        // Volumen sumamente sutil y ambiental
        state.gainNode.gain.setValueAtTime(0.04, state.audioCtx.currentTime);
        
        state.oscillator.connect(state.filterNode);
        state.filterNode.connect(state.gainNode);
        state.gainNode.connect(state.audioCtx.destination);
        state.oscillator.start();
        
        // Melodía armónica relajante secuencial
        const notes = [288, 324, 384, 432];
        let noteIdx = 0;
        state.musicInterval = setInterval(() => {
            if (state.oscillator) {
                noteIdx = (noteIdx + 1) % notes.length;
                state.oscillator.frequency.linearRampToValueAtTime(notes[noteIdx], state.audioCtx.currentTime + 0.1);
            }
        }, 800);

    } catch (e) {
        console.log("Audio deferred.");
    }
}

function stopDopamineMusic() {
    if (state.musicInterval) clearInterval(state.musicInterval);
    if (state.oscillator) {
        try {
            state.oscillator.stop();
            state.oscillator.disconnect();
        } catch (e) {}
        state.oscillator = null;
    }
}

/* =========================
   CONTROL DE CIERRE Y REPORTE (10 MIN)
========================= */
function startMasterTimer() {
    state.sessionStartTime = Date.now();
    setTimeout(() => {
        finishSession();
    }, 10 * 60 * 1000); 
}

function finishSession() {
    window.speechSynthesis.cancel();
    stopDopamineMusic();
    clearInterval(state.timer);
    
    const app = document.getElementById("app");
    
    app.innerHTML = `
        <div class="card center animated fadeIn" style="border: 4px solid #22c55e; padding: 25px; width: 100%; box-sizing: border-box;">
            <h2 style="color:#22c55e; font-size: 2rem; font-weight: 900;">🌟 SESSION COMPLETE! 🌟</h2>
            <p style="font-size: 1.2rem; font-weight: bold; margin: 15px 0;">Awesome work, MICHAEL and ${state.userName.toUpperCase()}! You did incredible today!</p>
            <p>Your brain and body only need a few focused minutes to grow stronger every day.</p>
            <p>KAMIZEN is designed to help you train calmly, not endlessly.</p>
            
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; margin: 20px 0; text-align: left; border-left: 5px solid #22c55e;">
                <h4 style="margin: 0 0 10px 0; color: #facc15; text-transform: uppercase;">🚀 Your Next Tasks:</h4>
                <p style="margin: 5px 0; font-weight: bold;">✔ Now you are ready to start your class</p>
                <p style="margin: 5px 0;">✔ Rest your mind and body</p>
                <p style="margin: 5px 0;">✔ Go play and have fun</p>
                <p style="margin: 5px 0;">✔ Talk and share with your family</p>
                <p style="margin: 5px 0;">✔ Explore the real world outside</p>
                <p style="margin: 5px 0; font-weight: bold; color: #22c55e;">✔ Come back tomorrow even stronger!</p>
            </div>
            
            <p style="font-style: italic; color: #94a3b8;">Small daily training creates powerful minds. See you next session, warriors! 🛡️</p>
            <button onclick="location.reload()" style="margin-top:25px; width: 100%; background: #22c55e; padding: 15px; font-weight: 900; font-size: 1.2rem;">FINISH SESSION</button>
        </div>
    `;

    const vocalGoodbye = `Session complete! Awesome work, Michael and ${state.userName}! You did incredible today! Now you are ready to start your class. Rest your mind, go play, talk with your family, and explore the real world. Come back tomorrow even stronger, warriors!`;
    narrate(vocalGoodbye, false);
}

/* =========================
   CONTROLES DE NAVEGACIÓN
========================= */
function jumpToBlock() {
    const targetMissionId = prompt("Enter the MISSION ID to jump to (1-63):");
    if (targetMissionId !== null && targetMissionId !== "") {
        const idNum = Number(targetMissionId);
        const idx = state.missions.findIndex(m => m.id === idNum);
        if (idx !== -1) {
            window.speechSynthesis.cancel();
            stopDopamineMusic();
            clearInterval(state.timer);
            state.currentIndex = idx;  
            state.currentBlock = 0;    
            state.phase = "story";      
            render();
        } else {
            alert("Mission ID " + idNum + " not found.");
        }
    }
}

function goBack() {
    window.speechSynthesis.cancel();
    stopDopamineMusic();
    clearInterval(state.timer);
    state.speechLocked = false;
    if (state.currentBlock > 0) {
        state.currentBlock--;
    } else if (state.currentIndex > 0) {
        state.currentIndex--;
        state.currentBlock = 0;
        state.phase = "story";
    }
    render();
}

function narrate(text, isAvatarActive, callback) {
    if (!text) { if (callback) callback(); return; }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    
    if (isAvatarActive) {
        speech.rate = 1.55; 
        speech.pitch = 1.35; 
    } else {
        speech.rate = 1.25; 
        speech.pitch = 1.1; 
    }
    
    speech.onend = () => { state.speechLocked = false; if (callback) callback(); };
    window.speechSynthesis.speak(speech);
}

function restartSystem() {
    if(confirm("Are you sure you want to RESTART from zero?")) {
        localStorage.clear();
        state.userName = "Warrior";
        state.currentIndex = 0;
        state.currentBlock = 0;
        state.phase = "story";
        render();
    }
}

/* =========================
   LÓGICA DEL RELOJ (TIMER)
========================= */
function startCountdown(seconds, onComplete) {
    clearInterval(state.timer);
    state.timeLeft = seconds;
    const timerDisplay = document.getElementById("timerDisplay");

    state.timer = setInterval(() => {
        state.timeLeft--;
        const m = Math.floor(state.timeLeft / 60);
        const s = state.timeLeft % 60;
        if (timerDisplay) timerDisplay.innerText = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            if (onComplete) onComplete();
        }
    }, 1000);
}

/* =========================
   MOTOR DE RENDERIZADO
========================= */
function showIntro() {
    state.phase = "intro";
    document.getElementById("app").innerHTML = `
        <div class="card center">
            <h1>KAMIZEN LIFE SYSTEM</h1>
            <p>Training • Awareness • Control</p>
            <p class="small">Range: Missions 1 - 63 Loaded</p>
            <button onclick="askNameAndStart()">CONTINUE MISSION</button>
            <button onclick="restartSystem()" style="background:var(--danger);margin-top:10px;">RESET PROGRESS</button>
        </div>
    `;
}

function askNameAndStart() {
    let nameInput = prompt("Please enter your name to begin training:");
    if (nameInput && nameInput.trim() !== "") {
        state.userName = nameInput.trim();
    } else {
        state.userName = "Warrior";
    }
    saveProgress();
    startSystem();
}

function startSystem() {
    startMasterTimer();
    state.phase = "story";
    render();
}

function render() {
    if (!state.initialized) return;
    saveProgress();
    const app = document.getElementById("app");
    const story = state.stories[state.currentIndex];
    const mission = state.missions[state.currentIndex];

    if (!story || !mission) {
        state.currentIndex = 0; state.currentBlock = 0; state.phase = "story";
        return render();
    }

    let navHeader = `
        <div style="display:flex;gap:5px;margin-bottom:10px;">
            <button onclick="goBack()" style="flex:1;padding:8px;font-size:12px;background:#334155;">BACK</button>
            <button onclick="jumpToBlock()" style="flex:1;padding:8px;font-size:12px;background:#0ea5e9;">JUMP/SKIP</button>
            <button onclick="restartSystem()" style="flex:1;padding:8px;font-size:12px;background:var(--danger);">RESET</button>
        </div>
    `;
    if (state.phase === "story") {
        app.innerHTML = navHeader + `
            <div class="card">
                <h2 style="color:var(--primary)">STORY ${story.id}</h2>
                <h3>${story.t || ""}</h3>
                <p style="font-size:1.1rem; line-height:1.6;">${story.en || ""}</p>
            </div>
            <button id="continueBtn" disabled>NARRATING...</button>
        `;
        narrate(`${story.t}. ${story.en}`, false, () => {
            setTimeout(startMission, 1500);
        });
    } else {
        const block = mission.b[state.currentBlock];
        if (!block) { nextStory(); return; }
        renderBlock(block, navHeader);
    }
}

function renderBlock(block, navHeader) {
    const app = document.getElementById("app");
    let html = navHeader;
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");

    const timerUI = `
        <div class="card center" style="border: 3px solid var(--primary); background: #0f172a; margin-bottom: 10px; padding: 10px;">
            <h1 id="timerDisplay" style="font-size:2.5rem;margin:0; font-family: monospace;">00:00</h1>
        </div>
    `;
    
    if (block.t === "v" || block.t === "h") { html += `<div class="card"><h2>${block.tx?.en || ""}</h2></div>`; textToRead = block.tx?.en; }
    if (block.story) { html += `<div class="card"><p>${block.story.en || ""}</p></div>`; textToRead = block.story.en; }
    
    if (block.t === "breath_auto" || block.t === "br") {
        html += timerUI + `<div class="card center"><div class="breath-circle" id="breathCircle"><span id="breathLabel">READY</span></div><h3>${block.tx?.en || ""}</h3><p>${block.inf?.en || ""}</p></div>`;
        textToRead = `${block.tx?.en}. ${block.inf?.en}. Get ready to breathe.`;
    }
    if (block.t === "sil") {
        html += timerUI + `<div class="card"><h3>${block.tx?.en || ""}</h3><p>${block.inf?.en || ""}</p></div>`;
        textToRead = `${block.tx?.en}. ${block.inf?.en}. Practice silence now.`;
    }
    
    // =========================================================
    // MODO SIMULACIÓN INTERACTIVA CON PAISAJE Y AVATARES COMPLETOS
    // =========================================================
    if (isAvatarMode) {
        startDopamineMusic();
        
        const basePhrase = block.sub?.en || block.tx?.en || "GO FIGHT FOR MAXIMUM ENERGY RIGHT NOW";
        const safetyEnrichment = " SPEED UP YOUR MIND AND STAY IN TOTAL CONTROL.";
        textToRead = `Attention ${state.userName.toUpperCase()} and MICHAEL! ` + basePhrase + safetyEnrichment;

        html += `
        <style>
            /* Animación de Caminar + Ejercicio Físico Lateral Completo */
            @keyframes walkAndExerciseLeft {
                0% { left: 5%; transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-8px) rotate(3deg); }
                50% { left: 40%; transform: translateY(0px) rotate(-3deg); }
                75% { transform: translateY(-12px) rotate(4deg); }
                100% { left: 5%; transform: translateY(0px) rotate(0deg); }
            }
            @keyframes walkAndExerciseRight {
                0% { right: 5%; transform: translateY(0px) rotate(0deg); }
                30% { transform: translateY(-10px) rotate(-4deg); }
                50% { right: 42%; transform: translateY(0px) rotate(3deg); }
                70% { transform: translateY(-6px) rotate(-2deg); }
                100% { right: 5%; transform: translateY(0px) rotate(0deg); }
            }
            @keyframes swingLimb {
                0% { transform: rotate(-25deg); }
                100% { transform: rotate(25deg); }
            }
            @keyframes moveClouds {
                from { background-position-x: 0px; }
                to { background-position-x: 1000px; }
            }
        </style>
        ` + timerUI + `
            <div class="card sim-gaming-container" style="
                border: 4px solid #facc15; 
                background: #020617; 
                padding: 15px; 
                border-radius: 20px; 
                text-align: center;
                position: relative;
                box-shadow: 0 0 25px rgba(250, 204, 21, 0.5);
                width: 100%;
                box-sizing: border-box;
            ">
                <div style="position: absolute; top: 12px; left: 15px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace; z-index:10;">🎮 LIVE ARENA</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #facc15; font-family: monospace; font-weight: bold; z-index:10;">⚡ OVERDRIVE 1.55x</div>

                <div class="landscape-background" style="
                    display: block;
                    height: 180px;
                    background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 60%, #4ade80 60%, #22c55e 100%);
                    border: 3px solid #334155;
                    border-radius: 20px;
                    margin: 25px auto 15px auto;
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                    box-sizing: border-box;
                ">
                    <div style="position: absolute; top: 10px; left:0; width:100%; height:40px; background: radial-gradient(circle, #fff 20%, transparent 20%) 0 0, radial-gradient(circle, #fff 20%, transparent 20%) 40px 10px; background-size: 80px 40px; opacity: 0.5; animation: moveClouds 25s linear infinite;"></div>
                    
                    <div style="position: absolute; bottom: 40%; left: 20%; width: 0; height: 0; border-left: 45px solid transparent; border-right: 45px solid transparent; border-bottom: 40px solid #86efac; opacity:0.7;"></div>
                    <div style="position: absolute; bottom: 40%; left: 50%; width: 0; height: 0; border-left: 60px solid transparent; border-right: 60px solid transparent; border-bottom: 50px solid #65a30d; opacity:0.5;"></div>

                    <div style="position: absolute; bottom: 15px; width: 60px; height: 110px; animation: walkAndExerciseLeft 6s infinite linear;">
                        <div style="font-family: monospace; font-size: 11px; color: #0369a1; font-weight: bold; text-align:center; margin-bottom:2px;">MICHAEL</div>
                        <div style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:5px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #0ea5e9; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">M</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate ease-in-out;"></div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate-reverse ease-in-out;"></div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate-reverse ease-in-out;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate ease-in-out;"></div>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 15px; width: 60px; height: 110px; animation: walkAndExerciseRight 6s infinite linear;">
                        <div style="font-family: monospace; font-size: 11px; color: #9f1239; font-weight: bold; text-align:center; margin-bottom:2px;">${state.userName.toUpperCase()}</div>
                        <div style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdcbe; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:5px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #f43f5e; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">${state.userName[0].toUpperCase()}</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate-reverse ease-in-out;"></div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate ease-in-out;"></div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate ease-in-out;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px; transform-origin: top center; animation: swingLimb 0.4s infinite alternate-reverse ease-in-out;"></div>
                        </div>
                    </div>
                </div>

                <div class="youtube-shorts-subtitles" style="width: 100%; box-sizing: border-box;">
                    <p id="shorts-text-target" style="
                        font-size: 1.35rem; 
                        font-weight: 900; 
                        color: #facc15; 
                        text-transform: uppercase; 
                        letter-spacing: 0.5px;
                        line-height: 1.3;
                        margin: 0;
                        text-shadow: 2px 2px 0px #000;
                    ">
                        ${textToRead}
                    </p>
                </div>
            </div>
        `;
    }
    
    // =========================================================
    // BLOQUE REWARD CON DISEÑO DE AVATARES CELEBRANDO
    // =========================================================
    if (block.t === "r") { 
        html += `
        <style>
            @keyframes rewardJump {
                0% { transform: translateY(0) scale(1); }
                100% { transform: translateY(-12px) scale(1.05); }
            }
        </style>
        <div class="card center" style="border: 3px solid #eab308; background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); padding: 20px; width: 100%; box-sizing: border-box;">
            <h2 style="color:#eab308; font-size: 1.8rem; text-transform: uppercase; margin-bottom: 5px;">⭐ ${block.tx || "REWARD UNLOCKED"}</h2>
            <p style="font-size:2rem; font-weight:900; color:#fff; margin: 5px 0;">+${block.p || 0} XP</p>
            
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 12px; border: 1px dashed #eab308;">
                <div style="animation: rewardJump 0.3s infinite alternate ease-in-out; text-align:center;">
                    <div style="width: 14px; height: 14px; background: #ffdbac; border: 1px solid #000; border-radius: 2px; margin: 0 auto;"></div>
                    <div style="width: 22px; height: 18px; background: #0ea5e9; border: 1px solid #000; border-radius: 2px; color: white; font-size: 7px; font-weight: bold; display:flex; align-items:center; justify-content:center;">M</div>
                    <span style="font-size: 9px; color: #0ea5e9; font-family: monospace; font-weight: bold;">MICHAEL</span>
                </div>
                <div style="animation: rewardJump 0.3s infinite alternate-reverse ease-in-out; text-align:center;">
                    <div style="width: 14px; height: 14px; background: #ffdcbe; border: 1px solid #000; border-radius: 2px; margin: 0 auto;"></div>
                    <div style="width: 22px; height: 18px; background: #f43f5e; border: 1px solid #000; border-radius: 2px; color: white; font-size: 7px; font-weight: bold; display:flex; align-items:center; justify-content:center;">${state.userName[0].toUpperCase()}</div>
                    <span style="font-size: 9px; color: #f43f5e; font-family: monospace; font-weight: bold;">${state.userName.toUpperCase()}</span>
                </div>
            </div>
        </div>`; 
        textToRead = `${block.tx || "Reward unlocked"}. Excellent work Michael and ${state.userName}, you earned ${block.p} experience points.`; 
    }
    
    if (block.t === "d") {
        html += `<div class="card" style="width:100%; box-sizing:border-box;"><h3>${block.q?.en || ""}</h3>`;
        block.op?.forEach((opt, i) => {
            html += `<div class="answer" id="opt-${i}" onclick="selectAnswer(${i}, ${block.c}, ${JSON.stringify(block.ex).replace(/"/g, '&quot;')})">${opt}</div>`;
        });
        html += `</div>`;
        textToRead = `${block.q?.en}. Your options are: ${block.op.join(". ")}`;
    }
    if (block.t === "c") { html += `<div class="card" style="width:100%; box-sizing:border-box;"><p>${block.tx?.en || ""}</p></div>`; textToRead = block.tx?.en; }

    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;

    narrate(textToRead, isAvatarMode, () => {
        if (block.t === "breath_auto" || block.t === "br") {
            startCountdown(24, nextBlock);
            startGuidedBreathing();
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sil") {
            startCountdown(block.d || 24, nextBlock);
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sim") {
            startCountdown(block.d || 30, nextBlock);
            unlockContinue("SKIP SHORTS", nextBlock);
        } else if (block.t === "d") {
            // Espera pasiva de selección interactiva
        } else {
            setTimeout(nextBlock, 1500);
        }
    });
}

/* =========================
   GUÍA VISUAL DE RESPIRACIÓN
========================= */
function startGuidedBreathing() {
    const circle = document.getElementById("breathCircle");
    const label = document.getElementById("breathLabel");
    if (!circle || !label) return;
    let inhale = true;
    const step = () => {
        if (!document.getElementById("breathCircle") || state.timeLeft <= 0) return;
        label.innerText = inhale ? "INHALE" : "EXHALE";
        circle.style.transition = "transform 4000ms ease-in-out";
        circle.style.transform = inhale ? "scale(1.4)" : "scale(0.8)";
        inhale = !inhale;
    };
    step();
    const aniInterval = setInterval(() => {
        if (!document.getElementById("breathCircle") || state.timeLeft <= 0) { clearInterval(aniInterval); return; }
        step();
    }, 4000);
}

/* =========================
   SISTEMA DE CORRECCIÓN COLOREADO CON FEEDBACK REFORZADO
========================= */
function selectAnswer(index, correct, explanations) {
    if (state.speechLocked) return;
    const isCorrect = index === correct;
    const explanation = explanations?.[index] || "";
    const feedbackWrap = document.createElement("div");
    feedbackWrap.style.width = "100%";
    feedbackWrap.style.boxSizing = "border-box";
    
    const headerColor = isCorrect ? '#22c55e' : '#ef4444';
    const headerText = isCorrect ? "EXCELLENT!" : "KEEP LEARNING";
    
    feedbackWrap.innerHTML = `
        <div class="card" style="border: 3px solid ${headerColor}; width: 100%; box-sizing: border-box;">
            <h3 style="color:${headerColor}; font-weight: 900; text-transform: uppercase;">${headerText}</h3>
            <p>${explanation}</p>
        </div>
        <button id="continueBtn" disabled>NARRATING...</button>
    `;
    
    document.getElementById("app").appendChild(feedbackWrap);
    narrate(explanation, false, () => {
        unlockContinue("NEXT STEP", nextBlock);
    });
}

function nextBlock() { 
    stopDopamineMusic();
    clearInterval(state.timer); 
    state.currentBlock++; 
    render(); 
}

function startMission() { state.phase = "mission"; state.currentBlock = 0; render(); }

function nextStory() {
    stopDopamineMusic();
    state.currentIndex++;
    if (state.currentIndex >= state.missions.length) state.currentIndex = 0;
    state.phase = "story";
    state.currentBlock = 0;
    render();
}

function unlockContinue(label, action) {
    const btn = document.getElementById("continueBtn");
    if (btn) { btn.disabled = false; btn.innerText = label; btn.onclick = action; }
}
