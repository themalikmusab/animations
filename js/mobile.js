/**
 * Mobile Touch Support System
 * Handles touch events, gestures, and mobile-specific interactions
 */

class MobileSupport {
    constructor(app) {
        this.app = app;
        this.isMobile = this.detectMobile();
        this.touchStartPos = null;
        this.tapeMeasureTouch = false;

        if (this.isMobile) {
            this.enableMobileOptimizations();
            this.setupTouchEvents();
        }
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    enableMobileOptimizations() {
        // Add mobile-specific CSS class
        document.body.classList.add('mobile-device');

        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.canvas-container')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Add mobile info message
        const canvasInfo = document.getElementById('canvas-info');
        if (canvasInfo) {
            const paragraph = canvasInfo.querySelector('p');
            if (paragraph) {
                paragraph.innerHTML = 'Tap "Fire" to launch | Drag on canvas to measure';
            }
        }
    }

    setupTouchEvents() {
        // Canvas touch events for tape measure
        const canvas = this.app.canvas;
        const targetCanvas = this.app.targetCanvas;

        // Simulation canvas
        canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e, canvas), { passive: false });
        canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e, canvas), { passive: false });
        canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e, canvas), { passive: false });

        // Target canvas
        targetCanvas.addEventListener('touchstart', (e) => this.handleTouchStart(e, targetCanvas), { passive: false });
        targetCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e, targetCanvas), { passive: false });
        targetCanvas.addEventListener('touchend', (e) => this.handleTouchEnd(e, targetCanvas), { passive: false });

        // Button touch feedback
        this.setupButtonFeedback();
    }

    handleTouchStart(e, canvas) {
        e.preventDefault();

        if (!this.app.tapeMeasureActive) return;

        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const screenX = touch.clientX - rect.left;
        const screenY = touch.clientY - rect.top;

        const renderer = canvas === this.app.canvas ? this.app.renderer : this.app.targetRenderer;
        const worldX = (screenX - renderer.originX) / renderer.scale;
        const worldY = (renderer.originY - screenY) / renderer.scale;

        this.app.tapeMeasure.start(worldX, worldY);
        this.app.tapeMeasure.isDragging = true;
        this.tapeMeasureTouch = true;
    }

    handleTouchMove(e, canvas) {
        e.preventDefault();

        if (!this.app.tapeMeasureActive || !this.tapeMeasureTouch) return;

        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const screenX = touch.clientX - rect.left;
        const screenY = touch.clientY - rect.top;

        const renderer = canvas === this.app.canvas ? this.app.renderer : this.app.targetRenderer;
        const worldX = (screenX - renderer.originX) / renderer.scale;
        const worldY = (renderer.originY - screenY) / renderer.scale;

        this.app.tapeMeasure.update(worldX, worldY);
    }

    handleTouchEnd(e, canvas) {
        e.preventDefault();

        if (this.tapeMeasureTouch) {
            this.app.tapeMeasure.finish();
            this.tapeMeasureTouch = false;
        }
    }

    setupButtonFeedback() {
        // Add haptic feedback for buttons (if supported)
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.classList.add('active');
                this.vibrate(10);
            });

            btn.addEventListener('touchend', () => {
                btn.classList.remove('active');
            });
        });

        // Slider feedback
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            let lastValue = slider.value;
            slider.addEventListener('input', () => {
                if (Math.abs(slider.value - lastValue) > (slider.step || 1)) {
                    this.vibrate(5);
                    lastValue = slider.value;
                }
            });
        });
    }

    vibrate(duration) {
        if ('vibrate' in navigator) {
            navigator.vibrate(duration);
        }
    }

    // Swipe gesture detection for tab navigation
    enableSwipeNavigation() {
        let touchStartX = 0;
        let touchStartY = 0;
        const minSwipeDistance = 50;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Only trigger if horizontal swipe is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.switchToPreviousTab();
                } else {
                    this.switchToNextTab();
                }
            }
        }, { passive: true });
    }

    switchToNextTab() {
        const tabs = ['simulation', 'graphs', 'analysis', 'target-practice'];
        const currentIndex = tabs.indexOf(this.app.currentTab);
        const nextIndex = (currentIndex + 1) % tabs.length;
        this.app.switchTab(tabs[nextIndex]);
    }

    switchToPreviousTab() {
        const tabs = ['simulation', 'graphs', 'analysis', 'target-practice'];
        const currentIndex = tabs.indexOf(this.app.currentTab);
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        this.app.switchTab(tabs[prevIndex]);
    }
}

/**
 * Fullscreen API Support
 */
class FullscreenManager {
    constructor() {
        this.isFullscreen = false;
        this.setupFullscreenButton();
    }

    setupFullscreenButton() {
        // Create fullscreen button
        const button = document.createElement('button');
        button.id = 'fullscreen-btn';
        button.className = 'btn btn-secondary';
        button.innerHTML = '⛶ Fullscreen';
        button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000; display: none;';

        // Only show on mobile
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            button.style.display = 'block';
        }

        button.addEventListener('click', () => this.toggleFullscreen());
        document.body.appendChild(button);

        // Update button text on fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.isFullscreen = !!document.fullscreenElement;
            button.innerHTML = this.isFullscreen ? '⛶ Exit Fullscreen' : '⛶ Fullscreen';
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}
