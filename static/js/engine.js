/* =========================================================
   KAMIZEN ENGINE V22 - COMPREHENSIVE KIDS TREASURE SEARCH
   ✔ Persistencia Local Completa (LocalStorage)
   ✔ Registro de Nombre de Usuario para Despedida Personalizada
   ✔ Esquina Izquierda 100% Vacía (Purger de Idiomas / Sin EN/ES)
   ✔ Esquina Derecha: Únicamente "🔊 SPEAKER ONLINE"
   ✔ Ventana Inteligente: Prefacio Organizado en 6 Reinos del Tesoro Sencillos para Niños
   ✔ Lógica de Recolección: Los Avatares Extienden sus Brazos y Toman el Objeto con la Mano
   ✔ Significado Educativo Infantil Dinámico adaptado al Bloque Activo
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
        
        state.oscillator.type = 'sine'; 
        state.oscillator.frequency.setValueAtTime(288, state.audioCtx.currentTime); 
        
        state.filterNode.type = 'lowpass';
        state.filterNode.frequency.setValueAtTime(600, state.audioCtx.currentTime);
        
        state.gainNode.gain.setValueAtTime(0.04, state.audioCtx.currentTime);
        
        state.oscillator.connect(state.filterNode);
        state.filterNode.connect(state.gainNode);
        state.gainNode.connect(state.audioCtx.destination);
        state.oscillator.start();
        
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

/* =========================
   SISTEMA DE NARRACIÓN NORMALIZADO (VOZ FIRME Y FLUIDA)
========================= */
function narrate(text, isAvatarActive, callback) {
    if (!text) { if (callback) callback(); return; }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    
    const elements = document.querySelectorAll(".cube-model-inner");
    elements.forEach(el => el.classList.add("talking-avatar"));

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    
    // Configuración unificada para una voz masculina estándar, natural y con presencia
    speech.rate = 1.0;   // Velocidad completamente normal y fluida sin cortes
    speech.pitch = 1.0;  // Tono natural equilibrado (masculino/neutral)
    
    // Selección directa de voz masculina en inglés según disponibilidad del navegador
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
        const maleVoice = voices.find(v => 
            v.lang.startsWith("en") && 
            (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("microsoft"))
        );
        if (maleVoice) {
            speech.voice = maleVoice;
        }
    }
    
    speech.onend = () => { 
        state.speechLocked = false; 
        elements.forEach(el => el.classList.remove("talking-avatar"));
        if (callback) callback(); 
    };
    
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
    showPrefaceGuide();
}

/* =========================================================
   VENTANA INTELIGENTE: PREFACIO AGRUPADO EN REINOS SENCILLOS
========================================================= */
function showPrefaceGuide() {
    state.phase = "preface";
    const app = document.getElementById("app");
    
    app.innerHTML = `
        <div class="card animated fadeIn" style="border: 4px solid #0ea5e9; padding: 20px; width: 100%; box-sizing: border-box;">
            <h2 style="color:#facc15; font-size: 1.7rem; text-align: center; font-weight: 900; margin-bottom: 10px;">🗺️ THE 6 REINOS OF POWER</h2>
            <p style="font-size: 1rem; color: #cbd5e1; text-align: center; margin-bottom: 20px;">Complete all 63 maps to find real life treasures! Here is your quest:</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; background: rgba(15, 23, 42, 0.8); padding: 15px; border-radius: 12px; max-height: 280px; overflow-y: auto;">
                <div style="border-left: 4px solid #ef4444; padding-left: 8px;">
                    <strong style="color:#ef4444; font-size:1rem;">🛡️ REINO 1: RESPECT FIELD (Missions 1-10)</strong>
                    <span style="font-size: 0.85rem; color:#94a3b8; display:block;">Learn honor, value family rules, and guard your clean mind.</span>
                </div>
                <div style="border-left: 4px solid #f43f5e; padding-left: 8px;">
                    <strong style="color:#f43f5e; font-size:1rem;">🏡 REINO 2: LOVE CASTLE (Missions 11-20)</strong>
                    <span style="font-size: 0.85rem; color:#94a3b8; display:block;">Build happy homes, help team mates, and grow emotional power.</span>
                </div>
                <div style="border-left: 4px solid #38bdf8; padding-left: 8px;">
                    <strong style="color:#38bdf8; font-size:1rem;">📚 REINO 3: BRAIN FOCUS ZONE (Missions 21-30)</strong>
                    <span style="font-size: 0.85rem; color:#94a3b8; display:block;">Read powerful books, double task speed, and master high attention.</span>
                </div>
                <div style="border-left: 4px solid #10b981; padding-left: 8px;">
                    <strong style="color:#10b981; font-size:1rem;">🏎️ REINO 4: HEALTHY ENGINE (Missions 31-40)</strong>
                    <span style="font-size: 0.85rem; color:#94a3b8; display:block;">Energize the body, optimize breathing, and run like a race car.</span>
                </div>
                <div style="border-left: 4px solid #eab308; padding-left: 8px;">
                    <strong style="color:#eab308; font-size:1rem;">🪙 REINO 5: GOLDEN JOY ARENA (Missions 41-50)</strong>
                    <span style="font-size: 0.85rem; color:#94a3b8; display:block;">Multiply high energy feelings, create real wealth, and smile daily.</span>
                </div>
                <div style="border-left: 4px solid #a855f7; padding-left: 8px;">
                    <strong style="color:#a855f7; font-size:1rem;">🏰 REINO 6: TOTAL WEALTH EMPIRE (Missions 51-63)</strong>
                    <span style="font-size: 0.85rem; color:#94a3b8; display:block;">Rule your lifestyle, manage properties, and become a grandmaster.</span>
                </div>
            </div>
            
            <button onclick="exitPreface()" style="margin-top: 20px; width: 100%; background: #22c55e; font-weight: 900; font-size: 1.2rem; padding: 15px;">START QUEST NOW</button>
        </div>
    `;
    
    navigator.id = "preface";
    narrate("Welcome to the six reinos of power. Respect field, love castle, brain focus zone, healthy engine, golden joy arena, and total wealth empire. Complete sixty three levels to win. Let us start your quest now.", false);
}

