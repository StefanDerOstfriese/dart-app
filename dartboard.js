const DARTBOARD_CONFIG = {
    cx: 300,
    cy: 300,
    bullseye: 26,
    bull: 45.5,
    tripleInner: 126.1,
    tripleOuter: 149.5,
    doubleInner: 218.4,
    doubleOuter: 241.8,
    border: 253.5,
};

const SEGMENT_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const SEGMENTS_COUNT = SEGMENT_NUMBERS.length;
const SEGMENT_ANGLE = 360 / SEGMENTS_COUNT; // 18°

const COLORS = {
    single: {
        dark: '#2a2a2a',
        light: '#e8d5c4',
    },
    double: {
        red: '#c1272d',
        green: '#1a5e2d',
    },
    triple: {
        red: '#c1272d',
        green: '#1a5e2d',
    },
};

function makeAnnularWedge(cx, cy, r1, r2, startDeg, endDeg) {
    const start = ((startDeg - 90) * Math.PI) / 180;
    const end = ((endDeg - 90) * Math.PI) / 180;

    const x1 = cx + r1 * Math.cos(start);
    const y1 = cy + r1 * Math.sin(start);
    const x2 = cx + r2 * Math.cos(start);
    const y2 = cy + r2 * Math.sin(start);
    const x3 = cx + r2 * Math.cos(end);
    const y3 = cy + r2 * Math.sin(end);
    const x4 = cx + r1 * Math.cos(end);
    const y4 = cy + r1 * Math.sin(end);

    const largeArc = endDeg - startDeg > 180 ? 1 : 0;

    return [
        `M ${x1} ${y1}`,
        `L ${x2} ${y2}`,
        `A ${r2} ${r2} 0 ${largeArc} 1 ${x3} ${y3}`,
        `L ${x4} ${y4}`,
        `A ${r1} ${r1} 0 ${largeArc} 0 ${x1} ${y1}`,
        'Z',
    ].join(' ');
}

