// Main application logic
class FastTubeApp {
    constructor() {
        this.currentPage = 'home';
        this.currentFilter = 'trending';
        this.searchQuery = '';
        this.nextPageToken = null;
        this.isLoading = false;
    }

    // Initialize app
    async init() {
        console.log('Initializing FastTube...');
        
        // Setup event listeners FIRST (critical for responsiveness)
        this.setupEventListeners();
        
        // Load settings
        this.loadSettings();
        
        // Hide loading screen immediately for better UX
        this.hideLoadingScreen();
        
        // Check API key and load content
        if (CONFIG.API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
            this.showAPIKeyPrompt();
        } else {
            // Load trending videos
            await this.loadTrendingVideos();
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Search
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                console.log('Search button clicked');
                this.handleSearch();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed in search');
                    this.handleSearch();
                }
            });
        }
        
        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Filter clicked:', e.target.dataset.filter);
                this.handleFilterClick(e);
            });
        });
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Navigation clicked:', e.target.dataset.page);
                this.handleNavigation(e);
            });
        });
        
        // Player controls
        document.getElementById('close-player').addEventListener('click', () => {
            videoPlayer.closePlayer();
        });
        
        document.getElementById('picture-in-picture').addEventListener('click', () => {
            videoPlayer.enablePiP();
        });
        
        document.getElementById('background-play').addEventListener('click', () => {
            videoPlayer.startBackgroundPlay();
        });
        
        document.getElementById('download-btn').addEventListener('click', () => {
            videoPlayer.downloadVideo();
        });
        
        // Settings
        document.querySelector('[data-page="settings"]').addEventListener('click', () => {
            this.showSettings();
        });
        
        document.querySelector('.close-modal').addEventListener('click', () => {
            document.getElementById('settings-modal').style.display = 'none';
        });
        
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.clearCache();
        });
        
        document.getElementById('save-api-key').addEventListener('click', () => {
            this.saveAPIKey();
        });
        
        // Load more
        document.getElementById('load-more-btn').addEventListener('click', () => {
            this.loadMore();
        });
    }

    // Show loading screen
    showLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    }

    // Hide loading screen
    hideLoadingScreen() {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
    }

    // Show API key prompt
    showAPIKeyPrompt() {
        setTimeout(() => {
            alert('⚠️ API Key Required\n\nTo use FastTube, you need a YouTube Data API v3 key.\n\n1. Go to: console.developers.google.com\n2. Create a project\n3. Enable YouTube Data API v3\n4. Create credentials (API Key)\n5. Enter it in Settings\n\nFor demo purposes, the app will show limited functionality.');
        }, 1000);
    }

    // Handle search
    async handleSearch() {
        const query = document.getElementById('search-input').value.trim();
        if (!query) return;
        
        this.searchQuery = query;
        this.nextPageToken = null;
        
        try {
            this.isLoading = true;
            const results = await youtubeAPI.searchVideos(query);
            this.displayVideos(results);
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please check your API key.');
        } finally {
            this.isLoading = false;
        }
    }

    // Handle filter click
    async handleFilterClick(e) {
        const btn = e.target;
        const filter = btn.dataset.filter;
        
        // Update active state
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.currentFilter = filter;
        this.nextPageToken = null;
        
        try {
            this.isLoading = true;
            const results = await youtubeAPI.searchByCategory(filter);
            this.displayVideos(results);
        } catch (error) {
            console.error('Filter error:', error);
            this.showError('Failed to load videos. Please check your API key.');
        } finally {
            this.isLoading = false;
        }
    }

    // Load trending videos
    async loadTrendingVideos() {
        try {
            this.isLoading = true;
            const results = await youtubeAPI.getTrendingVideos();
            this.displayVideos(results);
        } catch (error) {
            console.error('Trending videos error:', error);
            this.showDemoVideos();
        } finally {
            this.isLoading = false;
        }
    }

    // Display videos
    displayVideos(data) {
        const container = document.getElementById('video-results');
        container.innerHTML = '';
        
        const videos = data.items || [];
        this.nextPageToken = data.nextPageToken || null;
        
        if (videos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No videos found</p>';
            return;
        }
        
        videos.forEach(video => {
            const videoCard = this.createVideoCard(video);
            container.appendChild(videoCard);
        });
        
        // Show/hide load more button
        const loadMoreContainer = document.getElementById('load-more-container');
        loadMoreContainer.style.display = this.nextPageToken ? 'block' : 'none';
    }

    // Create video card element
    createVideoCard(video) {
        const videoId = video.id.videoId || video.id;
        const snippet = video.snippet;
        const contentDetails = video.contentDetails;
        const statistics = video.statistics;
        
        const card = document.createElement('div');
        card.className = 'video-card';
        
        const thumbnail = snippet.thumbnails.medium.url;
        const title = snippet.title;
        const channelTitle = snippet.channelTitle;
        const duration = contentDetails ? youtubeAPI.formatDuration(contentDetails.duration) : '';
        const views = statistics ? youtubeAPI.formatViewCount(statistics.viewCount) : '';
        
        card.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                ${duration ? `<span class="video-duration">${duration}</span>` : ''}
            </div>
            <div class="video-info">
                <div class="video-title-card">${title}</div>
                <div class="video-meta">
                    ${channelTitle}${views ? ` · ${views} views` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.playVideo(videoId, title);
        });
        
        return card;
    }

    // Play video
    playVideo(videoId, title) {
        videoPlayer.showPlayer(videoId, title);
    }

    // Load more videos
    async loadMore() {
        if (!this.nextPageToken || this.isLoading) return;
        
        try {
            this.isLoading = true;
            let results;
            
            if (this.searchQuery) {
                results = await youtubeAPI.searchVideos(this.searchQuery, CONFIG.DEFAULT_MAX_RESULTS, this.nextPageToken);
            } else {
                results = await youtubeAPI.searchByCategory(this.currentFilter, CONFIG.DEFAULT_MAX_RESULTS);
            }
            
            const container = document.getElementById('video-results');
            const videos = results.items || [];
            this.nextPageToken = results.nextPageToken || null;
            
            videos.forEach(video => {
                const videoCard = this.createVideoCard(video);
                container.appendChild(videoCard);
            });
            
            // Update load more button
            const loadMoreContainer = document.getElementById('load-more-container');
            loadMoreContainer.style.display = this.nextPageToken ? 'block' : 'none';
            
        } catch (error) {
            console.error('Load more error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // Handle navigation
    handleNavigation(e) {
        const page = e.currentTarget.dataset.page;
        
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Show appropriate section
        if (page === 'home') {
            document.querySelector('.results-section').style.display = 'block';
            document.getElementById('saved-section').style.display = 'none';
        } else if (page === 'saved') {
            this.showSavedVideos();
        } else if (page === 'settings') {
            this.showSettings();
        }
    }

    // Show saved videos
    showSavedVideos() {
        document.querySelector('.results-section').style.display = 'none';
        const savedSection = document.getElementById('saved-section');
        savedSection.style.display = 'block';
        
        const savedVideos = storage.getSavedVideos();
        const container = document.getElementById('saved-videos');
        container.innerHTML = '';
        
        if (savedVideos.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No saved videos</p>';
            return;
        }
        
        savedVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-info" style="padding: 16px;">
                    <div class="video-title-card">${video.title}</div>
                    <div class="video-meta">Saved ${new Date(video.savedAt).toLocaleDateString()}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                this.playVideo(video.id, video.title);
            });
            container.appendChild(card);
        });
    }

    // Show settings
    showSettings() {
        const modal = document.getElementById('settings-modal');
        modal.style.display = 'flex';
        
        const settings = storage.getSettings();
        document.getElementById('auto-quality').checked = settings.autoQuality;
        document.getElementById('background-play-enabled').checked = settings.backgroundPlayEnabled;
        document.getElementById('save-history').checked = settings.saveHistory;
        document.getElementById('default-quality').value = settings.defaultQuality;
        
        const apiKey = localStorage.getItem('youtube_api_key') || '';
        document.getElementById('api-key-input').value = apiKey;
    }

    // Load settings
    loadSettings() {
        const settings = storage.getSettings();
        CONFIG.ENABLE_BACKGROUND_PLAY = settings.backgroundPlayEnabled;
        CONFIG.DEFAULT_VIDEO_QUALITY = settings.defaultQuality;
    }

    // Save settings
    saveSettings() {
        const settings = {
            autoQuality: document.getElementById('auto-quality').checked,
            backgroundPlayEnabled: document.getElementById('background-play-enabled').checked,
            saveHistory: document.getElementById('save-history').checked,
            defaultQuality: document.getElementById('default-quality').value
        };
        
        storage.saveSettings(settings);
        this.loadSettings();
    }

    // Save API key
    saveAPIKey() {
        const apiKey = document.getElementById('api-key-input').value.trim();
        if (apiKey) {
            saveAPIKey(apiKey);
            alert('API Key saved! Reloading app...');
            location.reload();
        } else {
            alert('Please enter a valid API key');
        }
    }

    // Clear cache
    clearCache() {
        if (confirm('Clear all cached data? This will free up storage space.')) {
            storage.clearCache();
            alert('Cache cleared successfully!');
        }
    }

    // Show error message
    showError(message) {
        const container = document.getElementById('video-results');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p style="color: var(--danger-color); font-size: 16px; margin-bottom: 12px;">⚠️ ${message}</p>
                <button onclick="location.reload()" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Retry</button>
            </div>
        `;
    }

    // Show demo videos (fallback when API is not configured)
    showDemoVideos() {
        const demoVideos = [
            { id: 'dQw4w9WgXcQ', title: 'Demo Video 1', channel: 'Demo Channel' },
            { id: 'jNQXAC9IVRw', title: 'Demo Video 2', channel: 'Demo Channel' },
            { id: '9bZkp7q19f0', title: 'Demo Video 3', channel: 'Demo Channel' }
        ];
        
        const container = document.getElementById('video-results');
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">⚠️ API key not configured. Showing demo videos.<br>Go to Settings to add your YouTube API key.</p>';
        
        demoVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-thumbnail">
                    <img src="https://img.youtube.com/vi/${video.id}/mqdefault.jpg" alt="${video.title}" loading="lazy">
                </div>
                <div class="video-info">
                    <div class="video-title-card">${video.title}</div>
                    <div class="video-meta">${video.channel}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                this.playVideo(video.id, video.title);
            });
            container.appendChild(card);
        });
    }
}

// Initialize app when DOM is ready
let app;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new FastTubeApp();
        app.init();
    });
} else {
    app = new FastTubeApp();
    app.init();
}

// Save settings when checkboxes change
document.addEventListener('DOMContentLoaded', () => {
    const settingInputs = ['auto-quality', 'background-play-enabled', 'save-history', 'default-quality'];
    settingInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', () => {
                if (app) app.saveSettings();
            });
        }
    });
});
