// Stripe Server for AI Agent Marketplace
const express = require('express');
const stripe = require('stripe');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Configuration
const STRIPE_CONFIG = {
    // TEST KEYS - Replace with live keys for production
    // Get your keys from: https://dashboard.stripe.com/test/apikeys
    publishableKey: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE',
    secretKey: 'sk_test_YOUR_SECRET_KEY_HERE',
    
    // Products
    products: {
        social: {
            name: 'Social Media Generator AI Agent',
            description: 'Create engaging content for Twitter, LinkedIn, Instagram',
            price: 9700, // $97.00
            id: 'prod_test_social_media'
        },
        support: {
            name: 'Customer Support Bot AI Agent',
            description: 'Automate customer service with AI-powered responses',
            price: 14700, // $147.00
            id: 'prod_test_support_bot'
        },
        seo: {
            name: 'SEO Content Writer AI Agent',
            description: 'Generate SEO-optimized articles and blog posts',
            price: 19700, // $197.00
            id: 'prod_test_seo_writer'
        },
        email: {
            name: 'Email Marketing Automator AI Agent',
            description: 'Create and optimize email campaigns automatically',
            price: 12700, // $127.00
            id: 'prod_test_email_automator'
        },
        data: {
            name: 'Data Scraper & Analyzer AI Agent',
            description: 'Extract and analyze data from any website',
            price: 24700, // $247.00
            id: 'prod_test_data_scraper'
        },
        bundle: {
            name: 'Complete AI Agent Bundle',
            description: 'All 5 agents + exclusive community access',
            price: 49700, // $497.00
            id: 'prod_test_complete_bundle'
        }
    },
    
    // URLs
    successUrl: 'https://aiagents.specregistry.com/success',
    cancelUrl: 'https://aiagents.specregistry.com',
    
    // Mode
    mode: 'test', // Change to 'live' when switching
    
    // Webhook secret (generate with: stripe listen --forward-to localhost:3000/webhook)
    webhookSecret: 'whsec_test_default'
};

// Initialize
const stripeClient = stripe(STRIPE_CONFIG.secretKey);
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('docs'));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'ai-agent-marketplace-stripe',
        mode: STRIPE_CONFIG.mode,
        timestamp: new Date().toISOString(),
        products: Object.keys(STRIPE_CONFIG.products).length
    });
});

// Create checkout session
app.post('/api/stripe/create-checkout', async (req, res) => {
    try {
        const { productId, customerEmail } = req.body;
        
        if (!productId || !STRIPE_CONFIG.products[productId]) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        
        const product = STRIPE_CONFIG.products[productId];
        
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        description: product.description,
                        images: ['https://aiagents.specregistry.com/assets/logo.png'],
                    },
                    unit_amount: product.price,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
            cancel_url: STRIPE_CONFIG.cancelUrl,
            customer_email: customerEmail,
            metadata: {
                product_id: productId,
                product_name: product.name,
                marketplace: 'ai-agent-marketplace',
                launch_challenge: '24-hour-build'
            }
        });

        // Log the checkout attempt
        console.log(`Checkout created for ${productId}: ${session.id}`);
        
        res.json({ 
            sessionId: session.id,
            publishableKey: STRIPE_CONFIG.publishableKey,
            product: product.name,
            price: `$${product.price / 100}`
        });
    } catch (error) {
        console.error('Stripe checkout error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook handler
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeClient.webhooks.constructEvent(req.body, sig, STRIPE_CONFIG.webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;
            
        case 'checkout.session.expired':
            console.log('Checkout session expired:', event.data.object.id);
            break;
            
        case 'payment_intent.succeeded':
            console.log('Payment succeeded:', event.data.object.id);
            break;
            
        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            break;
            
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Handle successful payment
async function handleSuccessfulPayment(session) {
    try {
        const { product_id, product_name } = session.metadata;
        const customerEmail = session.customer_email;
        const amount = session.amount_total / 100;
        
        console.log(`💰 Payment successful!`);
        console.log(`   Product: ${product_name} (${product_id})`);
        console.log(`   Amount: $${amount}`);
        console.log(`   Customer: ${customerEmail}`);
        console.log(`   Session: ${session.id}`);
        
        // TODO: Send welcome email
        // TODO: Grant access to product
        // TODO: Add to CRM
        // TODO: Update analytics
        
        // Log to file for backup
        const logEntry = {
            timestamp: new Date().toISOString(),
            sessionId: session.id,
            productId: product_id,
            productName: product_name,
            customerEmail: customerEmail,
            amount: amount,
            currency: session.currency
        };
        
        fs.appendFileSync('payments.log', JSON.stringify(logEntry) + '\n');
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Get product info
app.get('/api/products/:productId', (req, res) => {
    const { productId } = req.params;
    
    if (!STRIPE_CONFIG.products[productId]) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    const product = STRIPE_CONFIG.products[productId];
    res.json({
        id: productId,
        name: product.name,
        description: product.description,
        price: product.price / 100,
        formattedPrice: `$${product.price / 100}`
    });
});

// List all products
app.get('/api/products', (req, res) => {
    const products = Object.entries(STRIPE_CONFIG.products).map(([id, product]) => ({
        id,
        name: product.name,
        description: product.description,
        price: product.price / 100,
        formattedPrice: `$${product.price / 100}`
    }));
    
    res.json({ products });
});

// Success page
app.get('/success', (req, res) => {
    const { session_id, product } = req.query;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Successful - AI Agent Marketplace</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
                .container { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; }
                h1 { color: #4ade80; }
                .button { background: #4ade80; color: #1a1a1a; padding: 15px 30px; border-radius: 10px; text-decoration: none; display: inline-block; margin-top: 20px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🎉 Payment Successful!</h1>
                <p>Thank you for your purchase!</p>
                <p>Your AI agent access will be delivered to your email within 5 minutes.</p>
                <p>Session ID: ${session_id || 'N/A'}</p>
                <a href="/" class="button">Return to Marketplace</a>
            </div>
        </body>
        </html>
    `);
});

// Start server
const PORT = process.env.PORT || 3334;
app.listen(PORT, () => {
    console.log(`🚀 AI Agent Marketplace Stripe Server running on port ${PORT}`);
    console.log(`📦 Products: ${Object.keys(STRIPE_CONFIG.products).length}`);
    console.log(`💰 Mode: ${STRIPE_CONFIG.mode.toUpperCase()}`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
    console.log(`💳 Checkout: POST http://localhost:${PORT}/api/stripe/create-checkout`);
    console.log(`📊 Webhook: POST http://localhost:${PORT}/api/stripe/webhook`);
});

// Export for testing
module.exports = { app, STRIPE_CONFIG, stripeClient };