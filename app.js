const state = {
    screen: 'start',
    target: null,
    darts: [],
    remaining: 0,
    lastResult: null,
    gameEnded: false,
    showRemaining: true,
    showNumbers: true,
};

// Get valid checkout targets
function getValidCheckoutTargets() {
    const targets = [];
    for (let i = 2; i <= 170; i++) {
        if (!Checkouts.IMPOSSIBLE_CHECKOUTS.has(i)) {
            targets.push(i);
        }
    }
    return targets;
}

// Screen management
function switchScreen(screenName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach((screen) => screen.classList.remove('active'));
    const newScreen = document.getElementById(`${screenName}-screen`);
    if (newScreen) {
        newScreen.classList.add('active');
    }
    state.screen = screenName;
}

// Start a new game
function startGame() {
    const validTargets = getValidCheckoutTargets();
    state.target = validTargets[Math.floor(Math.random() * validTargets.length)];
    state.darts = [];
    state.remaining = state.target;
    state.lastResult = null;
    state.gameEnded = false;
    renderGameScreen();
    renderDarts();
    switchScreen('game');
}

// Add a dart to the current checkout
function addDart(notation) {
    // Check if game has ended
    if (state.gameEnded) {
        return;
    }

    // Check if we already have 3 darts
    if (state.darts.length >= 3) {
        return;
    }

    const points = Checkouts.parseScore(notation);
    state.darts.push(notation);
    state.remaining -= points;

    renderDarts();

    // Check for bust or invalid state
    if (state.remaining < 0) {
        // Bust - went over
        showBustResult();
        return;
    }

    if (state.remaining === 1) {
        // Impossible - can't finish with a double from 1
        showBustResult();
        return;
    }

    // Check if checkout is complete
    if (state.remaining === 0) {
        // Check if last dart is a double
        if (Checkouts.isDouble(notation)) {
            // Valid checkout!
            showResult();
        } else {
            // Need a double to finish
            showBustResult();
        }
        return;
    }

    // If we have 3 darts without finishing, submit for validation
    if (state.darts.length === 3) {
        // Auto-submit incomplete checkout
        setTimeout(() => {
            showResult();
        }, 400);
    }
}

// Skip current target
function skipTarget() {
    startGame();
}

// Reset darts for current target
function resetDarts() {
    state.darts = [];
    state.remaining = state.target;
    state.gameEnded = false;
    renderGameScreen();
    renderDarts();
}

// Toggle remaining display
function toggleRemaining() {
    state.showRemaining = !state.showRemaining;
    document.getElementById('remaining-group').style.visibility =
        state.showRemaining ? 'visible' : 'hidden';
    const btn = document.getElementById('toggle-remaining-btn');
    btn.classList.toggle('active', state.showRemaining);
}

// Toggle dartboard numbers
function toggleNumbers() {
    state.showNumbers = !state.showNumbers;
    document.querySelectorAll('.dartboard-text').forEach(el => {
        el.style.visibility = state.showNumbers ? 'visible' : 'hidden';
    });
    const btn = document.getElementById('toggle-numbers-btn');
    btn.classList.toggle('active', state.showNumbers);
}

// Show result screen
function showResult() {
    state.gameEnded = true;
    const validation = Checkouts.validateCheckout(state.darts, state.target);
    state.lastResult = validation;

    setTimeout(() => {
        renderResultScreen();
        switchScreen('result');
    }, 400);
}

// Show bust result
function showBustResult() {
    state.gameEnded = true;
    state.lastResult = {
        valid: false,
        isOptimal: false,
        optimal: Checkouts.OPTIMAL_CHECKOUTS[state.target] || null,
    };

    setTimeout(() => {
        renderResultScreen();
        switchScreen('result');
    }, 400);
}

// Next round
function nextRound() {
    startGame();
}

// Render functions
function renderGameScreen() {
    const targetNumber = document.getElementById('target-number');
    const remainingNumber = document.getElementById('remaining-number');

    if (targetNumber) targetNumber.textContent = state.target;
    if (remainingNumber) remainingNumber.textContent = state.remaining;
}

function renderDarts() {
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`dart-${i}`);
        if (slot) {
            slot.textContent = state.darts[i] || '';
        }
    }

    const remainingNumber = document.getElementById('remaining-number');
    if (remainingNumber) remainingNumber.textContent = state.remaining;
}

