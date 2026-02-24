# Elegant Design System Guide

## Overview

The Great Rudgwick Bake Off has been redesigned with an elegant, classy aesthetic that evokes premium baking competitions and British heritage. This guide documents the complete design system.

---

## Color Palette

### Primary: Antique Gold
Represents excellence, achievement, and quality baking.

```
primary-50:  #fdfaf5  (Cream White)     - Backgrounds, subtle accents
primary-100: #f8f1e5  (Champagne)       - Light backgrounds
primary-200: #efe0c7  (Butter Cream)    - Borders, dividers
primary-300: #e5ca9f  (Wheat)           - Subtle accents
primary-400: #d4ab6a  (Golden)          - Secondary buttons
primary-500: #c49347  (Antique Gold)    - PRIMARY BRAND COLOR
primary-600: #b07d35  (Amber)           - Primary buttons, links
primary-700: #936528  (Bronze)          - Active states
primary-800: #77501f  (Deep Bronze)     - Pressed states
primary-900: #5e3f18  (Umber)           - Dark accents
```

### Secondary: Sage Green
Natural, artisanal accent color for success states and harmony.

```
secondary-500: #5d835d  (Main accent)   - Success indicators
secondary-600: #4a6a4a                  - Darker success
```

### Neutral: Refined Grays
Warm neutrals with subtle beige undertones for sophistication.

```
neutral-50:  #fafaf9   - Page backgrounds
neutral-100: #f5f4f2   - Card backgrounds
neutral-700: #403e3a   - Body text
neutral-900: #1a1917   - Headings
```

---

## Typography

### Font Families

**Display Font (Headings):**
- Font: Playfair Display
- Use: Main titles (h1, h2), hero sections, theme names
- Weights: 400, 600, 700, 800
- Character: Elegant, high-contrast serif

**Sans Font (UI & Body):**
- Font: Inter
- Use: All UI elements, body text, buttons, forms
- Weights: 400, 500, 600, 700
- Character: Clean, modern, highly readable

**Accent Font (Special):**
- Font: Cormorant Garamond
- Use: Taglines, special callouts, quotes
- Weights: 500, 600
- Character: Graceful serif for emphasis

### Typography Scale

```css
text-xs:   12px  - Metadata, timestamps
text-sm:   14px  - Secondary text, captions
text-base: 16px  - Body text (default)
text-lg:   18px  - Emphasized text
text-xl:   20px  - Section titles
text-2xl:  24px  - Card headers
text-3xl:  30px  - Page titles
text-4xl:  36px  - Main headings
text-5xl:  48px  - Hero text
```

### Usage Examples

```jsx
// Headings
<h1 className="font-display text-4xl font-bold text-neutral-900">
  Great Rudgwick Bake Off
</h1>

// Body text
<p className="font-sans text-base text-neutral-700">
  Regular paragraph text
</p>

// Special emphasis
<span className="font-accent text-lg text-primary-700">
  Celebrating Excellence
</span>
```

---

## Component Library

### Buttons

#### Primary Button (Gold Gradient)
```jsx
<button className="btn btn-primary">
  Submit Entry
</button>
```
- Use: Main actions, primary CTAs
- Color: Gold gradient (primary-500 to primary-600)
- Hover: Scales to 1.02x, enhanced shadow
- Active: Scales to 0.98x

#### Secondary Button (Outlined)
```jsx
<button className="btn btn-secondary">
  Cancel
</button>
```
- Use: Secondary actions, cancel buttons
- Style: White background, gold border
- Hover: Gold background tint

#### Danger Button (Red)
```jsx
<button className="btn btn-danger">
  Delete
</button>
```
- Use: Destructive actions
- Color: Red gradient
- Similar interaction to primary

#### Ghost Button (Minimal)
```jsx
<button className="btn btn-ghost">
  Learn More
</button>
```
- Use: Tertiary actions, links
- Style: Transparent, minimal

---

### Cards

#### Base Card
```jsx
<div className="card">
  Content here
</div>
```
- Features: White background, elegant shadow, 8-unit padding
- Border: Subtle neutral-200 with 50% opacity
- Border radius: 12px (elegant)

