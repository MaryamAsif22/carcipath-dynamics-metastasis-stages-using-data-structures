

document.addEventListener('DOMContentLoaded', async () => {
    // UI References
    const statusLog = document.getElementById('log-window');
    const graphContainer = document.getElementById('graph-container');
    const queueVisual = document.getElementById('queue-visual');
    const stackVisual = document.getElementById('stack-visual');
    const logVisual = document.getElementById('ll-visual');
    const tumorSelect = document.getElementById('tumor-site-select');

    // Initialize System
    log("System: Initializing CarciPath v2.0...");

    // Load Extended Data
    const data = await MockDB.fetchGraphData();
    log(`System: Loaded ${data.organs.length} organs and ${data.pathways.length} pathways.`);

    // Build Graph
    const graph = new Graph();
    data.organs.forEach(organ => graph.addVertex(organ.id, organ));
    data.pathways.forEach(([source, target]) => graph.addEdge(source, target));

    // Initialize Engine
    const engine = new SimulationEngine(graph);

    // Populate Dropdown
    data.organs.sort((a, b) => a.id.localeCompare(b.id)).forEach(organ => {
        const option = document.createElement('option');
        option.value = organ.id;
        option.innerText = `${organ.id} (${organ.group})`;
        tumorSelect.appendChild(option);
    });

    // --- Visualization Logic ---
    function renderGraph() {
        graphContainer.innerHTML = '';
        const nodes = graph.getNodes();
        const edges = graph.getEdges();

        // Render Edges (Blood Vessels)
        edges.forEach(edge => {
            const source = graph.nodes.get(edge.source);
            const target = graph.nodes.get(edge.target);
            if (!source || !target) return;

            const el = document.createElement('div');
            el.className = 'edge';

            const x1 = source.x + 25; // Adjusted for 50px width
            const y1 = source.y + 25;
            const x2 = target.x + 25;
            const y2 = target.y + 25;

            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

            el.style.width = `${length}px`;
            el.style.left = `${x1}px`;
            el.style.top = `${y1}px`;
            el.style.transform = `rotate(${angle}deg)`;
            el.style.transformOrigin = '0 50%'; // Pivot from left

            // Styling based on infection status of source
            if (source.status === 'infected') {
                el.classList.add('active'); // Triggers blood flow animation
            }

            graphContainer.appendChild(el);
        });

        // Render Nodes (Organs)
        nodes.forEach(node => {
            const el = document.createElement('div');
            el.className = `node ${node.status}`;
            el.innerHTML = `<div>${node.id}</div>`;
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;

            // Allow clicking to select as start point
            el.addEventListener('click', () => {
                tumorSelect.value = node.id;
                engine.start(node.id);
            });

            graphContainer.appendChild(el);
        });
    }

    // --- Event Listeners ---

    // UI Update from Engine
    document.addEventListener('simulationUpdate', (e) => {
        const { queue, stack, log: mutations } = e.detail;

        // Update Side Panels
        queueVisual.innerHTML = queue.map(i => `<div class="log-entry">> ${i}</div>`).join('');
        stackVisual.innerHTML = stack.map(i => `<div class="log-entry">UNDO: ${i.action}</div>`).join('');
        logVisual.innerHTML = mutations.slice(-10).map(i => `<div class="log-entry">${i}</div>`).join('');

        renderGraph();
    });

    // Buttons
    document.getElementById('start-btn').addEventListener('click', () => {
        const selected = tumorSelect.value;
        if (!selected) {
            alert("Please select a Primary Tumor Site first!");
            return;
        }
        log(`User: Initializing metastasis at ${selected}`);
        engine.start(selected);
    });

    document.getElementById('step-btn').addEventListener('click', () => engine.step());
    document.getElementById('undo-btn').addEventListener('click', () => engine.undo());
    document.getElementById('reset-btn').addEventListener('click', () => {
        engine.reset();
        renderGraph();
        log("System: Simulation Reset.");
    });

    // Helper
    function log(msg) {
        const div = document.createElement('div');
        div.className = 'log-entry';
        div.innerText = msg;
        statusLog.insertBefore(div, statusLog.firstChild);
    }

    // --- Hero Visual Effects (Parallax & Expansion) ---
    const heroSection = document.querySelector('.hero');

    // 1. Scroll Effect: Expand/Zoom on scroll
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        // Scale up as user scrolls down
        const scale = 100 + (scrollY * 0.05);
        heroSection.style.backgroundSize = `${scale}%`;
    });

    // 2. Mouse Move Effect: Parallax & Directional Expansion
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Move background opposite to mouse
        const moveX = 50 + (mouseX * 10 - 5); // Center 50% +/- 5%
        const moveY = 50 + (mouseY * 10 - 5);

        heroSection.style.backgroundPosition = `${moveX}% ${moveY}%`;
    });

    // Initial Render
    renderGraph();
});
