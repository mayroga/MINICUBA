/* =========================================================
   KAMIZEN ENGINE V14 - FULL VERSION WITH GAMING ROBLOX SIM
   ✔ Persistencia Local (LocalStorage)
   ✔ Narración Rápida Estilo YouTube Shorts (1.25x Speed + Pitch)
   ✔ Avatar Animado Estilo Roblox (CSS Blocky Bounce)
   ✔ Guía Vocal de Respiración (Visual)
   ✔ Botón JUMP/SKIP para navegación directa
   ✔ Soporte completo: v, h, story, br, sil, d, r, c, sim
   ✔ Master Timer Reducido: 10 Minutes Total Focus
   ✔ Auto-Flow: Bloques de simulación de 30 segundos, historias y textos
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
    sessionStartTime: null
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
   CONTROL DE CIERRE Y REPORTE (10 MIN)
========================= */
function startMasterTimer() {
    state.sessionStartTime = Date.now();
    setTimeout(() => {
        finishSession();
    }, 10 * 60 * 1000); // Reducido a 10 minutos exactos de alto rendimiento
}

function finishSession() {
    window.speechSynthesis.cancel();
    clearInterval(state.timer);
    
    const currentMissionId = state.missions[state.currentIndex]?.id || 0;
    
    if (typeof renderValidationScreen === "function") {
        renderValidationScreen(currentMissionId, {
            timeSpent: "10:00",
            status: "Complete"
        });
    } else {
        const app = document.getElementById("app");
        const notes = [
            `<h2>🌟 GREAT JOB TODAY</h2>`,
            `<p>You completed your KAMIZEN session.</p>`,
            `<p>Your brain and body only need a few focused minutes to grow stronger.</p>`,
            `<p>KAMIZEN is designed to help you train calmly, not endlessly.</p>`,
            `<p>Now it is time to:</p>`,
            `<ul style="text-align:left; display:inline-block;">`,
            `    <li>✔ Now you are ready to start your class</li>`,
            `    <li>✔ Rest your mind</li>`,
            `    <li>✔ Go play</li>`,
            `    <li>✔ Talk with your family</li>`,
            `    <li>✔ Explore the real world</li>`,
            `    <li>✔ Come back tomorrow stronger</li>`,
            `</ul>`,
            `<p>Small daily training creates powerful minds. See you next session, warrior. 🛡️</p>`
        ];
        app.innerHTML = `<div class="card center animated fadeIn">${notes[0]}<button onclick="location.reload()" style="margin-top:20px;">FINISH SESSION</button></div>`;
        narrate(app.innerText.replace(/✔/g, ""));
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
// LÓGICA DE NARRACIÓN (YOUTUBE SHORTS LENGUAJE RÁPIDO)
// =========================================================
function narrate(text, callback) {
    if (!text) { if (callback) callback(); return; }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    
    // Configuración optimizada de velocidad ultra-dinámica
    speech.rate = 1.25; 
    speech.pitch = 1.1; 
    
    speech.onend = () => { state.speechLocked = false; if (callback) callback(); };
    window.speechSynthesis.speak(speech);
}

function restartSystem() {
    if(confirm("Are you sure you want to RESTART from zero?")) {
        localStorage.clear();
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
            <button onclick="startSystem()">CONTINUE MISSION</button>
            <button onclick="restartSystem()" style="background:var(--danger);margin-top:10px;">RESET PROGRESS</button>
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
        narrate(`${story.t}. ${story.en}`, () => {
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
    // NUEVA INTEGRACIÓN: MODO SHORTS GAMING CON AVATAR ROBLOX
    // =========================================================
    if (block.t === "sim") {
        html += timerUI + `
            <div class="card sim-gaming-container" style="
                border: 3px solid #0ea5e9; 
                background: linear-gradient(180deg, #0f172a 0%, #020617 100%); 
                padding: 15px; 
                border-radius: 20px; 
                text-align: center;
                position: relative;
                box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
            ">
                <div style="position: absolute; top: 12px; left: 15px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace; letter-spacing: 1px; animation: pulse 1s infinite alternate;">🔴 LIVE SHORTS</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #0ea5e9; font-family: monospace; font-weight: bold;">⚡ SPEED: 1.25x</div>

                <div class="avatar-roblox-box" style="
                    width: 130px;
                    height: 130px;
                    margin: 25px auto 15px auto;
                    background: radial-gradient(circle, #1e293b 0%, #0f172a 100%);
                    border: 4px solid #0ea5e9;
                    border-radius: 25px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                ">
                    <div class="roblox-character" style="width: 60px; height: 90px; position: relative; display: flex; flex-direction: column; align-items: center; animation: bounce 0.4s infinite alternate;">
                        <div style="width: 26px; height: 26px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; position: relative; z-index: 3;">
                            <div style="position: absolute; top: 6px; left: 4px; width: 4px; height: 6px; background: #000; border-radius: 1px;"></div>
                            <div style="position: absolute; top: 6px; right: 4px; width: 4px; height: 6px; background: #000; border-radius: 1px;"></div>
                            <div style="position: absolute; bottom: 4px; left: 7px; width: 8px; height: 3px; background: #000; border-radius: 2px;"></div>
                        </div>
                        <div style="position: absolute; top: -4px; width: 32px; height: 8px; background: #3b82f6; border-radius: 3px; z-index: 4; border: 1px solid #000;"></div>
                        <div style="width: 44px; height: 38px; background: #3b82f6; border: 2px solid #000; border-radius: 2px; margin-top: -2px; position: relative; z-index: 2; display: flex; justify-content: center; align-items: center;">
                            <div style="font-size: 10px; font-weight: bold; color: white; font-family: sans-serif;">⚡</div>
                        </div>
                        <div style="position: absolute; left: -10px; top: 24px; width: 10px; height: 34px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArm 0.3s infinite alternate;"></div>
                        <div style="position: absolute; right: -10px; top: 24px; width: 10px; height: 34px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; transform: scaleY(-1); animation: swingArm 0.3s infinite alternate-reverse;"></div>
                    </div>
                </div>

                <div style="font-family: monospace; font-size: 14px; color: #64748b; margin-bottom: 15px;">
                    <span style="background: #1e293b; padding: 4px 10px; border-radius: 8px; border: 1px solid #334155;">
                        PLAYER: <strong style="color: #0ea5e9;">${String(block.avatar || 'Warrior').toUpperCase()}</strong>
                    </span>
                </div>

                <div class="youtube-shorts-subtitles" style="
                    background: rgba(0, 0, 0, 0.7);
                    padding: 15px;
                    border-radius: 12px;
                    min-height: 70px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid #1e293b;
                ">
                    <p id="shorts-text-target" style="
                        font-size: 1.4rem; 
                        font-weight: 900; 
                        color: #facc15; 
                        text-transform: uppercase; 
                        letter-spacing: 1px;
                        line-height: 1.3;
                        margin: 0;
                        text-shadow: 2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000;
                        animation: textPop 0.2s ease-out;
                    ">
                        ${block.sub?.en || ""}
                    </p>
                </div>
            </div>
        `;
        textToRead = block.sub?.en || "";
    }
    
    if (block.t === "d") {
        html += `<div class="card"><h3>${block.q?.en || ""}</h3>`;
        block.op?.forEach((opt, i) => {
            html += `<div class="answer" id="opt-${i}" onclick="selectAnswer(${i}, ${block.c}, ${JSON.stringify(block.ex).replace(/"/g, '&quot;')})">${opt}</div>`;
        });
        html += `</div>`;
        textToRead = `${block.q?.en}. Your options are: ${block.op.join(". ")}`;
    }
    if (block.t === "r") { html += `<div class="card center"><h2>⭐ ${block.tx || "REWARD"}</h2><p style="font-size:1.5rem;">+${block.p || 0} XP</p></div>`; textToRead = `${block.tx}. You have earned ${block.p} experience points.`; }
    if (block.t === "c") { html += `<div class="card"><p>${block.tx?.en || ""}</p></div>`; textToRead = block.tx?.en; }

    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;

    narrate(textToRead, () => {
        if (block.t === "breath_auto" || block.t === "br") {
            startCountdown(24, nextBlock);
            startGuidedBreathing();
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sil") {
            startCountdown(block.d || 24, nextBlock);
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sim") {
            // Duración estricta de 30 segundos por bloque de simulación con auto-flow progresivo
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

function selectAnswer(index, correct, explanations) {
    if (state.speechLocked) return;
    const isCorrect = index === correct;
    const explanation = explanations?.[index] || "";
    const feedbackWrap = document.createElement("div");
    feedbackWrap.innerHTML = `<div class="card"><h3 style="color:${isCorrect ? '#22c55e' : '#ef4444'}">${isCorrect ? "EXCELLENT!" : "KEEP LEARNING"}</h3><p>${explanation}</p></div><button id="continueBtn" disabled>NARRATING...</button>`;
    document.getElementById("app").appendChild(feedbackWrap);
    narrate(explanation, () => {
        unlockContinue("NEXT STEP", nextBlock);
    });
}

function nextBlock() { clearInterval(state.timer); state.currentBlock++; render(); }
function startMission() { state.phase = "mission"; state.currentBlock = 0; render(); }
function nextStory() {
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
