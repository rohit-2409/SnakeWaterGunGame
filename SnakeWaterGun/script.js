// State variables
let playerScore = parseInt(localStorage.getItem('swg_playerScore')) || 0;
let computerScore = parseInt(localStorage.getItem('swg_computerScore')) || 0;
let tiesScore = parseInt(localStorage.getItem('swg_tiesScore')) || 0;
let winStreak = parseInt(localStorage.getItem('swg_winStreak')) || 0;
let history = JSON.parse(localStorage.getItem('swg_history')) || [];
let soundEnabled = localStorage.getItem('swg_soundEnabled') !== 'false';

// Audio Context and Synthesizer Engine
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSynthSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const now = audioCtx.currentTime;
    
    switch(type) {
        case 'hover': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
            
            gain.gain.setValueAtTime(0.015, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
            
            osc.start(now);
            osc.stop(now + 0.05);
            break;
        }
        case 'click': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(350, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.08);
            break;
        }
        case 'countdown': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(550, now);
            
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
            
            osc.start(now);
            osc.stop(now + 0.08);
            break;
        }
        case 'clash': {
            const bufferSize = audioCtx.sampleRate * 0.3;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise.start(now);
            noise.stop(now + 0.3);
            break;
        }
        case 'laser_fire': {
            // Firing sound: 7 rapid high-to-low sweeps
            for (let i = 0; i < 7; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                const t = now + i * 0.07;
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(1000, t);
                osc.frequency.exponentialRampToValueAtTime(150, t + 0.06);
                
                gain.gain.setValueAtTime(0.035, t);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
                
                osc.start(t);
                osc.stop(t + 0.065);
            }
            break;
        }
        case 'gulp_drink': {
            // Upward wet sound: 3 rapid cartoon gulps
            for (let i = 0; i < 3; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                const t = now + i * 0.14;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(180 + i * 120, t);
                osc.frequency.exponentialRampToValueAtTime(550 + i * 120, t + 0.11);
                
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.06, t + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
                
                osc.start(t);
                osc.stop(t + 0.12);
            }
            break;
        }
        case 'splash_rust': {
            // White noise splash
            const bufferSize = audioCtx.sampleRate * 0.45;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(900, now);
            filter.frequency.exponentialRampToValueAtTime(250, now + 0.35);
            filter.Q.value = 1.2;
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            noise.start(now);
            noise.stop(now + 0.4);
            
            // Spark fizzle crackle
            for (let i = 0; i < 5; i++) {
                const osc = audioCtx.createOscillator();
                const clickGain = audioCtx.createGain();
                osc.type = 'triangle';
                const t = now + 0.12 + i * 0.07;
                osc.frequency.setValueAtTime(100 + Math.random() * 100, t);
                clickGain.gain.setValueAtTime(0.04, t);
                clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
                
                osc.connect(clickGain);
                clickGain.connect(audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.045);
            }
            break;
        }
        case 'shield_clang': {
            // Metallic ring modulation using 4 offset sine waves
            const freqs = [360, 490, 570, 920];
            freqs.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                
                gain.gain.setValueAtTime(0.035, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx === 0 ? 0.35 : 0.18));
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now);
                osc.stop(now + 0.35);
            });
            break;
        }
        case 'win': {
            const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.08 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.22);
                
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
            });
            break;
        }
        case 'lose': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.linearRampToValueAtTime(90, now + 0.4);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
            
            osc.start(now);
            osc.stop(now + 0.4);
            break;
        }
        case 'tie': {
            [293.66, 293.66].forEach((freq, idx) => { // D4
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                
                gain.gain.setValueAtTime(0.03, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.2);
                
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + 0.25);
            });
            break;
        }
        case 'reset': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.15);
            break;
        }
    }
}

// Choice detail mapping
const choiceDetails = {
    snake: { emoji: '🐍', name: 'Snake', color: '#00ff87', beats: 'water', verb: 'drinks' },
    water: { emoji: '💧', name: 'Water', color: '#00d2ff', beats: 'gun', verb: 'rusts' },
    gun: { emoji: '🔫', name: 'Gun', color: '#ff007f', beats: 'snake', verb: 'shoots' }
};

