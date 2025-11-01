# Components Theme Update Status

This document tracks which components have been updated to use the new theming system.

## ✅ Fully Updated Components

### Core Infrastructure
- [x] `App.tsx` - Wrapped with ThemeProvider, uses theme variables for background
- [x] `index.css` - All CSS updated to use CSS variables for colors
- [x] `tailwind.config.js` - Theme color classes configured

### Context & Providers
- [x] `ThemeContext.tsx` - Complete theming system implementation
- [x] `TimezoneContext.tsx` - No changes needed (no UI)

### Main Pages
- [x] `Settings.tsx` - Full theme support + theme selector UI
- [x] `Navigation.tsx` - Updated to use theme colors for nav items
- [x] `CalendarView.tsx` - Updated to use theme colors

### Components Requiring Attention
- [ ] `DailyView.tsx` - Needs review for hardcoded colors
- [ ] `NoteEntryCard.tsx` - Needs review for hardcoded colors
- [ ] `Search.tsx` - Needs update for input fields and cards
- [ ] `Reports.tsx` - Needs update for report display
- [ ] `LabelSelector.tsx` - Needs update for label pills
- [ ] `RichTextEditor.tsx` - Editor toolbar needs theme support
- [ ] `CodeEditor.tsx` - Code editor styling needs theme support
- [ ] `EmojiPicker.tsx` - Emoji picker UI needs theme support
- [ ] `EntryTimeline.tsx` - Timeline styling needs theme support

## 🎨 Theme System Features

### Available CSS Variables
```css
--color-bg-primary       /* Main backgrounds */
--color-bg-secondary     /* Page backgrounds */
--color-bg-tertiary      /* Tertiary elements */
--color-bg-hover         /* Hover states */
--color-text-primary     /* Main text */
--color-text-secondary   /* Secondary text */
--color-text-tertiary    /* Muted text */
--color-border-primary   /* Main borders */
--color-border-secondary /* Secondary borders */
--color-accent           /* Primary accent */
--color-accent-hover     /* Accent hover */
--color-accent-text      /* Text on accent */
--color-success          /* Success states */
--color-error            /* Error states */
--color-warning          /* Warning states */
--color-info             /* Info states */
--color-card-bg          /* Card backgrounds */
--color-card-border      /* Card borders */
--color-card-shadow      /* Card shadows */
```

### Usage Patterns

**Inline Styles (Recommended for dynamic content):**
```jsx
<div style={{ 
  backgroundColor: 'var(--color-card-bg)',
  color: 'var(--color-text-primary)'
}}>
```

**Tailwind Classes (For utility classes):**
```jsx
<div className="bg-theme-bg-primary text-theme-text-primary">
```

**Hover States:**
```jsx
<button
  style={{ backgroundColor: 'var(--color-accent)' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-accent)';
  }}
>
```

## 📋 Update Checklist for Each Component

When updating a component, ensure:

1. **Background Colors**
   - Replace `bg-white` → `style={{ backgroundColor: 'var(--color-card-bg)' }}`
   - Replace `bg-gray-50`, `bg-gray-100` → `var(--color-bg-secondary)` or `var(--color-bg-tertiary)`

2. **Text Colors**
   - Replace `text-gray-900`, `text-black` → `var(--color-text-primary)`
   - Replace `text-gray-600`, `text-gray-700` → `var(--color-text-secondary)`
   - Replace `text-gray-400`, `text-gray-500` → `var(--color-text-tertiary)`

3. **Border Colors**
   - Replace `border-gray-200`, `border-gray-300` → `var(--color-border-primary)`
   - Replace `border-gray-400` → `var(--color-border-secondary)`

4. **Interactive Elements**
   - Replace `bg-blue-600` → `var(--color-accent)`
   - Replace `hover:bg-blue-700` → `var(--color-accent-hover)`
   - Replace `text-white` (on buttons) → `var(--color-accent-text)`

5. **Hover States**
   - Replace `hover:bg-gray-100` → `var(--color-bg-hover)`

6. **Semantic Colors**
   - Success: `var(--color-success)` 
   - Error: `var(--color-error)`
   - Warning: `var(--color-warning)`
   - Info: `var(--color-info)`

## 🚧 Special Considerations

### Third-Party Components
- **React Calendar** - Already styled in `index.css` with CSS variables
- **TipTap Editor** - Styled in `index.css` with theme awareness
- **Syntax Highlighter** - May need custom theme mapping

### Form Elements
- Input fields need `backgroundColor`, `color`, and `borderColor`
- Focus states should use `var(--color-accent)` for ring
- Placeholder text should use `var(--color-text-tertiary)`

### Shadows
- Use `boxShadow` with `var(--color-card-shadow)` for consistency
- Example: `boxShadow: '0 4px 6px var(--color-card-shadow)'`

## 📝 Notes

- All theme changes should include smooth `transition` properties
- Test components in both light and dark themes minimum
- Ensure sufficient contrast ratios for accessibility
- Keep hardcoded colors only for semantic indicators (like green checkmarks, red errors) where brand color is intentional

## 🔄 Next Steps

1. Review and update remaining components listed above
2. Test all views in different themes
3. Check accessibility contrast ratios
4. Update documentation as components are completed
5. Consider adding theme previews to Storybook (if applicable)

---

**Last Updated:** October 31, 2025
**Status:** In Progress