#### Hover Card
```jsx
<div className="card-hover">
  Interactive content
</div>
```
- Lifts on hover (-4px translateY)
- Enhanced shadow on hover

#### Gold Accent Card
```jsx
<div className="card-gold">
  Premium content
</div>
```
- Left border: 4px primary-500
- Background gradient to primary-50
- Use for: Featured items, current theme

#### Success Card
```jsx
<div className="card-success">
  Success content
</div>
```
- Left border: 4px secondary-500
- Background gradient to secondary-50
- Use for: Success states, achievements

#### Theme Card (Special)
```jsx
<div className="theme-card">
  <h2 className="font-display text-2xl">Chocolate Paradise</h2>
  <p>Description here</p>
</div>
```
- Includes decorative circular element
- Gold accent styling
- Use for: Monthly theme display

---

### Form Inputs

#### Text Input
```jsx
<input
  type="text"
  className="input"
  placeholder="Enter text..."
/>
```
- Height: py-3 (larger touch target)
- Background: Subtle neutral-50 tint
- Border: neutral-300
- Focus: Gold border (primary-500), white background

#### Textarea
```jsx
<textarea
  className="input"
  rows="4"
  placeholder="Description..."
/>
```
- Same styling as input
- Non-resizable by default

#### Select Dropdown
```jsx
<select className="input">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```
- Cursor pointer automatically applied
- Same styling consistency

#### Label
```jsx
<label className="label">
  Field Name *
</label>
```
- Small, semi-bold, uppercase tracking
- Color: neutral-700
- Margin bottom: 0.5rem

---

### Badges

```jsx
<span className="badge badge-gold">New</span>
<span className="badge badge-success">Approved</span>
<span className="badge badge-neutral">Draft</span>
```

- Rounded full shape
- Small, semi-bold text
- Color-coded by type

---

### Medals (Leaderboard)

```jsx
<div className="medal medal-gold">1</div>
<div className="medal medal-silver">2</div>
<div className="medal medal-bronze">3</div>
```

- Circular with gradient backgrounds
- Metallic appearance
- Shadow for depth
- Size: 48x48px (w-12 h-12)

---

### Alerts

```jsx
<div className="alert alert-success">
  Entry submitted successfully!
</div>

<div className="alert alert-error">
  An error occurred
</div>

<div className="alert alert-info">
  Theme has been announced
</div>
```

- Border and background color-matched
- Medium font weight
- Proper padding and border radius

---

## Navigation

### Nav Links

```jsx
<Link to="/path" className="nav-link">
  Dashboard
</Link>

<Link to="/path" className="nav-link nav-link-active">
  Active Page
</Link>
```

**Features:**
- Animated underline on hover
- Underline grows from center (0 to 75% width)
- Active state: Gold color, persistent underline
- Transition: 250ms elegant curve

---

## Shadows

### Shadow System (4 Tiers)

```css
shadow-elegant-sm   - Subtle, for navbars
shadow-elegant      - Standard, for cards at rest
shadow-elegant-md   - Enhanced, for hover states
shadow-elegant-lg   - Pronounced, for modals
```

**Usage:**
```jsx
<div className="shadow-elegant">Default card shadow</div>
<div className="shadow-elegant-md">Elevated element</div>
```

---

## Animations & Transitions

### Timing Functions

```css
duration-200  - Quick interactions (inputs)
duration-300  - Standard (buttons, cards)
ease-elegant  - Custom cubic-bezier(0.4, 0, 0.2, 1)
```

### Common Animations

**Fade In (Page Load):**
```jsx
<div className="animate-fade-in">
  Page content
</div>
```

**Hover Lift:**
```jsx
<div className="hover-lift">
  Lifts on hover
</div>
```

**Button Scale:**
- Hover: scale(1.02)
- Active: scale(0.98)
- Built into .btn classes

---

## Special Effects

### Text Gradient
```jsx
<h1 className="text-gradient-gold">
  Great Rudgwick
</h1>
```
- Gold gradient applied to text
- Transparent clip

### Glassmorphism
```jsx
<nav className="glass">
  Navigation content
</nav>
```
- 90% white background
- Backdrop blur effect
- Use for: Navigation, overlays

