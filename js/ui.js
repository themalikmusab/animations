/**
 * Enhanced UI and Rendering System v2.5
 * Handles canvas drawing with advanced visual effects, particles, and realistic rendering
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Coordinate system parameters
        this.scale = 10; // pixels per meter
        this.originX = 80; // Origin x position in pixels
        this.originY = null; // Will be set in resizeCanvas

        // Visual settings
        this.gridSpacing = 5; // meters
        this.showGrid = true;

        // Enhanced visual systems (will be initialized when available)
        this.particleSystem = null;
        this.ballRenderer = null;
        this.vectorRenderer = null;
        this.environmentRenderer = null;
        this.pathRenderer = null;
        this.camera = null;
        this.performanceMonitor = null;

        // Initialize enhanced systems
        this.initEnhancedSystems();
    }

    initEnhancedSystems() {
        // Check if enhanced systems are available
        if (typeof ParticleSystem !== 'undefined') {
            this.particleSystem = new ParticleSystem(this.canvas.width, this.canvas.height);
        }

        if (typeof EnhancedBallRenderer !== 'undefined') {
            this.ballRenderer = new EnhancedBallRenderer();
        }

        if (typeof EnhancedVectorRenderer !== 'undefined') {
            this.vectorRenderer = new EnhancedVectorRenderer();
        }

        if (typeof EnvironmentRenderer !== 'undefined') {
            this.environmentRenderer = new EnvironmentRenderer(this.canvas);
        }

        if (typeof TrajectoryPathRenderer !== 'undefined') {
            this.pathRenderer = new TrajectoryPathRenderer();
        }

        if (typeof CameraSystem !== 'undefined') {
            this.camera = new CameraSystem(this.canvas);
        }

        if (typeof PerformanceMonitor !== 'undefined') {
            this.performanceMonitor = new PerformanceMonitor();
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = container.clientHeight - 40;
        this.originY = this.canvas.height - 80;

        // Update particle system and camera
        if (this.particleSystem) {
            this.particleSystem.resize(this.canvas.width, this.canvas.height);
        }
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(x, y) {
        return {
            x: this.originX + x * this.scale,
            y: this.originY - y * this.scale
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.originX) / this.scale,
            y: (this.originY - screenY) / this.scale
        };
    }

    /**
     * Draw background with enhanced environment
     */
    drawBackground() {
        if (this.environmentRenderer) {
            this.environmentRenderer.drawBackground(this.ctx);
        } else {
            // Fallback to simple background
            const groundY = this.originY;

            // Sky gradient
            const skyGradient = this.ctx.createLinearGradient(0, 0, 0, groundY);
            skyGradient.addColorStop(0, '#87CEEB');
            skyGradient.addColorStop(1, '#B0E0E6');
            this.ctx.fillStyle = skyGradient;
            this.ctx.fillRect(0, 0, this.canvas.width, groundY);

            // Ground
            const groundGradient = this.ctx.createLinearGradient(0, groundY, 0, this.canvas.height);
            groundGradient.addColorStop(0, '#90EE90');
            groundGradient.addColorStop(1, '#7CB878');
            this.ctx.fillStyle = groundGradient;
            this.ctx.fillRect(0, groundY, this.canvas.width, this.canvas.height - groundY);

            // Ground line
            this.ctx.strokeStyle = '#6B8E6B';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, groundY);
            this.ctx.lineTo(this.canvas.width, groundY);
            this.ctx.stroke();
        }
    }

    /**
     * Draw grid for measurements
     */
    drawGrid() {
        if (!this.showGrid) return;

        if (this.environmentRenderer) {
            const maxX = (this.canvas.width - this.originX) / this.scale;
            const maxY = this.originY / this.scale;

            this.environmentRenderer.drawGrid(
                this.ctx,
                {
                    x: (x) => this.worldToScreen(x, 0).x,
                    y: (y) => this.worldToScreen(0, y).y
                },
                maxX,
                maxY
            );
        } else {
            // Fallback grid
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

            // Vertical lines
            for (let x = 0; x <= 100; x += this.gridSpacing) {
                const screenPos = this.worldToScreen(x, 0);
                if (screenPos.x > this.canvas.width) break;

                this.ctx.beginPath();
                this.ctx.moveTo(screenPos.x, 0);
                this.ctx.lineTo(screenPos.x, this.originY);
                this.ctx.stroke();

                if (x % (this.gridSpacing * 2) === 0) {
                    this.ctx.fillText(x + 'm', screenPos.x - 10, this.originY + 20);
                }
            }

            // Horizontal lines
            for (let y = 0; y <= 100; y += this.gridSpacing) {
                const screenPos = this.worldToScreen(0, y);
                if (screenPos.y < 0) break;

                this.ctx.beginPath();
                this.ctx.moveTo(this.originX, screenPos.y);
                this.ctx.lineTo(this.canvas.width, screenPos.y);
                this.ctx.stroke();

                if (y > 0 && y % (this.gridSpacing * 2) === 0) {
                    this.ctx.fillText(y + 'm', 10, screenPos.y + 5);
                }
            }
        }
    }

    /**
     * Draw the launch cannon with enhanced visuals
     */
    drawCannon(angle) {
        const cannonLength = 45;
        const cannonWidth = 22;
        const origin = this.worldToScreen(0, 0);

        this.ctx.save();

        // Cannon shadow
        this.ctx.globalAlpha = 0.3;
        this.ctx.translate(origin.x + 3, origin.y + 3);
        this.ctx.rotate(-angle * Math.PI / 180);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);
        this.ctx.restore();

        // Cannon barrel
        this.ctx.save();
        this.ctx.translate(origin.x, origin.y);
        this.ctx.rotate(-angle * Math.PI / 180);

        // Barrel gradient
        const barrelGradient = this.ctx.createLinearGradient(0, -cannonWidth / 2, 0, cannonWidth / 2);
        barrelGradient.addColorStop(0, '#666');
        barrelGradient.addColorStop(0.5, '#555');
        barrelGradient.addColorStop(1, '#333');

        this.ctx.fillStyle = barrelGradient;
        this.ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);

        // Barrel highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(2, -cannonWidth / 2 + 2, cannonLength - 4, 3);

        // Barrel outline
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, -cannonWidth / 2, cannonLength, cannonWidth);

        // Barrel opening
        this.ctx.fillStyle = '#111';
        this.ctx.beginPath();
        this.ctx.ellipse(cannonLength, 0, 4, cannonWidth / 2, 0, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.restore();

        // Cannon base with 3D effect
        const baseGradient = this.ctx.createRadialGradient(
            origin.x - 3, origin.y - 3, 0,
            origin.x, origin.y, 18
        );
        baseGradient.addColorStop(0, '#555');
        baseGradient.addColorStop(0.7, '#333');
        baseGradient.addColorStop(1, '#222');

        this.ctx.fillStyle = baseGradient;
        this.ctx.beginPath();
        this.ctx.arc(origin.x, origin.y, 18, 0, 2 * Math.PI);
        this.ctx.fill();

        // Base outline
        this.ctx.strokeStyle = '#111';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Base highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(origin.x - 4, origin.y - 4, 6, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    /**
     * Draw projectile with enhanced visuals
     */
    drawProjectile(projectile) {
        if (!projectile) {
            console.warn('drawProjectile called with null projectile');
            return;
        }

        if (!projectile.isFlying && !projectile.hasLanded) {
            return;
        }

        const pos = this.worldToScreen(projectile.state.x, projectile.state.y);
        const radius = Math.max(5, projectile.diameter * this.scale / 2);
        const velocity = projectile.getVelocity();

        // Debug: Log first few renders
        if (projectile.time < 0.1) {
            console.log('⚽ Drawing ball at:', {
                world: { x: projectile.state.x, y: projectile.state.y },
                screen: pos,
                radius: radius,
                isFlying: projectile.isFlying
            });
        }

        if (this.ballRenderer) {
            // Use enhanced ball renderer
            this.ballRenderer.drawProjectile(
                this.ctx,
                pos.x,
                pos.y,
                radius,
                projectile.color,
                velocity
            );
        } else {
            // Fallback to simple rendering
            // Projectile shadow
            if (projectile.state.y > 0.5) {
                const shadowPos = this.worldToScreen(projectile.state.x, 0);
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                this.ctx.beginPath();
                this.ctx.ellipse(shadowPos.x, shadowPos.y, radius * 0.8, radius * 0.4, 0, 0, 2 * Math.PI);
                this.ctx.fill();
            }

            // Projectile body
            const gradient = this.ctx.createRadialGradient(
                pos.x - radius / 3, pos.y - radius / 3, 0,
                pos.x, pos.y, radius
            );
            gradient.addColorStop(0, projectile.color);
            gradient.addColorStop(1, this.shadeColor(projectile.color, -40));

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
            this.ctx.fill();

            // Outline
            this.ctx.strokeStyle = this.shadeColor(projectile.color, -60);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    /**
     * Draw trajectory path with enhanced visuals
     */
    drawTrajectory(projectile, show) {
        if (!show || projectile.trajectory.length < 2) return;

        if (this.pathRenderer) {
            // Use enhanced path renderer
            this.pathRenderer.drawPath(
                this.ctx,
                projectile.trajectory,
                projectile.color,
                {
                    x: (x) => this.worldToScreen(x, 0).x,
                    y: (y) => this.worldToScreen(0, y).y
                },
                true
            );
        } else {
            // Fallback to simple trajectory
            this.ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();

            const firstPoint = this.worldToScreen(projectile.trajectory[0].x, projectile.trajectory[0].y);
            this.ctx.moveTo(firstPoint.x, firstPoint.y);

            for (let i = 1; i < projectile.trajectory.length; i++) {
                const point = this.worldToScreen(projectile.trajectory[i].x, projectile.trajectory[i].y);
                this.ctx.lineTo(point.x, point.y);
            }

            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }
    }

    /**
     * Draw velocity and acceleration vectors with enhanced visuals
     */
    drawVectors(projectile, show) {
        if (!show || (!projectile.isFlying && !projectile.hasLanded)) return;

        const pos = this.worldToScreen(projectile.state.x, projectile.state.y);
        const velocityScale = 5;
        const accelScale = 10;

        if (this.vectorRenderer) {
            // Use enhanced vector renderer
            this.vectorRenderer.drawVector(
                this.ctx,
                pos.x, pos.y,
                projectile.state.vx * velocityScale,
                -projectile.state.vy * velocityScale,
                1,
                '#00ff00',
                'V'
            );

            this.vectorRenderer.drawVector(
                this.ctx,
                pos.x, pos.y,
                0,
                projectile.gravity * accelScale,
                1,
                '#0088ff',
                'g'
            );
        } else {
            // Fallback to simple vectors
            // Velocity vector
            this.drawArrow(
                pos.x, pos.y,
                pos.x + projectile.state.vx * velocityScale,
                pos.y - projectile.state.vy * velocityScale,
                '#00ff00',
                'Velocity'
            );

            // Gravity vector
            this.drawArrow(
                pos.x, pos.y,
                pos.x,
                pos.y + projectile.gravity * accelScale,
                '#0088ff',
                'Gravity'
            );
        }
    }

    /**
     * Draw an arrow (fallback method)
     */
    drawArrow(x1, y1, x2, y2, color, label) {
        const headLength = 10;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length < 5) return;

        const angle = Math.atan2(dy, dx);

        // Arrow line
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Arrow head
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);
        this.ctx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();

        // Label
        if (label) {
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText(label, x2 + 10, y2 - 10);
            this.ctx.fillText(label, x2 + 10, y2 - 10);
        }
    }

    /**
     * Update particle system and visual effects
     */
    update(projectile) {
        try {
            // Update particle system
            if (this.particleSystem) {
                this.particleSystem.update();
            }

            // Update camera
            if (this.camera && projectile && projectile.isFlying) {
                const pos = this.worldToScreen(projectile.state.x, projectile.state.y);
                this.camera.trackProjectile(pos.x, pos.y);
                this.camera.update();
            }

            // Update environment
            if (this.environmentRenderer) {
                this.environmentRenderer.update();
            }

            // Update performance monitor
            if (this.performanceMonitor) {
                this.performanceMonitor.update();
            }

            // Emit smoke trail if projectile is flying fast
            if (this.particleSystem && projectile && projectile.isFlying) {
                const velocity = projectile.getVelocity();
                if (velocity > 5) {
                    const pos = this.worldToScreen(projectile.state.x, projectile.state.y);
                    this.particleSystem.smokeTrail.emit(
                        pos.x,
                        pos.y,
                        projectile.state.vx,
                        -projectile.state.vy
                    );
                }
            }
        } catch (error) {
            // Silently catch errors to prevent breaking animation
            console.warn('Visual system update error:', error);
        }
    }

    /**
     * Trigger launch effect
     */
    triggerLaunchEffect(angle, velocity) {
        try {
            if (!this.particleSystem) return;

            const origin = this.worldToScreen(0, 0);
            const power = Math.min(velocity / 20, 1.5);

            this.particleSystem.launch.launch(
                origin.x,
                origin.y,
                angle * Math.PI / 180,
                power
            );

            // Clear ball trail
            if (this.ballRenderer) {
                this.ballRenderer.clearTrail();
            }
        } catch (error) {
            console.warn('Launch effect error:', error);
        }
    }

    /**
     * Trigger impact effect
     */
    triggerImpactEffect(x, y, velocity, angle) {
        try {
            if (!this.particleSystem) return;

            const pos = this.worldToScreen(x, y);
            this.particleSystem.impact.impact(pos.x, pos.y, velocity, angle);
        } catch (error) {
            console.warn('Impact effect error:', error);
        }
    }

    /**
     * Trigger target hit effect
     */
    triggerTargetHitEffect(x, y, targetSize, score) {
        try {
            if (!this.particleSystem) return;

            const pos = this.worldToScreen(x, y);
            this.particleSystem.targetHit.hit(pos.x, pos.y, targetSize * this.scale, score);
        } catch (error) {
            console.warn('Target hit effect error:', error);
        }
    }

    /**
     * Trigger explosion effect
     */
    triggerExplosion(x, y, intensity = 1.0) {
        try {
            if (!this.particleSystem) return;

            const pos = this.worldToScreen(x, y);
            this.particleSystem.explosion.explode(pos.x, pos.y, intensity);
        } catch (error) {
            console.warn('Explosion effect error:', error);
        }
    }

    /**
     * Draw particle system
     */
    drawParticles() {
        try {
            if (this.particleSystem) {
                this.particleSystem.draw(this.ctx);
            }
        } catch (error) {
            console.warn('Particle draw error:', error);
        }
    }

    /**
     * Draw performance stats
     */
    drawPerformanceStats() {
        try {
            if (this.performanceMonitor) {
                const particleCount = this.particleSystem ? this.particleSystem.getParticleCount() : 0;
                this.performanceMonitor.draw(this.ctx, particleCount);
            }
        } catch (error) {
            console.warn('Performance stats draw error:', error);
        }
    }

    /**
     * Toggle performance stats display
     */
    togglePerformanceStats() {
        if (this.performanceMonitor) {
            this.performanceMonitor.toggle();
        }
    }

    /**
     * Clear all particle effects
     */
    clearParticles() {
        if (this.particleSystem) {
            this.particleSystem.clear();
        }
        if (this.ballRenderer) {
            this.ballRenderer.clearTrail();
        }
    }

    /**
     * Utility: Shade a color
     */
    shadeColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    }
}
