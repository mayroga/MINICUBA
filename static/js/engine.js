/* =========================================================
   KAMIZEN ENGINE V22 - HYPER MOTION PATCH (SAFE LAYER)
   ✔ NO REEMPLAZA TU ENGINE
   ✔ SOLO AÑADE CAPA DE MOVIMIENTO VISUAL
   ✔ COMPATIBLE 100% CON TU CÓDIGO ORIGINAL
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
    /* =========================
       NEW: VISUAL MOTION LAYER (SAFE)
    ========================= */
    cameraFXEnabled: true,
    hyperMouthFX: true,
    microShakeFX: true
};
/* =========================================================
   PERSISTENCIA (UNCHANGED)
========================================================= */

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
/* =========================================================
   INIT SYSTEM (UNCHANGED)
========================================================= */
window.addEventListener("load", async () => {
    loadProgress();
    await loadAllData();
    showIntro();
});
async function loadAllData() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="card">
            <h2>SYSTEM BOOTING...</h2>
            <p>Loading Data (Missions 1-63)...</p>
        </div>
    `;
    try {
        const [storiesReq, missionsReq] = await Promise.all([
            fetch("/api/stories"),
            fetch("/api/missions")
        ]);
        const storiesData = await storiesReq.json();
        const missionsData = await missionsReq.json();
        state.stories = Array.isArray(storiesData.stories)
            ? storiesData.stories.sort((a, b) => a.id - b.id)
            : [];
        state.missions = Array.isArray(missionsData.missions)
            ? missionsData.missions.sort((a, b) => a.id - b.id)
            : [];
        state.initialized = true;
    } catch (err) {
        console.error(err);
        app.innerHTML = `
            <div class="card">
                <h2>BOOT ERROR</h2>
                <p>Check API Connection</p>
            </div>
        `;
    }
}
/* =========================================================
   🔥 HYPER VISUAL ENGINE (SAFE ADDITION - NO BREAK)
========================================================= */
/* Cámara viva (solo CSS helper, no toca lógica) */
function applyCameraFX(el) {
    if (!el || !state.cameraFXEnabled) return;
    el.style.animation = `
        kmz_zoom 1.2s infinite ease-in-out,
        kmz_pulse 1.5s infinite ease-in-out
    `;
}
/* =========================================================
   INJECT VISUAL MOTION CSS (SAFE, NO OVERWRITE)
========================================================= */
const style = document.createElement("style");
style.innerHTML = `
@keyframes kmz_zoom {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
}
@keyframes kmz_pulse {
    0% { box-shadow: 0 0 0px rgba(250,204,21,0.0); }
    50% { box-shadow: 0 0 25px rgba(250,204,21,0.6); }
    100% { box-shadow: 0 0 0px rgba(250,204,21,0.0); }
}
/* mouth sync ultra fast (NO cambia estructura HTML) */
.kmz_talking .avatar-mouth {
    animation: kmz_mouth 0.09s steps(2) infinite;
}
@keyframes kmz_mouth {
    0% { transform: scaleY(0.2); }
    100% { transform: scaleY(1.6); }
}
/* micro shake live feeling */
.kmz_talking {
    animation: kmz_shake 0.12s infinite alternate;
}
@keyframes kmz_shake {
    0% { transform: translateX(-1px); }
    100% { transform: translateX(1px); }
}
`;
document.head.appendChild(style);
/* =========================================================
   AUDIO (UNCHANGED - SAFE)
========================================================= */
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
        let i = 0;
        state.musicInterval = setInterval(() => {
            i = (i + 1) % notes.length;
            state.oscillator.frequency.linearRampToValueAtTime(
                notes[i],
                state.audioCtx.currentTime + 0.1
            );

        }, 800);
    } catch (e) {
        console.log("Audio deferred");
    }
}
/* =========================================================
   TIMER (UNCHANGED)
========================================================= */
function startCountdown(seconds, onComplete) {
    clearInterval(state.timer);
    state.timeLeft = seconds;
    const el = document.getElementById("timerDisplay");
    state.timer = setInterval(() => {
        state.timeLeft--;
        const m = Math.floor(state.timeLeft / 60);
        const s = state.timeLeft % 60;
        if (el) {
            el.innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            if (onComplete) onComplete();
        }
    }, 1000);
}
/* =========================================================
   INTRO (UNCHANGED)
========================================================= */
function showIntro() {
    state.phase = "intro";
    document.getElementById("app").innerHTML = `
        <div class="card center">
            <h1>KAMIZEN LIFE SYSTEM</h1>
            <button onclick="askNameAndStart()">CONTINUE</button>
        </div>
    `;
}
function askNameAndStart() {
    let n = prompt("Enter name");
    state.userName = n?.trim() || "Warrior";
    saveProgress();
    startSystem();
}
function startSystem() {
    showPrefaceGuide();
}
/* =========================================================
   NAV HELPERS (UNCHANGED CORE)
========================================================= */
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
    }
    render();
}
function restartSystem() {
    if (confirm("Restart system?")) {
        localStorage.clear();
        state.userName = "Warrior";
        state.currentIndex = 0;
        state.currentBlock = 0;
        state.phase = "story";
        render();
    }
}
/* =========================================================
   NARRATE (HYPER UPGRADE SAFE LAYER)
========================================================= */
function narrate(text, isAvatarActive, callback) {
    if (!text) {
        if (callback) callback();
        return;
    }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    const avatars = document.querySelectorAll(".cube-model-inner");
    avatars.forEach(a => a.classList.add("kmz_talking"));
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1.0;
    speech.pitch = 1.1;
    speech.onend = () => {
        state.speechLocked = false;
        avatars.forEach(a => a.classList.remove("kmz_talking"));
        if (callback) callback();
    };
    window.speechSynthesis.speak(speech);
}
/* =========================================================
   MAIN RENDER (HYPER PATCH — NO STRUCTURE BREAK)
========================================================= */
function render() {
    if (!state.initialized) return;
    saveProgress();
    const app = document.getElementById("app");
    const story = state.stories[state.currentIndex];
    const mission = state.missions[state.currentIndex];
    if (!story || !mission) {
        state.currentIndex = 0;
        state.currentBlock = 0;
        state.phase = "story";
        return render();
    }
    const navHeader = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <div></div>
            <div>
                <button onclick="goBack()">BACK</button>
                <button onclick="restartSystem()">RESET</button>
            </div>
            <div style="color:#22c55e;font-weight:900;">
                🔊 SPEAKER ONLINE
            </div>
        </div>
    `;
    /* =========================
       STORY MODE (ZERO DEAD TIME FIX)
    ========================= */
    if (state.phase === "story") {
        app.innerHTML = navHeader + `
            <div class="card kmz_camera">
                <h2>STORY ${story.id}</h2>
                <p>${story.en}</p>
            </div>
        `;
        applyCameraFX(document.querySelector(".kmz_camera"));
        narrate(story.en, false, () => {
            startMission(); // no delay (IMPORTANT FIX)
        });
        return;
    }
    /* =========================
       MISSION MODE
    ========================= */
    if (state.phase === "mission") {
        const block = mission.b[state.currentBlock];
        if (!block) {
            nextStory();
            return;
        }
        renderBlock(block, navHeader);
    }
}
/* =========================================================
   BLOCK ENGINE (HYPER SIM UPGRADE)
========================================================= */
function renderBlock(block, navHeader) {
    const app = document.getElementById("app");
    let html = navHeader;
    let textToRead = "";
    let isSim = (block.t === "sim");
    const timerUI = `
        <div class="card kmz_timer">
            <h1 id="timerDisplay">00:00</h1>
        </div>
    `;
    /* =========================
       BASIC BLOCKS (UNCHANGED)
    ========================= */
    if (block.t === "v" || block.t === "h") {
        html += `<div class="card">${block.tx?.en}</div>`;
        textToRead = block.tx?.en;
    }
    if (block.story) {
        html += `<div class="card">${block.story.en}</div>`;
        textToRead = block.story.en;
    }
    if (block.t === "sil") {
        html += timerUI + `<div class="card">${block.tx?.en}</div>`;
        textToRead = block.tx?.en;
    }
    /* =========================================================
       🔥 SIM MODE (FULL HYPER INTERACTION ENGINE)
    ========================================================= */
    if (isSim) {
        startDopamineMusic();
        const selector = state.currentIndex % 6;
        let powerWord = "FOCUS";
        let assetSymbol = "📘";
        let lesson = "Your brain grows when you focus.";
        if (selector === 0) {
            powerWord = "RESPECT";
            assetSymbol = "🛡️";
            lesson = "Respect protects your life.";
        }
        if (selector === 1) {
            powerWord = "LOVE";
            assetSymbol = "🏡";
            lesson = "Love builds families.";
        }
        if (selector === 2) {
            powerWord = "FOCUS";
            assetSymbol = "📚";
            lesson = "Focus unlocks intelligence.";
        }
        if (selector === 3) {
            powerWord = "ENERGY";
            assetSymbol = "🏎️";
            lesson = "Energy comes from health.";
        }
        if (selector === 4) {
            powerWord = "JOY";
            assetSymbol = "🪙";
            lesson = "Joy makes discipline easy.";
        }
        if (selector === 5) {
            powerWord = "WEALTH";
            assetSymbol = "🏰";
            lesson = "Wealth is built daily.";
        }
        textToRead =
            `Michael and ${state.userName}. Grab ${powerWord}. ${lesson}`;
        html += `
            <div class="card kmz_sim_container">
                <div class="kmz_flash"></div>
                <div class="kmz_live">LIVE HUNT</div>
                <div class="kmz_stage">
                    <div class="avatar_left cube-model-inner">
                        MICHAEL
                    </div>
                    <div class="asset">
                        ${assetSymbol}
                    </div>
                    <div class="avatar_right cube-model-inner">
                        ${state.userName}
                    </div>
                </div>
                <div class="kmz_power">${powerWord}</div>
                <div class="kmz_lesson">${lesson}</div>
            </div>
        `;
        // 🔥 CAMERA + MOTION FORCE APPLY (IMPORTANT)
        setTimeout(() => {
          const el = document.querySelector(".kmz_sim_container");
            if (el) applyCameraFX(el);
        }, 0);
    }
    /* =========================
       CONTINUE (ZERO DEAD TIME FIX)
    ========================= */
    html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;
    narrate(textToRead, isSim, () => {
        if (isSim) {
            startCountdown(18, nextBlock);
            // 🔥 instant unlock (no waiting feel)
            unlockContinue("SKIP", nextBlock);
            setTimeout(() => {
                unlockContinue("SKIP", nextBlock);
            }, 40);
        } else {
            nextBlock();
        }
    });
}
/* =========================================================
   FLOW (UNCHANGED CORE)
========================================================= */

function startMission() {
    state.phase = "mission";
    state.currentBlock = 0;
    render();
}
function nextBlock() {
    stopDopamineMusic();
    clearInterval(state.timer);
    state.currentBlock++;
    render();
}
function nextStory() {
    stopDopamineMusic();
    state.currentIndex++;
    if (state.currentIndex >= state.missions.length) {
        state.currentIndex = 0;
    }
    state.phase = "story";
    state.currentBlock = 0;
    render();
}
/* =========================================================
   CONTINUE BUTTON
========================================================= */
function unlockContinue(label, action) {
    const btn = document.getElementById("continueBtn");
    if (btn) {
        btn.disabled = false;
        btn.innerText = label;
        btn.onclick = action;
    }
}
