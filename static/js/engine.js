/* =========================================================
   MAYKAMI NEUROGAME ENGINE - ALL RIGHTS RESERVED
   ========================================================= */

const state = {
    userName: localStorage.getItem('user_name') || 'PLAYER',
    phase: 'story',
    currentIndex: 0,
    currentBlock: 0,
    missions: [],
    timer: null,
    timeLeft: 0,
    speechLocked: false
};

const synth = window.speechSynthesis;
let currentUtterance = null;
let dopamineInterval = null;
let audioCtx = null;

// Inicialización de Audio de Fondos Frecuenciales Básicos
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playDopamineMusic() {
    try {
        initAudio();
        if (!audioCtx) return;
        stopDopamineMusic();
        dopamineInterval = setInterval(() => {
            let osc = audioCtx.createOscillator();
            let gain = audioCtx.createGain();
            osc.type = 'sine';
            // Frecuencia armónica de enfoque (alrededor de 432Hz y variaciones integradas)
            osc.frequency.setValueAtTime(432 + Math.random() * 20, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 1.5);
        }, 2000);
    } catch (e) { console.log(e); }
}

function stopDopamineMusic() {
    if (dopamineInterval) { clearInterval(dopamineInterval); dopamineInterval = null; }
}

// Lógica Unificada de Narración
function narrate(text, isAvatarMode, callback) {
    synth.cancel();
    state.speechLocked = true;
    
    if (isAvatarMode) playDopamineMusic();
    else stopDopamineMusic();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    
    utterance.onend = () => {
        state.speechLocked = false;
        if (callback) callback();
    };
    
    utterance.onerror = () => {
        state.speechLocked = false;
        if (callback) callback();
    };
    
    currentUtterance = utterance;
    synth.speak(utterance);
}

// Contador Global Sincronizado Instantáneo
function startCountdown(seconds, callback) {
    clearInterval(state.timer);
    state.timeLeft = seconds;
    const display = document.getElementById("timerDisplay");
    if (display) display.innerText = state.timeLeft;
    
    state.timer = setInterval(() => {
        state.timeLeft--;
        const displayLive = document.getElementById("timerDisplay");
        if (displayLive) displayLive.innerText = state.timeLeft;
        
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            if (callback) callback();
        }
    }, 1000);
}

// Carga Inicial de Datos de Misiones
document.addEventListener("DOMContentLoaded", () => {
    fetch('/static/data/missions.json')
        .then(res => res.json())
        .then(data => {
            state.missions = data;
            render();
        }).catch(err => console.error("Error loading missions:", err));
});

