# StudyNest Design System

## Overview
This design system provides a consistent visual language and component library for StudyNest.

## Design Tokens

### Color System
Based on white/black scales with primary accent colors:

**White Scale:**
- `--color-white-100`: Pure white
- `--color-white-80`: 80% opacity
- `--color-white-40`: 40% opacity
- `--color-white-20`: 20% opacity
- `--color-white-10`: 10% opacity
- `--color-white-4`: 4% opacity

**Black Scale:**
- `--color-black-100`: Pure black
- `--color-black-80`: 80% opacity
- `--color-black-40`: 40% opacity
- `--color-black-20`: 20% opacity
- `--color-black-10`: 10% opacity
- `--color-black-4`: 4% opacity

**Primary Colors:**
- `--color-primary-light`: #A5B4FC
- `--color-primary-medium`: #818CF8
- `--color-primary`: #3B82F6
- `--color-primary-dark`: #2563EB

### Spacing Scale
- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px
- `--spacing-3xl`: 64px

### Typography
**Font Sizes:**
- `--font-size-xs`: 12px
- `--font-size-sm`: 14px
- `--font-size-base`: 16px
- `--font-size-lg`: 18px
- `--font-size-xl`: 20px
- `--font-size-2xl`: 24px
- `--font-size-3xl`: 32px
- `--font-size-4xl`: 40px

**Font Weights:**
- `--font-weight-normal`: 400
- `--font-weight-medium`: 500
- `--font-weight-semibold`: 600
- `--font-weight-bold`: 700

### Border Radius
- `--radius-sm`: 6px
- `--radius-md`: 8px
- `--radius-lg`: 12px
- `--radius-xl`: 16px
- `--radius-2xl`: 24px
- `--radius-full`: 9999px

## Components

### Button
```tsx
import { Button } from '../components';

<Button variant="primary" size="md">Click me</Button>
<Button variant="outline" size="sm">Small</Button>
<Button variant="ghost" loading>Loading...</Button>
```

**Variants:** `primary`, `secondary`, `outline`, `ghost`, `danger`
**Sizes:** `sm`, `md`, `lg`

### Input
```tsx
import { Input } from '../components';

<Input 
  label="Email"
  placeholder="Enter email"
  inputSize="md"
/>
<Input 
  error="Invalid email"
  leftIcon={<Icon />}
/>
```

### Card
```tsx
import { Card } from '../components';

<Card variant="elevated" padding="lg" hoverable>
  Content here
</Card>
```

**Variants:** `default`, `outlined`, `elevated`
**Padding:** `none`, `sm`, `md`, `lg`

### Typography
```tsx
import { Typography } from '../components';

<Typography variant="h1" color="primary">Heading</Typography>
<Typography variant="body1" color="secondary">Body text</Typography>
```

## Theme Support
Toggle between light and dark themes:

```tsx
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.setAttribute('data-theme', 'light');
```

## Usage Guidelines

1. **Always use design tokens** instead of hardcoded values
2. **Use semantic color names** (e.g., `--color-text-primary` instead of `--color-black-100`)
3. **Maintain consistent spacing** using the spacing scale
4. **Follow the component API** for consistent behavior
5. **Test in both light and dark themes**

## Examples

### Using Tokens in Custom Components
```css
.my-component {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}
```

### Responsive Design
```css
@media (max-width: 768px) {
  .my-component {
    padding: var(--spacing-sm);
  }
}
```
