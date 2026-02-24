# Testing the Sub-Theme Reveal Feature

## Overview
The sub-theme is now hidden from judges until the admin reveals it at the end of the week. This prevents judges from seeing the secret judging criteria until after bakers have submitted their entries.

## How It Works

### Initial State (Theme Drawn)
- **Admin**: Can see both main theme AND sub-theme immediately
- **Judge**: Can see only main theme, sees "🔒 Judging criteria will be revealed by the admin at the end of the week"
- **Baker**: Can see only main theme (as before)

### After Admin Reveals (End of Week)
- **Admin**: Can see both themes and has option to hide again
- **Judge**: Can now see the sub-theme for scoring
- **Baker**: Still sees only main theme (unchanged)

---

## Test Steps

### Step 1: Setup Test Users
You'll need 3 test accounts:

1. **Admin User**
   - Email: admin@test.com
   - Role: Admin
   - Can draw themes, reveal/hide sub-themes

2. **Judge User**
   - Email: judge@test.com
   - Role: Judge
   - Can score entries, sees sub-theme only when revealed

3. **Baker User**
   - Email: baker@test.com
   - Role: Baker
   - Submits entries, never sees sub-theme

### Step 2: Draw a New Theme (As Admin)

1. Navigate to http://localhost:3002
2. Login as **admin@test.com**
3. Click "Draw This Month's Theme"
4. A theme will be drawn (e.g., Main: "Cakes", Sub: "Chocolate Paradise")
5. You should see:
   - Main theme: "Cakes"
   - Sub-theme box with: "🎯 Chocolate Paradise - Anything chocolate-based"
   - Button: "🔓 Reveal Sub-Theme to Judges"

### Step 3: Check Judge View (Before Reveal)

1. Logout (or open incognito window)
2. Login as **judge@test.com**
3. On Dashboard, you should see:
   - Main theme: "Cakes"
   - Sub-theme box with: "🔒 Judging criteria will be revealed by the admin at the end of the week"
   - NO actual sub-theme details visible
4. Theme card will have chocolate-brown colors (from sub-theme)

### Step 4: Check Baker View

1. Logout (or open another incognito window)
2. Login as **baker@test.com**
3. On Dashboard, you should see:
   - Main theme: "Cakes"
   - Description: "Layer cakes, bundt cakes, cheesecakes..."
   - Message: "🎲 Surprise the judges with your creativity!"
   - NO sub-theme mentioned at all
4. Baker can now submit any type of cake

### Step 5: Reveal to Judges (As Admin - End of Week)