function renderResultScreen() {
    const targetDisplay = document.getElementById('result-target-number');
    const status = document.getElementById('result-status');
    const yourDarts = document.getElementById('result-your-darts');

    // Show target number
    if (targetDisplay) targetDisplay.textContent = state.target;

    // Determine status
    const { valid } = state.lastResult;

    if (valid) {
        status.textContent = I18n.t('resultSuccess');
        status.className = 'result-status optimal';
    } else {
        status.textContent = I18n.t('resultFail');
        status.className = 'result-status invalid';
    }

    // Show your darts
    yourDarts.innerHTML = state.darts.map((dart) => `<span class="dart-item">${dart}</span>`).join('');

    // Show premium checkouts
    const premium = window.PremiumCheckouts[state.target];
    console.log(`Target: ${state.target}, Premium data:`, premium);

    // V1 Card
    const v1Card = document.getElementById('premium-v1-card');
    const v1Darts = document.getElementById('premium-v1-darts');
    if (premium && premium.v1) {
        v1Card.style.display = 'block';
        v1Darts.innerHTML = renderDartSequence(premium.v1);
        console.log('V1 displayed:', premium.v1);
    } else {
        v1Card.style.display = 'none';
    }

    // V2 Card
    const v2Card = document.getElementById('premium-v2-card');
    const v2Darts = document.getElementById('premium-v2-darts');
    if (premium && premium.v2) {
        v2Card.style.display = 'block';
        v2Darts.innerHTML = renderDartSequence(premium.v2);
        console.log('V2 displayed:', premium.v2);
    } else {
        v2Card.style.display = 'none';
    }

    // 2-Dart Card
    const tdCard = document.getElementById('premium-2dart-card');
    const tdDarts = document.getElementById('premium-2dart-darts');
    if (premium && premium.twoDart) {
        tdCard.style.display = 'block';
        tdDarts.innerHTML = renderDartSequence(premium.twoDart);
        console.log('2-Dart displayed:', premium.twoDart);
    } else {
        tdCard.style.display = 'none';
    }
}

// Change language and update UI
function switchLanguage(lang) {
    I18n.init(lang);
    I18n.applyTranslations();
    updateLanguageToggleButtons();
}

// Update active state of language toggle buttons
function updateLanguageToggleButtons() {
    const enBtn = document.getElementById('lang-toggle-en');
    const deBtn = document.getElementById('lang-toggle-de');

    if (enBtn && deBtn) {
        if (I18n.currentLang === 'en') {
            enBtn.classList.add('active');
            deBtn.classList.remove('active');
        } else {
            enBtn.classList.remove('active');
            deBtn.classList.add('active');
        }
    }
}

// Helper function to render dart sequence
function renderDartSequence(darts) {
    return darts.map(d => `<span class="dart-item">${d}</span>`).join('');
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load Premium Checkouts CSV
    window.PremiumCheckouts = {};
    fetch('Premium_Checkouts.csv')
        .then(r => r.text())
        .then(text => {
            const lines = text.trim().split('\n').slice(2); // 2 Header-Zeilen überspringen
            lines.forEach(line => {
                const cols = line.split(';').map(c => c.trim());
                const score = parseInt(cols[0]);
                if (!score) return;
                const v1 = [cols[1], cols[2], cols[3]].filter(c => c && c !== '-');
                const v2Raw = [cols[4], cols[5], cols[6]].filter(c => c && c !== '-');
                const tdRaw = [cols[7], cols[8]].filter(c => c && c !== '-');
                window.PremiumCheckouts[score] = {
                    v1: v1.length > 0 ? v1 : null,
                    v2: v2Raw.length > 0 ? v2Raw : null,
                    twoDart: tdRaw.length > 0 ? tdRaw : null,
                };
            });
            console.log('Premium Checkouts loaded:', Object.keys(window.PremiumCheckouts).length, 'scores');
        })
        .catch(err => console.error('Error loading Premium_Checkouts.csv:', err));

    // Language selection on first load
    let savedLang;
    try {
        savedLang = localStorage.getItem('dart-lang');
    } catch (e) {
        // localStorage not available
    }

    if (savedLang) {
        // Restore saved language and skip to start screen
        switchLanguage(savedLang);
        switchScreen('start');
    } else {
        // Show language selection screen
        const langEnBtn = document.getElementById('lang-en-btn');
        const langDeBtn = document.getElementById('lang-de-btn');

        if (langEnBtn) {
            langEnBtn.addEventListener('click', () => {
                switchLanguage('en');
                switchScreen('start');
            });
        }

        if (langDeBtn) {
            langDeBtn.addEventListener('click', () => {
                switchLanguage('de');
                switchScreen('start');
            });
        }
    }

    // Language toggle buttons (top right)
    const langToggleEn = document.getElementById('lang-toggle-en');
    const langToggleDe = document.getElementById('lang-toggle-de');

    if (langToggleEn) {
        langToggleEn.addEventListener('click', () => {
            switchLanguage('en');
        });
    }

    if (langToggleDe) {
        langToggleDe.addEventListener('click', () => {
            switchLanguage('de');
        });
    }

    // Start button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }

    // Game buttons
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDarts);
    }

    const skipBtn = document.getElementById('skip-btn');
    if (skipBtn) {
        skipBtn.addEventListener('click', skipTarget);
    }

    // Result button
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', nextRound);
    }

    // Toggle buttons
    document.getElementById('toggle-remaining-btn')?.addEventListener('click', toggleRemaining);
    document.getElementById('toggle-numbers-btn')?.addEventListener('click', toggleNumbers);

    // Dartboard click events
    document.addEventListener('dart-clicked', (e) => {
        const { notation, points } = e.detail;
        addDart(notation);
    });
});
