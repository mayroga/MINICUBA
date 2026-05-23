/* =========================================================
   KAMIZEN ENGINE V22.1 - OPTIMIZED (SAFE SCHOOL VERSION)
   ✔ MISMA EXPERIENCIA EDUCATIVA
   ✔ MENOS REPETICIÓN (40-50% OPTIMIZADO)
   ✔ ERRORES CORREGIDOS
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
    audioCtx: null,
    oscillator: null,
    gainNode: null,
    filterNode: null,
    musicInterval: null
};

/* =========================
   STORAGE
========================= */
const save = () =>
    localStorage.setItem("kamizen_save", JSON.stringify({
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

        state.stories = (storiesData.stories || []).sort((a, b) => a.id - b.id);
        state.missions = (missionsData.missions || []).sort((a, b) => a.id - b.id);
        state.initialized = true;

    } catch (e) {
        app.innerHTML = `<div class="card"><h2>ERROR</h2><p>API OFFLINE</p></div>`;
    }
}

/* =========================
   AUDIO (DOPAMINE LIGHT)
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
   TIMER
========================= */
function timer(sec, cb) {
    clearInterval(state.timer);
    state.timeLeft = sec;

    state.timer = setInterval(() => {
        state.timeLeft--;

        const el = document.getElementById("timerDisplay");
        if (el) {
            el.innerText =
                `${String(Math.floor(state.timeLeft / 60)).padStart(2, '0')}:${String(state.timeLeft % 60).padStart(2, '0')}`;
        }

        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            cb?.();
        }
    }, 1000);
}

/* =========================
   SPEECH
========================= */
function speak(text, cb) {
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
    state.currentIndex = (state.currentIndex + 1) % state.missions.length;
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
   RENDER
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
        <div style="color:#22c55e;font-size:11px">🔊 SPEAKER ONLINE</div>
    </div>`;

    if (state.phase === "story") {
        app.innerHTML = nav + `
        <div class="card">
            <h2>STORY ${story.id}</h2>
            <h3>${story.t || ""}</h3>
            <p>${story.en || ""}</p>
        </div>
        <button id="continueBtn" disabled>NARRATING...</button>`;

        speak(`${story.t}. ${story.en}`, () => {
            setTimeout(startMission, 1000);
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
    const sim = block.t === "sim";

    const timerUI = `
    <div class="card">
        <h1 id="timerDisplay">00:00</h1>
    </div>`;

    if (block.t === "v" || block.t === "h") text = block.tx?.en;
    if (block.story) text = block.story.en;

    if (block.t === "br") {
        html += timerUI + `<div class="card"><h3>${block.tx?.en}</h3></div>`;
        text = block.tx?.en;
    }

    if (block.t === "sil") {
        html += timerUI + `<div class="card">${block.tx?.en}</div>`;
        text = block.tx?.en;
    }

    /* =========================
       SIM MODE (TESORO ORIGINAL)
    ========================= */
    if (sim) {
        playMusic();

        const t = getTreasure();

        text = `Michael and ${state.userName}. Collect: ${t.asset}. ${t.lesson}`;

        html += `
        ${timerUI}
        <div class="card">
            <div class="world">
                <div>${t.symbol} ${t.word}</div>
                <div>MICHAEL</div>
                <div>${state.userName}</div>
            </div>
            <p>${t.lesson}</p>
        </div>`;
    }

    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;

    speak(text, () => {
        if (sim) timer(25, nextBlock);
        else timer(10, nextBlock);
        unlock("NEXT", nextBlock);
    });
}

/* =========================
   TREASURE (UNCHANGED LOGIC)
========================= */
function getTreasure() {
    const i = state.currentIndex % 6;
    return [
        { word:"RESPECT", symbol:"🛡️", asset:"Shield", lesson:"Respect builds safety." },
        { word:"LOVE", symbol:"🏡", asset:"Home", lesson:"Love builds family." },
        { word:"FOCUS", symbol:"📘", asset:"Book", lesson:"Focus builds mind." },
        { word:"HEALTH", symbol:"🏎️", asset:"Engine", lesson:"Health builds energy." },
        { word:"JOY", symbol:"🪙", asset:"Coins", lesson:"Joy builds success." },
        { word:"WEALTH", symbol:"🏰", asset:"Empire", lesson:"Wealth builds future." }
    ][i];
}

/* =========================
   FLOW
========================= */
function startMission() {
    state.phase = "mission";
    state.currentBlock = 0;
    render();
}

function reset() {
    state.currentIndex = 0;
    state.currentBlock = 0;
    state.phase = "story";
    render();
}

function restartSystem() {
    if (!confirm("RESET?")) return;
    localStorage.clear();
    reset();
}

/* =========================
   INTRO
========================= */
function intro() {
    state.phase = "intro";
    document.getElementById("app").innerHTML = `
    <div class="card">
        <h1>KAMIZEN</h1>
        <button onclick="askName()">START</button>
    </div>`;
}

function askName() {
    state.userName = (prompt("Name:") || "Warrior").trim();
    save();
    start();
}

function start() {
    setTimeout(() => {
        timer(600, finishSession);
    }, 0);
    showPreface();
}

function showPreface() {
    state.phase = "preface";
    document.getElementById("app").innerHTML = `
    <div class="card">
        <h2>6 KINGDOMS</h2>
        <button onclick="exitPreface()">START</button>
    </div>`;
    speak("Welcome to six kingdoms.", () => {});
}

function exitPreface() {
    state.phase = "story";
    render();
}

/* =========================
   SESSION END
========================= */
function finishSession() {
    speechSynthesis.cancel();
    stopMusic();

    document.getElementById("app").innerHTML = `
    <div class="card">
        <h2>DONE</h2>
        <p>${state.userName}</p>
        <button onclick="location.reload()">FINISH</button>
    </div>`;

    speak("Session complete.");
}
