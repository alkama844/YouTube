// Configuration file for YouTube API - Obfuscated for security
const CONFIG = (() => {
    // Obfuscated API key storage (hardcoded default)
    const _0x4e2a = 'QUl6YVN5RGNBaDNvX2s4QWdLVEE0R2VlSmNwdXQ2MlloRDlwR2Nj';
    const _decode = (str) => {
        try {
            return atob(str);
        } catch (e) {
            console.error('Failed to decode API key');
            return '';
        }
    };
    
    // Check for custom API key first, then use hardcoded
    const customKey = localStorage.getItem('youtube_api_key_custom');
    const defaultKey = _decode(_0x4e2a);
    
    return {
        // Use custom key if available, otherwise use hardcoded default
        API_KEY: customKey || defaultKey,
        
        // API endpoints
        YOUTUBE_API_BASE: 'https://www.googleapis.com/youtube/v3',
        
        // Default settings
        DEFAULT_REGION: 'US',
        DEFAULT_MAX_RESULTS: 20,
        DEFAULT_VIDEO_QUALITY: 'medium',
        
        // Cache settings
        CACHE_DURATION: 3600000, // 1 hour in milliseconds
        
        // Feature flags
        ENABLE_BACKGROUND_PLAY: true,
        ENABLE_OFFLINE_MODE: true,
        ENABLE_PICTURE_IN_PICTURE: true,
        ENABLE_QUALITY_SELECTOR: true,
        ENABLE_SPEED_CONTROL: true,
        ENABLE_PLAYLISTS: true,
        ENABLE_THEMES: true
    };
})();

console.log('CONFIG loaded, API key present:', !!CONFIG.API_KEY);

// Save API key to localStorage if available
function saveAPIKey(apiKey) {
    localStorage.setItem('youtube_api_key', apiKey);
    CONFIG.API_KEY = apiKey;
}

// Load API key from localStorage
function loadAPIKey() {
    const savedKey = localStorage.getItem('youtube_api_key');
    if (savedKey) {
        CONFIG.API_KEY = savedKey;
    }
    return CONFIG.API_KEY;
}

// Initialize config
loadAPIKey();
