/**
 * Main Application Controller - Advanced Features
 * Coordinates UI, physics, rendering, graphs, and tools
 */

class ProjectileMotionApp {
    constructor() {
        // Get canvases
        this.canvas = document.getElementById('simulation-canvas');
        this.targetCanvas = document.getElementById('target-canvas');

        // Create renderer
        this.renderer = new Renderer(this.canvas);
        this.targetRenderer = new Renderer(this.targetCanvas);

        // Simulation state
        this.projectiles = [];
        this.currentProjectile = null;
        this.isPaused = false;
        this.animationId = null;
        this.currentTab = 'simulation';
        this.simulationSpeed = 1.0;

        // Parameters
        this.params = {
            velocity: 15,
            angle: 45,
            mass: 1.0,
            diameter: 0.5,
            gravity: 9.81,
            airResistance: false,
            windSpeed: 0,
            windEnabled: false
        };

        // Visual settings
        this.showVectors = true;
        this.showTrajectory = true;
        this.showPrediction = false;
        this.multiProjectileMode = false;

        // Tools
        this.tapeMeasure = new TapeMeasure(this.renderer);
        this.tapeMeasureActive = false;
        this.dataExporter = new DataExporter();
        this.trajectoryPredictor = new TrajectoryPredictor(this.renderer);
        this.targetSystem = new TargetSystem(this.renderer);
        this.targetMode = false;

        // v2.0 Systems
        this.soundEffects = new SoundEffects();
        this.configManager = new ConfigurationManager(this);
        this.leaderboard = new Leaderboard();
        this.mobileSupport = new MobileSupport(this);
        this.fullscreenManager = new FullscreenManager();

        // Graphs
        this.initializeGraphs();

        // Initialize
        this.initializeControls();
        this.initializeTabs();
        this.initializeCanvasInteraction();
        this.createProjectile();
        this.startAnimation();

        // Update predictions
        this.updatePredictions();

        // Enable swipe navigation on mobile
        if (this.mobileSupport.isMobile) {
            this.mobileSupport.enableSwipeNavigation();
        }
    }

    /**
     * Initialize graphing system
     */
    initializeGraphs() {
        // Position graph (X vs Time)
        const positionCanvas = document.getElementById('position-graph');
        this.positionGraph = new MultiGraph(positionCanvas, {
            title: 'Position vs Time',
            xLabel: 'Time (s)',
            yLabel: 'Position (m)',
            xMin: 0,
            xMax: 10,
            yMin: 0,
            yMax: 50
        });
        this.positionGraph.addDataSet('X Position', '#ff4444');
        this.positionGraph.addDataSet('Y Position', '#4444ff');

        // Velocity graph
        const velocityCanvas = document.getElementById('velocity-graph');
        this.velocityGraph = new MultiGraph(velocityCanvas, {
            title: 'Velocity vs Time',
            xLabel: 'Time (s)',
            yLabel: 'Velocity (m/s)',
            xMin: 0,
            xMax: 10,
            yMin: -20,
            yMax: 20
        });
        this.velocityGraph.addDataSet('Vx', '#ff4444');
        this.velocityGraph.addDataSet('Vy', '#4444ff');

        // Height graph
        const heightCanvas = document.getElementById('height-graph');
        this.heightGraph = new Graph(heightCanvas, {
            title: 'Trajectory (X vs Y)',
            xLabel: 'Range (m)',
            yLabel: 'Height (m)',
            xMin: 0,
            xMax: 50,
            yMin: 0,
            yMax: 20,
            lineColor: '#44ff44'
        });

        // Comparison graph
        const comparisonCanvas = document.getElementById('comparison-graph');
        if (comparisonCanvas) {
            this.comparisonGraph = new Graph(comparisonCanvas, {
                title: 'Energy vs Time',
                xLabel: 'Time (s)',
                yLabel: 'Energy (J)',
                xMin: 0,
                xMax: 10,
                yMin: 0,
                yMax: 200
            });
        }
    }

