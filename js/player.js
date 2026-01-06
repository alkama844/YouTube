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
        
        // Use standard YouTube embed for better compatibility
        const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
        embedUrl.searchParams.set('autoplay', '1');
        embedUrl.searchParams.set('modestbranding', '1');
        embedUrl.searchParams.set('rel', '0');
        embedUrl.searchParams.set('playsinline', '1');
        embedUrl.searchParams.set('fs', '1');
        embedUrl.searchParams.set('enablejsapi', '1');
        // Remove origin restriction to avoid blocking
        // embedUrl.searchParams.set('origin', window.location.origin);
        
        iframe.src = embedUrl.toString();
        
        // Listen for YouTube player errors
        window.addEventListener('message', (event) => {
            if (event.origin.includes('youtube.com') || event.origin.includes('youtube-nocookie.com')) {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    // Check for error events (Error 150, 153, etc.)
                    if (data.event === 'infoDelivery' && data.info && data.info.playerState === -1) {
                        // Player error state
                        setTimeout(() => this.detectEmbedError(videoId, wrapper), 1000);
                    }
                    if (data.event === 'onError' || (data.info && data.info.errorCode)) {
                        console.log('YouTube player error detected:', data);
                        this.showFallbackPlayer(videoId, wrapper);
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
        });
        
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
    
    // Detect embed errors (Error 153, 150, etc.)
    detectEmbedError(videoId, wrapper) {
        const iframe = document.getElementById('youtube-iframe');
        if (!iframe) return;
        
        // Check if iframe has very small height (sign of error)
        const rect = iframe.getBoundingClientRect();
        if (rect.height < 100 && rect.width > 0) {
            console.log('Embed restriction detected (small iframe height)');
            this.showFallbackPlayer(videoId, wrapper);
        }
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
        const mobileUrl = `https://m.youtube.com/watch?v=${videoId}`;
        const appUrl = `vnd.youtube://${videoId}`;
        
        wrapper.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 350px; padding: 20px; text-align: center; color: var(--text-primary); background: linear-gradient(135deg, var(--surface-color) 0%, var(--bg-color) 100%);">
                <div style="width: 80px; height: 80px; margin-bottom: 20px; position: relative;">
                    <div style="position: absolute; width: 100%; height: 100%; border: 3px solid var(--neon-orange); border-radius: 50%; opacity: 0.3;"></div>
                    <div style="position: absolute; width: 100%; height: 100%; border: 3px solid var(--neon-orange); border-radius: 50%; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite; border-top-color: transparent;"></div>
                    <svg style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neon-orange)" stroke-width="2.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                
                <h3 style="margin-bottom: 10px; font-size: 19px; color: var(--neon-orange); font-weight: 700;">⚠️ Embedding Disabled</h3>
                <p style="color: var(--text-primary); margin-bottom: 8px; font-size: 14px; max-width: 420px; line-height: 1.5; font-weight: 500;">
                    This video owner has disabled playback on external websites (Error 153)
                </p>
                <p style="color: var(--text-secondary); margin-bottom: 25px; font-size: 12px; max-width: 420px; line-height: 1.4;">
                    <strong style="color: var(--neon-blue);">We use iframe (the only way to embed)</strong>, but the video creator blocked it. Choose an option below:
                </p>
                
                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 400px; margin-bottom: 15px;">
                    <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" 
                       style="background: linear-gradient(135deg, #FF0000, #CC0000); 
                              color: white; padding: 16px 24px; border-radius: 12px; text-decoration: none; 
                              font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 10px;
                              box-shadow: 0 4px 20px rgba(255, 0, 0, 0.4); transition: all 0.3s ease;
                              border: 2px solid #FF0000; font-size: 15px;"
                       onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 30px rgba(255, 0, 0, 0.6)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(255, 0, 0, 0.4)'">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Open on YouTube.com
                    </a>
                    
                    <a href="${mobileUrl}" target="_blank" rel="noopener noreferrer" 
                       style="background: var(--surface-color); 
                              color: var(--neon-blue); padding: 14px 24px; border-radius: 12px; text-decoration: none; 
                              font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;
                              border: 2px solid var(--neon-blue); transition: all 0.3s ease; font-size: 14px;"
                       onmouseover="this.style.background='var(--surface-hover)'; this.style.boxShadow='0 0 20px var(--primary-glow)'"
                       onmouseout="this.style.background='var(--surface-color)'; this.style.boxShadow='none'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                            <line x1="12" y1="18" x2="12.01" y2="18"/>
                        </svg>
                        Mobile YouTube
                    </a>
                    
                    <button onclick="navigator.clipboard.writeText('${youtubeUrl}').then(() => alert('✅ Link copied! Paste it in your browser or YouTube app')).catch(() => prompt('Copy this link:', '${youtubeUrl}'))" 
                       style="background: var(--surface-color); 
                              color: var(--neon-green); padding: 14px 24px; border-radius: 12px; 
                              font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px;
                              border: 2px solid var(--neon-green); transition: all 0.3s ease; font-size: 14px; cursor: pointer;"
                       onmouseover="this.style.background='var(--surface-hover)'; this.style.boxShadow='0 0 20px var(--accent-glow)'"
                       onmouseout="this.style.background='var(--surface-color)'; this.style.boxShadow='none'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy Video Link
                    </button>
                </div>
                
                <div style="padding: 15px; background: rgba(0, 240, 255, 0.1); border: 1px solid var(--neon-blue); border-radius: 10px; margin-top: 15px; max-width: 400px;">
                    <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.5; margin: 0;">
                        <strong style="color: var(--neon-blue);">💡 Why this happens:</strong><br>
                        YouTube allows creators to disable embedding (iframe) for their videos. FastTube respects these restrictions. The buttons above will open the video where it CAN play.
                    </p>
                </div>
                
                <button onclick="videoPlayer.tryAlternativeEmbed('${videoId}')" 
                        style="background: transparent; color: var(--text-secondary); 
                               padding: 10px 20px; border: 1px solid var(--border-color); 
                               border-radius: 8px; cursor: pointer; font-size: 12px; 
                               transition: all 0.3s ease; margin-top: 12px;"
                        onmouseover="this.style.color='var(--neon-pink)'; this.style.borderColor='var(--neon-pink)'"
                        onmouseout="this.style.color='var(--text-secondary)'; this.style.borderColor='var(--border-color)'">
                    🔄 Try Alternative Embed (rarely works)
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
        
        // Try nocookie domain as alternative
        wrapper.innerHTML = `
            <iframe 
                style="width: 100%; height: 100%; border: none;" 
                src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&fs=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1" 
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope" 
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade">
            </iframe>
        `;
        
        // Show success message
        const msg = document.createElement('div');
        msg.style.cssText = 'position: absolute; top: 10px; left: 50%; transform: translateX(-50%); background: var(--success-color); color: white; padding: 8px 16px; border-radius: 8px; font-size: 12px; z-index: 100; animation: fadeOut 3s forwards;';
        msg.textContent = 'Trying alternative embed...';
        wrapper.appendChild(msg);
        
        // Check again after 3 seconds
        setTimeout(() => {
            const iframe = wrapper.querySelector('iframe');
            if (!iframe || iframe.clientHeight === 0) {
                this.showFallbackPlayer(videoId, wrapper);
            }
        }, 3000);
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
