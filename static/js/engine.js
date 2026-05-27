function renderBlock(block, navHeader) {
    const app = document.getElementById("app");
    let html = navHeader;
    let textToRead = "";
    let isAvatarMode = (block.t === "sim");
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
    // MODO SIMULACIÓN INTERACTIVA: RECOLECCIÓN FÍSICA CON SIGNIFICADO
    // =========================================================
    if (isAvatarMode) {
        startDopamineMusic();
        // Configuración de Tesoro con Lógica Educativa Infantil según Bloque Activo
        let powerWord = "FOCUS";
        let visualAsset = " BOOKS";
        let assetSymbol = " ";
        let kidsLesson = "Books give you superpowers! Reading lets your brain grow smarter and win every single game.";
        const blockSelector = state.currentIndex % 6;
        if (blockSelector === 0) { 
            powerWord = "RESPECT"; visualAsset = " HONOR SHIELD"; assetSymbol = " "; 
            kidsLesson = "The Shield of Respect means protecting your family rules and treating people with immense kindness.";
        } else if (blockSelector === 1) { 
            powerWord = "LOVE"; visualAsset = " FAMILY HOME"; assetSymbol = " "; 
            kidsLesson = "The Castle of Love teaches you that a happy home is built by sharing, helping your parents, and being an awesome son.";
        } else if (blockSelector === 2) { 
            powerWord = "FOCUS"; visualAsset = " SCHOOL BOOKS"; assetSymbol = " "; 
            kidsLesson = "Books give you ultimate knowledge. When you study with attention, you unlock the doors to master technology and software.";
        } else if (blockSelector === 3) { 
            powerWord = "WELL-BEING"; visualAsset = " SPEED CAR"; assetSymbol = " "; 
            kidsLesson = "A fast sports car needs clean fuel. Your body needs deep breathing and healthy meals to move with maximum speed.";
        } else if (blockSelector === 4) { 
            powerWord = "JOY"; visualAsset = " GOLD COINS"; assetSymbol = " "; 
            kidsLesson = "Golden coins are won through daily joy and discipline. When you complete your work happily, you attract abundance.";
        } else { 
            powerWord = "WEALTH"; visualAsset = " ESTATED REAL ESTATE"; assetSymbol = " "; 
            kidsLesson = "This prosperous estate means stability. Your focus today creates a solid future with massive physical assets.";
        }
        const basePhrase = block.sub?.en || block.tx?.en || "COLLECT THE TARGET OBJECT NOW";
        textToRead = `Michael and ${state.userName.toUpperCase()}! Grab the hidden treasure with your hands! Look at the ${visualAsset}. ${kidsLesson} ${basePhrase}`;
        html += `
        <style>
            @keyframes mouthSpeak {
                0% { transform: scaleY(0.3); }
                100% { transform: scaleY(1.3); }
            }
            .talking-avatar .avatar-mouth {
                animation: mouthSpeak 0.15s infinite alternate ease-in-out;
            } 
            /* Animación de Brazos Estirándose para AGARRAR el Tesoro Central */
            @keyframes grabAssetLeft {
                0% { left: 5%; transform: translateY(0px); }
                40% { left: 35%; }
                50% { left: 35%; }
                /* El brazo izquierdo se extiende físicamente hacia adelante al llegar al objeto */
                55% { left: 35%; }
                100% { left: 5%; transform: translateY(0px); }
            }
            @keyframes grabAssetRight {
                0% { right: 5%; transform: translateY(0px); }
                40% { right: 35%; }
                50% { right: 35%; }
                /* El brazo derecho se extiende físicamente hacia adelante al llegar al objeto */
                55% { right: 35%; }
                100% { right: 5%; transform: translateY(0px); }
            }
            @keyframes swingArmL {
                0% { transform: rotate(-15deg); }
                40% { transform: rotate(70deg) cubic-bezier(0.175, 0.885, 0.32, 1.275); } /* Extiende la mano para tomarlo */
                100% { transform: rotate(-15deg); }
            }
            @keyframes swingArmR {
                0% { transform: rotate(15deg); }
                40% { transform: rotate(-70deg) cubic-bezier(0.175, 0.885, 0.32, 1.275); } /* Extiende la mano para tomarlo */
                100% { transform: rotate(15deg); }
            }
            @keyframes itemFloat {
                0% { transform: scale(0) translateY(40px); opacity:0; }
                30% { transform: scale(1.3) translateY(-10px); opacity:1; }
                50% { transform: scale(1) translateY(0); opacity:1; }
                52% { transform: scale(0.6) translateY(-20px); opacity:0.5; } /* Al ser tomado por las manos */
                100% { transform: scale(0) translateY(-40px); opacity:0; }
            }
            @keyframes moveClouds {
                from { background-position-x: 0px; }
                to { background-position-x: 1000px; }
            }
        </style>
        ` + timerUI + `
            <div class="card sim-gaming-container" style="
                border: 4px solid #facc15; 
                background: #020617; 
                padding: 15px; 
                border-radius: 20px; 
                text-align: center;
                position: relative;
                box-shadow: 0 0 25px rgba(250, 204, 21, 0.5);
                width: 100%;
                box-sizing: border-box;
            ">
                <div style="position: absolute; top: 12px; left: 15px; background: #ef4444; color: white; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 5px; font-family: monospace; z-index:10;"> LIVE HUNT</div>
                <div style="position: absolute; top: 12px; right: 15px; font-size: 11px; color: #10b981; font-family: monospace; font-weight: bold; z-index:10;"> TOUCH & ACQUIRE</div>
                <div class="landscape-background" style="
                    display: block;
                    height: 190px;
                    background: linear-gradient(180deg, #bae6fd 0%, #e0f2fe 55%, #4ade80 55%, #22c55e 100%);
                    border: 3px solid #334155;
                    border-radius: 20px;
                    margin: 25px auto 15px auto;
                    overflow: hidden;
                    position: relative;
                    width: 100%;
                    box-sizing: border-box;
                ">
                    <div style="position: absolute; top: 10px; left:0; width:100%; height:40px; background: radial-gradient(circle, #fff 20%, transparent 20%) 0 0, radial-gradient(circle, #fff 20%, transparent 20%) 40px 10px; background-size: 80px 40px; opacity: 0.5; animation: moveClouds 25s linear infinite;"></div>
                    <div style="position: absolute; bottom: 45%; left: 15%; width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 35px solid #86efac; opacity:0.6;"></div>
                    <div style="position: absolute; bottom: 45%; left: 60%; width: 0; height: 0; border-left: 55px solid transparent; border-right: 55px solid transparent; border-bottom: 45px solid #65a30d; opacity:0.5;"></div>
                    <div style="position: absolute; bottom: 45px; left: calc(50% - 40px); width: 80px; text-align: center; animation: itemFloat 6s infinite ease-in-out; z-index:8;">
                        <div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));">${assetSymbol}</div>
                        <div style="background: #1e1b4b; color: #facc15; font-size: 9px; font-weight: 900; padding: 2px 4px; border-radius: 4px; border: 1px solid #facc15; font-family:monospace; text-transform:uppercase;">
                            ${powerWord}
                        </div>
                    </div>
                    <div style="position: absolute; bottom: 15px; width: 60px; height: 110px; animation: grabAssetLeft 6s infinite ease-in-out;">
                        <div style="font-family: monospace; font-size: 11px; color: #0369a1; font-weight: bold; text-align:center; margin-bottom:2px;">MICHAEL</div>
                        <div class="cube-model-inner" style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdbac; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:4px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                <div class="avatar-mouth" style="width: 8px; height: 3px; background: #7f1d1d; margin: 4px auto 0 auto; border-radius: 2px;"></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #0ea5e9; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">M</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmL 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div> </div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdbac; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmR 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div> </div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #1e293b; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                        </div>
                    </div>
                    <div style="position: absolute; bottom: 15px; width: 60px; height: 110px; animation: grabAssetRight 6s infinite ease-in-out;">
                        <div style="font-family: monospace; font-size: 11px; color: #9f1239; font-weight: bold; text-align:center; margin-bottom:2px;">${state.userName.toUpperCase()}</div>
                        <div class="cube-model-inner" style="width: 44px; height: 85px; position: relative; margin: 0 auto;">
                            <div style="width: 24px; height: 24px; background: #ffdcbe; border-radius: 4px; border: 2px solid #000; margin: 0 auto; position: relative; z-index:5;">
                                <div style="display:flex; justify-content:space-around; margin-top:4px;"><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div><div style="width:4px; height:4px; background:#000; border-radius:50%;"></div></div>
                                <div class="avatar-mouth" style="width: 8px; height: 3px; background: #7f1d1d; margin: 4px auto 0 auto; border-radius: 2px;"></div>
                            </div>
                            <div style="width: 40px; height: 34px; background: #f43f5e; border: 2px solid #000; border-radius: 3px; margin-top: -2px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold; font-size: 10px; position:relative; z-index:4;">${state.userName[0].toUpperCase()}</div>
                            <div style="position: absolute; left: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmL 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div>
                            </div>
                            <div style="position: absolute; right: -8px; top: 24px; width: 8px; height: 26px; background: #ffdcbe; border: 2px solid #000; border-radius: 2px; transform-origin: top center; animation: swingArmR 6s infinite ease-in-out;">
                                <div style="position: absolute; bottom: -4px; left: 0; width: 8px; height: 4px; background: #000; border-radius: 50%;"></div>
                            </div>
                            <div style="position: absolute; left: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                            <div style="position: absolute; right: 4px; bottom: 0; width: 10px; height: 24px; background: #111827; border: 1.5px solid #000; border-radius:0 0 4px 4px;"></div>
                        </div>
                    </div>
                </div>
                <div style="background: rgba(15,23,42,0.9); border: 2px solid #0ea5e9; border-radius: 12px; padding: 10px; margin-top: 10px; text-align: left;">
                    <span style="color:#0ea5e9; font-size:11px; font-weight:900; display:block; text-transform:uppercase; font-family:monospace;"> KID'S KNOWLEDGE LOGIC:</span>
                    <p style="color:#f8fafc; font-size:0.95rem; margin: 3px 0 0 0; line-height:1.4; font-weight:500;">${kidsLesson}</p>
                </div>
                <div class="youtube-shorts-subtitles" style="width: 100%; box-sizing: border-box; margin-top: 10px;">
                    <p id="shorts-text-target" style="
                        font-size: 1.25rem; 
                        font-weight: 900; 
                        color: #facc15; 
                        text-transform: uppercase; 
                        letter-spacing: 0.5px;
                        line-height: 1.3;
                        margin: 0;
                        text-shadow: 2px 2px 0px #000;
                    ">
                        ${basePhrase}
                    </p>
                </div>
            </div>
        `;
    }
    // =========================================================
    // BLOQUE REWARD CON DISEÑO DE AVATARES CELEBRANDO
    // =========================================================
    if (block.t === "r") { 
        html += `
        <style>
            @keyframes rewardJump {
                0% { transform: translateY(0) scale(1); }
                100% { transform: translateY(-12px) scale(1.05); }
            }
        </style>
        <div class="card center" style="border: 3px solid #eab308; background: linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%); padding: 20px; width: 100%; box-sizing: border-box;">
            <h2 style="color:#eab308; font-size: 1.8rem; text-transform: uppercase; margin-bottom: 5px;"> ${block.tx || "REWARD UNLOCKED"}</h2>
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
        textToRead = `${block.tx || "Reward unlocked"}. Excellent work Michael and ${state.userName}, you earned ${block.p} experience points.`; 
    }
    if (block.t === "d") {
        html += `<div class="card" style="width:100%; box-sizing:border-box;"><h3>${block.q?.en || ""}</h3>`;
        block.op?.forEach((opt, i) => {
            html += `<div class="answer" id="opt-${i}" onclick="selectAnswer(${i}, ${block.c}, ${JSON.stringify(block.ex).replace(/"/g, '&quot;')})">${opt}</div>`;
        });
        html += `</div>`;
        textToRead = `${block.q?.en}. Your options are: ${block.op.join(". ")}`;
    }
    if (block.t === "c") { html += `<div class="card" style="width:100%; box-sizing:border-box;"><p>${block.tx?.en || ""}</p></div>`; textToRead = block.tx?.en; }
    if (block.t !== "d") html += `<button id="continueBtn" disabled>NARRATING...</button>`;
    app.innerHTML = html;
    narrate(textToRead, isAvatarMode, () => {
        if (block.t === "breath_auto" || block.t === "br") {
            startCountdown(24, nextBlock);
            startGuidedBreathing();
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sil") {
            startCountdown(block.d || 24, nextBlock);
            unlockContinue("SKIP", nextBlock);
        } else if (block.t === "sim") {
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
/* =========================
   SISTEMA DE CORRECCIÓN COLOREADO CON FEEDBACK REFORZADO
========================= */
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
