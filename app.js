console.log("DEBUG: APP START");
/**
 * app.js
 * Main Application Logic & Controller
 */

/* global Database, CellAnim, SimulationEngine, MockDB, Graph, Chart, Stack, MaxHeap */

// Expose App globally for HTML onclick handlers
window.App = {
    edu: null // Will be initialized below
};

document.addEventListener('DOMContentLoaded', () => {

    // --- ASSET MAPPING (SVG VECTORS) ---
    // Uses window.OrganSVGs loaded from organ_svgs.js
    const OrganImages = window.OrganSVGs || {};

    const State = {
        user: Database.getCurrentUser(),
        activePatient: null,
        simInterval: null,
        charts: {}
    };

    const Dom = {
        overlay: document.getElementById('view-login'),
        layout: document.getElementById('app-layout'),
        form: document.getElementById('patient-record-form'),
    };

    // --- AUTH & INIT ---
    // --- AUTH & INIT ---
    function checkAuth() {
        // Refresh user state from DB
        State.user = Database.getCurrentUser();

        if (State.user && Database.isAuthenticated()) {
            Dom.overlay.classList.add('hidden');
            Dom.layout.classList.remove('hidden');
            // Update display check if element exists
            const userDisp = document.getElementById('user-display');
            if (userDisp) userDisp.innerText = `Dr. ${State.user}`;

            try { if (window.CellAnim) CellAnim.init('cell-canvas'); } catch (e) { console.log('Anim init deferred'); }
            if (typeof renderDatasets === 'function') renderDatasets();
            if (typeof initSim === 'function') setTimeout(initSim, 500);

            // Initialize Education Module
            if (window.App.edu) window.App.edu.init();
        } else {
            Dom.overlay.classList.remove('hidden');
            Dom.layout.classList.add('hidden');
        }
    }
    window.App.checkAuth = checkAuth; // Expose for auth-logic.js

    // --- TAB SWITCHING (Global Handler) ---
    window.switchAuthTab = function (tab) {
        if (!tab) return;

        // Remove active classes
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => {
            f.classList.remove('active');
            f.style.display = 'none'; // Force hide
        });

        // Activate clicked tab
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        const targetForm = document.getElementById(targetId);
        if (targetForm) {
            targetForm.classList.add('active');
            targetForm.style.display = 'flex'; // Force show
            console.log(`Switched to ${targetId}`);
        }
    };

    // Ensure initial state is correct without waiting for click
    const initialActiveTab = document.querySelector('.auth-tab.active');
    if (initialActiveTab) {
        window.switchAuthTab(initialActiveTab);
    }

    document.getElementById('link-forgot').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById('form-forgot').classList.add('active');
        document.querySelector('.auth-tabs').style.display = 'none'; // Hide tabs on forgot
    });

    document.getElementById('btn-back-login').addEventListener('click', () => {
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById('form-login').classList.add('active');
        document.querySelector('.auth-tabs').style.display = 'flex'; // Show tabs
    });

    // --- FORM HANDLERS ---

    // 1. LOGIN
    document.getElementById('form-login').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('login-id').value.trim().toUpperCase();
        const pass = document.getElementById('login-pass').value;
        const msg = document.getElementById('login-msg');

        if (!id || !pass) return msg.innerText = "Please enter valid credentials.";

        const res = Database.login(id, pass);
        if (res.success) {
            State.user = res.user;
            checkAuth();
        } else {
            msg.innerText = res.message;
        }
    });

    // 2. REGISTER
    document.getElementById('form-register').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reg-id').value.trim().toUpperCase();
        const pass = document.getElementById('reg-pass').value;
        const confirm = document.getElementById('reg-confirm').value;
        const msg = document.getElementById('reg-msg');

        if (!id || !pass) return msg.innerText = "All fields required.";
        if (pass !== confirm) return msg.innerText = "Passwords do not match.";

        const res = Database.registerUser(id, pass);
        if (res.success) {
            alert("Account Created! Please Login.");
            // Switch to login tab
            document.querySelector('[data-target="form-login"]').click();
        } else {
            msg.innerText = res.message;
        }
    });

    // 3. RESET PASSWORD
    document.getElementById('form-forgot').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('reset-id').value.trim().toUpperCase();
        const pass = document.getElementById('reset-pass').value;
        const msg = document.getElementById('reset-msg');

        if (!id || !pass) return msg.innerText = "Please enter ID and New Password.";

        const res = Database.resetPassword(id, pass);
        if (res.success) {
            msg.style.color = 'lightgreen';
            msg.innerText = "Success! Redirecting...";
            setTimeout(() => {
                document.getElementById('btn-back-login').click();
                msg.innerText = "";
                msg.style.color = '#ff6b6b';
            }, 1000);
        } else {
            msg.innerText = res.message;
        }
    });

    // --- NAVIGATION LOGIC ---
    // Critical Fix: Selector must match 'nav-menu' in index.html, NOT 'nav-links'
    const navItems = document.querySelectorAll('.nav-menu li');

    navItems.forEach(li => {
        li.addEventListener('click', () => {
            console.log("DEBUG: NAV CLICK", li.innerText);
            // 1. Update Active Tab
            navItems.forEach(el => el.classList.remove('active'));
            li.classList.add('active');

            // 2. Identify Target View
            const targetView = li.getAttribute('data-view');
            if (!targetView) return; // safety

            // 3. Switch View Sections
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
            const targetEl = document.getElementById(targetView);
            if (targetEl) targetEl.classList.add('active');

            // 4. View-Specific Hooks (Animations/Updates)
            if (targetView === 'view-home') {
                setTimeout(() => {
                    try { if (window.CellAnim) CellAnim.init('cell-canvas'); } catch (e) { console.warn("Anim Error", e); }
                }, 100);
            }
            if (targetView === 'view-profile') {
                // Restore Tumor Animation
                setTimeout(() => {
                    try {
                        if (window.CellAnim) CellAnim.init('tumor-canvas');
                    } catch (e) { console.warn("Anim Error", e); }
                }, 100);
            }
            if (targetView === 'view-sim') {
                // Ensure Sim is sized correctly
                setTimeout(() => {
                    if (typeof initSim === 'function') initSim();
                }, 50);
            }
            if (targetView === 'view-datasets') {
                if (typeof renderDatasets === 'function') renderDatasets();
            }
            if (targetView === 'view-analytics') {
                setTimeout(() => {
                    try { if (window.CellAnim) CellAnim.init('tumor-canvas-dashboard'); } catch (e) { console.warn("Anim Error", e); }
                }, 100);
            }
            if (targetView === 'view-education' && window.App.edu) {
                window.App.edu.init();
            }
        });
    });

    // --- 1. PATIENT PROFILE ---
    if (Dom.form) {
        Dom.form.querySelector('[name="severity"]').addEventListener('input', (e) => {
            const val = parseInt(e.target.value) || 0;
            const stat = val >= 90 ? 'Critical' : val >= 50 ? 'Severe' : 'Stable';
            Dom.form.querySelector('[name="status"]').value = stat;
        });

        Dom.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const fd = new FormData(Dom.form);
            const data = Object.fromEntries(fd.entries());
            if (!data.fullName) return alert("Full Name is required");
            if (!data.id) data.id = "PAT-" + Math.floor(Math.random() * 10000);
            const sev = parseInt(data.severity) || 0;
            data.status = sev >= 90 ? 'Critical' : sev >= 50 ? 'Severe' : 'Stable';
            Database.savePatient(data);
            alert(`Patient Saved Successfully!\nID: ${data.id}`);
            renderDatasets();
            document.querySelector('[data-view="view-datasets"]').click();
        });
    }

    // --- 2. DATASETS ---
    function renderDatasets() {
        if (typeof Database === 'undefined') return;
        const tbody = document.querySelector('#dataset-table tbody');
        const patients = Database.getAllPatients();
        const noData = document.getElementById('no-data-msg');
        if (!tbody || !noData) return;

        tbody.innerHTML = '';
        if (patients.length === 0) { noData.style.display = 'block'; return; }
        noData.style.display = 'none';

        patients.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.fullName}</td>
                <td>${p.primarySite}</td>
                <td>${p.stage}</td>
                <td>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill ${p.severity > 80 ? 'critical' : 'stable'}" style="width:${p.severity}%"></div>
                    </div>
                </td>
                <td>${p.status}</td>
                <td>${p.spread_source} &rarr; ${p.spread_target}</td>
                <td>
                    <button class="btn-sm btn-action" onclick="loadAnalytics(Database.getPatientById('${p.id}'))">
                        <i class="fa-solid fa-chart-pie"></i> Analyze
                    </button>
                    <button class="btn-sm btn-danger" onclick="window.handleDelete('${p.id}')" style="margin-left:5px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Global Delete Handler
    window.handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this patient record?")) {
            Database.deletePatient(id);
            renderDatasets();
        }
    };
    window.renderDatasets = renderDatasets;


    // --- 3. ANALYTICS ---
    function loadAnalytics(p) {
        // --- VIEW SWITCHING ---
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
        const viewAna = document.getElementById('view-analytics');
        if (viewAna) viewAna.classList.add('active');

        document.querySelectorAll('.nav-menu li').forEach(el => el.classList.remove('active'));
        const navTab = document.querySelector('.nav-menu li[data-view="view-analytics"]');
        if (navTab) navTab.classList.add('active');

        // --- LOAD DATA ---
        // Auto-set active patient so Sim is ready
        State.activePatient = p;
        document.getElementById('sim-patient-id').value = p.id;
        document.getElementById('sim-status').innerText = `Sim Ready: ${p.fullName}`;

        document.getElementById('ana-patient-name').innerText = `Analysis: ${p.fullName} (${p.id})`;
        const ctx1 = document.getElementById('chart-growth');
        const ctx2 = document.getElementById('chart-risk');
        if (State.charts.c1) State.charts.c1.destroy();
        if (State.charts.c2) State.charts.c2.destroy();

        State.charts.c1 = new Chart(ctx1, { type: 'bar', data: { labels: ['Severity'], datasets: [{ label: 'Score', data: [p.severity], backgroundColor: '#8B0000' }] } });
        State.charts.c2 = new Chart(ctx2, { type: 'pie', data: { labels: ['Healthy', 'Tumor'], datasets: [{ data: [100 - p.severity, p.severity], backgroundColor: ['#2F4F4F', '#DAA520'] }] } });

        // --- TREE ANALYTICS (BST) ---
        runTreeAnalytics(p);

        // Init Dashboard Animation
        setTimeout(() => {
            try {
                if (window.CellAnim) CellAnim.init('tumor-canvas-dashboard');
            } catch (e) { console.warn(e); }
        }, 300);

        // --- PREPARE SIMULATION (MICRO) ---//GRAPHS
        MockDB.fetchRealisticPath(p.spread_source, p.spread_target).then(data => {
            const microIds = data.x_nodes || [];
            const mGraph = new Graph();
            microIds.forEach(n => mGraph.addVertex(n.id, n));
            for (let i = 0; i < microIds.length - 1; i++) mGraph.addEdge(microIds[i].id, microIds[i + 1].id);

            microEngine = new SimulationEngine(mGraph);
            const microSection = document.getElementById('micro-sim-section');
            if (microSection) microSection.style.display = 'block';

            setTimeout(() => {
                const microContainer = document.getElementById('micro-graph-container');
                if (microContainer) renderGraph(mGraph, microContainer, true);
            }, 500);
        });
    }
    window.loadAnalytics = loadAnalytics;
