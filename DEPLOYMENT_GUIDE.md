# Deployment Guide: Great Rudgwick Bake Off

## 🏗️ Architecture Overview

Your app has two parts:
1. **Frontend**: React app (static files) → Can deploy to Netlify/Vercel
2. **Backend**: Node.js API + SQLite database → Needs a server (Render/Railway/Fly.io)

**You need TWO services:**
- ❌ Netlify alone won't work (backend needs Node.js server)
- ✅ Netlify (frontend) + Render/Railway (backend)
- ✅ OR Vercel (frontend + backend serverless functions)

---

## 🎯 Recommended: Netlify + Render (Free Tier)

### Option 1: Netlify (Frontend) + Render (Backend)

**Why this combo?**
- Both have free tiers
- Easy to set up
- Render supports SQLite + file storage
- Good for small projects

---

## 📦 Step 1: Prepare Your Code

### 1.1 Update Backend for Production

Create `backend/.env.production`:
```env
NODE_ENV=production
PORT=10000
DATABASE_PATH=./database.sqlite
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=https://your-app.netlify.app
```

Create `backend/src/config/database.js` update:
```javascript
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
```

### 1.2 Update Frontend API URL

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

Update `frontend/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
```

### 1.3 Add Build Scripts

Update `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node src/config/migrate.js && node src/config/migrateReveal.js"
  }
}
```

Update `frontend/package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Push to GitHub

```bash
cd /Users/kartikdatla/GreatRudgwickBakeOff

# Initialize git if not already
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/bakeoff.git
git push -u origin main
```

### 2.2 Deploy on Render

1. Go to https://render.com
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:

**Settings:**
```
Name: bakeoff-api
Region: Frankfurt (closest to UK)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run migrate
Start Command: npm start
Instance Type: Free
```

**Environment Variables (Add these):**
```
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-random-string-here
CORS_ORIGIN=*
```

6. Click "Create Web Service"
7. Wait 5-10 minutes for deployment
8. Copy your backend URL: `https://bakeoff-api.onrender.com`

**⚠️ Important Notes:**
- Free tier sleeps after 15 min inactivity (30-60 sec cold start)
- SQLite data persists on Render's disk
- For production with many users, upgrade to paid tier or use PostgreSQL

---

## 🌐 Step 3: Deploy Frontend to Netlify

### 3.1 Update API URL

Edit `frontend/.env.production`:
```env
VITE_API_URL=https://bakeoff-api.onrender.com/api
```

Or create `frontend/src/config.js`:
```javascript
export const API_URL = import.meta.env.PROD
  ? 'https://bakeoff-api.onrender.com/api'
  : 'http://localhost:5001/api';
```

Update `frontend/src/services/api.js`:
```javascript
import { API_URL } from '../config';
const baseURL = API_URL;
```

### 3.2 Build Frontend Locally (Test)

```bash
cd frontend
npm run build
# Check dist/ folder is created
```

### 3.3 Deploy on Netlify

**Option A: Drag & Drop**
1. Go to https://netlify.com
2. Sign up / Log in
3. Drag `frontend/dist` folder to Netlify
4. Get URL: `https://random-name.netlify.app`

**Option B: Git Deploy (Better)**
1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/dist
```

**Environment Variables:**
```
VITE_API_URL=https://bakeoff-api.onrender.com/api
```

5. Click "Deploy site"
6. Get URL: `https://your-app.netlify.app`

### 3.4 Update CORS on Backend

Go back to Render dashboard:
1. Open your backend service
2. Environment → Add variable:
```
CORS_ORIGIN=https://your-app.netlify.app
```
3. Redeploy backend

---

## 🔧 Alternative: Deploy Everything on Render

If you want everything in one place:

### Backend (Same as above)
Follow Step 2 exactly.

### Frontend as Static Site

1. Render Dashboard → "New +" → "Static Site"
2. Connect GitHub repo
3. Configure:
```
Name: bakeoff-frontend
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

Environment Variables:
```
VITE_API_URL=https://bakeoff-api.onrender.com/api
```

---

## 🎯 Alternative: Vercel (Frontend + Serverless Backend)

**⚠️ Harder Setup but Possible:**

Vercel can host both, but:
- Backend needs to be serverless functions (restructure needed)
- SQLite doesn't work well with serverless (use Vercel Postgres instead)
- More complex migration

**Not recommended for this project unless you want to rewrite backend.**

---

## 🗄️ Database Considerations

### Current: SQLite
- ✅ Simple, no external DB needed
- ✅ Works on Render free tier
- ⚠️ Data on server disk (can be lost if server restarts)
- ⚠️ No backups on free tier
- ❌ Doesn't work on serverless (Netlify Functions, Vercel Functions)

### Upgrade Options (if needed):

**1. Render PostgreSQL (Free Tier)**
```bash
# Render Dashboard → New → PostgreSQL
# Get connection string
# Update backend to use PostgreSQL instead of SQLite
```

**2. Supabase (Free Tier)**
```bash
# Go to supabase.com
# Create project
# Get PostgreSQL connection string
# Update backend
```

**3. Planetscale (Free Tier - MySQL)**
```bash
# Go to planetscale.com
# Better for production scale
```

**For now: SQLite on Render is fine** for <100 users.

---

## 📸 File Upload Considerations

### Current: Local File Storage
Your app stores images in `backend/uploads/`

**On Render:**
- ✅ Works on free tier
- ⚠️ Files deleted if server restarts/redeploys
- ⚠️ Limited disk space

**Production Solutions:**

**Option 1: Cloudinary (Free Tier - 25GB)**
```bash
npm install cloudinary multer-storage-cloudinary

