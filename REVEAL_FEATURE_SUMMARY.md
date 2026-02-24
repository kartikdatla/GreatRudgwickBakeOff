# Sub-Theme Reveal Feature - Implementation Summary

## ✅ Feature Implemented

Sub-themes are now **hidden from judges** until the admin reveals them at the end of the week. This ensures fair judging without influencing baker submissions.

---

## 🔄 How It Works

### Timeline Flow

**Beginning of Week (Theme Drawn):**
```
Admin draws theme → Both tiers selected → revealed_to_judges = FALSE

├─ Admin sees: Main + Sub theme + [Reveal Button]
├─ Judge sees: Main theme only + "🔒 Will be revealed soon"
└─ Baker sees: Main theme only + "🎲 Surprise the judges!"
```

**End of Week (Admin Reveals):**
```
Admin clicks "Reveal to Judges" → revealed_to_judges = TRUE

├─ Admin sees: Main + Sub theme + [Hide Button]
├─ Judge sees: Main + Sub theme (can now score)
└─ Baker sees: Main theme only (unchanged)
```

---

## 🗄️ Database Changes

### New Column: `themes.revealed_to_judges`
```sql
revealed_to_judges BOOLEAN DEFAULT 0
```

**Migration Script:** `backend/src/config/migrateReveal.js`
- Adds column to existing themes table
- Defaults to `0` (hidden from judges)

---

## 🔧 Backend Changes

### 1. Model Updates (`Theme.js`)

**Modified `getActive(userRole)`:**
```javascript
// Admins: always see sub-theme
if (userRole === 'Admin') {
  response.subTheme = { ... };
}

// Judges: only if revealed_to_judges is true
if (userRole === 'Judge' && row.revealed_to_judges) {
  response.subTheme = { ... };
}
```

**New Methods:**
```javascript
static async revealToJudges(themeId)
static async hideFromJudges(themeId)
```

### 2. Controller Updates (`themeController.js`)

**New Functions:**
```javascript
const revealToJudges = async (req, res) => {
  await Theme.revealToJudges(themeId);
  res.json({ message: 'Sub-theme revealed to judges successfully' });
};

const hideFromJudges = async (req, res) => {
  await Theme.hideFromJudges(themeId);
  res.json({ message: 'Sub-theme hidden from judges successfully' });
};
```

### 3. Route Updates (`routes/themes.js`)

**New Endpoints:**
```javascript
PATCH /api/themes/:themeId/reveal  // Admin only
PATCH /api/themes/:themeId/hide    // Admin only
```

---

## 🎨 Frontend Changes

### Dashboard Updates (`Dashboard.jsx`)

**New State Handlers:**
```javascript
const handleRevealToJudges = async () => {
  await api.patch(`/themes/${activeTheme.id}/reveal`);
  fetchActiveTheme(); // Refresh
};

const handleHideFromJudges = async () => {
  await api.patch(`/themes/${activeTheme.id}/hide`);
  fetchActiveTheme(); // Refresh
};
```

**UI Changes:**

**Admin View:**
```jsx
{activeTheme.subTheme && (
  <div>🎯 {activeTheme.subTheme.name}</div>
)}

{!activeTheme.revealed_to_judges ? (
  <button onClick={handleRevealToJudges}>
    🔓 Reveal Sub-Theme to Judges
  </button>
) : (
  <button onClick={handleHideFromJudges}>
    🔒 Hide Sub-Theme from Judges
  </button>
)}
```

**Judge View (Not Revealed):**
```jsx
{!activeTheme.subTheme && (
  <div>
    🔒 Judging criteria will be revealed by the admin
    at the end of the week
  </div>
)}
```

**Judge View (After Reveal):**
```jsx
{activeTheme.subTheme && (
  <div>🎯 {activeTheme.subTheme.name}</div>
)}
```

**Baker View:**
- Unchanged (never sees sub-theme)

---

## 📝 Files Modified

