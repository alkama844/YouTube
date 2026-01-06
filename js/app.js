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
        
        // Check API key
        if (CONFIG.API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
            this.showAPIKeyRequired();
            this.hideLoadingScreen();
            return;
        }
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load settings
        this.loadSettings();
        
        // Load trending videos
        await this.loadTrendingVideos();
        
        // Hide loading screen
        this.hideLoadingScreen();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Search
        document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        
        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e));
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
        
        document.getElementById('add-to-playlist-btn').addEventListener('click', () => {
            if (videoPlayer.currentVideoId) {
                videoPlayer.addToPlaylist(
                    videoPlayer.currentVideoId,
                    videoPlayer.currentVideoTitle,
                    videoPlayer.currentVideoThumbnail
                );
            }
        });
        
        // Playlist controls
        document.getElementById('play-all-btn').addEventListener('click', () => {
            videoPlayer.playAllPlaylist();
        });
        
        document.getElementById('clear-playlist-btn').addEventListener('click', () => {
            videoPlayer.clearPlaylist();
        });
        
        // Mini player controls
        document.getElementById('mini-player-thumbnail').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        document.getElementById('mini-player-info').addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        document.getElementById('mini-player-prev').addEventListener('click', () => {
            videoPlayer.playPrevious();
        });
        
        document.getElementById('mini-player-next').addEventListener('click', () => {
            videoPlayer.playNext();
        });
        
        document.getElementById('mini-player-close').addEventListener('click', () => {
            videoPlayer.hideMiniPlayer();
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

    // Show API key required message
    showAPIKeyRequired() {
        const container = document.getElementById('video-results');
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; padding: 40px 20px; text-align: center;">
                <div style="width: 100px; height: 100px; margin-bottom: 30px; position: relative;">
                    <div style="position: absolute; width: 100%; height: 100%; border: 3px solid var(--neon-blue); border-radius: 50%; opacity: 0.3;"></div>
                    <div style="position: absolute; width: 100%; height: 100%; border: 3px solid var(--neon-blue); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; border-top-color: transparent;"></div>
                    <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                </div>
                
                <h2 style="color: var(--neon-blue); font-size: 24px; margin-bottom: 16px; text-shadow: 0 0 20px var(--primary-glow);">
                    API Key Required
                </h2>
                
                <p style="color: var(--text-secondary); font-size: 16px; max-width: 500px; margin-bottom: 30px; line-height: 1.6;">
                    To use FastTube, you need to add your YouTube Data API v3 key.
                </p>
                
                <div style="background: var(--surface-color); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; max-width: 600px; margin-bottom: 30px; text-align: left;">
                    <h3 style="color: var(--text-primary); font-size: 16px; margin-bottom: 16px; font-weight: 600;">Quick Setup:</h3>
                    <ol style="color: var(--text-secondary); font-size: 14px; line-height: 2; padding-left: 20px;">
                        <li>Visit <a href="https://console.developers.google.com/" target="_blank" style="color: var(--neon-blue); text-decoration: none;">Google Cloud Console</a></li>
                        <li>Create a new project</li>
                        <li>Enable <strong style="color: var(--text-primary);">YouTube Data API v3</strong></li>
                        <li>Create Credentials → API Key</li>
                        <li>Copy your API key</li>
                        <li>Click Settings below and paste it</li>
                    </ol>
                </div>
                
                <button onclick="document.querySelector('[data-page=settings]').click()" 
                        style="background: linear-gradient(135deg, var(--neon-blue), var(--neon-pink)); 
                               color: white; padding: 16px 40px; border: none; border-radius: 12px; 
                               font-size: 16px; font-weight: 600; cursor: pointer;
                               box-shadow: 0 0 30px var(--primary-glow); transition: all 0.3s ease;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 40px var(--primary-glow)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 30px var(--primary-glow)'">
                    <span class="icon icon-settings" style="display: inline-block; margin-right: 8px;"></span>
                    Open Settings
                </button>
                
                <style>
                    @keyframes ping {
                        75%, 100% {
                            transform: scale(1.5);
                            opacity: 0;
                        }
                    }
                </style>
            </div>
        `;
    }

    // Show API key prompt (legacy)
    showAPIKeyPrompt() {
        // Removed - Replaced with showAPIKeyRequired which shows error: 'Failed to load videos. Please check your API key in Settings.'
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
            this.showError('Failed to load videos. Please check your API key in Settings.');
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
            this.playVideo(videoId, title, thumbnail);
        });
        
        return card;
    }

    // Play video
    playVideo(videoId, title, thumbnail) {
        videoPlayer.showPlayer(videoId, title, thumbnail);
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

    // Show saved videos (now shows playlist)
    showSavedVideos() {
        document.querySelector('.results-section').style.display = 'none';
        document.getElementById('player-section').style.display = 'none';
        const savedSection = document.getElementById('saved-section');
        savedSection.style.display = 'block';
        
        const playlist = storage.getPlaylist();
        const container = document.getElementById('saved-videos');
        container.innerHTML = '';
        
        // Update title
        savedSection.querySelector('h2').innerHTML = '<span class="icon icon-save"></span> My Playlist';
        
        if (playlist.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">No videos in playlist<br><small>Add videos while watching to create a playlist</small></p>';
            return;
        }
        
        playlist.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';
            card.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${video.thumbnail || ''}" alt="${video.title}" loading="lazy">
                </div>
                <div class="video-info">
                    <div class="video-title-card">${video.title}</div>
                    <div class="video-meta">Added ${new Date(video.addedAt).toLocaleDateString()}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                this.playVideo(video.id, video.title, video.thumbnail);
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
            <div style="text-align: center; padding: 60px 20px;">
                <div style="width: 80px; height: 80px; margin: 0 auto 24px; position: relative;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <p style="color: var(--danger-color); font-size: 18px; margin-bottom: 16px; font-weight: 600;">${message}</p>
                <button onclick="document.querySelector('[data-page=settings]').click()" 
                        style="background: linear-gradient(135deg, var(--neon-blue), var(--neon-pink)); 
                               color: white; border: none; padding: 12px 28px; border-radius: 12px; 
                               cursor: pointer; font-size: 14px; font-weight: 600; margin-top: 12px;
                               box-shadow: 0 0 20px var(--primary-glow);">
                    Go to Settings
                </button>
            </div>
        `;
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
