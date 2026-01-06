// Progressive Web App functionality
let deferredPrompt;
const installButton = document.getElementById('install-btn');

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Handle PWA install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button
    if (installButton) {
        installButton.style.display = 'block';
    }
});

// Install button click
if (installButton) {
    installButton.addEventListener('click', async () => {
        if (!deferredPrompt) {
            return;
        }
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        // Clear the deferredPrompt
        deferredPrompt = null;
        // Hide the install button
        installButton.style.display = 'none';
    });
}

// Handle app installed
window.addEventListener('appinstalled', () => {
    console.log('FastTube installed successfully!');
    deferredPrompt = null;
});

// Handle online/offline events
window.addEventListener('online', () => {
    console.log('App is online');
    showNotification('Back online!', 'success');
});

window.addEventListener('offline', () => {
    console.log('App is offline');
    showNotification('You are offline. Some features may be limited.', 'warning');
});

// Show notification helper
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 70px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#00ff00' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: black;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
    @keyframes slideUp {
        from {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        to {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Handle visibility change (for background play)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App hidden - background mode');
    } else {
        console.log('App visible');
    }
});

// Prevent page refresh on pull down (improves UX on mobile)
document.body.addEventListener('touchmove', (e) => {
    if (e.touches[0].clientY > 0 && window.scrollY === 0) {
        // Only prevent default at the top of the page
        // This allows pull-to-refresh in specific conditions
    }
}, { passive: true });
