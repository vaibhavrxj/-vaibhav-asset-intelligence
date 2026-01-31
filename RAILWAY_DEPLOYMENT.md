# Railway Deployment Guide for Asset Verifier System
## 🚨 **IMMEDIATE FIX for "Train Not Arrived" Error**

### **CRITICAL STEP - Add PostgreSQL Database**

This error means your app is crashing because it can't find a database. Here's the exact fix:

1. **Go to your Railway Project Dashboard**
2. **Click "+ New"** button
3. **Select "Database"** → **"PostgreSQL"** 
4. **Wait 2 minutes** for database to provision
5. **Verify DATABASE_URL is set**:
   - Go to "Variables" tab
   - You should see `DATABASE_URL` with a postgres:// URL
   - If missing, your PostgreSQL isn't connected properly

6. **Redeploy your app**:
   - Go to "Deployments" tab  
   - Click "Redeploy" on the latest deployment
   - Wait for it to complete

### **Step-by-Step Deployment Logs Check**
1. Railway Dashboard → Your Service → "Deployments" 
2. Click the latest deployment
3. Look for these **ERROR PATTERNS**:

**❌ Database Error:**
```
Error: DATABASE_URL must be set. Did you forget to provision a database?
```
**Fix:** Add PostgreSQL database (steps above)

**❌ Build Failed:**
```
npm run build failed
```
**Fix:** Check if you committed all files, especially `script/build.ts`

**❌ Port/Binding Error:**
```
Error: listen EADDRINUSE
```
**Fix:** Railway auto-assigns PORT, this shouldn't happen

### **Verify Environment Variables**
**Required variables:**
- `DATABASE_URL` (automatic when you add PostgreSQL)
- `NODE_ENV=production` 
- `SESSION_SECRET=your-secure-random-string`

**Optional variables:**
- `AI_INTEGRATIONS_OPENAI_API_KEY` (for AI features)

### **Quick Test After Fix**
After redeploying, your app should work at:
- `https://your-app.railway.app/health` → Should show `{"status":"OK"}`
- `https://your-app.railway.app/api/status` → Should show API status
- `https://your-app.railway.app/` → Should show your React app
## � **Troubleshooting "Train Not Arrived" Error**

If you're seeing this error, here's how to fix it:

### **Step 1: Check Railway Deployment Logs**
1. Go to your Railway project dashboard
2. Click on your service
3. Go to **"Deployments"** tab
4. Click on the latest deployment
5. Check the **"Deploy Logs"** for errors

### **Step 2: Verify Environment Variables**
Your app REQUIRES these environment variables:

1. **`DATABASE_URL`** - Automatically set when you add PostgreSQL
2. **`NODE_ENV=production`** 
3. **`SESSION_SECRET`** - Set to a secure random string

**To check/set variables:**
1. Railway Dashboard → Your Project → "Variables" tab
2. Make sure `DATABASE_URL` is present (should be automatic with PostgreSQL)
3. Add missing variables if needed

### **Step 3: Add PostgreSQL Database (CRITICAL)**
If you haven't added a database yet:
1. In Railway dashboard: **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Wait for it to provision (takes 1-2 minutes)
3. `DATABASE_URL` will automatically appear in your variables

### **Step 4: Redeploy**
After adding the database:
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the latest deployment
3. Wait for it to complete

### **Step 5: Push Database Schema**
Once deployed successfully, run locally:
```bash
# Use the DATABASE_URL from Railway dashboard
export DATABASE_URL="your-railway-postgres-url"
npm run db:push
```

## �🚀 Deploy to Railway

### Prerequisites
1. GitHub account
2. Railway account (sign up at [railway.app](https://railway.app))
3. Your project pushed to GitHub

### Step-by-Step Deployment

#### 1. Push to GitHub (if not already done)
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/asset-verifier-system.git
git push -u origin main
```

#### 2. Deploy on Railway

1. **Go to Railway**: Visit [railway.app](https://railway.app)
2. **Sign in** with GitHub
3. **Create New Project**: Click "New Project"
4. **Deploy from GitHub**: Select "Deploy from GitHub repo"
5. **Select Repository**: Choose your Asset Verifier System repository
6. **Configure**: Railway will automatically detect your Node.js project

#### 3. Add PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

#### 4. Set Environment Variables

In your Railway project dashboard:

1. Go to **"Variables"** tab
2. Add these environment variables:

```
NODE_ENV=production
SESSION_SECRET=your-super-secret-session-key-here
OPENAI_API_KEY=your-openai-api-key-if-needed
```

**Important**: Change `SESSION_SECRET` to a secure random string!

#### 5. Deploy Database Schema

After your app is deployed, you need to push your database schema:

1. In your Railway project, go to the **"Deployments"** tab
2. Wait for the initial deployment to complete
3. In your local terminal, set the Railway PostgreSQL URL:
   ```bash
   # Get the DATABASE_URL from Railway dashboard variables
   export DATABASE_URL="postgresql://username:password@host:port/database"
   npm run db:push
   ```

### 🔧 Configuration Files Created

I've created these files for Railway deployment:

- **`railway.json`**: Railway-specific configuration
- **`nixpacks.toml`**: Build configuration with Node.js and Python support
- **`.env.production`**: Production environment template

### 📦 What Happens During Deployment

1. **Build Phase**:
   - Installs Node.js dependencies (`npm ci`)
   - Builds the production application (`npm run build`)
   - Compiles TypeScript and bundles assets

2. **Deploy Phase**:
   - Starts the production server (`npm run start`)
   - Serves both API and frontend on the assigned port

### 🌐 Access Your Application

After deployment:
- Railway provides a custom URL (e.g., `https://asset-verifier-system-production.up.railway.app`)
- Your app will be accessible worldwide
- HTTPS is automatically configured

### 🎯 Features Supported

✅ **Full-stack deployment** (React frontend + Express backend)  
✅ **PostgreSQL database** with automatic connection  
✅ **Environment variables** management  
✅ **Automatic HTTPS** and custom domains  
✅ **Auto-deployment** from GitHub pushes  
✅ **Health checks** and auto-restart  

### 🔍 Monitoring

Railway provides:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, and network usage
- **Deployments**: History of all deployments

### 🚨 Important Notes

1. **Database**: The app will automatically use PostgreSQL on Railway (not SQLite)
2. **File Storage**: Railway has ephemeral storage, consider using cloud storage for uploaded files
3. **Environment Variables**: Set all required variables in Railway dashboard
4. **Domain**: You can add a custom domain in Railway project settings

### 💰 Pricing

- Railway offers a generous free tier
- Pay-as-you-scale pricing for production apps
- Check [railway.app/pricing](https://railway.app/pricing) for current rates

---

## Quick Deploy Command

If you have Railway CLI installed:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy directly
railway deploy
```

Your Asset Verifier System will be live in minutes! 🎉