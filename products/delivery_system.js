// Simple Product Delivery System for GitHub Pages
// This simulates product delivery until we have a proper backend

class ProductDelivery {
    constructor() {
        this.products = {
            social: {
                name: 'Social Media Generator AI Agent',
                folder: 'social_media_generator',
                files: [
                    { name: 'Social_Media_Content_System.pdf', size: '2.3 MB', type: 'PDF' },
                    { name: 'AI_Prompt_Library.notion.zip', size: '1.1 MB', type: 'Notion Template' },
                    { name: 'Canva_Templates.zip', size: '8.5 MB', type: 'Design Templates' },
                    { name: 'Video_Training.zip', size: '450 MB', type: 'Video Course' },
                    { name: 'README.md', size: '4 KB', type: 'Instructions' }
                ],
                value: 1300,
                price: 97
            },
            support: {
                name: 'Customer Support Bot AI Agent',
                folder: 'customer_support_bot',
                files: [
                    { name: 'Support_Bot_Implementation_Guide.pdf', size: '3.1 MB', type: 'PDF' },
                    { name: 'Bot_Script_Templates.zip', size: '850 KB', type: 'Google Sheets' },
                    { name: 'ChatGPT_Fine-tuning_Guide.pdf', size: '1.8 MB', type: 'PDF' },
                    { name: 'Video_Training.zip', size: '520 MB', type: 'Video Course' }
                ],
                value: 1500,
                price: 147
            },
            seo: {
                name: 'SEO Content Writer AI Agent',
                folder: 'seo_content_writer',
                files: [
                    { name: 'SEO_Content_Factory.pdf', size: '4.2 MB', type: 'PDF' },
                    { name: '50_SEO_Article_Templates.zip', size: '2.3 MB', type: 'Templates' },
                    { name: 'AI_SEO_Tools_Access.pdf', size: '1.5 MB', type: 'PDF' },
                    { name: 'Video_Training.zip', size: '620 MB', type: 'Video Course' }
                ],
                value: 1800,
                price: 197
            },
            email: {
                name: 'Email Marketing Automator AI Agent',
                folder: 'email_marketing_automator',
                files: [
                    { name: 'Email_Marketing_Machine.pdf', size: '2.8 MB', type: 'PDF' },
                    { name: 'Email_Template_Library.zip', size: '3.5 MB', type: 'HTML/CSS' },
                    { name: 'AI_Copywriting_Prompts.pdf', size: '1.2 MB', type: 'PDF' },
                    { name: 'Video_Training.zip', size: '380 MB', type: 'Video Course' }
                ],
                value: 1200,
                price: 127
            },
            data: {
                name: 'Data Scraper & Analyzer AI Agent',
                folder: 'data_scraper_analyzer',
                files: [
                    { name: 'Data_Extraction_System.pdf', size: '4.8 MB', type: 'PDF' },
                    { name: 'Python_Scripts.zip', size: '5.2 MB', type: 'Code' },
                    { name: 'Google_Sheets_Automation.zip', size: '1.8 MB', type: 'Templates' },
                    { name: 'Video_Training.zip', size: '780 MB', type: 'Video Course' }
                ],
                value: 2200,
                price: 247
            },
            bundle: {
                name: 'Complete AI Agent Bundle',
                folder: 'complete_bundle',
                files: [
                    { name: 'All_5_Packages.zip', size: '2.1 GB', type: 'Complete Collection' },
                    { name: 'Business_Automation_Blueprint.pdf', size: '3.5 MB', type: 'PDF' },
                    { name: 'Community_Access_Instructions.pdf', size: '850 KB', type: 'PDF' },
                    { name: 'Bonus_Custom_Setup_Guide.pdf', size: '1.2 MB', type: 'PDF' }
                ],
                value: 7000,
                price: 497
            }
        };
    }
    
