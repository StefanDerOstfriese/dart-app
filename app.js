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

// Navigate to a section
function navigateTo(screen) {
    switchScreen(screen);
    // 'play-game' and 'play-result' map back to 'play-setup' nav item
    const navScreen = (screen === 'play-game' || screen === 'play-result') ? 'play-setup' : screen;
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === navScreen);
    });
    if (screen === 'premium') renderPremiumPage();
    closeMenu();
}

// ─── Checkout Hint ───────────────────────────────────────────────────

let hintsVisible = true;

function renderCheckoutHint(remaining, panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const invalid = !remaining || remaining <= 0 || remaining > 170
        || Checkouts.IMPOSSIBLE_CHECKOUTS.has(remaining);

    if (invalid) {
        panel.classList.remove('visible');
        panel.innerHTML = '';
        return;
    }

    if (!hintsVisible) {
        panel.innerHTML = `
            <div class="hint-inner hint-inner-collapsed">
                <svg class="hint-icon" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="13" y1="3" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="hint-label">Checkout</span>
                <button class="hint-toggle" data-panel="${panelId}">Show</button>
            </div>`;
        panel.classList.add('visible');
        panel.querySelector('.hint-toggle').addEventListener('click', () => {
            hintsVisible = true;
            renderCheckoutHint(remaining, panelId);
        });
        return;
    }

    const optimal = Checkouts.OPTIMAL_CHECKOUTS[remaining];
    if (!optimal) {
        panel.classList.remove('visible');
        panel.innerHTML = '';
        return;
    }

    const premium = window.PremiumCheckouts?.[remaining];

    const makeChips = (darts) =>
        darts.map(d => `<span class="pp-chip ${dartChipClass(d)}">${d}</span>`).join('');

    let variantsHtml = `
        <div class="hint-variant">
            <span class="hint-variant-tag">Opt</span>
            <div class="hint-chips">${makeChips(optimal)}</div>
        </div>`;

    if (premium?.v1 && JSON.stringify(premium.v1) !== JSON.stringify(optimal)) {
        variantsHtml += `
        <div class="hint-variant">
            <span class="hint-variant-tag">V1</span>
            <div class="hint-chips">${makeChips(premium.v1)}</div>
        </div>`;
    }

    if (premium?.twoDart) {
        variantsHtml += `
        <div class="hint-variant">
            <span class="hint-variant-tag">2D</span>
            <div class="hint-chips">${makeChips(premium.twoDart)}</div>
        </div>`;
    }

    panel.innerHTML = `
        <div class="hint-inner">
            <div class="hint-header">
                <svg class="hint-icon" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
                    <line x1="13" y1="3" x2="10" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <span class="hint-label">Checkout</span>
            </div>
            <div class="hint-variants">${variantsHtml}</div>
            <button class="hint-toggle" id="${panelId}-toggle" data-panel="${panelId}">Hide</button>
        </div>`;

    panel.classList.add('visible');

    panel.querySelector('.hint-toggle').addEventListener('click', () => {
        hintsVisible = false;
        renderCheckoutHint(remaining, panelId);
    });
}

function showHints(remaining, panelId) {
    hintsVisible = true;
    renderCheckoutHint(remaining, panelId);
}

// Return CSS class for a dart chip
function dartChipClass(dart) {
    if (!dart) return 'chip-single';
    if (dart === 'S0') return 'chip-miss';
    if (dart.startsWith('T')) return 'chip-treble';
    if (dart.startsWith('D')) return 'chip-double';
    if (dart === 'Bull' || dart === 'DB' || dart === 'D-Bull' || dart === 'SB') return 'chip-bull';
    return 'chip-single';
}