const choices = ['snake', 'water', 'gun'];

// DOM elements
let els = {};

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM Elements
    els = {
        playerScore: document.getElementById('player-score'),
        computerScore: document.getElementById('computer-score'),
        tiesScore: document.getElementById('ties-score'),
        streak: document.getElementById('streak'),
        streakContainer: document.getElementById('streak-container'),
        
        choicesGrid: document.getElementById('choices-grid'),
        arena: document.getElementById('arena'),
        particlesContainer: document.getElementById('particles-container'),
        
        playerCard: document.getElementById('player-battle-card'),
        computerCard: document.getElementById('computer-battle-card'),
        
        clashStatus: document.getElementById('clash-status'),
        clashSub: document.getElementById('clash-sub'),
        clashEffect: document.getElementById('clash-effect'),
        
        playAgainBtn: document.getElementById('play-again-btn'),
        resetBtn: document.getElementById('reset-btn'),
        soundToggle: document.getElementById('sound-toggle'),
        
        historyList: document.getElementById('history-list'),
        noHistory: document.getElementById('no-history')
    };

    // Attach interactive 3D Mouse Tilt & sounds to selection choices
    document.querySelectorAll('.choice-card').forEach(card => {
        card.addEventListener('mouseenter', () => playSynthSound('hover'));
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = (x / rect.width - 0.5) * 2; // range: -1 to 1
            const yPercent = (y / rect.height - 0.5) * 2; // range: -1 to 1
            
            // Tilted 3D transform matrix
            card.style.transform = `perspective(800px) rotateY(${xPercent * 14}deg) rotateX(${-yPercent * 14}deg) scale(1.04)`;
            
            // Glow shadow following choice colors
            const choice = card.dataset.choice;
            const glowColor = choiceDetails[choice].color;
            card.style.boxShadow = `0 12px 35px ${glowColor}44`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
        
        card.addEventListener('click', () => {
            const choice = card.dataset.choice;
            playGame(choice);
        });
    });

    // Control listeners
    els.playAgainBtn.addEventListener('click', () => {
        playSynthSound('click');
        resetArena();
    });
    
    els.resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all scores and history?')) {
            playSynthSound('reset');
            resetScores();
        }
    });
    
    els.soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('swg_soundEnabled', soundEnabled);
        updateSoundButton();
        if (soundEnabled) {
            initAudio();
            playSynthSound('hover');
        }
    });

    // Initial render
    updateScoreboardUI(false);
    updateSoundButton();
    renderHistory();
});

function updateSoundButton() {
    if (soundEnabled) {
        els.soundToggle.innerHTML = `🔊 <span class="toggle-text">Sound: On</span>`;
        els.soundToggle.classList.remove('sound-disabled');
    } else {
        els.soundToggle.innerHTML = `🔇 <span class="toggle-text">Sound: Off</span>`;
        els.soundToggle.classList.add('sound-disabled');
    }
}

function updateScoreboardUI(animate = true) {
    if (!els.playerScore) return;
    
    els.playerScore.textContent = playerScore;
    els.computerScore.textContent = computerScore;
    els.tiesScore.textContent = tiesScore;
    
    els.streak.textContent = winStreak;
    if (winStreak >= 3) {
        els.streakContainer.classList.add('streak-hot');
    } else {
        els.streakContainer.classList.remove('streak-hot');
    }
    
    if (animate) {
        ['playerScore', 'computerScore', 'tiesScore', 'streak'].forEach(key => {
            els[key].classList.remove('pop-animate');
            void els[key].offsetWidth; // trigger reflow
            els[key].classList.add('pop-animate');
        });
    }
}