    // Generate download page HTML for a product
    generateDownloadPage(productId, customerEmail, customerName) {
        const product = this.products[productId];
        if (!product) {
            return '<h2>Product not found</h2>';
        }
        
        const totalSize = product.files.reduce((sum, file) => {
            const size = parseFloat(file.size);
            const unit = file.size.split(' ')[1];
            if (unit === 'GB') return sum + size * 1000;
            return sum + size;
        }, 0);
        
        const totalSizeFormatted = totalSize > 1000 
            ? `${(totalSize / 1000).toFixed(1)} GB` 
            : `${totalSize.toFixed(1)} MB`;
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Download Your ${product.name}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
                    .download-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .file-item { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f1f5f9; }
                    .file-item:last-child { border-bottom: none; }
                    .download-btn { background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
                    .download-btn:hover { background: #059669; }
                    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 25px 0; }
                    .stat-card { background: #f8fafc; padding: 20px; border-radius: 10px; text-align: center; }
                    .stat-value { font-size: 1.8rem; font-weight: 700; color: #4f46e5; }
                    .stat-label { color: #64748b; font-size: 0.9rem; margin-top: 5px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🎉 Your ${product.name} is Ready!</h1>
                    <p>Download all files below. Check your email for backup links.</p>
                </div>
                
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-value">$${product.value}+</div>
                        <div class="stat-label">Total Value</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">$${product.price}</div>
                        <div class="stat-label">Your Investment</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${product.files.length}</div>
                        <div class="stat-label">Files Included</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalSizeFormatted}</div>
                        <div class="stat-label">Total Size</div>
                    </div>
                </div>
                
                <div class="download-card">
                    <h2>📁 Download Your Files</h2>
                    <p style="color: #64748b; margin-bottom: 20px;">
                        Download each file individually or use the "Download All" button below.
                    </p>
                    
                    ${product.files.map(file => `
                        <div class="file-item">
                            <div>
                                <strong>${file.name}</strong><br>
                                <small style="color: #64748b;">${file.type} • ${file.size}</small>
                            </div>
                            <a href="/products/${product.folder}/${file.name}" class="download-btn" download>
                                Download
                            </a>
                        </div>
                    `).join('')}
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <a href="/products/${product.folder}/all_files.zip" class="download-btn" style="padding: 15px 30px; font-size: 1.1rem;">
                            ⬇️ Download All Files (${totalSizeFormatted})
                        </a>
                        <p style="color: #64748b; font-size: 0.9rem; margin-top: 10px;">
                            Recommended for fast download
                        </p>
                    </div>
                </div>
                
                <div class="download-card">
                    <h2>📚 Getting Started Guide</h2>
                    <ol style="line-height: 2; color: #475569;">
                        <li><strong>Start with the main PDF</strong> - This is your comprehensive guide</li>
                        <li><strong>Watch the video training</strong> - Follow along with the examples</li>
                        <li><strong>Use the templates</strong> - Customize them for your business</li>
                        <li><strong>Join the community</strong> - Get support and share results</li>
                    </ol>
                    
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin-top: 20px;">
                        <h3 style="color: #065f46; margin-top: 0;">💡 Pro Tip</h3>
                        <p style="color: #047857; margin-bottom: 0;">
                            Implement ONE thing from this package today. Don't try to do everything at once.
                            Small, consistent actions create big results.
                        </p>
                    </div>
                </div>
                
                <div class="download-card">
                    <h2>📧 Need Help?</h2>
                    <p style="color: #475569;">
                        Email: <strong>support@aiagents.specregistry.com</strong><br>
                        Response time: Within 24 hours<br><br>
                        
                        <strong>Remember:</strong> You're protected by our 30-day money-back guarantee.
                        If you're not satisfied, just email us for a full refund.
                    </p>
                </div>
                
                <script>
                    // Track downloads
                    document.querySelectorAll('.download-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const fileName = this.getAttribute('href').split('/').pop();
                            console.log('Download started:', fileName);
                            // In production: Send analytics event
                        });
                    });
                    
                    // Auto-download after 3 seconds (optional)
                    setTimeout(() => {
                        console.log('Auto-download reminder');
                    }, 3000);
                </script>
            </body>
            </html>
        `;
    }
    
    // Simulate email delivery
    simulateEmailDelivery(productId, customerEmail, customerName) {
        const product = this.products[productId];
        if (!product) return false;
        
        const emailContent = {
            to: customerEmail,
            subject: `Your ${product.name} is ready for download!`,
            html: `
                <h2>🎉 Your AI Agent is Ready!</h2>
                <p>Hi ${customerName},</p>
                <p>Thank you for purchasing the <strong>${product.name}</strong>.</p>
                <p>You can download your files here:</p>
                <p><a href="https://aiagents.specregistry.com/download/${productId}?email=${encodeURIComponent(customerEmail)}" 
                      style="background: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
                    Download Your Files
                </a></p>
                <p>This link will expire in 30 days. Please download and save your files locally.</p>
                <hr>
                <p><strong>What you get:</strong></p>
                <ul>
                    ${product.files.map(file => `<li>${file.name} (${file.size})</li>`).join('')}
                </ul>
                <p>Total value: $${product.value}+ | Your investment: $${product.price}</p>
                <hr>
                <p><strong>Need help?</strong> Email: support@aiagents.specregistry.com</p>
                <p><strong>Money-back guarantee:</strong> 30 days, no questions asked.</p>
            `
        };
        
        console.log('Email would be sent:', emailContent);
        return true;
    }
    
    // Get product info
    getProductInfo(productId) {
        return this.products[productId] || null;
    }
    
    // List all products
    listProducts() {
        return Object.keys(this.products).map(id => ({
            id,
            ...this.products[id]
        }));
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.ProductDelivery = ProductDelivery;
}

// For Node.js/CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductDelivery;
}