function generateDartboard() {
    const svg = document.getElementById('dartboard');
    if (!svg) return;

    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 600 600');

    const { cx, cy, bullseye, bull, tripleInner, tripleOuter, doubleInner, doubleOuter, border } = DARTBOARD_CONFIG;

    // Segments (offset -9° so that 20 is centered at top 0°)
    const segmentStartAngle = -9;
    for (let i = 0; i < SEGMENTS_COUNT; i++) {
        const number = SEGMENT_NUMBERS[i];
        const startAngle = (segmentStartAngle + i * SEGMENT_ANGLE) % 360;
        const endAngle = (segmentStartAngle + (i + 1) * SEGMENT_ANGLE) % 360;
        let midAngle = (startAngle + endAngle) / 2;
        if (midAngle < 0) midAngle += 360;

        const isAlternating = i % 2 === 0;

        // Single (inner single)
        const singleColor = isAlternating ? COLORS.single.dark : COLORS.single.light;
        const singlePath = makeAnnularWedge(cx, cy, bull, tripleInner, startAngle, endAngle);
        const singleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const singleSegment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        singleSegment.setAttribute('d', singlePath);
        singleSegment.setAttribute('fill', singleColor);
        singleSegment.setAttribute('stroke', '#000');
        singleSegment.setAttribute('stroke-width', '0.5');
        singleSegment.setAttribute('class', 'dartboard-segment');
        singleSegment.setAttribute('data-notation', `S${number}`);
        singleSegment.setAttribute('data-number', number);
        singleSegment.setAttribute('data-type', 'single');
        singleGroup.appendChild(singleSegment);
        svg.appendChild(singleGroup);

        // Triple
        const tripleColor = isAlternating ? COLORS.triple.red : COLORS.triple.green;
        const triplePath = makeAnnularWedge(cx, cy, tripleInner, tripleOuter, startAngle, endAngle);
        const tripleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const tripleSegment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tripleSegment.setAttribute('d', triplePath);
        tripleSegment.setAttribute('fill', tripleColor);
        tripleSegment.setAttribute('stroke', '#000');
        tripleSegment.setAttribute('stroke-width', '0.5');
        tripleSegment.setAttribute('class', 'dartboard-segment');
        tripleSegment.setAttribute('data-notation', `T${number}`);
        tripleSegment.setAttribute('data-number', number);
        tripleSegment.setAttribute('data-type', 'triple');
        tripleGroup.appendChild(tripleSegment);
        svg.appendChild(tripleGroup);

        // Outer single
        const outerSingleColor = isAlternating ? COLORS.single.dark : COLORS.single.light;
        const outerSinglePath = makeAnnularWedge(cx, cy, tripleOuter, doubleInner, startAngle, endAngle);
        const outerSingleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const outerSingleSegment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        outerSingleSegment.setAttribute('d', outerSinglePath);
        outerSingleSegment.setAttribute('fill', outerSingleColor);
        outerSingleSegment.setAttribute('stroke', '#000');
        outerSingleSegment.setAttribute('stroke-width', '0.5');
        outerSingleSegment.setAttribute('class', 'dartboard-segment');
        outerSingleSegment.setAttribute('data-notation', `S${number}`);
        outerSingleSegment.setAttribute('data-number', number);
        outerSingleSegment.setAttribute('data-type', 'single');
        outerSingleGroup.appendChild(outerSingleSegment);
        svg.appendChild(outerSingleGroup);

        // Double
        const doubleColor = isAlternating ? COLORS.double.red : COLORS.double.green;
        const doublePath = makeAnnularWedge(cx, cy, doubleInner, doubleOuter, startAngle, endAngle);
        const doubleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const doubleSegment = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        doubleSegment.setAttribute('d', doublePath);
        doubleSegment.setAttribute('fill', doubleColor);
        doubleSegment.setAttribute('stroke', '#000');
        doubleSegment.setAttribute('stroke-width', '0.5');
        doubleSegment.setAttribute('class', 'dartboard-segment');
        doubleSegment.setAttribute('data-notation', `D${number}`);
        doubleSegment.setAttribute('data-number', number);
        doubleSegment.setAttribute('data-type', 'double');
        doubleGroup.appendChild(doubleSegment);
        svg.appendChild(doubleGroup);

        // Numbers text (outside and above the double ring)
        const numberRadius = border + 15;
        const numberX = cx + numberRadius * Math.cos((midAngle - 90) * (Math.PI / 180));
        const numberY = cy + numberRadius * Math.sin((midAngle - 90) * (Math.PI / 180));

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', numberX);
        text.setAttribute('y', numberY);
        text.setAttribute('class', 'dartboard-text');
        text.setAttribute('fill', '#fff');
        text.setAttribute('font-size', '16');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = number;
        svg.appendChild(text);
    }

    // Bull (inner)
    const bullCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bullCircle.setAttribute('cx', cx);
    bullCircle.setAttribute('cy', cy);
    bullCircle.setAttribute('r', bull);
    bullCircle.setAttribute('fill', COLORS.double.green);
    bullCircle.setAttribute('stroke', '#000');
    bullCircle.setAttribute('stroke-width', '0.5');
    bullCircle.setAttribute('class', 'dartboard-segment');
    bullCircle.setAttribute('data-notation', 'Bull');
    bullCircle.setAttribute('data-type', 'bull');
    svg.appendChild(bullCircle);

    // Bullseye (center)
    const bullseyeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bullseyeCircle.setAttribute('cx', cx);
    bullseyeCircle.setAttribute('cy', cy);
    bullseyeCircle.setAttribute('r', bullseye);
    bullseyeCircle.setAttribute('fill', COLORS.double.red);
    bullseyeCircle.setAttribute('stroke', '#000');
    bullseyeCircle.setAttribute('stroke-width', '0.5');
    bullseyeCircle.setAttribute('class', 'dartboard-segment');
    bullseyeCircle.setAttribute('data-notation', 'D-Bull');
    bullseyeCircle.setAttribute('data-type', 'bullseye');
    svg.appendChild(bullseyeCircle);

    // Add click event listeners
    addDartboardClickListeners();
}

function addDartboardClickListeners() {
    const segments = document.querySelectorAll('.dartboard-segment');
    segments.forEach((segment) => {
        segment.addEventListener('click', (e) => {
            const notation = segment.getAttribute('data-notation');
            const points = Checkouts.parseScore(notation);

            const event = new CustomEvent('dart-clicked', {
                detail: {
                    notation,
                    points,
                },
            });

            document.dispatchEvent(event);
        });
    });
}

// Initialize dartboard
document.addEventListener('DOMContentLoaded', generateDartboard);
