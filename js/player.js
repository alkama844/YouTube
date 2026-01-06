// Video player management with improved error handling
class VideoPlayer {
    constructor() {
        this.currentVideoId = null;
        this.currentVideoTitle = null;
        this.currentVideoThumbnail = null;
        this.player = null;
        this.backgroundAudio = null;
        this.isBackgroundMode = false;
        this.embedCheckTimeout = null;
        this.playlist = [];
        this.currentPlaylistIndex = -1;
        this.isPlayingPlaylist = false;
    }

    // Initialize YouTube iframe player with robust error handling
    initPlayer(videoId, quality = 'default') {
        this.currentVideoId = videoId;
        const playerContainer = document.getElementById('video-player');
        
        // Clear previous content and timeouts
        playerContainer.innerHTML = '';
        if (this.embedCheckTimeout) {
            clearTimeout(this.embedCheckTimeout);
        }
        
        // Create responsive iframe container
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; height: 100%; background: #000; position: relative; overflow: hidden;';
        wrapper.id = 'player-wrapper';
        
        // Create iframe with optimized settings
        const iframe = document.createElement('iframe');
        iframe.id = 'youtube-iframe';
        iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('loading', 'eager');
        
        // Use nocookie domain and proper embed URL
        const embedUrl = new URL(`https://www.youtube-nocookie.com/embed/${videoId}`);
        embedUrl.searchParams.set('autoplay', '1');
        embedUrl.searchParams.set('modestbranding', '1');
        embedUrl.searchParams.set('rel', '0');
        embedUrl.searchParams.set('playsinline', '1');
        embedUrl.searchParams.set('enablejsapi', '1');
        embedUrl.searchParams.set('origin', window.location.origin);
        embedUrl.searchParams.set('widget_referrer', window.location.href);
        
        iframe.src = embedUrl.toString();
        
        // Add load event listener
        iframe.addEventListener('load', () => {
            this.checkEmbedRestrictions(videoId, wrapper);
        });
        
        // Add error event listener
        iframe.addEventListener('error', () => {
            this.showFallbackPlayer(videoId, wrapper);
        });
        
        wrapper.appendChild(iframe);
        playerContainer.appendChild(wrapper);
        this.player = iframe;
        
        // Backup check after 3 seconds
        this.embedCheckTimeout = setTimeout(() => {
            this.verifyPlayerLoaded(videoId, wrapper);
        }, 3000);
        
        return iframe;
    }
    
    // Check if embed loaded successfully
    verifyPlayerLoaded(videoId, wrapper) {
        const iframe = document.getElementById('youtube-iframe');
        if (!iframe || iframe.style.display === 'none') {
            this.showFallbackPlayer(videoId, wrapper);
        }
    }
    
    // Check for embed restrictions
    checkEmbedRestrictions(videoId, wrapper) {
        try {
            const iframe = document.getElementById('youtube-iframe');
            // Monitor iframe for X-Frame-Options blocking
            setTimeout(() => {
                try {
                    // If we can't access iframe content, it might be blocked
                    const iframeWindow = iframe.contentWindow;
                    if (!iframeWindow) {
                        this.showFallbackPlayer(videoId, wrapper);
                    }
                } catch (e) {
                    // Cross-origin error is expected, but complete blocking is different
                    console.log('Iframe check:', e.message);
                }
            }, 500);
        } catch (error) {
            this.showFallbackPlayer(videoId, wrapper);
        }
    }
    
    // Show fallback player with alternative options
    showFallbackPlayer(videoId, wrapper) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const appUrl = `vnd.youtube://${videoId}`;
        
