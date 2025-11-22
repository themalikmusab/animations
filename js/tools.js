/**
 * Measurement and Utility Tools
 * Includes tape measure, data export, and other helpers
 */

class TapeMeasure {
    constructor(renderer) {
        this.renderer = renderer;
        this.isActive = false;
        this.startPoint = null;
        this.endPoint = null;
        this.isDragging = false;
    }

    start(worldX, worldY) {
        this.isActive = true;
        this.startPoint = { x: worldX, y: worldY };
        this.endPoint = { x: worldX, y: worldY };
    }

    update(worldX, worldY) {
        if (this.isActive) {
            this.endPoint = { x: worldX, y: worldY };
        }
    }

    finish() {
        this.isDragging = false;
    }

    clear() {
        this.isActive = false;
        this.startPoint = null;
        this.endPoint = null;
    }

    draw() {
        if (!this.isActive || !this.startPoint || !this.endPoint) return;

        const ctx = this.renderer.ctx;
        const start = this.renderer.worldToScreen(this.startPoint.x, this.startPoint.y);
        const end = this.renderer.worldToScreen(this.endPoint.x, this.endPoint.y);

        // Draw line
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw endpoints
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(start.x, start.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(end.x, end.y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Calculate distance
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Draw measurement label
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        ctx.fillStyle = 'rgba(255, 170, 0, 0.9)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        const label = `${distance.toFixed(2)} m`;
        const padding = 8;
        const metrics = ctx.measureText(label);
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = 24;

        // Background box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            midX - boxWidth / 2,
            midY - boxHeight - 5,
            boxWidth,
            boxHeight
        );

        // Text
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(label, midX, midY - 5);

        // Horizontal and vertical components
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 170, 0, 0.8)';

            // Horizontal component
            const hLabel = `Δx: ${dx.toFixed(2)} m`;
            ctx.fillText(hLabel, midX, midY + 15);

            // Vertical component
            const vLabel = `Δy: ${dy.toFixed(2)} m`;
            ctx.fillText(vLabel, midX, midY + 30);
        }
    }

    getDistance() {
        if (!this.startPoint || !this.endPoint) return 0;
        const dx = this.endPoint.x - this.startPoint.x;
        const dy = this.endPoint.y - this.startPoint.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class DataExporter {
    constructor() {
        this.data = [];
    }

    addRow(rowData) {
        this.data.push(rowData);
    }

    clear() {
        this.data = [];
    }

    exportToCSV(filename = 'projectile_data.csv') {
        if (this.data.length === 0) {
            alert('No data to export!');
            return;
        }

        // Create CSV content
        let csvContent = '';

        // Headers
        const headers = Object.keys(this.data[0]);
        csvContent += headers.join(',') + '\n';

        // Data rows
        this.data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                return typeof value === 'number' ? value.toFixed(4) : value;
            });
            csvContent += values.join(',') + '\n';
        });

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    exportJSON(filename = 'projectile_data.json') {
        if (this.data.length === 0) {
            alert('No data to export!');
            return;
        }

        const jsonContent = JSON.stringify(this.data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

class TrajectoryPredictor {
    constructor(renderer) {
        this.renderer = renderer;
        this.physics = new PhysicsEngine();
    }

    /**
     * Draw predicted trajectory path
     */
    drawPrediction(params, showPrediction) {
        if (!showPrediction) return;

        const ctx = this.renderer.ctx;
        const points = this.calculateTrajectory(params);

        if (points.length < 2) return;

        // Draw predicted path
        ctx.strokeStyle = 'rgba(100, 100, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();

        const firstPoint = this.renderer.worldToScreen(points[0].x, points[0].y);
        ctx.moveTo(firstPoint.x, firstPoint.y);

        for (let i = 1; i < points.length; i++) {
            const point = this.renderer.worldToScreen(points[i].x, points[i].y);
            ctx.lineTo(point.x, point.y);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Draw landing point
        if (points.length > 0) {
            const landingPoint = points[points.length - 1];
            const screenPos = this.renderer.worldToScreen(landingPoint.x, 0);

            ctx.fillStyle = 'rgba(100, 100, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 10, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = 'rgba(100, 100, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = 'rgba(100, 100, 255, 0.9)';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(
                `Predicted: ${landingPoint.x.toFixed(1)} m`,
                screenPos.x,
                screenPos.y + 25
            );
        }
    }

    calculateTrajectory(params) {
        const points = [];
        const dt = 0.05;
        const maxTime = 30;

        let state = {
            x: 0,
            y: 0,
            vx: params.velocity * Math.cos(params.angle * Math.PI / 180),
            vy: params.velocity * Math.sin(params.angle * Math.PI / 180)
        };

        for (let t = 0; t < maxTime; t += dt) {
            points.push({ x: state.x, y: state.y });

            if (state.y < 0 && t > 0.01) break;

            if (params.airResistance || (params.windEnabled && params.windSpeed !== 0)) {
                state = this.physics.integrateStep(
                    state,
                    params.mass,
                    params.diameter,
                    params.gravity,
                    params.airResistance,
                    params.windEnabled ? params.windSpeed : 0
                );
            } else {
                state = this.physics.calculateNoAirResistance(
                    params.velocity,
                    params.angle,
                    params.gravity,
                    t
                );
            }
        }

        return points;
    }
}

class TargetSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.targets = [];
        this.score = 0;
    }

    addTarget(x, y, radius = 1) {
        this.targets.push({
            x: x,
            y: y,
            radius: radius,
            hit: false,
            points: Math.floor(100 / radius)
        });
    }

    createRandomTargets(count = 3) {
        this.targets = [];
        for (let i = 0; i < count; i++) {
            const x = 20 + Math.random() * 60;
            const y = 5 + Math.random() * 20;
            const radius = 0.5 + Math.random() * 1.5;
            this.addTarget(x, y, radius);
        }
    }

    checkHit(projectileX, projectileY, projectileRadius) {
        for (let target of this.targets) {
            if (target.hit) continue;

            const dx = projectileX - target.x;
            const dy = projectileY - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < target.radius + projectileRadius) {
                target.hit = true;
                this.score += target.points;
                return true;
            }
        }
        return false;
    }

    draw() {
        const ctx = this.renderer.ctx;

        for (let target of this.targets) {
            const pos = this.renderer.worldToScreen(target.x, target.y);
            const screenRadius = target.radius * this.renderer.scale;

            // Target circles
            ctx.fillStyle = target.hit ? 'rgba(100, 255, 100, 0.5)' : 'rgba(255, 100, 100, 0.6)';
            ctx.strokeStyle = target.hit ? '#00aa00' : '#aa0000';
            ctx.lineWidth = 3;

            // Outer circle
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, screenRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Inner circle
            ctx.fillStyle = target.hit ? 'rgba(100, 255, 100, 0.8)' : 'rgba(255, 150, 150, 0.8)';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, screenRadius * 0.5, 0, 2 * Math.PI);
            ctx.fill();

            // Center dot
            ctx.fillStyle = target.hit ? '#00ff00' : '#ff0000';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, 2 * Math.PI);
            ctx.fill();

            // Points label
            if (!target.hit) {
                ctx.fillStyle = '#333';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(target.points + 'pts', pos.x, pos.y - screenRadius - 15);
            }
        }
    }

    reset() {
        this.targets.forEach(target => target.hit = false);
        this.score = 0;
    }

    clear() {
        this.targets = [];
        this.score = 0;
    }
}

/**
 * Stopwatch utility
 */
class Stopwatch {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
    }

    start() {
        this.startTime = performance.now();
        this.isRunning = true;
    }

    stop() {
        if (this.isRunning) {
            this.elapsedTime = performance.now() - this.startTime;
            this.isRunning = false;
        }
    }

    reset() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
    }

    getTime() {
        if (this.isRunning) {
            return (performance.now() - this.startTime) / 1000;
        }
        return this.elapsedTime / 1000;
    }
}
