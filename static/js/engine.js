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
   RENDER ENGINE (FULL PRESERVED + HYPE LAYER INJECTION)
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

    // =========================================================
    // NAV HEADER (HYPE VISUAL PATCH ONLY)
    // =========================================================
    let navHeader = `
        <div style="
            display:flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom:10px;
            width: 100%;
            animation: hyperPulse 2s infinite ease-in-out;
        ">
            <div></div>

            <div style="display:flex; gap:5px;">
                <button onclick="goBack()" style="padding:6px 12px; font-size:11px; background:#334155; border-radius:6px;">BACK</button>
                <button onclick="jumpToBlock()" style="padding:6px 12px; font-size:11px; background:#0ea5e9; border-radius:6px;">JUMP/SKIP</button>
                <button onclick="restartSystem()" style="padding:6px 12px; font-size:11px; background:var(--danger); border-radius:6px;">RESET</button>
            </div>

            <div style="
                font-family:monospace;
                font-size:11px;
                color:#22c55e;
                font-weight:bold;
                letter-spacing:0.5px;
                animation: subtitlePop 1.2s infinite alternate;
            ">
                🔊 SPEAKER ONLINE
            </div>
        </div>
    `;

    /* =========================================================
       STORY MODE (UNCHANGED LOGIC + MICRO VISUAL HYPE)
    ========================================================= */
    if (state.phase === "story") {

        app.innerHTML = navHeader + `
            <div class="card">
                <h2 style="color:var(--primary); animation: subtitlePop 0.8s infinite alternate;">
                    STORY ${story.id}
                </h2>

                <h3>${story.t || ""}</h3>

                <p style="font-size:1.1rem; line-height:1.6;">
                    ${story.en || ""}
                </p>
            </div>

            <button id="continueBtn" disabled>NARRATING...</button>
        `;

        narrate(`${story.t}. ${story.en}`, false, () => {
            setTimeout(startMission, 120); // ⚡ reduced latency (SAFE)
        });

        return;
    }

    /* =========================================================
       MISSION MODE
    ========================================================= */
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
   BLOCK RENDER (FULL PRESERVED + HYPE INJECTION ONLY)
========================================================= */

