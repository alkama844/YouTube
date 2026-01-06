// YouTube API integration module
class YouTubeAPI {
    constructor() {
        this.apiKey = CONFIG.API_KEY;
        this.baseURL = CONFIG.YOUTUBE_API_BASE;
        this.cache = new Map();
    }

    // Build API URL with parameters
    buildURL(endpoint, params) {
        const url = new URL(`${this.baseURL}/${endpoint}`);
        params.key = this.apiKey;
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.toString();
    }

    // Generic fetch with caching
    async fetchWithCache(url, cacheDuration = CONFIG.CACHE_DURATION) {
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < cacheDuration) {
            return cached.data;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            this.cache.set(url, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    // Search videos (removed embeddable restriction to get more results)
    async searchVideos(query, maxResults = CONFIG.DEFAULT_MAX_RESULTS, pageToken = null) {
        const url = this.buildURL('search', {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: maxResults,
            pageToken: pageToken,
            regionCode: CONFIG.DEFAULT_REGION
            // Removed videoEmbeddable: 'true' to allow all videos
        });
        
        return await this.fetchWithCache(url);
    }

    // Get trending videos
    async getTrendingVideos(maxResults = CONFIG.DEFAULT_MAX_RESULTS, pageToken = null) {
        const url = this.buildURL('videos', {
            part: 'snippet,contentDetails,statistics',
            chart: 'mostPopular',
            maxResults: maxResults,
            pageToken: pageToken,
            regionCode: CONFIG.DEFAULT_REGION
        });
        
        return await this.fetchWithCache(url);
    }

    // Get video details
    async getVideoDetails(videoId) {
        const url = this.buildURL('videos', {
            part: 'snippet,contentDetails,statistics',
            id: videoId
        });
        
        return await this.fetchWithCache(url);
    }

    // Search by category/filter
    async searchByCategory(category, maxResults = CONFIG.DEFAULT_MAX_RESULTS) {
        const categoryQueries = {
            music: 'music official video',
            gaming: 'gaming gameplay',
            news: 'news today',
            trending: ''
        };
        
        if (category === 'trending') {
            return await this.getTrendingVideos(maxResults);
        }
        
        const query = categoryQueries[category] || category;
        return await this.searchVideos(query, maxResults);
    }

    // Get related videos (removed embeddable restriction)
    async getRelatedVideos(videoId, maxResults = 10) {
        const url = this.buildURL('search', {
            part: 'snippet',
            relatedToVideoId: videoId,
            type: 'video',
            maxResults: maxResults
            // Removed videoEmbeddable: 'true' to allow all videos
        });
        
        return await this.fetchWithCache(url);
    }

    // Format duration (PT1H2M10S => 1:02:10)
    formatDuration(duration) {
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return '0:00';
        
        const hours = (match[1] || '').replace('H', '');
        const minutes = (match[2] || '0M').replace('M', '');
        const seconds = (match[3] || '0S').replace('S', '');
        
        const parts = [];
        if (hours) parts.push(hours);
        parts.push(minutes.padStart(2, '0'));
        parts.push(seconds.padStart(2, '0'));
        
        return parts.join(':');
    }

    // Format view count
    formatViewCount(count) {
        const num = parseInt(count);
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

// Export instance
const youtubeAPI = new YouTubeAPI();
