# Theme Standardization Guide

## Color Usage Standards

This guide defines how theme colors should be consistently applied across all UI elements.

### Text Colors

#### Primary Text (`var(--color-text-primary)`)
**Use for:**
- Page titles and main headings
- Primary content text
- Important labels
- Active navigation items

**Examples:**
- `<h1>`, `<h2>` headings
- Note entry content
- Form field labels
- Modal titles

#### Secondary Text (`var(--color-text-secondary)`)
**Use for:**
- Supporting text and descriptions
- Timestamps and metadata
- Placeholder text
- Inactive navigation items
- Help text and hints

**Examples:**
- "3 hours ago" timestamps
- Label counts "(5 entries)"
- Form field hints
- Section descriptions

#### Tertiary Text (`var(--color-text-tertiary)`)
**Use for:**
- Disabled state text
- Very subtle hints
- Decorative text
- Low-emphasis information

**Examples:**
- Disabled button text
- Watermarks
- "No data" placeholders

### Button Text Colors

#### Accent Buttons
**Background:** `var(--color-accent)`
**Hover:** `var(--color-accent-hover)`
**Text:** `var(--color-accent-text)` (usually white)

**Use for:**
- Primary actions (Save, Create, Submit)
- Call-to-action buttons
- Positive confirmations

#### Secondary Buttons
**Background:** `var(--color-bg-tertiary)`
**Text:** `var(--color-text-primary)`
**Border:** `var(--color-border-primary)`

**Use for:**
- Secondary actions (Cancel, Close)
- Navigation buttons
- Filter/sort buttons

#### Icon-Only Buttons
**Background:** Transparent or `var(--color-bg-hover)` on hover
**Text/Icon:** `var(--color-text-secondary)`
**Hover Text:** `var(--color-text-primary)`

**Use for:**
- Edit, Delete, Settings icons
- Navigation icons
- Close buttons

### Semantic Colors

#### Success (`var(--color-success)`)
**Use for:**
- Success messages
- Positive status indicators
- Completion badges
- "Created" or "Saved" confirmations

#### Error (`var(--color-error)`)
**Use for:**
- Error messages
- Validation failures
- Delete buttons (destructive actions)
- Critical warnings

#### Warning (`var(--color-warning)`)
**Use for:**
- Warning messages
- "Modified" indicators
- Caution notices
- Pending states

#### Info (`var(--color-info)`)
**Use for:**
- Informational messages
- Help boxes
- Edit buttons
- Tips and suggestions

### Component-Specific Standards

#### Cards
- **Background:** `var(--color-card-bg)`
- **Border:** `var(--color-card-border)`
- **Shadow:** `var(--color-card-shadow)`
- **Title:** `var(--color-text-primary)`
- **Content:** `var(--color-text-primary)`
- **Metadata:** `var(--color-text-secondary)`

#### Forms
- **Input Background:** `var(--color-bg-primary)`
- **Input Text:** `var(--color-text-primary)`
- **Placeholder:** `var(--color-text-tertiary)`
- **Label:** `var(--color-text-primary)`
- **Help Text:** `var(--color-text-secondary)`
- **Border:** `var(--color-border-primary)`
- **Focus Border:** `var(--color-accent)`

#### Navigation
- **Background:** `var(--color-bg-secondary)`
- **Active Link:** `var(--color-text-primary)`
- **Inactive Link:** `var(--color-text-secondary)`
- **Hover:** `var(--color-bg-hover)`
- **Active Indicator:** `var(--color-accent)`

#### Modals/Dialogs
- **Overlay:** `rgba(0, 0, 0, 0.5)` or `rgba(0, 0, 0, 0.75)`
- **Background:** `var(--color-card-bg)`
- **Title:** `var(--color-text-primary)`
- **Content:** `var(--color-text-primary)`
- **Border:** `var(--color-border-primary)`

## Anti-Patterns (Don't Do This)

❌ **Don't use hardcoded colors**
```tsx
// Bad
<button style={{ color: '#ffffff' }}>

// Good
<button style={{ color: 'var(--color-accent-text)' }}>
```

❌ **Don't use inconsistent text colors for similar elements**
```tsx
// Bad - mixing text colors for buttons
<button style={{ color: '#ffffff' }}>Save</button>
<button style={{ color: '#111827' }}>Cancel</button>

// Good - consistent accent button styling
<button style={{ 
  backgroundColor: 'var(--color-accent)', 
  color: 'var(--color-accent-text)' 
}}>Save</button>
```

❌ **Don't use semantic colors for non-semantic purposes**
```tsx
// Bad - using error color for regular button
<button style={{ backgroundColor: 'var(--color-error)' }}>Settings</button>

// Good - use error only for destructive actions
<button style={{ backgroundColor: 'var(--color-error)' }}>Delete</button>
```

## Migration Checklist

When updating a component:

1. ✅ Replace all hardcoded text colors with theme variables
2. ✅ Use `var(--color-text-primary)` for headings and main text
3. ✅ Use `var(--color-text-secondary)` for timestamps and metadata
4. ✅ Use `var(--color-accent-text)` for text on accent-colored backgrounds
5. ✅ Use semantic colors (success, error, warning, info) appropriately
6. ✅ Ensure button text colors match their background
7. ✅ Test in both light and dark themes
8. ✅ Verify consistency with similar components

## Examples

### Standard Button Pattern
```tsx
// Primary/Accent Button
<button
  style={{
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-accent-text)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-accent-hover)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-accent)';
  }}
>
  Save
</button>

// Secondary Button
<button
  style={{
    backgroundColor: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-primary)',
  }}
>
  Cancel
</button>

// Icon Button
<button
  style={{
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
    e.currentTarget.style.color = 'var(--color-text-primary)';
  }}
>
  <Edit className="h-4 w-4" />
</button>
```

### Standard Card Pattern
```tsx
<div
  className="rounded-lg shadow-lg p-6"
  style={{
    backgroundColor: 'var(--color-card-bg)',
    border: '1px solid var(--color-card-border)',
  }}
>
  <h2
    className="text-xl font-semibold mb-2"
    style={{ color: 'var(--color-text-primary)' }}
  >
    Card Title
  </h2>
  <p style={{ color: 'var(--color-text-primary)' }}>
    Main content goes here.
  </p>
  <p
    className="text-sm mt-2"
    style={{ color: 'var(--color-text-secondary)' }}
  >
    Created 2 hours ago
  </p>
</div>
```

