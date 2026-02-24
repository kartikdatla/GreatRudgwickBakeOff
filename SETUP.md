# Quick Setup Guide

## Prerequisites
- Node.js installed (v16+)
- Terminal/Command line access

## Step-by-Step Setup

### 1. Install Backend
```bash
cd backend
npm install
```

### 2. Setup Environment
```bash
# Create .env file from example
cp .env.example .env

# Edit .env if needed (optional for local dev)
# Default values work fine for testing
```

### 3. Initialize Database
```bash
npm run init-db
```

You should see:
```
Connected to SQLite database
Users table ready
Themes table ready
...
Database initialization complete!
```

### 4. Install Frontend
```bash
cd ../frontend
npm install
```

### 5. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

Open your browser to: **http://localhost:3000**

### 7. Create Your First Admin User

You'll need to create an admin user manually. Here are two options:

#### Option A: Register and Update Database

1. Register a user through the web interface
2. Stop the backend server
3. Open the database with SQLite:
```bash
cd backend
sqlite3 database.sqlite
```
4. Update the user to Admin:
```sql
UPDATE users SET role = 'Admin' WHERE email = 'your-email@example.com';
.quit
```
5. Restart the backend

#### Option B: Create Admin via Script

Create `backend/src/scripts/createAdmin.js`:
```javascript
require('dotenv').config();
const User = require('../models/User');

async function createAdmin() {
  const email = 'admin@example.com';
  const password = 'admin123';
  const name = 'Admin User';

  try {
    const user = await User.create(email, password, name, 'Admin');
    console.log('Admin user created:', user);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createAdmin();
```

Run it:
```bash
node src/scripts/createAdmin.js
```

### 8. Test the Application

1. Login with your admin credentials
2. Navigate to "Draw Theme" and draw the first monthly theme
3. Create additional test users (Bakers, Judges, Spectators)
4. Test submitting entries, scoring, and viewing the leaderboard

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use, change them:

**Backend** - Edit `backend/.env`:
```
PORT=5001
```

**Frontend** - Edit `frontend/vite.config.js`:
```javascript
server: {
  port: 3001,
  // ...
}
```

### Database Errors
Delete and reinitialize:
```bash
cd backend
rm database.sqlite
npm run init-db
```

### Module Not Found
Reinstall dependencies:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Upload Directory Missing
```bash
mkdir -p backend/uploads
```

## Production Deployment

### Environment Variables
Set these in production:
```
PORT=5000
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Build Frontend
```bash
cd frontend
npm run build
```

### Serve Frontend from Backend
Update `backend/src/server.js` to serve the built frontend:
```javascript
// After other middleware
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Before 404 handler
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});
```

### Run Production
```bash
cd backend
npm start
```

## Done! 🎉

Your Great Rudgwick Bake Off application should now be running!