// Render the Premium Checkouts page
function renderPremiumPage() {
    const container = document.getElementById('premium-page-content');
    if (!container) return;

    const data = window.PremiumCheckouts;
    if (!data || Object.keys(data).length === 0) {
        container.innerHTML = `<div class="pp-loading">${I18n.t('pp_loading')}</div>`;
        return;
    }

    const ranges = [
        { key: 'pp_range_big',  min: 141, max: 170 },
        { key: 'pp_range_high', min: 101, max: 140 },
        { key: 'pp_range_mid',  min:  61, max: 100 },
        { key: 'pp_range_low',  min:   2, max:  60 },
    ];

    container.innerHTML = '';

    ranges.forEach(range => {
        const scores = Object.keys(data)
            .map(Number)
            .filter(s => s >= range.min && s <= range.max)
            .sort((a, b) => b - a);

        if (scores.length === 0) return;

        const section = document.createElement('div');
        section.className = 'pp-section';
        section.innerHTML = `
            <div class="pp-range-header">
                <span class="pp-range-title">${I18n.t(range.key)}</span>
                <span class="pp-range-sub">${range.max} – ${range.min}</span>
                <span class="pp-count">${scores.length}</span>
            </div>
            <div class="pp-grid" id="pp-grid-${range.key}"></div>
        `;

        const grid = section.querySelector('.pp-grid');

        scores.forEach(score => {
            const entry = data[score];
            const card = document.createElement('div');
            card.className = 'pp-card';

            let variantsHtml = '';

            if (entry.twoDart) {
                variantsHtml += buildVariantHtml(entry.twoDart, 'td', I18n.t('pp_2dart'));
            }
            if (entry.v1) {
                variantsHtml += buildVariantHtml(entry.v1, 'v1', 'V1');
            }
            if (entry.v2) {
                variantsHtml += buildVariantHtml(entry.v2, 'v2', 'V2');
            }

            card.innerHTML = `
                <div class="pp-score">${score}</div>
                <div class="pp-divider"></div>
                <div class="pp-variants">${variantsHtml}</div>
            `;

            grid.appendChild(card);
        });

        container.appendChild(section);
    });
}

function buildVariantHtml(darts, badgeClass, label) {
    const chips = darts.map(d =>
        `<span class="pp-chip ${dartChipClass(d)}">${d}</span>`
    ).join('');
    return `<div class="pp-variant">
        <span class="pp-badge ${badgeClass}">${label}</span>
        <div class="pp-darts">${chips}</div>
    </div>`;
}

// Build know-how lists from i18n data
function buildKnowHow() {
    [
        { id: 'kh-s2-list', key: 'kh_s2_items' },
        { id: 'kh-s3-list', key: 'kh_s3_items' },
        { id: 'kh-s4-list', key: 'kh_s4_items' },
    ].forEach(({ id, key }) => {
        const el = document.getElementById(id);
        if (!el) return;
        const items = I18n.translations[I18n.currentLang]?.[key] ||
                      I18n.translations['en'][key] || [];
        el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    });
}

// Mobile menu toggle
function openMenu() {
    document.getElementById('mobile-menu').classList.add('open');
    document.getElementById('menu-overlay').classList.add('visible');
}

function closeMenu() {
    document.getElementById('mobile-menu').classList.remove('open');
    document.getElementById('menu-overlay').classList.remove('visible');
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

    renderCheckoutHint(state.remaining, 'trainer-hint-panel');
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

    renderCheckoutHint(state.remaining, 'trainer-hint-panel');
}