function renderHistory() {
    if (!els.historyList) return;
    els.historyList.innerHTML = '';
    
    if (history.length === 0) {
        els.noHistory.style.display = 'block';
        return;
    }
    
    els.noHistory.style.display = 'none';
    
    history.forEach(item => {
        const row = document.createElement('div');
        row.className = `history-item result-${item.outcome}`;
        
        const playerDet = choiceDetails[item.player];
        const compDet = choiceDetails[item.computer];
        
        let outcomeText = '';
        if (item.outcome === 'win') outcomeText = 'Victory';
        else if (item.outcome === 'lose') outcomeText = 'Defeat';
        else outcomeText = 'Tie';
        
        row.innerHTML = `
            <div class="history-outcome-badge">${outcomeText}</div>
            <div class="history-details">
                You used <strong style="color:${playerDet.color}">${playerDet.emoji}</strong> 
                vs 
                Computer's <strong style="color:${compDet.color}">${compDet.emoji}</strong>
            </div>
            <div class="history-time">${new Date(item.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</div>
        `;
        els.historyList.appendChild(row);
    });
}

function resetScores() {
    playerScore = 0;
    computerScore = 0;
    tiesScore = 0;
    winStreak = 0;
    history = [];
    
    localStorage.setItem('swg_playerScore', playerScore);
    localStorage.setItem('swg_computerScore', computerScore);
    localStorage.setItem('swg_tiesScore', tiesScore);
    localStorage.setItem('swg_winStreak', winStreak);
    localStorage.setItem('swg_history', JSON.stringify(history));
    
    updateScoreboardUI(true);
    renderHistory();
}

function playGame(userChoice) {
    playSynthSound('click');
    
    // Disable clicking choices
    document.querySelectorAll('.choice-card').forEach(card => {
        card.style.pointerEvents = 'none';
        card.style.opacity = '0.5';
    });
    
    // Hide choice selection, reveal arena
    els.choicesGrid.classList.add('fade-out');
    
    setTimeout(() => {
        els.choicesGrid.style.display = 'none';
        els.arena.style.display = 'flex';
        els.arena.classList.remove('fade-out');
        els.arena.classList.add('fade-in');
        
        // Start countdown/shuffle
        runArenaCountdown(userChoice);
    }, 300);
}

function runArenaCountdown(userChoice) {
    let count = 0;
    const shuffleInterval = 120; // ms
    const totalDuration = 1200; // ms
    const steps = totalDuration / shuffleInterval;
    
    setupBattleCard(els.playerCard, userChoice, true);
    setupBattleCard(els.computerCard, null, false);
    
    els.clashStatus.textContent = 'READY';
    els.clashStatus.style.color = '#ffffff';
    els.clashSub.textContent = 'Analyzing elemental balance...';
    els.playAgainBtn.style.display = 'none';
    
    // Sound countdown ticks
    const tickInterval = setInterval(() => {
        playSynthSound('countdown');
    }, 400);
    
    // Emoji shuffling visual effect
    const shuffleTimer = setInterval(() => {
        count++;
        const tempChoice = choices[Math.floor(Math.random() * 3)];
        setupBattleCard(els.computerCard, tempChoice, false, true); // transparent shuffle
        
        if (count >= steps) {
            clearInterval(shuffleTimer);
            clearInterval(tickInterval);
            revealResult(userChoice);
        }
    }, shuffleInterval);
}

function setupBattleCard(cardEl, choice, isPlayer, isShuffling = false) {
    const iconEl = cardEl.querySelector('.card-icon');
    const labelEl = cardEl.querySelector('.card-name');
    
    if (choice) {
        const details = choiceDetails[choice];
        iconEl.textContent = details.emoji;
        labelEl.textContent = isShuffling ? '???' : details.name;
        
        cardEl.style.borderColor = details.color;
        cardEl.style.boxShadow = `0 0 25px ${details.color}44`;
        
        if (isPlayer) {
            cardEl.className = 'battle-card player-side';
        } else {
            cardEl.className = 'battle-card computer-side';
        }
    } else {
        iconEl.textContent = '❓';
        labelEl.textContent = 'Waiting';
        cardEl.style.borderColor = '#ffffff22';
        cardEl.style.boxShadow = 'none';
        cardEl.className = 'battle-card computer-side';
    }
}

// Get screen coordinates of cards relative to arena wrapper
function getCardCenter(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const parentRect = els.arena.getBoundingClientRect();
    return {
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top + rect.height / 2,
        width: rect.width,
        height: rect.height,
        left: rect.left - parentRect.left,
        top: rect.top - parentRect.top
    };
}

