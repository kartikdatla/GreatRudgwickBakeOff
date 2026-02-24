# CSS Compilation Fixes Applied

## Problem
Custom Tailwind utilities defined in `tailwind.config.js` cannot be used with the `@apply` directive in certain versions of Tailwind CSS. This was causing multiple CSS compilation errors.

## Root Cause
When you extend Tailwind's configuration with custom utilities like:
- Custom font families (`font-display`, `font-accent`)
- Custom shadows (`shadow-elegant`, `shadow-elegant-md`, etc.)
- Custom timing functions (`ease-elegant`)

These cannot be used inside `@apply` directives. They must be applied as direct CSS properties instead.

---

## Fixes Applied to `frontend/src/index.css`

### 1. Button Shadow Fixes (3 instances)

**`.btn-primary` (Line ~42)**
```css
/* BEFORE */
@apply hover:shadow-elegant-md;

/* AFTER */
/* Removed from @apply, added separate rule */
.btn-primary:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
}
```

**`.btn-secondary` (Line ~50)**
```css
/* BEFORE */
@apply hover:shadow-elegant;

/* AFTER */
.btn-secondary:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.03);
}
```

**`.btn-danger` (Line ~57)**
```css
/* BEFORE */
@apply hover:shadow-elegant-md;

/* AFTER */
.btn-danger:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
}
```

### 2. Card Shadow Fixes (3 instances)

**`.card` (Line ~92)**
```css
/* BEFORE */
@apply shadow-elegant;

/* AFTER */
/* Removed from @apply, added as direct property */
box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.03);
```

**`.card-hover` (Line ~97)**
```css
/* BEFORE */
@apply hover:shadow-elegant-md;

/* AFTER */
.card-hover:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
}
```

**`.card-elevated` (Line ~101)**
```css
/* BEFORE */
@apply shadow-elegant-md;

/* AFTER */
box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
```

### 3. Medal Shadow Fix (1 instance)

**`.medal` (Line ~187)**
```css
/* BEFORE */
@apply shadow-elegant-md;

/* AFTER */
box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
```

### 4. Font Family Fixes (2 instances)

**`.stat-value` (Line ~181)**
```css
/* BEFORE */
@apply font-display;

/* AFTER */
font-family: 'Playfair Display', serif;
```

**`.score-display` (Line ~223)**
```css
/* BEFORE */
@apply font-display;

/* AFTER */
font-family: 'Playfair Display', serif;
```

### 5. Previous Fixes (Already Applied)

**`h1, h2, h3` heading styles**
```css
/* BEFORE */
@apply font-display;

/* AFTER */
font-family: 'Playfair Display', serif;
```

**`.btn` timing function**
```css
/* BEFORE */
@apply ease-elegant;

/* AFTER */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

**`.nav-link::after` animation**
```css
/* BEFORE */
@apply duration-250 ease-elegant;

/* AFTER */
transition-duration: 250ms;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Shadow Values Reference

For future reference, here are the shadow values defined in `tailwind.config.js`:

```javascript
boxShadow: {
  'elegant-sm': '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)',
  'elegant': '0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.03)',
  'elegant-md': '0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
  'elegant-lg': '0 8px 16px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.06)',
}
```

---

## Result

✅ **All CSS compilation errors have been resolved**

The application now compiles successfully with Vite without any PostCSS errors. All custom utilities have been properly converted to direct CSS properties where needed.

---

## Best Practice Going Forward

**When using custom Tailwind utilities:**

1. ✅ **CAN use in HTML classes**:
   ```jsx
   <div className="shadow-elegant-md font-display">...</div>
   ```

2. ❌ **CANNOT use in @apply**:
   ```css
   .my-class {
     @apply shadow-elegant-md font-display; /* ERROR */
   }
   ```

3. ✅ **Instead, use direct CSS**:
   ```css
   .my-class {
     box-shadow: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
     font-family: 'Playfair Display', serif;
   }
   ```

---

**Total Fixes Applied**: 11 instances across index.css
**Compilation Status**: ✅ Success (Vite ready in 279ms on port 3001)
