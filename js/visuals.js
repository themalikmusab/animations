/**
 * Advanced Visual Effects and Rendering Enhancements
 * Provides realistic rendering, shadows, lighting, and visual polish
 */

/**
 * Enhanced Ball Renderer with shadows and 3D effect
 */
class EnhancedBallRenderer {
    constructor() {
        this.trailPoints = [];
        this.maxTrailPoints = 50;
        this.glowIntensity = 0;
    }

    /**
     * Draw projectile with realistic 3D appearance
     */
    drawProjectile(ctx, x, y, radius, color, velocity) {
        // Shadow
        this.drawShadow(ctx, x, y, radius);

        // Trail/Motion blur
        this.updateTrail(x, y);
        this.drawTrail(ctx, color);

        // Main ball with gradient
        const gradient = ctx.createRadialGradient(
            x - radius * 0.3,
            y - radius * 0.3,
            radius * 0.1,
            x,
            y,
            radius
        );

        // Create 3D sphere effect
        gradient.addColorStop(0, this.lightenColor(color, 80));
        gradient.addColorStop(0.3, this.lightenColor(color, 40));
        gradient.addColorStop(0.7, color);
        gradient.addColorStop(1, this.darkenColor(color, 30));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Specular highlight
        const highlight = ctx.createRadialGradient(
            x - radius * 0.4,
            y - radius * 0.4,
            0,
            x - radius * 0.4,
            y - radius * 0.4,
            radius * 0.4
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = highlight;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Outline for better visibility
        ctx.strokeStyle = this.darkenColor(color, 40);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Speed glow effect
        if (velocity > 10) {
            this.glowIntensity = Math.min((velocity - 10) / 20, 1);
            const glowGradient = ctx.createRadialGradient(x, y, radius, x, y, radius * 2);
            glowGradient.addColorStop(0, `rgba(255, 200, 100, ${this.glowIntensity * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawShadow(ctx, x, y, radius) {
        const groundY = ctx.canvas.height * 0.85; // Approximate ground level
        const shadowScale = Math.max(0.3, 1 - Math.abs(y - groundY) / 200);
        const shadowAlpha = Math.max(0.1, shadowScale * 0.4);

        ctx.save();
        ctx.globalAlpha = shadowAlpha;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.ellipse(x, groundY + 5, radius * shadowScale, radius * shadowScale * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    updateTrail(x, y) {
        this.trailPoints.push({ x, y, alpha: 1.0 });
        if (this.trailPoints.length > this.maxTrailPoints) {
            this.trailPoints.shift();
        }
    }

    drawTrail(ctx, color) {
        for (let i = 0; i < this.trailPoints.length - 1; i++) {
            const point = this.trailPoints[i];
            const alpha = (i / this.trailPoints.length) * 0.3;
            const size = (i / this.trailPoints.length) * 3;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    clearTrail() {
        this.trailPoints = [];
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

/**
 * Enhanced Vector Renderer with better visualization
 */
class EnhancedVectorRenderer {
    drawVector(ctx, x, y, vx, vy, scale, color, label) {
        const arrowLength = Math.sqrt(vx * vx + vy * vy) * scale;
        if (arrowLength < 1) return;

        const angle = Math.atan2(vy, vx);
        const endX = x + vx * scale;
        const endY = y + vy * scale;

        // Vector shadow
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 2);
        ctx.lineTo(endX + 2, endY + 2);
        ctx.stroke();
        ctx.restore();

        // Main vector line with gradient
        const gradient = ctx.createLinearGradient(x, y, endX, endY);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.adjustAlpha(color, 0.6));

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Arrowhead
        const headLength = Math.min(15, arrowLength * 0.3);
        const headAngle = Math.PI / 6;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - headLength * Math.cos(angle - headAngle),
            endY - headLength * Math.sin(angle - headAngle)
        );
        ctx.lineTo(
            endX - headLength * Math.cos(angle + headAngle),
            endY - headLength * Math.sin(angle + headAngle)
        );
        ctx.closePath();
        ctx.fill();

        // Glow effect
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        // Label
        if (label) {
            ctx.save();
            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeText(label, endX + 10, endY - 10);
            ctx.fillText(label, endX + 10, endY - 10);
            ctx.restore();
        }
    }

    adjustAlpha(color, alpha) {
        if (color.startsWith('rgba')) {
            return color.replace(/[\d.]+\)$/g, alpha + ')');
        } else if (color.startsWith('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        } else {
            return color;
        }
    }
}

/**
 * Enhanced Environment Renderer
 */
class EnvironmentRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.time = 0;
        this.sunPosition = { x: 100, y: 100 };
    }

    drawBackground(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(0.5, '#B0E0E6');
        skyGradient.addColorStop(1, '#E0F6FF');

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, width, height * 0.7);

        // Sun
        this.drawSun(ctx, this.sunPosition.x, this.sunPosition.y);

        // Ground
        const groundGradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
        groundGradient.addColorStop(0, '#90EE90');
        groundGradient.addColorStop(0.3, '#7CB342');
        groundGradient.addColorStop(1, '#558B2F');

        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, height * 0.7, width, height * 0.3);

        // Ground texture/details
        this.drawGroundTexture(ctx);
    }

    drawSun(ctx, x, y) {
        // Sun glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 50);
        glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
        glowGradient.addColorStop(0.5, 'rgba(255, 255, 100, 0.3)');
        glowGradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, 50, 0, Math.PI * 2);
        ctx.fill();

        // Sun core
        const sunGradient = ctx.createRadialGradient(x - 5, y - 5, 0, x, y, 25);
        sunGradient.addColorStop(0, '#FFFACD');
        sunGradient.addColorStop(0.5, '#FFD700');
        sunGradient.addColorStop(1, '#FFA500');

        ctx.fillStyle = sunGradient;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGroundTexture(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const groundY = height * 0.7;

        ctx.save();
        ctx.globalAlpha = 0.3;

        // Grass blades
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = groundY + Math.random() * (height * 0.3);
            const bladeHeight = 3 + Math.random() * 5;

            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (Math.random() - 0.5) * 2, y - bladeHeight);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawGrid(ctx, worldToScreen, maxX, maxY) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);

        // Vertical lines every 5 meters
        for (let x = 0; x <= maxX; x += 5) {
            const screenX = worldToScreen.x(x);
            ctx.beginPath();
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, height);
            ctx.stroke();

            // Label
            if (x % 10 === 0) {
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.fillText(`${x}m`, screenX + 2, height - 5);
            }
        }

        // Horizontal lines every 5 meters
        for (let y = 0; y <= maxY; y += 5) {
            const screenY = worldToScreen.y(y);
            ctx.beginPath();
            ctx.moveTo(0, screenY);
            ctx.lineTo(width, screenY);
            ctx.stroke();

            // Label
            if (y % 10 === 0 && y > 0) {
                ctx.fillStyle = '#333';
                ctx.font = '10px Arial';
                ctx.fillText(`${y}m`, 5, screenY - 2);
            }
        }

        ctx.restore();
    }

    update(dt = 1) {
        this.time += dt * 0.016; // Convert to seconds
    }
}

/**
 * Trajectory Path Renderer with enhanced visuals
 */
class TrajectoryPathRenderer {
    drawPath(ctx, points, color, worldToScreen, showDots = true) {
        if (points.length < 2) return;

        // Draw shadow path
        ctx.save();
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        points.forEach((point, i) => {
            const screenX = worldToScreen.x(point.x) + 2;
            const screenY = worldToScreen.y(point.y) + 2;
            if (i === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        });

        ctx.stroke();
        ctx.restore();

        // Draw main path with gradient
        const gradient = ctx.createLinearGradient(
            worldToScreen.x(points[0].x),
            worldToScreen.y(points[0].y),
            worldToScreen.x(points[points.length - 1].x),
            worldToScreen.y(points[points.length - 1].y)
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, this.adjustColorBrightness(color, 1.3));
        gradient.addColorStop(1, this.adjustColorBrightness(color, 0.7));

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        points.forEach((point, i) => {
            const screenX = worldToScreen.x(point.x);
            const screenY = worldToScreen.y(point.y);
            if (i === 0) {
                ctx.moveTo(screenX, screenY);
            } else {
                ctx.lineTo(screenX, screenY);
            }
        });

        ctx.stroke();

        // Draw dots at intervals
        if (showDots) {
            points.forEach((point, i) => {
                if (i % 5 === 0) {
                    const screenX = worldToScreen.x(point.x);
                    const screenY = worldToScreen.y(point.y);

                    // Dot shadow
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                    ctx.beginPath();
                    ctx.arc(screenX + 1, screenY + 1, 3, 0, Math.PI * 2);
                    ctx.fill();

                    // Dot
                    const dotGradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 3);
                    dotGradient.addColorStop(0, '#ffffff');
                    dotGradient.addColorStop(0.5, color);
                    dotGradient.addColorStop(1, this.adjustColorBrightness(color, 0.5));

                    ctx.fillStyle = dotGradient;
                    ctx.beginPath();
                    ctx.arc(screenX, screenY, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
        }
    }

    adjustColorBrightness(color, factor) {
        if (color.startsWith('#')) {
            const num = parseInt(color.replace("#", ""), 16);
            const R = Math.min(255, Math.max(0, Math.floor((num >> 16) * factor)));
            const G = Math.min(255, Math.max(0, Math.floor((num >> 8 & 0x00FF) * factor)));
            const B = Math.min(255, Math.max(0, Math.floor((num & 0x0000FF) * factor)));
            return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
        }
        return color;
    }
}

/**
 * Camera System for zoom and pan
 */
class CameraSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.offset = { x: 0, y: 0 };
        this.targetOffset = { x: 0, y: 0 };
        this.smoothing = 0.1;
        this.autoTrack = true;
    }

    update() {
        // Smooth zoom
        this.zoom += (this.targetZoom - this.zoom) * this.smoothing;

        // Smooth pan
        this.offset.x += (this.targetOffset.x - this.offset.x) * this.smoothing;
        this.offset.y += (this.targetOffset.y - this.offset.y) * this.smoothing;
    }

    setZoom(zoom) {
        this.targetZoom = Math.max(0.5, Math.min(2.0, zoom));
    }

    setOffset(x, y) {
        this.targetOffset.x = x;
        this.targetOffset.y = y;
    }

    trackProjectile(projectileX, projectileY) {
        if (!this.autoTrack) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Auto-pan to keep projectile in view
        const screenX = projectileX - this.offset.x;
        const screenY = projectileY - this.offset.y;

        if (screenX > this.canvas.width * 0.7) {
            this.targetOffset.x += (screenX - this.canvas.width * 0.5) * 0.1;
        } else if (screenX < this.canvas.width * 0.3) {
            this.targetOffset.x += (screenX - this.canvas.width * 0.5) * 0.1;
        }
    }

    reset() {
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.offset = { x: 0, y: 0 };
        this.targetOffset = { x: 0, y: 0 };
    }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.showStats = false;
    }

    update() {
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    draw(ctx, particleCount) {
        if (!this.showStats) return;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 150, 60);

        ctx.font = '12px monospace';
        ctx.fillStyle = '#00ff00';
        ctx.fillText(`FPS: ${this.fps}`, 20, 30);
        ctx.fillText(`Particles: ${particleCount}`, 20, 50);
        ctx.restore();
    }

    toggle() {
        this.showStats = !this.showStats;
    }
}
