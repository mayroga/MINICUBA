/* =========================================================
   KAMIZEN ENGINE V16 - MULTI-AVATAR CINEMATIC SYSTEM
   ✔ Persistencia Local (LocalStorage)
   ✔ Dual-Avatar Display (MICHAEL + JONATHAN/NOEL Intercalados)
   ✔ Revolución de Voz Extrema (1.55x Ultra-Fast Spark)
   ✔ Efecto de Acercamiento Facial Intercalado (Cam Face Zoom)
   ✔ Texto Enriquecido Segmentado en Pantalla (Anti-Repetición)
   ✔ Música de Dopamina y Enfoque Activa por Bloque
   ========================================================= */

let state = {
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
    companionToggle: true // Controla la alternancia entre JONATHAN y NOEL
};

/* =========================
   SISTEMA DE PERSISTENCIA
========================= */
function saveProgress() {
    localStorage.setItem('kamizen_save', JSON.stringify({
        currentIndex: state.currentIndex,
        currentBlock: state.currentBlock
    }));
}

function loadProgress() {
    const saved = localStorage.getItem('kamizen_save');
    if (saved) {
        const data = JSON.parse(saved);
        state.currentIndex = data.currentIndex || 0;
        state.currentBlock = data.currentBlock || 0;
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
   SISTEMA DE MÚSICA DE DOPAMINA NATIVA
========================= */
function startDopamineMusic() {
    try {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        state.oscillator = state.audioCtx.createOscillator();
        state.gainNode = state.audioCtx.createGain();
        
        state.oscillator.type = 'sawtooth'; // Sonido sintetizado más eléctrico y de videojuego
        state.oscillator.frequency.setValueAtTime(220, state.audioCtx.currentTime); 
        
        state.oscillator.frequency.linearRampToValueAtTime(440, state.audioCtx.currentTime + 0.3);
        state.gainNode.gain.setValueAtTime(0.03, state.audioCtx.currentTime);
        
        state.oscillator.connect(state.gainNode);
        state.gainNode.connect(state.audioCtx.destination);
        state.oscillator.start();
        
        state.musicInterval = setInterval(() => {
            if (state.oscillator) {
                let currentFreq = state.oscillator.frequency.value;
                state.oscillator.frequency.setValueAtTime(currentFreq === 220 ? 330 : 220, state.audioCtx.currentTime);
            }
        }, 150);

    } catch (e) {
        console.log("Audio update deferred.");
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
   CONTROL DE CIERRE Y REPORTE
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
    
    const currentMissionId = state.missions[state.currentIndex]?.id || 0;
    
    if (typeof renderValidationScreen === "function") {
        renderValidationScreen(currentMissionId, {
            timeSpent: "10:00",
            status: "Complete"
        });
    } else {
        const app = document.getElementById("app");
        app.innerHTML = `<div class="card center"><h2>🌟 SESSION COMPLETED</h2><button onclick="location.reload()">FINISH</button></div>`;
    }
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

// =========================================================
// REVOLUCIÓN DE VOZ EXTENDED: ULTRA VELOCIDAD IMPACTANTE
// =========================================================
function narrate(text, isAvatarActive, callback) {
    if (!text) { if (callback) callback(); return; }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    
    if (isAvatarActive) {
        // Voz al máximo ritmo de revolución, estresada y asombrosa para niños
        speech.rate = 1.55; 
        speech.pitch = 1.35; 
    } else {
        speech.rate = 1.05; 
        speech.pitch = 1.0; 
    }
    
    speech.onend = () => { state.speechLocked = false; if (callback) callback(); };
    window.speechSynthesis.speak(speech);
}

function restartSystem() {
    if(confirm("Are you sure?")) {
        localStorage.clear();
        state.currentIndex = 0;
        state.currentBlock = 0;
        state.phase = "story";
        render();
    }
}

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

function showIntro() {
    state.phase = "intro";
    document.getElementById("app").innerHTML = `
        <div class="card center">
            <h1>KAMIZEN LIFE SYSTEM</h1>
            <button onclick="startSystem()">CONTINUE MISSION</button>
        </div>
    `;
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
        </div>
    `;
    if (state.phase === "story") {
        app.innerHTML = navHeader + `
            <div class="card">
                <h2>STORY ${story.id}</h2>
                <p>${story.en || ""}</p>
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
        html += timerUI + `<div class="card center"><div class="breath-circle" id="breathCircle"><span id="breathLabel">READY</span></div><h3>${block.tx?.en || ""}</h3></div>`;
        textToRead = `${block.tx?.en}. Get ready to breathe.`;
    }
    
    // =========================================================
    // DUAL-AVATAR GAMING ZONE (MICHAEL + INTERCALADO)
    // =========================================================
    if (isAvatarMode) {
        startDopamineMusic();
        
        // Alternar el segundo personaje del juego en cada carga de bloque
        state.companionToggle = !state.companionToggle;
        const companionName = state.companionToggle ? "JONATHAN" : "NOEL";
        
        // Texto expandido y encadenado para dar profundidad y evitar bucles repetitivos
        const basePhrase = block.sub?.en || block.tx?.en || "GO FIGHT FOR MAXIMUM ENERGY RIGHT NOW";
        const safetyEnrichment = " ALERT LEVEL RED. FOCUS CONCENTRATION IMMEDIATELY. SPEED UP YOUR MIND AND STAY IN CONTROL.";
        textToRead = `Attention ${companionName} and MICHAEL! ` + basePhrase + safetyEnrichment;

        html += `
        <style>
            @keyframes leftHeroMove {
                0% { transform: scale(0.9) translateX(-10px) rotate(-5deg); }
                50% { transform: scale(1.5) translateY(15px) translateX(5px); z-index: 10; } /* Zoom extremo a la cara */
                100% { transform: scale(0.9) translateX(5px) rotate(5deg); }
            }
            @keyframes rightHeroMove {
                0% { transform: scale(0.9) translateX(5px) rotate(5deg); }
                75% { transform: scale(1.5) translateY(15px) translateX(-5px); z-index: 10; } /* Zoom extremo alternado */
                100% { transform: scale(0.9) translateX(-10px) rotate(-5deg); }
            }
            @keyframes flashGlow {
                0% { box-shadow: 0 0 15px #ef4444; }
                100% { box-shadow: 0 0 30px #0ea5e9; }
            }
        </style>
        ` + timerUI + `
            <div class="card multi-gaming-arena" style="
                border: 4px solid #facc15; 
                background: linear-gradient(180deg, #020617 0%, #0f172a 100%); 
                padding: 15px; 
                border-radius: 24px; 
                text-align: center;
                position: relative;
                animation: flashGlow 0.4s infinite alternate;
            ">
                <div style="position: absolute; top: 12px; left: 15px; background: #22c55e; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace;">🎮 DUAL MODE</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #ef4444; font-family: monospace; font-weight: bold;">⚡ OVERDRIVE 1.55x</div>

                <div class="split-game-viewport" style="
                    display: flex;
                    justify-content: space-around;
                    background: #020617;
                    border: 3px solid #334155;
                    border-radius: 20px;
                    padding: 20px 10px;
                    margin: 25px 0 15px 0;
                    overflow: hidden;
                ">
                    <div style="text-align: center; width: 45%;">
                        <div style="font-family: monospace; font-size: 11px; color: #0ea5e9; margin-bottom: 5px; font-weight:bold;">P1: MICHAEL</div>
                        <div style="width: 100px; height: 110px; margin: 0 auto; background: #1e293b; border-radius: 15px; display: flex; align-items: center; justify-content: center; border: 2px solid #0ea5e9;">
                            <div class="cube-avatar-body" style="width: 45px; height: 85px; position: relative; animation: leftHeroMove 3.5s infinite alternate ease-in-out;">
                                <div style="width: 24px; height: 24px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; margin: 0 auto;">
                                    <div style="display:flex; justify-content:space-around; margin-top:5px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                </div>
                                <div style="width: 40px; height: 35px; background: #0ea5e9; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display:flex; justify-content:center; align-items:center; color:white; font-size:9px; font-weight:bold;">M</div>
                                <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 22px; background: #334155; border: 1.5px solid #000;"></div>
                                <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 22px; background: #334155; border: 1.5px solid #000;"></div>
                            </div>
                        </div>
                    </div>

                    <div style="text-align: center; width: 45%;">
                        <div style="font-family: monospace; font-size: 11px; color: #e11d48; margin-bottom: 5px; font-weight:bold;">P2: ${companionName}</div>
                        <div style="width: 100px; height: 110px; margin: 0 auto; background: #1e293b; border-radius: 15px; display: flex; align-items: center; justify-content: center; border: 2px solid #e11d48;">
                            <div class="cube-avatar-body" style="width: 45px; height: 85px; position: relative; animation: rightHeroMove 3.5s infinite alternate ease-in-out;">
                                <div style="width: 24px; height: 24px; background: #ffdcbe; border-radius: 4px; border: 2px solid #000; margin: 0 auto;">
                                    <div style="display:flex; justify-content:space-around; margin-top:5px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                </div>
                                <div style="width: 40px; height: 35px; background: #e11d48; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display:flex; justify-content:center; align-items:center; color:white; font-size:9px; font-weight:bold;">${companionName[0]}</div>
                                <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 22px; background: #1e1e1e; border: 1.5px solid #000;"></div>
                                <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 22px; background: #1e1e1e; border: 1.5px solid #000;"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="live-subtitle-console" style="
                    background: rgba(0, 0, 0, 0.9);
                    padding: 15px;
                    border-radius: 16px;
                    min-height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #334155;
                ">
                    <p id="shorts-text-target" style="
                        font-size: 1.4rem; 
                        font-weight: 900; 
                        color: #facc15; 
                        text-transform: uppercase; 
                        line-height: 1.2;
                        margin: 0;
                        text-shadow: 2px 2px 0px #000;
                    ">
                        ${textToRead}
                    </p>
                </div>
            </div>
        `;
    }
    
    if (block.t === "d") {
        html += `<div class="card"><h3>${block.q?.en || ""}</h3>`;
        block.op?.forEach((opt, i) => {
            html += `<div class="answer" id="opt-${i}" onclick="selectAnswer(${i}, ${block.c}, ${JSON.stringify(block.ex).replace(/"/g, '&quot;')})">${opt}</div>`;
        });
        html += `</div>`;
        textToRead = `${block.q?.en}. Options: ${block.op.join(". ")}`;
    }
    if (block.t === "r") { html += `<div class="card center"><h2>⭐ REWARD</h2><p>+${block.p || 0} XP</p></div>`; textToRead = `Reward unlocked. You earned ${block.p} points.`; }
    if (block.t === "c") { html += `<div class="card"><p>${block.tx?.en || ""}</p></div>`; textToRead = block.tx?.en; }

    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;

    // Ejecuta la narración aplicando la velocidad hiper-acelerada de 1.55x si es simulación activa
    narrate(textToRead, isAvatarMode, () => {
        if (block.t === "breath_auto" || block.t === "br") {
            startCountdown(24, nextBlock);
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sil") {
            startCountdown(block.d || 24, nextBlock);
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sim") {
            startCountdown(block.d || 30, nextBlock);
            unlockContinue("SKIP VIDEO", nextBlock);
        } else if (block.t === "d") {
            // Espera interactiva
        } else {
            setTimeout(nextBlock, 1500);
        }
    });
}

function selectAnswer(index, correct, explanations) {
    if (state.speechLocked) return;
    const isCorrect = index === correct;
    const explanation = explanations?.[index] || "";
    const feedbackWrap = document.createElement("div");
    feedbackWrap.innerHTML = `<div class="card"><h3>${isCorrect ? "EXCELLENT!" : "KEEP LEARNING"}</h3><p>${explanation}</p></div><button id="continueBtn" disabled>NARRATING...</button>`;
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
