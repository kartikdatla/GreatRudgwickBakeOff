# System Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                     http://localhost:3000                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    REACT FRONTEND (Vite)                     │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │   Pages      │  Components  │      Context             │ │
│  │ - Login      │  - Layout    │  - AuthContext           │ │
│  │ - Dashboard  │  - Nav       │  - User State            │ │
│  │ - Judging    │              │                          │ │
│  │ - Leaderboard│              │                          │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                            │                                 │
│                     API Service (Axios)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ REST API Calls
                            │ JWT Token in Headers
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS BACKEND                          │
│                   http://localhost:5000                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  - CORS                                              │   │
│  │  - Body Parser                                       │   │
│  │  - JWT Authentication                                │   │
│  │  - Role Authorization                                │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │              Route Handlers                          │   │
│  │  /api/auth      /api/themes    /api/submissions     │   │
│  │  /api/scores    /api/resources                      │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │              Controllers                             │   │
│  │  - authController                                    │   │
│  │  - themeController                                   │   │
│  │  - submissionController                              │   │
│  │  - scoreController                                   │   │
│  │  - resourceController                                │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │                 Models (Data Access)                 │   │
│  │  User | Theme | Submission | Score | Resource       │   │
│  └─────────────────────┬────────────────────────────────┘   │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite DATABASE                           │
│                     database.sqlite                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tables:                                              │   │
│  │  • users                                             │   │
│  │  • themes                                            │   │
│  │  • theme_pool                                        │   │
│  │  • submissions                                       │   │
│  │  • scores                                            │   │
│  │  • resources                                         │   │
│  │  • settings                                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     FILE SYSTEM                              │
│                  backend/uploads/                            │
│              (Stores uploaded images)                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### 1. User Login Flow

```
User enters credentials
        ↓
React Login Page
        ↓
POST /api/auth/login
        ↓
authController.login()
        ↓
User.findByEmail()
        ↓
User.verifyPassword()
        ↓
generateToken() (JWT)
        ↓
Return { token, user }
        ↓
Store in localStorage
        ↓
Update AuthContext
        ↓
Redirect to Dashboard
```

### 2. Submit Entry Flow

```
Baker uploads photo + details
        ↓
SubmitEntry Page (FormData)
        ↓
POST /api/submissions (multipart/form-data)
        ↓
Multer middleware (file upload)
        ↓
submissionController.create()
        ↓
Check: already submitted?
        ↓
Check: theme locked?
        ↓
Submission.create()
        ↓
Save to database
        ↓
Return success
        ↓
Navigate to Submissions page
```

### 3. Judge Scoring Flow

```
Judge selects submission
        ↓
Judging Page loads scores
        ↓
GET /api/scores/submission/:id/judge
        ↓
scoreController.getJudgeScore()
        ↓
Load existing score (if any)
        ↓
Judge adjusts sliders (1-10)
        ↓
POST /api/scores/submission/:id
        ↓
scoreController.submitScore()
        ↓
Check: theme locked?
        ↓
Score.create() or Score.update()
        ↓
Return success
        ↓
Show success message
```

### 4. Leaderboard Display Flow

```
User visits Leaderboard
        ↓
GET /api/scores/leaderboard/:themeId
        ↓
scoreController.getLeaderboard()
        ↓
Settings.areScoresRevealed()
        ↓
Score.getLeaderboard(revealed)
        ↓
SQL: JOIN submissions, users, scores
        ↓
Calculate averages
        ↓
Return ranked list
        ↓
Display with/without details
```

## Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Register/Login
     ▼
┌────────────────┐
│ Auth Controller│
└────┬───────────┘
     │
     │ 2. Verify credentials
     │    Hash password (register)
     │    Compare hash (login)
     ▼
┌────────────────┐
│  User Model    │
└────┬───────────┘
     │
     │ 3. Generate JWT token
     │    Payload: { id, email, name, role }
     │    Sign with JWT_SECRET
     ▼
┌────────────────┐
│  Return Token  │
└────┬───────────┘
     │
     │ 4. Store in localStorage
     │    Set Authorization header
     ▼
┌────────────────┐
│  All API calls │──────┐
│  include token │      │
└────────────────┘      │
                        │
     ┌──────────────────┘
     │ 5. Middleware validates
     ▼
┌────────────────┐
│ authenticateToken │
│ authorizeRoles    │
└────┬───────────┘
     │
     │ 6. Decode & verify
     │    Check role permissions
     ▼
