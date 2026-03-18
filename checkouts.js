const IMPOSSIBLE_CHECKOUTS = new Set([169, 168, 166, 165, 163, 162, 159]);

const OPTIMAL_CHECKOUTS = {
    2: ["D1"],
    3: ["S1", "D1"],
    4: ["D2"],
    5: ["S1", "D2"],
    6: ["D3"],
    7: ["S1", "D3"],
    8: ["D4"],
    9: ["S1", "D4"],
    10: ["D5"],
    11: ["S1", "D5"],
    12: ["D6"],
    13: ["S1", "D6"],
    14: ["D7"],
    15: ["S1", "D7"],
    16: ["D8"],
    17: ["S1", "D8"],
    18: ["D9"],
    19: ["S1", "D9"],
    20: ["D10"],
    21: ["S1", "D10"],
    22: ["D11"],
    23: ["S1", "D11"],
    24: ["D12"],
    25: ["S1", "D12"],
    26: ["D13"],
    27: ["S1", "D13"],
    28: ["D14"],
    29: ["S1", "D14"],
    30: ["D15"],
    31: ["S1", "D15"],
    32: ["D16"],
    33: ["S1", "D16"],
    34: ["D17"],
    35: ["S1", "D17"],
    36: ["D18"],
    37: ["S1", "D18"],
    38: ["D19"],
    39: ["S1", "D19"],
    40: ["D20"],
    41: ["S1", "D20"],
    42: ["T14", "D6"],
    43: ["T15", "D4"],
    44: ["T12", "D8"],
    45: ["T15", "D5"],
    46: ["T18", "D5"],
    47: ["T17", "D6"],
    48: ["T16", "D6"],
    49: ["T19", "D5"],
    50: ["D-Bull"],
    51: ["T17", "D8"],
    52: ["T20", "D6"],
    53: ["T19", "D7"],
    54: ["T18", "D8"],
    55: ["T19", "D8"],
    56: ["T20", "D8"],
    57: ["T19", "D10"],
    58: ["T20", "D9"],
    59: ["T19", "D11"],
    60: ["T20", "D10"],
    61: ["T20", "S1", "D10"],
    62: ["T20", "D11"],
    63: ["T19", "D12"],
    64: ["T20", "D12"],
    65: ["T19", "D13"],
    66: ["T20", "D13"],
    67: ["T19", "D14"],
    68: ["T20", "D14"],
    69: ["T19", "D15"],
    70: ["T20", "D15"],
    71: ["T19", "D16"],
    72: ["T20", "D16"],
    73: ["T19", "D17"],
    74: ["T20", "D17"],
    75: ["T19", "D18"],
    76: ["T20", "D18"],
    77: ["T19", "D19"],
    78: ["T20", "D19"],
    79: ["T19", "D20"],
    80: ["T20", "D20"],
    81: ["T17", "D15"],
    82: ["T20", "D11"],
    83: ["T17", "D16"],
    84: ["T20", "D12"],
    85: ["T17", "D17"],
    86: ["T18", "D16"],
    87: ["T17", "D18"],
    88: ["T16", "D20"],
    89: ["T19", "D16"],
    90: ["T20", "D15"],
    91: ["T17", "D20"],
    92: ["T20", "D16"],
    93: ["T19", "D18"],
    94: ["T20", "D17"],
    95: ["T19", "D19"],
    96: ["T20", "D18"],
    97: ["T19", "D20"],
    98: ["T20", "D19"],
    99: ["T19", "S20", "D20"],
    100: ["T20", "D20"],
    101: ["T20", "S1", "D20"],
    102: ["T20", "S2", "D20"],
    103: ["T20", "S3", "D20"],
    104: ["T20", "S4", "D20"],
    105: ["T20", "S5", "D20"],
    106: ["T20", "S6", "D20"],
    107: ["T20", "S7", "D20"],
    108: ["T20", "S8", "D20"],
    109: ["T20", "S9", "D20"],
    110: ["T20", "D10", "D20"],
    111: ["T20", "S11", "D20"],
    112: ["T20", "S12", "D20"],
    113: ["T20", "S13", "D20"],
    114: ["T20", "S14", "D20"],
    115: ["T20", "S15", "D20"],
    116: ["T20", "S16", "D20"],
    117: ["T20", "S17", "D20"],
    118: ["T20", "S18", "D20"],
    119: ["T20", "S19", "D20"],
    120: ["T20", "D20", "D20"],
    121: ["T19", "T14", "D12"],
    122: ["T20", "T14", "D12"],
    123: ["T20", "T13", "D12"],
    124: ["T20", "T12", "D14"],
    125: ["T20", "T15", "D10"],
    126: ["T20", "T14", "D12"],
    127: ["T20", "T17", "D6"],
    128: ["T20", "T16", "D8"],
    129: ["T20", "T13", "D15"],
    130: ["T20", "T18", "D8"],
    131: ["T20", "T17", "D12"],
    132: ["T20", "T14", "D18"],
    133: ["T20", "T19", "D8"],
    134: ["T20", "T18", "D10"],
    135: ["T20", "T17", "D15"],
    136: ["T20", "T20", "D8"],
    137: ["T20", "T19", "D10"],
    138: ["T20", "T20", "D9"],
    139: ["T20", "T19", "D13"],
    140: ["T20", "T20", "D10"],
    141: ["T20", "T19", "D14"],
    142: ["T20", "T20", "D11"],
    143: ["T20", "T19", "D16"],
    144: ["T20", "T20", "D12"],
    145: ["T20", "T19", "D17"],
    146: ["T20", "T20", "D13"],
    147: ["T20", "T19", "D18"],
    148: ["T20", "T20", "D14"],
    149: ["T20", "T19", "D20"],
    150: ["T20", "T20", "D15"],
    151: ["T20", "T20", "S1", "D15"],
    152: ["T20", "T20", "D16"],
    153: ["T20", "T20", "S1", "D16"],
    154: ["T20", "T20", "D17"],
    155: ["T20", "T20", "S5", "D17"],
    156: ["T20", "T20", "D18"],
    157: ["T20", "T20", "S1", "D18"],
    158: ["T20", "T20", "D19"],
    160: ["T20", "T20", "D20"],
    161: ["T20", "T20", "S1", "D20"],
    164: ["T20", "T20", "S4", "D20"],
    167: ["T20", "T20", "S7", "D20"],
    170: ["T20", "T20", "D-Bull"],
};

