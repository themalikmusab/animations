/**
 * Advanced Particle System for Visual Effects
 * Handles smoke trails, explosions, impact effects, and environmental particles
 */

/**
 * Individual Particle class
 */
class Particle {
    constructor(x, y, config = {}) {
        this.x = x;
        this.y = y;
        this.vx = config.vx || (Math.random() - 0.5) * 2;
        this.vy = config.vy || (Math.random() - 0.5) * 2;
        this.life = config.life || 1.0;
        this.maxLife = config.life || 1.0;
        this.size = config.size || 3;
        this.color = config.color || '#ffffff';
        this.alpha = config.alpha || 1.0;
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 0.98;
        this.fadeRate = config.fadeRate || 0.02;
        this.shrinkRate = config.shrinkRate || 0.05;
        this.type = config.type || 'circle';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update(dt = 1) {
        // Apply velocity
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Apply gravity
        this.vy += this.gravity * dt;

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Update life
        this.life -= this.fadeRate * dt;
        this.alpha = Math.max(0, this.life / this.maxLife);

        // Shrink over time
        this.size = Math.max(0.1, this.size - this.shrinkRate * dt);

        // Rotate
        this.rotation += this.rotationSpeed * dt;

        return this.life > 0;
    }

    draw(ctx) {
        if (this.life <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.alpha;

        if (this.type === 'circle') {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'square') {
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else if (this.type === 'spark') {
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.size / 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.vx * 2, this.y - this.vy * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

/**
 * Particle Emitter - Manages groups of particles
 */
class ParticleEmitter {
    constructor() {
        this.particles = [];
        this.maxParticles = 1000;
    }

    emit(x, y, count, config) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                this.particles.shift(); // Remove oldest particle
            }

            const particleConfig = {
                vx: config.vx || (Math.random() - 0.5) * (config.speed || 2),
                vy: config.vy || (Math.random() - 0.5) * (config.speed || 2),
                life: config.life || 1.0,
                size: config.size || 3,
                color: config.color || '#ffffff',
                alpha: config.alpha || 1.0,
                gravity: config.gravity || 0,
                friction: config.friction || 0.98,
                fadeRate: config.fadeRate || 0.02,
                shrinkRate: config.shrinkRate || 0.05,
                type: config.type || 'circle'
            };

            this.particles.push(new Particle(x, y, particleConfig));
        }
    }

    update(dt = 1) {
        this.particles = this.particles.filter(particle => particle.update(dt));
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    clear() {
        this.particles = [];
    }

    getCount() {
        return this.particles.length;
    }
}

/**
 * Smoke Trail Effect
 */
class SmokeTrail {
    constructor(emitter) {
        this.emitter = emitter;
        this.lastEmitTime = 0;
        this.emitInterval = 30; // ms
    }

    emit(x, y, vx, vy) {
        const now = Date.now();
        if (now - this.lastEmitTime < this.emitInterval) return;

        this.lastEmitTime = now;

        // Emit smoke particles
        this.emitter.emit(x, y, 2, {
            vx: vx * 0.1 + (Math.random() - 0.5) * 0.5,
            vy: vy * 0.1 + (Math.random() - 0.5) * 0.5,
            life: 60,
            size: Math.random() * 4 + 2,
            color: `rgba(200, 200, 200, ${Math.random() * 0.3 + 0.1})`,
            gravity: -0.02,
            friction: 0.95,
            fadeRate: 0.8,
            shrinkRate: 0.03,
            type: 'circle'
        });
    }
}

/**
 * Explosion Effect
 */
class ExplosionEffect {
    constructor(emitter) {
        this.emitter = emitter;
    }

    explode(x, y, intensity = 1.0) {
        const particleCount = Math.floor(20 * intensity);
        const speed = 5 * intensity;

        // Core flash
        this.emitter.emit(x, y, 1, {
            vx: 0,
            vy: 0,
            life: 20,
            size: 30 * intensity,
            color: 'rgba(255, 255, 200, 0.8)',
            gravity: 0,
            friction: 1,
            fadeRate: 2,
            shrinkRate: 2,
            type: 'circle'
        });

        // Sparks
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.2;
            const particleSpeed = speed * (0.5 + Math.random() * 0.5);

            this.emitter.emit(x, y, 1, {
                vx: Math.cos(angle) * particleSpeed,
                vy: Math.sin(angle) * particleSpeed,
                life: 30 + Math.random() * 20,
                size: Math.random() * 3 + 2,
                color: this.getExplosionColor(),
                gravity: 0.15,
                friction: 0.96,
                fadeRate: 1.2,
                shrinkRate: 0.08,
                type: 'spark'
            });
        }

        // Debris
        this.emitter.emit(x, y, particleCount / 2, {
            speed: speed * 0.8,
            life: 40,
            size: Math.random() * 2 + 1,
            color: 'rgba(100, 100, 100, 0.8)',
            gravity: 0.2,
            friction: 0.94,
            fadeRate: 0.8,
            shrinkRate: 0.05,
            type: 'square'
        });
    }

    getExplosionColor() {
        const colors = [
            'rgba(255, 200, 100, 1.0)',
            'rgba(255, 150, 50, 1.0)',
            'rgba(255, 100, 50, 1.0)',
            'rgba(255, 255, 150, 1.0)',
            'rgba(200, 100, 50, 1.0)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * Launch Effect
 */
class LaunchEffect {
    constructor(emitter) {
        this.emitter = emitter;
    }

    launch(x, y, angle, power = 1.0) {
        const particleCount = Math.floor(30 * power);

        // Launch burst
        for (let i = 0; i < particleCount; i++) {
            const spreadAngle = angle + (Math.random() - 0.5) * Math.PI / 4;
            const speed = (2 + Math.random() * 3) * power;

            this.emitter.emit(x, y, 1, {
                vx: -Math.cos(spreadAngle) * speed,
                vy: -Math.sin(spreadAngle) * speed,
                life: 40 + Math.random() * 20,
                size: Math.random() * 4 + 2,
                color: this.getLaunchColor(),
                gravity: 0.1,
                friction: 0.95,
                fadeRate: 1.0,
                shrinkRate: 0.08,
                type: 'circle'
            });
        }

        // Ground dust
        this.emitter.emit(x, y, 10, {
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 2,
            life: 30,
            size: Math.random() * 5 + 3,
            color: 'rgba(139, 90, 43, 0.6)',
            gravity: 0.15,
            friction: 0.92,
            fadeRate: 0.6,
            shrinkRate: 0.05,
            type: 'circle'
        });
    }

    getLaunchColor() {
        const colors = [
            'rgba(255, 150, 0, 0.8)',
            'rgba(255, 200, 100, 0.8)',
            'rgba(200, 200, 255, 0.6)',
            'rgba(255, 255, 255, 0.7)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * Impact Effect
 */
class ImpactEffect {
    constructor(emitter) {
        this.emitter = emitter;
    }

    impact(x, y, velocity, angle) {
        const intensity = Math.min(velocity / 20, 1.5);
        const particleCount = Math.floor(15 * intensity);

        // Impact crater effect
        this.emitter.emit(x, y, 1, {
            vx: 0,
            vy: 0,
            life: 15,
            size: 20 * intensity,
            color: 'rgba(139, 90, 43, 0.5)',
            gravity: 0,
            friction: 1,
            fadeRate: 1.5,
            shrinkRate: 0.5,
            type: 'circle'
        });

        // Debris spray
        for (let i = 0; i < particleCount; i++) {
            const spreadAngle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
            const speed = (1 + Math.random() * 4) * intensity;

            this.emitter.emit(x, y, 1, {
                vx: Math.cos(spreadAngle) * speed,
                vy: Math.sin(spreadAngle) * speed,
                life: 30 + Math.random() * 20,
                size: Math.random() * 3 + 1,
                color: this.getImpactColor(),
                gravity: 0.2,
                friction: 0.93,
                fadeRate: 0.8,
                shrinkRate: 0.06,
                type: Math.random() > 0.5 ? 'square' : 'circle'
            });
        }

        // Dust cloud
        this.emitter.emit(x, y, 8, {
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 2,
            life: 50,
            size: Math.random() * 6 + 4,
            color: 'rgba(160, 130, 90, 0.4)',
            gravity: -0.05,
            friction: 0.94,
            fadeRate: 0.5,
            shrinkRate: 0.03,
            type: 'circle'
        });
    }

    getImpactColor() {
        const colors = [
            'rgba(139, 90, 43, 0.9)',
            'rgba(160, 110, 60, 0.8)',
            'rgba(120, 80, 40, 0.9)',
            'rgba(180, 140, 90, 0.7)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * Target Hit Effect
 */
class TargetHitEffect {
    constructor(emitter) {
        this.emitter = emitter;
    }

    hit(x, y, targetSize, score) {
        const intensity = Math.min(score / 100, 2.0);

        // Success burst
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const speed = 3 + Math.random() * 2;

            this.emitter.emit(x, y, 1, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 40 + Math.random() * 20,
                size: Math.random() * 4 + 2,
                color: this.getSuccessColor(),
                gravity: 0.05,
                friction: 0.96,
                fadeRate: 0.9,
                shrinkRate: 0.08,
                type: 'spark'
            });
        }

        // Confetti
        this.emitter.emit(x, y, 20, {
            speed: 4,
            life: 60,
            size: Math.random() * 4 + 2,
            color: this.getConfettiColor(),
            gravity: 0.15,
            friction: 0.95,
            fadeRate: 0.6,
            shrinkRate: 0.03,
            type: 'square'
        });

        // Ring wave
        this.emitter.emit(x, y, 1, {
            vx: 0,
            vy: 0,
            life: 30,
            size: targetSize * 2,
            color: 'rgba(255, 215, 0, 0.6)',
            gravity: 0,
            friction: 1,
            fadeRate: 1.5,
            shrinkRate: -1, // Expand
            type: 'circle'
        });
    }

    getSuccessColor() {
        const colors = [
            'rgba(255, 215, 0, 1.0)',
            'rgba(255, 255, 100, 1.0)',
            'rgba(255, 200, 0, 1.0)',
            'rgba(255, 165, 0, 1.0)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getConfettiColor() {
        const colors = [
            'rgba(255, 0, 0, 0.9)',
            'rgba(0, 255, 0, 0.9)',
            'rgba(0, 0, 255, 0.9)',
            'rgba(255, 255, 0, 0.9)',
            'rgba(255, 0, 255, 0.9)',
            'rgba(0, 255, 255, 0.9)'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * Environmental Particles (clouds, birds, etc.)
 */
class EnvironmentalParticles {
    constructor(emitter, canvasWidth, canvasHeight) {
        this.emitter = emitter;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.clouds = [];
        this.initClouds();
    }

    initClouds() {
        // Create a few clouds
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.canvasWidth,
                y: Math.random() * this.canvasHeight * 0.3,
                vx: (Math.random() * 0.2 + 0.1),
                size: Math.random() * 40 + 30,
                alpha: Math.random() * 0.3 + 0.1
            });
        }
    }

    update() {
        // Update clouds
        this.clouds.forEach(cloud => {
            cloud.x += cloud.vx;
            if (cloud.x > this.canvasWidth + cloud.size) {
                cloud.x = -cloud.size;
                cloud.y = Math.random() * this.canvasHeight * 0.3;
            }
        });
    }

    draw(ctx) {
        // Draw clouds
        this.clouds.forEach(cloud => {
            ctx.save();
            ctx.globalAlpha = cloud.alpha;
            ctx.fillStyle = '#ffffff';

            // Draw cloud as multiple overlapping circles
            for (let i = 0; i < 5; i++) {
                const offsetX = (i - 2) * cloud.size * 0.15;
                const offsetY = Math.sin(i) * cloud.size * 0.1;
                ctx.beginPath();
                ctx.arc(cloud.x + offsetX, cloud.y + offsetY, cloud.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    resize(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}

/**
 * Main Particle System Manager
 */
class ParticleSystem {
    constructor(canvasWidth, canvasHeight) {
        this.emitter = new ParticleEmitter();
        this.smokeTrail = new SmokeTrail(this.emitter);
        this.explosion = new ExplosionEffect(this.emitter);
        this.launch = new LaunchEffect(this.emitter);
        this.impact = new ImpactEffect(this.emitter);
        this.targetHit = new TargetHitEffect(this.emitter);
        this.environmental = new EnvironmentalParticles(this.emitter, canvasWidth, canvasHeight);
    }

    update(dt = 1) {
        this.emitter.update(dt);
        this.environmental.update();
    }

    draw(ctx) {
        this.environmental.draw(ctx);
        this.emitter.draw(ctx);
    }

    clear() {
        this.emitter.clear();
    }

    getParticleCount() {
        return this.emitter.getCount();
    }

    resize(width, height) {
        this.environmental.resize(width, height);
    }
}