┌────────────────┐
│ Access granted │
│ or denied      │
└────────────────┘
```

## Role-Based Access Matrix

```
┌──────────────────────┬───────┬───────┬───────┬───────────┐
│      Feature         │ Admin │ Baker │ Judge │ Spectator │
├──────────────────────┼───────┼───────┼───────┼───────────┤
│ Draw Theme           │   ✓   │   ✗   │   ✗   │     ✗     │
│ Submit Entry         │   ✗   │   ✓   │   ✗   │     ✗     │
│ Score Submissions    │   ✗   │   ✗   │   ✓   │     ✗     │
│ View Submissions     │   ✓   │   ✓   │   ✓   │     ✓     │
│ View Leaderboard     │   ✓   │   ✓   │   ✓   │     ✓     │
│ Lock Theme           │   ✓   │   ✗   │   ✗   │     ✗     │
│ Reveal Scores        │   ✓   │   ✗   │   ✗   │     ✗     │
│ Add Resources        │   ✓   │   ✗   │   ✓   │     ✗     │
│ Delete Resources     │   ✓   │   ✗   │   ✗   │     ✗     │
└──────────────────────┴───────┴───────┴───────┴───────────┘
```

## Database Relationships

```
┌─────────────┐
│    users    │
│  (id, role) │
└──────┬──────┘
       │
       ├─────────────────────────┬─────────────────────┐
       │                         │                     │
       │ user_id                 │ judge_id            │ created_by
       ▼                         ▼                     ▼
┌──────────────┐          ┌──────────┐        ┌──────────────┐
│ submissions  │          │  scores  │        │  resources   │
│ (id, title)  │          │ (1-10)   │        │ (url, cat)   │
└──────┬───────┘          └────┬─────┘        └──────────────┘
       │                       │
       │ theme_id              │ submission_id
       │                       │
       ▼                       │
┌──────────────┐               │
│   themes     │◄──────────────┘
│ (month/year) │
└──────────────┘
       ▲
       │ drawn from
       │
┌──────────────┐
│  theme_pool  │
│  (12 themes) │
└──────────────┘

┌──────────────┐
│   settings   │
│ (key, value) │
└──────────────┘
```

## Component Hierarchy (Frontend)

```
App (Router)
│
├─ Login Page
├─ Register Page
│
└─ Layout (Authenticated)
   │
   ├─ Navigation Bar
   │  ├─ Logo
   │  ├─ Menu Links (role-based)
   │  └─ User Info + Logout
   │
   └─ Outlet (Page Content)
      │
      ├─ Dashboard
      │  ├─ Active Theme Card
      │  └─ Quick Action Cards
      │
      ├─ ThemeDraw (Admin only)
      │  └─ Random Theme Picker
      │
      ├─ SubmitEntry (Baker only)
      │  ├─ Theme Display
      │  ├─ Upload Form
      │  └─ Image Preview
      │
      ├─ Submissions
      │  └─ Grid of Entry Cards
      │
      ├─ Judging (Judge only)
      │  ├─ Submission List
      │  ├─ Selected Submission View
      │  └─ Scoring Form (4 sliders)
      │
      ├─ Leaderboard
      │  └─ Ranked Submissions List
      │     ├─ Scores (if revealed)
      │     └─ Judge Count
      │
      ├─ Resources
      │  ├─ Add Resource Form (Admin/Judge)
      │  └─ Categorized Link Cards
      │
      └─ AdminPanel (Admin only)
         ├─ Theme Status
         ├─ Lock Theme Button
         └─ Reveal Scores Toggle
```

## State Management

```
┌────────────────────────────────────────────┐
│          AuthContext (Global)              │
│  ┌──────────────────────────────────────┐  │
│  │ user: { id, email, name, role }      │  │
│  │ login(email, password)               │  │
│  │ register(...)                        │  │
│  │ logout()                             │  │
│  │ isAdmin(), isJudge(), isBaker()      │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
               │
               │ Provides to all components
               ▼
┌────────────────────────────────────────────┐
│        Component Local State               │
│  ┌──────────────────────────────────────┐  │
│  │ useState for form data               │  │
│  │ useState for loading states          │  │
│  │ useState for error/success messages  │  │
│  │ useEffect for data fetching          │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

## File Upload Flow

```
User selects image file
        ↓
FileInput onChange
        ↓
Create preview URL
        ↓
FormData.append('image', file)
        ↓
POST /api/submissions
        ↓
Multer middleware
  ├─ Check file type
  ├─ Check file size (< 5MB)
  └─ Generate unique filename (UUID)
        ↓
Save to backend/uploads/
        ↓
Store path in database
        ↓
Serve via /uploads/:filename
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│  1. Transport Layer                         │
│     - HTTPS (production)                    │
│     - CORS configuration                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  2. Authentication Layer                    │
│     - JWT token verification                │
│     - Token expiration (7 days)             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  3. Authorization Layer                     │
│     - Role-based middleware                 │
│     - Route-level permissions               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  4. Input Validation Layer                  │
│     - File type/size validation             │
│     - SQL injection prevention              │
│     - XSS protection                        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  5. Data Layer                              │
│     - Parameterized queries                 │
│     - Password hashing (bcrypt)             │
└─────────────────────────────────────────────┘
```

---

**This architecture provides a scalable, secure, and maintainable foundation for the Great Rudgwick Bake Off application.**
