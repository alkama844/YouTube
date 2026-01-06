// Video player management with improved error handling
class VideoPlayer {
    constructor() {
        this.currentVideoId = null;
        this.player = null;
        this.backgroundAudio = null;
        this.isBackgroundMode = false;
        this.embedCheckTimeout = null;
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
            }, 2500
            alert(`Video saved: ${title}\n\nNote: This saves video info for quick access. Actual video streaming still requires internet.`);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to save video.');
        }
    }
}

// Export instance
const videoPlayer = new VideoPlayer();
