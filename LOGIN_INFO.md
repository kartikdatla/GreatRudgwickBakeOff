# 🎂 Great Rudgwick Bake Off - Access Information

## Application is Running! ✅

### Access URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api

### Default Admin Credentials
```
Email: admin@bakeoff.com
Password: admin123
```

⚠️ **IMPORTANT**: Please change the admin password after first login!

## Quick Start Guide

### 1. Login as Admin
- Go to http://localhost:3000
- Login with the credentials above

### 2. Draw This Month's Theme
- Click "Draw Theme" in the navigation
- Click the "Draw Theme" button to randomly select a theme

### 3. Create Test Users
- Logout and click "Register"
- Create users with different roles:
  - Baker - Can submit entries
  - Judge - Can score submissions
  - Spectator - Can only view

### 4. Test the Full Workflow
- **As Baker**: Submit an entry with a photo
- **As Judge**: Score the submissions
- **As Admin**: Lock the theme and reveal scores
- **View**: Check the leaderboard!

## Database Location
- SQLite database: `/Users/kartikdatla/GreatRudgwickBakeOff/backend/database.sqlite`
- Uploaded images: `/Users/kartikdatla/GreatRudgwickBakeOff/backend/uploads/`

## Server Management

### Check Server Status
```bash
# Backend
curl http://localhost:5001/api/health

# Frontend
curl http://localhost:3000
```

### View Server Logs
```bash
# Backend logs
tail -f /tmp/backend.log

# Frontend logs
tail -f /tmp/frontend.log
```

### Stop Servers
```bash
pkill -f "nodemon src/server.js"
pkill -f "vite"
```

### Restart Servers
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## Default Themes Available
1. Chocolate Paradise
2. Fruity Delights
3. Vintage Classic
4. Rainbow Colors
5. Autumn Harvest
6. Tropical Escape
7. Coffee & Caramel
8. Nutty Adventure
9. Citrus Burst
10. Floral Fantasy
11. Spice Route
12. Childhood Favorite

## Role Capabilities

| Feature | Admin | Baker | Judge | Spectator |
|---------|-------|-------|-------|-----------|
| Draw Theme | ✅ | ❌ | ❌ | ❌ |
| Submit Entry | ❌ | ✅ | ❌ | ❌ |
| Score Submissions | ❌ | ❌ | ✅ | ❌ |
| View Submissions | ✅ | ✅ | ✅ | ✅ |
| View Leaderboard | ✅ | ✅ | ✅ | ✅ |
| Lock Theme | ✅ | ❌ | ❌ | ❌ |
| Reveal Scores | ✅ | ❌ | ❌ | ❌ |
| Manage Resources | ✅ | ❌ | ✅ | ❌ |

## Troubleshooting

### Can't access the application?
- Check both servers are running (see "Check Server Status" above)
- Make sure ports 3000 and 5001 are not blocked by firewall

### Login not working?
- Verify database was initialized: `ls backend/database.sqlite`
- Check backend logs: `tail -f /tmp/backend.log`

### Need to reset everything?
```bash
# Stop servers
pkill -f "nodemon src/server.js"
pkill -f "vite"

# Delete database
rm backend/database.sqlite

# Reinitialize
cd backend
npm run init-db
node src/scripts/createAdminAuto.js

# Restart servers
npm run dev &
cd ../frontend
npm run dev &
```

## Support

For detailed documentation, see:
- **QUICKSTART.md** - Fast setup guide
- **README.md** - Complete documentation
- **SETUP.md** - Detailed setup with troubleshooting
- **DEPLOYMENT.md** - Production deployment guide

---

**Everything is set up and ready to use! Open http://localhost:3000 and start baking! 🎂**
