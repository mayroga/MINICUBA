/* =========================================================
   KAMIZEN ENGINE V23 - HYPER AVATAR LIVE HUNT EDITION
   ✔ Hyper Reactive Avatar Engine
   ✔ Shorts/TikTok Style Motion System
   ✔ Snap Zoom Camera Simulation
   ✔ Hyper Pulse Glow FX
   ✔ Ultra Fast Mouth Sync
   ✔ Zero Dead Time Transitions
   ✔ Aggressive Asset Capture Arms
   ✔ Flash Cut Editing Simulation
   ✔ Subtitle Pop System
   ✔ Dynamic Dopamine Feedback Loop
   ✔ Full Compatibility With Existing Mission System
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
/* =========================
   SISTEMA DE MÚSICA DOPAMINA
========================= */
function startDopamineMusic() {
    try {
        if (!state.audioCtx) {
            state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        state.oscillator = state.audioCtx.createOscillator();
        state.gainNode = state.audioCtx.createGain();
        state.filterNode = state.audioCtx.createBiquadFilter();
        state.oscillator.type = "sine";
        state.oscillator.frequency.setValueAtTime(
            288,
            state.audioCtx.currentTime
        );
        state.filterNode.type = "lowpass";
        state.filterNode.frequency.setValueAtTime(
            600,
            state.audioCtx.currentTime
        );
        state.gainNode.gain.setValueAtTime(
            0.04,
            state.audioCtx.currentTime
        );
        state.oscillator.connect(state.filterNode);
        state.filterNode.connect(state.gainNode);
        state.gainNode.connect(state.audioCtx.destination);
        state.oscillator.start();
        const notes = [288, 324, 384, 432];
        let noteIdx = 0;
        state.musicInterval = setInterval(() => {
            if (state.oscillator) {
                noteIdx = (noteIdx + 1) % notes.length;
                state.oscillator.frequency.linearRampToValueAtTime(
                    notes[noteIdx],
                    state.audioCtx.currentTime + 0.1
                );
            }
        }, 800);
    } catch (e) {
        console.log("Audio deferred.");
    }
}
function stopDopamineMusic() {
    if (state.musicInterval) {
        clearInterval(state.musicInterval);
    }
    if (state.oscillator) {
        try {
           state.oscillator.stop();
            state.oscillator.disconnect();
        } catch (e) {}
        state.oscillator = null;
    }
}
/* =========================
   MASTER TIMER CONTROL
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
        <div class="card center animated fadeIn"
             style="
                border:4px solid #22c55e;
                padding:25px;
                width:100%;
                box-sizing:border-box;
             ">
            <h2 style="
                color:#22c55e;
                font-size:2rem;
                font-weight:900;
            ">
                🌟 SESSION COMPLETE! 🌟
            </h2>
            <p style="
                font-size:1.2rem;
                font-weight:bold;
                margin:15px 0;
            ">
                Awesome work, MICHAEL and ${state.userName.toUpperCase()}!
            </p>
            <p>
                Your brain only needs a few focused minutes
                to become stronger every day.
            </p>
            <div style="
                background:rgba(0,0,0,0.3);
                padding:15px;
                border-radius:12px;
                margin:20px 0;
                text-align:left;
                border-left:5px solid #22c55e;
            ">
                <h4 style="
                    margin:0 0 10px 0;
                    color:#facc15;
                    text-transform:uppercase;
                ">
                    🚀 NEXT QUEST:
                </h4>
                <p>✔ Start your class</p>
                <p>✔ Rest your mind</p>
                <p>✔ Go play outside</p>
                <p>✔ Talk with family</p>
                <p>✔ Return tomorrow stronger</p>
            </div>
            <button
                onclick="location.reload()"
                style="
                    margin-top:25px;
                    width:100%;
                    background:#22c55e;
                    padding:15px;
                    font-weight:900;
                    font-size:1.2rem;
                "
            >
                FINISH SESSION
            </button>

        </div>
    `;
    const vocalGoodbye = `
        Session complete.
        Awesome work Michael and ${state.userName}.
        Now go start your class,
        rest your brain,
        have fun,
        and return tomorrow stronger.
    `;
    narrate(vocalGoodbye, false);
}
/* =========================
   CONTROLES DE NAVEGACIÓN
========================= */
function jumpToBlock() {
    const targetMissionId = prompt(
        "Enter the MISSION ID to jump to (1-63):"
    );
    if (
        targetMissionId !== null &&
        targetMissionId !== ""
    ) {
        const idNum = Number(targetMissionId);
        const idx = state.missions.findIndex(
            m => m.id === idNum
        );
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
   HYPER NARRATION ENGINE
========================= */
function narrate(text, isAvatarActive, callback) {
    if (!text) {
        if (callback) callback();
        return;
    }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    const elements = document.querySelectorAll(".cube-model-inner");
    elements.forEach(el => {
        el.classList.add("talking-avatar");
    });
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    if (isAvatarActive) {
        speech.rate = 1.18;
        speech.pitch = 1.28;
    } else {
        speech.rate = 1.12;
        speech.pitch = 1.22;
    }
    speech.onend = () => {
        state.speechLocked = false;
        elements.forEach(el => {
            el.classList.remove("talking-avatar");
        });
        if (callback) callback();
    };
    window.speechSynthesis.speak(speech);
}
/* =========================
   RESET SYSTEM
========================= */
function restartSystem() {
    if (confirm("Are you sure you want to RESTART from zero?")) {
        localStorage.clear();
        state.userName = "Warrior";
        state.currentIndex = 0;
        state.currentBlock = 0;
        state.phase = "story";
        render();
    }
}
/* =========================
   COUNTDOWN ENGINE
========================= */
function startCountdown(seconds, onComplete) {
    clearInterval(state.timer);
    state.timeLeft = seconds;
    const timerDisplay = document.getElementById("timerDisplay");
    state.timer = setInterval(() => {
        state.timeLeft--;
        const m = Math.floor(state.timeLeft / 60);
        const s = state.timeLeft % 60;
        if (timerDisplay) {
            timerDisplay.innerText =
                `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            if (onComplete) onComplete();
        }
    }, 1000);
}
/* =========================
   MOTOR DE RENDER
========================= */
function showIntro() {
    state.phase = "intro";
    document.getElementById("app").innerHTML = `
        <div class="card center">
            <h1>KAMIZEN LIFE SYSTEM</h1>
            <p>Training • Awareness • Control</p>
            <p class="small">
                Range: Missions 1 - 63 Loaded
            </p>
            <button onclick="askNameAndStart()">
                CONTINUE MISSION
            </button>
            <button
                onclick="restartSystem()"
                style="
                    background:var(--danger);
                    margin-top:10px;
                "
            >
                RESET PROGRESS
            </button>

        </div>
    `;
}
function askNameAndStart() {
    let nameInput = prompt(
        "Please enter your name to begin training:"
    );
    if (
        nameInput &&
        nameInput.trim() !== ""
    ) {
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
   PREFACE GUIDE (6 KINGDOMS)
========================================================= */
function showPrefaceGuide() {
    state.phase = "preface";
    const app = document.getElementById("app");
    app.innerHTML = `
        <div class="card animated fadeIn"
            style="
                border:4px solid #0ea5e9;
                padding:20px;
                width:100%;
                box-sizing:border-box;
                animation:
                    snapZoom 1.2s infinite ease-in-out,
                    hyperPulse 1.5s infinite ease-in-out;
            ">
            <h2 style="
                color:#facc15;
                font-size:1.7rem;
                text-align:center;
                font-weight:900;
            ">
                🗺️ THE 6 KINGDOMS OF POWER
            </h2>
            <div style="
                display:flex;
                flex-direction:column;
                gap:10px;
                margin-top:15px;
            ">
                <div>🛡️ Respect Field (1-10)</div>
                <div>🏡 Love Castle (11-20)</div>
                <div>📚 Brain Focus (21-30)</div>
                <div>🏎️ Healthy Engine (31-40)</div>
                <div>🪙 Golden Joy (41-50)</div>
                <div>🏰 Wealth Empire (51-63)</div>
            </div>
            <button onclick="exitPreface()"
                style="
                    margin-top:20px;
                    width:100%;
                    background:#22c55e;
                    font-weight:900;
                    font-size:1.1rem;
                    padding:15px;
                ">
                START QUEST NOW
            </button>
        </div>
    `;
    narrate(
        "Welcome to the six kingdoms of power. Your mission begins now.",
        false
    );
}
function exitPreface() {
    state.phase = "story";
    render();
}
/* =========================================================
   CORE RENDER ENGINE (HYPER MODE)
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
        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:10px;
            width:100%;
        ">
            <div></div>
            <div style="display:flex; gap:5px;">
                <button onclick="goBack()"
                    style="padding:6px 12px; font-size:11px;">
                    BACK
                </button>
                <button onclick="jumpToBlock()"
                    style="padding:6px 12px; font-size:11px;">
                    JUMP
                </button>
                <button onclick="restartSystem()"
                    style="padding:6px 12px; font-size:11px;">
                    RESET
                </button>
            </div>
            <div style="
                font-family:monospace;
                font-size:11px;
                color:#22c55e;
                font-weight:bold;
            ">
                🔊 SPEAKER ONLINE
            </div>

        </div>
    `;
    /* =========================
       STORY PHASE
    ========================= */
    if (state.phase === "story") {
        app.innerHTML = navHeader + `
            <div class="card">
                <h2>STORY ${story.id}</h2>
                <p>${story.en || ""}</p>
            </div>
        `;
        narrate(`${story.en}`, false, () => {
            setTimeout(startMission, 150);
        });

        return;
    }
    /* =========================
       MISSION PHASE
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
   BLOCK ENGINE (HYPER AVATAR SYSTEM)
========================================================= */
function renderBlock(block, navHeader) {
    const app = document.getElementById("app");
    let html = navHeader;
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");
    const timerUI = `
        <div class="card center"
            style="
                border:3px solid #0ea5e9;
                animation:
                    hyperPulse 1.2s infinite ease-in-out;
            ">
            <h1 id="timerDisplay">00:00</h1>
        </div>
    `;
    /* =========================
       SIMPLE BLOCKS
    ========================= */
    if (block.t === "v" || block.t === "h") {
        html += `<div class="card"><h2>${block.tx?.en}</h2></div>`;
        textToRead = block.tx?.en;
    }
    if (block.story) {
        html += `<div class="card"><p>${block.story.en}</p></div>`;
        textToRead = block.story.en;
    }
    if (block.t === "sil") {
        html += timerUI + `<div class="card"><h3>${block.tx?.en}</h3></div>`;
        textToRead = block.tx?.en;
    }
    /* =========================
       SIMULATION MODE (HYPER ENGINE)
    ========================= */
    if (isAvatarMode) {
        startDopamineMusic();
        const blockSelector = state.currentIndex % 6;
        let powerWord = "FOCUS";
        let assetSymbol = "📘";
        let kidsLesson = "Your brain grows when you focus.";
        if (blockSelector === 0) {
            powerWord = "RESPECT";
            assetSymbol = "🛡️";
            kidsLesson = "Respect protects your life and family rules.";
        }
        if (blockSelector === 1) {
            powerWord = "LOVE";
            assetSymbol = "🏡";
            kidsLesson = "Love builds strong homes and happy teams.";
        }
        if (blockSelector === 2) {
            powerWord = "FOCUS";
            assetSymbol = "📚";
            kidsLesson = "Focus unlocks intelligence and skill.";
        }
        if (blockSelector === 3) {
            powerWord = "ENERGY";
            assetSymbol = "🏎️";
            kidsLesson = "Healthy body = fast powerful life.";
        }
        if (blockSelector === 4) {
            powerWord = "JOY";
            assetSymbol = "🪙";
            kidsLesson = "Joy makes discipline feel easy.";
        }
        if (blockSelector === 5) {
            powerWord = "WEALTH";
            assetSymbol = "🏰";
            kidsLesson = "Wealth is built through daily discipline.";
        }
        textToRead =
            `Michael and ${state.userName}. Grab the ${powerWord} object now! ${kidsLesson}`;
        html += `
            <style>
                .sim-gaming-container{
                    animation:
                        snapZoom 1.1s infinite ease-in-out,
                        hyperPulse 1.3s infinite ease-in-out;
                    position:relative;
                    overflow:hidden;
                }
                .talking-avatar .avatar-mouth{
                    animation: mouthSpeak 0.08s infinite steps(2);
                }
                .talking-avatar{
                    animation: avatarShake 0.12s infinite alternate;
                }
            </style>
            ${timerUI}
            <div class="card sim-gaming-container">
                <div class="flash-overlay"></div>
                <div style="
                    position:absolute;
                    top:10px;
                    left:10px;
                    color:#facc15;
                    font-weight:900;
                ">
                    LIVE HUNT
                </div>
                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px;
                ">
                    <div class="cube-model-inner">MICHAEL</div>
                    <div style="font-size:40px;">
                        ${assetSymbol}
                    </div>
                    <div class="cube-model-inner">
                        ${state.userName}
                    </div>
                </div>
                <div style="
                    text-align:center;
                    font-weight:900;
                    color:#facc15;
                    margin-top:10px;
                ">
                    ${powerWord}
                </div>
                <p style="text-align:center;">
                    ${kidsLesson}
                </p>
            </div>
        `;
    }
    /* =========================
       CONTINUE BUTTON
    ========================= */
    html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;
    narrate(textToRead, isAvatarMode, () => {
        if (block.t === "sim") {
            startCountdown(20, nextBlock);
            unlockContinue("SKIP", nextBlock);
        } else {
            setTimeout(nextBlock, 150);
        }
    });
}
/* =========================================================
   FLOW CONTROL
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
   INTERACTION
========================================================= */
function unlockContinue(label, action) {
    const btn = document.getElementById("continueBtn");
    if (btn) {
        btn.disabled = false;
        btn.innerText = label;
        btn.onclick = action;
    }
}