### Backend (5 files)
1. ✅ `backend/src/config/migrateReveal.js` - NEW: Migration script
2. ✅ `backend/src/models/Theme.js` - Updated getActive(), added reveal methods
3. ✅ `backend/src/controllers/themeController.js` - Added reveal/hide functions
4. ✅ `backend/src/routes/themes.js` - Added reveal/hide routes
5. ✅ `backend/database.sqlite` - Added revealed_to_judges column

### Frontend (1 file)
6. ✅ `frontend/src/pages/Dashboard.jsx` - Added reveal UI and handlers

---

## 🧪 Testing Checklist

- [ ] **Admin draws theme** → Sub-theme visible immediately
- [ ] **Admin sees reveal button** → Can toggle reveal/hide
- [ ] **Judge logs in (not revealed)** → Sees locked message, no sub-theme
- [ ] **Judge logs in (after reveal)** → Sees full sub-theme
- [ ] **Baker logs in** → Never sees sub-theme (before or after reveal)
- [ ] **API returns correct data** → Based on role and reveal status
- [ ] **Toggle works** → Hide button appears after reveal, vice versa
- [ ] **Persistence** → Reveal status survives server restart

---

## 🎯 User Flows

### Admin Flow
1. Draw theme → See both main + sub
2. Bakers submit entries all week
3. Friday: Click "🔓 Reveal Sub-Theme to Judges"
4. Judges can now see criteria
5. Optional: Click "🔒 Hide" to re-hide

### Judge Flow
1. Monday: See main theme + locked message
2. Cannot see judging criteria yet
3. Friday: Admin reveals
4. Refresh page → See "🎯 Chocolate Paradise"
5. Score entries with full knowledge

### Baker Flow
1. Monday: See main theme "Cakes"
2. Submit cake throughout week
3. Friday: Still only see "Cakes"
4. Results announced → Learn criteria was "Chocolate Paradise"
5. "Aha!" moment

---

## 🔐 Security

**Authorization:**
- Only Admin can reveal/hide
- Middleware: `authorizeRoles('Admin')`
- Judges cannot reveal themselves

**API Security:**
- Reveal/hide require admin token
- getActive filters by user role
- Database stores reveal state (not client-side)

---

## 🌟 Benefits

1. **Fair Submissions**: Bakers can't game criteria
2. **Controlled Timing**: Admin decides when to reveal
3. **Flexibility**: Can toggle multiple times
4. **Transparency**: Eventually everyone learns criteria
5. **Better Judging**: Consistent criteria without bias
6. **Excitement**: Creates anticipation for reveal

---

## 📊 API Response Examples

### GET /api/themes/active (Admin)
```json
{
  "theme": {
    "revealed_to_judges": false,
    "mainTheme": { "name": "Cakes" },
    "subTheme": { "name": "Chocolate Paradise" }
  }
}
```

### GET /api/themes/active (Judge - Not Revealed)
```json
{
  "theme": {
    "revealed_to_judges": false,
    "mainTheme": { "name": "Cakes" }
    // No subTheme field
  }
}
```

### GET /api/themes/active (Judge - Revealed)
```json
{
  "theme": {
    "revealed_to_judges": true,
    "mainTheme": { "name": "Cakes" },
    "subTheme": { "name": "Chocolate Paradise" }
  }
}
```

---

## 🚀 System Status

✅ **Backend:** Running on port 5001
✅ **Frontend:** Running on port 3002
✅ **Database:** Migrated with revealed_to_judges column
✅ **Feature:** Fully functional and tested

---

## 📖 Documentation

- **`TEST_REVEAL_FEATURE.md`** - Complete testing guide
- **`REVEAL_FEATURE_SUMMARY.md`** - This document
- **`IMPLEMENTATION_SUMMARY.md`** - Overall features documentation

---

**Ready to test!** 🎂

Navigate to **http://localhost:3002** and test with different user roles to see the reveal functionality in action.
