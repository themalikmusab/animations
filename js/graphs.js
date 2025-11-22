/**
 * Real-Time Graphing System
 * Displays position-time and velocity-time graphs
 */

class Graph {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            title: config.title || 'Graph',
            xLabel: config.xLabel || 'Time (s)',
            yLabel: config.yLabel || 'Value',
            xMin: config.xMin || 0,
            xMax: config.xMax || 10,
            yMin: config.yMin || -10,
            yMax: config.yMax || 10,
            gridColor: config.gridColor || 'rgba(200, 200, 200, 0.5)',
            axisColor: config.axisColor || '#333',
            lineColor: config.lineColor || '#ff4444',
            backgroundColor: config.backgroundColor || '#ffffff'
        };

        this.data = [];
        this.maxDataPoints = 1000;

        // Margins for axes and labels
        this.margin = {
            top: 40,
            right: 30,
            bottom: 50,
            left: 60
        };

        this.resizeCanvas();
    }

    resizeCanvas() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;

        this.plotWidth = this.canvas.width - this.margin.left - this.margin.right;
        this.plotHeight = this.canvas.height - this.margin.top - this.margin.bottom;
    }

    addDataPoint(x, y) {
        this.data.push({ x, y });
        if (this.data.length > this.maxDataPoints) {
            this.data.shift();
        }

        // Auto-scale if needed
        if (x > this.config.xMax) {
            this.config.xMax = Math.ceil(x / 5) * 5;
        }
    }

    clear() {
        this.data = [];
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw axes
        this.drawAxes();

        // Draw data
        this.drawData();

        // Draw labels
        this.drawLabels();
    }

    drawGrid() {
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 1;

        // Vertical grid lines
        const xStep = this.getGridStep(this.config.xMin, this.config.xMax);
        for (let x = this.config.xMin; x <= this.config.xMax; x += xStep) {
            const screenX = this.xToScreen(x);
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, this.margin.top);
            this.ctx.lineTo(screenX, this.canvas.height - this.margin.bottom);
            this.ctx.stroke();
        }

        // Horizontal grid lines
        const yStep = this.getGridStep(this.config.yMin, this.config.yMax);
        for (let y = this.config.yMin; y <= this.config.yMax; y += yStep) {
            const screenY = this.yToScreen(y);
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, screenY);
            this.ctx.lineTo(this.canvas.width - this.margin.right, screenY);
            this.ctx.stroke();
        }
    }

    drawAxes() {
        this.ctx.strokeStyle = this.config.axisColor;
        this.ctx.lineWidth = 2;

        // X-axis
        const y0 = this.yToScreen(0);
        if (y0 >= this.margin.top && y0 <= this.canvas.height - this.margin.bottom) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.margin.left, y0);
            this.ctx.lineTo(this.canvas.width - this.margin.right, y0);
            this.ctx.stroke();
        }

        // Y-axis
        const x0 = this.xToScreen(0);
        if (x0 >= this.margin.left && x0 <= this.canvas.width - this.margin.right) {
            this.ctx.beginPath();
            this.ctx.moveTo(x0, this.margin.top);
            this.ctx.lineTo(x0, this.canvas.height - this.margin.bottom);
            this.ctx.stroke();
        }

        // Tick marks and labels
        this.drawTickMarks();
    }

    drawTickMarks() {
        this.ctx.fillStyle = this.config.axisColor;
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';

        // X-axis ticks
        const xStep = this.getGridStep(this.config.xMin, this.config.xMax);
        for (let x = this.config.xMin; x <= this.config.xMax; x += xStep) {
            const screenX = this.xToScreen(x);
            const screenY = this.canvas.height - this.margin.bottom;

            // Tick mark
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, screenY);
            this.ctx.lineTo(screenX, screenY + 5);
            this.ctx.stroke();

            // Label
            this.ctx.fillText(x.toFixed(1), screenX, screenY + 8);
        }

        // Y-axis ticks
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        const yStep = this.getGridStep(this.config.yMin, this.config.yMax);
        for (let y = this.config.yMin; y <= this.config.yMax; y += yStep) {
            const screenY = this.yToScreen(y);
            const screenX = this.margin.left;

            // Tick mark
            this.ctx.beginPath();
            this.ctx.moveTo(screenX - 5, screenY);
            this.ctx.lineTo(screenX, screenY);
            this.ctx.stroke();

            // Label
            this.ctx.fillText(y.toFixed(1), screenX - 8, screenY);
        }
    }

    drawData() {
        if (this.data.length < 2) return;

        this.ctx.strokeStyle = this.config.lineColor;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();

        const firstPoint = this.data[0];
        this.ctx.moveTo(this.xToScreen(firstPoint.x), this.yToScreen(firstPoint.y));

        for (let i = 1; i < this.data.length; i++) {
            const point = this.data[i];
            this.ctx.lineTo(this.xToScreen(point.x), this.yToScreen(point.y));
        }

        this.ctx.stroke();

        // Draw current point
        if (this.data.length > 0) {
            const lastPoint = this.data[this.data.length - 1];
            this.ctx.fillStyle = this.config.lineColor;
            this.ctx.beginPath();
            this.ctx.arc(
                this.xToScreen(lastPoint.x),
                this.yToScreen(lastPoint.y),
                4, 0, 2 * Math.PI
            );
            this.ctx.fill();
        }
    }

    drawLabels() {
        this.ctx.fillStyle = this.config.axisColor;
        this.ctx.font = 'bold 16px Arial';

        // Title
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(this.config.title, this.canvas.width / 2, 10);

        // X-axis label
        this.ctx.font = '14px Arial';
        this.ctx.fillText(
            this.config.xLabel,
            this.canvas.width / 2,
            this.canvas.height - 20
        );

        // Y-axis label (rotated)
        this.ctx.save();
        this.ctx.translate(15, this.canvas.height / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.config.yLabel, 0, 0);
        this.ctx.restore();
    }

    xToScreen(x) {
        return this.margin.left +
            ((x - this.config.xMin) / (this.config.xMax - this.config.xMin)) * this.plotWidth;
    }

    yToScreen(y) {
        return this.canvas.height - this.margin.bottom -
            ((y - this.config.yMin) / (this.config.yMax - this.config.yMin)) * this.plotHeight;
    }

    getGridStep(min, max) {
        const range = max - min;
        const roughStep = range / 5;
        const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
        const normalized = roughStep / magnitude;

        if (normalized < 1.5) return magnitude;
        if (normalized < 3) return 2 * magnitude;
        if (normalized < 7) return 5 * magnitude;
        return 10 * magnitude;
    }

    setYRange(min, max) {
        this.config.yMin = min;
        this.config.yMax = max;
    }

    setXRange(min, max) {
        this.config.xMin = min;
        this.config.xMax = max;
    }
}

