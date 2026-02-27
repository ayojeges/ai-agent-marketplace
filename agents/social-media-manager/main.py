#!/usr/bin/env python3
"""
Social Media Manager AI Agent
Automates social media content creation, scheduling, and analytics.
"""

import os
import json
import datetime
import requests
from typing import List, Dict, Optional
import schedule
import time
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('social_media_agent.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SocialMediaManager:
    """Main Social Media Manager AI Agent"""
    
    def __init__(self, config_path: str = "config.json"):
        """Initialize the agent with configuration"""
        self.config = self.load_config(config_path)
        self.content_calendar = []
        self.analytics_data = {}
        
        # Ensure data directories exist
        Path("data/content").mkdir(parents=True, exist_ok=True)
        Path("data/analytics").mkdir(parents=True, exist_ok=True)
        Path("data/scheduled").mkdir(parents=True, exist_ok=True)
        
        logger.info("Social Media Manager AI Agent initialized")
    
    def load_config(self, config_path: str) -> Dict:
        """Load configuration from JSON file"""
        default_config = {
            "platforms": ["twitter", "linkedin", "instagram"],
            "posting_schedule": {
                "twitter": ["09:00", "13:00", "17:00"],
                "linkedin": ["10:00", "15:00"],
                "instagram": ["11:00", "19:00"]
            },
            "content_themes": ["industry_news", "tips", "case_studies", "behind_scenes"],
            "hashtag_strategy": {
                "popular": 3,
                "niche": 5,
                "branded": 2
            },
            "ai_api_key": os.getenv("OPENAI_API_KEY", ""),
            "analytics_enabled": True,
            "auto_schedule": True
        }
        
        try:
            with open(config_path, 'r') as f:
                user_config = json.load(f)
                # Merge with defaults
                default_config.update(user_config)
                logger.info(f"Configuration loaded from {config_path}")
        except FileNotFoundError:
            logger.warning(f"Config file {config_path} not found, using defaults")
            # Save default config
            with open(config_path, 'w') as f:
                json.dump(default_config, f, indent=2)
        
        return default_config
    
    def generate_content_ideas(self, theme: str, count: int = 5) -> List[str]:
        """Generate content ideas based on theme"""
        ideas = []
        
        theme_templates = {
            "industry_news": [
                "Breaking: {topic} is changing the industry. Here's what you need to know.",
                "New study shows {stat}% increase in {metric}. My analysis:",
                "Just discovered {tool/trend}. Game changer for {audience}."
            ],
            "tips": [
                "Most people get {task} wrong. Here's the right way:",
                "3 simple steps to improve your {skill}:",
                "The {number} mistake I see in {industry} and how to fix it."
            ],
            "case_studies": [
                "How {company} increased {metric} by {percentage}% using {method}",
                "Case study: {result} in {timeframe} with {strategy}",
                "From {starting_point} to {ending_point} - The {client} story"
            ],
            "behind_scenes": [
                "What a typical day looks like building {product}",
                "The tools we use to {achieve_result}",
                "Meet the team: {team_member} on {role}"
            ]
        }
        
        templates = theme_templates.get(theme, theme_templates["tips"])
        
        for i in range(count):
            idea = templates[i % len(templates)]
            ideas.append(idea)
        
        logger.info(f"Generated {len(ideas)} content ideas for theme: {theme}")
        return ideas
    
    def create_post(self, idea: str, platform: str) -> Dict:
        """Create a complete social media post"""
        hashtags = self.generate_hashtags(idea, platform)
        
        post = {
            "id": f"post_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "content": idea,
            "platform": platform,
            "hashtags": hashtags,
            "created_at": datetime.datetime.now().isoformat(),
            "scheduled_for": None,
            "posted": False,
            "engagement": {"likes": 0, "shares": 0, "comments": 0}
        }
        
        # Platform-specific formatting
        if platform == "twitter":
            post["content"] = self.format_for_twitter(idea, hashtags)
        elif platform == "linkedin":
            post["content"] = self.format_for_linkedin(idea, hashtags)
        elif platform == "instagram":
            post["content"] = self.format_for_instagram(idea, hashtags)
        
        return post
    
    def generate_hashtags(self, content: str, platform: str) -> List[str]:
        """Generate relevant hashtags for the content"""
        # Extract keywords from content
        keywords = [word.lower() for word in content.split() if len(word) > 3]
        
        # Platform-specific hashtag strategies
        hashtag_counts = self.config["hashtag_strategy"]
        
        popular_hashtags = {
            "twitter": ["marketing", "business", "tech", "entrepreneur", "startup"],
            "linkedin": ["innovation", "leadership", "career", "digital", "strategy"],
            "instagram": ["design", "creative", "inspiration", "work", "success"]
        }
        
        niche_hashtags = {
            "twitter": ["socialmediamarketing", "contentstrategy", "digitalmarketing"],
            "linkedin": ["b2bmarketing", "saas", "growthhacking"],
            "instagram": ["socialmediatips", "contentcreator", "marketingtips"]
        }
        
        hashtags = []
        
        # Add popular hashtags
        platform_popular = popular_hashtags.get(platform, [])
        hashtags.extend(platform_popular[:hashtag_counts["popular"]])
        
        # Add niche hashtags
        platform_niche = niche_hashtags.get(platform, [])
        hashtags.extend(platform_niche[:hashtag_counts["niche"]])
        
        # Add branded hashtag
        hashtags.append("aiagentmarketplace")
        
        # Add keyword-based hashtags
        for keyword in keywords[:3]:
            hashtags.append(f"#{keyword}")
        
        # Remove duplicates and format
        hashtags = list(set(hashtags))
        hashtags = [f"#{tag}" if not tag.startswith("#") else tag for tag in hashtags]
        
        return hashtags[:10]  # Limit to 10 hashtags
    
    def format_for_twitter(self, content: str, hashtags: List[str]) -> str:
        """Format content for Twitter (280 character limit)"""
        hashtag_text = " ".join(hashtags)
        full_text = f"{content}\n\n{hashtag_text}"
        
        # Truncate if necessary
        if len(full_text) > 280:
            content_max = 280 - len(hashtag_text) - 3  # Account for "\n\n"
            content = content[:content_max] + "..."
            full_text = f"{content}\n\n{hashtag_text}"
        
        return full_text
    
    def format_for_linkedin(self, content: str, hashtags: List[str]) -> str:
        """Format content for LinkedIn"""
        hashtag_text = "\n".join(hashtags)
        return f"{content}\n\n{hashtag_text}"
    
    def format_for_instagram(self, content: str, hashtags: List[str]) -> str:
        """Format content for Instagram"""
        hashtag_text = " ".join(hashtags)
        return f"{content}\n.\n.\n.\n{hashtag_text}"
    
    def schedule_post(self, post: Dict, schedule_time: str):
        """Schedule a post for specific time"""
        post["scheduled_for"] = schedule_time
        
        # Save to scheduled posts
        scheduled_file = f"data/scheduled/{post['id']}.json"
        with open(scheduled_file, 'w') as f:
            json.dump(post, f, indent=2)
        
        self.content_calendar.append(post)
        logger.info(f"Scheduled post {post['id']} for {schedule_time}")
        
        return post
    
    def generate_content_calendar(self, days: int = 7):
        """Generate a week's worth of content"""
        calendar = []
        
        for day in range(days):
            date = datetime.datetime.now() + datetime.timedelta(days=day)
            
            for platform in self.config["platforms"]:
                schedule_times = self.config["posting_schedule"].get(platform, [])
                
                for i, schedule_time in enumerate(schedule_times):
                    theme = self.config["content_themes"][
                        (day * len(schedule_times) + i) % len(self.config["content_themes"])
                    ]
                    
                    ideas = self.generate_content_ideas(theme, 1)
                    post = self.create_post(ideas[0], platform)
                    
                    # Create schedule datetime
                    schedule_datetime = f"{date.strftime('%Y-%m-%d')} {schedule_time}"
                    post = self.schedule_post(post, schedule_datetime)
                    
                    calendar.append(post)
        
        # Save calendar
        calendar_file = f"data/content/calendar_{datetime.datetime.now().strftime('%Y%m%d')}.json"
        with open(calendar_file, 'w') as f:
            json.dump(calendar, f, indent=2)
        
        logger.info(f"Generated {len(calendar)} posts for {days} days")
        return calendar
    
    def run_scheduler(self):
        """Run the scheduling system"""
        logger.info("Starting social media scheduler...")
        
        # Generate initial content calendar
        self.generate_content_calendar(7)
        
        # Check for posts to publish
        schedule.every(1).minutes.do(self.check_scheduled_posts)
        
        # Analytics collection
        if self.config["analytics_enabled"]:
            schedule.every(1).hours.do(self.collect_analytics)
        
        # Content refresh
        schedule.every(6).hours.do(self.refresh_content_ideas)
        
        logger.info("Scheduler started. Press Ctrl+C to stop.")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
    
    def check_scheduled_posts(self):
        """Check and publish scheduled posts"""
        now = datetime.datetime.now()
        
        for post in self.content_calendar:
            if not post["posted"] and post["scheduled_for"]:
                scheduled_time = datetime.datetime.strptime(
                    post["scheduled_for"], "%Y-%m-%d %H:%M"
                )
                
                if now >= scheduled_time:
                    self.publish_post(post)
    
    def publish_post(self, post: Dict):
        """Publish a post (simulated - would integrate with APIs)"""
        # In a real implementation, this would call Twitter/LinkedIn/Instagram APIs
        logger.info(f"PUBLISHING: {post['platform'].upper()} - {post['content'][:50]}...")
        
        # Simulate API call
        post["posted"] = True
        post["published_at"] = datetime.datetime.now().isoformat()
        
        # Save published post
        published_file = f"data/content/published_{post['id']}.json"
        with open(published_file, 'w') as f:
            json.dump(post, f, indent=2)
        
        logger.info(f"Published post {post['id']} to {post['platform']}")
        
        return True
    
    def collect_analytics(self):
        """Collect analytics data (simulated)"""
        # In a real implementation, this would fetch from social media APIs
        analytics = {
            "timestamp": datetime.datetime.now().isoformat(),
            "total_posts": len([p for p in self.content_calendar if p["posted"]]),
            "engagement_rate": 0.0,
            "top_performing_post": None,
            "platform_breakdown": {}
        }
        
        # Simulate analytics collection
        for platform in self.config["platforms"]:
            platform_posts = [p for p in self.content_calendar 
                            if p["platform"] == platform and p["posted"]]
            
            if platform_posts:
                total_engagement = sum(
                    sum(p["engagement"].values()) for p in platform_posts
                )
                analytics["platform_breakdown"][platform] = {
                    "posts": len(platform_posts),
                    "total_engagement": total_engagement,
                    "avg_engagement": total_engagement / len(platform_posts) if platform_posts else 0
                }
        
        # Save analytics
        analytics_file = f"data/analytics/{datetime.datetime.now().strftime('%Y%m%d_%H')}.json"
        with open(analytics_file, 'w') as f:
            json.dump(analytics, f, indent=2)
        
        self.analytics_data = analytics
        logger.info("Analytics collected and saved")
        
        return analytics
    
    def refresh_content_ideas(self):
        """Refresh content ideas based on performance"""
        logger.info("Refreshing content ideas based on analytics...")
        
        # In a real implementation, this would analyze what's working
        # and adjust content themes accordingly
        
        return True
    
    def get_analytics_report(self) -> str:
        """Generate a human-readable analytics report"""
        if not self.analytics_data:
            return "No analytics data available yet."
        
        report = [
            "📊 SOCIAL MEDIA ANALYTICS REPORT",
            "=" * 40,
            f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
            f"Total Posts: {self.analytics_data.get('total_posts', 0)}",
            ""
        ]
        
        for platform, data in self.analytics_data.get("platform_breakdown", {}).items():
            report.append(f"{platform.upper()}:")
            report.append(f"  Posts: {data.get('posts', 0)}")
            report.append(f"  Total Engagement: {data.get('total_engagement', 0)}")
            report.append(f"  Avg Engagement: {data.get('avg_engagement', 0):.2f}")
            report.append("")
        
        return "\n".join(report)

def main():
    """Main entry point"""
    print("🤖 SOCIAL MEDIA MANAGER AI AGENT")
    print("=" * 40)
    
    agent = SocialMediaManager()
    
    # Interactive menu
    while True:
        print("\nOptions:")
        print("1. Generate content calendar (7 days)")
        print("2. View analytics report")
        print("3. Run scheduler (continuous)")
        print("4. Test post creation")
        print("5. Exit")
        
        choice = input("\nSelect option (1-5): ").strip()
        
        if choice == "1":
            calendar = agent.generate_content_calendar(7)
            print(f"✅ Generated {len(calendar)} posts")
            
        elif choice == "2":
            report = agent.get_analytics_report()
            print(report)
            
        elif choice == "3":
            print("Starting scheduler... (Press Ctrl+C to stop)")
            agent.run_scheduler()
            
        elif choice == "4":
            idea = input("Enter post idea: ").strip()
            platform = input("Platform (twitter/linkedin/instagram): ").strip().lower()
            
            if platform not in ["twitter", "linkedin", "instagram"]:
                print("Invalid platform")
                continue
                
            post = agent.create_post(idea, platform)
            print(f"\nGenerated post:")
            print("-" * 40)
            print(post["content"])
            print("-" * 40)
            
        elif choice == "5":
            print("Goodbye! 👋")
            break
            
        else:
            print("Invalid choice")

if __name__ == "__main__":
    main()