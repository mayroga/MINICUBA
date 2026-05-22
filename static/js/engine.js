/* =========================================================
   KAMIZEN ENGINE V21 - THE TREASURE HUNT EDITION
   ✔ Prefacio Inteligente (Guía de Misión al Inicio de cada Bloque)
   ✔ Sistema de Tesoro Dinámico: Aparece según el contexto del Bloque
   ✔ Objetos visuales flotantes: Valores (Amor, Respeto) y Logros (Autos, Casas, Libros)
   ✔ Avatares con sincronización visual de habla y animación de búsqueda activa
   ✔ Interfaz limpia: Esquina superior izquierda vacía, Speaker en la esquina derecha
   ✔ 100% en Inglés Nativo, sin selectores de traducción EN/ES
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
    companionToggle: true,
    speakerEnabled: true // Control del Speaker oficial
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
    app.innerHTML = `<div class="card"><h2>SYSTEM BOOTING...</h2><p>Preparing Adventure Maps...</p></div>`;
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
        app.innerHTML = `<div class="card"><h2>BOOT ERROR</h2><p>Check Maps Connection</p></div>`;
    }
}

/* =========================
   SISTEMA DE MÚSICA DE DOPAMINA RELAJANTE
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
        state.filterNode.frequency.setValueAtTime(550, state.audioCtx.currentTime);
        
        state.gainNode.gain.setValueAtTime(0.03, state.audioCtx.currentTime);
        
        state.oscillator.connect(state.filterNode);
        state.filterNode.connect(state.gainNode);
        state.gainNode.connect(state.audioCtx.destination);
        state.oscillator.start();
        
        const harmony = [288, 324, 360, 432];
        let idx = 0;
        state.musicInterval = setInterval(() => {
            if (state.oscillator) {
                idx = (idx + 1) % harmony.length;
                state.oscillator.frequency.linearRampToValueAtTime(harmony[idx], state.audioCtx.currentTime + 0.15);
            }
        }, 900);
    } catch (e) {}
}

function stopDopamineMusic() {
    if (state.musicInterval) clearInterval(state.musicInterval);
    if (state.oscillator) {
        try { state.oscillator.stop(); state.oscillator.disconnect(); } catch (e) {}
        state.oscillator = null;
    }
}

/* =========================
   NARRACIÓN Y CONTROL DE VOZ
========================= */
function toggleSpeaker() {
    state.speakerEnabled = !state.speakerEnabled;
    const btn = document.getElementById("speakerToggleBtn");
    if (btn) {
        btn.innerText = state.speakerEnabled ? "🔊 SPEAKER ON" : "🔇 SPEAKER OFF";
        btn.style.background = state.speakerEnabled ? "#22c55e" : "#64748b";
    }
    if (!state.speakerEnabled) {
        window.speechSynthesis.cancel();
    }
}

function narrate(text, isAvatarActive, callback) {
    if (!text || !state.speakerEnabled) { if (callback) callback(); return; }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    
    if (isAvatarActive) {
        speech.rate = 1.55; 
        speech.pitch = 1.35; 
        simulateMouthMovement(true);
    } else {
        speech.rate = 1.25; 
        speech.pitch = 1.1; 
    }
    
    speech.onend = () => { 
        state.speechLocked = false; 
        simulateMouthMovement(false);
        if (callback) callback(); 
    };
    window.speechSynthesis.speak(speech);
}

function simulateMouthMovement(start) {
    const mouths = document.querySelectorAll(".avatar-mouth");
    mouths.forEach(mouth => {
        if (start) {
            mouth.style.animation = "talkingMouth 0.2s infinite alternate";
        } else {
            mouth.style.animation = "none";
            mouth.style.height = "4px";
        }
    });
}

