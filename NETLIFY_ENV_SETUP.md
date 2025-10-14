# Netlify Environment Variables Setup Guide

## 📋 Required Environment Variables for Netlify

Copy and paste these environment variables to your Netlify dashboard:

**Site Settings > Environment Variables > Add new variable**

### 🗄️ Database Configuration
```
MONGODB_URI = mongodb+srv://ngochuynh0176_db_user:b6SabpGIpi7NkPQt@clusterf.dcegn0t.mongodb.net/empathy?retryWrites=true&w=majority&appName=ClusterF
```

### 🔐 Authentication Configuration  
```
JWT_SECRET = c08451249556f34165fa0054bd15b8e3a83416b25d32e287903dedc6913a7e41203ddc83f795441703ba7636aa383f94177ee369b72858a493c5677111c73bfb
JWT_EXPIRES_IN = 7d
```

### 📷 Cloudinary Configuration (Image Upload)
```
CLOUDINARY_CLOUD_NAME = dbbrslu7j
CLOUDINARY_API_KEY = 232297847759159  
CLOUDINARY_API_SECRET = m01gv_YrujCUCHqBNsDS4Ca0ojg
```

### 📧 Email Configuration
```
EMAIL_USER = huynhngc176@gmail.com
EMAIL_PASSWORD = qqtx ajol tljr tvsa
```

### 🌐 App Configuration
```
NODE_ENV = production
PORT = 8888
FRONTEND_URL = https://your-site-name.netlify.app
```

## 🚀 Deployment Steps:

1. **Deploy first** to get your Netlify URL
2. **Update FRONTEND_URL** with your actual Netlify URL  
3. **Redeploy** to apply the correct CORS settings

## ⚠️ Important Notes:

- Replace `your-site-name` in FRONTEND_URL with your actual Netlify site name
- All values should be entered WITHOUT quotes in Netlify dashboard
- Make sure to set the environment to "Production"

## 🔧 After adding all variables:

1. Go to **Deploys** tab
2. Click **Deploy site** 
3. Monitor build logs for any errors