//BST
    function runTreeAnalytics(patient) {
        const tree = new BinarySearchTree();
        const logContent = document.getElementById('tree-log-content');
        logContent.innerHTML = `<div>System: Initializing BST for ${patient.id}...</div>`;

        // 1. POPULATE TREE (Simulation)
        // We simulate a dataset of 100 random patient "Severity Scores" 
        // to build a realistic tree structure for analysis.
        const datasetSize = 50;
        const randomData = [];
        for (let i = 0; i < datasetSize; i++) {
            const val = Math.floor(Math.random() * 100);
            tree.insert(val);
            randomData.push(val);
        }
        // Insert current patient's severity to ensure it's in the tree
        tree.insert(patient.severity);
        logContent.innerHTML += `<div>System: Inserted ${datasetSize + 1} nodes.</div>`;

        // 2. GET STRUCTURE STATS
        const stats = tree.getStats();
        // Animate Numbers..TREE H, LEAF NODE
        animateValue("tree-total", 0, stats.totalNodes, 400);
        animateValue("tree-height", 0, stats.height, 400);
        animateValue("tree-leaves", 0, stats.leafCount, 400);

        // 3. MOST VISITED (MORE SEARCHFG)
        for (let i = 0; i < 20; i++) tree.search(randomData[Math.floor(Math.random() * datasetSize)]);
        const mostVisited = tree.getMostVisited();
        document.getElementById('tree-visited').innerText = mostVisited ? `Val: ${mostVisited.id} (${mostVisited.count}x)` : 'None';

        // 4. SEARCH TRAVERSAL LOGIC & GRAPH
        // Helper to log traversal
        function logPath(target, result) {
            const time = new Date().toLocaleTimeString();
            const pathStr = result.path.map(n => n === target ? `<b>[${n}]</b>` : n).join(' &rarr; ');
            const entry = `<div style="margin-top:5px; border-bottom:1px solid #333; padding-bottom:2px;">
                <span style="color:#888">[${time}]</span> Search(${target}): <br/>
                ${pathStr} 
                <span style="color:${result.found ? '#0f0' : 'red'}">${result.found ? 'FOUND' : 'MISSING'}</span>
                (${result.steps} steps)
            </div>`;
            logContent.innerHTML = entry + logContent.innerHTML;
        }

        // Perform Search for Current Patient
        const searchRes = tree.search(patient.severity);
        logPath(patient.severity, searchRes);

        // CHART: BST vs LINEAR SEARCH
        // Linear Search (Avg) = N / 2
        // BST Search (Avg) = log2(N)
        const n = stats.totalNodes;
        const linearAvg = n / 2;
        const bstAvg = Math.log2(n);

        const ctxTree = document.getElementById('chart-tree-comparison');
        if (State.charts.cTree) State.charts.cTree.destroy();

        State.charts.cTree = new Chart(ctxTree, {
            type: 'bar',
            data: {
                labels: ['Linear Search (Avg)', 'BST Search (Avg)', 'Your Search'],
                datasets: [{
                    label: 'Steps / Comparisons',
                    data: [linearAvg, bstAvg, searchRes.steps],
                    backgroundColor: ['#e74c3c', '#2ecc71', '#f1c40f'],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                scales: { x: { beginAtZero: true } }
            }
        });
    }

    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- 5. EDUCATION MODULE LOGIC ---
    //DS IMPLIM STRT
    // Defined inside the scope, then assigned to window.App
    const EduModule = {
        mutationStack: new Stack(),
        triageQueue: new MaxHeap(),

        init: function () {
            // Clear existing data
            this.mutationStack = new Stack();
            this.triageQueue = new MaxHeap();

            // If patient is loaded, initialize with patient-specific data
            if (State.activePatient) {
                this.initializeWithPatient(State.activePatient);
            }

            this.updateStackUI();
            this.updateQueueUI();
        },

        initializeWithPatient: function (patient) {
            // Initialize Stack based on patient severity
            const severity = parseInt(patient.severity) || 0;
            let mutationCount = 0;
            if (severity > 80) mutationCount = 3;
            else if (severity > 50) mutationCount = 2;
            else if (severity > 20) mutationCount = 1;

            for (let i = 0; i < mutationCount; i++) {
                const types = severity > 80 ? ['Radiation', 'Chemical', 'Genetic'] : ['Chemical', 'Environmental'];
                const type = types[Math.floor(Math.random() * types.length)];
                const sev = severity > 80 ? 'high' : 'med';
                this.pushMutation(type, sev);
            }

            // Initialize Queue with organs affected by the patient's condition
            const organs = [patient.primarySite];
            if (patient.spread_target && patient.spread_target !== patient.primarySite) {
                organs.push(patient.spread_target);
            }
            // Add some additional organs based on severity
            const extraOrgans = ['Liver', 'Lung', 'Brain', 'Bone'];
            const extraCount = Math.min(Math.floor(severity / 25), extraOrgans.length);
            for (let i = 0; i < extraCount; i++) {
                if (!organs.includes(extraOrgans[i])) {
                    organs.push(extraOrgans[i]);
                }
            }

            organs.forEach(organ => {
                const sev = severity + Math.floor(Math.random() * 20) - 10; // +/- 10 variation
                const clampedSev = Math.max(10, Math.min(100, sev));
                this.triageQueue.enqueue({ organ, severity: clampedSev, id: patient.id + '-' + organ.slice(0, 2).toUpperCase() }, clampedSev);
            });
        },

        // --- STACK LOGIC ---
        pushMutation: function (type, severity) {
            const id = Math.floor(Math.random() * 9000) + 1000;
            const mutation = { id, type, severity };

            // Check overflow (simulation limit)
            if (this.mutationStack.items.length >= 8) {
                document.getElementById('stack-status').innerText = "Status: CRITICAL OVERFLOW! Cell Apoptosis Risk.";
                document.getElementById('stack-status').className = "lab-status status-critical";
                return;
            }

            this.mutationStack.push(mutation);
            this.updateStackUI();
            document.getElementById('stack-status').innerText = `Mutation Added: ${type} (Sev: ${severity})`;
            document.getElementById('stack-status').className = "lab-status status-warning";
        },

        popMutation: function () {
            const mutation = this.mutationStack.pop();
            if (!mutation) {
                document.getElementById('stack-status').innerText = "Status: No mutations to repair!";
                document.getElementById('stack-status').className = "lab-status status-info";
                return;
            }
            this.updateStackUI();
            document.getElementById('stack-status').innerText = `Repaired: ${mutation.type} (ID: ${mutation.id})`;
            document.getElementById('stack-status').className = "lab-status status-success";
        },

        updateStackUI: function () {
            const container = document.getElementById('stack-container');
            if (!container) return;

            container.innerHTML = '';
            if (this.mutationStack.items.length === 0) {
                container.innerHTML = '<div class="stack-placeholder">Empty Stack (Healthy DNA)</div>';
                return;
            }

            // Display stack from top to bottom (last pushed first)
            this.mutationStack.items.slice().reverse().forEach((mutation, index) => {
                const div = document.createElement('div');
                div.className = `stack-item ${mutation.severity === 'high' ? 'critical' : 'stable'} scale-in`;
                div.style.animationDelay = `${index * 0.05}s`;
                div.innerHTML = `
                    <div class="stack-type">${mutation.type}</div>
                    <div class="stack-info">
                        <strong>ID: ${mutation.id}</strong>
                        <small>Sev: ${mutation.severity}</small>
                    </div>
                `;
                container.appendChild(div);
            });
        },

        // --- QUEUE LOGIC (MAX-HEAP) ---
        admitPatient: function () {
            const names = ["Liver", "Lung", "Brain", "Bone", "Colon", "Skin"];
            const organ = names[Math.floor(Math.random() * names.length)];
            const severity = Math.floor(Math.random() * 90) + 10; // 10-100

            const patient = { organ, severity, id: Date.now().toString().slice(-4) };
            this.triageQueue.enqueue(patient, severity);

            this.updateQueueUI();
            document.getElementById('queue-status').innerText = `New Patient: ${organ} (Sev: ${severity})`;
            document.getElementById('queue-status').className = "lab-status";
        },

        treatNext: function () {
            const patientObj = this.triageQueue.dequeue();
            if (!patientObj) {
                alert("Waiting room is empty!");
                return;
            }
            const p = patientObj.val;
            this.updateQueueUI();

            // Highlight the treated action
            document.getElementById('queue-status').innerText = `TREATING: ${p.organ} (Severity: ${p.severity})`;
            document.getElementById('queue-status').className = "lab-status status-success";
        },

        updateQueueUI: function () {
            const container = document.getElementById('queue-container');
            if (!container) return;

            container.innerHTML = '';
            // Get sorted copy for display (Highest priority first)
            const sortedPatients = this.triageQueue.getSorted();

            if (sortedPatients.length === 0) {
                container.innerHTML = '<div class="queue-placeholder">Waiting Room Empty</div>';
                return;
            }

            sortedPatients.forEach((item, index) => {
                const p = item.val;
                const div = document.createElement('div');
                div.className = `queue-item ${p.severity > 80 ? 'critical' : 'stable'} scale-in`;

                // Add staggered animation delay
                div.style.animationDelay = `${index * 0.05}s`;

                div.innerHTML = `
                    <div class="q-sev-badge">${p.severity}</div>
                    <div class="q-info">
                        <strong>${p.organ}</strong>
                        <small>ID: ${p.id}</small>
                    </div>
                `;
                container.appendChild(div);
            });
        }
    };

    // Assign to global App object
    window.App.edu = EduModule;

    // --- SETTINGS MODULE LOGIC ---
    const SettingsModule = {
        aiInterval: null,

        setTheme: function (themeName) {
            document.body.classList.remove('theme-light', 'theme-dark', 'theme-navy', 'theme-charcoal');
            const dots = document.querySelectorAll('.theme-btn');
            dots.forEach(d => d.classList.remove('active'));

            if (themeName === 'light') document.body.classList.add('theme-light');
            if (themeName === 'dark') document.body.classList.add('theme-dark');
            if (themeName === 'charcoal') document.body.classList.add('theme-charcoal');
            // 'default' (Beige) means no class added (uses :root)

            // Persist
            localStorage.setItem('cp_theme', themeName);
        },

        toggleResearchMode: function (enabled) {
            if (enabled) document.body.classList.add('research-mode');
            else document.body.classList.remove('research-mode');
        },

        toggleAI: function (enabled) {
            const status = document.getElementById('ai-status');
            if (enabled) {
                status.style.display = 'block';
                status.innerText = "AI System: INITIALIZING NEURAL LINK...";

                this.aiInterval = setInterval(() => {
                    let msg = "";
                    let color = "#00E676"; // Green (Good/Info)

                    if (State.activePatient) {
                        const p = State.activePatient;
                        const sev = parseInt(p.severity);

                        // Dynamic Logic Options
                        const dice = Math.random();

                        if (sev > 80) {
                            msg = `⚠️ CRITICAL: Patient ${p.fullName} at high metastasis risk (${sev}%). Immediate intervention required.`;
                            color = "#ff0055"; // Red
                        } else if (microEngine && microEngine.graph) {
                            // Read Simulation State
                            const infectedCount = microEngine.graph.getNodes().filter(n => n.status === 'infected').length;
                            const total = microEngine.graph.getNodes().length;
                            const ratio = Math.round((infectedCount / total) * 100);

                            if (dice < 0.5) {
                                msg = `📈 LIVE ANALYSIS: Micro-pathway load at ${ratio}% saturation. ${infectedCount} nodes compromised.`;
                                color = "#E1AD01"; // Warning
                            } else {
                                msg = `🧬 PATHWAY TRACKING: Cells migrating from ${p.spread_source} to ${p.spread_target}. Velocity nominal.`;
                                color = "#00d2ff"; // Blue
                            }
                        } else {
                            // Patient loaded but sim not running
                            msg = `AI SUGGESTION: Load Simulation for Patient ${p.fullName} to analyze ${p.primarySite} breakdown.`;
                            color = "#E1AD01";
                        }

                    } else {
                        // No Patient
                        const idleMsgs = [
                            "System Idle: Waiting for patient data injection...",
                            "Database Integrity Check: PASSED.",
                            "Neural Net: Monitoring global bio-signals...",
                            "Tip: Go to 'Cancer Victim Info' to generate a case file."
                        ];
                        msg = idleMsgs[Math.floor(Math.random() * idleMsgs.length)];
                        color = "#888";
                    }

                    status.innerText = msg;
                    status.style.borderLeftColor = color;

                    // Flash effect
                    status.style.opacity = "0.5";
                    setTimeout(() => status.style.opacity = "1", 200);

                }, 4000);
            } else {
                clearInterval(this.aiInterval);
                status.style.display = 'none';
            }
        },

        exportData: function () {
            // Mock export of simulated database
            const data = {
                timestamp: new Date().toISOString(),
                exportedBy: `Dr. ${State.user || 'Unknown'}`,
                patients: Database.getAllPatients(),
                analytics: {
                    note: "Research Data Export",
                    integrity: "Verified"
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "carcipath_research_data.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        },

        factoryReset: function () {
            if (confirm("WARNING: COMPLETE SYSTEM PURGE.\n\nAre you sure you want to delete all research data? This cannot be undone.")) {
                localStorage.clear();
                location.reload();
            }
        },

        setSpeed: function (val) {
            console.log("Master simulation speed set to: " + val);
        },

        init: function () {
            // Load saved theme
            const savedTheme = localStorage.getItem('cp_theme') || 'dark';
            this.setTheme(savedTheme);
        }
    };

    window.App.settings = SettingsModule;
    window.App.settings.init();


    // --- 4. SIMULATOR (DUAL ENGINE) ---
    let engine = null;       // Macro
    let microEngine = null;  // Micro

    async function initSim() {
        if (engine) return;

        // MACRO
        const container = document.getElementById('graph-container');
        const data = await MockDB.fetchGraphData();
        const graph = new Graph();
        data.organs.forEach(o => graph.addVertex(o.id, o));
        data.pathways.forEach(([s, t]) => graph.addEdge(s, t));
        engine = new SimulationEngine(graph);
        renderGraph(graph, container);

        // CHART
        const ctxSim = document.getElementById('chart-sim-severity');
        if (ctxSim) {
            State.charts.simSev = new Chart(ctxSim, { 
                type: 'line', 
                data: { 
                    labels: ['Start'], 
                    datasets: [{ 
                        label: 'Infection Spread (%)', 
                        data: [0], 
                        borderColor: 'red',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        fill: true
                    }] 
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    const btnCheck = document.getElementById('sim-check-btn');
    if (btnCheck) {
        btnCheck.onclick = async () => {
            const inputId = document.getElementById('sim-patient-id').value.trim();
            if (!inputId) return alert("Please enter a Patient ID.");
            const p = Database.getPatientById(inputId);
            if (p) {
                State.activePatient = p;
                document.getElementById('sim-status').innerText = "Sim Ready: " + p.fullName;
                document.getElementById('sim-case-name').innerText = p.fullName;
                document.getElementById('prog-source').innerText = p.spread_source;
                document.getElementById('prog-target').innerText = p.spread_target;

                // alert(`Case Loaded: ${p.fullName}\nMicro-Pathway Ready.`);

                // Switch to Simulation View Logic (Manual) & Sync Navbar
                document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
                const simView = document.getElementById('view-sim');
                if (simView) simView.classList.add('active');

                // Sync Navbar Active State
                document.querySelectorAll('.nav-menu li').forEach(li => {
                    li.classList.remove('active');
                    if (li.getAttribute('data-view') === 'view-sim') {
                        li.classList.add('active');
                    }
                });

                // Force Resize/Render for visibility
                if (engine) renderGraph(engine.graph, document.getElementById('graph-container'));

                // Reset Macro & Highlight
                if (engine) {
                    // Reset all first
                    engine.graph.getNodes().forEach(n => n.status = 'healthy');

                    // Highlight Source & Target
                    const sNode = engine.graph.nodes.get(p.spread_source);
                    const tNode = engine.graph.nodes.get(p.spread_target);
                    if (sNode) sNode.status = 'source';
                    if (tNode) tNode.status = 'target';

                    renderGraph(engine.graph, document.getElementById('graph-container'));

                    // Reset Engine State for fresh play
                    engine.isRunning = false;
                    engine.visited.clear();
                }

                // --- INIT MICRO ENGINE ---
                MockDB.fetchRealisticPath(p.spread_source, p.spread_target).then(data => {
                    console.log("Micro Data:", data);
                    const microIds = data.x_nodes || [];

                    if (microIds.length === 0) {
                        alert("System Error: No Micro-Pathway generated!");
                        return;
                    }

                    const mGraph = new Graph();
                    microIds.forEach(node => mGraph.addVertex(node.id, node));
                    for (let i = 0; i < microIds.length - 1; i++) mGraph.addEdge(microIds[i].id, microIds[i + 1].id);

                    microEngine = new SimulationEngine(mGraph);
                    // Pre-highlight source in micro view too
                    const msNode = mGraph.nodes.get(p.spread_source);
                    if (msNode) msNode.status = 'source';

                    const microContainer = document.getElementById('micro-graph-container');
                    const microSection = document.getElementById('micro-sim-section');
                    if (microSection) {
                        microSection.style.display = 'block';
                        microSection.scrollIntoView({ behavior: "smooth" });
                    }

                    if (microContainer) {
                        microContainer.style.height = '350px';
                        renderGraph(mGraph, microContainer, true);
                    }

                    // --- AUTO START SIMULATION ---
                    setTimeout(startSimulation, 1000);
                }).catch(err => {
                    alert("Error loading pathway: " + err);
                    console.error(err);
                });

            } else {
                State.activePatient = null;
                alert("No Patient Record Found.");
            }
        };

        const btnPlay = document.getElementById('sim-play');
        if (btnPlay) {
            btnPlay.onclick = startSimulation;
        }

        // 5. Speed Control Handler
        const speedInput = document.getElementById('sim-speed');
        if (speedInput) {
            speedInput.addEventListener('input', () => {
                if (State.simInterval) {
                    clearInterval(State.simInterval);
                    const delay = Math.max(50, 2000 - (speedInput.value * 19));
                    State.simInterval = setInterval(stepSimulation, delay);
                    console.log("Speed updated:", delay, "ms");
                }
            });
        }

        function startSimulation() {
            if (!State.activePatient) return alert("Please Load ID First!");
            const p = State.activePatient;
            document.getElementById('sim-status').innerText = `Simulating...`;

            // START MICRO ONLY (Macro is static highlight)
            if (engine) engine.start(p.spread_source);
            if (microEngine) microEngine.start(p.spread_source, p.spread_target);

            const delay = Math.max(50, 2000 - ((speedInput ? speedInput.value : 50) * 19));

            // Track logged nodes to avoid duplicates in the UI
            window.loggedNodes = new Set();
            document.getElementById('mutation-log').innerHTML = ''; // Clear log on start

            if (State.simInterval) clearInterval(State.simInterval);
            State.simInterval = setInterval(stepSimulation, delay);
        }

        function stepSimulation() {
            let engineStatus = null;
            // Step Macro (DISABLED)
            // if (engine) engineStatus = engine.step();

            // Step Micro
            if (microEngine) {
                microEngine.step();

                // --- DATA STRUCTURE VISUALIZATION (BFS QUEUE) ---
                const queueViz = document.getElementById('ds-queue-viz');
                if (queueViz) {
                    const qContent = microEngine.queue.map(id => {
                        const node = microEngine.graph.nodes.get(id);
                        const status = node ? node.status : 'unknown';

                        let badgeClass = 'badge-queue';
                        if (status === 'infected') badgeClass += ' infected';
                        if (status === 'source') badgeClass += ' source';
                        if (status === 'healthy') badgeClass += ' pending';

                        return `<span class="${badgeClass}">${id} <i class="fa-solid fa-virus" style="font-size:10px"></i></span>`;
                    }).join(' <i class="fa-solid fa-arrow-right-long" style="color:#aaa; margin:0 5px;"></i> ');

                    queueViz.innerHTML = `<div style="margin-bottom:5px; font-size:0.8rem; color:#888;">BFS Frontier Queue:</div>
                                              <div style="display:flex; align-items:center; flex-wrap:wrap; gap:5px;">${qContent}</div>`;
                }
            }

            // --- LIVE CHART UPDATE (REAL TIME STATUS) ---
            if (State.charts.simSev) {
                const infectedCount = microEngine ? microEngine.graph.getNodes().filter(n => n.status === 'infected').length : 0;
                const timeLabel = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });

                // Keep chart moving
                if (State.charts.simSev.data.labels.length > 20) {
                    State.charts.simSev.data.labels.shift();
                    State.charts.simSev.data.datasets[0].data.shift();
                }

                State.charts.simSev.data.labels.push(timeLabel); // or just Step
                State.charts.simSev.data.datasets[0].data.push(infectedCount);
                State.charts.simSev.update('none'); // 'none' for performance
            }

            // --- LIVE MUTATION LOGGING ---
            if (microEngine) {
                microEngine.graph.getNodes().forEach(n => {
                    if (n.status === 'infected' && !window.loggedNodes.has(n.id)) {
                        window.loggedNodes.add(n.id);
                        const logEl = document.getElementById('mutation-log');
                        const li = document.createElement('li');

                        // Richer Status Text
                        const isVessel = n.id.includes('Vein') || n.id.includes('Artery') || n.id.includes('Blood');
                        const icon = isVessel ? 'fa-droplet' : 'fa-virus';
                        const text = isVessel ? `Traveling through <b>${n.id}</b>` : `Metastasis detected in <b>${n.id}</b>`;
                        const color = isVessel ? '#00d2ff' : '#ff4444';

                        // Update Main Status Bar Real-time
                        document.getElementById('sim-status').innerHTML = `<i class="fa-solid ${icon}"></i> ${text}`;
                        document.getElementById('sim-status').style.color = color;

                        li.innerHTML = `<i class="fa-solid ${icon}" style="color:${color}; margin-right:5px;"></i> ${text}`;
                        li.style.borderBottom = "1px solid #eee";
                        li.style.padding = "4px 0";
                        li.style.animation = "fadeIn 0.5s";
                        logEl.prepend(li); // Newest top
                    }
                });
            }

            // --- STOPPING LOGIC ---
            // Stop if Micro Engine explicitly reaches target
            const activeP = State.activePatient;
            if (!activeP) return; // safety check

            const tNode = microEngine ? microEngine.graph.nodes.get(activeP.spread_target) : null;
            const isTargetInfected = tNode && tNode.status === 'infected';

            if (isTargetInfected) {
                clearInterval(State.simInterval);
                showStopNotification(activeP, "Target Organ Reached");
            }

            // Also safety stop if Macro is done (no more moves)
            // if (engineStatus && engineStatus.action === 'stop' && !isTargetInfected) {}
        }
    }

    function showStopNotification(p, reason) {
        const msg = `🛑 SIMULATION HALTED\nReason: ${reason}\nPatient: ${p.fullName}`;
        alert(msg);
    }

    document.getElementById('sim-pause').onclick = () => { if (State.simInterval) clearInterval(State.simInterval); };

    // Play button with speed control
    document.getElementById('sim-play').onclick = () => {
        if (State.simInterval) clearInterval(State.simInterval);
        const speed = parseInt(document.getElementById('sim-speed').value) || 50;
        const delay = Math.max(100, 2000 - (speed * 19)); // Speed 1-100, delay 1981-100ms
        State.simInterval = setInterval(() => {
            if (engine && !engine.isRunning) {
                clearInterval(State.simInterval);
                return;
            }
            if (engine) engine.step();
            if (microEngine) microEngine.step();
        }, delay);
    };

    // --- ASSET MAPPING (FONTAWESOME ICONS) ---
    const OrganIcons = {
        'Lungs': 'fa-lungs',
        'Brain': 'fa-brain',
        'Heart': 'fa-heart',
        'Liver': 'fa-flask', // Bacteria/Flask for liver/chemical
        'Breast': 'fa-heart-circle-plus',
        'Colon': 'fa-worm', // Intestine-like
        'Stomach': 'fa-burger', // Stomach/Food
        'Bone Marrow': 'fa-bone',
        'Kidneys': 'fa-capsules',
        'Lymph Node': 'fa-network-wired',
        'Blood Stream': 'fa-droplet',
        'Path': 'fa-circle-notch'
    };

    // --- RENDERER (ICON MODE) ---
    function renderGraph(graph, container, isMicro = false) {
        if (!container) { console.error("No container"); return; }
        container.innerHTML = '';

        const w = container.offsetWidth || 800;
        const h = container.offsetHeight || (isMicro ? 450 : 650); // Updated heights
        const sx = w / 1000; // Increased for better spacing
        const sy = h / 900; // Increased

        // 1. Render Edges
        graph.getEdges().forEach(e => {
            const s = graph.nodes.get(e.source); const t = graph.nodes.get(e.target);
            if (!s || !t) return;
            const el = document.createElement('div');
            el.className = 'edge';
            if (s.status === 'infected' && t.status === 'infected') el.classList.add('active');
            const x1 = s.x * sx; const y1 = s.y * sy;
            const x2 = t.x * sx; const y2 = t.y * sy;
            const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            el.style.width = `${len}px`; el.style.left = `${x1 + 40}px`; el.style.top = `${y1 + 40}px`; // Adjusted offset
            el.style.transform = `rotate(${ang}deg)`;
            el.setAttribute('data-from', e.source);
            el.setAttribute('data-to', e.target);
            container.appendChild(el);
        });

        // 2. Render Nodes (ICONS)
        graph.getNodes().forEach(n => {
            try {
                if (!n || !n.id) return;
                const nid = String(n.id); // Valid string ID
                const el = document.createElement('div');

                // Check map or fuzzy match
                let iconClass = OrganIcons[nid];

                if (!iconClass) {
                    if (nid.includes('Lymph') || nid.includes('Node')) iconClass = 'fa-network-wired';
                    else if (nid.includes('Vein') || nid.includes('Artery') || nid.includes('Plexus') || nid.includes('Vessel')) iconClass = 'fa-droplet';
                    else if (nid.includes('Duct')) iconClass = 'fa-bezier-curve';
                    else iconClass = 'fa-location-dot';
                }
                // Force vessel icon override if needed
                if (nid.includes('Vein') || nid.includes('Artery')) iconClass = 'fa-droplet';

                el.className = `node-icon-wrapper ${n.status}`;
                if (n.status === 'infected') {
                    el.classList.add('pulse');
                    // Add virus icon overlay
                    el.innerHTML = `<i class="fa-solid ${iconClass}"></i><i class="fa-solid fa-virus overlay-virus"></i>`;
                } else {
                    el.innerHTML = `<i class="fa-solid ${iconClass}"></i>`;
                }

                // Position logic (Assuming x,y exist, else default)
                const nx = (n.x !== undefined ? n.x : 100) * sx;
                const ny = (n.y !== undefined ? n.y : 100) * sy;

                el.style.left = `${nx}px`;
                el.style.top = `${ny}px`;

                // Tooltip
                const tt = document.createElement('div');
                tt.className = 'node-label';
                tt.innerText = `${nid} (${n.status || 'healthy'})`;
                el.appendChild(tt);

                container.appendChild(el);
            } catch (err) {
                console.warn("Node Render Error", err, n);
            }
        });
    }

    document.addEventListener('simulationUpdate', (e) => {
        const detail = e.detail;
        if (engine && document.getElementById('graph-container')) renderGraph(engine.graph, document.getElementById('graph-container'));
        if (microEngine && document.getElementById('micro-graph-container')) renderGraph(microEngine.graph, document.getElementById('micro-graph-container'), true);

        // Highlight spreading edges
        const containers = [document.getElementById('graph-container'), document.getElementById('micro-graph-container')].filter(c => c);
        containers.forEach(container => {
            // Remove previous spreading classes
            container.querySelectorAll('.edge.spreading').forEach(edge => edge.classList.remove('spreading'));
            // Add new spreading classes
            if (detail.spreadingEdges) {
                detail.spreadingEdges.forEach(edge => {
                    const edgeDiv = container.querySelector(`[data-from="${edge.from}"][data-to="${edge.to}"]`);
                    if (edgeDiv) edgeDiv.classList.add('spreading');
                });
            }
        });

        // Update live status chart
        if (State.charts.simSev && engine) {
            const infected = engine.graph.getNodes().filter(n => n.status === 'infected').length;
            const total = engine.graph.getNodes().length;
            const percentage = Math.round((infected / total) * 100);

            // Add new data point
            State.charts.simSev.data.labels.push(`Step ${detail.stepCount}`);
            State.charts.simSev.data.datasets[0].data.push(percentage);

            // Keep only last 20 points to avoid overcrowding
            if (State.charts.simSev.data.labels.length > 20) {
                State.charts.simSev.data.labels.shift();
                State.charts.simSev.data.datasets[0].data.shift();
            }

            State.charts.simSev.update();
        }

        // Update infection path log
        const pathLog = document.getElementById('infection-path-log');
        if (pathLog && detail.log) {
            pathLog.innerHTML = detail.log.slice(-10).map(entry => `<div>${entry}</div>`).join(''); // Show last 10 entries
        }
    });

    // --- AUTHENTICATION & SESSION ---


    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => {
            if (confirm("Log out of CarciPath Dynamics?")) {
                localStorage.removeItem('cp_user');
                location.reload();
            }
        };
    }

    checkAuth();
});
