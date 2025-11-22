/**
 * Sound Effects System
 * Uses Web Audio API to generate sound effects
 */

class SoundEffects {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.masterGain = null;
        this.volume = 0.3; // 30% volume

        this.initializeAudio();
        this.createVolumeControl();
    }

    initializeAudio() {
        try {
            // Create audio context (with vendor prefixes)
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    createVolumeControl() {
        // Add volume control to UI
        const controlPanel = document.querySelector('.control-panel');
        if (!controlPanel) return;

        const soundControl = document.createElement('div');
        soundControl.className = 'data-display';
        soundControl.style.marginTop = '10px';
        soundControl.innerHTML = `
            <h3>Sound Effects</h3>
            <div class="control-group checkbox-group">
                <label>
                    <input type="checkbox" id="sound-enabled" checked>
                    Enable Sound
                </label>
            </div>
            <div class="control-group">
                <label for="sound-volume">Volume: <span id="sound-volume-value">30</span>%</label>
                <input type="range" id="sound-volume" min="0" max="100" value="30" step="5">
            </div>
        `;

        // Insert before data export section
        const exportSection = Array.from(controlPanel.children).find(el =>
            el.textContent.includes('Data Export')
        );
        if (exportSection) {
            controlPanel.insertBefore(soundControl, exportSection);
        } else {
            controlPanel.appendChild(soundControl);
        }

        // Add event listeners
        const enabledCheckbox = document.getElementById('sound-enabled');
        const volumeSlider = document.getElementById('sound-volume');
        const volumeValue = document.getElementById('sound-volume-value');

        enabledCheckbox.addEventListener('change', (e) => {
            this.enabled = e.target.checked;
        });

        volumeSlider.addEventListener('input', (e) => {
            this.volume = parseInt(e.target.value) / 100;
            volumeValue.textContent = e.target.value;
            if (this.masterGain) {
                this.masterGain.gain.value = this.volume;
            }
        });
    }

    /**
     * Play launch sound - rising whoosh
     */
    playLaunch() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Create oscillator for whoosh
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.15);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    /**
     * Play landing sound - thud
     */
    playLand() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Low frequency thud
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(80, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.1);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    /**
     * Play target hit sound - ding
     */
    playHit() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // High pitch ding
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator1.type = 'sine';
        oscillator1.frequency.value = 800;

        oscillator2.type = 'sine';
        oscillator2.frequency.value = 1200;

        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator1.start(now);
        oscillator2.start(now);
        oscillator1.stop(now + 0.2);
        oscillator2.stop(now + 0.2);
    }

    /**
     * Play error/miss sound
     */
    playMiss() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Descending tone
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.3);
    }

    /**
     * Play success fanfare
     */
    playSuccess() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Three-note ascending fanfare
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G
        const duration = 0.15;

        frequencies.forEach((freq, index) => {
            const startTime = now + (index * duration);
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.type = 'triangle';
            oscillator.frequency.value = freq;

            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        });
    }

    /**
     * Play UI click sound
     */
    playClick() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Short click
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = 800;

        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    /**
     * Resume audio context (required for some browsers)
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}
