# Theme Management Guide

## Overview

The application now includes comprehensive theme management capabilities that allow administrators to customize, edit, add, and manage all themes for the baking competition.

## Features

### 1. Edit Active Theme ✏️
- Change the name and description of the currently active theme
- Cannot edit if the theme is locked
- Changes are reflected immediately throughout the application

### 2. Theme Pool Management 📚
- View all available themes in the pool
- See which themes have been used
- Add new custom themes
- Edit existing themes in the pool
- Delete unused themes
- Reset the entire pool (mark all themes as available again)

### 3. Theme Status Indicators 🔍
- **Active themes** show month/year and lock status
- **Used themes** in the pool are marked as "(Used)"
- **Locked themes** cannot be edited

## How to Access

### As Admin:
1. Login to the application
2. Click **"Manage Themes"** in the navigation bar
3. Or go to **Admin Panel** → Click "Manage and edit themes"
4. Direct URL: `http://localhost:3000/theme-management`

## Managing the Active Theme

### Edit Active Theme
1. Go to Theme Management page
2. Find the "Current Active Theme" section
3. Click **"Edit"** button
4. Modify the name and/or description
5. Click **"Save Changes"**
6. Or click **"Cancel"** to discard changes

**Note:** You cannot edit a locked theme. Unlock it first from the Admin Panel if needed.

### Theme Information
- **Name**: The title of the theme (e.g., "Chocolate Paradise")
- **Description**: Brief explanation or guidelines (e.g., "Anything chocolate-based")
- **Month/Year**: When the theme is active
- **Lock Status**: Whether submissions and scoring are still allowed

## Managing the Theme Pool

### View Theme Pool
The theme pool shows all available themes that can be randomly drawn. Each theme shows:
- Theme name
- Description
- Usage status (Used/Available)

### Add New Theme
1. Click **"+ Add Theme"** button
2. Enter theme name (required)
3. Enter description (optional)
4. Click **"Add to Pool"**

**Example:**
```
Name: Tropical Paradise
Description: Use tropical fruits like mango, pineapple, and coconut
```

### Edit Theme in Pool
1. Find the theme you want to edit
2. Click **"Edit"** next to the theme
3. Modify name and/or description
4. Click **"Save"** to confirm or **"Cancel"** to discard

### Delete Theme from Pool
1. Find an **unused** theme (not marked as "Used")
2. Click **"Delete"** next to the theme
3. Confirm the deletion

**Note:** You cannot delete themes that have already been used. This prevents data integrity issues.

### Reset Theme Pool
Use this to make all themes available again (marks them as unused):

1. Click **"🔄 Reset Theme Pool"** button (top right)
2. Confirm the action
3. All themes will be marked as available for drawing

**When to use:**
- Starting a new competition cycle
- After completing a full year of themes
- When you want to reuse previously drawn themes

## API Endpoints

### Active Theme Management
- `PATCH /api/themes/:themeId` - Update active theme name/description

### Theme Pool Management
- `GET /api/themes/pool/all` - Get all themes from pool
- `POST /api/themes/pool` - Add new theme to pool
- `PATCH /api/themes/pool/:themeId` - Update theme in pool
- `DELETE /api/themes/pool/:themeId` - Delete unused theme from pool
- `POST /api/themes/pool/reset` - Reset pool (mark all as available)

## Use Cases

### Scenario 1: Customize Current Month's Theme
Your team decided "Chocolate Paradise" is too broad.

1. Go to Theme Management
2. Edit active theme
3. Change name to "Dark Chocolate Delights"
4. Update description to "Focus on dark chocolate (70% or higher)"
5. Save changes

### Scenario 2: Add Company-Specific Themes
Add themes relevant to your workplace culture:

1. Click "Add Theme"
2. Add "Annual Meeting Special" with description "Celebrate our yearly success"
3. Add "Team Building Treat" with description "Recipes that can be shared"
4. Add "Sustainability Challenge" with description "Use local, organic ingredients"

### Scenario 3: Remove Unwanted Theme
You have a theme that doesn't fit:

1. Find the theme in the pool
2. Verify it hasn't been used yet
3. Click Delete
4. Confirm deletion

### Scenario 4: Start New Year Fresh
Beginning a new competition year:

1. Click "Reset Theme Pool"
2. Confirm the reset
3. All 12 themes are now available again
4. Draw the first theme of the new year

## Tips & Best Practices

### Theme Naming
- ✅ Keep names concise (2-4 words)
- ✅ Make them exciting and inspiring
- ✅ Use clear, descriptive language
- ❌ Avoid overly complex names

### Theme Descriptions
- ✅ Provide clear guidelines
- ✅ Give examples if helpful
- ✅ Keep it under 1-2 sentences
- ✅ Be specific enough to guide bakers
- ❌ Don't be too restrictive

### Pool Management
- Keep 10-15 themes in the pool
- Balance between specific and broad themes
- Consider seasonal relevance
- Update descriptions based on feedback
- Reset pool annually or as needed

### Active Theme Editing
- Only edit if truly necessary (after drawing)
- Avoid major changes after submissions start
- Communicate changes to all participants
- Don't edit locked themes (unlock first if needed)

## Workflow Integration

### Monthly Cycle with Editing
```
1. Draw random theme
2. Review theme with team
3. Edit if needed (before submissions)
4. Bakers submit entries
5. Judges score
6. Admin locks theme
7. Admin reveals scores
8. Next month: Draw new theme
```

### Annual Pool Refresh
```
1. End of year
2. Review which themes worked well
3. Edit problematic themes
4. Add new exciting themes
5. Delete themes that didn't work
6. Reset pool for new year
7. Start fresh competition cycle
```

## Troubleshooting

### Can't Edit Active Theme
**Problem:** Edit button is grayed out or doesn't appear
**Solution:** Check if theme is locked. Go to Admin Panel → Unlock the theme if needed

### Can't Delete Theme
**Problem:** Delete button doesn't appear
**Solution:** You can only delete themes that haven't been used. Used themes remain in the pool.

### Changes Not Showing
**Problem:** Updated theme but old name still shows
**Solution:** Refresh the page. Changes are saved immediately to the database.

### Reset Pool Warning
**Problem:** Accidentally clicked reset
**Solution:** You'll see a confirmation dialog. Click "Cancel" if it was a mistake. If already confirmed, you can manually edit the `theme_pool` table in the database to restore `is_used` flags.

## Database Details

### Theme Pool Table Structure
```sql
theme_pool (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_used BOOLEAN DEFAULT 0
)
```

### Active Themes Table Structure
```sql
themes (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  month INTEGER,
  year INTEGER,
  is_active BOOLEAN,
  locked_at DATETIME
)
```

## Security

- Only Admin role can access theme management
- All endpoints require JWT authentication
- Locked themes cannot be edited (must unlock first)
- Used themes cannot be deleted (data integrity)
- Pool reset requires confirmation

## Future Enhancements

Potential features for future versions:
- Theme preview before drawing
- Theme voting system
- Theme categories/tags
- Theme difficulty levels
- Seasonal theme suggestions
- Theme history and statistics
- Export/import theme pools
- Theme templates

---

**Enjoy creating the perfect themes for your baking competition! 🎂**
