// Configuration file for YouTube API
const CONFIG = {
    // You need to get your own YouTube Data API v3 key from:
    // https://console.developers.google.com/
    API_KEY: 'YOUR_YOUTUBE_API_KEY_HERE',
    
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
    ENABLE_PICTURE_IN_PICTURE: true
};

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
