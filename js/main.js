/**
 * Main Application Controller
 * Coordinates UI, physics, and rendering
 */

class ProjectileMotionApp {
    constructor() {
        // Get canvas and create renderer
        this.canvas = document.getElementById('simulation-canvas');
        this.renderer = new Renderer(this.canvas);

        // Simulation state
        this.projectile = null;
        this.isPaused = false;
        this.animationId = null;

        // Parameters
        this.params = {
            velocity: 15,
            angle: 45,
            mass: 1.0,
            diameter: 0.5,
            gravity: 9.81,
            airResistance: false
        };

        // Visual settings
        this.showVectors = true;
        this.showTrajectory = true;

        // Initialize
        this.initializeControls();
        this.createProjectile();
        this.startAnimation();
    }

    /**
     * Initialize all UI controls
     */
    initializeControls() {
        // Velocity slider
        const velocitySlider = document.getElementById('velocity');
        const velocityValue = document.getElementById('velocity-value');
        velocitySlider.addEventListener('input', (e) => {
            this.params.velocity = parseFloat(e.target.value);
            velocityValue.textContent = this.params.velocity.toFixed(1);
            this.createProjectile();
        });

        // Angle slider
        const angleSlider = document.getElementById('angle');
        const angleValue = document.getElementById('angle-value');
        angleSlider.addEventListener('input', (e) => {
            this.params.angle = parseFloat(e.target.value);
            angleValue.textContent = this.params.angle;
            this.createProjectile();
        });

        // Mass slider
        const massSlider = document.getElementById('mass');
        const massValue = document.getElementById('mass-value');
        massSlider.addEventListener('input', (e) => {
            this.params.mass = parseFloat(e.target.value);
            massValue.textContent = this.params.mass.toFixed(1);
            this.createProjectile();
        });

        // Diameter slider
        const diameterSlider = document.getElementById('diameter');
        const diameterValue = document.getElementById('diameter-value');
        diameterSlider.addEventListener('input', (e) => {
            this.params.diameter = parseFloat(e.target.value);
            diameterValue.textContent = this.params.diameter.toFixed(2);
            this.createProjectile();
        });

        // Gravity selector
        const gravitySelect = document.getElementById('gravity');
        const gravityValue = document.getElementById('gravity-value');
        gravitySelect.addEventListener('change', (e) => {
            this.params.gravity = parseFloat(e.target.value);
            gravityValue.textContent = this.params.gravity.toFixed(2);
            this.createProjectile();
        });

        // Air resistance checkbox
        const airResistanceCheckbox = document.getElementById('air-resistance');
        airResistanceCheckbox.addEventListener('change', (e) => {
            this.params.airResistance = e.target.checked;
            this.createProjectile();
        });

        // Show vectors checkbox
        const showVectorsCheckbox = document.getElementById('show-vectors');
        showVectorsCheckbox.addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
        });

        // Show trajectory checkbox
        const showTrajectoryCheckbox = document.getElementById('show-trajectory');
        showTrajectoryCheckbox.addEventListener('change', (e) => {
            this.showTrajectory = e.target.checked;
        });

        // Fire button
        const fireBtn = document.getElementById('fire-btn');
        fireBtn.addEventListener('click', () => {
            this.fireProjectile();
        });

        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.addEventListener('click', () => {
            this.togglePause();
            pauseBtn.textContent = this.isPaused ? '▶ Play' : '⏸ Pause';
        });

        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.reset();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.fireProjectile();
            } else if (e.code === 'KeyP') {
                this.togglePause();
                pauseBtn.textContent = this.isPaused ? '▶ Play' : '⏸ Pause';
            } else if (e.code === 'KeyR') {
                this.reset();
            }
        });
    }

    /**
     * Create a new projectile with current parameters
     */
    createProjectile() {
        this.projectile = new Projectile({
            velocity: this.params.velocity,
            angle: this.params.angle,
            mass: this.params.mass,
            diameter: this.params.diameter,
            gravity: this.params.gravity,
            airResistance: this.params.airResistance,
            color: '#ff4444'
        });
    }

    /**
     * Fire the projectile
     */
    fireProjectile() {
        if (!this.projectile) {
            this.createProjectile();
        }
        this.projectile.launch();
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.isPaused = !this.isPaused;
    }

    /**
     * Reset simulation
     */
    reset() {
        if (this.projectile) {
            this.projectile.reset();
        }
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';
        this.updateDataDisplay();
    }

    /**
     * Main animation loop
     */
    animate() {
        // Update physics
        if (!this.isPaused && this.projectile) {
            this.projectile.update();
        }

        // Render
        this.render();

        // Update data display
        this.updateDataDisplay();

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Start animation loop
     */
    startAnimation() {
        if (!this.animationId) {
            this.animate();
        }
    }

    /**
     * Stop animation loop
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Render the scene
     */
    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawGrid();
        this.renderer.drawCannon(this.params.angle);

        if (this.projectile) {
            this.renderer.drawTrajectory(this.projectile, this.showTrajectory);
            this.renderer.drawProjectile(this.projectile);
            this.renderer.drawVectors(this.projectile, this.showVectors);
        }
    }

    /**
     * Update data display panel
     */
    updateDataDisplay() {
        if (!this.projectile) return;

        const timeDisplay = document.getElementById('time-display');
        const rangeDisplay = document.getElementById('range-display');
        const heightDisplay = document.getElementById('height-display');
        const maxHeightDisplay = document.getElementById('max-height-display');
        const velocityDisplay = document.getElementById('velocity-display');

        timeDisplay.textContent = this.projectile.time.toFixed(2) + ' s';
        rangeDisplay.textContent = this.projectile.state.x.toFixed(2) + ' m';
        heightDisplay.textContent = Math.max(0, this.projectile.state.y).toFixed(2) + ' m';
        maxHeightDisplay.textContent = this.projectile.maxHeight.toFixed(2) + ' m';
        velocityDisplay.textContent = this.projectile.getVelocity().toFixed(2) + ' m/s';
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProjectileMotionApp();
    console.log('🚀 Projectile Motion Simulator initialized!');
    console.log('💡 Tip: Press SPACE to fire, P to pause, R to reset');
});
