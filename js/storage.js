// Local storage management
class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            SAVED_VIDEOS: 'fasttube_saved_videos',
            WATCH_HISTORY: 'fasttube_watch_history',
            SETTINGS: 'fasttube_settings',
            CACHE: 'fasttube_cache'
        };
    }

    // Save video for offline
    saveVideo(videoData) {
        try {
            const savedVideos = this.getSavedVideos();
            
            // Check if already saved
            const exists = savedVideos.find(v => v.id === videoData.id);
            if (exists) {
                return false;
            }
            
            savedVideos.push(videoData);
            localStorage.setItem(this.STORAGE_KEYS.SAVED_VIDEOS, JSON.stringify(savedVideos));
            return true;
        } catch (error) {
            console.error('Save video error:', error);
            return false;
        }
    }

    // Get saved videos
    getSavedVideos() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SAVED_VIDEOS);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Get saved videos error:', error);
            return [];
        }
    }

    // Remove saved video
    removeSavedVideo(videoId) {
        try {
            let savedVideos = this.getSavedVideos();
            savedVideos = savedVideos.filter(v => v.id !== videoId);
            localStorage.setItem(this.STORAGE_KEYS.SAVED_VIDEOS, JSON.stringify(savedVideos));
            return true;
        } catch (error) {
            console.error('Remove video error:', error);
            return false;
        }
    }

    // Add to watch history
    addToHistory(videoData) {
        try {
            const settings = this.getSettings();
            if (!settings.saveHistory) return;
            
            const history = this.getWatchHistory();
            
            // Remove if already exists (to move to top)
            const filtered = history.filter(v => v.id !== videoData.id);
            
            // Add to beginning
            filtered.unshift(videoData);
            
            // Keep only last 100
            const limited = filtered.slice(0, 100);
            
            localStorage.setItem(this.STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(limited));
        } catch (error) {
            console.error('Add to history error:', error);
        }
    }

    // Get watch history
    getWatchHistory() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.WATCH_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Get history error:', error);
            return [];
        }
    }

    // Clear watch history
    clearHistory() {
        try {
            localStorage.removeItem(this.STORAGE_KEYS.WATCH_HISTORY);
            return true;
        } catch (error) {
            console.error('Clear history error:', error);
            return false;
        }
    }

    // Save settings
    saveSettings(settings) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Save settings error:', error);
            return false;
        }
    }

    // Get settings
    getSettings() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            const defaults = {
                autoQuality: true,
                backgroundPlayEnabled: true,
                saveHistory: true,
                defaultQuality: 'auto'
            };
            return data ? { ...defaults, ...JSON.parse(data) } : defaults;
        } catch (error) {
            console.error('Get settings error:', error);
            return {
                autoQuality: true,
                backgroundPlayEnabled: true,
                saveHistory: true,
                defaultQuality: 'auto'
            };
        }
    }

    // Clear all cache
    clearCache() {
        try {
            // Clear API cache
            if (window.youtubeAPI) {
                youtubeAPI.clearCache();
            }
            
            // Clear localStorage cache
            localStorage.removeItem(this.STORAGE_KEYS.CACHE);
            
            return true;
        } catch (error) {
            console.error('Clear cache error:', error);
            return false;
        }
    }

    // Get storage usage
    getStorageUsage() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return (total / 1024).toFixed(2); // KB
        } catch (error) {
            return '0';
        }
    }
}

// Note: StorageManager instance is created in app.js during initialization