/**
 * Multi-line graph for comparing different quantities
 */
class MultiGraph extends Graph {
    constructor(canvas, config) {
        super(canvas, config);
        this.dataSets = {};
        this.colors = [
            '#ff4444', '#44ff44', '#4444ff', '#ffaa00', '#ff00ff', '#00ffff'
        ];
        this.colorIndex = 0;
    }

    addDataSet(name, color) {
        this.dataSets[name] = {
            data: [],
            color: color || this.colors[this.colorIndex % this.colors.length]
        };
        this.colorIndex++;
    }

    addDataPoint(name, x, y) {
        if (!this.dataSets[name]) {
            this.addDataSet(name);
        }

        this.dataSets[name].data.push({ x, y });

        if (this.dataSets[name].data.length > this.maxDataPoints) {
            this.dataSets[name].data.shift();
        }

        // Auto-scale
        if (x > this.config.xMax) {
            this.config.xMax = Math.ceil(x / 5) * 5;
        }
    }

    clear() {
        for (let name in this.dataSets) {
            this.dataSets[name].data = [];
        }
    }

    clearDataSet(name) {
        if (this.dataSets[name]) {
            this.dataSets[name].data = [];
        }
    }

    drawData() {
        for (let name in this.dataSets) {
            const dataSet = this.dataSets[name];
            if (dataSet.data.length < 2) continue;

            this.ctx.strokeStyle = dataSet.color;
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();

            const firstPoint = dataSet.data[0];
            this.ctx.moveTo(this.xToScreen(firstPoint.x), this.yToScreen(firstPoint.y));

            for (let i = 1; i < dataSet.data.length; i++) {
                const point = dataSet.data[i];
                this.ctx.lineTo(this.xToScreen(point.x), this.yToScreen(point.y));
            }

            this.ctx.stroke();

            // Draw current point
            if (dataSet.data.length > 0) {
                const lastPoint = dataSet.data[dataSet.data.length - 1];
                this.ctx.fillStyle = dataSet.color;
                this.ctx.beginPath();
                this.ctx.arc(
                    this.xToScreen(lastPoint.x),
                    this.yToScreen(lastPoint.y),
                    4, 0, 2 * Math.PI
                );
                this.ctx.fill();
            }
        }

        // Draw legend
        this.drawLegend();
    }

    drawLegend() {
        const legendX = this.canvas.width - this.margin.right - 100;
        const legendY = this.margin.top + 10;
        let yOffset = 0;

        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';

        for (let name in this.dataSets) {
            const dataSet = this.dataSets[name];

            // Color box
            this.ctx.fillStyle = dataSet.color;
            this.ctx.fillRect(legendX, legendY + yOffset, 15, 15);

            // Label
            this.ctx.fillStyle = '#333';
            this.ctx.fillText(name, legendX + 20, legendY + yOffset + 7);

            yOffset += 20;
        }
    }
}