    /**
     * Initialize tab navigation
     */
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`tab-${tabName}`).classList.add('active');

        this.currentTab = tabName;

        // Handle target practice mode
        if (tabName === 'target-practice') {
            this.activateTargetMode();
        } else {
            this.deactivateTargetMode();
        }

        // Resize graphs when graph tab is shown
        if (tabName === 'graphs') {
            setTimeout(() => {
                this.positionGraph.resizeCanvas();
                this.velocityGraph.resizeCanvas();
                this.heightGraph.resizeCanvas();
                this.positionGraph.draw();
                this.velocityGraph.draw();
                this.heightGraph.draw();
            }, 100);
        }
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
            this.updatePredictions();
        });

        // Angle slider
        const angleSlider = document.getElementById('angle');
        const angleValue = document.getElementById('angle-value');
        angleSlider.addEventListener('input', (e) => {
            this.params.angle = parseFloat(e.target.value);
            angleValue.textContent = this.params.angle;
            this.createProjectile();
            this.updatePredictions();
        });

        // Mass slider
        const massSlider = document.getElementById('mass');
        const massValue = document.getElementById('mass-value');
        massSlider.addEventListener('input', (e) => {
            this.params.mass = parseFloat(e.target.value);
            massValue.textContent = this.params.mass.toFixed(1);
            this.createProjectile();
            this.updatePredictions();
        });

        // Diameter slider
        const diameterSlider = document.getElementById('diameter');
        const diameterValue = document.getElementById('diameter-value');
        diameterSlider.addEventListener('input', (e) => {
            this.params.diameter = parseFloat(e.target.value);
            diameterValue.textContent = this.params.diameter.toFixed(2);
            this.createProjectile();
            this.updatePredictions();
        });

        // Gravity selector
        const gravitySelect = document.getElementById('gravity');
        const gravityValue = document.getElementById('gravity-value');
        gravitySelect.addEventListener('change', (e) => {
            this.params.gravity = parseFloat(e.target.value);
            gravityValue.textContent = this.params.gravity.toFixed(2);
            this.createProjectile();
            this.updatePredictions();
        });

        // Air resistance checkbox
        const airResistanceCheckbox = document.getElementById('air-resistance');
        airResistanceCheckbox.addEventListener('change', (e) => {
            this.params.airResistance = e.target.checked;
            this.createProjectile();
            this.updatePredictions();
        });

        // Wind enabled checkbox
        const windEnabledCheckbox = document.getElementById('wind-enabled');
        const windControl = document.getElementById('wind-control');
        windEnabledCheckbox.addEventListener('change', (e) => {
            this.params.windEnabled = e.target.checked;
            windControl.style.display = e.target.checked ? 'block' : 'none';
            this.createProjectile();
        });

        // Wind speed slider
        const windSpeedSlider = document.getElementById('wind-speed');
        const windSpeedValue = document.getElementById('wind-speed-value');
        windSpeedSlider.addEventListener('input', (e) => {
            this.params.windSpeed = parseFloat(e.target.value);
            windSpeedValue.textContent = this.params.windSpeed.toFixed(1);
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

        // Show prediction checkbox
        const showPredictionCheckbox = document.getElementById('show-prediction');
        showPredictionCheckbox.addEventListener('change', (e) => {
            this.showPrediction = e.target.checked;
        });

        // Tape measure mode checkbox
        const tapeMeasureCheckbox = document.getElementById('tape-measure-mode');
        tapeMeasureCheckbox.addEventListener('change', (e) => {
            this.tapeMeasureActive = e.target.checked;
            if (!e.target.checked) {
                this.tapeMeasure.clear();
            }
        });

        // Simulation speed slider
        const simSpeedSlider = document.getElementById('sim-speed');
        const simSpeedValue = document.getElementById('sim-speed-value');
        simSpeedSlider.addEventListener('input', (e) => {
            this.simulationSpeed = parseFloat(e.target.value);
            simSpeedValue.textContent = this.simulationSpeed.toFixed(1);
        });

        // Multi-projectile mode
        const multiProjectileCheckbox = document.getElementById('multi-projectile-mode');
        const multiProjectileControls = document.getElementById('multi-projectile-controls');
        multiProjectileCheckbox.addEventListener('change', (e) => {
            this.multiProjectileMode = e.target.checked;
            multiProjectileControls.style.display = e.target.checked ? 'block' : 'none';
        });

        // Clear projectiles button
        const clearProjectilesBtn = document.getElementById('clear-projectiles-btn');
        clearProjectilesBtn.addEventListener('click', () => {
            this.projectiles = [];
            this.currentProjectile = null;
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

        // Export CSV button
        const exportCsvBtn = document.getElementById('export-csv-btn');
        exportCsvBtn.addEventListener('click', () => {
            this.dataExporter.exportToCSV();
        });

        // Export JSON button
        const exportJsonBtn = document.getElementById('export-json-btn');
        exportJsonBtn.addEventListener('click', () => {
            this.dataExporter.exportJSON();
        });

        // New targets button
        const newTargetsBtn = document.getElementById('new-targets-btn');
        newTargetsBtn.addEventListener('click', () => {
            this.targetSystem.createRandomTargets(5);
            this.updateTargetDisplay();
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
     * Initialize canvas interaction (for tape measure)
     */
    initializeCanvasInteraction() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (!this.tapeMeasureActive) return;

            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            // Convert to world coordinates
            const worldX = (screenX - this.renderer.originX) / this.renderer.scale;
            const worldY = (this.renderer.originY - screenY) / this.renderer.scale;

            this.tapeMeasure.start(worldX, worldY);
            this.tapeMeasure.isDragging = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.tapeMeasureActive || !this.tapeMeasure.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const screenX = e.clientX - rect.left;
            const screenY = e.clientY - rect.top;

            const worldX = (screenX - this.renderer.originX) / this.renderer.scale;
            const worldY = (this.renderer.originY - screenY) / this.renderer.scale;

            this.tapeMeasure.update(worldX, worldY);
        });

        this.canvas.addEventListener('mouseup', () => {
            if (this.tapeMeasure.isDragging) {
                this.tapeMeasure.finish();
            }
        });
    }

    /**
     * Create a new projectile with current parameters
     */
    createProjectile() {
        const projectileParams = {
            velocity: this.params.velocity,
            angle: this.params.angle,
            mass: this.params.mass,
            diameter: this.params.diameter,
            gravity: this.params.gravity,
            airResistance: this.params.airResistance,
            windSpeed: this.params.windEnabled ? this.params.windSpeed : 0,
            color: this.getProjectileColor()
        };

        if (this.multiProjectileMode) {
            // Don't replace current projectile
            this.currentProjectile = new Projectile(projectileParams);
        } else {
            this.currentProjectile = new Projectile(projectileParams);
            this.projectiles = [this.currentProjectile];
        }
    }

    getProjectileColor() {
        const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffaa00', '#ff00ff', '#00ffff'];
        return colors[this.projectiles.length % colors.length];
    }

    /**
     * Fire the projectile
     */
    fireProjectile() {
        this.createProjectile();
        this.currentProjectile.launch();

        if (this.multiProjectileMode) {
            this.projectiles.push(this.currentProjectile);
        }

        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';

        // Clear graphs
        this.positionGraph.clear();
        this.velocityGraph.clear();
        this.heightGraph.clear();
        this.dataExporter.clear();

        // Play launch sound
        this.soundEffects.playLaunch();
        this.soundEffects.resume();
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
        if (!this.multiProjectileMode) {
            this.projectiles.forEach(p => p.reset());
        } else {
            this.projectiles = [];
        }
        this.currentProjectile = null;
        this.isPaused = false;
        document.getElementById('pause-btn').textContent = '⏸ Pause';
        this.positionGraph.clear();
        this.velocityGraph.clear();
        this.heightGraph.clear();
        this.dataExporter.clear();
        this.tapeMeasure.clear();
        this.updateDataDisplay();
        this.updateAnalysisDisplay();
    }

    /**
     * Activate target practice mode
     */
    activateTargetMode() {
        this.targetMode = true;
        this.targetSystem.createRandomTargets(5);
        document.getElementById('target-stats').style.display = 'block';
        this.updateTargetDisplay();
    }

    /**
     * Deactivate target practice mode
     */
    deactivateTargetMode() {
        this.targetMode = false;
        document.getElementById('target-stats').style.display = 'none';
    }

    /**
     * Main animation loop
     */
    animate() {
        // Update physics (with simulation speed)
        if (!this.isPaused) {
            const steps = Math.max(1, Math.round(this.simulationSpeed * 1));
            for (let i = 0; i < steps; i++) {
                this.projectiles.forEach(projectile => {
                    if (projectile) {
                        const wasFlying = projectile.isFlying;
                        projectile.update();

                        // Play land sound when projectile lands
                        if (wasFlying && projectile.hasLanded) {
                            this.soundEffects.playLand();
                        }

                        // Check target hits
                        if (this.targetMode && projectile.isFlying) {
                            const hitBefore = this.targetSystem.targets.filter(t => t.hit).length;
                            this.targetSystem.checkHit(
                                projectile.state.x,
                                projectile.state.y,
                                projectile.diameter / 2
                            );
                            const hitAfter = this.targetSystem.targets.filter(t => t.hit).length;

                            // Play hit sound if new target was hit
                            if (hitAfter > hitBefore) {
                                this.soundEffects.playHit();
                            }

                            // Check if all targets hit - submit to leaderboard
                            if (projectile.hasLanded && hitAfter === this.targetSystem.targets.length &&
                                this.targetSystem.targets.length > 0) {
                                this.submitToLeaderboard();
                            }
                        }

                        // Record data for export
                        if (projectile === this.currentProjectile && projectile.isFlying) {
                            this.recordData(projectile);
                        }
                    }
                });
            }
        }

        // Render appropriate scene
        if (this.currentTab === 'target-practice') {
            this.renderTargetMode();
        } else {
            this.render();
        }

        // Update displays
        this.updateDataDisplay();
        this.updateGraphs();
        this.updateAnalysisDisplay();

        if (this.targetMode) {
            this.updateTargetDisplay();
        }

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
     * Render the simulation scene
     */
    render() {
        this.renderer.clear();
        this.renderer.drawBackground();
        this.renderer.drawGrid();
        this.renderer.drawCannon(this.params.angle);

        // Draw prediction
        if (this.showPrediction) {
            this.trajectoryPredictor.drawPrediction(this.params, this.showPrediction);
        }

        // Draw all projectiles
        this.projectiles.forEach(projectile => {
            if (projectile) {
                this.renderer.drawTrajectory(projectile, this.showTrajectory);
                this.renderer.drawProjectile(projectile);
                if (projectile === this.currentProjectile) {
                    this.renderer.drawVectors(projectile, this.showVectors);
                }
            }
        });

        // Draw tape measure
        this.tapeMeasure.draw();
    }

    /**
     * Render target practice mode
     */
    renderTargetMode() {
        this.targetRenderer.clear();
        this.targetRenderer.drawBackground();
        this.targetRenderer.drawGrid();
        this.targetRenderer.drawCannon(this.params.angle);

        // Draw targets
        this.targetSystem.draw();

        // Draw projectiles
        this.projectiles.forEach(projectile => {
            if (projectile) {
                this.targetRenderer.drawTrajectory(projectile, this.showTrajectory);
                this.targetRenderer.drawProjectile(projectile);
            }
        });
    }

    /**
     * Update graphs
     */
    updateGraphs() {
        if (this.currentTab !== 'graphs') return;

        const projectile = this.currentProjectile;
        if (!projectile || !projectile.isFlying) {
            this.positionGraph.draw();
            this.velocityGraph.draw();
            this.heightGraph.draw();
            return;
        }

        // Add data points
        this.positionGraph.addDataPoint('X Position', projectile.time, projectile.state.x);
        this.positionGraph.addDataPoint('Y Position', projectile.time, projectile.state.y);

        this.velocityGraph.addDataPoint('Vx', projectile.time, projectile.state.vx);
        this.velocityGraph.addDataPoint('Vy', projectile.time, projectile.state.vy);

        this.heightGraph.addDataPoint(projectile.state.x, projectile.state.y);

        // Draw graphs
        this.positionGraph.draw();
        this.velocityGraph.draw();
        this.heightGraph.draw();
    }

    /**
     * Record data for export
     */
    recordData(projectile) {
        if (!projectile.isFlying) return;

        const velocity = projectile.getVelocity();
        const ke = 0.5 * projectile.mass * velocity * velocity;
        const pe = projectile.mass * projectile.gravity * Math.max(0, projectile.state.y);

        this.dataExporter.addRow({
            time: projectile.time,
            x: projectile.state.x,
            y: projectile.state.y,
            vx: projectile.state.vx,
            vy: projectile.state.vy,
            velocity: velocity,
            kineticEnergy: ke,
            potentialEnergy: pe,
            totalEnergy: ke + pe
        });
    }

    /**
     * Update data display panel
     */
    updateDataDisplay() {
        const projectile = this.currentProjectile;
        if (!projectile) return;

        const timeDisplay = document.getElementById('time-display');
        const rangeDisplay = document.getElementById('range-display');
        const heightDisplay = document.getElementById('height-display');
        const maxHeightDisplay = document.getElementById('max-height-display');
        const velocityDisplay = document.getElementById('velocity-display');

        timeDisplay.textContent = projectile.time.toFixed(2) + ' s';
        rangeDisplay.textContent = projectile.state.x.toFixed(2) + ' m';
        heightDisplay.textContent = Math.max(0, projectile.state.y).toFixed(2) + ' m';
        maxHeightDisplay.textContent = projectile.maxHeight.toFixed(2) + ' m';
        velocityDisplay.textContent = projectile.getVelocity().toFixed(2) + ' m/s';
    }

    /**
     * Update predictions
     */
    updatePredictions() {
        if (!this.currentProjectile) return;

        const physics = this.currentProjectile.physics;
        const range = physics.calculateMaxRange(this.params.velocity, this.params.angle, this.params.gravity);
        const height = physics.calculateMaxHeight(this.params.velocity, this.params.angle, this.params.gravity);
        const time = physics.calculateFlightTime(this.params.velocity, this.params.angle, this.params.gravity);

        document.getElementById('predicted-range').textContent = range.toFixed(2);
        document.getElementById('predicted-height').textContent = height.toFixed(2);
        document.getElementById('predicted-time').textContent = time.toFixed(2);
    }

    /**
     * Update analysis display
     */
    updateAnalysisDisplay() {
        if (this.currentTab !== 'analysis') return;

        const projectile = this.currentProjectile;
        if (!projectile) return;

        // Actual results
        document.getElementById('actual-range').textContent =
            (projectile.hasLanded ? projectile.range : projectile.state.x).toFixed(2);
        document.getElementById('actual-height').textContent = projectile.maxHeight.toFixed(2);
        document.getElementById('actual-time').textContent = projectile.time.toFixed(2);
        document.getElementById('impact-velocity').textContent =
            (projectile.hasLanded ? projectile.getVelocity() : 0).toFixed(2);

        // Energy calculations
        const velocity = projectile.getVelocity();
        const ke = 0.5 * projectile.mass * velocity * velocity;
        const pe = projectile.mass * projectile.gravity * Math.max(0, projectile.state.y);
        const initialKE = 0.5 * projectile.mass * projectile.v0 * projectile.v0;
        const maxPE = projectile.mass * projectile.gravity * projectile.maxHeight;

        document.getElementById('initial-ke').textContent = initialKE.toFixed(2);
        document.getElementById('max-pe').textContent = maxPE.toFixed(2);
        document.getElementById('current-ke').textContent = ke.toFixed(2);
        document.getElementById('current-pe').textContent = pe.toFixed(2);
    }

    /**
     * Update target display
     */
    updateTargetDisplay() {
        const totalTargets = this.targetSystem.targets.length;
        const hitTargets = this.targetSystem.targets.filter(t => t.hit).length;

        document.getElementById('score-display').textContent = this.targetSystem.score;
        document.getElementById('targets-hit-display').textContent = `${hitTargets} / ${totalTargets}`;
    }

    /**
     * Submit score to leaderboard (target practice mode)
     */
    submitToLeaderboard() {
        if (!this.targetMode) return;

        const totalTargets = this.targetSystem.targets.length;
        const hitTargets = this.targetSystem.targets.filter(t => t.hit).length;
        const score = this.targetSystem.score;

        // Only submit if player hit at least one target
        if (hitTargets > 0) {
            const rank = this.leaderboard.addScore(score, hitTargets, totalTargets);

            // Play appropriate sound
            if (rank === 1) {
                this.soundEffects.playSuccess();
            } else if (rank > 0 && rank <= 3) {
                this.soundEffects.playSuccess();
            }
        }

        // Prevent multiple submissions
        this.targetMode = false;
        setTimeout(() => {
            this.targetMode = true;
        }, 1000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProjectileMotionApp();
    console.log('🚀 Projectile Motion Simulator v2.0 initialized!');
    console.log('💡 New in v2.0: Mobile Support, Sound Effects, Save/Load, Leaderboard, Advanced Physics');
    console.log('💡 Features: Graphs, Wind, Targets, Multi-Projectile, Data Export, Analysis');
    console.log('💡 Shortcuts: SPACE=fire, P=pause, R=reset');
    console.log('💡 Mobile: Swipe to change tabs, touch to measure');
});
