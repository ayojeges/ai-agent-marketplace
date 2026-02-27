#!/usr/bin/env python3
"""
DNS Checker for AI Agent Marketplace
Checks if custom domain is resolving properly
"""

import subprocess
import time
import json
from datetime import datetime, timedelta

def check_dns(domain):
    """Check if domain resolves to GitHub Pages"""
    try:
        # Use dig to check DNS resolution
        result = subprocess.run(
            ['dig', '+short', domain],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0 and result.stdout.strip():
            ips = result.stdout.strip().split('\n')
            
            # Check if any IP matches GitHub Pages IPs
            github_ips = [
                '185.199.108.153',
                '185.199.109.153', 
                '185.199.110.153',
                '185.199.111.153'
            ]
            
            for ip in ips:
                if ip in github_ips:
                    return {
                        'status': 'resolved',
                        'ips': ips,
                        'message': f'✅ DNS resolved to GitHub Pages ({ip})'
                    }
            
            return {
                'status': 'resolved_wrong',
                'ips': ips,
                'message': f'⚠️ DNS resolved but not to GitHub Pages ({ips[0]})'
            }
        else:
            return {
                'status': 'not_resolved',
                'ips': [],
                'message': '❌ DNS not resolving (NXDOMAIN)'
            }
            
    except subprocess.TimeoutExpired:
        return {
            'status': 'timeout',
            'ips': [],
            'message': '⏱️ DNS check timeout'
        }
    except Exception as e:
        return {
            'status': 'error',
            'ips': [],
            'message': f'❌ Error checking DNS: {str(e)}'
        }

def check_website(domain):
    """Check if website is accessible via HTTP"""
    try:
        # Use curl to check HTTP status
        result = subprocess.run(
            ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', f'https://{domain}'],
            capture_output=True,
            text=True,
            timeout=15
        )
        
        if result.returncode == 0:
            status_code = result.stdout.strip()
            if status_code == '200':
                return {
                    'status': 'accessible',
                    'http_code': status_code,
                    'message': '✅ Website accessible via HTTPS'
                }
            else:
                return {
                    'status': 'error',
                    'http_code': status_code,
                    'message': f'⚠️ Website returned HTTP {status_code}'
                }
        else:
            return {
                'status': 'error',
                'http_code': '000',
                'message': '❌ Website not accessible'
            }
            
    except subprocess.TimeoutExpired:
        return {
            'status': 'timeout',
            'http_code': '000',
            'message': '⏱️ Website check timeout'
        }
    except Exception as e:
        return {
            'status': 'error',
            'http_code': '000',
            'message': f'❌ Error checking website: {str(e)}'
        }

def main():
    domain = "aiagents.specregistry.com"
    
    print(f"🔍 Checking DNS for: {domain}")
    print("=" * 50)
    
    # Check DNS
    dns_result = check_dns(domain)
    print(f"DNS Status: {dns_result['message']}")
    
    if dns_result['ips']:
        print(f"Resolved IPs: {', '.join(dns_result['ips'])}")
    
    print()
    
    # Check website if DNS is resolved
    if dns_result['status'] == 'resolved':
        print(f"🌐 Checking website: https://{domain}")
        website_result = check_website(domain)
        print(f"Website Status: {website_result['message']}")
        
        if website_result['http_code'] != '000':
            print(f"HTTP Status Code: {website_result['http_code']}")
    else:
        print("🌐 Website check skipped (DNS not resolved)")
    
    print()
    print("=" * 50)
    
    # Save results to JSON
    results = {
        'timestamp': datetime.utcnow().isoformat(),
        'domain': domain,
        'dns': dns_result,
        'website': website_result if dns_result['status'] == 'resolved' else None,
        'next_check': (datetime.utcnow() + timedelta(minutes=5)).isoformat()
    }
    
    with open('dns_status.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"📁 Results saved to: dns_status.json")
    print(f"⏰ Next automatic check: 5 minutes")
    
    # Return exit code based on status
    if dns_result['status'] == 'resolved':
        return 0
    else:
        return 1

if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)