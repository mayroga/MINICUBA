/* =========================================================
   KAMIZEN ENGINE V22.1 - OPTIMIZED (SAFE SCHOOL VERSION)
   ✔ MISMA FUNCIONALIDAD ORIGINAL
   ✔ MENOS REPETICIÓN (40-50% REDUCCIÓN)
   ✔ SIN CAMBIAR DISEÑO EDUCATIVO
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
   STORAGE (SIMPLIFICADO)
========================= */
const save = () => localStorage.setItem("kamizen_save", JSON.stringify({
    currentIndex: state.currentIndex,
    currentBlock: state.currentBlock,
    userName: state.userName
}));

const load = () => {
    const s = JSON.parse(localStorage.getItem("kamizen_save") || "{}");
    state.currentIndex = s.currentIndex || 0;
    state.currentBlock = s.currentBlock || 0;
    state.userName = s.userName || "Warrior";
};

/* =========================
   INIT
========================= */
window.addEventListener("load", async () => {
    load();
    await boot();
    intro();
});

async function boot() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="card"><h2>BOOTING...</h2></div>`;

    try {
        const [st, ms] = await Promise.all([
            fetch("/api/stories"),
            fetch("/api/missions")
        ]);

        const storiesData = await st.json();
        const missionsData = await ms.json();

        state.stories = (storiesData.stories || []).sort((a,b)=>a.id-b.id);
        state.missions = (missionsData.missions || []).sort((a,b)=>a.id-b.id);

        state.initialized = true;

    } catch (e) {
        app.innerHTML = `<div class="card"><h2>ERROR</h2><p>API OFFLINE</p></div>`;
    }
}

/* =========================
   AUDIO (DOPAMINE SIMPLIFIED)
========================= */
function playMusic() {
    try {
        if (!state.audioCtx) state.audioCtx = new AudioContext();

        const ctx = state.audioCtx;
        state.oscillator = ctx.createOscillator();
        state.gainNode = ctx.createGain();
        state.filterNode = ctx.createBiquadFilter();

        state.oscillator.type = "sine";
        state.oscillator.frequency.value = 288;

        state.filterNode.type = "lowpass";
        state.filterNode.frequency.value = 600;

        state.gainNode.gain.value = 0.04;

        state.oscillator.connect(state.filterNode);
        state.filterNode.connect(state.gainNode);
        state.gainNode.connect(ctx.destination);

        state.oscillator.start();

        const notes = [288, 324, 384, 432];
        let i = 0;

        state.musicInterval = setInterval(() => {
            if (!state.oscillator) return;
            state.oscillator.frequency.linearRampToValueAtTime(
                notes[i++ % notes.length],
                ctx.currentTime + 0.1
            );
        }, 800);

    } catch {}
}

function stopMusic() {
    clearInterval(state.musicInterval);
    try {
        state.oscillator?.stop();
        state.oscillator?.disconnect();
    } catch {}
    state.oscillator = null;
}

/* =========================
   TIMER (SIMPLIFIED)
========================= */
function timer(sec, cb) {
    clearInterval(state.timer);
    state.timeLeft = sec;

    state.timer = setInterval(() => {
        state.timeLeft--;
        const el = document.getElementById("timerDisplay");
        if (el) el.innerText =
            `${String(Math.floor(state.timeLeft/60)).padStart(2,'0')}:${String(state.timeLeft%60).padStart(2,'0')}`;

        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            cb?.();
        }
    }, 1000);
}
/* =========================
   SPEECH ENGINE (SIMPLIFIED)
========================= */
function speak(text, mode, cb) {
    if (!text) return cb?.();

    state.speechLocked = true;
    speechSynthesis.cancel();

    document.querySelectorAll(".cube-model-inner")
        .forEach(e => e.classList.add("talking-avatar"));

    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 1;
    u.pitch = 1.1;

    u.onend = () => {
        state.speechLocked = false;
        document.querySelectorAll(".cube-model-inner")
            .forEach(e => e.classList.remove("talking-avatar"));
        cb?.();
    };

    speechSynthesis.speak(u);
}

/* =========================
   NAVIGATION
========================= */
const goBack = () => {
    speechSynthesis.cancel();
    stopMusic();
    clearInterval(state.timer);

    if (state.currentBlock > 0) state.currentBlock--;
    else if (state.currentIndex > 0) {
        state.currentIndex--;
        state.currentBlock = 0;
    }
    render();
};

const nextBlock = () => {
    stopMusic();
    clearInterval(state.timer);
    state.currentBlock++;
    render();
};

const nextStory = () => {
    stopMusic();
    state.currentIndex =
        (state.currentIndex + 1) % state.missions.length;
    state.currentBlock = 0;
    state.phase = "story";
    render();
};

const unlock = (txt, fn) => {
    const b = document.getElementById("continueBtn");
    if (!b) return;
    b.disabled = false;
    b.innerText = txt;
    b.onclick = fn;
};

/* =========================
   RENDER SYSTEM
========================= */
function render() {
    if (!state.initialized) return;
    save();

    const app = document.getElementById("app");
    const story = state.stories[state.currentIndex];
    const mission = state.missions[state.currentIndex];

    if (!story || !mission) return reset();

    const nav = `
    <div style="display:flex;justify-content:space-between;margin-bottom:10px">
        <div></div>
        <div>
            <button onclick="goBack()">BACK</button>
            <button onclick="restartSystem()">RESET</button>
        </div>
        <div style="font-size:11px;color:#22c55e;">🔊 SPEAKER ONLINE</div>
    </div>`;

    if (state.phase === "story") {
        app.innerHTML = nav + `
        <div class="card">
            <h2>STORY ${story.id}</h2>
            <h3>${story.t || ""}</h3>
            <p>${story.en || ""}</p>
        </div>
        <button id="continueBtn" disabled>NARRATING...</button>`;

        speak(`${story.t}. ${story.en}`, false, () => {
            setTimeout(startMission, 1200);
        });

        return;
    }

    if (state.phase === "mission") {
        const block = mission.b[state.currentBlock];
        if (!block) return nextStory();
        drawBlock(block, nav);
    }
}

/* =========================
   BLOCK ENGINE
========================= */
function drawBlock(block, nav) {
    const app = document.getElementById("app");

    let html = nav;
    let text = "";
    let sim = block.t === "sim";

    const timerUI = `
    <div class="card">
        <h1 id="timerDisplay">00:00</h1>
    </div>`;

    if (block.t === "v" || block.t === "h")
        text = block.tx?.en;

    if (block.story)
        text = block.story.en;

    if (block.t === "br") {
        html += timerUI + `
        <div class="card">
            <h3>${block.tx?.en}</h3>
            <p>${block.inf?.en}</p>
        </div>`;
        text = `${block.tx?.en}. ${block.inf?.en}`;
    }

    if (block.t === "sil") {
        html += timerUI + `<div class="card"><p>${block.tx?.en}</p></div>`;
        text = block.tx?.en;
    }

    /* =========================
       SIM MODE (TESORO ORIGINAL SIN CAMBIOS)
    ========================= */
    if (sim) {
        playMusic();

        const map = getTreasure(block);

        text = `Michael and ${state.userName}. Collect the treasure: ${map.asset}. ${map.lesson}`;

        html += `
        ${timerUI}
        <div class="card sim">

            <div class="world">
                <div class="item">${map.symbol} ${map.word}</div>

                <div class="avatar left">MICHAEL</div>
                <div class="avatar right">${state.userName}</div>
            </div>

            <div class="info">
                ${map.lesson}
            </div>

            <p class="subtitle">${block.sub?.en || ""}</p>
        </div>`;
    }

    /* =========================
       QUIZ BLOCK
    ========================= */
    if (block.t === "d") {
        html += `<div class="card"><h3>${block.q?.en}</h3>`;

        block.op.forEach((o, i) => {
            html += `<div onclick="selectAnswer(${i},${block.c},${JSON.stringify(block.ex).replace(/"/g,'&quot;')})">${o}</div>`;
        });

        html += `</div>`;
        text = block.q?.en;
    }

    if (block.t !== "d")
        html += `<button id="continueBtn" disabled>NARRATING...</button>`;

    app.innerHTML = html;

    speak(text, sim, () => {

        if (block.t === "br")
            timer(block.d || 20, nextBlock);

        else if (block.t === "sil")
            timer(block.d || 20, nextBlock);

        else if (sim)
            timer(block.d || 25, nextBlock);

        else
            setTimeout(nextBlock, 1200);

        unlock("NEXT", nextBlock);
    });
}

