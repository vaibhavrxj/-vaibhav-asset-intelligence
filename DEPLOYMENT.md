# 🚀 Deployment Guide

## Quick Setup for GitHub

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Asset Verifier System with Claude Haiku 4.5"
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `Asset-Verifier-System`
3. Don't initialize with README (we already have one)

### 3. Push to GitHub
```bash
git remote add origin https://github.com/yourusername/Asset-Verifier-System.git
git branch -M main
git push -u origin main
```

## 🌐 Deployment Options

### Option 1: GitHub Pages (Static Frontend Only)

**Pros:** Free, easy setup, automatic deployment
**Cons:** Limited to static content, no server-side features

1. **Enable GitHub Pages:**
   - Go to your repository settings
   - Scroll to "Pages" section
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/` (root)

2. **Deploy:**
   ```bash
   npm install -g gh-pages
   npm run deploy:gh
   ```

3. **Access:** `https://yourusername.github.io/Asset-Verifier-System`

### Option 2: Vercel (Full-Stack)

**Pros:** Full-stack support, serverless functions, easy setup
**Cons:** Usage limits on free tier

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Configure Environment Variables:**
   - Add your API keys in Vercel dashboard
   - Set `AI_INTEGRATIONS_OPENAI_API_KEY`
   - Set `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Option 3: Netlify (Static + Serverless)

**Pros:** Great for static sites, serverless functions
**Cons:** Limited server capabilities

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy:**
   ```bash
   npm run build:client
   netlify deploy --prod --dir=dist/public
   ```

### Option 4: Heroku (Full Server)

**Pros:** Full server environment, database support
**Cons:** No longer free tier

1. **Install Heroku CLI**
2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set AI_INTEGRATIONS_OPENAI_API_KEY=your_key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Copy `.env.template` to `.env`
- [ ] Fill in all required API keys
- [ ] Test locally with `npm run dev`
- [ ] Build succeeds with `npm run build`

### Repository Setup
- [ ] Update README.md with your information
- [ ] Replace placeholder URLs with actual deployment URL
- [ ] Add proper repository description
- [ ] Set up repository topics/tags

### Security
- [ ] Ensure `.env` is in `.gitignore`
- [ ] API keys are set as environment variables, not in code
- [ ] CORS settings are configured for production domain

### Testing
- [ ] All features work locally
- [ ] Database migrations run successfully
- [ ] AI chat functionality works
- [ ] Asset verification features operational

## 🔧 Production Configuration

### For GitHub Pages (Frontend Only)
- Update base URL in vite.config.ts
- Configure API endpoints for external backend
- Use environment variables for API URLs

### For Full-Stack Deployment
- Set NODE_ENV=production
- Configure CORS for your domain
- Set up production database
- Configure session secrets

## 🌍 Custom Domain Setup

### GitHub Pages
1. Add `CNAME` file to repository root:
   ```
   yourdomain.com
   ```

2. Configure DNS:
   - Add CNAME record pointing to `yourusername.github.io`

### Other Platforms
- Follow platform-specific domain configuration guides
- Update CORS settings to include your custom domain

## 📊 Monitoring & Analytics

### Recommended Tools
- **Vercel Analytics** (if using Vercel)
- **Google Analytics** for user tracking
- **LogRocket** for error tracking
- **Uptime Robot** for monitoring

### Performance Optimization
- Enable gzip compression
- Configure CDN for static assets
- Optimize images and assets
- Enable caching headers

## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Ensure all dependencies are installed
- Verify environment variables are set

**API Connection Issues:**
- Verify API keys are correct
- Check CORS configuration
- Ensure base URLs are properly configured

**Database Issues:**
- Run database migrations
- Check database URL configuration
- Verify database permissions

## 📞 Support

If you encounter issues:
1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first
4. Check GitHub Issues for known problems

---

**Happy Deploying! 🚀**