function renderResultScreen() {
    const targetDisplay = document.getElementById('result-target-number');
    const status = document.getElementById('result-status');
    const yourDarts = document.getElementById('result-your-darts');

    // Show target number
    if (targetDisplay) targetDisplay.textContent = state.target;

    // Determine status
    const { valid } = state.lastResult;
    const premium = valid && isPremiumCheckout(state.darts, state.target);

    if (premium) {
        status.textContent = I18n.t('resultPremium');
        status.className = 'result-status-banner premium';
        launchConfetti();
    } else if (valid) {
        status.textContent = I18n.t('resultSuccess');
        status.className = 'result-status-banner optimal';
    } else {
        status.textContent = I18n.t('resultFail');
        status.className = 'result-status-banner invalid';
    }

    // Show your darts
    yourDarts.innerHTML = renderDartSequence(state.darts);

    // Show premium checkouts
    const premiumData = window.PremiumCheckouts[state.target];

    // V1 Card
    const v1Card = document.getElementById('premium-v1-card');
    const v1Darts = document.getElementById('premium-v1-darts');
    if (premiumData && premiumData.v1) {
        v1Card.style.display = 'block';
        v1Darts.innerHTML = renderDartSequence(premiumData.v1);
    } else {
        v1Card.style.display = 'none';
    }

    // V2 Card
    const v2Card = document.getElementById('premium-v2-card');
    const v2Darts = document.getElementById('premium-v2-darts');
    if (premiumData && premiumData.v2) {
        v2Card.style.display = 'block';
        v2Darts.innerHTML = renderDartSequence(premiumData.v2);
    } else {
        v2Card.style.display = 'none';
    }

    // 2-Dart Card
    const tdCard = document.getElementById('premium-2dart-card');
    const tdDarts = document.getElementById('premium-2dart-darts');
    if (premiumData && premiumData.twoDart) {
        tdCard.style.display = 'block';
        tdDarts.innerHTML = renderDartSequence(premiumData.twoDart);
    } else {
        tdCard.style.display = 'none';
    }
}

// Change language and update UI
function switchLanguage(lang) {
    I18n.init(lang);
    I18n.applyTranslations();
    updateLanguageToggleButtons();
    if (state.screen === 'premium') renderPremiumPage();
}

// Update active state of all language toggle buttons
function updateLanguageToggleButtons() {
    document.querySelectorAll('.lang-toggle-btn[data-lang="en"]').forEach(btn =>
        btn.classList.toggle('active', I18n.currentLang === 'en'));
    document.querySelectorAll('.lang-toggle-btn[data-lang="de"]').forEach(btn =>
        btn.classList.toggle('active', I18n.currentLang === 'de'));
}

// Helper function to render dart sequence
function renderDartSequence(darts) {
    return darts.map(d => `<span class="dart-item ${dartChipClass(d)}">${d}</span>`).join('');
}

// Check if the played darts match a premium checkout
function isPremiumCheckout(darts, target) {
    const premium = window.PremiumCheckouts[target];
    if (!premium) return false;
    const seq = JSON.stringify(darts);
    return (
        (premium.v1 && JSON.stringify(premium.v1) === seq) ||
        (premium.v2 && JSON.stringify(premium.v2) === seq) ||
        (premium.twoDart && JSON.stringify(premium.twoDart) === seq)
    );
}

// ─────────────────────────────────────────────────────────────────────
//  x01 GAME ENGINE
// ─────────────────────────────────────────────────────────────────────

const x01State = {
    active: false,
    startingScore: 501,
    players: [],           // [{id, name, score}]
    currentPlayerIdx: 0,
    currentDarts: [],      // notations thrown this turn (max 3)
    turnStartScore: 0,     // player's score at start of turn (for bust reset)
    isBust: false,
    gameOver: false,
    winner: null,
};

// Temporary setup form data (persists between setup visits)
const x01SetupData = {
    startingScore: 501,
    playerNames: ['Player 1', 'Player 2'],
};

// ─── Setup screen ────────────────────────────────────────────────────

function initX01Setup() {
    renderSetupPlayers();
    document.querySelectorAll('.setup-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.mode === String(x01SetupData.startingScore));
    });
}

