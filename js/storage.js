/**
 * Save/Load Configuration System
 * Stores simulation configurations and user preferences
 */

class ConfigurationManager {
    constructor(app) {
        this.app = app;
        this.storageKey = 'projectile_sim_configs';
        this.preferencesKey = 'projectile_sim_preferences';
        this.setupUI();
        this.loadPreferences();
    }

    setupUI() {
        // Add save/load controls to control panel
        const controlPanel = document.querySelector('.control-panel');
        if (!controlPanel) return;

        const configSection = document.createElement('div');
        configSection.className = 'data-display';
        configSection.style.marginTop = '10px';
        configSection.innerHTML = `
            <h3>Save/Load</h3>
            <div class="control-group">
                <label for="config-name">Configuration Name:</label>
                <input type="text" id="config-name" placeholder="My Setup"
                       style="width: 100%; padding: 8px; border: 2px solid #ddd; border-radius: 5px; margin-top: 5px;">
            </div>
            <div class="button-group">
                <button id="save-config-btn" class="btn btn-primary">💾 Save Configuration</button>
                <button id="load-config-btn" class="btn btn-secondary">📂 Load Configuration</button>
                <button id="delete-config-btn" class="btn btn-warning">🗑️ Delete Configuration</button>
            </div>
            <div id="saved-configs-list" style="margin-top: 10px; max-height: 150px; overflow-y: auto;">
                <!-- Saved configurations will appear here -->
            </div>
        `;

        // Insert before sound control or at end
        const soundControl = Array.from(controlPanel.children).find(el =>
            el.textContent.includes('Sound Effects')
        );
        if (soundControl) {
            controlPanel.insertBefore(configSection, soundControl);
        } else {
            controlPanel.appendChild(configSection);
        }

        // Add event listeners
        document.getElementById('save-config-btn').addEventListener('click', () => this.saveConfiguration());
        document.getElementById('load-config-btn').addEventListener('click', () => this.showLoadDialog());
        document.getElementById('delete-config-btn').addEventListener('click', () => this.showDeleteDialog());

        this.updateConfigsList();
    }

    saveConfiguration() {
        const nameInput = document.getElementById('config-name');
        const name = nameInput.value.trim() || `Config ${new Date().toLocaleString()}`;

        const config = {
            name: name,
            timestamp: new Date().toISOString(),
            params: { ...this.app.params },
            visual: {
                showVectors: this.app.showVectors,
                showTrajectory: this.app.showTrajectory,
                showPrediction: this.app.showPrediction
            }
        };

        const configs = this.loadConfigurations();
        configs.push(config);
        this.saveConfigurations(configs);

        nameInput.value = '';
        this.updateConfigsList();

        this.showNotification('Configuration saved!', 'success');
    }

    loadConfiguration(index) {
        const configs = this.loadConfigurations();
        if (index < 0 || index >= configs.length) return;

        const config = configs[index];

        // Apply parameters
        Object.assign(this.app.params, config.params);

        // Update UI controls
        document.getElementById('velocity').value = config.params.velocity;
        document.getElementById('velocity-value').textContent = config.params.velocity.toFixed(1);

        document.getElementById('angle').value = config.params.angle;
        document.getElementById('angle-value').textContent = config.params.angle;

        document.getElementById('mass').value = config.params.mass;
        document.getElementById('mass-value').textContent = config.params.mass.toFixed(1);

        document.getElementById('diameter').value = config.params.diameter;
        document.getElementById('diameter-value').textContent = config.params.diameter.toFixed(2);

        document.getElementById('gravity').value = config.params.gravity;
        document.getElementById('gravity-value').textContent = config.params.gravity.toFixed(2);

        document.getElementById('air-resistance').checked = config.params.airResistance;

        if (config.params.windEnabled !== undefined) {
            document.getElementById('wind-enabled').checked = config.params.windEnabled;
            document.getElementById('wind-control').style.display =
                config.params.windEnabled ? 'block' : 'none';
            document.getElementById('wind-speed').value = config.params.windSpeed || 0;
            document.getElementById('wind-speed-value').textContent =
                (config.params.windSpeed || 0).toFixed(1);
        }

        // Apply visual settings
        if (config.visual) {
            this.app.showVectors = config.visual.showVectors;
            this.app.showTrajectory = config.visual.showTrajectory;
            this.app.showPrediction = config.visual.showPrediction;

            document.getElementById('show-vectors').checked = config.visual.showVectors;
            document.getElementById('show-trajectory').checked = config.visual.showTrajectory;
            document.getElementById('show-prediction').checked = config.visual.showPrediction;
        }

        // Recreate projectile with new params
        this.app.createProjectile();
        this.app.updatePredictions();

        this.showNotification(`Loaded: ${config.name}`, 'success');
    }

