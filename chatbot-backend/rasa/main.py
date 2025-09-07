#!/usr/bin/env python3
"""
Simple entry point for Rasa on Cloud Run
This bypasses all Docker compilation issues
"""

import os
import subprocess
import sys

def main():
    """Start Rasa service"""
    # Get port from Cloud Run environment
    port = os.environ.get('PORT', '8080')
    
    print(f"🚀 Starting Rasa Chatbot on port {port}")
    print(f"🌐 Host: 0.0.0.0")
    
    # Start Rasa with proper configuration
    cmd = [
        'rasa', 'run',
        '--enable-api',
        '--cors', '*',
        '--port', port,
        '--host', '0.0.0.0'
    ]
    
    print(f"🤖 Running command: {' '.join(cmd)}")
    
    # Execute Rasa
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Rasa failed to start: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("🛑 Rasa stopped by user")
        sys.exit(0)

if __name__ == '__main__':
    main()
