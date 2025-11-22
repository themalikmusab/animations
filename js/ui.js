/**
 * UI and Rendering System
 * Handles canvas drawing and visual representation
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

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
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 40;
        this.canvas.height = container.clientHeight - 40;
        this.originY = this.canvas.height - 80;
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
     * Draw background with sky and ground
     */
    drawBackground() {
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

    /**
     * Draw grid for measurements
     */
    drawGrid() {
        if (!this.showGrid) return;

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

            // Labels
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

            // Labels
            if (y > 0 && y % (this.gridSpacing * 2) === 0) {
                this.ctx.fillText(y + 'm', 10, screenPos.y + 5);
            }
        }
    }

    /**
     * Draw the launch cannon
     */
    drawCannon(angle) {
        const cannonLength = 40;
        const cannonWidth = 20;
        const origin = this.worldToScreen(0, 0);

        this.ctx.save();
        this.ctx.translate(origin.x, origin.y);
        this.ctx.rotate(-angle * Math.PI / 180);

        // Cannon barrel
        this.ctx.fillStyle = '#444';
        this.ctx.fillRect(0, -cannonWidth / 2, cannonLength, cannonWidth);

        // Cannon outline
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, -cannonWidth / 2, cannonLength, cannonWidth);

        this.ctx.restore();

        // Cannon base
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(origin.x, origin.y, 15, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#222';
        this.ctx.stroke();
    }

    /**
     * Draw projectile
     */
    drawProjectile(projectile) {
        if (!projectile.isFlying && !projectile.hasLanded) return;

        const pos = this.worldToScreen(projectile.state.x, projectile.state.y);
        const radius = Math.max(5, projectile.diameter * this.scale / 2);

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

    /**
     * Draw trajectory path
     */
    drawTrajectory(projectile, show) {
        if (!show || projectile.trajectory.length < 2) return;

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

    /**
     * Draw velocity and acceleration vectors
     */
    drawVectors(projectile, show) {
        if (!show || (!projectile.isFlying && !projectile.hasLanded)) return;

        const pos = this.worldToScreen(projectile.state.x, projectile.state.y);
        const velocityScale = 5;

        // Velocity vector (green)
        this.drawArrow(
            pos.x, pos.y,
            pos.x + projectile.state.vx * velocityScale,
            pos.y - projectile.state.vy * velocityScale,
            '#00ff00',
            'Velocity'
        );

        // Acceleration vector (blue) - always points down for gravity
        const accelScale = 10;
        this.drawArrow(
            pos.x, pos.y,
            pos.x,
            pos.y + projectile.gravity * accelScale,
            '#0088ff',
            'Gravity'
        );
    }

    /**
     * Draw an arrow
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
