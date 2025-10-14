# Deployment Guide - Empathy Mental Health Platform

## Overview
This guide covers deployment of the Empathy platform to production using Netlify (frontend) and a cloud provider for the backend.

## Architecture
- **Frontend**: React + Vite deployed on Netlify
- **Backend**: Node.js + Express + MongoDB deployed on Railway/Render/Heroku
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Domain**: Custom domain (optional)

## Prerequisites
- GitHub account
- Netlify account
- Cloud provider account (Railway/Render/Heroku)
- MongoDB Atlas cluster
- Cloudinary account
- Domain name (optional)

## 1. Backend Deployment

### Option A: Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Connect your GitHub repository
3. Select the `backend/server` folder as root
4. Set environment variables:
   ```
   NODE_ENV=production
   PORT=8000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-netlify-domain.netlify.app
   ```
5. Deploy and get your backend URL

### Option B: Render
1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Set root directory to `backend/server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables (same as above)

### Option C: Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set buildpack: `heroku buildpacks:set heroku/nodejs`
4. Add environment variables: `heroku config:set KEY=value`
5. Deploy: `git subtree push --prefix backend/server heroku main`

## 2. Frontend Deployment on Netlify

### Step 1: Prepare Environment Variables
1. Copy `.env.production.template` to `.env.production`
2. Fill in your production values:
   ```
   VITE_API_BASE_URL=https://your-backend-url.railway.app/api
   VITE_SOCKET_URL=https://your-backend-url.railway.app
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_NODE_ENV=production
   ```

### Step 2: Deploy to Netlify
#### Option A: GitHub Integration (Recommended)
1. Push code to GitHub (private repository)
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect to GitHub and select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`
6. Add environment variables in Netlify dashboard
7. Deploy

#### Option B: Manual Deploy
1. Build locally: `npm run build:production`
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Login: `netlify login`
4. Deploy: `netlify deploy --prod --dir=dist`

### Step 3: Configure Custom Domain (Optional)
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain
3. Configure DNS records
4. Enable HTTPS (automatic with Netlify)

## 3. Environment Variables

### Frontend (.env.production)
```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_NODE_ENV=production
```

### Backend (Railway/Render/Heroku)
```env
NODE_ENV=production
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/empathy
JWT_SECRET=your_super_secure_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-domain.netlify.app
```

## 4. Post-Deployment Checklist

### Frontend
- [ ] Site loads without errors
- [ ] All pages accessible
- [ ] API calls working
- [ ] Image uploads working
- [ ] Authentication working
- [ ] Responsive design working
- [ ] Performance is acceptable

### Backend
- [ ] API endpoints responding
- [ ] Database connected
- [ ] Image upload to Cloudinary working
- [ ] JWT authentication working
- [ ] CORS configured correctly
- [ ] Logs are accessible

### Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] No sensitive data in logs

## 5. Monitoring & Maintenance

### Performance Monitoring
- Use Netlify Analytics
- Monitor Lighthouse scores
- Check Core Web Vitals

### Error Tracking
- Setup Sentry (optional)
- Monitor server logs
- Set up uptime monitoring

### Backup Strategy
- MongoDB Atlas automatic backups
- Regular database exports
- Version control for code

## 6. Troubleshooting

### Common Issues
1. **Build Fails**: Check Node version and dependencies
2. **API Not Working**: Verify environment variables and CORS
3. **Images Not Loading**: Check Cloudinary configuration
4. **404 Errors**: Ensure redirects are configured in netlify.toml

### Debug Commands
```bash
# Test build locally
npm run build:production

# Test production build locally  
npm run preview

# Check environment variables
netlify env:list

# View build logs
netlify logs
```

## 7. CI/CD Pipeline (Optional)

For automatic deployments, the current setup with Netlify + GitHub already provides:
- Automatic builds on push to main branch
- Deploy previews for pull requests
- Rollback capabilities
- Branch deployments

## Support
- Frontend: Netlify Support
- Backend: Railway/Render/Heroku Support  
- Database: MongoDB Atlas Support
- CDN: Cloudinary Support

---

**Note**: Replace all placeholder URLs and keys with your actual values before deployment.