function renderSetupPlayers() {
    const container = document.getElementById('setup-players');
    if (!container) return;
    container.innerHTML = '';

    x01SetupData.playerNames.forEach((name, idx) => {
        const card = document.createElement('div');
        card.className = 'setup-player-card';
        card.innerHTML = `
            <span class="setup-player-num">${idx + 1}</span>
            <input
                class="setup-player-name-input"
                type="text"
                value="${name.replace(/"/g, '&quot;')}"
                maxlength="20"
                placeholder="Player ${idx + 1}"
                data-idx="${idx}"
            />
            ${x01SetupData.playerNames.length > 1 ? `
                <button class="setup-player-remove" data-idx="${idx}" aria-label="Remove player">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            ` : ''}
        `;
        container.appendChild(card);
    });

    container.querySelectorAll('.setup-player-name-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.idx);
            x01SetupData.playerNames[idx] = e.target.value;
        });
    });

    container.querySelectorAll('.setup-player-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            x01SetupData.playerNames.splice(idx, 1);
            renderSetupPlayers();
        });
    });

    const addBtn = document.getElementById('add-player-btn');
    if (addBtn) addBtn.disabled = x01SetupData.playerNames.length >= 4;
}

// ─── Game start ──────────────────────────────────────────────────────

function startX01Game() {
    const names = x01SetupData.playerNames.map(n => n.trim()).filter(n => n);
    if (!names.length) return;

    x01State.active = true;
    x01State.startingScore = x01SetupData.startingScore;
    x01State.players = names.map((name, i) => ({
        id: i,
        name: name || `Player ${i + 1}`,
        score: x01SetupData.startingScore,
    }));
    x01State.currentPlayerIdx = 0;
    x01State.currentDarts = [];
    x01State.turnStartScore = x01State.players[0].score;
    x01State.isBust = false;
    x01State.gameOver = false;
    x01State.winner = null;

    renderX01Screen();
    navigateTo('play-game');
}

// ─── Dart input ──────────────────────────────────────────────────────

function x01AddDart(notation) {
    if (x01State.gameOver) return;
    if (x01State.isBust) return;
    if (x01State.currentDarts.length >= 3) return;

    const player = x01State.players[x01State.currentPlayerIdx];
    const points = Checkouts.parseScore(notation);
    const newScore = player.score - points;

    x01State.currentDarts.push(notation);

    // Check bust: below 0 or exactly 1
    if (newScore < 0 || newScore === 1) {
        x01State.isBust = true;
        // Show would-be score briefly, then will reset on Next
        player.score = newScore;
        renderX01Screen();
        x01EnableNext(true);
        return;
    }

    // Check win: 0 with a double
    if (newScore === 0) {
        if (Checkouts.isDouble(notation)) {
            player.score = 0;
            x01State.gameOver = true;
            x01State.winner = player;
            renderX01Screen();
            setTimeout(() => {
                renderX01WinnerScreen(player);
                launchConfetti();
                navigateTo('play-result');
            }, 700);
            return;
        } else {
            // Hit 0 but not on a double → bust
            x01State.isBust = true;
            player.score = newScore;
            renderX01Screen();
            x01EnableNext(true);
            return;
        }
    }

    player.score = newScore;
    renderX01Screen();

    if (x01State.currentDarts.length === 3) {
        x01EnableNext(true);
    }
}

function x01UndoDart() {
    if (!x01State.currentDarts.length) return;

    x01State.currentDarts.pop();
    x01State.isBust = false;

    const player = x01State.players[x01State.currentPlayerIdx];
    const turnScore = x01State.currentDarts.reduce(
        (sum, n) => sum + Checkouts.parseScore(n), 0
    );
    player.score = x01State.turnStartScore - turnScore;

    renderX01Screen();
    x01EnableNext(x01State.currentDarts.length >= 3);
}

function x01EnableNext(enabled) {
    const btn = document.getElementById('x01-next-btn');
    if (btn) btn.disabled = !enabled;
}

// ─── Turn management ─────────────────────────────────────────────────

function x01NextPlayer() {
    if (x01State.gameOver) return;

    const player = x01State.players[x01State.currentPlayerIdx];

    // On bust: reset to score before this turn
    if (x01State.isBust) {
        player.score = x01State.turnStartScore;
    }

    // Advance
    x01State.currentPlayerIdx = (x01State.currentPlayerIdx + 1) % x01State.players.length;
    x01State.currentDarts = [];
    x01State.isBust = false;
    x01State.turnStartScore = x01State.players[x01State.currentPlayerIdx].score;

    x01EnableNext(false);
    renderX01Screen();
}