    deleteConfiguration(index) {
        const configs = this.loadConfigurations();
        if (index < 0 || index >= configs.length) return;

        const deletedName = configs[index].name;
        configs.splice(index, 1);
        this.saveConfigurations(configs);
        this.updateConfigsList();

        this.showNotification(`Deleted: ${deletedName}`, 'warning');
    }

    loadConfigurations() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading configurations:', error);
            return [];
        }
    }

    saveConfigurations(configs) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(configs));
        } catch (error) {
            console.error('Error saving configurations:', error);
            this.showNotification('Error saving configuration', 'error');
        }
    }

    updateConfigsList() {
        const listContainer = document.getElementById('saved-configs-list');
        if (!listContainer) return;

        const configs = this.loadConfigurations();

        if (configs.length === 0) {
            listContainer.innerHTML = '<p style="color: #999; font-size: 0.9em; text-align: center;">No saved configurations</p>';
            return;
        }

        listContainer.innerHTML = configs.map((config, index) => `
            <div class="config-item" style="background: #f8f9fa; padding: 10px; margin-bottom: 5px; border-radius: 5px; border-left: 4px solid #4facfe;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${config.name}</strong>
                        <br>
                        <small style="color: #666;">${new Date(config.timestamp).toLocaleString()}</small>
                    </div>
                    <div>
                        <button class="btn-mini" onclick="window.app.configManager.loadConfiguration(${index})"
                                style="padding: 5px 10px; background: #4facfe; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;">
                            Load
                        </button>
                        <button class="btn-mini" onclick="window.app.configManager.deleteConfiguration(${index})"
                                style="padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">
                            ×
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showLoadDialog() {
        const configs = this.loadConfigurations();
        if (configs.length === 0) {
            this.showNotification('No saved configurations', 'info');
            return;
        }
        // List is already visible - just highlight it
        const list = document.getElementById('saved-configs-list');
        list.style.border = '2px solid #4facfe';
        setTimeout(() => {
            list.style.border = '';
        }, 1000);
    }

    showDeleteDialog() {
        const configs = this.loadConfigurations();
        if (configs.length === 0) {
            this.showNotification('No configurations to delete', 'info');
            return;
        }
        this.showNotification('Click × next to a configuration to delete it', 'info');
    }

    savePreferences() {
        const preferences = {
            soundEnabled: document.getElementById('sound-enabled')?.checked,
            soundVolume: document.getElementById('sound-volume')?.value,
            multiProjectileMode: this.app.multiProjectileMode,
            simulationSpeed: this.app.simulationSpeed
        };

        try {
            localStorage.setItem(this.preferencesKey, JSON.stringify(preferences));
        } catch (error) {
            console.error('Error saving preferences:', error);
        }
    }

    loadPreferences() {
        try {
            const data = localStorage.getItem(this.preferencesKey);
            if (!data) return;

            const preferences = JSON.parse(data);

            // Apply preferences after a short delay to ensure UI is ready
            setTimeout(() => {
                if (preferences.soundEnabled !== undefined) {
                    const soundCheckbox = document.getElementById('sound-enabled');
                    if (soundCheckbox) soundCheckbox.checked = preferences.soundEnabled;
                }

                if (preferences.soundVolume !== undefined) {
                    const volumeSlider = document.getElementById('sound-volume');
                    const volumeValue = document.getElementById('sound-volume-value');
                    if (volumeSlider) volumeSlider.value = preferences.soundVolume;
                    if (volumeValue) volumeValue.textContent = preferences.soundVolume;
                }

                if (preferences.multiProjectileMode !== undefined) {
                    this.app.multiProjectileMode = preferences.multiProjectileMode;
                }

                if (preferences.simulationSpeed !== undefined) {
                    this.app.simulationSpeed = preferences.simulationSpeed;
                }
            }, 100);
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: '#4CAF50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196F3'
        };

        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Add animations to style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