---

## Layout & Spacing

### Spacing System (8px Grid)

```
0.5rem = 8px   (2 units)
1rem   = 16px  (4 units)
1.5rem = 24px  (6 units)
2rem   = 32px  (8 units)
3rem   = 48px  (12 units)
```

### Standard Spacings

- Section padding: py-12 (48px)
- Card padding: p-8 (32px)
- Element gaps: gap-6 or gap-8
- Form spacing: space-y-4 or space-y-6

---

## Responsive Design

### Breakpoints

```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px
```

### Mobile Considerations

- Stack navigation on mobile
- Reduce heading sizes proportionally
- Maintain 48px touch targets
- Simplify decorative elements
- Keep elegant feel

---

## Accessibility

### WCAG AA Compliance

- Minimum contrast ratio: 4.5:1 for body text
- Minimum contrast ratio: 3:1 for large text
- Focus indicators: 2px gold ring
- Touch targets: 48x48px minimum

### Focus States

```jsx
<button className="focus-elegant">
  Button with focus ring
</button>
```

All interactive elements maintain visible focus indicators.

---

## Best Practices

### Do's ✅

- Use Playfair Display for headings only
- Maintain consistent spacing (8px grid)
- Apply shadows to create depth hierarchy
- Use gold for primary actions and brand
- Keep generous whitespace
- Animate with purpose (300ms transitions)
- Test contrast ratios

### Don'ts ❌

- Don't use pure black (use neutral-900)
- Don't mix too many font families
- Don't ignore hover states
- Don't use harsh shadows
- Don't forget mobile optimization
- Don't sacrifice accessibility for style

---

## Color Usage Guidelines

| Color | Primary Use | Secondary Use |
|-------|-------------|---------------|
| Gold (primary-500) | Buttons, links, brand | Accents, borders |
| Sage (secondary-500) | Success states | Nature references |
| Neutral-900 | Headings | Body text (700) |
| Neutral-50 | Backgrounds | Card tints |

---

## Quick Reference

### Most Common Classes

```css
/* Buttons */
.btn.btn-primary
.btn.btn-secondary

/* Cards */
.card
.card-hover
.card-gold

/* Text */
.font-display
.font-sans
.text-gradient-gold

/* Layout */
.container.max-w-7xl.mx-auto.px-8
py-12

/* Shadows */
.shadow-elegant
.shadow-elegant-md

/* Animations */
.animate-fade-in
.transition-all.duration-300
```

---

## Examples in Context

### Login Page
```jsx
<div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/20 to-neutral-50 flex items-center justify-center">
  <div className="card max-w-md w-full">
    <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">
      Welcome Back
    </h1>
    <form className="space-y-4">
      <div>
        <label className="label">Email</label>
        <input type="email" className="input" />
      </div>
      <button type="submit" className="w-full btn btn-primary">
        Login
      </button>
    </form>
  </div>
</div>
```

### Theme Card
```jsx
<div className="theme-card">
  <p className="text-sm text-primary-700 uppercase tracking-wider mb-2">
    November 2024 Theme
  </p>
  <h2 className="font-display text-3xl font-bold text-primary-900 mb-3">
    Chocolate Paradise
  </h2>
  <p className="text-primary-800">
    Anything chocolate-based
  </p>
</div>
```

### Leaderboard Entry
```jsx
<div className="card-hover">
  <div className="flex items-center space-x-4">
    <div className="medal medal-gold">1</div>
    <div className="flex-1">
      <h3 className="font-display text-xl font-semibold">
        Triple Chocolate Cake
      </h3>
      <p className="text-neutral-600">by John Smith</p>
    </div>
    <div className="score-display">9.5</div>
  </div>
</div>
```

---

## Maintenance

### Adding New Components

1. Follow existing patterns
2. Use semantic class names
3. Test accessibility
4. Document usage
5. Maintain color consistency

### Updating Colors

Colors are defined in `tailwind.config.js`. Update there for global changes.

### Custom Animations

Add to `index.css` in the animations section at the bottom.

---

**The elegant design system creates a premium, sophisticated experience while maintaining usability and accessibility. Use this guide to ensure consistency across the application.**