function restartX01Game() {
    x01State.players.forEach(p => { p.score = x01State.startingScore; });
    x01State.currentPlayerIdx = 0;
    x01State.currentDarts = [];
    x01State.turnStartScore = x01State.players[0].score;
    x01State.isBust = false;
    x01State.gameOver = false;
    x01State.winner = null;

    x01EnableNext(false);
    renderX01Screen();
    navigateTo('play-game');
}

// ─── Rendering ───────────────────────────────────────────────────────

function renderX01Screen() {
    renderX01Scoreboard();
    renderX01Darts();
    renderX01TurnScore();

    // Show checkout hint for current player's remaining score
    const currentPlayer = x01State.players[x01State.currentPlayerIdx];
    if (currentPlayer && !x01State.isBust && !x01State.gameOver) {
        renderCheckoutHint(currentPlayer.score, 'x01-hint-panel');
    } else {
        const p = document.getElementById('x01-hint-panel');
        if (p) { p.classList.remove('visible'); p.innerHTML = ''; }
    }

    const blocked = x01State.isBust || x01State.currentDarts.length >= 3 || x01State.gameOver;
    const missBtn = document.getElementById('x01-miss-btn');
    if (missBtn) missBtn.disabled = blocked;
    const undoBtn = document.getElementById('x01-undo-btn');
    if (undoBtn) undoBtn.disabled = !x01State.currentDarts.length || x01State.gameOver;
}

function renderX01Scoreboard() {
    const container = document.getElementById('x01-scoreboard');
    if (!container) return;
    container.innerHTML = '';

    x01State.players.forEach((player, idx) => {
        const isActive = idx === x01State.currentPlayerIdx;
        const isBust = isActive && x01State.isBust;
        let cls = 'x01-player-card';
        if (isActive) cls += ' active';
        if (isBust) cls += ' bust';

        const card = document.createElement('div');
        card.className = cls;
        card.innerHTML = `
            <div class="x01-player-name">${player.name}</div>
            <div class="x01-player-score">${player.score}</div>
            <div class="${isBust ? 'x01-bust-tag' : (isActive ? 'x01-active-tag' : '')}">${isBust ? 'BUST' : (isActive ? '▶' : '')}</div>
        `;
        container.appendChild(card);
    });
}

function renderX01Darts() {
    for (let i = 0; i < 3; i++) {
        const slot = document.getElementById(`x01-dart-${i}`);
        if (!slot) continue;
        const notation = x01State.currentDarts[i] || '';
        slot.textContent = notation === 'S0' ? 'Miss' : notation;
        const isBustDart = x01State.isBust && i === x01State.currentDarts.length - 1;
        slot.className = isBustDart ? 'dart-slot bust-slot' : 'dart-slot';
    }
}

function renderX01TurnScore() {
    const el = document.getElementById('x01-turn-score');
    if (!el) return;
    if (x01State.isBust) {
        el.textContent = 'BUST';
        el.classList.add('bust-score');
    } else {
        el.classList.remove('bust-score');
        const pts = x01State.currentDarts.reduce(
            (sum, n) => sum + Checkouts.parseScore(n), 0
        );
        el.textContent = pts;
    }
}

function renderX01WinnerScreen(player) {
    const nameEl = document.getElementById('winner-name');
    const gameEl = document.getElementById('winner-game');
    if (nameEl) nameEl.textContent = player.name;
    if (gameEl) gameEl.textContent = x01State.startingScore + ' · Double Out';
}

