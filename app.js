const state = {
    screen: 'start',
    target: null,
    darts: [],
    remaining: 0,
    lastResult: null,
    gameEnded: false,
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
    const optimalSection = document.getElementById('optimal-section');
    const optimalDarts = document.getElementById('result-optimal-darts');

    // Show target number
    if (targetDisplay) targetDisplay.textContent = state.target;

    // Determine status
    const { valid } = state.lastResult;

    if (valid) {
        status.textContent = '✓ Geschafft!';
        status.className = 'result-status optimal';
    } else {
        status.textContent = '✗ Nicht geschafft';
        status.className = 'result-status invalid';
    }

    // Show your darts
    yourDarts.innerHTML = state.darts.map((dart) => `<div class="dart-item">${dart}</div>`).join('');

    // Show other variants
    const variants = Checkouts.getCheckoutVariants(state.target);
    const otherVariants = variants.filter(
        (v) => JSON.stringify(v) !== JSON.stringify(state.darts)
    );

    if (otherVariants.length > 0) {
        optimalSection.style.display = 'block';
        // Update label
        const label = optimalSection.querySelector('.label');
        if (label) label.textContent = 'Other Variants';

        // Show variants as separate items
        optimalDarts.innerHTML = otherVariants
            .map(
                (variant) =>
                    `<div class="variant-item">${variant.map((dart) => `<span class="dart-item">${dart}</span>`).join(' + ')}</div>`
            )
            .join('');
    } else {
        optimalSection.style.display = 'none';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
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

    // Dartboard click events
    document.addEventListener('dart-clicked', (e) => {
        const { notation, points } = e.detail;
        addDart(notation);
    });
});