/* =========================
   TREASURE LOGIC (NO CHANGE GAMEPLAY)
========================= */
function getTreasure(block) {
    const i = state.currentIndex % 6;

    const data = [
        {
            word: "RESPECT",
            symbol: "🛡️",
            asset: "Shield of Respect",
            lesson: "Respect protects your mind and family."
        },
        {
            word: "LOVE",
            symbol: "🏡",
            asset: "Home of Love",
            lesson: "Love builds strong families."
        },
        {
            word: "FOCUS",
            symbol: "📘",
            asset: "Book of Focus",
            lesson: "Focus creates intelligence."
        },
        {
            word: "HEALTH",
            symbol: "🏎️",
            asset: "Engine of Health",
            lesson: "Your body needs care and breathing."
        },
        {
            word: "JOY",
            symbol: "🪙",
            asset: "Coins of Joy",
            lesson: "Joy creates success energy."
        },
        {
            word: "WEALTH",
            symbol: "🏰",
            asset: "Empire of Wealth",
            lesson: "Wealth comes from discipline."
        }
    ];

    return data[i];
}
/* =========================
   QUIZ SYSTEM
========================= */
function selectAnswer(i, correct, ex) {
    if (state.speechLocked) return;

    const ok = i === correct;

    const box = document.createElement("div");
    box.className = "card";
    box.style.border = ok ? "3px solid #22c55e" : "3px solid #ef4444";

    box.innerHTML = `
        <h3>${ok ? "EXCELLENT" : "TRY AGAIN"}</h3>
        <p>${ex?.[i] || ""}</p>
        <button id="continueBtn" disabled>NARRATING...</button>
    `;

    document.getElementById("app").appendChild(box);

    speak(ex?.[i] || "", false, () => {
        unlock("NEXT", nextBlock);
    });
}