/* =========================
   PANTALLA DE DESPEDIDA FINAL
========================= */
function finishSession() {
    window.speechSynthesis.cancel();
    stopDopamineMusic();
    clearInterval(state.timer);
    
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="card center animated fadeIn" style="border: 4px solid #22c55e; padding: 25px; width:100%; box-sizing:border-box;">
            <h2 style="color:#22c55e; font-size: 2.2rem; font-weight: 900;">🌟 MISSION COMPLETED! 🌟</h2>
            <p style="font-size: 1.3rem; font-weight: bold; margin: 15px 0;">Outstanding work, MICHAEL and Explorer ${state.userName.toUpperCase()}!</p>
            <p>You found all the inner treasures today. Your mind is now sharper, calmer, and more powerful.</p>
            
            <div style="background: rgba(15, 23, 42, 0.6); padding: 15px; border-radius: 12px; margin: 20px 0; text-align: left; border-left: 5px solid #22c55e;">
                <h4 style="margin: 0 0 10px 0; color: #facc15;">🚀 ADVENTURE LOG TASKS:</h4>
                <p style="margin: 5px 0; font-weight: bold;">✔ Ready and focused to start your classes</p>
                <p style="margin: 5px 0;">✔ Rest your eyes and active posture</p>
                <p style="margin: 5px 0;">✔ Go out, play and have fun responsibly</p>
                <p style="margin: 5px 0;">✔ Share your joy with your family</p>
                <p style="margin: 5px 0; font-weight: bold; color: #22c55e;">✔ Come back tomorrow for the next grand hunt!</p>
            </div>
            <button onclick="location.reload()" style="width: 100%; background: #22c55e; padding: 15px; font-weight: 900; font-size: 1.2rem;">FINISH EXPEDITION</button>
        </div>
    `;
    narrate(`Expedition complete! Fantastic job, Michael and ${state.userName}! You discovered all the treasures of focus today. Now go have fun and shine!`, false);
}

/* =========================
   CONSTRUCCIÓN DE LA INTERFAZ LIMPIA (HEADER)
========================= */
function getCleanHeader() {
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; width:100%;">
            <div></div> 
            
            <div>
                <button id="speakerToggleBtn" onclick="toggleSpeaker()" style="background:${state.speakerEnabled ? '#22c55e' : '#64748b'}; color:white; font-size:11px; padding:6px 12px; font-weight:bold; border-radius:8px; border:none; cursor:pointer;">
                    ${state.speakerEnabled ? "🔊 SPEAKER ON" : "🔇 SPEAKER OFF"}
                </button>
            </div>
        </div>
        <div style="display:flex; gap:5px; margin-bottom:15px;">
            <button onclick="goBack()" style="flex:1; padding:8px; font-size:11px; background:#334155; border-radius:6px;">BACK</button>
            <button onclick="jumpToBlock()" style="flex:1; padding:8px; font-size:11px; background:#0ea5e9; border-radius:6px;">JUMP MAP</button>
            <button onclick="restartSystem()" style="flex:1; padding:8px; font-size:11px; background:var(--danger); border-radius:6px;">RESET</button>
        </div>
    `;
}

/* =========================
   PREFACIO / DETECTOR DE CONTENIDO DE BLOQUES
========================= */
function generatePreface(block) {
    let title = "ADVENTURE STEP";
    let desc = "Let's discover what's hidden ahead.";
    let icon = "🗺️";
    
    if (block.t === "br" || block.t === "breath_auto") {
        title = "RE-CHARGE STATION"; desc = "Time to expand your lungs and capture fresh mental energy."; icon = "🫁";
    } else if (block.t === "sil") {
        title = "QUIET OBSERVED POWER"; desc = "Calm your environment. Silence makes your focus expand."; icon = "🤫";
    } else if (block.t === "sim") {
        title = "LIVE CHRONO SEARCH"; desc = "Avatars talk, think, and look for active targets in the wild."; icon = "🔎";
    } else if (block.t === "d") {
        title = "DECISION FORK"; desc = "Choose the path of wisdom to unlock the true chest."; icon = "🧭";
    } else if (block.t === "r") {
        title = "TREASURE UNEARTHED"; desc = "Your discipline transforms directly into physical assets and core values."; icon = "💎";
    }
    
    return `
        <div class="preface-smart-window" style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 2px solid #38bdf8; padding:12px; border-radius:14px; margin-bottom:15px; display:flex; align-items:center; gap:12px; box-shadow:0 4px 10px rgba(0,0,0,0.3);">
            <div style="font-size:2rem;">${icon}</div>
            <div>
                <h4 style="margin:0; color:#38bdf8; font-size:11px; letter-spacing:1px; text-transform:uppercase;">PREFACE // ${title}</h4>
                <p style="margin:2px 0 0 0; font-size:13px; color:#cbd5e1; line-height:1.3;">${desc}</p>
            </div>
        </div>
    `;
}

