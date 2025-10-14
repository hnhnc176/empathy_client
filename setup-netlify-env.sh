#!/bin/bash

# Netlify Environment Setup Script
# This script helps you set up environment variables for Netlify deployment

echo "🚀 Setting up Netlify Environment Variables for Empathy App"
echo "=================================================="
echo ""

echo "📋 Copy and paste these environment variables into your Netlify Dashboard:"
echo "   Go to: Site Settings > Environment Variables"
echo ""

echo "# API Configuration"
echo "VITE_API_BASE_URL=https://empathy-backend.onrender.com"
echo "VITE_SOCKET_URL=https://empathy-backend.onrender.com"
echo ""

echo "# App Configuration"
echo "VITE_APP_NAME=Empathy"
echo "VITE_APP_ENVIRONMENT=production"
echo "VITE_NODE_ENV=production"
echo ""

echo "# Feature Flags"
echo "VITE_ENABLE_WEBSOCKET=true"
echo "VITE_ENABLE_NOTIFICATIONS=true"
echo "VITE_ENABLE_ANALYTICS=false"
echo "VITE_ENABLE_DEBUG_MODE=false"
echo "VITE_ENABLE_PERFORMANCE_MONITORING=true"
echo "VITE_ENABLE_HTTPS=true"
echo ""

echo "# Cloudinary Configuration"
echo "VITE_CLOUDINARY_CLOUD_NAME=dbbrslu7j"
echo "VITE_CLOUDINARY_UPLOAD_PRESET=empathy_uploads"
echo ""

echo "# API Configuration"
echo "VITE_API_TIMEOUT=15000"
echo "VITE_API_RETRY_ATTEMPTS=3"
echo ""

echo "# Frontend URL"
echo "VITE_FRONTEND_URL=https://empathyforum.netlify.app"
echo ""

echo "=================================================="
echo "✅ Environment variables listed above"
echo ""
echo "📝 Instructions:"
echo "1. Go to your Netlify dashboard"
echo "2. Select your site"
echo "3. Go to Site Settings > Environment Variables"
echo "4. Add each variable listed above"
echo "5. Redeploy your site"
echo ""
echo "🔧 The main fix applied:"
echo "   - Changed API URL from Railway to Render"
echo "   - Removed duplicate /api path"
echo "   - Updated service worker to avoid API interference"
echo "   - Copied all assets to public folder"
echo ""