/* =========================================================
   KAMIZEN ENGINE V14 - FIXED VERSION WITH ROBLOX LIVE AVATAR
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

// PERSISTENCIA LOCAL
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

// INICIALIZACIÓN
window.addEventListener("load", async () => {
    loadProgress();
    await loadAllData();
    injectStyles();
    showIntro();
});

async function loadAllData() {
    const app = document.getElementById("app");
    app.innerHTML = `<div class="card"><h2>SYSTEM BOOTING...</h2><p>Loading Data (Missions 57-63)...</p></div>`;
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

function startMasterTimer() {
    state.sessionStartTime = Date.now();
    setTimeout(() => {
        finishSession();
    }, 10 * 60 * 1000);
}

function finishSession() {
    window.speechSynthesis.cancel();
    clearInterval(state.timer);
    const currentMissionId = state.missions[state.currentIndex]?.id || 0;
    
    if (typeof renderValidationScreen === "function") {
        renderValidationScreen(currentMissionId, { timeSpent: "10:00", status: "Complete" });
    } else {
        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="card center animated fadeIn">
                <h2>🌟 GREAT JOB TODAY</h2>
                <p>You completed your KAMIZEN session successfully.</p>
                <button onclick="location.reload()" style="margin-top:20px;">FINISH SESSION</button>
            </div>`;
        narrate("Great job today. You completed your Kamizen session successfully.");
    }
}

// NAVEGACIÓN
function jumpToBlock() {
    const targetMissionId = prompt("Enter the MISSION ID to jump to (57-63):");
    if (targetMissionId) {
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
            alert("Mission ID not found.");
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

// NARRACIÓN RÁPIDA ESTILO YOUTUBE SHORTS (1.25x + PITCH)
function narrate(text, callback) {
    if (!text) { if (callback) callback(); return; }
    state.speechLocked = true;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 1.25; 
    speech.pitch = 1.1; 
    
    speech.onend = () => { 
        state.speechLocked = false; 
        if (callback) callback(); 
    };
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
            <p>Training • Awareness • Control</p>
            <button onclick="startSystem()">CONTINUE MISSION</button>
            <button onclick="restartSystem()" style="background:red; margin-top:10px;">RESET PROGRESS</button>
        </div>
    `;
}

function startSystem() {
    startMasterTimer();
    state.phase = "story";
    render();
}

function nextBlock() {
    state.currentBlock++;
    render();
}

function nextStory() {
    state.currentIndex++;
    state.currentBlock = 0;
    state.phase = "story";
    render();
}

// MOTOR DE RENDERIZADO PRINCIPAL
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
        <div style="display:flex; gap:5px; margin-bottom:10px;">
            <button onclick="goBack()" style="flex:1; padding:8px; font-size:12px; background:#334155; color:white; border:none; border-radius:5px; cursor:pointer;">BACK</button>
            <button onclick="jumpToBlock()" style="flex:1; padding:8px; font-size:12px; background:#0ea5e9; color:white; border:none; border-radius:5px; cursor:pointer;">JUMP/SKIP</button>
            <button onclick="restartSystem()" style="flex:1; padding:8px; font-size:12px; background:red; color:white; border:none; border-radius:5px; cursor:pointer;">RESET</button>
        </div>
    `;

    if (state.phase === "story") {
        app.innerHTML = navHeader + `
            <div class="card" style="background:#1e293b; padding:20px; border-radius:10px; color:white;">
                <h2 style="color:#0ea5e9">STORY ${story.id}</h2>
                <h3>${story.t || ""}</h3>
                <p style="font-size:1.1rem; line-height:1.6;">${story.en || ""}</p>
            </div>
            <button id="continueBtn" style="width:100%; margin-top:10px; padding:12px; background:#475569; color:white; border:none; border-radius:5px;" disabled>NARRATING...</button>
        `;
        narrate(`${story.t}. ${story.en}`, () => {
            state.phase = "mission";
            setTimeout(render, 1200);
        });
    } else {
        const block = mission.b[state.currentBlock];
        if (!block) { nextStory(); return; }
        renderBlock(block, navHeader);
    }
}

// RENDERIZADO DE BLOQUES COMPATIBLE CON ROBLOX AVATAR INJECTION
function renderBlock(block, navHeader) {
    const app = document.getElementById("app");
    let html = navHeader;
    let textToRead = "";

    const timerUI = `
        <div class="card center" style="border: 3px solid #0ea5e9; background: #0f172a; margin-bottom: 10px; padding: 10px; border-radius:10px; text-align:center;">
            <h1 id="timerDisplay" style="font-size:2.5rem; margin:0; font-family: monospace; color:white;">00:00</h1>
        </div>
    `;
    
    if (block.t === "v" || block.t === "h") { 
        html += `<div class="card" style="background:#1e293b; padding:20px; border-radius:10px; color:white; margin-bottom:10px;"><h2>${block.tx?.en || ""}</h2></div>`; 
        textToRead = block.tx?.en; 
    }
    if (block.story) { 
        html += `<div class="card" style="background:#1e293b; padding:20px; border-radius:10px; color:white; margin-bottom:10px;"><p>${block.story.en || ""}</p></div>`; 
        textToRead = block.story.en; 
    }
    
    if (block.t === "breath_auto" || block.t === "br") {
        html += timerUI + `<div class="card center" style="background:#1e293b; padding:20px; border-radius:10px; color:white; text-align:center;"><h3>${block.tx?.en || ""}</h3><p>${block.inf?.en || ""}</p></div>`;
        textToRead = `${block.tx?.en}. ${block.inf?.en}.`;
    }
    
    if (block.t === "sil") {
        html += timerUI + `<div class="card" style="background:#1e293b; padding:20px; border-radius:10px; color:white; text-align:center;"><h3>${block.tx?.en || ""}</h3><p>${block.inf?.en || ""}</p></div>`;
        textToRead = `${block.tx?.en}. ${block.inf?.en}.`;
    }

    if (block.t === "d") {
        let optionsHTML = "";
        if (block.op) {
            block.op.forEach((opt, index) => {
                optionsHTML += `<button onclick="checkAnswer(${index}, ${block.c})" style="width:100%; margin-top:8px; padding:10px; background:#334155; color:white; border:none; border-radius:5px; text-align:left; cursor:pointer;">${opt}</button>`;
            });
        }
        html += `<div class="card" style="background:#1e293b; padding:20px; border-radius:10px; color:white;"><h3>${block.q?.en || ""}</h3><div style="margin-top:15px;">${optionsHTML}</div></div>`;
        textToRead = block.q?.en;
    }

    if (block.t === "r") {
        html += `<div class="card center" style="background:#10b981; padding:20px; border-radius:10px; color:white; text-align:center;"><h2>${block.tx || ""}</h2><p>+${block.p || 0} XP Points</p></div>`;
        textToRead = `${block.tx}. Reward Unlocked.`;
    }
    
    // INTEGRACIÓN ROBLOX GAMING AVATAR INTERFACE
    if (block.t === "sim") {
        html += timerUI + `
            <div class="card sim-gaming-container" style="border: 3px solid #0ea5e9; background: linear-gradient(180deg, #0f172a 0%, #020617 100%); padding: 15px; border-radius: 20px; text-align: center; position: relative; color:white;">
                <div style="position: absolute; top: 12px; left: 15px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace;">🔴 LIVE SHORTS</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #0ea5e9; font-family: monospace; font-weight: bold;">⚡ SPEED: 1.25x</div>

                <div class="avatar-roblox-box" style="width: 130px; height: 130px; margin: 25px auto 15px auto; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); border: 4px solid #0ea5e9; border-radius: 25px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden;">
                    <div class="roblox-character" style="width: 60px; height: 90px; position: relative; display: flex; flex-direction: column; align-items: center; animation: robloxBounce 0.4s infinite alternate;">
                        <div style="width: 24px; height: 24px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; position: relative; z-index: 3;">
                            <div style="position: absolute; top: 5px; left: 4px; width: 4px; height: 5px; background: #000;"></div>
                            <div style="position: absolute; top: 5px; right: 4px; width: 4px; height: 5px; background: #000;"></div>
                            <div style="position: absolute; bottom: 4px; left: 7px; width: 8px; height: 3px; background: #000; border-radius: 1px;"></div>
                        </div>
                        <div style="position: absolute; top: -3px; width: 30px; height: 7px; background: #3b82f6; border-radius: 2px; z-index: 4; border: 1px solid #000;"></div>
                        <div style="width: 42px; height: 36px; background: #3b82f6; border: 2px solid #000; border-radius: 2px; margin-top: -2px; position: relative; z-index: 2; display: flex; justify-content: center; align-items: center;">
                            <div style="font-size: 10px; font-weight: bold; color: white;">⚡</div>
                        </div>
                        <div style="position: absolute; left: -10px; top: 24px; width: 9px; height: 32px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: robloxArm 0.3s infinite alternate;"></div>
                        <div style="position: absolute; right: -10px; top: 24px; width: 9px; height: 32px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: robloxArm 0.3s infinite alternate-reverse;"></div>
                    </div>
                </div>
                <p style="font-size: 14px; color: #e2e8f0; line-height: 1.5; text-align: left; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 10px; border: 1px solid #334155;">
                    ${block.sub?.en || ""}
                </p>
            </div>
        `;
        textToRead = block.sub?.en;
    }

    app.innerHTML = html;

    // INICIAR CONTEO DE TIEMPO Y DISPARAR NARRADOR SHORTS
    if (block.d) {
        startCountdown(block.d, () => {
            nextBlock();
        });
    }

    narrate(textToRead);
}

function checkAnswer(selected, correct) {
    if (selected === correct) {
        alert("🎯 CORRECT CODE OPTIMIZATION!");
        nextBlock();
    } else {
        alert("❌ GLITCH DETECTED. TRY AGAIN.");
    }
}

// INYECCIÓN DINÁMICA DE ANIMACIONES CSS PARA EL AVATAR ROBLOX BOUNCE
function injectStyles() {
    if (!document.getElementById("roblox-styles")) {
        const style = document.createElement("style");
        style.id = "roblox-styles";
        style.innerHTML = `
            @keyframes robloxBounce {
                0% { transform: translateY(0px); }
                100% { transform: translateY(-8px); }
            }
            @keyframes robloxArm {
                0% { transform: rotate(-15deg); }
                100% { transform: rotate(25deg); }
            }
        `;
        document.head.appendChild(style);
    }
}