/* =========================
   DETERMINADOR DE ICONOS DE TESORO POR CONTEXTO
========================= */
function getTreasureArtifacts(block) {
    // Si el bloque habla de dinero, autos o valores, renderizamos elementos específicos flotando
    let txt = (JSON.stringify(block) || "").toLowerCase();
    let artifacts = "";
    
    // Palabras Clave de Valores Fundamentales
    if (txt.includes("love") || txt.includes("amor")) artifacts += `<div class="pop-item">❤️ RESPECT</div><div class="pop-item">💖 LOVE</div>`;
    if (txt.includes("focus") || txt.includes("enfoque") || txt.includes("sil")) artifacts += `<div class="pop-item">🎯 FOCUS</div><div class="pop-item">⚡ JOY</div>`;
    
    // Palabras Clave de Recompensas Materiales/Logros
    if (txt.includes("car") || txt.includes("money") || txt.includes("dinero") || block.t === "r") {
        artifacts += `<div class="pop-item">🚗 SUPER CAR</div><div class="pop-item">🏡 MODERN HOUSE</div><div class="pop-item">💵 WEALTH</div>`;
    }
    if (txt.includes("book") || txt.includes("learn") || block.t === "d") {
        artifacts += `<div class="pop-item">📚 WISDOM BOOK</div><div class="pop-item">💡 BRILLIANT IDEA</div>`;
    }
    
    // Si no coincide, por defecto son valores universales de exploración
    if (!artifacts) {
        artifacts = `<div class="pop-item">⭐ RESPECT</div><div class="pop-item">🧩 FOCUS</div><div class="pop-item">☀️ JOY</div>`;
    }
    return artifacts;
}

/* =========================
   MOTOR DE REDERIZADO ADAPTADO
========================= */
function showIntro() {
    state.phase = "intro";
    document.getElementById("app").innerHTML = `
        <div class="card center">
            <h1 style="color:#facc15; font-size:2.2rem; font-weight:900;">KAMIZEN SYSTEM</h1>
            <p>The Search for Ultimate Focus & Discipline</p>
            <button onclick="askNameAndStart()" style="background:#22c55e; padding:16px; font-size:1.2rem; width:100%;">START ADVENTURE</button>
            <button onclick="restartSystem()" style="background:var(--danger); margin-top:10px; font-size:11px;">RESET SAVE</button>
        </div>
    `;
}

function askNameAndStart() {
    let nameInput = prompt("Enter Explorer Name:");
    state.userName = (nameInput && nameInput.trim() !== "") ? nameInput.trim() : "Explorer";
    saveProgress();
    state.phase = "story";
    setTimeout(() => { startMasterTimer(); render(); }, 300);
}

function render() {
    if (!state.initialized) return;
    saveProgress();
    const app = document.getElementById("app");
    const story = state.stories[state.currentIndex];
    const mission = state.missions[state.currentIndex];

    if (!story || !mission) { state.currentIndex = 0; state.currentBlock = 0; state.phase = "story"; return render(); }

    let htmlHeader = getCleanHeader();

    if (state.phase === "story") {
        app.innerHTML = htmlHeader + `
            <div class="card">
                <h2 style="color:var(--primary)">STORY EXPEDITION ${story.id}</h2>
                <h3>${story.t || ""}</h3>
                <p style="font-size:1.15rem; line-height:1.6; color:#e2e8f0;">${story.en || ""}</p>
            </div>
            <button id="continueBtn" disabled>MAP READING...</button>
        `;
        narrate(`${story.t}. ${story.en}`, false, () => {
            setTimeout(() => { state.phase = "mission"; state.currentBlock = 0; render(); }, 1200);
        });
    } else {
        const block = mission.b[state.currentBlock];
        if (!block) { nextStory(); return; }
        renderBlock(block, htmlHeader);
    }
}

