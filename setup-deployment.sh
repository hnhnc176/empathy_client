#!/bin/bash

# GitHub Repository Setup Script for Empathy Platform
# This script helps setup the project for deployment

echo "🚀 Setting up Empathy Platform for deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
    print_status "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    print_warning ".gitignore not found. Please create one."
else
    print_status ".gitignore exists"
fi

# Create .env.production if it doesn't exist
if [ ! -f ".env.production" ]; then
    print_info "Creating .env.production from template..."
    cp .env.production.template .env.production
    print_warning "Please edit .env.production with your actual values"
else
    print_status ".env.production already exists"
fi

# Add all files to git
print_info "Adding files to git..."
git add .

# Check for changes
if git diff --cached --quiet; then
    print_info "No changes to commit"
else
    print_info "Committing changes..."
    git commit -m "🚀 Prepare project for deployment

- Add Netlify configuration
- Add deployment documentation  
- Add environment templates
- Fix import paths after refactoring
- Organize component structure"
fi

print_status "Repository prepared for deployment!"

echo ""
echo "📋 Next steps:"
echo "1. Create a private repository on GitHub"
echo "2. Add the remote: git remote add origin https://github.com/username/empathy.git"
echo "3. Push to GitHub: git push -u origin main"
echo "4. Connect to Netlify and deploy"
echo "5. Deploy backend to Railway/Render/Heroku"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"