function revealResult(userChoice) {
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    
    // Setup definitive computer choice card
    setupBattleCard(els.computerCard, computerChoice, false);
    
    let outcome = ''; // 'win', 'lose', 'tie'
    let detailMsg = '';
    
    if (userChoice === computerChoice) {
        outcome = 'tie';
        detailMsg = `Both chose ${choiceDetails[userChoice].name}`;
    } else if (
        (userChoice === 'snake' && computerChoice === 'water') ||
        (userChoice === 'water' && computerChoice === 'gun') ||
        (userChoice === 'gun' && computerChoice === 'snake')
    ) {
        outcome = 'win';
        const det = choiceDetails[userChoice];
        detailMsg = `${det.emoji} ${det.name} ${det.verb} ${choiceDetails[computerChoice].emoji} ${choiceDetails[computerChoice].name}!`;
    } else {
        outcome = 'lose';
        const det = choiceDetails[computerChoice];
        detailMsg = `${det.emoji} ${det.name} ${det.verb} ${choiceDetails[userChoice].emoji} ${choiceDetails[userChoice].name}!`;
    }
    
    // Execute element-specific fight timelines
    runFightTimeline(userChoice, computerChoice, outcome, detailMsg);
}

function runFightTimeline(playerChoice, computerChoice, outcome, detailMsg) {
    const pContainer = els.particlesContainer;
    pContainer.innerHTML = ''; // Clean old debris
    
    const elements = new Set([playerChoice, computerChoice]);
    
    if (outcome === 'tie') {
        // TIE: Simple shield clash
        els.playerCard.classList.add('clash-left');
        els.computerCard.classList.add('clash-right');
        els.clashEffect.classList.add('clash-blast');
        playSynthSound('clash');
        
        setTimeout(() => {
            playSynthSound('shield_clang');
            
            const playerCenter = getCardCenter(els.playerCard);
            const computerCenter = getCardCenter(els.computerCard);
            const clashX = (playerCenter.x + computerCenter.x) / 2;
            const clashY = (playerCenter.y + computerCenter.y) / 2;
            
            spawnSparks(clashX, clashY, 20);
            
            els.playerCard.classList.remove('clash-left');
            els.computerCard.classList.remove('clash-right');
            
            els.playerCard.classList.add('card-tie');
            els.computerCard.classList.add('card-tie');
            
            finishRound(outcome, detailMsg, playerChoice, computerChoice);
        }, 400);
        
    } else if (elements.has('snake') && elements.has('gun')) {
        // FIGHT: Gun shoots Snake
        const isPlayerShooter = (playerChoice === 'gun');
        const shooterCard = isPlayerShooter ? els.playerCard : els.computerCard;
        const targetCard = isPlayerShooter ? els.computerCard : els.playerCard;
        
        shooterCard.classList.add('gun-aim');
        targetCard.classList.add('snake-fear');
        
        setTimeout(() => {
            playSynthSound('laser_fire');
            
            const shooterCenter = getCardCenter(shooterCard);
            const targetCenter = getCardCenter(targetCard);
            
            // Spawn stream of glowing bullets
            let bulletCount = 0;
            const bulletInterval = setInterval(() => {
                spawnLaserBullet(shooterCenter, targetCenter, targetCard);
                bulletCount++;
                if (bulletCount >= 8) {
                    clearInterval(bulletInterval);
                }
            }, 60);
            
            setTimeout(() => {
                shooterCard.classList.remove('gun-aim');
                targetCard.classList.remove('snake-fear');
                
                shooterCard.classList.add('card-winner');
                targetCard.classList.add('card-defeated-gun'); // falls backward in 3D perspective
                
                finishRound(outcome, detailMsg, playerChoice, computerChoice);
            }, 850);
            
        }, 300);
        
    } else if (elements.has('snake') && elements.has('water')) {
        // FIGHT: Snake drinks Water
        const isPlayerSnake = (playerChoice === 'snake');
        const snakeCard = isPlayerSnake ? els.playerCard : els.computerCard;
        const waterCard = isPlayerSnake ? els.computerCard : els.playerCard;
        
        snakeCard.classList.add(isPlayerSnake ? 'snake-lunge-right' : 'snake-lunge-left');
        
        setTimeout(() => {
            playSynthSound('gulp_drink');
            waterCard.classList.add('water-dissolve');
            
            const snakeCenter = getCardCenter(snakeCard);
            const waterCenter = getCardCenter(waterCard);
            
            spawnVacuumBubbles(waterCenter, snakeCenter);
            
            setTimeout(() => {
                snakeCard.classList.remove(isPlayerSnake ? 'snake-lunge-right' : 'snake-lunge-left');
                snakeCard.classList.add('snake-grow');
                
                setTimeout(() => {
                    snakeCard.classList.remove('snake-grow');
                    snakeCard.classList.add('card-winner');
                    waterCard.classList.add('card-loser');
                    
                    finishRound(outcome, detailMsg, playerChoice, computerChoice);
                }, 400);
            }, 600);
            
        }, 300);
        
    } else if (elements.has('water') && elements.has('gun')) {
        // FIGHT: Water rusts Gun
        const isPlayerWater = (playerChoice === 'water');
        const waterCard = isPlayerWater ? els.playerCard : els.computerCard;
        const gunCard = isPlayerWater ? els.computerCard : els.playerCard;
        
        waterCard.classList.add(isPlayerWater ? 'water-tilt-right' : 'water-tilt-left');
        
        setTimeout(() => {
            playSynthSound('splash_rust');
            
            const waterCenter = getCardCenter(waterCard);
            const gunCenter = getCardCenter(gunCard);
            
            spawnSplashWave(waterCenter, gunCenter);
            
            setTimeout(() => {
                waterCard.classList.remove(isPlayerWater ? 'water-tilt-right' : 'water-tilt-left');
                
                // Gun gets short-circuited and rusted
                gunCard.classList.add('gun-glitch', 'gun-rusty');
                waterCard.classList.add('card-winner');
                
                // Sparks flying from the short circuiting gun
                spawnElectricSparks(gunCenter, 12);
                
                setTimeout(() => {
                    gunCard.classList.remove('gun-glitch');
                    finishRound(outcome, detailMsg, playerChoice, computerChoice);
                }, 500);
            }, 450);
            
        }, 300);
    }
}