function renderBlock(block, htmlHeader) {
    const app = document.getElementById("app");
    let html = htmlHeader + generatePreface(block); // Inserta ventana inteligente automáticamente
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");

    const timerUI = `
        <div class="card center" style="border: 2px solid #38bdf8; background: #0b0f19; margin-bottom:12px; padding:8px;">
            <h1 id="timerDisplay" style="font-size:2.2rem; margin:0; font-family:monospace; color:#38bdf8;">00:00</h1>
        </div>
    `;
    
    if (block.t === "v" || block.t === "h") { html += `<div class="card"><h2>${block.tx?.en || ""}</h2></div>`; textToRead = block.tx?.en; }
    if (block.story) { html += `<div class="card"><p>${block.story.en || ""}</p></div>`; textToRead = block.story.en; }
    
    if (block.t === "breath_auto" || block.t === "br") {
        html += timerUI + `<div class="card center"><div class="breath-circle" id="breathCircle"><span id="breathLabel">READY</span></div><h3>${block.tx?.en || ""}</h3></div>`;
        textToRead = block.tx?.en || "Prepare to breathe deeply.";
    }
    if (block.t === "sil") {
        html += timerUI + `<div class="card"><h3>${block.tx?.en || ""}</h3><p>${block.inf?.en || ""}</p></div>`;
        textToRead = block.tx?.en;
    }
    
    // =========================================================
    // MODO BÚSQUEDA REAL DE TESOROS CON MOVIMIENTO E ICONOS FLOTANTES
    // =========================================================
    if (isAvatarMode) {
        startDopamineMusic();
        const basePhrase = block.sub?.en || block.tx?.en || "LOOK UP FOR NEW INTEL AND ENERGY NOW";
        textToRead = `Attention MICHAEL and ${state.userName.toUpperCase()}! ${basePhrase}. Stay focused, let's trace the hidden path!`;

        html += `
        <style>
            @keyframes walkAndSearchL {
                0% { left: 5%; transform: translateY(0px); }
                30% { transform: translateY(-8px) scaleY(1.05); }
                50% { left: 42%; transform: translateY(2px) rotate(4deg); } /* Inclinación de búsqueda */
                75% { transform: translateY(-5px); }
                100% { left: 5%; transform: translateY(0px); }
            }
            @keyframes walkAndSearchR {
                0% { right: 5%; transform: translateY(0px); }
                25% { transform: translateY(-6px); }
                50% { right: 45%; transform: translateY(3px) rotate(-4deg); } /* Inclinación de búsqueda */
                80% { transform: translateY(-10px); }
                100% { right: 5%; transform: translateY(0px); }
            }
            @keyframes talkingMouth {
                from { height: 3px; } to { height: 9px; }
            }
            @keyframes floatArtifacts {
                0% { transform: translateY(40px) scale(0.4); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { transform: translateY(-90px) scale(1.1); opacity: 0; }
            }
            @keyframes cloudMove {
                from { background-position-x: 0px; } to { background-position-x: 600px; }
            }
            .pop-item {
                position: absolute; bottom: 35px; left: 45%;
                background: #facc15; color:#000; padding:4px 8px;
                font-size:11px; font-weight:900; border-radius:6px;
                border: 1.5px solid #000; box-shadow: 0 4px 0 #000;
                animation: floatArtifacts 3.5s infinite ease-in-out;
                z-index: 20;
            }
            .pop-item:nth-child(2) { animation-delay: 1.2s; left: 35%; background:#ec4899; color:#fff; }
            .pop-item:nth-child(3) { animation-delay: 2.3s; left: 52%; background:#22c55e; color:#fff; }
        </style>
        ` + timerUI + `
            <div class="card sim-gaming-container" style="border: 4px solid #facc15; background: #020617; padding:15px; border-radius:20px; text-align:center; position:relative; overflow:hidden; width:100%; box-sizing:border-box;">
                
                <div class="landscape-box" style="height:190px; background:linear-gradient(180deg, #bae6fd 0%, #f0f9ff 55%, #4ade80 55%, #15803d 100%); border:3px solid #475569; border-radius:16px; position:relative; overflow:hidden; width:100%; box-sizing:border-box;">
                    
                    <div style="position:absolute; top:8px; left:0; width:100%; height:30px; background: radial-gradient(circle, #fff 15%, transparent 15%) 0 0; background-size:60px 30px; opacity:0.6; animation: cloudMove 20s linear infinite;"></div>
                    
                    <div style="position:absolute; bottom:25px; left:calc(50% - 20px); font-size:2.2rem; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.4)); z-index:10; animation: pulse 1s infinite alternate;">👑</div>
                    
                    ${getTreasureArtifacts(block)}

                    <div style="position:absolute; bottom:15px; width:55px; height:95px; animation: walkAndSearchL 6.5s infinite linear; z-index:15;">
                        <span style="font-family:monospace; font-size:9px; color:#0c4a6e; font-weight:bold; display:block; text-align:center;">MICHAEL</span>
                        <div style="width:36px; height:70px; position:relative; margin:0 auto;">
                            <div style="width:20px; height:20px; background:#ffdbac; border:2px solid #000; border-radius:4px; margin:0 auto; position:relative;">
                                <div class="avatar-mouth" style="position:absolute; bottom:3px; left:6px; width:8px; height:4px; background:#ef4444; border-radius:2px;"></div>
                            </div>
                            <div style="width:34px; height:28px; background:#0ea5e9; border:2px solid #000; border-radius:3px; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold;">M</div>
                            <div style="position:absolute; left:-6px; top:20px; width:6px; height:20px; background:#ffdbac; border:1.5px solid #000; border-radius:2px;"></div>
                            <div style="position:absolute; right:-6px; top:20px; width:6px; height:20px; background:#ffdbac; border:1.5px solid #000; border-radius:2px;"></div>
                            <div style="position:absolute; left:4px; bottom:0; width:8px; height:18px; background:#1e293b; border:1.5px solid #000; border-radius:0 0 3px 3px;"></div>
                            <div style="position:absolute; right:4px; bottom:0; width:8px; height:18px; background:#1e293b; border:1.5px solid #000; border-radius:0 0 3px 3px;"></div>
                        </div>
                    </div>

                    <div style="position:absolute; bottom:15px; width:55px; height:95px; animation: walkAndSearchR 6.5s infinite linear; z-index:15;">
                        <span style="font-family:monospace; font-size:9px; color:#4c0519; font-weight:bold; display:block; text-align:center;">${state.userName.toUpperCase()}</span>
                        <div style="width:36px; height:70px; position:relative; margin:0 auto;">
                            <div style="width:20px; height:20px; background:#ffdcbe; border:2px solid #000; border-radius:4px; margin:0 auto; position:relative;">
                                <div class="avatar-mouth" style="position:absolute; bottom:3px; left:6px; width:8px; height:4px; background:#ef4444; border-radius:2px;"></div>
                            </div>
                            <div style="width:34px; height:28px; background:#f43f5e; border:2px solid #000; border-radius:3px; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold;">${state.userName[0].toUpperCase()}</div>
                            <div style="position:absolute; left:-6px; top:20px; width:6px; height:20px; background:#ffdcbe; border:1.5px solid #000; border-radius:2px;"></div>
                            <div style="position:absolute; right:-6px; top:20px; width:6px; height:20px; background:#ffdcbe; border:1.5px solid #000; border-radius:2px;"></div>
                            <div style="position:absolute; left:4px; bottom:0; width:8px; height:18px; background:#111827; border:1.5px solid #000; border-radius:0 0 3px 3px;"></div>
                            <div style="position:absolute; right:4px; bottom:0; width:8px; height:18px; background:#111827; border:1.5px solid #000; border-radius:0 0 3px 3px;"></div>
                        </div>
                    </div>

                </div>

                <div class="shorts-subtitles-area" style="width:100%; margin-top:10px;">
                    <p id="shorts-text-target" style="font-size:1.3rem; font-weight:900; color:#facc15; text-transform:uppercase; text-shadow:2px 2px 0 #000; margin:0; line-height:1.2;">
                        ${basePhrase}
                    </p>
                </div>
            </div>
        `;
    }
    
    // =========================================================
    // BLOQUE REWARD CON APERTURA DE LOGROS ADQUIRIDOS
    // =========================================================
    if (block.t === "r") {
        html += `
        <div class="card center" style="border: 3px solid #eab308; background: linear-gradient(180deg, #1e1b4b 0%, #020617 100%); padding:20px; width:100%; box-sizing:border-box; position:relative; overflow:hidden;">
            <div style="font-size:3rem; margin-bottom:5px; animation: bounce 0.6s infinite alternate;">🎁</div>
            <h2 style="color:#eab308; font-size:1.6rem; text-transform:uppercase; margin:0;">${block.tx || "TREASURE CLAIMED"}</h2>
            <p style="font-size:2.2rem; font-weight:900; color:#fff; margin:8px 0;">+${block.p || 0} XP</p>
            
            <div style="display:flex; justify-content:center; gap:12px; margin-top:10px; background:rgba(0,0,0,0.5); padding:10px; border-radius:10px; border:1px dashed #eab308;">
                <span style="font-size:12px; font-weight:bold; color:#facc15;">UNLOCKED:</span>
                <span style="font-size:12px; color:#fff;">🏡 House</span>
                <span style="font-size:12px; color:#fff;">🚗 Car</span>
                <span style="font-size:12px; color:#fff;">📚 Wisdom</span>
            </div>
        </div>`;
        textToRead = `Treasure unlocked! Phenomenal job, you earned ${block.p} experience points and brought new assets to your map.`;
    }
    
    if (block.t === "d") {
        html += `<div class="card" style="width:100%; box-sizing:border-box;"><h3>${block.q?.en || ""}</h3>`;
        block.op?.forEach((opt, i) => {
            html += `<div class="answer" id="opt-${i}" onclick="selectAnswer(${i}, ${block.c}, ${JSON.stringify(block.ex).replace(/"/g, '&quot;')})">${opt}</div>`;
        });
        html += `</div>`;
        textToRead = block.q?.en;
    }
    if (block.t === "c") { html += `<div class="card" style="width:100%; box-sizing:border-box;"><p>${block.tx?.en || ""}</p></div>`; textToRead = block.tx?.en; }

    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;

    narrate(textToRead, isAvatarMode, () => {
        if (block.t === "breath_auto" || block.t === "br") {
            startCountdown(24, nextBlock); startGuidedBreathing(); unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sil") {
            startCountdown(block.d || 24, nextBlock); unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sim") {
            startCountdown(block.d || 30, nextBlock); unlockContinue("COLLECT TREASURE", nextBlock);
        } else if (block.t === "d") {
            // Espera interactiva de selección
        } else {
            setTimeout(nextBlock, 1800);
        }
    });
}

