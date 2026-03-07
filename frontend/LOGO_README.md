# Logo Setup for UniWell Student Management System

## Current Status
A placeholder SVG logo has been created at `public/logo.svg` with the UniWell brand colors and theme.

## To Replace with Your Own Logo:

1. **PNG Logo (Recommended)**
   - Create or obtain your UniWell logo as a PNG file
   - Recommended size: 200x200 pixels minimum (transparent background)
   - Save it as `public/logo.png`
   - The current code references `/logo.png`

2. **SVG Logo (Alternative)**
   - If you prefer using the SVG or creating a custom one
   - Save it as `public/logo.svg`
   - Update references in the code from `/logo.png` to `/logo.svg`

## Files that Reference the Logo:
- `src/pages/Landing.js` - Landing page header
- `src/components/Navbar.js` - Navigation bar

## Design Guidelines:
- **Colors**: Use UniWell brand colors (Primary Green #3FB36B, Primary Blue #2F6DB2)
- **Style**: Modern, clean, minimal
- **Theme**: Should represent:
  - Student wellbeing (lotus flower, heart)
  - Academic growth (book, graduation cap)
  - AI intelligence (brain, circuits)
- **Format**: Transparent background works best
- **Size**: 40-50px height when displayed (scales automatically)

## Quick Fix if Logo is Missing:
If `logo.png` doesn't exist, the alt text "UniWell Logo" will display. The site will still function normally.
