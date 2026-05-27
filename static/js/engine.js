/* =========================================================
   KAMIZEN ENGINE V23 - HYPER MOTION PATCH (SAFE UPGRADE)
   ✔ NO modifica avatars structure
   ✔ SOLO añade motion + timing + hype layer
   ✔ Compatible con tu engine V22 original
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
       HYPER MOTION FLAGS (NEW)
    ========================= */
    cameraShake: true,
    microPulse: true,
    ultraSpeedMode: true
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
   INIT SYSTEM (UNCHANGED CORE)
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
   🔥 HYPER CAMERA SYSTEM (NEW - SAFE ADDITION)
========================================================= */

function applyCameraFX(element) {

    if (!element) return;

    element.style.animation = `
        kamizen_snapZoom 1.1s infinite ease-in-out,
        kamizen_pulse 1.4s infinite ease-in-out
    `;
}

/* =========================================================
   🔥 MOTION CSS INJECTION (NO AVATAR CHANGE)
========================================================= */

const kamizenStyle = document.createElement("style");
kamizenStyle.innerHTML = `

@keyframes kamizen_snapZoom {
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.02) rotate(-0.2deg); }
    50% { transform: scale(1.05) rotate(0.2deg); }
    75% { transform: scale(1.02) rotate(-0.1deg); }
    100% { transform: scale(1) rotate(0deg); }
}

@keyframes kamizen_pulse {
    0% {
        box-shadow: 0 0 10px rgba(250,204,21,0.25);
    }
    50% {
        box-shadow: 0 0 35px rgba(250,204,21,0.8);
    }
    100% {
        box-shadow: 0 0 10px rgba(250,204,21,0.25);
    }
}

@keyframes kamizen_microShake {
    0% { transform: translateX(-1px); }
    100% { transform: translateX(1px); }
}

@keyframes kamizen_mouthFast {
    0% { transform: scaleY(0.2); }
    100% { transform: scaleY(1.6); }
}

.kamizen_talking .avatar-mouth {
    animation: kamizen_mouthFast 0.08s steps(2) infinite;
}

.kamizen_talking {
    animation: kamizen_microShake 0.12s infinite alternate;
}

.kamizen_flash {
    position:absolute;
    inset:0;
    background:white;
    opacity:0;
    pointer-events:none;
    animation: kamizen_flashCut 2.2s infinite;
}

@keyframes kamizen_flashCut {
    0%, 92%, 100% { opacity:0; }
    93% { opacity:0.3; }
    94% { opacity:0; }
    95% { opacity:0.2; }
}

`;

document.head.appendChild(kamizenStyle);

/* =========================================================
   AUDIO ENGINE (UNCHANGED LOGIC)
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

function stopDopamineMusic() {

    if (state.musicInterval) clearInterval(state.musicInterval);

    if (state.oscillator) {
        try { state.oscillator.stop(); } catch(e){}
        state.oscillator = null;
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
   INTRO (UNCHANGED LOGIC)
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
   PREFACE GUIDE (UNCHANGED STRUCTURE + HYPER FX ONLY)
========================================================= */

