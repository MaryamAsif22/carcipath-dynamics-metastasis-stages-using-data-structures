/**
 * cell_animation.js
 * 
 * Procedural Cancer Cell Animation (Canvas)
 * Creates an organic, undulating membrane effect closer to "real video" than simple CSS scaling.
 */

class CellVisualizer {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.ctx = null;
        this.width = 0;
        this.height = 0;
        this.time = 0;
        this.reqId = null;
        this.init();
    }

    init() {
        if (this.reqId) cancelAnimationFrame(this.reqId);

        this.canvas = document.getElementById(this.canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // Use a bound function to remove listener later if needed, but for now simple is fine due to singleton usage pattern per view
        window.addEventListener('resize', () => this.resize());

        this.animate();
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.offsetWidth;
            this.canvas.height = parent.offsetHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;

            // Retroactive fix for hidden containers
            if (this.width === 0 || this.height === 0) {
                if (!this.retryCount) this.retryCount = 0;
                if (this.retryCount < 5) {
                    this.retryCount++;
                    setTimeout(() => { this.resize(); this.animate(); }, 200);
                }
            } else {
                this.retryCount = 0; // Reset on success
            }
        }
    }

    animate() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.time += 0.01;

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        // Dynamic radius based on container size
        const radius = Math.min(this.width, this.height) * 0.35;

        this.ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
            const noise = Math.sin(angle * 5 + this.time) * (radius * 0.1)
                + Math.cos(angle * 3 - this.time * 1.5) * (radius * 0.08);

            const r = radius + noise;
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;

            if (angle === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();

        // Original Dark Aesthetic (Reverted)
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, radius);
        gradient.addColorStop(0, '#556B2F'); // Dark Olive Green (Nucleus)
        gradient.addColorStop(0.6, '#2F4F4F'); // Dark Slate Grey
        gradient.addColorStop(1, '#2F4F4F'); // Membrane Edge (changed from black)

        // Remove Glow (Reverted)
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = "transparent";

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        this.reqId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        if (this.reqId) cancelAnimationFrame(this.reqId);
        this.reqId = null;
    }
}

// Expose Class
window.CellVisualizer = CellVisualizer;

// Maintain backward compatibility wrapper, but support multiple instances keyed by ID
window.CellAnim = {
    instances: {},
    init: function (id) {
        if (this.instances[id]) {
            this.instances[id].stop();
        }
        this.instances[id] = new CellVisualizer(id);
    }
};

// Auto-init helper called by app.js when view loads
