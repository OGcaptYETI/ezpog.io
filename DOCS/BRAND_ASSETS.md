# EZPOG.io Brand Assets

## Brand Colors

### Primary Colors

**Prussian Blue** (Primary Brand Color)
- Hex: `#0A273A`
- RGB: 10, 39, 58
- CMYK: 83, 33, 0, 77
- Usage: Headers, primary UI elements, backgrounds

**Spanish Orange** (Secondary Brand Color)
- Hex: `#E26713`
- RGB: 226, 103, 19
- CMYK: 0, 54, 92, 11
- Usage: Call-to-action buttons, highlights, accents

**Syracuse Red Orange** (Accent Color)
- Hex: `#CC5329`
- RGB: 204, 83, 41
- CMYK: 0, 59, 80, 20
- Usage: Secondary accents, alerts, warnings

## Logo Assets

### Favicon
- **File:** `public/FAV (Favicon)_B.png`
- **Usage:** Browser tab icon, bookmarks
- **Format:** PNG

### Header Logo
- **File:** `public/Header_Left_100x300.png`
- **Dimensions:** 100x300px
- **Usage:** Main navigation header, website header
- **Format:** PNG

### Login/Signup Branding
- **File:** `public/Login_500x500.png`
- **Dimensions:** 500x500px
- **Usage:** Authentication pages (login/signup)
- **Format:** PNG

## Tailwind CSS Usage

The brand colors are available in Tailwind:

```jsx
// Prussian Blue (Primary)
className="bg-brand-prussian text-brand-prussian"

// Spanish Orange (Secondary)
className="bg-brand-orange text-brand-orange"

// Syracuse Red Orange (Accent)
className="bg-brand-red-orange text-brand-red-orange"
```

## Direct CSS Usage

```css
/* Prussian Blue */
background-color: #0A273A;
color: #0A273A;

/* Spanish Orange */
background-color: #E26713;
color: #E26713;

/* Syracuse Red Orange */
background-color: #CC5329;
color: #CC5329;
```

## Brand Guidelines

For complete brand guidelines, see:
- `DOCS/Brand Guidelines.pdf`
- `DOCS/Color Code (CC)_A.jpg`

## Implementation Checklist

- [x] Favicon added to `index.html`
- [x] Header logo implemented in navigation
- [x] Login/Signup branding implemented
- [x] Brand colors added to Tailwind config
- [x] Landing page footer updated with brand colors
- [x] Authentication pages styled with brand colors

## Notes

- The Prussian Blue (`#0A273A`) provides excellent contrast for white text
- Spanish Orange (`#E26713`) should be used sparingly for maximum impact
- Always test color combinations for WCAG accessibility compliance
