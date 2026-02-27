// Simple Stripe Checkout for GitHub Pages
// Client-only implementation - no backend needed

class SimpleStripeCheckout {
    constructor() {
        this.stripe = null;
        this.products = {
            social: {
                name: 'Social Media Generator AI Agent',
                description: 'Create engaging content for Twitter, LinkedIn, Instagram',
                price: 9700, // $97.00
                priceId: 'price_social_monthly' // Will be replaced with live price ID
            },
            support: {
                name: 'Customer Support Bot AI Agent',
                description: 'Automate customer service with AI-powered responses',
                price: 14700, // $147.00
                priceId: 'price_support_monthly'
            },
            seo: {
                name: 'SEO Content Writer AI Agent',
                description: 'Generate SEO-optimized articles and blog posts',
                price: 19700, // $197.00
                priceId: 'price_seo_monthly'
            },
            email: {
                name: 'Email Marketing Automator AI Agent',
                description: 'Create and optimize email campaigns automatically',
                price: 12700, // $127.00
                priceId: 'price_email_monthly'
            },
            data: {
                name: 'Data Scraper & Analyzer AI Agent',
                description: 'Extract and analyze data from any website',
                price: 24700, // $247.00
                priceId: 'price_data_monthly'
            },
            bundle: {
                name: 'Complete AI Agent Bundle',
                description: 'All 5 agents + exclusive community access',
                price: 49700, // $497.00
                priceId: 'price_bundle_monthly'
            }
        };
        
        this.initialize();
    }
    
    async initialize() {
        // Load Stripe.js
        await this.loadStripe();
        
        // Update button event listeners
        this.updateButtons();
        
        console.log('Simple Stripe Checkout initialized');
    }
    
    async loadStripe() {
        // Load Stripe.js library
        if (typeof Stripe === 'undefined') {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://js.stripe.com/v3/';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        // Initialize Stripe with publishable key
        // TEST KEY - Replace with live key: pk_live_...
        this.stripe = Stripe('pk_test_51QabcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    }
    
    updateButtons() {
        // Update all purchase buttons
        const buttons = document.querySelectorAll('.button[onclick^="buyAgent"], [data-product-id]');
        
        buttons.forEach(button => {
            // Get product ID from onclick attribute or data attribute
            let productId = button.getAttribute('data-product-id');
            
            if (!productId) {
                const match = button.getAttribute('onclick')?.match(/buyAgent\('(.+?)'\)/);
                if (match) {
                    productId = match[1];
                    button.setAttribute('data-product-id', productId);
                }
            }
            
            if (productId && this.products[productId]) {
                // Remove old onclick
                button.removeAttribute('onclick');
                
                // Add new click handler
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleCheckout(productId);
                });
                
                // Update button text with price
                const price = this.products[productId].price / 100;
                const originalText = button.textContent;
                if (!originalText.includes('$')) {
                    button.innerHTML = `${originalText} <span style="font-weight: bold; margin-left: 5px;">$${price}</span>`;
                }
            }
        });
    }
    
    async handleCheckout(productId) {
        try {
            const product = this.products[productId];
            if (!product) {
                throw new Error('Product not found');
            }
            
            // Show email prompt
            const customerEmail = prompt('Enter your email for product delivery:');
            if (!customerEmail) {
                alert('Email is required for delivery');
                return;
            }
            
            // Validate email
            if (!this.isValidEmail(customerEmail)) {
                alert('Please enter a valid email address');
                return;
            }
            
            // Show loading
            this.showLoading(true, `Preparing checkout for ${product.name}...`);
            
            // For now, use a simple redirect to a checkout page
            // In production, you would create a Checkout Session via Stripe API
            this.redirectToSimpleCheckout(productId, customerEmail, product);
            
        } catch (error) {
            console.error('Checkout error:', error);
            this.showLoading(false);
            this.showError(`Checkout failed: ${error.message}`);
        }
    }
    
    redirectToSimpleCheckout(productId, customerEmail, product) {
        // Create a simple checkout page URL
        // This is a temporary solution until we have live Stripe keys
        
        const checkoutData = {
            productId: productId,
            productName: product.name,
            price: product.price / 100,
            customerEmail: customerEmail,
            timestamp: Date.now()
        };
        
        // Encode data for URL
        const encodedData = btoa(JSON.stringify(checkoutData));
        
        // Redirect to a simple checkout page
        // In production, this would be a Stripe Checkout Session URL
        window.location.href = `/checkout.html?data=${encodedData}`;
    }
    
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showLoading(show, message = 'Processing...') {
        let overlay = document.getElementById('stripe-loading');
        
        if (show) {
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'stripe-loading';
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    color: white;
                `;
                
                const spinner = document.createElement('div');
                spinner.style.cssText = `
                    border: 4px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top: 4px solid #4ade80;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                `;
                
                const messageEl = document.createElement('div');
                messageEl.id = 'stripe-loading-message';
                messageEl.style.cssText = `
                    font-size: 1.2rem;
                    margin-top: 20px;
                `;
                
                // Add CSS animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                
                document.head.appendChild(style);
                overlay.appendChild(spinner);
                overlay.appendChild(messageEl);
                document.body.appendChild(overlay);
            }
            
            const messageEl = overlay.querySelector('#stripe-loading-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            
            overlay.style.display = 'flex';
            
        } else if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        errorDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Error:</strong> ${message}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; margin-left: 10px;">
                    ×
                </button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }
    
    // Test function
    testIntegration() {
        console.log('Testing Stripe integration...');
        console.log('Products:', this.products);
        console.log('Stripe loaded:', !!this.stripe);
        
        // Test each product
        Object.keys(this.products).forEach(productId => {
            console.log(`Product ${productId}: ${this.products[productId].name} - $${this.products[productId].price / 100}`);
        });
        
        return true;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.simpleStripe = new SimpleStripeCheckout();
    
    // Add test mode indicator
    const testIndicator = document.createElement('div');
    testIndicator.style.cssText = `
        position: fixed;
        bottom: 10px;
        right: 10px;
        background: #fbbf24;
        color: #1a1a1a;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: bold;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 5px;
    `;
    testIndicator.innerHTML = `
        <span>TEST MODE</span>
        <span style="font-size: 0.7rem;">(Waiting for live keys)</span>
    `;
    document.body.appendChild(testIndicator);
    
    console.log('Simple Stripe Checkout ready');
});