/**
 * Leaderboard System for Target Practice
 * Tracks high scores and displays rankings
 */

class Leaderboard {
    constructor() {
        this.storageKey = 'projectile_sim_leaderboard';
        this.maxEntries = 10;
        this.setupUI();
    }

    setupUI() {
        // Add leaderboard display to target practice stats
        const targetStats = document.getElementById('target-stats');
        if (!targetStats) return;

        const leaderboardSection = document.createElement('div');
        leaderboardSection.innerHTML = `
            <h3 style="margin-top: 20px; border-top: 2px solid #4facfe; padding-top: 15px;">🏆 Leaderboard</h3>
            <div id="leaderboard-list" style="max-height: 250px; overflow-y: auto;">
                <!-- Leaderboard entries will appear here -->
            </div>
            <button id="clear-leaderboard-btn" class="btn btn-warning" style="margin-top: 10px; width: 100%;">
                Clear Leaderboard
            </button>
        `;

        targetStats.appendChild(leaderboardSection);

        // Add event listener for clear button
        document.getElementById('clear-leaderboard-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the leaderboard?')) {
                this.clearLeaderboard();
            }
        });

        this.updateDisplay();
    }

    addScore(score, targetsHit, totalTargets, playerName = null) {
        // Prompt for player name if not provided
        if (!playerName) {
            playerName = prompt('Enter your name for the leaderboard:', 'Player') || 'Anonymous';
        }

        const entry = {
            name: playerName,
            score: score,
            targetsHit: targetsHit,
            totalTargets: totalTargets,
            accuracy: totalTargets > 0 ? Math.round((targetsHit / totalTargets) * 100) : 0,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString()
        };

        const leaderboard = this.getLeaderboard();
        leaderboard.push(entry);

        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);

        // Keep only top entries
        const trimmed = leaderboard.slice(0, this.maxEntries);

        this.saveLeaderboard(trimmed);
        this.updateDisplay();

        // Check if this is a new high score
        const rank = trimmed.findIndex(e => e === entry) + 1;
        if (rank <= 3 && rank > 0) {
            this.celebrateHighScore(rank);
        }

        return rank;
    }

    getLeaderboard() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            return [];
        }
    }

    saveLeaderboard(leaderboard) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(leaderboard));
        } catch (error) {
            console.error('Error saving leaderboard:', error);
        }
    }

    clearLeaderboard() {
        localStorage.removeItem(this.storageKey);
        this.updateDisplay();
        this.showMessage('Leaderboard cleared!', 'warning');
    }

    updateDisplay() {
        const listContainer = document.getElementById('leaderboard-list');
        if (!listContainer) return;

        const leaderboard = this.getLeaderboard();

        if (leaderboard.length === 0) {
            listContainer.innerHTML = `
                <p style="color: #999; font-size: 0.9em; text-align: center; padding: 20px;">
                    No scores yet!<br>Play target practice to get on the board.
                </p>
            `;
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];

        listContainer.innerHTML = leaderboard.map((entry, index) => {
            const rank = index + 1;
            const medal = medals[index] || `#${rank}`;
            const isTopThree = index < 3;

            return `
                <div class="leaderboard-entry" style="
                    background: ${isTopThree ? 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)' : '#f8f9fa'};
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 8px;
                    border-left: 4px solid ${isTopThree ? '#ff6b6b' : '#4facfe'};
                    box-shadow: ${isTopThree ? '0 2px 10px rgba(255,215,0,0.3)' : 'none'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <span style="font-size: 1.3em; margin-right: 8px;">${medal}</span>
                            <strong style="color: ${isTopThree ? '#d32f2f' : '#333'};">${entry.name}</strong>
                            <br>
                            <small style="color: #666;">
                                ${entry.targetsHit}/${entry.totalTargets} hits (${entry.accuracy}%)
                                <br>
                                ${entry.date}
                            </small>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5em; font-weight: bold; color: ${isTopThree ? '#d32f2f' : '#4facfe'};">
                                ${entry.score}
                            </div>
                            <small style="color: #666;">points</small>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    celebrateHighScore(rank) {
        const messages = {
            1: '🎉 NEW HIGH SCORE! 🎉',
            2: '🌟 2nd Place! Amazing! 🌟',
            3: '⭐ 3rd Place! Well done! ⭐'
        };

        const message = messages[rank] || 'Great score!';

        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 50px;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            z-index: 10000;
            font-size: 2em;
            font-weight: bold;
            text-align: center;
            animation: celebrate 0.5s ease;
        `;
        celebration.innerHTML = message;

        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => celebration.remove(), 500);
        }, 2000);
    }

    showMessage(message, type = 'info') {
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
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 2000);
    }

    getPlayerRank(playerName) {
        const leaderboard = this.getLeaderboard();
        const index = leaderboard.findIndex(e => e.name === playerName);
        return index >= 0 ? index + 1 : -1;
    }

    getTopScore() {
        const leaderboard = this.getLeaderboard();
        return leaderboard.length > 0 ? leaderboard[0].score : 0;
    }
}

// Add celebration animation
const celebrationStyle = document.createElement('style');
celebrationStyle.textContent = `
    @keyframes celebrate {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.2); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(celebrationStyle);