// Particle Builders
function spawnLaserBullet(from, to, targetCard) {
    const p = document.createElement('div');
    p.className = 'particle laser-bullet';
    p.style.left = `${from.x}px`;
    p.style.top = `${from.y}px`;
    els.particlesContainer.appendChild(p);
    
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    
    requestAnimationFrame(() => {
        p.style.transform = `translate(${to.x - from.x}px, ${to.y - from.y}px) rotate(${angle}rad)`;
    });
    
    setTimeout(() => {
        p.remove();
        targetCard.classList.add('hit-flash');
        spawnSparks(to.x, to.y, 4);
        setTimeout(() => {
            targetCard.classList.remove('hit-flash');
        }, 80);
    }, 250);
}

function spawnVacuumBubbles(from, to) {
    const count = 16;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'particle water-droplet';
            
            const startX = from.left + Math.random() * from.width;
            const startY = from.top + Math.random() * from.height;
            
            p.style.left = `${startX}px`;
            p.style.top = `${startY}px`;
            p.style.scale = `${0.6 + Math.random() * 0.6}`;
            
            els.particlesContainer.appendChild(p);
            
            requestAnimationFrame(() => {
                p.style.transform = `translate(${to.x - startX}px, ${to.y - startY}px)`;
                p.style.scale = '0.1';
                p.style.opacity = '0';
            });
            
            setTimeout(() => p.remove(), 400);
        }, i * 25);
    }
}

function spawnSplashWave(from, to) {
    const count = 18;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'particle water-droplet';
            
            const startX = from.x + (Math.random() - 0.5) * 35;
            const startY = from.y + (Math.random() - 0.5) * 35;
            
            p.style.left = `${startX}px`;
            p.style.top = `${startY}px`;
            
            els.particlesContainer.appendChild(p);
            
            const targetX = to.x + (Math.random() - 0.5) * 70;
            const targetY = to.y + (Math.random() - 0.5) * 70;
            
            requestAnimationFrame(() => {
                p.style.transform = `translate(${targetX - startX}px, ${targetY - startY}px)`;
                p.style.scale = `${0.4 + Math.random() * 0.9}`;
            });
            
            setTimeout(() => p.remove(), 400);
        }, i * 15);
    }
}