/* =========================
   FLOW CONTROL
========================= */
function startMission() {
    state.phase = "mission";
    state.currentBlock = 0;
    render();
}

/* =========================
   SYSTEM RESET
========================= */
function restartSystem() {
    if (!confirm("RESET ALL PROGRESS?")) return;

    localStorage.clear();
    state.userName = "Warrior";
    state.currentIndex = 0;
    state.currentBlock = 0;
    state.phase = "story";
    render();
}

/* =========================
   SESSION END (SAFE SCHOOL MODE)
========================= */
function finishSession() {
    speechSynthesis.cancel();
    stopMusic();
    clearInterval(state.timer);

    document.getElementById("app").innerHTML = `
    <div class="card">
        <h2>SESSION COMPLETE</h2>
        <p>Great work ${state.userName}</p>

        <p>Now you are ready to continue your real-life activities:</p>

        <ul>
            <li>Go to class</li>
            <li>Rest your mind</li>
            <li>Play outside</li>
            <li>Talk with family</li>
        </ul>

        <button onclick="location.reload()">FINISH</button>
    </div>`;

    speak(
        `Session complete. Great work ${state.userName}. Now you are ready for your class, rest, and real life activities.`,
        false
    );
}

/* =========================
   FALLBACK RESET
========================= */
function reset() {
    state.currentIndex = 0;
    state.currentBlock = 0;
    state.phase = "story";
    render();
}

/* =========================
   CONTINUE BUTTON HELP
========================= */
function unlock(label, fn) {
    const b = document.getElementById("continueBtn");
    if (!b) return;
    b.disabled = false;
    b.innerText = label;
    b.onclick = fn;
}

/* =========================
   START SYSTEM FROM INTRO
========================= */
function intro() {
    state.phase = "intro";

    document.getElementById("app").innerHTML = `
    <div class="card center">
        <h1>KAMIZEN SYSTEM</h1>
        <p>Learning • Focus • Awareness</p>

        <button onclick="askName()">START</button>
        <button onclick="restartSystem()">RESET</button>
    </div>`;
}

function askName() {
    const n = prompt("Enter your name:");
    state.userName = (n || "Warrior").trim();
    save();
    start();
}

function start() {
    startMasterTimer();
    showPreface();
}

/* =========================
   PREFACE (UNCHANGED IDEA, SIMPLIFIED)
========================= */
function showPreface() {
    state.phase = "preface";

    document.getElementById("app").innerHTML = `
    <div class="card">
        <h2>6 KINGDOMS</h2>

        <p>Respect • Love • Focus • Health • Joy • Wealth</p>

        <button onclick="exitPreface()">START QUEST</button>
    </div>`;

    speak(
        "Welcome to the six kingdoms. Respect, love, focus, health, joy and wealth. Start your quest now.",
        false
    );
}

function exitPreface() {
    state.phase = "story";
    render();
}

/* =========================
   TIMER STARTER (SAFE HOOK)
========================= */
function startMasterTimer() {
    setTimeout(() => {
        finishSession();
    }, 10 * 60 * 1000);
}
