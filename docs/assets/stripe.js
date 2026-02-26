// Stripe Integration for AI Agent Marketplace
class StripeIntegration {
    constructor() {
        this.stripe = null;
        this.initializeStripe();
        this.setupEventListeners();
    }
    
    async initializeStripe() {
        // Load Stripe.js
        if (typeof Stripe === 'undefined') {
            await this.loadScript('https://js.stripe.com/v3/');
        }
        
        // Initialize with publishable key (test mode)
        // Get your key from: https://dashboard.stripe.com/test/apikeys
        this.stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');
        
        console.log('Stripe initialized in test mode');
    }
    
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    setupEventListeners() {
        // Override buyAgent function
        window.buyAgent = async (productId) => {
            await this.handlePurchase(productId);
        };
        
        // Add purchase buttons with proper IDs
        document.addEventListener('DOMContentLoaded', () => {
            this.updatePurchaseButtons();
        });
    }
    
    updatePurchaseButtons() {
        const buttons = document.querySelectorAll('.button[onclick^="buyAgent"]');
        buttons.forEach(button => {
            const match = button.getAttribute('onclick').match(/buyAgent\('(.+?)'\)/);
            if (match) {
                const productId = match[1];
                button.setAttribute('data-product-id', productId);
                button.removeAttribute('onclick');
                button.addEventListener('click', () => this.handlePurchase(productId));
            }
        });
    }
    
    async handlePurchase(productId) {
        // IMMEDIATELY DISABLE ALL PURCHASES - PRODUCT NOT READY
        alert('🚫 PURCHASES TEMPORARILY DISABLED\n\nWe\'re currently building the actual AI agents and will enable purchases once they\'re ready.\n\nJoin our waitlist to be notified when we launch: support@specregistry.com');
        
        // Log the attempt for analytics
        console.log(`Purchase attempt blocked - product not ready: ${productId}`);
        
        // Optionally redirect to a waitlist page
        // window.location.href = '/waitlist';
        
        return false;
    }
    
    showLoading(show, message = 'Processing...') {
        // Create or update loading overlay
        let overlay = document.getElementById('stripe-loading-overlay');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'stripe-loading-overlay';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.8);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: white;
                    font-size: 1.2rem;
                `;
                
                const spinner = document.createElement('div');
                spinner.style.cssText = `
                    border: 4px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top: 4px solid #4ade80;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                `;
                
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                
                document.head.appendChild(style);
                overlay.appendChild(spinner);
                document.body.appendChild(overlay);
            }
            
            const messageEl = overlay.querySelector('.loading-message') || document.createElement('div');
            messageEl.className = 'loading-message';
            messageEl.textContent = message;
            messageEl.style.marginTop = '20px';
            
            if (!overlay.querySelector('.loading-message')) {
                overlay.appendChild(messageEl);
            }
            
            overlay.style.display = 'flex';
            
        } else if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showManualPaymentOption(productId) {
        const products = {
            social: { name: 'Social Media Generator', price: 97 },
            support: { name: 'Customer Support Bot', price: 147 },
            seo: { name: 'SEO Content Writer', price: 197 },
            email: { name: 'Email Marketing Automator', price: 127 },
            data: { name: 'Data Scraper & Analyzer', price: 247 },
            bundle: { name: 'Complete Bundle', price: 497 }
        };
        
        const product = products[productId];
        if (!product) return;
        
        const manualPaymentHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; justify-content: center; align-items: center;">
                <div style="background: white; color: #333; padding: 30px; border-radius: 15px; max-width: 500px; text-align: center;">
                    <h2 style="color: #667eea;">Manual Payment Option</h2>
                    <p>Stripe checkout is temporarily unavailable. You can still purchase:</p>
                    <h3>${product.name}</h3>
                    <p style="font-size: 2rem; color: #4ade80; font-weight: bold;">$${product.price}</p>
                    <p>Email: <strong>payments@aiagents.specregistry.com</strong></p>
                    <p>Include: Product name and your email address</p>
                    <button onclick="this.parentElement.parentElement.remove()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px; cursor: pointer;">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = manualPaymentHTML;
        document.body.appendChild(div.firstElementChild);
    }
    
    // Test function for development
    async testCheckout(productId = 'social') {
        console.log('Testing checkout for:', productId);
        await this.handlePurchase(productId);
    }
}

// Initialize Stripe integration
document.addEventListener('DOMContentLoaded', () => {
    window.stripeIntegration = new StripeIntegration();
    
    // Add COMING SOON indicator
    const comingSoonIndicator = document.createElement('div');
    comingSoonIndicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #ef4444;
        color: white;
        padding: 8px 15px;
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        border: 2px solid white;
    `;
    comingSoonIndicator.textContent = '🚫 PURCHASES DISABLED - COMING SOON';
    document.body.appendChild(comingSoonIndicator);
    
    // Also update all purchase buttons to show "Coming Soon"
    setTimeout(() => {
        const purchaseButtons = document.querySelectorAll('.button[data-product-id], .button[onclick*="buyAgent"]');
        purchaseButtons.forEach(button => {
            button.textContent = 'Coming Soon';
            button.style.opacity = '0.7';
            button.style.cursor = 'not-allowed';
            button.style.backgroundColor = '#6b7280';
            
            // Remove any existing click handlers
            button.onclick = null;
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                alert('🚫 AI Agents coming soon! We\'re building them now.\n\nJoin waitlist: support@specregistry.com');
                return false;
            });
        });
    }, 100);
});