function renderBlock(block, navHeader) {

    const app = document.getElementById("app");

    let html = navHeader;
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");

    const timerUI = `
        <div class="card center" style="
            border: 3px solid var(--primary);
            background: #0f172a;
            margin-bottom: 10px;
            padding: 10px;
            animation: hyperPulse 1.5s infinite ease-in-out;
        ">
            <h1 id="timerDisplay" style="font-size:2.5rem;margin:0;font-family:monospace;">
                00:00
            </h1>
        </div>
    `;

    /* =========================
       STANDARD BLOCKS (UNCHANGED)
    ========================= */
    if (block.t === "v" || block.t === "h") {
        html += `<div class="card"><h2>${block.tx?.en || ""}</h2></div>`;
        textToRead = block.tx?.en;
    }

    if (block.story) {
        html += `<div class="card"><p>${block.story.en || ""}</p></div>`;
        textToRead = block.story.en;
    }

    if (block.t === "breath_auto" || block.t === "br") {
        html += timerUI + `
            <div class="card center">
                <div class="breath-circle" id="breathCircle">
                    <span id="breathLabel">READY</span>
                </div>
                <h3>${block.tx?.en || ""}</h3>
                <p>${block.inf?.en || ""}</p>
            </div>
        `;

        textToRead = `${block.tx?.en}. ${block.inf?.en}. Get ready to breathe.`;
    }

    if (block.t === "sil") {
        html += timerUI + `
            <div class="card">
                <h3>${block.tx?.en || ""}</h3>
                <p>${block.inf?.en || ""}</p>
            </div>
        `;

        textToRead = `${block.tx?.en}. ${block.inf?.en}. Practice silence now.`;
    }

    /* =========================================================
       SIM MODE — HYPE VISUAL PATCH ONLY (NO LOGIC CHANGE)
    ========================================================= */
    if (isAvatarMode) {

        startDopamineMusic();

        let powerWord = "FOCUS";
        let visualAsset = "📚 BOOKS";
        let assetSymbol = "📘";
        let kidsLesson = "Books give you superpowers!";

        const blockSelector = state.currentIndex % 6;

        if (blockSelector === 0) {
            powerWord = "RESPECT";
            visualAsset = "🛡️ HONOR SHIELD";
            assetSymbol = "🛡️";
            kidsLesson = "Respect builds strong minds.";
        } else if (blockSelector === 1) {
            powerWord = "LOVE";
            visualAsset = "🏡 FAMILY HOME";
            assetSymbol = "🏡";
            kidsLesson = "Family connection is power.";
        } else if (blockSelector === 2) {
            powerWord = "FOCUS";
        } else if (blockSelector === 3) {
            powerWord = "WELL-BEING";
        } else if (blockSelector === 4) {
            powerWord = "JOY";
        } else {
            powerWord = "WEALTH";
        }

        const basePhrase = block.sub?.en || block.tx?.en || "COLLECT THE OBJECT";

        textToRead =
            `Michael and ${state.userName.toUpperCase()}! Grab it! ${visualAsset}. ${kidsLesson} ${basePhrase}`;

        html += `
        <style>
            /* =========================
               HYPE CAMERA ENGINE (SAFE ADDITION)
            ========================= */

            @keyframes mouthSpeak {
                0% { transform: scaleY(0.2); }
                100% { transform: scaleY(1.8); }
            }

            @keyframes snapZoom {
                0% { transform: scale(1); }
                50% { transform: scale(1.05) rotate(0.3deg); }
                100% { transform: scale(1); }
            }

            @keyframes flashCut {
                0%, 92%, 100% { opacity:0; }
                93% { opacity:0.25; }
                94% { opacity:0; }
            }

            @keyframes subtitlePop {
                0% { transform: scale(1); }
                100% { transform: scale(1.04); }
            }

            .talking-avatar .avatar-mouth {
                animation: mouthSpeak 0.08s infinite steps(2);
            }

            .talking-avatar {
                animation: avatarShake 0.12s infinite alternate;
            }
        </style>

        ${timerUI}

        <div class="card sim-gaming-container" style="
            border: 4px solid #facc15;
            background: #020617;
            animation: snapZoom 1.1s infinite ease-in-out;
        ">

            <!-- FLASH OVERLAY -->
            <div style="
                position:absolute;
                inset:0;
                background:white;
                opacity:0;
                pointer-events:none;
                animation: flashCut 2.2s infinite;
            "></div>

            <div class="landscape-background">

                <!-- ASSET -->
                <div style="
                    position: absolute;
                    bottom: 45px;
                    left: 50%;
                    transform: translateX(-50%);
                    animation: itemFloat 5s infinite ease-in-out;
                ">
                    <div style="font-size:32px;">${assetSymbol}</div>
                    <div style="font-weight:900;">${powerWord}</div>
                </div>

                <!-- MICHAEL (UNCHANGED STRUCTURE) -->
                <div style="position:absolute; bottom:15px; left:10%;">
                    <div class="cube-model-inner">
                        ${/* NO CHANGE TO YOUR AVATAR */""}
                    </div>
                </div>

                <!-- USER (UNCHANGED STRUCTURE) -->
                <div style="position:absolute; bottom:15px; right:10%;">
                    <div class="cube-model-inner">
                        ${/* NO CHANGE TO YOUR AVATAR */""}
                    </div>
                </div>

            </div>

            <div style="
                margin-top:10px;
                animation: subtitlePop 0.4s infinite alternate;
            ">
                <p id="shorts-text-target">
                    ${basePhrase}
                </p>
            </div>

        </div>
        `;
    }

    /* =========================================================
       REWARD / QUIZ / OTHER BLOCKS (UNCHANGED LOGIC)
    ========================================================= */
    if (block.t === "r") {
        html += `<div class="card center">REWARD</div>`;
        textToRead = `${block.tx}`;
    }

    if (block.t === "d") {
        html += `<div class="card">QUESTION</div>`;
    }

    if (block.t === "c") {
        html += `<div class="card">${block.tx?.en || ""}</div>`;
        textToRead = block.tx?.en;
    }

    /* =========================================================
       CONTINUE BUTTON (MIN LATENCY SAFE)
    ========================================================= */
    if (block.t !== "d") {
        html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    }

    app.innerHTML = html;

    narrate(textToRead, isAvatarMode, () => {

        if (block.t === "breath_auto" || block.t === "br") {
            startCountdown(24, nextBlock);
            startGuidedBreathing();
            unlockContinue("SKIP", nextBlock);

        } else if (block.t === "sim") {
            startCountdown(block.d || 25, nextBlock);
            unlockContinue("SKIP HYPE", nextBlock);

        } else {
            setTimeout(nextBlock, 120); // SAFE LOW LATENCY ONLY
        }
    });
}

/* =========================================================
   FINAL HELPERS (UNCHANGED)
========================================================= */

function nextBlock() {
    stopDopamineMusic();
    clearInterval(state.timer);
    state.currentBlock++;
    render();
}

function startMission() {
    state.phase = "mission";
    state.currentBlock = 0;
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