# Update multer config to use Cloudinary
```

**Option 2: AWS S3 (Cheap, scalable)**
```bash
npm install aws-sdk multer-s3
# Configure S3 bucket
```

**Option 3: Render Disks (Paid)**
- Persistent storage
- $1-2/month for 1GB

**For now: Local storage is fine** for testing.

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Change `JWT_SECRET` to random string
- [ ] Update CORS origin to production URL
- [ ] Add `.env.production` files
- [ ] Test build locally: `npm run build`
- [ ] Push code to GitHub
- [ ] Remove sensitive data from git (add to `.gitignore`)

### Backend Deployment (Render)
- [ ] Create Render account
- [ ] Create Web Service from GitHub
- [ ] Set environment variables
- [ ] Run migrations on first deploy
- [ ] Test API: `https://your-backend.onrender.com/api/health`
- [ ] Copy backend URL

### Frontend Deployment (Netlify)
- [ ] Update API_URL to backend URL
- [ ] Create Netlify account
- [ ] Deploy from GitHub or drag dist/
- [ ] Set environment variables
- [ ] Test site loads
- [ ] Update CORS on backend with frontend URL

### Post-Deployment
- [ ] Test registration/login
- [ ] Test theme drawing
- [ ] Test file uploads
- [ ] Test role-based views (admin/judge/baker)
- [ ] Test reveal functionality
- [ ] Check colors/animations work

---

## 🔐 Security Checklist

### Before Going Live:
```bash
# 1. Change JWT secret (backend .env)
JWT_SECRET=use-a-long-random-string-here-min-32-chars

# 2. Generate random secret:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Update .env on Render with new secret
```

### Additional Security:
- [ ] Add rate limiting (express-rate-limit)
- [ ] Add helmet for security headers
- [ ] Validate all user inputs
- [ ] Set strong CORS policy
- [ ] Use HTTPS only (Render/Netlify provide this free)

---

## 📊 Monitoring & Logs

### Render Logs:
```
Dashboard → Your Service → Logs tab
See real-time server logs
```

### Netlify Logs:
```
Dashboard → Your Site → Deploys → Deploy log
See build logs
```

### Check Health:
```bash
# Backend health check
curl https://bakeoff-api.onrender.com/api/health

# Frontend check
curl https://your-app.netlify.app
```

---

## 💰 Cost Breakdown (Free Tier)

### Netlify Free:
- ✅ 100GB bandwidth/month
- ✅ Unlimited sites
- ✅ HTTPS included
- ✅ Automatic deploys from git

### Render Free:
- ✅ 750 hours/month (enough for 1 service)
- ✅ 512MB RAM
- ✅ Sleeps after 15 min inactivity
- ✅ HTTPS included
- ⚠️ Cold start: 30-60 seconds

### Total Cost: $0/month
**Good for:** Testing, demos, small workplace use (<50 people)

### When to Upgrade:

**Render Paid ($7/month):**
- No sleep
- More RAM
- Persistent disk for files
- Custom domain

**Netlify Pro ($19/month):**
- More bandwidth
- Password protection
- Better analytics

---

## 🚀 Quick Deploy Commands

### Push to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Build Frontend Locally:
```bash
cd frontend
npm run build
```

### Test Production Build:
```bash
cd frontend
npm run preview
```

---

## 🆘 Troubleshooting

### "API not accessible" in production
- Check CORS_ORIGIN is set correctly
- Verify backend URL in frontend .env
- Check Render logs for errors

### "Database error" on Render
- Run migrations: `npm run migrate` in build command
- Check database file permissions
- Verify DATABASE_PATH env variable

### "Page not found" on refresh (Netlify)
Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

### "Cold start is slow"
- Free tier sleeps after 15 min
- Upgrade to paid tier ($7/month) for always-on
- Or use "keep-alive" service (ping every 14 min)

---

## 📚 Resources

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **React Deployment**: https://vitejs.dev/guide/static-deploy.html
- **Express Production**: https://expressjs.com/en/advanced/best-practice-performance.html

---

## ✨ Your URLs After Deployment

```
Frontend: https://great-rudgwick-bakeoff.netlify.app
Backend:  https://bakeoff-api.onrender.com
API:      https://bakeoff-api.onrender.com/api
```

**Ready to deploy!** 🚀

Start with Step 1 (preparing your code) and follow the guide sequentially.
