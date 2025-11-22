/**
 * Physics Engine for Projectile Motion
 * Implements real physics equations with optional air resistance
 */

class PhysicsEngine {
    constructor() {
        // Physical constants
        this.AIR_DENSITY = 1.225; // kg/m³ at sea level
        this.DRAG_COEFFICIENT = 0.47; // Sphere drag coefficient

        // Time step for simulation (smaller = more accurate)
        this.dt = 0.016; // ~60 FPS
    }

    /**
     * Calculate projectile motion without air resistance (analytical solution)
     * @param {number} v0 - Initial velocity (m/s)
     * @param {number} angle - Launch angle (degrees)
     * @param {number} g - Gravitational acceleration (m/s²)
     * @param {number} t - Time (s)
     * @returns {Object} Position and velocity {x, y, vx, vy}
     */
    calculateNoAirResistance(v0, angle, g, t) {
        const rad = angle * Math.PI / 180;
        const v0x = v0 * Math.cos(rad);
        const v0y = v0 * Math.sin(rad);

        // Position equations
        const x = v0x * t;
        const y = v0y * t - 0.5 * g * t * t;

        // Velocity equations
        const vx = v0x;
        const vy = v0y - g * t;

        return { x, y, vx, vy };
    }

    /**
     * Calculate drag force
     * @param {number} vx - Velocity x component (m/s)
     * @param {number} vy - Velocity y component (m/s)
     * @param {number} diameter - Projectile diameter (m)
     * @returns {Object} Drag force {fx, fy}
     */
    calculateDragForce(vx, vy, diameter) {
        const v = Math.sqrt(vx * vx + vy * vy);
        const area = Math.PI * (diameter / 2) ** 2;

        // Drag force: F = 0.5 * ρ * v² * Cd * A
        const dragMagnitude = 0.5 * this.AIR_DENSITY * v * v * this.DRAG_COEFFICIENT * area;

        // Direction opposite to velocity
        const fx = v > 0 ? -dragMagnitude * (vx / v) : 0;
        const fy = v > 0 ? -dragMagnitude * (vy / v) : 0;

        return { fx, fy };
    }

    /**
     * Calculate wind force
     * @param {number} windSpeed - Wind speed (m/s, positive = tailwind)
     * @param {number} diameter - Projectile diameter (m)
     * @returns {Object} Wind force {fx, fy}
     */
    calculateWindForce(windSpeed, diameter) {
        const area = Math.PI * (diameter / 2) ** 2;
        // Wind force acts horizontally
        const windForce = 0.5 * this.AIR_DENSITY * windSpeed * Math.abs(windSpeed) *
                         this.DRAG_COEFFICIENT * area;
        return { fx: windForce, fy: 0 };
    }

    /**
     * Numerical integration step using Euler method
     * @param {Object} state - Current state {x, y, vx, vy}
     * @param {number} mass - Mass (kg)
     * @param {number} diameter - Diameter (m)
     * @param {number} g - Gravity (m/s²)
     * @param {boolean} airResistance - Include air resistance
     * @param {number} windSpeed - Wind speed (m/s, optional)
     * @returns {Object} New state {x, y, vx, vy}
     */
    integrateStep(state, mass, diameter, g, airResistance, windSpeed = 0) {
        let ax = 0;
        let ay = -g;

        if (airResistance) {
            const drag = this.calculateDragForce(state.vx, state.vy, diameter);
            ax += drag.fx / mass;
            ay += drag.fy / mass;
        }

        // Add wind force
        if (windSpeed !== 0) {
            const wind = this.calculateWindForce(windSpeed, diameter);
            ax += wind.fx / mass;
        }

        // Euler integration
        const newState = {
            x: state.x + state.vx * this.dt,
            y: state.y + state.vy * this.dt,
            vx: state.vx + ax * this.dt,
            vy: state.vy + ay * this.dt
        };

        return newState;
    }

    /**
     * Calculate theoretical maximum range (no air resistance)
     * @param {number} v0 - Initial velocity (m/s)
     * @param {number} angle - Launch angle (degrees)
     * @param {number} g - Gravity (m/s²)
     * @returns {number} Maximum range (m)
     */
    calculateMaxRange(v0, angle, g) {
        const rad = angle * Math.PI / 180;
        return (v0 * v0 * Math.sin(2 * rad)) / g;
    }

    /**
     * Calculate theoretical maximum height (no air resistance)
     * @param {number} v0 - Initial velocity (m/s)
     * @param {number} angle - Launch angle (degrees)
     * @param {number} g - Gravity (m/s²)
     * @returns {number} Maximum height (m)
     */
    calculateMaxHeight(v0, angle, g) {
        const rad = angle * Math.PI / 180;
        const v0y = v0 * Math.sin(rad);
        return (v0y * v0y) / (2 * g);
    }

    /**
     * Calculate flight time (no air resistance)
     * @param {number} v0 - Initial velocity (m/s)
     * @param {number} angle - Launch angle (degrees)
     * @param {number} g - Gravity (m/s²)
     * @returns {number} Flight time (s)
     */
    calculateFlightTime(v0, angle, g) {
        const rad = angle * Math.PI / 180;
        const v0y = v0 * Math.sin(rad);
        return (2 * v0y) / g;
    }
}

/**
 * Projectile class representing a single projectile
 */
class Projectile {
    constructor(params) {
        this.v0 = params.velocity;
        this.angle = params.angle;
        this.mass = params.mass;
        this.diameter = params.diameter;
        this.gravity = params.gravity;
        this.airResistance = params.airResistance;
        this.windSpeed = params.windSpeed || 0;
        this.color = params.color || '#ff4444';

        // Initial state
        this.reset();

        // Physics engine
        this.physics = new PhysicsEngine();

        // Trajectory history
        this.trajectory = [];
        this.maxTrajectoryPoints = 500;
    }

    reset() {
        const rad = this.angle * Math.PI / 180;
        this.state = {
            x: 0,
            y: 0,
            vx: this.v0 * Math.cos(rad),
            vy: this.v0 * Math.sin(rad)
        };
        this.time = 0;
        this.isFlying = false;
        this.hasLanded = false;
        this.trajectory = [];
        this.maxHeight = 0;
        this.range = 0;
    }

    launch() {
        this.reset();
        this.isFlying = true;
    }

    update() {
        if (!this.isFlying || this.hasLanded) return;

        // Store trajectory point
        if (this.trajectory.length < this.maxTrajectoryPoints) {
            this.trajectory.push({ x: this.state.x, y: this.state.y });
        }

        // Update physics
        if (this.airResistance || this.windSpeed !== 0) {
            this.state = this.physics.integrateStep(
                this.state,
                this.mass,
                this.diameter,
                this.gravity,
                this.airResistance,
                this.windSpeed
            );
        } else {
            this.state = this.physics.calculateNoAirResistance(
                this.v0,
                this.angle,
                this.gravity,
                this.time
            );
        }

        // Update time
        this.time += this.physics.dt;

        // Track max height
        if (this.state.y > this.maxHeight) {
            this.maxHeight = this.state.y;
        }

        // Check if landed
        if (this.state.y <= 0 && this.time > 0.01) {
            this.state.y = 0;
            this.hasLanded = true;
            this.isFlying = false;
            this.range = this.state.x;
        }
    }

    getVelocity() {
        return Math.sqrt(this.state.vx ** 2 + this.state.vy ** 2);
    }

    getVelocityAngle() {
        return Math.atan2(this.state.vy, this.state.vx);
    }
}