/* =========================
   SISTEMAS INTERNOS COMPLEMENTARIOS
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
        circle.style.transform = inhale ? "scale(1.35)" : "scale(0.85)";
        inhale = !inhale;
    };
    step();
    const aniInterval = setInterval(() => {
        if (!document.getElementById("breathCircle") || state.timeLeft <= 0) { clearInterval(aniInterval); return; }
        step();
    }, 4000);
}

function selectAnswer(index, correct, explanations) {
    if (state.speechLocked) return;
    const isCorrect = index === correct;
    const explanation = explanations?.[index] || "";
    const feedbackWrap = document.createElement("div");
    feedbackWrap.style.width = "100%"; feedbackWrap.style.boxSizing = "border-box";
    
    const headerColor = isCorrect ? '#22c55e' : '#ef4444';
    const headerText = isCorrect ? "TREASURE KEY MATCH!" : "PATH BLOCKED - LEARN";
    
    feedbackWrap.innerHTML = `
        <div class="card" style="border: 3px solid ${headerColor}; width:100%; box-sizing:border-box;">
            <h3 style="color:${headerColor}; font-weight:900;">${headerText}</h3>
            <p>${explanation}</p>
        </div>
        <button id="continueBtn" disabled>COMPILING INSIGHT...</button>
    `;
    document.getElementById("app").appendChild(feedbackWrap);
    narrate(explanation, false, () => { unlockContinue("ADVANCE EXPEDITION", nextBlock); });
}

function nextBlock() { stopDopamineMusic(); clearInterval(state.timer); state.currentBlock++; render(); }
function goBack() { window.speechSynthesis.cancel(); stopDopamineMusic(); clearInterval(state.timer); state.speechLocked = false; if (state.currentBlock > 0) state.currentBlock--; else if (state.currentIndex > 0) { state.currentIndex--; state.currentBlock = 0; state.phase = "story"; } render(); }
function jumpToBlock() { const target = prompt("Enter MISSION ID (1-63):"); if (target) { const idx = state.missions.findIndex(m => m.id === Number(target)); if (idx !== -1) { window.speechSynthesis.cancel(); stopDopamineMusic(); clearInterval(state.timer); state.currentIndex = idx; state.currentBlock = 0; state.phase = "story"; render(); } } }
function restartSystem() { if(confirm("Restart expedition from map zero?")) { localStorage.clear(); state.userName = "Explorer"; state.currentIndex = 0; state.currentBlock = 0; state.phase = "story"; render(); } }
function nextStory() { stopDopamineMusic(); state.currentIndex++; if (state.currentIndex >= state.missions.length) state.currentIndex = 0; state.phase = "story"; state.currentBlock = 0; render(); }
function unlockContinue(label, action) { const btn = document.getElementById("continueBtn"); if (btn) { btn.disabled = false; btn.innerText = label; btn.onclick = action; } }