// Renderizador Central de Pantallas y Bloques Dinámicos
function render() {
    const app = document.getElementById("app");
    if (!app || !state.missions.length) return;

    const currentMission = state.missions[state.currentIndex];
    
    // PANTALLA 1: INTRODUCCIÓN DE LA HISTORIA
    if (state.phase === "story") {
        stopDopamineMusic();
        clearInterval(state.timer);
        
        app.innerHTML = `
            <div class="card center" style="width:100%; box-sizing:border-box;">
                <h2 style="color:#0ea5e9; text-transform:uppercase; font-size:1.5rem; margin-bottom:10px;">${currentMission.story.title}</h2>
                <p style="font-size:1.05rem; line-height:1.5; color:#f8fafc;">${currentMission.story.text}</p>
                <button id="continueBtn" style="margin-top:20px;">START ADVENTURE</button>
            </div>
        `;
        
        narrate(currentMission.story.text, false, () => {
            const btn = document.getElementById("continueBtn");
            if (btn) btn.onclick = startMission;
        });
        return;
    }

    // PANTALLA 2: EJECUCIÓN DE BLOQUES DE LA MISIÓN
    if (state.currentBlock >= currentMission.blocks.length) {
        app.innerHTML = `
            <div class="card center" style="width:100%; box-sizing:border-box;">
                <h2 style="color:#22c55e; text-transform:uppercase;">MISSION ACCOMPLISHED!</h2>
                <p style="margin:15px 0; color:#cbd5e1;">You have integrated this knowledge core successfully.</p>
                <button onclick="nextStory()">NEXT CORE</button>
            </div>
        `;
        narrate("Mission completed successfully! Excellent progress.", false);
        return;
    }

    const block = currentMission.blocks[state.currentBlock];
    let html = "";
    let textToRead = "";
    let isAvatarMode = (block.t === "breath_auto" || block.t === "br" || block.t === "sil" || block.t === "sim");

    // Construcción del UI del Temporizador si se requiere
    let timerUI = "";
    if (isAvatarMode) {
        let initialTime = block.t === "sim" ? (block.d || 30) : (block.d || 24);
        timerUI = `
            <div class="timer-badge" style="
                background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
                border: 2px solid #facc15;
                color: white;
                font-size: 24px;
                font-weight: 900;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto -15px auto;
                position: relative;
                z-index: 99;
                box-shadow: 0 4px 10px rgba(239, 68, 68, 0.5);
                font-family: monospace;
            " id="timerDisplay">${initialTime}</div>
        `;
    }

    // PROCESAMIENTO SEGÚN EL TIPO DE BLOQUE (A: Respiración, B: Silencio, C: Simulación, R: Recompensa, D: Pregunta, C: Texto)
    if (block.t === "breath_auto" || block.t === "br") {
        html += timerUI + `
            <div class="card center" style="width:100%; box-sizing:border-box; border: 3px solid #0ea5e9;">
                <h2 style="color:#0ea5e9; font-size:1.4rem; text-transform:uppercase;">${block.tx?.en || "BREATHING PROTOCOL"}</h2>
                <div id="breathCircle" style="width:100px; height:100px; background:radial-gradient(circle, #38bdf8 0%, #0284c7 100%); border-radius:50%; margin:30px auto; box-shadow:0 0 20px #0ea5e9; transform:scale(1);"></div>
                <h3 id="breathLabel" style="color:#fff; font-family:monospace; letter-spacing:2px;">READY</h3>
            </div>
        `;
        textToRead = block.tx?.en || "Follow the visual guide. Inhale and exhale deeply.";
    } 
    
    else if (block.t === "sil") {
        html += timerUI + `
            <div class="card center" style="width:100%; box-sizing:border-box; border: 3px solid #8b5cf6;">
                <h2 style="color:#a78bfa; text-transform:uppercase;">INTERNALIZATION</h2>
                <p style="font-size:1.1rem; margin:20px 0; color:#f1f5f9;">${block.tx?.en || "Reflect on this concept in silence."}</p>
            </div>
        `;
        textToRead = block.tx?.en || "Reflect in silence.";
    } 
    
    else if (block.t === "sim") {
        let assetSymbol = block.asset || "💎";
        let powerWord = block.pw || "FOCUS";
        let kidsLesson = block.lesson || "Pay attention to the concept moving on screen.";
        let basePhrase = block.phrase || "ACQUIRE KNOWLEDGE NOW";

        html += `
        <style>
            @keyframes swingArmL { 0%, 100% { transform: rotate(-15deg); } 40% { transform: rotate(70deg) cubic-bezier(0.175, 0.885, 0.32, 1.275); } }
            @keyframes swingArmR { 0%, 100% { transform: rotate(15deg); } 40% { transform: rotate(-70deg) cubic-bezier(0.175, 0.885, 0.32, 1.275); } }
            @keyframes itemFloat { 0%, 100% { transform: scale(0) translateY(40px); opacity:0; } 30%, 50% { transform: scale(1) translateY(0); opacity:1; } 52% { transform: scale(0.6) translateY(-20px); opacity:0.5; } }
            @keyframes moveClouds { from { background-position-x: 0px; } to { background-position-x: 1000px; } }
        </style>
        ` + timerUI + `
            <div class="card sim-gaming-container" style="border: 4px solid #facc15; background: #020617; padding: 15px; border-radius: 20px; text-align: center; position: relative; box-shadow: 0 0 25px rgba(250, 204, 21, 0.5); width: 100%; box-sizing: border-box;">
                <div style="position: absolute; top: 12px; left: 15px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace; z-index:10;">🎮 LIVE HUNT</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #10b981; font-family: monospace; font-weight: bold; z-index:10;">🤝 TOUCH & ACQUIRE</div>

                <div class="landscape-background" style="display: block; height: 190px; background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 55%, #4ade80 55%, #22c55e 100%); border: 3px solid #334155; border-radius: 20px; margin: 25px auto 15px auto; overflow: hidden; position: relative; width: 100%; box-sizing: border-box;">
                    <div style="position: absolute; top: 10px; left:0; width:100%; height:40px; background: radial-gradient(circle, #fff 20%, transparent 20%) 0 0, radial-gradient(circle, #fff 20%, transparent 20%) 40px 10px; background-size: 80px 40px; opacity: 0.5; animation: moveClouds 25s linear infinite;"></div>
                    <div style="position: absolute; bottom: 45%; left: 15%; width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 35px solid #86efac; opacity:0.6;"></div>
                    <div style="position: absolute; bottom: 45%; left: 60%; width: 0; height: 0; border-left: 55px solid transparent; border-right: 55px solid transparent; border-bottom: 45px solid #65a30d; opacity:0.5;"></div>

                    <div style="position: absolute; bottom: 45px; left: calc(50% - 40px); width: 80px; text-align: center; animation: itemFloat 6s infinite ease-in-out; z-index:8;">
                        <div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${assetSymbol}</div>
                        <div style="background: #1e1b4b; color: #facc15; font-size: 9px; font-weight: 900; padding: 2px 4px; border-radius: 4px; border: 1px solid #facc15; font-family:monospace; text-transform:uppercase;">${powerWord}</div>
                    </div>

                    <!-- AVATAR izquierda: MICHAEL -->
                    <div style="position: absolute; bottom: 15px; left: 15px; width: 60px; height: 110px;">
                        <div style="font-family: monospace; font-size: 11px; color: #0369a1; font-weight: bold; text-align:center; margin-bottom:2px;">MICHAEL</div>
                        <div class="cube-model-inner" style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:4px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                <div class="avatar-mouth" style="width: 8px; height: 3px; background: #7f1d1d; margin: 4px auto 0 auto; border-radius: 2px;"></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #0ea5e9; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">M</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmL 6s infinite ease-in-out;"></div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmR 6s infinite ease-in-out;"></div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                        </div>
                    </div>

                    <!-- AVATAR derecha: DINÁMICO -->
                    <div style="position: absolute; bottom: 15px; right: 15px; width: 60px; height: 110px;">
                        <div style="font-family: monospace; font-size: 11px; color: #9f1239; font-weight: bold; text-align:center; margin-bottom:2px;">${state.userName.toUpperCase()}</div>
                        <div class="cube-model-inner" style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdcbe; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:4px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                <div class="avatar-mouth" style="width: 8px; height: 3px; background: #7f1d1d; margin: 4px auto 0 auto; border-radius: 2px;"></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #f43f5e; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">${state.userName[0].toUpperCase()}</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmL 6s infinite ease-in-out;"></div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmR 6s infinite ease-in-out;"></div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                        </div>
                    </div>
                </div>

                <div style="background: rgba(15,23,42,0.9); border: 2px solid #0ea5e9; border-radius: 12px; padding: 10px; margin-top: 10px; text-align: left;">
                    <span style="color:#0ea5e9; font-size:11px; font-weight:900; display:block; text-transform:uppercase; font-family:monospace;">💡 KID'S KNOWLEDGE LOGIC:</span>
                    <p style="color:#f8fafc; font-size:0.95rem; margin: 3px 0 0 0; line-height:1.4; font-weight:500;">${kidsLesson}</p>
                </div>

                <div class="youtube-shorts-subtitles" style="width: 100%; box-sizing: border-box; margin-top: 10px;">
                    <p id="shorts-text-target" style="font-size: 1.25rem; font-weight: 900; color: #facc15; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3; margin: 0; text-shadow: 2px 2px 0px #000;">${basePhrase}</p>
                </div>
            </div>
        `;
        textToRead = `${basePhrase}. ${kidsLesson}`;
    } 
    
    else if (block.t === "r") { 
        html += `
        <style> @keyframes rewardJump { 0% { transform: translateY(0); } 100% { transform: translateY(-12px); } } </style>
        <div class="card center" style="border: 3px solid #eab308; background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); padding: 20px; width: 100%; box-sizing: border-box;">
            <h2 style="color:#eab308; font-size: 1.8rem; text-transform: uppercase; margin-bottom: 5px;">⭐ ${block.tx || "REWARD UNLOCKED"}</h2>
            <p style="font-size:2rem; font-weight:900; color:#fff; margin: 5px 0;">+${block.p || 0} XP</p>
            
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px; background: rgba(0,0,0,0.4); padding: 10px; border-radius: 12px; border: 1px dashed #eab308;">
                <div style="animation: rewardJump 0.3s infinite alternate ease-in-out; text-align:center;">
                    <div style="width: 14px; height: 14px; background: #ffdbac; border: 1px solid #000; border-radius: 2px; margin: 0 auto;"></div>
                    <div style="width: 22px; height: 18px; background: #0ea5e9; border: 1px solid #000; border-radius: 2px; color: white; font-size: 7px; font-weight: bold; display:flex; align-items:center; justify-content:center;">M</div>
                    <span style="font-size: 9px; color: #0ea5e9; font-family: monospace; font-weight: bold;">MICHAEL</span>
                </div>
                <div style="animation: rewardJump 0.3s infinite alternate-reverse ease-in-out; text-align:center;">
                    <div style="width: 14px; height: 14px; background: #ffdcbe; border: 1px solid #000; border-radius: 2px; margin: 0 auto;"></div>
                    <div style="width: 22px; height: 18px; background: #f43f5e; border: 1px solid #000; border-radius: 2px; color: white; font-size: 7px; font-weight: bold; display:flex; align-items:center; justify-content:center;">${state.userName[0].toUpperCase()}</div>
                    <span style="font-size: 9px; color: #f43f5e; font-family: monospace; font-weight: bold;">${state.userName.toUpperCase()}</span>
                </div>
            </div>
        </div>`; 
        textToRead = `${block.tx || "Reward unlocked"}. Excellent work Michael and ${state.userName}, you earned ${block.p || 0} experience points.`; 
    }
    
    else if (block.t === "d") {
        html += `<div class="card" style="width:100%; box-sizing:border-box;"><h3>${block.q?.en || ""}</h3>`;
        block.op?.forEach((opt, i) => {
            html += `<div class="answer" id="opt-${i}" onclick="selectAnswer(${i}, ${block.c}, ${JSON.stringify(block.ex).replace(/"/g, '&quot;')})">${opt}</div>`;
        });
        html += `</div>`;
        textToRead = `${block.q?.en}. Your options are: ${block.op.join(". ")}`;
    }
    
    else if (block.t === "c") { 
        html += `<div class="card" style="width:100%; box-sizing:border-box;"><p>${block.tx?.en || ""}</p></div>`; 
        textToRead = block.tx?.en; 
    }

    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;

    // CONTROL EXCLUSIVO DEL TEMPORIZADOR: Arranca junto con la escena inmediatamente sin esperar al callback de voz
    if (block.t === "breath_auto" || block.t === "br") {
        startCountdown(24, nextBlock);
        startGuidedBreathing();
    } else if (block.t === "sil") {
        startCountdown(block.d || 24, nextBlock);
    } else if (block.t === "sim") {
        startCountdown(block.d || 30, nextBlock);
    }

    // Ejecución paralela de la narración de audio
    narrate(textToRead, isAvatarMode, () => {
        if (block.t === "breath_auto" || block.t === "br") {
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sil") {
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sim") {
            unlockContinue("SKIP SHORTS", nextBlock);
        } else if (block.t === "d") {
            // Selección interactiva en espera pasiva
        } else {
            setTimeout(nextBlock, 1500);
        }
    });
}

// Visualizador de Respiración Sincronizado
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

// Selección y Retroalimentación de Preguntas
function selectAnswer(index, correct, explanations) {
    if (state.speechLocked) return;
    const isCorrect = index === correct;
    const explanation = explanations?.[index] || "";
    const feedbackWrap = document.createElement("div");
    feedbackWrap.style.width = "100%";
    feedbackWrap.style.boxSizing = "border-box";
    
    const headerColor = isCorrect ? '#22c55e' : '#ef4444';
    const headerText = isCorrect ? "EXCELLENT!" : "KEEP LEARNING";
    
    feedbackWrap.innerHTML = `
        <div class="card" style="border: 3px solid ${headerColor}; width: 100%; box-sizing: border-box;">
            <h3 style="color:${headerColor}; font-weight: 900; text-transform: uppercase;">${headerText}</h3>
            <p>${explanation}</p>
        </div>
        <button id="continueBtn" disabled>NARRATING...</button>
    `;
    
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