function showPrefaceGuide() {

    state.phase = "preface";

    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="card kamizen_preface">

            <h2 style="
                color:#facc15;
                text-align:center;
                font-weight:900;
            ">
                🗺️ THE 6 KINGDOMS OF POWER
            </h2>

            <div style="
                display:flex;
                flex-direction:column;
                gap:8px;
                margin-top:10px;
                font-weight:700;
            ">
                <div>🛡️ Respect Field (1-10)</div>
                <div>🏡 Love Castle (11-20)</div>
                <div>📚 Brain Focus (21-30)</div>
                <div>🏎️ Healthy Engine (31-40)</div>
                <div>🪙 Golden Joy (41-50)</div>
                <div>🏰 Wealth Empire (51-63)</div>
            </div>

            <button onclick="exitPreface()" class="kamizen_btn">
                START QUEST NOW
            </button>

        </div>
    `;

    const el = document.querySelector(".kamizen_preface");
    if (el) applyCameraFX(el);

    narrate(
        "Welcome. Six kingdoms. Sixty three missions. Begin now.",
        false
    );
}

function exitPreface() {
    state.phase = "story";
    render();
}

/* =========================================================
   CORE RENDER ENGINE (HYPER SPEED PATCH ONLY)
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
        <div class="kamizen_nav">

            <div></div>

            <div style="display:flex; gap:5px;">
                <button onclick="goBack()">BACK</button>
                <button onclick="jumpToBlock()">JUMP</button>
                <button onclick="restartSystem()">RESET</button>
            </div>

            <div class="kamizen_live">
                🔊 SPEAKER ONLINE
            </div>

        </div>
    `;

    /* =========================
       STORY MODE (ZERO DEAD TIME)
    ========================= */

    if (state.phase === "story") {

        app.innerHTML = navHeader + `
            <div class="card kamizen_story">
                <h2>STORY ${story.id}</h2>
                <p>${story.en || ""}</p>
            </div>
        `;

        const el = document.querySelector(".kamizen_story");
        if (el) applyCameraFX(el);

        narrate(`${story.en}`, false, () => {
            startMission();
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
   BLOCK ENGINE (HYPER AVATAR SYSTEM - SAFE PATCH)
========================================================= */

function renderBlock(block, navHeader) {

    const app = document.getElementById("app");

    let html = navHeader;
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");

    const timerUI = `
        <div class="card kamizen_timer">
            <h1 id="timerDisplay">00:00</h1>
        </div>
    `;

    /* =========================
       BASIC BLOCKS (UNCHANGED LOGIC)
    ========================= */

    if (block.t === "v" || block.t === "h") {
        html += `<div class="card">${block.tx?.en || ""}</div>`;
        textToRead = block.tx?.en;
    }

    if (block.story) {
        html += `<div class="card">${block.story.en || ""}</div>`;
        textToRead = block.story.en;
    }

    if (block.t === "sil") {
        html += timerUI + `<div class="card">${block.tx?.en || ""}</div>`;
        textToRead = block.tx?.en;
    }

    /* =========================
       SIM MODE (HYPER AVATAR ENGINE PATCH)
    ========================= */

    if (isAvatarMode) {

        startDopamineMusic();

        const selector = state.currentIndex % 6;

        let powerWord = "FOCUS";
        let assetSymbol = "📘";
        let kidsLesson = "Your brain grows with focus.";

        if (selector === 0) {
            powerWord = "RESPECT";
            assetSymbol = "🛡️";
            kidsLesson = "Respect builds strong life rules.";
        }

        if (selector === 1) {
            powerWord = "LOVE";
            assetSymbol = "🏡";
            kidsLesson = "Love creates strong families.";
        }

        if (selector === 2) {
            powerWord = "FOCUS";
            assetSymbol = "📚";
            kidsLesson = "Focus unlocks intelligence.";
        }

        if (selector === 3) {
            powerWord = "ENERGY";
            assetSymbol = "🏎️";
            kidsLesson = "Energy comes from healthy habits.";
        }

        if (selector === 4) {
            powerWord = "JOY";
            assetSymbol = "🪙";
            kidsLesson = "Joy makes discipline easy.";
        }

        if (selector === 5) {
            powerWord = "WEALTH";
            assetSymbol = "🏰";
            kidsLesson = "Wealth is built daily.";
        }

        textToRead =
            `Michael and ${state.userName}. Grab ${powerWord}. ${kidsLesson}`;

        html += `
            <div class="card sim-gaming-container kamizen_hyper">

                <div class="kamizen_flash"></div>

                <div class="kamizen_live_tag">LIVE HUNT</div>

                <div class="kamizen_stage">

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

                <div class="kamizen_power">
                    ${powerWord}
                </div>

                <p class="kamizen_lesson">
                    ${kidsLesson}
                </p>

            </div>
        `;

        setTimeout(() => {

            const el = document.querySelector(".kamizen_hyper");
            if (el) applyCameraFX(el);

        }, 0);
    }

    /* =========================
       CONTINUE BUTTON (ZERO LATENCY FIX)
    ========================= */

    html += `<button id="continueBtn" disabled>NARRATING...</button>`;

    app.innerHTML = html;

    narrate(textToRead, isAvatarMode, () => {

        // 🔥 ZERO DEAD TIME FLOW (IMPORTANT PATCH)
        if (block.t === "sim") {

            startCountdown(18, nextBlock);

            unlockContinue("SKIP", nextBlock);

            // auto-flow protection (no waiting feel)
            setTimeout(() => {
                unlockContinue("SKIP", nextBlock);
            }, 50);

        } else {

            nextBlock();
        }
    });
}

/* =========================================================
   HYPER BREATHING (UNCHANGED LOGIC OPTIONAL)
========================================================= */

function startGuidedBreathing() {

    const circle = document.getElementById("breathCircle");
    const label = document.getElementById("breathLabel");

    if (!circle || !label) return;

    let inhale = true;

    setInterval(() => {

        if (!document.getElementById("breathCircle")) return;

        label.innerText = inhale ? "INHALE" : "EXHALE";

        circle.style.transform = inhale ? "scale(1.4)" : "scale(0.8)";

        inhale = !inhale;

    }, 4000);
}

/* =========================================================
   ANSWERS (UNCHANGED)
========================================================= */

function selectAnswer(index, correct, explanations) {

    const isCorrect = index === correct;

    const wrap = document.createElement("div");

    wrap.innerHTML = `
        <div class="card ${isCorrect ? 'ok' : 'fail'}">
            ${explanations?.[index] || ""}
        </div>
        <button id="continueBtn" disabled>NARRATING...</button>
    `;

    document.getElementById("app").appendChild(wrap);

    narrate(explanations?.[index], false, () => {
        unlockContinue("NEXT", nextBlock);
    });
}

/* =========================================================
   FLOW CONTROL (UNCHANGED CORE)
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
   CONTINUE UNLOCK
========================================================= */

function unlockContinue(label, action) {

    const btn = document.getElementById("continueBtn");

    if (btn) {
        btn.disabled = false;
        btn.innerText = label;
        btn.onclick = action;
    }
}
