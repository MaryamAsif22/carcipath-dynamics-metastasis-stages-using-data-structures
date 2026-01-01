/**
 * organ_animation.js
 * V2: Realistic Anatomical Heart Renderer
 */

const OrganAnim = {
    canvas: null,
    ctx: null,
    running: false,
    width: 0,
    height: 0,
    beatPhase: 0,
    particles: [],

    init: function (canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.running = true;

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Init Blood Particles
        for (let i = 0; i < 50; i++) {
            this.particles.push(this.createParticle());
        }

        this.loop();
    },

    createParticle: function () {
        return {
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            vx: (Math.random() - 0.5) * 1,
            vy: (Math.random() - 0.5) * 1, // Flow upwards mostly
            r: Math.random() * 2 + 1,
            life: Math.random() * 100
        };
    },

    resize: function () {
        if (!this.canvas) return;
        // Handle High DPI
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.ctx.scale(dpr, dpr);
    },

    drawAnatomy: function (x, y, scale, phase) {
        const beat = 1 + Math.sin(phase * 12) * 0.03; // Subtle pulse

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.scale(scale * beat, scale * beat);

        // -- 1. AORTA (Arches top) --
        this.ctx.beginPath();
        this.ctx.moveTo(10, -50);
        this.ctx.bezierCurveTo(10, -80, 50, -90, 60, -60);
        this.ctx.lineWidth = 25;
        this.ctx.strokeStyle = "#8B2020"; // Dark Red Arterial
        this.ctx.stroke();

        // -- 2. SUPERIOR VENA CAVA (Blue, Top Left) --
        this.ctx.beginPath();
        this.ctx.moveTo(-40, -60);
        this.ctx.lineTo(-40, -20);
        this.ctx.lineWidth = 20;
        this.ctx.strokeStyle = "#2A3B55"; // Dark Blue Venous
        this.ctx.stroke();

        // -- 3. LEFT VENTRICLE (The big meaty part) --
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.beginPath();
        // Asymmetric "Mango" shape
        this.ctx.moveTo(-10, -40);
        this.ctx.bezierCurveTo(-70, -40, -70, 60, 0, 90); // Left bulge -> Apex
        this.ctx.bezierCurveTo(60, 60, 60, -30, 20, -40); // Right bulge

        // Muscle Gradient
        const grd = this.ctx.createRadialGradient(-10, 10, 5, 0, 0, 90);
        grd.addColorStop(0, "#A52A2A"); // Brown/Red
        grd.addColorStop(0.6, "#500000"); // Deep Red
        grd.addColorStop(1, "#200000"); // Almost Black shadows

        this.ctx.fillStyle = grd;
        this.ctx.fill();

        // Surface Veins (Coronary Arteries)
        this.ctx.beginPath();
        this.ctx.moveTo(10, -30);
        this.ctx.quadraticCurveTo(20, 10, 0, 60);
        this.ctx.strokeStyle = "rgba(255,100,100,0.2)";
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        this.ctx.restore();
    },

    loop: function () {
        if (!this.running) return;

        this.ctx.clearRect(0, 0, this.width, this.height);

        // ECG Grid Background
        this.ctx.strokeStyle = "#001a00"; // Very dark green grid
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let i = 0; i < this.width; i += 20) { this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.height); }
        this.ctx.stroke();

        this.beatPhase += 0.015;

        // Draw Heart (Centered, Scaled Up)
        const s = Math.min(this.width, this.height) / 250;
        this.drawAnatomy(this.width / 2, this.height / 2 - 10, s, this.beatPhase);

        // Draw Particles (Overlay for flow)
        this.ctx.fillStyle = "rgba(255, 50, 50, 0.4)";
        this.particles.forEach(p => {
            p.life--;
            p.y -= 0.5; // Flow Up
            // Draw
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            this.ctx.fill();

            // Reset if dead
            if (p.life < 0 || p.y < 0) Object.assign(p, this.createParticle());
        });

        // ECG Line Trace (Green Line at bottom)
        this.ctx.strokeStyle = "#0f0";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        let py = this.height - 50;
        this.ctx.moveTo(0, py);
        for (let x = 0; x < this.width; x += 2) {
            // Fake ECG Math
            const dx = x + this.beatPhase * 100; // scrolling
            const noise = Math.sin(dx * 0.1) * 2;
            const beat = (Math.sin(dx * 0.05) > 0.95) ? -40 : 0; // Spike
            this.ctx.lineTo(x, py + noise + beat);
        }
        this.ctx.stroke();

        requestAnimationFrame(() => this.loop());
    }
};

window.OrganAnim = OrganAnim;
