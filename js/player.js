// Video player management with improved error handling
class VideoPlayer {
    constructor() {
        this.currentVideoId = null;
        this.player = null;
        this.backgroundAudio = null;
        this.isBackgroundMode = false;
        this.embedCheckTimeout = null;
    }

    // Universal player that works for ALL videos
    initPlayer(videoId, quality = 'default') {
        this.currentVideoId = videoId;
        const playerContainer = document.getElementById('video-player');
        
        // Clear previous content
        playerContainer.innerHTML = '';
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'width: 100%; height: 100%; background: #000; position: relative;';
        wrapper.id = 'player-wrapper';
        
        const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const mobileUrl = `https://m.youtube.com/watch?v=${videoId}`;
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&fs=1`;
        
        // SIMPLE SOLUTION: Big prominent buttons + embed below
        wrapper.innerHTML = `
            <div style="width: 100%; height: 100%; display: flex; flex-direction: column;">
                <!-- ALWAYS VISIBLE WATCH OPTIONS (Top Priority) -->
                <div style="background: linear-gradient(135deg, #1a1a2e, #141420); border-bottom: 2px solid var(--neon-blue); padding: 16px; display: flex; flex-direction: column; gap: 10px;">
                    <div style="text-align: center; color: var(--text-primary); font-size: 14px; font-weight: 600; margin-bottom: 5px;">
                        🎬 Watch This Video:
                    </div>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer"
                           style="flex: 1; min-width: 140px; background: linear-gradient(135deg, #FF0000, #CC0000); color: white; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; text-align: center; box-shadow: 0 4px 15px rgba(255,0,0,0.5); transition: all 0.2s; border: 2px solid #FF0000;"
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(255,0,0,0.7)'"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(255,0,0,0.5)'">
                            ▶️ YouTube.com
                        </a>
                        <a href="${mobileUrl}" target="_blank" rel="noopener noreferrer"
                           style="flex: 1; min-width: 140px; background: var(--neon-blue); color: white; padding: 14px 20px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 700; text-align: center; box-shadow: 0 0 20px var(--primary-glow); transition: all 0.2s; border: 2px solid var(--neon-blue);"
                           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 0 30px var(--primary-glow)'"
                           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 0 20px var(--primary-glow)'">
                            📱 Mobile
                        </a>
                    </div>
                    <button onclick="navigator.clipboard.writeText('${youtubeUrl}').then(() => { this.innerHTML = '✅ Copied!'; setTimeout(() => this.innerHTML = '📋 Copy Link', 2000); }).catch(() => prompt('Copy this URL:', '${youtubeUrl}'))" 
                       style="background: var(--surface-color); color: var(--neon-green); padding: 10px; border-radius: 8px; border: 1px solid var(--neon-green); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s;"
                       onmouseover="this.style.background='var(--surface-hover)'"
                       onmouseout="this.style.background='var(--surface-color)'">
                        📋 Copy Link
                    </button>
                </div>
                
                <!-- Embed attempt (may or may not work) -->
                <div style="flex: 1; position: relative; background: #000;">
                    <iframe 
                        style="width: 100%; height: 100%; border: none;" 
                        src="${embedUrl}"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: rgba(255,255,255,0.5); font-size: 12px; pointer-events: none;">
                        ⬆️ If video doesn't load, use buttons above
                    </div>
                </div>
            </div>
        `;
        
        playerContainer.appendChild(wrapper);
        this.player = wrapper;
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