// ─────────────────────────────────────────────────────────────────────
// Launch confetti animation for premium checkouts
function launchConfetti() {
    const colors = ['#ffd700', '#ff5a1f', '#22d35a', '#ff3b5c', '#3b9dff', '#c084fc', '#ffffff'];
    const container = document.querySelector('.result-layout');
    if (!container) return;
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    for (let i = 0; i < 80; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const size = 5 + Math.random() * 8;
        const isCircle = Math.random() > 0.5;
        el.style.cssText = `
            left: ${Math.random() * 100}%;
            background-color: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 0.8}s;
            animation-duration: ${1.2 + Math.random() * 1}s;
            width: ${size}px;
            height: ${isCircle ? size : size * 0.4}px;
            border-radius: ${isCircle ? '50%' : '1px'};
            opacity: 0.9;
        `;
        container.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
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
                const cols = line.split(';').map(c => c.trim().split('/')[0]);
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
        })
        .catch(err => console.error('Error loading Premium_Checkouts.csv:', err));

    // Init language
    let savedLang;
    try {
        savedLang = localStorage.getItem('dart-lang');
    } catch (e) {}
    switchLanguage(savedLang || 'en');

    // Start game directly
    startGame();
    buildKnowHow();

    // Init x01 setup form
    initX01Setup();

    // Desktop nav items
    document.getElementById('nav-play')?.addEventListener('click', () => navigateTo('play-setup'));
    document.getElementById('nav-train')?.addEventListener('click', () => navigateTo('game'));
    document.getElementById('nav-knowhow')?.addEventListener('click', () => navigateTo('knowhow'));
    document.getElementById('nav-premium')?.addEventListener('click', () => navigateTo('premium'));

    // Mobile nav items (inside dropdown)
    document.querySelectorAll('.mobile-menu .nav-item[data-screen]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo(btn.dataset.screen));
    });

    // Menu toggle
    document.getElementById('hamburger')?.addEventListener('click', openMenu);
    document.getElementById('menu-overlay')?.addEventListener('click', closeMenu);

    // Language toggle buttons (all — desktop + mobile)
    document.querySelectorAll('.lang-toggle-btn[data-lang="en"]').forEach(btn =>
        btn.addEventListener('click', () => { switchLanguage('en'); closeMenu(); }));
    document.querySelectorAll('.lang-toggle-btn[data-lang="de"]').forEach(btn =>
        btn.addEventListener('click', () => { switchLanguage('de'); closeMenu(); }));

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

    // x01 setup controls
    document.getElementById('setup-mode-chips')?.addEventListener('click', (e) => {
        const chip = e.target.closest('.setup-chip');
        if (!chip) return;
        x01SetupData.startingScore = parseInt(chip.dataset.mode);
        document.querySelectorAll('.setup-chip').forEach(c =>
            c.classList.toggle('active', c.dataset.mode === chip.dataset.mode));
    });

    document.getElementById('add-player-btn')?.addEventListener('click', () => {
        if (x01SetupData.playerNames.length >= 4) return;
        x01SetupData.playerNames.push(`Player ${x01SetupData.playerNames.length + 1}`);
        renderSetupPlayers();
    });

    document.getElementById('start-x01-btn')?.addEventListener('click', startX01Game);

    // x01 game controls
    document.getElementById('x01-miss-btn')?.addEventListener('click', () => x01AddDart('S0'));
    document.getElementById('x01-undo-btn')?.addEventListener('click', x01UndoDart);
    document.getElementById('x01-next-btn')?.addEventListener('click', x01NextPlayer);

    // x01 result controls
    document.getElementById('play-again-btn')?.addEventListener('click', restartX01Game);
    document.getElementById('new-game-btn')?.addEventListener('click', () => navigateTo('play-setup'));

    // Internal nav links (e.g. Know-How → Premium)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-nav]');
        if (link) navigateTo(link.dataset.nav);
    });

    // Dartboard click events — route to active mode
    document.addEventListener('dart-clicked', (e) => {
        const { notation } = e.detail;
        if (state.screen === 'game') {
            addDart(notation);
        } else if (state.screen === 'play-game') {
            x01AddDart(notation);
        }
    });
});