function exitPreface() {
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
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom:10px; width: 100%;">
            <div></div>
            
            <div style="display:flex; gap:5px;">
                <button onclick="goBack()" style="padding:6px 12px; font-size:11px; background:#334155; border-radius:6px;">BACK</button>
                <button onclick="jumpToBlock()" style="padding:6px 12px; font-size:11px; background:#0ea5e9; border-radius:6px;">JUMP/SKIP</button>
                <button onclick="restartSystem()" style="padding:6px 12px; font-size:11px; background:var(--danger); border-radius:6px;">RESET</button>
            </div>
            
            <div style="font-family:monospace; font-size:11px; color:#22c55e; font-weight:bold; letter-spacing:0.5px;">🔊 SPEAKER ONLINE</div>
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
    } else if (state.phase === "mission") {
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
    // MODO SIMULACIÓN INTERACTIVA: RECOLECCIÓN FÍSICA CON SIGNIFICADO
    // =========================================================
    if (isAvatarMode) {
        startDopamineMusic();
        
        // Configuración de Tesoro con Lógica Educativa Infantil según Bloque Activo
        let powerWord = "FOCUS";
        let visualAsset = "📚 BOOKS";
        let assetSymbol = "📘";
        let kidsLesson = "Books give you superpowers! Reading lets your brain grow smarter and win every single game.";
        
        const blockSelector = state.currentIndex % 6;
        if (blockSelector === 0) { 
            powerWord = "RESPECT"; visualAsset = "🛡️ HONOR SHIELD"; assetSymbol = "🛡️"; 
            kidsLesson = "The Shield of Respect means protecting your family rules and treating people with immense kindness.";
        } else if (blockSelector === 1) { 
            powerWord = "LOVE"; visualAsset = "🏡 FAMILY HOME"; assetSymbol = "🏡"; 
            kidsLesson = "The Castle of Love teaches you that a happy home is built by sharing, helping your parents, and being an awesome son.";
        } else if (blockSelector === 2) { 
            powerWord = "FOCUS"; visualAsset = "📚 SCHOOL BOOKS"; assetSymbol = "📘"; 
            kidsLesson = "Books give you ultimate knowledge. When you study with attention, you unlock the doors to master technology and software.";
        } else if (blockSelector === 3) { 
            powerWord = "WELL-BEING"; visualAsset = "🏎️ SPEED CAR"; assetSymbol = "🏎️"; 
            kidsLesson = "A fast sports car needs clean fuel. Your body needs deep breathing and healthy meals to move with maximum speed.";
        } else if (blockSelector === 4) { 
            powerWord = "JOY"; visualAsset = "🪙 GOLD COINS"; assetSymbol = "🪙"; 
            kidsLesson = "Golden coins are won through daily joy and discipline. When you complete your work happily, you attract abundance.";
        } else { 
            powerWord = "WEALTH"; visualAsset = "🏰 ESTATED REAL ESTATE"; assetSymbol = "🏰"; 
            kidsLesson = "This prosperous estate means stability. Your focus today creates a solid future with massive physical assets.";
        }

        const basePhrase = block.sub?.en || block.tx?.en || "COLLECT THE TARGET OBJECT NOW";
        textToRead = `Michael and ${state.userName.toUpperCase()}! Grab the hidden treasure with your hands! Look at the ${visualAsset}. ${kidsLesson} ${basePhrase}`;

        html += `
        <style>
            @keyframes mouthSpeak {
                0% { transform: scaleY(0.3); }
                100% { transform: scaleY(1.3); }
            }
            .talking-avatar .avatar-mouth {
                animation: mouthSpeak 0.15s infinite alternate ease-in-out;
            }
            
            /* Animación de Brazos Estirándose para AGARRAR el Tesoro Central */
            @keyframes grabAssetLeft {
                0% { left: 5%; transform: translateY(0px); }
                40% { left: 35%; }
                50% { left: 35%; }
                55% { left: 35%; }
                100% { left: 5%; transform: translateY(0px); }
            }
            @keyframes grabAssetRight {
                0% { right: 5%; transform: translateY(0px); }
                40% { right: 35%; }
                50% { right: 35%; }
                55% { right: 35%; }
                100% { right: 5%; transform: translateY(0px); }
            }
            @keyframes swingArmL {
                0% { transform: rotate(-15deg); }
                40% { transform: rotate(70deg) cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                100% { transform: rotate(-15deg); }
            }
            @keyframes swingArmR {
                0% { transform: rotate(15deg); }
                40% { transform: rotate(-70deg) cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                100% { transform: rotate(15deg); }
            }
            @keyframes itemFloat {
                0% { transform: scale(0) translateY(40px); opacity:0; }
                30% { transform: scale(1.3) translateY(-10px); opacity:1; }
                50% { transform: scale(1) translateY(0); opacity:1; }
                52% { transform: scale(0.6) translateY(-20px); opacity:0.5; }
                100% { transform: scale(0) translateY(-40px); opacity:0; }
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
                <div style="position: absolute; top: 12px; left: 15px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace; z-index:10;">🎮 LIVE HUNT</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #10b981; font-family: monospace; font-weight: bold; z-index:10;">🤝 TOUCH & ACQUIRE</div>

                <div class="landscape-background" style="
                    display: block;
                    height: 190px;
                    background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 55%, #4ade80 55%, #22c55e 100%);
                    border: 3px solid #334155;
                    border-radius: 20px;
                    margin: 25px auto 15px auto;
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                    box-sizing: border-box;
                ">
                    <div style="position: absolute; top: 10px; left:0; width:100%; height:40px; background: radial-gradient(circle, #fff 20%, transparent 20%) 0 0, radial-gradient(circle, #fff 20%, transparent 20%) 40px 10px; background-size: 80px 40px; opacity: 0.5; animation: moveClouds 25s linear infinite;"></div>
                    <div style="position: absolute; bottom: 45%; left: 15%; width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 35px solid #86efac; opacity:0.6;"></div>
                    <div style="position: absolute; bottom: 45%; left: 60%; width: 0; height: 0; border-left: 55px solid transparent; border-right: 55px solid transparent; border-bottom: 45px solid #65a30d; opacity:0.5;"></div>

                    <div style="position: absolute; bottom: 45px; left: calc(50% - 40px); width: 80px; text-align: center; animation: itemFloat 6s infinite ease-in-out; z-index:8;">
                        <div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${assetSymbol}</div>
                        <div style="background: #1e1b4b; color: #facc15; font-size: 9px; font-weight: 900; padding: 2px 4px; border-radius: 4px; border: 1px solid #facc15; font-family:monospace; text-transform:uppercase;">
                            ${powerWord}
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 15px; width: 60px; height: 110px; animation: grabAssetLeft 6s infinite ease-in-out;">
                        <div style="font-family: monospace; font-size: 11px; color: #0369a1; font-weight: bold; text-align:center; margin-bottom:2px;">MICHAEL</div>
                        <div class="cube-model-inner" style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:4px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                <div class="avatar-mouth" style="width: 8px; height: 3px; background: #7f1d1d; margin: 4px auto 0 auto; border-radius: 2px;"></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #0ea5e9; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">M</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmL 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div> </div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmR 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div> </div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                        </div>
                    </div>

                    <div style="position: absolute; bottom: 15px; width: 60px; height: 110px; animation: grabAssetRight 6s infinite ease-in-out;">
                        <div style="font-family: monospace; font-size: 11px; color: #9f1239; font-weight: bold; text-align:center; margin-bottom:2px;">${state.userName.toUpperCase()}</div>
                        <div class="cube-model-inner" style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdcbe; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:4px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                <div class="avatar-mouth" style="width: 8px; height: 3px; background: #7f1d1d; margin: 4px auto 0 auto; border-radius: 2px;"></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #f43f5e; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">${state.userName[0].toUpperCase()}</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmL 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div>
                            </div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmR 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div>
                            </div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(15,23,42,0.9); border: 2px solid #0ea5e9; border-radius: 12px; padding: 10px; margin-top: 10px; text-align: left;">
                    <span style="color:#0ea5e9; font-size:11px; font-weight:900; display:block; text-transform:uppercase; font-family:monospace;">💡 KID'S KNOWLEDGE LOGIC:</span>
                    <p style="color:#f8fafc; font-size:0.95rem; margin: 3px 0 0 0; line-height:1.4; font-weight:500;">${kidsLesson}</p>
                </div>
            </div>
        `;
    }

    app.innerHTML = html;
    
    if (block.t === "v" || block.t === "h" || block.story || isAvatarMode) {
        narrate(textToRead, isAvatarMode, () => {
            const btn = document.getElementById("continueBtn");
            if (btn) { btn.disabled = false; btn.innerText = "CONTINUE PROGRESS"; btn.onclick = nextBlock; }
        });
    }
}
