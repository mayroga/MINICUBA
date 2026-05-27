/* =========================================================
   KAMIZEN ENGINE V22 - HYPE VISUAL LAYER UPGRADE (PART 1)
   ✔ Mantiene lógica original intacta
   ✔ Añade sistema de cámara reactiva + visual FX
   ✔ No modifica estructura de avatars existentes
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

    // =========================
    // HYPE VISUAL ENGINE FLAGS
    // =========================
    cameraPulse: true,
    microShake: true,
    flashEnabled: true
};

/* =========================
   PERSISTENCIA
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
   INIT SYSTEM
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
   DOPAMINE MUSIC ENGINE (UNCHANGED CORE)
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
   MASTER TIMER
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
        <div class="card center animated fadeIn">
            <h2>SESSION COMPLETE</h2>
            <p>Good job ${state.userName}</p>
            <button onclick="location.reload()">FINISH</button>
        </div>
    `;
}

/* =========================
   NAVIGATION CORE
========================= */
function jumpToBlock() {
    const targetMissionId = prompt("MISSION ID (1-63):");

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
        alert("Mission not found");
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
   SPEECH ENGINE (HYPE UPGRADED)
========================= */
function narrate(text, isAvatarActive, callback) {
    if (!text) { if (callback) callback(); return; }

    state.speechLocked = true;
    window.speechSynthesis.cancel();

    const elements = document.querySelectorAll(".cube-model-inner");
    elements.forEach(el => el.classList.add("talking-avatar"));

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";

    // =========================
    // HYPE SPEED LAYER
    // =========================
    if (isAvatarActive) {
        speech.rate = 1.18;
        speech.pitch = 1.28;
    } else {
        speech.rate = 1.12;
        speech.pitch = 1.22;
    }

    speech.onend = () => {
        state.speechLocked = false;
        elements.forEach(el => el.classList.remove("talking-avatar"));
        if (callback) callback();
    };

    window.speechSynthesis.speak(speech);
}

/* =========================
   TIMER COUNTDOWN
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
                `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }

        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            if (onComplete) onComplete();
        }
    }, 1000);
}

/* =========================
   INTRO
========================= */
function showIntro() {
    state.phase = "intro";

    document.getElementById("app").innerHTML = `
        <div class="card center">
            <h1>KAMIZEN LIFE SYSTEM</h1>
            <button onclick="askNameAndStart()">START</button>
        </div>
    `;
}

function askNameAndStart() {
    let nameInput = prompt("Enter name:");

    state.userName = (nameInput && nameInput.trim()) ? nameInput.trim() : "Warrior";

    saveProgress();
    startSystem();
}

function startSystem() {
    startMasterTimer();
    showPrefaceGuide();
}
/* =========================================================
   KAMIZEN ENGINE V22 - HYPE VISUAL LAYER UPGRADE (PART 2)
   ✔ render + sim engine upgrade
   ✔ avatar reaction system
   ✔ zero-latency flow control
   ✔ asset interaction + camera FX hooks
   ========================================================= */

/* =========================
   INTELIGENT PREFACE
========================= */
function showPrefaceGuide() {
    state.phase = "preface";

    document.getElementById("app").innerHTML = `
        <div class="card">
            <h2>6 KINGDOMS OF POWER</h2>
            <button onclick="exitPreface()">START QUEST</button>
        </div>
    `;

    narrate(
        "Welcome to the six Kingdoms of power. Your mission begins now.",
        false
    );
}

function exitPreface() {
    state.phase = "story";
    render();
}

/* =========================
   CORE RENDER ENGINE (HYPE UPGRADED)
========================= */
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
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <button onclick="goBack()">BACK</button>
            <button onclick="jumpToBlock()">JUMP</button>
            <button onclick="location.reload()">RESET</button>
            <div style="color:#22c55e;font-weight:900;">🔊 SPEAKER ONLINE</div>
        </div>
    `;

    /* =========================
       STORY MODE
    ========================= */
    if (state.phase === "story") {
        app.innerHTML = navHeader + `
            <div class="card">
                <h2>STORY ${story.id}</h2>
                <p>${story.en || ""}</p>
            </div>
            <button id="continueBtn" disabled>NARRATING...</button>
        `;

        narrate(`${story.en}`, false, () => {
            setTimeout(startMission, 400);
        });
    }

    /* =========================
       MISSION MODE
    ========================= */
    else if (state.phase === "mission") {
        const block = mission.b[state.currentBlock];

        if (!block) {
            nextStory();
            return;
        }

        renderBlock(block, navHeader);
    }
}

/* =========================
   BLOCK ENGINE (HYPE SIM MODE)
========================= */
function renderBlock(block, navHeader) {
    const app = document.getElementById("app");

    let html = navHeader;
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");

    const timerUI = `
        <div class="card">
            <h1 id="timerDisplay">00:00</h1>
        </div>
    `;

    /* =========================
       NORMAL BLOCKS
    ========================= */
    if (block.t === "v" || block.t === "h") {
        html += `<div class="card"><h2>${block.tx?.en || ""}</h2></div>`;
        textToRead = block.tx?.en;
    }

    if (block.t === "story") {
        html += `<div class="card"><p>${block.story?.en || ""}</p></div>`;
        textToRead = block.story?.en;
    }

    /* =========================
       BREATH / SILENCE
    ========================= */
    if (block.t === "br" || block.t === "breath_auto") {
        html += timerUI + `<div class="card">BREATH MODE</div>`;
        textToRead = "Breathe now";
    }

    if (block.t === "sil") {
        html += timerUI + `<div class="card">SILENCE MODE</div>`;
        textToRead = "Silence now";
    }

    /* =========================
       SIM MODE (HYPE ENGINE CORE)
    ========================= */
    if (isAvatarMode) {

        startDopamineMusic();

        const blockSelector = state.currentIndex % 6;

        let powerWord = "FOCUS";
        let assetSymbol = "📘";
        let kidsLesson = "Learn and grow.";

        if (blockSelector === 0) {
            powerWord = "RESPECT"; assetSymbol = "🛡️";
            kidsLesson = "Respect builds strength.";
        }
        if (blockSelector === 1) {
            powerWord = "LOVE"; assetSymbol = "🏡";
            kidsLesson = "Love builds home.";
        }
        if (blockSelector === 2) {
            powerWord = "FOCUS"; assetSymbol = "📚";
            kidsLesson = "Focus builds intelligence.";
        }
        if (blockSelector === 3) {
            powerWord = "HEALTH"; assetSymbol = "🏎️";
            kidsLesson = "Health builds energy.";
        }
        if (blockSelector === 4) {
            powerWord = "JOY"; assetSymbol = "🪙";
            kidsLesson = "Joy builds motivation.";
        }
        if (blockSelector === 5) {
            powerWord = "WEALTH"; assetSymbol = "🏰";
            kidsLesson = "Wealth builds future.";
        }

        textToRead = `${kidsLesson}. Grab the ${powerWord} object now!`;

        html += `
        <div class="card sim-gaming-container"
            style="
                border:4px solid #facc15;
                position:relative;
                overflow:hidden;
                animation: snapZoom 1.2s infinite ease-in-out, hyperPulse 1.5s infinite ease-in-out;
            ">

            <div class="flash-overlay"></div>

            <div style="height:180px; position:relative; background:linear-gradient(#bae6fd,#22c55e);">

                <!-- OBJECT -->
                <div style="
                    position:absolute;
                    left:50%;
                    bottom:50px;
                    transform:translateX(-50%);
                    font-size:40px;
                    animation: itemFloat 2s infinite ease-in-out;
                ">
                    ${assetSymbol}
                    <div style="font-size:10px;">${powerWord}</div>
                </div>

                <!-- LEFT AVATAR (STATIC KEEP) -->
                <div style="position:absolute;left:10px;bottom:10px;">
                    MICHAEL
                </div>

                <!-- RIGHT AVATAR -->
                <div style="position:absolute;right:10px;bottom:10px;">
                    ${state.userName.toUpperCase()}
                </div>

            </div>

            <div style="padding:10px;">
                <p style="font-weight:900;">${kidsLesson}</p>
                <p id="shorts-text-target" style="font-size:18px;font-weight:900;color:#facc15;">
                    ${textToRead}
                </p>
            </div>
        </div>
        `;
    }

    /* =========================
       QUIZ MODE
    ========================= */
    if (block.t === "d") {
        html += `<div class="card"><p>${block.q?.en}</p></div>`;
    }

    /* =========================
       DEFAULT BUTTON (NO DEAD TIME)
    ========================= */
    html += `<button id="continueBtn" disabled>...</button>`;

    app.innerHTML = html;

    /* =========================
       NARRATION FLOW (ZERO LATENCY)
    ========================= */
    narrate(textToRead, isAvatarMode, () => {

        if (block.t === "sim") {
            startCountdown(10, nextBlock);
            unlockContinue("SKIP", nextBlock);
            return;
        }

        if (block.t === "br" || block.t === "breath_auto") {
            startCountdown(10, nextBlock);
            unlockContinue("SKIP", nextBlock);
            return;
        }

        if (block.t === "sil") {
            startCountdown(10, nextBlock);
            unlockContinue("SKIP", nextBlock);
            return;
        }

        // ⚡ ZERO DEAD TIME
        requestAnimationFrame(nextBlock);
    });
}

/* =========================
   ANSWERS
========================= */
function selectAnswer(index, correct, explanations) {
    const isCorrect = index === correct;

    const feedback = document.createElement("div");

    feedback.innerHTML = `
        <div class="card">
            <h3>${isCorrect ? "GOOD" : "TRY AGAIN"}</h3>
            <p>${explanations?.[index] || ""}</p>
        </div>
        <button id="continueBtn">NEXT</button>
    `;

    document.getElementById("app").appendChild(feedback);

    unlockContinue("NEXT", nextBlock);
}

/* =========================
   FLOW CONTROL
========================= */
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

function unlockContinue(label, action) {
    const btn = document.getElementById("continueBtn");
    if (btn) {
        btn.disabled = false;
        btn.innerText = label;
        btn.onclick = action;
    }
}