1. Go back to admin account (http://localhost:3002)
2. Login as **admin@test.com**
3. On Dashboard, click button: "🔓 Reveal Sub-Theme to Judges"
4. Button should change to: "🔒 Hide Sub-Theme from Judges"
5. Sub-theme is now visible to judges

### Step 6: Verify Judge Can Now See Sub-Theme

1. Switch to judge account
2. Refresh Dashboard
3. You should now see:
   - Main theme: "Cakes"
   - Sub-theme box with: "🎯 Chocolate Paradise - Anything chocolate-based"
   - Full judging criteria revealed!
4. Judge can now score entries with this knowledge

### Step 7: Test Hide Functionality (Optional)

1. As admin, click "🔒 Hide Sub-Theme from Judges"
2. Sub-theme becomes hidden again
3. Judge will see the locked message again
4. This can be toggled any time

---

## Visual Indicators

### Admin View (Always Shows Sub-Theme)
```
┌─────────────────────────────────────┐
│  FEB 2025 Theme                     │
│                                     │
│  Cakes                              │
│  Layer cakes, bundt cakes...        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Secret Judging Criteria     │   │
│  │ 🎯 Chocolate Paradise       │   │
│  │ Anything chocolate-based    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [🔓 Reveal Sub-Theme to Judges]   │
└─────────────────────────────────────┘
```

### Judge View (Before Reveal)
```
┌─────────────────────────────────────┐
│  FEB 2025 Theme                     │
│                                     │
│  Cakes                              │
│  Layer cakes, bundt cakes...        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Secret Judging Criteria     │   │
│  │ 🔒 Judging criteria will be │   │
│  │    revealed by the admin at │   │
│  │    the end of the week      │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Judge View (After Reveal)
```
┌─────────────────────────────────────┐
│  FEB 2025 Theme                     │
│                                     │
│  Cakes                              │
│  Layer cakes, bundt cakes...        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Secret Judging Criteria     │   │
│  │ 🎯 Chocolate Paradise       │   │
│  │ Anything chocolate-based    │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Baker View (Always Hidden)
```
┌─────────────────────────────────────┐
│  FEB 2025 Theme                     │
│                                     │
│  Cakes                              │
│  Layer cakes, bundt cakes...        │
│                                     │
│  🎲 Surprise the judges with your   │
│     creativity!                     │
└─────────────────────────────────────┘
```

---

## API Endpoints

### Reveal Sub-Theme to Judges
```bash
PATCH /api/themes/:themeId/reveal
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Sub-theme revealed to judges successfully"
}
```

### Hide Sub-Theme from Judges
```bash
PATCH /api/themes/:themeId/hide
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Sub-theme hidden from judges successfully"
}
```

### Get Active Theme (Role-Based)
```bash
GET /api/themes/active
Authorization: Bearer <user_token>
```

**Response (Admin):**
```json
{
  "theme": {
    "id": 1,
    "month": 2,
    "year": 2025,
    "revealed_to_judges": false,
    "mainTheme": {
      "id": 1,
      "name": "Cakes",
      "description": "Layer cakes, bundt cakes..."
    },
    "subTheme": {
      "id": 1,
      "name": "Chocolate Paradise",
      "description": "Anything chocolate-based"
    },
    "colors": { ... }
  }
}
```

**Response (Judge - Not Revealed):**
```json
{
  "theme": {
    "id": 1,
    "month": 2,
    "year": 2025,
    "revealed_to_judges": false,
    "mainTheme": {
      "id": 1,
      "name": "Cakes",
      "description": "Layer cakes, bundt cakes..."
    },
    "colors": { ... }
    // NO subTheme field
  }
}
```

**Response (Judge - After Reveal):**
```json
{
  "theme": {
    "id": 1,
    "month": 2,
    "year": 2025,
    "revealed_to_judges": true,
    "mainTheme": { ... },
    "subTheme": {
      "id": 1,
      "name": "Chocolate Paradise",
      "description": "Anything chocolate-based"
    },
    "colors": { ... }
  }
}
```

---

## Database Schema

### themes table - New Column
```sql
revealed_to_judges BOOLEAN DEFAULT 0
```

- `0` (false): Sub-theme hidden from judges
- `1` (true): Sub-theme visible to judges

---

## Workflow Timeline

### Monday (Week Start)
1. Admin draws theme
2. Bakers see only main category (e.g., "Cakes")
3. Judges see only main category + locked message
4. Bakers submit entries throughout the week

### Friday (End of Week)
1. Admin clicks "Reveal Sub-Theme to Judges"
2. Judges can now see "Chocolate Paradise" criteria
3. Judges score entries with full knowledge
4. Bakers still don't see the sub-theme

### Next Monday (Results)
1. Scores revealed
2. Bakers find out what the judging criteria was
3. Creates "Aha!" moments when results are announced

---

## Benefits

1. **Fair Competition**: Bakers can't target specific criteria
2. **Strategic Judging**: Judges get consistent criteria without influencing submissions
3. **Controlled Reveal**: Admin decides exact timing
4. **Transparency**: Everyone eventually learns the criteria
5. **Flexibility**: Admin can hide/reveal multiple times if needed

---

## Notes

- The reveal status is stored in the database (`revealed_to_judges` column)
- Status persists across sessions (not just in memory)
- Each theme can have its reveal status toggled independently
- Colors are always visible (they come from sub-theme but don't reveal the theme itself)

---

**System Status:** ✅ Ready for Testing
- Backend: Running on port 5001
- Frontend: Running on port 3002
- Database: Updated with `revealed_to_judges` column

**Start testing by registering/logging in with the three user types!** 🎂✨
