#!/bin/bash

# Bash script to test ML inference service locally
# Run this in Git Bash

echo "🚀 ML Inference Service Test Suite"
echo "=================================================="

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed or not in PATH"
    exit 1
fi

# Check if pip is available
if ! command -v pip &> /dev/null; then
    echo "❌ Error: pip is not installed or not in PATH"
    exit 1
fi

echo "✅ Python and pip found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "Using requirements-inference.txt..."

if [ -f "requirements-inference.txt" ]; then
    pip install -r requirements-inference.txt
    if [ $? -ne 0 ]; then
        echo "⚠️  Some dependencies failed to install, trying safe versions..."
        if [ -f "requirements-inference-safe.txt" ]; then
            pip install -r requirements-inference-safe.txt
            if [ $? -ne 0 ]; then
                echo "❌ Failed to install dependencies"
                exit 1
            fi
        else
            echo "❌ No safe requirements file found"
            exit 1
        fi
    fi
else
    echo "❌ requirements-inference.txt not found"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Test the service
echo "🧪 Testing ML Inference Service..."
python test-inference.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed! Your inference service is ready for deployment."
    echo ""
    echo "🚀 To deploy, run:"
    echo "   ./deploy-inference.sh"
    echo ""
    echo "   Or with custom parameters:"
    echo "   ./deploy-inference.sh YOUR_PROJECT_ID YOUR_REGION SERVICE_NAME"
else
    echo ""
    echo "⚠️  Some tests failed. Please check the errors above."
    exit 1
fi

