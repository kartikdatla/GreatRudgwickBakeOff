# Great Rudgwick Bake Off 🎂

A full-stack web application for organizing and managing workplace baking competitions with theme randomization, photo submissions, anonymous judging, and score management.

## Features

### Core Functionality
- **Random Theme Generation**: Draw monthly themes from a curated pool
- **Photo Submissions**: Bakers can upload photos of their creations
- **Anonymous Scoring**: Judges rate submissions on taste, presentation, creativity, and overall impression
- **Score Reveal Control**: Admin controls when scores become visible to users
- **Leaderboard**: Real-time rankings with detailed breakdowns
- **Resources Section**: Curated links for baking supplies, boxes, and decorations
- **Week Locking**: Prevent submissions and scoring after deadline

### Role-Based Access Control
- **Admin**: Draw themes, lock weeks, reveal scores, manage resources
- **Baker**: Submit entries with photos and descriptions
- **Judge**: Score submissions anonymously with detailed criteria
- **Spectator**: View submissions and leaderboard

## Tech Stack

### Backend
- Node.js with Express
- SQLite database
- JWT authentication
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Vite for build tooling

## Project Structure

```
GreatRudgwickBakeOff/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Express server
│   ├── uploads/             # Uploaded images
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React context (auth)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   └── App.jsx          # Main app component
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and set your values:
# PORT=5000
# JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# JWT_EXPIRES_IN=7d
```

### Step 3: Initialize Database
```bash
npm run init-db
```

This creates the SQLite database with all tables and populates the theme pool with 12 default themes.

### Step 4: Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:3000

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Run Backend:**
```bash
cd backend
npm start
```

## Usage Guide

### First Time Setup

1. **Create Admin Account**: Register the first user with Admin role (you'll need to manually set this in the database or create a seed script)

2. **Draw First Theme**: Admin navigates to "Draw Theme" to randomly select the month's theme

3. **Invite Staff**: Share the registration link with staff members to create their accounts

### Monthly Workflow

1. **Admin draws monthly theme** (beginning of month)
2. **Bakers submit entries** (throughout the week)
3. **Judges score submissions** (end of week, anonymously)
4. **Admin locks the theme** (prevents more submissions/scoring)
5. **Admin reveals scores** (makes scores visible to everyone)
6. **View leaderboard** (celebrate the winners!)

### Role Permissions

| Action | Admin | Baker | Judge | Spectator |
|--------|-------|-------|-------|-----------|
| Draw Theme | ✅ | ❌ | ❌ | ❌ |
| Submit Entry | ❌ | ✅ | ❌ | ❌ |
| Score Submissions | ❌ | ❌ | ✅ | ❌ |
| View Submissions | ✅ | ✅ | ✅ | ✅ |
| View Leaderboard | ✅ | ✅ | ✅ | ✅ |
| Lock Theme | ✅ | ❌ | ❌ | ❌ |
| Reveal Scores | ✅ | ❌ | ❌ | ❌ |
| Manage Resources | ✅ | ❌ | ✅ | ❌ |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)

### Themes
- `POST /api/themes/draw` - Draw random theme (Admin only)
- `GET /api/themes/active` - Get active theme
- `GET /api/themes` - Get all themes
- `PATCH /api/themes/:themeId/lock` - Lock theme (Admin only)

### Submissions
- `POST /api/submissions` - Create submission (Baker only)
- `GET /api/submissions/theme/:themeId` - Get submissions for theme
- `GET /api/submissions/:id` - Get submission by ID
- `DELETE /api/submissions/:id` - Delete submission (Baker only, own submissions)

### Scores
- `POST /api/scores/submission/:submissionId` - Submit/update score (Judge only)
- `GET /api/scores/submission/:submissionId` - Get submission scores
- `GET /api/scores/submission/:submissionId/judge` - Get judge's score (Judge only)
- `GET /api/scores/leaderboard/:themeId` - Get leaderboard
- `POST /api/scores/reveal` - Reveal/hide scores (Admin only)

### Resources
- `POST /api/resources` - Create resource (Admin/Judge)
- `GET /api/resources` - Get all resources
- `GET /api/resources/category/:category` - Get resources by category
- `DELETE /api/resources/:id` - Delete resource (Admin only)

## Database Schema

### Tables
- **users**: User accounts with role-based access
- **themes**: Monthly themes (name, description, month, year)
- **theme_pool**: Available themes for random drawing
- **submissions**: Baker entries (photos, descriptions)
- **scores**: Judge ratings (taste, presentation, creativity, overall)
- **resources**: Helpful links organized by category
- **settings**: Application settings (score visibility, etc.)

## Default Themes

The application includes 12 pre-loaded themes:
- Chocolate Paradise
- Fruity Delights
- Vintage Classic
- Rainbow Colors
- Autumn Harvest
- Tropical Escape
- Coffee & Caramel
- Nutty Adventure
- Citrus Burst
- Floral Fantasy
- Spice Route
- Childhood Favorite

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Input sanitization

## Future Enhancements

- Email notifications for new themes and winners
- Advanced analytics and historical trends
- Multi-month competitions
- Social sharing features
- Mobile app
- Recipe sharing
- Comments and discussions
- Image optimization and thumbnails

## Contributing

This is a workplace project for Great Rudgwick. Internal contributions are welcome!

## License

Proprietary - Internal Use Only

## Support

For questions or issues, contact the IT department or project maintainer.

---

**Happy Baking! 🎂✨**
