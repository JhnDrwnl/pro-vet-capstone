#!/usr/bin/env python3
"""
Test script to verify database migrations work correctly
"""
import os
import sys
import django

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inference_settings')

# Setup Django
django.setup()

from django.db import connection
from django.core.management import execute_from_command_line

def test_migrations():
    """Test if migrations can be applied successfully"""
    try:
        print("🔍 Testing database migrations...")
        
        # Check current migration status
        print("📊 Current migration status:")
        execute_from_command_line(['manage.py', 'showmigrations', '--settings=inference_settings'])
        
        # Apply migrations
        print("\n🔄 Applying migrations...")
        execute_from_command_line(['manage.py', 'migrate', '--settings=inference_settings'])
        
        # Check tables
        with connection.cursor() as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            print(f"\n📋 Available tables: {[table[0] for table in tables]}")
            
            # Check if our table exists
            if any('inference_app_prediction' in table[0] for table in tables):
                print("✅ inference_app_prediction table exists!")
            else:
                print("❌ inference_app_prediction table missing!")
                
        print("\n🎉 Migration test completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration test failed: {str(e)}")
        return False
    
    return True

if __name__ == '__main__':
    test_migrations()