function parseScore(notation) {
    if (!notation || typeof notation !== 'string') return 0;

    const match = notation.match(/^([DTS]?)(\d+|-Bull)$/);
    if (!match) return 0;

    const [, modifier, value] = match;
    const numValue = value === '-Bull' ? 50 : parseInt(value, 10);

    if (numValue < 1 || numValue > 50) return 0;

    switch (modifier) {
        case 'D':
            return value === '-Bull' ? 50 : numValue * 2;
        case 'T':
            return value === '-Bull' ? 0 : numValue * 3;
        case 'S':
            return numValue;
        case '':
            // Single (no prefix)
            return numValue;
        default:
            return 0;
    }
}

function isDouble(notation) {
    if (!notation || typeof notation !== 'string') return false;
    return notation.startsWith('D');
}

function validateCheckout(darts, target) {
    if (!Array.isArray(darts) || darts.length === 0 || darts.length > 3) {
        return { valid: false, isOptimal: false, optimal: null };
    }

    // Calculate total
    let total = 0;
    for (const dart of darts) {
        total += parseScore(dart);
    }

    // Must equal target
    if (total !== target) {
        return { valid: false, isOptimal: false, optimal: null };
    }

    // Last dart must be a double
    if (!isDouble(darts[darts.length - 1])) {
        return { valid: false, isOptimal: false, optimal: null };
    }

    // Check if it's optimal
    const optimal = OPTIMAL_CHECKOUTS[target];
    const isOptimal = optimal && JSON.stringify(darts) === JSON.stringify(optimal);

    return {
        valid: true,
        isOptimal,
        optimal: optimal || null,
    };
}

// Generate all possible dart notations
function getAllDarts() {
    const darts = [];
    // Singles 1-20
    for (let i = 1; i <= 20; i++) {
        darts.push(`S${i}`);
    }
    // Doubles 1-20 and Bull
    for (let i = 1; i <= 20; i++) {
        darts.push(`D${i}`);
    }
    // Triples 1-20
    for (let i = 1; i <= 20; i++) {
        darts.push(`T${i}`);
    }
    // Bull and Bullseye
    darts.push('Bull');
    darts.push('D-Bull');
    return darts;
}

// Get checkout variants for a target
function getCheckoutVariants(target) {
    const variants = new Set();
    const allDarts = getAllDarts();

    // Try all combinations of 1-3 darts
    for (let i = 0; i < allDarts.length; i++) {
        const d1 = allDarts[i];
        const p1 = parseScore(d1);

        // Single dart checkout
        if (p1 === target && isDouble(d1)) {
            variants.add(JSON.stringify([d1]));
        }

        // Two dart checkout
        for (let j = 0; j < allDarts.length; j++) {
            const d2 = allDarts[j];
            const p2 = parseScore(d2);

            if (p1 + p2 === target && isDouble(d2)) {
                variants.add(JSON.stringify([d1, d2]));
            }

            // Three dart checkout
            for (let k = 0; k < allDarts.length; k++) {
                const d3 = allDarts[k];
                const p3 = parseScore(d3);

                if (p1 + p2 + p3 === target && isDouble(d3)) {
                    variants.add(JSON.stringify([d1, d2, d3]));
                }
            }
        }
    }

    // Convert back to arrays and sort by preference
    const variantArrays = Array.from(variants).map(v => JSON.parse(v));

    // Sort: prefer fewer darts, then T20, then T19, etc.
    variantArrays.sort((a, b) => {
        // Fewer darts first
        if (a.length !== b.length) return a.length - b.length;

        // Prefer T20 in first position
        const aScore = scoreVariant(a);
        const bScore = scoreVariant(b);
        return bScore - aScore;
    });

    // Return top 3 variants
    return variantArrays.slice(0, 3);
}

// Score a variant for sorting (higher = better)
function scoreVariant(darts) {
    let score = 0;
    for (let i = 0; i < darts.length; i++) {
        const dart = darts[i];
        // Prefer T20
        if (dart === 'T20') score += 100;
        // Prefer T19
        else if (dart === 'T19') score += 90;
        // Prefer T18
        else if (dart === 'T18') score += 80;
        // Prefer high doubles
        else if (dart.startsWith('D')) {
            const num = parseInt(dart.substring(1), 10);
            score += num || 50;
        }
    }
    return score;
}

window.Checkouts = {
    OPTIMAL_CHECKOUTS,
    IMPOSSIBLE_CHECKOUTS,
    validateCheckout,
    parseScore,
    isDouble,
    getCheckoutVariants,
};
