// Pro Features Module - Playlists, History, Stats, Themes

class ProFeatures {
    constructor() {
        this.currentTheme = localStorage.getItem('yt-theme') || 'dark';
        this.stats = this.loadStats();
        this.playlists = this.loadPlaylists();
        this.history = this.loadHistory();
    }

    // Initialize Pro Features
    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeSelector();
        this.setupPlaylistHandlers();
        this.setupHistoryHandlers();
        this.setupStatsHandlers();
        this.setupExportData();
    }

    // Theme Management
    setupThemeSelector() {
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.value = this.currentTheme;
            themeSelector.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('yt-theme', theme);
        
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-oled', 'theme-neon', 'theme-matrix');
        document.body.classList.add(`theme-${theme}`);
        
        const themes = {
            dark: {
                primary: '#0a0a0f',
                secondary: '#141420',
                text: '#ffffff',
                accent: '#00f0ff'
            },
            light: {
                primary: '#ffffff',
                secondary: '#f5f5f5',
                text: '#000000',
                accent: '#0066cc'
            },
            oled: {
                primary: '#000000',
                secondary: '#0a0a0a',
                text: '#ffffff',
                accent: '#00f0ff'
            },
            neon: {
                primary: '#0a0014',
                secondary: '#1a0030',
                text: '#ff00ff',
                accent: '#ff00ff'
            },
            matrix: {
                primary: '#001a00',
                secondary: '#003300',
                text: '#00ff00',
                accent: '#00ff00'
            }
        };

        if (themes[theme]) {
            const t = themes[theme];
            document.documentElement.style.setProperty('--bg-color', t.primary);
            document.documentElement.style.setProperty('--surface-color', t.secondary);
            document.documentElement.style.setProperty('--text-primary', t.text);
            document.documentElement.style.setProperty('--primary-color', t.accent);
        }
    }

    // Playlist Management
    setupPlaylistHandlers() {
        const createBtn = document.getElementById('create-new-playlist-btn');
        if (createBtn) {
            createBtn.addEventListener('click', () => this.showCreatePlaylistDialog());
        }
    }

    showCreatePlaylistDialog() {
        const name = prompt('Enter playlist name:');
        if (name && name.trim()) {
            this.createPlaylist(name.trim());
        }
    }

    createPlaylist(name) {
        if (!this.playlists[name]) {
            this.playlists[name] = [];
            this.savePlaylists();
            this.renderPlaylists();
            this.showNotification(`Playlist "${name}" created!`);
        } else {
            this.showNotification(`Playlist "${name}" already exists!`);
        }
    }

    addToPlaylist(playlistName, video) {
        if (!this.playlists[playlistName]) {
            this.playlists[playlistName] = [];
        }
        
        if (!this.playlists[playlistName].find(v => v.id === video.id)) {
            this.playlists[playlistName].push({
                ...video,
                addedAt: Date.now()
            });
            this.savePlaylists();
            return true;
        }
        return false;
    }

    removeFromPlaylist(playlistName, videoId) {
        if (this.playlists[playlistName]) {
            this.playlists[playlistName] = this.playlists[playlistName].filter(v => v.id !== videoId);
            this.savePlaylists();
            this.renderPlaylists();
        }
    }

    deletePlaylist(name) {
        if (confirm(`Delete playlist "${name}"?`)) {
            delete this.playlists[name];
            this.savePlaylists();
            this.renderPlaylists();
            this.showNotification(`Playlist "${name}" deleted!`);
        }
    }

    renderPlaylists() {
        const container = document.getElementById('playlists-container');
        if (!container) return;

        container.innerHTML = '';
        
        Object.keys(this.playlists).forEach(name => {
            const playlist = this.playlists[name];
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.innerHTML = `
                <div class="playlist-header">
                    <h3><span class="icon icon-music"></span> ${name}</h3>
                    <button class="btn-delete" onclick="proFeatures.deletePlaylist('${name}')">
                        <span class="icon icon-close"></span>
                    </button>
                </div>
                <p class="playlist-count">${playlist.length} videos</p>
                <div class="playlist-preview">
                    ${playlist.slice(0, 4).map(v => `
                        <div class="preview-thumb" title="${v.title}"></div>
                    `).join('')}
                </div>
                <button class="btn-primary" onclick="proFeatures.openPlaylist('${name}')">
                    Open Playlist
                </button>
            `;
            container.appendChild(card);
        });

        if (Object.keys(this.playlists).length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
                    <p style="font-size: 48px; margin-bottom: 20px;">🎵</p>
                    <h3>No Playlists Yet</h3>
                    <p>Create your first playlist to organize your favorite videos!</p>
                </div>
            `;
        }
    }

    openPlaylist(name) {
        // TODO: Implement playlist video view
        alert(`Opening playlist: ${name}\nFeature coming soon!`);
    }

    // Watch History
    setupHistoryHandlers() {
        const clearBtn = document.getElementById('clear-history-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }
    }

    addToHistory(video) {
        const historyEntry = {
            ...video,
            watchedAt: Date.now()
        };
        
        // Remove duplicate if exists
        this.history = this.history.filter(v => v.id !== video.id);
        this.history.unshift(historyEntry);
        
        // Keep last 100 videos
        this.history = this.history.slice(0, 100);
        this.saveHistory();
        
        // Update stats
        this.updateStats('videoWatched', video);
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px; color: var(--text-secondary);">
                    <p style="font-size: 48px; margin-bottom: 20px;">📜</p>
                    <h3>No Watch History</h3>
                    <p>Videos you watch will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.history.map(video => `
            <div class="video-card" onclick="videoPlayer.showPlayer('${video.id}', '${video.title.replace(/'/g, "\\'")}')">
                <div class="video-thumbnail">
                    <img src="https://i.ytimg.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}" loading="lazy">
                    <span class="video-duration">${this.formatTimeAgo(video.watchedAt)}</span>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                </div>
            </div>
        `).join('');
    }

    clearHistory() {
        if (confirm('Clear all watch history?')) {
            this.history = [];
            this.saveHistory();
            this.renderHistory();
            this.showNotification('History cleared!');
        }
    }

    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    }

    // Statistics
    setupStatsHandlers() {
        // Auto-update stats when stats page is viewed
        const statsBtn = document.querySelector('[data-page="stats"]');
        if (statsBtn) {
            statsBtn.addEventListener('click', () => this.renderStats());
        }
    }

    updateStats(action, data) {
        switch(action) {
            case 'videoWatched':
                this.stats.videosWatched++;
                this.stats.totalWatchTime += 300; // Estimate 5 minutes per video
                
                // Track categories
                if (data.category) {
                    this.stats.categoryViews[data.category] = (this.stats.categoryViews[data.category] || 0) + 1;
                }
                
                // Track active days
                const today = new Date().toDateString();
                if (!this.stats.activeDays.includes(today)) {
                    this.stats.activeDays.push(today);
                }
                break;
        }
        
        this.saveStats();
    }

    renderStats() {
        // Update stat cards
        const updateStat = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value;
        };

        updateStat('total-watch-time', `${Math.round(this.stats.totalWatchTime / 60)} hours`);
        updateStat('videos-watched', this.stats.videosWatched);
        updateStat('playlists-count', Object.keys(this.playlists).length);
        updateStat('saved-count', this.history.length);
        updateStat('active-days', this.stats.activeDays.length);

        // Find favorite category
        const categories = Object.entries(this.stats.categoryViews);
        if (categories.length > 0) {
            const favorite = categories.sort((a, b) => b[1] - a[1])[0];
            updateStat('favorite-category', favorite[0]);
        }

        // Render category chart
        this.renderCategoryChart();
    }

    renderCategoryChart() {
        const container = document.getElementById('category-chart');
        if (!container) return;

        const categories = Object.entries(this.stats.categoryViews).sort((a, b) => b[1] - a[1]);
        
        if (categories.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No data yet</p>';
            return;
        }

        const maxViews = categories[0][1];
        
        container.innerHTML = categories.map(([category, views]) => {
            const percentage = (views / maxViews) * 100;
            return `
                <div class="chart-bar" style="margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span style="color: var(--text-primary);">${category}</span>
                        <span style="color: var(--text-secondary);">${views} views</span>
                    </div>
                    <div style="background: var(--surface-color); border-radius: 10px; height: 12px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, var(--primary-color), var(--accent-color)); width: ${percentage}%; height: 100%; border-radius: 10px; transition: width 0.5s;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Export Data
    setupExportData() {
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportUserData());
        }
    }

    exportUserData() {
        const data = {
            playlists: this.playlists,
            history: this.history,
            stats: this.stats,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fasttube-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully!');
    }

    // Storage Methods
    loadPlaylists() {
        return JSON.parse(localStorage.getItem('yt-playlists') || '{}');
    }

    savePlaylists() {
        localStorage.setItem('yt-playlists', JSON.stringify(this.playlists));
    }

    loadHistory() {
        return JSON.parse(localStorage.getItem('yt-watch-history') || '[]');
    }

    saveHistory() {
        localStorage.setItem('yt-watch-history', JSON.stringify(this.history));
    }

    loadStats() {
        const defaultStats = {
            videosWatched: 0,
            totalWatchTime: 0,
            categoryViews: {},
            activeDays: []
        };
        return JSON.parse(localStorage.getItem('yt-stats') || JSON.stringify(defaultStats));
    }

    saveStats() {
        localStorage.setItem('yt-stats', JSON.stringify(this.stats));
    }

    // Notification Helper
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: #000;
            padding: 15px 25px;
            border-radius: 25px;
            font-weight: 700;
            z-index: 10000;
            animation: slideDown 0.3s ease-out;
            box-shadow: 0 0 30px var(--primary-glow);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2500);
    }
}

// Initialize Pro Features
const proFeatures = new ProFeatures();

// Add keyboard shortcut hints
document.addEventListener('keydown', (e) => {
    // Ctrl+P for Playlists
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        document.querySelector('[data-page="playlists"]')?.click();
    }
    // Ctrl+H for History
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        document.querySelector('[data-page="history"]')?.click();
    }
    // Ctrl+S for Stats
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.querySelector('[data-page="stats"]')?.click();
    }
});