function spawnSparks(x, y, count) {
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'particle spark';
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        els.particlesContainer.appendChild(p);
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 25 + Math.random() * 55;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        
        requestAnimationFrame(() => {
            p.style.transform = `translate(${dx}px, ${dy}px)`;
            p.style.opacity = '0';
        });
        
        setTimeout(() => p.remove(), 300);
    }
}

function spawnElectricSparks(center, count) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'particle spark';
            
            const startX = center.left + Math.random() * center.width;
            const startY = center.top + Math.random() * center.height;
            
            p.style.left = `${startX}px`;
            p.style.top = `${startY}px`;
            
            els.particlesContainer.appendChild(p);
            
            const dx = (Math.random() - 0.5) * 50;
            const dy = (Math.random() - 0.5) * 50;
            
            requestAnimationFrame(() => {
                p.style.transform = `translate(${dx}px, ${dy}px)`;
                p.style.opacity = '0';
                p.style.scale = '0.4';
            });
            
            setTimeout(() => p.remove(), 250);
        }, i * 25);
    }
}

function finishRound(outcome, detailMsg, userChoice, computerChoice) {
    if (outcome === 'win') {
        els.clashStatus.textContent = 'VICTORY!';
        els.clashStatus.style.color = '#00ff87';
        els.clashSub.textContent = detailMsg;
        
        playerScore++;
        winStreak++;
        playSynthSound('win');
    } else if (outcome === 'lose') {
        els.clashStatus.textContent = 'DEFEAT!';
        els.clashStatus.style.color = '#ff007f';
        els.clashSub.textContent = detailMsg;
        
        computerScore++;
        winStreak = 0;
        playSynthSound('lose');
    } else {
        els.clashStatus.textContent = 'TIE GAME!';
        els.clashStatus.style.color = '#ffffff';
        els.clashSub.textContent = detailMsg;
        
        tiesScore++;
        playSynthSound('tie');
    }
    
    // Save state
    localStorage.setItem('swg_playerScore', playerScore);
    localStorage.setItem('swg_computerScore', computerScore);
    localStorage.setItem('swg_tiesScore', tiesScore);
    localStorage.setItem('swg_winStreak', winStreak);
    
    updateScoreboardUI(true);
    
    // Save to history log
    history.unshift({
        id: Date.now(),
        player: userChoice,
        computer: computerChoice,
        outcome: outcome
    });
    if (history.length > 5) {
        history.pop();
    }
    localStorage.setItem('swg_history', JSON.stringify(history));
    renderHistory();
    
    els.clashEffect.classList.remove('clash-blast');
    els.playAgainBtn.style.display = 'inline-block';
    els.playAgainBtn.classList.add('pulse-button');
}

function resetArena() {
    els.arena.classList.remove('fade-in');
    els.arena.classList.add('fade-out');
    
    setTimeout(() => {
        els.arena.style.display = 'none';
        els.choicesGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
        els.choicesGrid.style.display = 'grid';
        els.choicesGrid.classList.remove('fade-out');
        els.choicesGrid.classList.add('fade-in');
        
        // Restore pointer events on selection cards
        document.querySelectorAll('.choice-card').forEach(card => {
            card.style.pointerEvents = 'auto';
            card.style.opacity = '1';
            card.style.transform = '';
        });
        
        // Clean card classes completely
        els.playerCard.className = 'battle-card player-side';
        els.computerCard.className = 'battle-card computer-side';
        els.playerCard.style.boxShadow = 'none';
        els.computerCard.style.boxShadow = 'none';
        els.playerCard.style.borderColor = '#ffffff22';
        els.computerCard.style.borderColor = '#ffffff22';
        
        els.playAgainBtn.classList.remove('pulse-button');
        els.particlesContainer.innerHTML = ''; // remove leftovers
    }, 300);
}