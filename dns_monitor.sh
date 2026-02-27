#!/bin/bash
# DNS Monitor Script for AI Agent Marketplace
# Runs every 5 minutes via cron job

cd /root/.openclaw/workspace/ai-agent-marketplace

# Run DNS checker
python3 dns_checker.py
DNS_EXIT_CODE=$?

# Check if DNS is now resolved
if [ $DNS_EXIT_CODE -eq 0 ]; then
    echo "✅ DNS RESOLVED! Custom domain is now active."
    echo "Domain: aiagents.specregistry.com"
    echo "Time: $(date)"
    echo ""
    echo "🎯 IMMEDIATE ACTIONS REQUIRED:"
    echo "1. Switch Stripe to live mode"
    echo "2. Update website links to use custom domain"
    echo "3. Launch full marketing campaign"
    echo "4. Notify team via Telegram"
    
    # Send alert message
    MESSAGE="🚨 DNS ALERT: aiagents.specregistry.com is now resolving!\\n\\n✅ Custom domain active\\n⏰ Time: $(date)\\n\\n🎯 Immediate actions:\\n1. Switch Stripe to live mode\\n2. Update website links\\n3. Launch marketing\\n4. Notify team"
    
    # You can add Telegram notification here when credentials are available
    # curl -s -X POST https://api.telegram.org/bot<TOKEN>/sendMessage \
    #   -d chat_id=<CHAT_ID> \
    #   -d text="$MESSAGE"
    
    # Update task tracking system
    sed -i 's/Status: ⚠️ In Progress/Status: ✅ Complete/' TASK_TRACKING_SYSTEM.md
    sed -i 's/DNS Status: ❌ Pending/DNS Status: ✅ Resolved/' TASK_TRACKING_SYSTEM.md
    
    # Run task tracker to update progress
    python3 task_tracker.py
    
    # Disable DNS monitor cron job (optional)
    # echo "DNS resolved - monitor job can be disabled"
    
else
    echo "❌ DNS still not resolved"
    echo "Domain: aiagents.specregistry.com"
    echo "Time: $(date)"
    echo "Next check: 5 minutes"
    
    # Update task tracking system
    CURRENT_TIME=$(date '+%Y-%m-%d %H:%M UTC')
    sed -i "s/Updated:.*UTC/Updated: $CURRENT_TIME/" TASK_TRACKING_SYSTEM.md
fi

# Log to file
echo "$(date) - DNS check completed with exit code: $DNS_EXIT_CODE" >> dns_monitor.log