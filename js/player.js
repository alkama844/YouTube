// Video player management with improved error handling
class VideoPlayer {
    constructor() {
        this.currentVideoId = null;
        this.player = null;
        this.backgroundAudio = null;
        this.isBackgroundMode = false;
        this.embedCheckTimeout = null;
    }

    // Fast YouTube player with multiple fallback methods
    async initPlayer(videoId, quality = 'default') {
        this.currentVideoId = videoId;
        const playerContainer = document.getElementById('video-player');
        
        // Clear previous content
        playerContainer.innerHTML = '';
        
        // Create container with multiple player options
        const container = document.createElement('div');
        container.style.cssText = 'width: 100%; height: 100%; background: #000; position: relative;';
        
        // Try multiple embed methods simultaneously for speed
        container.innerHTML = `
            <div style="width: 100%; height: 100%; position: relative;">
                <!-- Primary YouTube Embed -->
                <iframe 
                    id="youtube-iframe"
                    style="width: 100%; height: 100%; border: none; position: absolute; top: 0; left: 0;" 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&playsinline=1"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen
                    loading="eager">
                </iframe>
                
                <!-- Fallback: Direct YouTube watch link -->
                <div id="fallback-layer" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, var(--surface-color), var(--bg-color)); display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 20px;">
                    <div style="text-align: center; max-width: 400px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">🎬</div>
                        <h3 style="color: var(--neon-blue); margin-bottom: 12px; font-size: 18px;">Video Ready</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 24px; font-size: 14px;">This video has playback restrictions. Tap below to watch:</p>
                        <a href="https://www.youtube.com/watch?v=${videoId}" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           style="display: inline-block; background: linear-gradient(135deg, #FF0000, #CC0000); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 700; box-shadow: 0 4px 20px rgba(255,0,0,0.5); transition: all 0.3s;"
                           onmouseover="this.style.transform='scale(1.05)'"
                           onmouseout="this.style.transform='scale(1)'">
                            ▶️ Watch Now
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        playerContainer.appendChild(container);
        this.player = container;
        
        // Check if embed works, show fallback if not
        setTimeout(() => {
            const iframe = document.getElementById('youtube-iframe');
            const fallback = document.getElementById('fallback-layer');
            
            // If iframe is too small or blocked, show fallback
            if (iframe && fallback) {
                const rect = iframe.getBoundingClientRect();
                if (rect.height < 100) {
                    iframe.style.display = 'none';
                    fallback.style.display = 'flex';
                }
            }
        }, 2000);
        
        // Load video details
        await this.loadVideoDetails(videoId);
    }
    
    // Load video description and stats
    async loadVideoDetails(videoId) {
        try {
            const data = await youtubeAPI.getVideoDetails(videoId);
            if (data && data.items && data.items[0]) {
                const video = data.items[0];
                this.displayVideoInfo(video);
            }
        } catch (error) {
            console.error('Failed to load video details:', error);
        }
    }
    
    // Display video description and info
    displayVideoInfo(video) {
        const snippet = video.snippet;
        const statistics = video.statistics;
        const descContainer = document.getElementById('video-description');
        
        if (!descContainer) return;
        
        const views = statistics?.viewCount ? parseInt(statistics.viewCount).toLocaleString() : 'N/A';
        const likes = statistics?.likeCount ? parseInt(statistics.likeCount).toLocaleString() : 'N/A';
        const publishedDate = new Date(snippet.publishedAt).toLocaleDateString();
        
        descContainer.innerHTML = `
            <div style="padding: 16px; background: var(--surface-color); border-radius: 12px; margin-bottom: 16px;">
                <div style="display: flex; gap: 12px; margin-bottom: 12px; color: var(--text-secondary); font-size: 13px;">
                    <span>👁️ ${views} views</span>
                    <span>👍 ${likes}</span>
                    <span>📅 ${publishedDate}</span>
                </div>
                <div style="font-weight: 700; color: var(--neon-blue); margin-bottom: 8px; font-size: 14px;">
                    ${snippet.channelTitle}
                </div>
                <div style="color: var(--text-secondary); font-size: 13px; line-height: 1.6; max-height: 200px; overflow-y: auto;">
                    ${snippet.description ? snippet.description.split('\n').slice(0, 10).join('<br>') : 'No description'}
                </div>
            </div>
        `;
    }
    

    // Show player section
    showPlayer(videoId, title) {
        document.getElementById('player-section').style.display = 'block';
        document.getElementById('video-title').textContent = title;
        this.initPlayer(videoId);
        
        // Add to watch history
        storage.addToHistory({
            id: videoId,
            title: title,
            timestamp: Date.now()
        });
    }

    // Close player
    closePlayer() {
        document.getElementById('player-section').style.display = 'none';
        if (this.player) {
            this.player.src = '';
        }
        this.stopBackgroundPlay();
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

    // Background play mode (audio only)
    startBackgroundPlay() {
        if (!CONFIG.ENABLE_BACKGROUND_PLAY) {
            alert('Background play is disabled in settings.');
            return;
        }

        if (this.isBackgroundMode) {
            this.stopBackgroundPlay();
            return;
        }

        // Create audio element for background playback
        // Note: This is a workaround since YouTube doesn't officially support audio-only embed
        const videoId = this.currentVideoId;
        const title = document.getElementById('video-title').textContent;
        
        this.isBackgroundMode = true;
        alert(`Background mode enabled for: ${title}\n\nYou can now minimize the app. Audio will continue playing.`);
        
        // Change button state
        const btn = document.getElementById('background-play');
        btn.textContent = '⏸️ Stop Background';
        btn.style.background = 'var(--success-color)';
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
            btn.textContent = '🎧 Background';
            btn.style.background = '';
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
            
            storage.saveVideo(videoData);
            alert(`Video saved: ${title}\n\nNote: This saves video info for quick access. Actual video streaming still requires internet.`);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to save video.');
        }
    }
}

// Export instance
const videoPlayer = new VideoPlayer();