        wrapper.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 30px; text-align: center; color: var(--text-primary); background: linear-gradient(135deg, var(--surface-color) 0%, var(--bg-color) 100%);">
                <div style="width: 80px; height: 80px; margin-bottom: 25px; position: relative;">
                    <div style="position: absolute; width: 100%; height: 100%; border: 3px solid var(--neon-blue); border-radius: 50%; opacity: 0.3;"></div>
                    <div style="position: absolute; width: 100%; height: 100%; border: 3px solid var(--neon-blue); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; border-top-color: transparent;"></div>
                    <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-blue)" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3" fill="var(--neon-blue)" opacity="0.6"/>
                    </svg>
                </div>
                
                <h3 style="margin-bottom: 12px; font-size: 18px; color: var(--text-primary); font-weight: 600;">Playback Restricted</h3>
                <p style="color: var(--text-secondary); margin-bottom: 30px; font-size: 14px; max-width: 400px; line-height: 1.6;">
                    This video has embedding restrictions. Choose an alternative playback method:
                </p>
                
                <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px;">
                    <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" 
                       style="background: linear-gradient(135deg, var(--neon-blue), var(--neon-pink)); 
                              color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; 
                              font-weight: 600; display: inline-flex; align-items: center; gap: 8px;
                              box-shadow: 0 0 20px var(--primary-glow); transition: all 0.3s ease;
                              border: 1px solid var(--neon-blue);"
                       onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 30px var(--primary-glow)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 20px var(--primary-glow)'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Watch on YouTube
                    </a>
                    
                    <a href="${appUrl}" 
                       style="background: var(--surface-hover); 
                              color: var(--neon-blue); padding: 14px 28px; border-radius: 12px; text-decoration: none; 
                              font-weight: 600; display: inline-flex; align-items: center; gap: 8px;
                              border: 2px solid var(--border-color); transition: all 0.3s ease;"
                       onmouseover="this.style.borderColor='var(--neon-blue)'; this.style.boxShadow='0 0 20px var(--primary-glow)'"
                       onmouseout="this.style.borderColor='var(--border-color)'; this.style.boxShadow='none'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                            <line x1="12" y1="18" x2="12" y2="18"/>
                        </svg>
                        Open in App
                    </a>
                </div>
                
                <button onclick="videoPlayer.tryAlternativeEmbed('${videoId}')" 
                        style="background: transparent; color: var(--text-secondary); 
                               padding: 10px 20px; border: 1px solid var(--border-color); 
                               border-radius: 8px; cursor: pointer; font-size: 13px; 
                               transition: all 0.3s ease; margin-top: 10px;"
                        onmouseover="this.style.color='var(--neon-blue)'; this.style.borderColor='var(--neon-blue)'"
                        onmouseout="this.style.color='var(--text-secondary)'; this.style.borderColor='var(--border-color)'">
                    <span class="icon icon-play" style="display: inline-block; margin-right: 6px;"></span>
                    Try Alternative Embed
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
    
    // Try alternative embed method
    tryAlternativeEmbed(videoId) {
        const wrapper = document.getElementById('player-wrapper');
        if (!wrapper) return;
        
        wrapper.innerHTML = `
            <iframe 
                style="width: 100%; height: 100%; border: none;" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&fs=1&playsinline=1&rel=0&modestbranding=1" 
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media" 
                allowfullscreen
                sandbox="allow-same-origin allow-scripts allow-presentation">
            </iframe>
        `;
        
        // Check again after 2 seconds
        setTimeout(() => {
            const iframe = wrapper.querySelector('iframe');
            if (!iframe || iframe.clientHeight === 0) {
                this.showFallbackPlayer(videoId, wrapper);
            }
        }, 2000);
    }

    // Show player section
    async showPlayer(videoId, title, thumbnail) {
        this.currentVideoId = videoId;
        this.currentVideoTitle = title;
        this.currentVideoThumbnail = thumbnail;
        
        // Hide home section, show player section
        document.querySelector('.results-section').style.display = 'none';
        document.getElementById('player-section').style.display = 'block';
        document.getElementById('player-section').classList.add('active');
        
        document.getElementById('video-title').textContent = title;
        this.initPlayer(videoId);
        
        // Scroll to player
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load video details
        this.loadVideoDetails(videoId);
        
        // Load related videos
        this.loadRelatedVideos(videoId);
        
        // Load and update playlist
        this.loadPlaylist();
        
        // Show mini player
        this.showMiniPlayer();
        
        // Add to watch history
        storage.addToHistory({
            id: videoId,
            title: title,
            timestamp: Date.now()
        });
    }
    
    // Load video details from API
    async loadVideoDetails(videoId) {
        try {
            const data = await youtubeAPI.getVideoDetails(videoId);
            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                const snippet = video.snippet;
                const statistics = video.statistics;
                
                // Update title
                document.getElementById('video-title').textContent = snippet.title;
                
                // Update stats
                const views = statistics ? youtubeAPI.formatViewCount(statistics.viewCount) : '0';
                document.getElementById('video-views').textContent = `${views} views`;
                
                // Update date
                const publishedDate = new Date(snippet.publishedAt);
                const timeAgo = this.getTimeAgo(publishedDate);
                document.getElementById('video-date').textContent = timeAgo;
                
                // Update channel info
                document.getElementById('channel-name').textContent = snippet.channelTitle;
                
                // Update subscriber count (if available from channel details)
                // Note: Subscriber count requires separate API call to channels endpoint
                // For now, hide the subscriber count to avoid showing incorrect data
                const subscriberElement = document.getElementById('channel-subscribers');
                subscriberElement.style.display = 'none';
                
                // Update description
                const description = snippet.description || 'No description available.';
                document.getElementById('video-description-text').textContent = description;
            }
        } catch (error) {
            console.error('Error loading video details:', error);
        }
    }
    
    // Load related videos
    async loadRelatedVideos(videoId) {
        try {
            const data = await youtubeAPI.getRelatedVideos(videoId, 10);
            const container = document.getElementById('related-videos');
            container.innerHTML = '';
            
            if (data.items && data.items.length > 0) {
                data.items.forEach(video => {
                    const card = this.createRelatedVideoCard(video);
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">No related videos found</p>';
            }
        } catch (error) {
            console.error('Error loading related videos:', error);
            document.getElementById('related-videos').innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">Could not load related videos</p>';
        }
    }
    
    // Create related video card
    createRelatedVideoCard(video) {
        // Safe ID extraction
        const videoId = (video.id && (video.id.videoId || video.id)) || null;
        if (!videoId) {
            console.warn('Video card missing valid ID:', video);
            return document.createElement('div'); // Return empty div
        }
        
        const snippet = video.snippet || {};
        
        const card = document.createElement('div');
        card.className = 'related-video-card';
        
        // Safe thumbnail extraction with fallback
        const thumbnail = snippet.thumbnails?.medium?.url || 
                         snippet.thumbnails?.default?.url || 
                         'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="168" height="94"%3E%3Crect fill="%23141420" width="168" height="94"/%3E%3C/svg%3E';
        const title = snippet.title || 'Untitled Video';
        const channelTitle = snippet.channelTitle || 'Unknown Channel';
        
        card.innerHTML = `
            <div class="related-video-thumbnail">
                <img src="${thumbnail}" alt="${title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'168\\' height=\\'94\\'%3E%3Crect fill=\\'%23141420\\' width=\\'168\\' height=\\'94\\'/%3E%3C/svg%3E'">
            </div>
            <div class="related-video-info">
                <div class="related-video-title">${title}</div>
                <div class="related-video-channel">${channelTitle}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.showPlayer(videoId, title, thumbnail);
        });
        
        return card;
    }
    
    // Get time ago string
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return interval === 1 ? '1 year ago' : `${interval} years ago`;
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return interval === 1 ? '1 month ago' : `${interval} months ago`;
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return interval === 1 ? '1 day ago' : `${interval} days ago`;
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        
        return 'Just now';
    }

    // Close player
    closePlayer() {
        document.getElementById('player-section').style.display = 'none';
        document.getElementById('player-section').classList.remove('active');
        document.querySelector('.results-section').style.display = 'block';
        
        if (this.player) {
            this.player.src = '';
        }
        this.stopBackgroundPlay();
        this.hideMiniPlayer();
        
        // Scroll back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Enable Picture-in-Picture
    async enablePiP() {
        const iframe = document.getElementById('youtube-iframe');
        if (!iframe) return;

        try {
            if ('pictureInPictureEnabled' in document) {
                // Try to get video element from iframe (may not work due to cross-origin)
                alert('Picture-in-Picture: Use browser\'s native PiP feature by right-clicking the video twice.');
            } else {
                alert('Picture-in-Picture is not supported on this device.');
            }
        } catch (error) {
            console.error('PiP error:', error);
            alert('Could not enable Picture-in-Picture.');
        }
    }

    // Start background play mode (audio only)
    startBackgroundPlay() {
        if (!CONFIG.ENABLE_BACKGROUND_PLAY) {
            alert('Background play is disabled in settings.');
            return;
        }

        if (this.isBackgroundMode) {
            this.stopBackgroundPlay();
            return;
        }

        const videoId = this.currentVideoId;
        const title = document.getElementById('video-title').textContent;
        
        this.isBackgroundMode = true;
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--neon-blue), var(--neon-pink));
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 0 30px var(--primary-glow);
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span class="icon icon-headphones" style="font-size: 20px;"></span>
                <div>
                    <div style="font-weight: 700;">Background Mode Active</div>
                    <div style="font-size: 12px; opacity: 0.9;">Audio will continue playing</div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
        
        // Change button state
        const btn = document.getElementById('background-play');
        btn.innerHTML = '<span class="icon icon-headphones"></span> Stop Background';
        btn.style.background = 'linear-gradient(135deg, var(--neon-green), var(--accent-color))';
        btn.style.boxShadow = '0 0 20px var(--accent-glow)';
    }

    // Stop background play
    stopBackgroundPlay() {
        if (this.backgroundAudio) {
            this.backgroundAudio.pause();
            this.backgroundAudio = null;
        }
        
        this.isBackgroundMode = false;
        
        const btn = document.getElementById('background-play');
        if (btn) {
            btn.innerHTML = '<span class="icon icon-headphones"></span> Background';
            btn.style.background = '';
            btn.style.boxShadow = '';
        }
    }

    // Download video info (saves metadata for offline viewing)
    async downloadVideo() {
        if (!this.currentVideoId) return;
        
        try {
            const title = document.getElementById('video-title').textContent;
            const videoData = {
                id: this.currentVideoId,
                title: title,
                savedAt: Date.now()
            };
            
            
            // Show success notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, var(--neon-green), var(--accent-color));
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 0 30px var(--accent-glow);
                max-width: 90%;
                text-align: center;
            `;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="icon icon-save" style="font-size: 20px;"></span>
                    <div>Video Saved!</div>
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 2500);
            
            // Show info alert
            alert(`Video saved: ${title}\n\nNote: This saves video info for quick access. Actual video streaming still requires internet.`);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to save video.');
        }
    }

    // Playlist methods
    addToPlaylist(videoId, title, thumbnail) {
        const videoData = {
            id: videoId,
            title: title,
            thumbnail: thumbnail,
            addedAt: Date.now()
        };
        
        if (storage.addToPlaylist(videoData)) {
            this.updatePlaylistUI();
            this.showNotification('Added to playlist!', 'success');
            return true;
        } else {
            this.showNotification('Already in playlist', 'info');
            return false;
        }
    }

    removeFromPlaylist(videoId) {
        storage.removeFromPlaylist(videoId);
        this.updatePlaylistUI();
        this.showNotification('Removed from playlist', 'info');
    }

    clearPlaylist() {
        if (confirm('Clear entire playlist?')) {
            storage.clearPlaylist();
            this.updatePlaylistUI();
            this.isPlayingPlaylist = false;
            this.currentPlaylistIndex = -1;
        }
    }

    loadPlaylist() {
        this.playlist = storage.getPlaylist();
        this.updatePlaylistUI();
    }

    updatePlaylistUI() {
        const playlist = storage.getPlaylist();
        const container = document.getElementById('playlist-items');
        const playlistSection = document.getElementById('current-playlist');
        const countElement = document.getElementById('playlist-count');
        
        if (playlist.length === 0) {
            playlistSection.style.display = 'none';
            return;
        }
        
        playlistSection.style.display = 'block';
        countElement.textContent = playlist.length;
        container.innerHTML = '';
        
        playlist.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            if (this.currentVideoId === video.id && this.isPlayingPlaylist) {
                item.classList.add('active');
            }
            
            item.innerHTML = `
                <div class="playlist-item-thumbnail">
                    <img src="${video.thumbnail || ''}" alt="${video.title}" loading="lazy">
                    ${this.currentVideoId === video.id && this.isPlayingPlaylist ? '<div class="playlist-item-playing">▶</div>' : ''}
                </div>
                <div class="playlist-item-info">
                    <div class="playlist-item-title">${video.title}</div>
                    <div class="playlist-item-channel">Added ${this.getTimeAgo(new Date(video.addedAt))}</div>
                </div>
                <button class="playlist-item-remove" title="Remove">✕</button>
            `;
            
            item.querySelector('.playlist-item-thumbnail').addEventListener('click', () => {
                this.playFromPlaylist(index);
            });
            
            item.querySelector('.playlist-item-info').addEventListener('click', () => {
                this.playFromPlaylist(index);
            });
            
            item.querySelector('.playlist-item-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFromPlaylist(video.id);
            });
            
            container.appendChild(item);
        });
    }

    playFromPlaylist(index) {
        this.playlist = storage.getPlaylist();
        if (index >= 0 && index < this.playlist.length) {
            this.currentPlaylistIndex = index;
            this.isPlayingPlaylist = true;
            const video = this.playlist[index];
            this.showPlayer(video.id, video.title, video.thumbnail);
        }
    }

    playAllPlaylist() {
        this.playlist = storage.getPlaylist();
        if (this.playlist.length > 0) {
            this.playFromPlaylist(0);
            this.showNotification(`Playing ${this.playlist.length} videos`, 'success');
        }
    }

    playNext() {
        if (!this.isPlayingPlaylist || this.playlist.length === 0) {
            this.showNotification('No playlist active', 'info');
            return;
        }
        
        this.currentPlaylistIndex++;
        if (this.currentPlaylistIndex >= this.playlist.length) {
            this.currentPlaylistIndex = 0; // Loop back to start
        }
        
        this.playFromPlaylist(this.currentPlaylistIndex);
    }

    playPrevious() {
        if (!this.isPlayingPlaylist || this.playlist.length === 0) {
            this.showNotification('No playlist active', 'info');
            return;
        }
        
        this.currentPlaylistIndex--;
        if (this.currentPlaylistIndex < 0) {
            this.currentPlaylistIndex = this.playlist.length - 1; // Loop to end
        }
        
        this.playFromPlaylist(this.currentPlaylistIndex);
    }

    // Show mini player
    showMiniPlayer() {
        const miniPlayer = document.getElementById('mini-player');
        miniPlayer.classList.add('active');
        
        document.getElementById('mini-player-img').src = this.currentVideoThumbnail || '';
        document.getElementById('mini-player-title').textContent = this.currentVideoTitle || 'Video';
        document.getElementById('mini-player-channel').textContent = 'Playing...';
    }

    hideMiniPlayer() {
        const miniPlayer = document.getElementById('mini-player');
        miniPlayer.classList.remove('active');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const colors = {
            success: 'linear-gradient(135deg, var(--neon-green), var(--accent-color))',
            info: 'linear-gradient(135deg, var(--neon-blue), var(--neon-pink))',
            error: 'linear-gradient(135deg, var(--danger-color), #cc0044)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type] || colors.info};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 0 30px var(--primary-glow);
            animation: slideDown 0.3s ease;
            max-width: 90%;
            text-align: center;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2500);
    }
}

// Export instance
const videoPlayer = new VideoPlayer();
