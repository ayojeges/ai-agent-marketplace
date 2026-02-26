// Analytics and Monitoring for AI Agent Marketplace
class AnalyticsTracker {
    constructor() {
        this.initializeAnalytics();
        this.trackPageView();
        this.setupEventTracking();
    }
    
    initializeAnalytics() {
        // Google Analytics (placeholder - replace with actual ID)
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-XXXXXXXXXX', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
        
        // Plausible Analytics (self-hosted alternative)
        if (typeof plausible !== 'undefined') {
            plausible('pageview');
        }
        
        // Initialize error tracking
        this.setupErrorTracking();
    }
    
    trackPageView() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language
        };
        
        // Send to backend
        this.sendToBackend('/api/analytics/pageview', pageData);
        
        // Log locally
        console.log('Page view:', pageData);
    }
    
    trackEvent(category, action, label = '', value = 0) {
        const eventData = {
            category,
            action,
            label,
            value,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
        
        // Send to backend
        this.sendToBackend('/api/analytics/event', eventData);
        
        console.log('Event tracked:', eventData);
    }
    
    trackPurchase(productId, price, currency = 'USD') {
        const purchaseData = {
            productId,
            price,
            currency,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId(),
            userId: this.getUserId()
        };
        
        this.trackEvent('purchase', 'completed', productId, price);
        this.sendToBackend('/api/analytics/purchase', purchaseData);
        
        console.log('Purchase tracked:', purchaseData);
    }
    
    trackError(error, context = {}) {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Send to error tracking service (Sentry/LogRocket)
        this.sendToBackend('/api/analytics/error', errorData);
        
        // Log to console
        console.error('Error tracked:', errorData);
    }
    
    setupEventTracking() {
        // Track button clicks
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                const buttonText = button.textContent.trim();
                const buttonId = button.id || button.getAttribute('data-id') || 'unknown';
                
                this.trackEvent('ui', 'button_click', `${buttonId}: ${buttonText}`);
            }
        });
        
        // Track form interactions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || form.getAttribute('data-id') || 'unknown';
            this.trackEvent('forms', 'submit', formId);
        });
        
        // Track agent card views (intersection observer)
        this.trackCardViews();
        
        // Track time on page
        this.trackTimeOnPage();
    }
    
    trackCardViews() {
        const cards = document.querySelectorAll('.agent-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const title = card.querySelector('h3')?.textContent || 'unknown';
                    this.trackEvent('content', 'card_view', title);
                    observer.unobserve(card);
                }
            });
        }, { threshold: 0.5 });
        
        cards.forEach(card => observer.observe(card));
    }
    
    trackTimeOnPage() {
        let startTime = Date.now();
        
        // Track every 30 seconds
        setInterval(() => {
            const timeSpent = Math.floor((Date.now() - startTime) / 1000);
            if (timeSpent % 30 === 0) {
                this.trackEvent('engagement', 'time_spent', `${timeSpent} seconds`, timeSpent);
            }
        }, 1000);
        
        // Track on page hide (tab switch)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                this.trackEvent('engagement', 'session_pause', `${timeSpent} seconds`, timeSpent);
            } else {
                startTime = Date.now();
                this.trackEvent('engagement', 'session_resume');
            }
        });
    }
    
    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.trackError(event.error, {
                type: 'window_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(event.reason, {
                type: 'unhandled_rejection'
            });
        });
        
        // Console error tracking
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.trackError(new Error(args.join(' ')), {
                type: 'console_error',
                args: args
            });
            originalConsoleError.apply(console, args);
        };
    }
    
    sendToBackend(endpoint, data) {
        // Use navigator.sendBeacon for reliable delivery
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon(endpoint, blob);
        } else {
            // Fallback to fetch
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                keepalive: true
            }).catch(err => console.warn('Analytics send failed:', err));
        }
    }
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
        return sessionId;
    }
    
    getUserId() {
        let userId = localStorage.getItem('analytics_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analytics_user_id', userId);
        }
        return userId;
    }
    
    // Performance monitoring
    trackPerformance() {
        if ('performance' in window) {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                const metrics = {
                    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                    tcp: perfData.connectEnd - perfData.connectStart,
                    ttfb: perfData.responseStart - perfData.requestStart,
                    download: perfData.responseEnd - perfData.responseStart,
                    domInteractive: perfData.domInteractive,
                    domComplete: perfData.domComplete,
                    loadEventEnd: perfData.loadEventEnd
                };
                
                this.trackEvent('performance', 'page_load', JSON.stringify(metrics));
                this.sendToBackend('/api/analytics/performance', metrics);
            }
        }
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analytics = new AnalyticsTracker();
    
    // Track performance after page load
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.analytics.trackPerformance();
        }, 1000);
    });
    
    // Track purchase events (integrate with Stripe)
    window.addEventListener('stripe:purchase', (e) => {
        const { productId, price } = e.detail;
        window.analytics.trackPurchase(productId, price);
    });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsTracker;
}