# CSS Refactoring Example - Memory Card Component

This shows how to refactor the memory card styles from the monolithic file into a modular component.

## Before (Current Structure in style.css)

```css
/* Scattered throughout the file */
.memory-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    /* ... more styles ... */
}

.memory-card-thuvaraha {
    background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
    border: 1px solid rgba(236, 72, 153, 0.2);
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.15);
    /* ... more styles ... */
}

.memory-date {
    font-size: 0.9rem;
    color: var(--primary);
    /* ... */
}

.memory-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--dark);
    /* ... */
}
```

## After (Modular Component Structure)

### File: `css/components/memory-card.css`

```css
/* ============================================
   MEMORY CARD COMPONENT
   ============================================ */

/* Base Memory Card */
.memory-card {
    /* Layout */
    position: relative;
    margin-bottom: var(--space-6);
    padding: var(--space-6);
    
    /* Visual */
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: var(--border-width-thin) solid var(--border-color-dark);
    box-shadow: var(--shadow-md);
    
    /* Typography */
    font-size: var(--font-size-base);
    line-height: var(--line-height-relaxed);
    color: var(--color-dark);
    
    /* Transitions */
    transition: var(--transition-all);
    cursor: pointer;
    
    /* Animation */
    animation: fadeIn 0.6s ease forwards;
    opacity: 0;
}

/* Memory Card Hover State */
.memory-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-primary);
}

/* Memory Card Elements */
.memory-card__date {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-semibold);
    color: var(--color-primary);
    margin-bottom: var(--space-2);
    display: block;
}

.memory-card__title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-dark);
    margin-bottom: var(--space-3);
    line-height: var(--line-height-tight);
}

.memory-card__content {
    color: var(--color-gray-700);
    margin-bottom: var(--space-4);
    line-height: var(--line-height-relaxed);
}

.memory-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-4);
}

.memory-card__tags span {
    background: var(--gradient-primary);
    color: var(--color-white);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
}

/* Memory Card Modifiers */
.memory-card--thuvaraha {
    background: var(--gradient-pink-bg);
    border-color: rgba(236, 72, 153, 0.2);
    box-shadow: var(--shadow-pink);
}

.memory-card--thuvaraha:hover {
    box-shadow: var(--shadow-pink-lg);
    border-color: rgba(236, 72, 153, 0.4);
}

.memory-card--thuvaraha .memory-card__date {
    background: var(--gradient-pink);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.memory-card--thuvaraha .memory-card__title {
    color: var(--color-pink-dark);
}

.memory-card--thuvaraha .memory-card__tags span {
    background: var(--gradient-pink);
    color: var(--color-white);
    border: var(--border-width-thin) solid rgba(236, 72, 153, 0.2);
}

.memory-card--locked {
    opacity: 0.7;
    cursor: not-allowed;
}

.memory-card--locked:hover {
    transform: none;
    box-shadow: var(--shadow-md);
}

/* Memory Card States */
.memory-card:nth-child(odd) {
    /* Left side styles */
}

.memory-card:nth-child(even) {
    /* Right side styles */
}

/* Responsive */
@media (max-width: 768px) {
    .memory-card {
        padding: var(--space-4);
        margin-bottom: var(--space-4);
    }
    
    .memory-card__title {
        font-size: var(--font-size-lg);
    }
}
```

## Benefits of This Approach

1. **Single Source of Truth**: All memory card styles in one file
2. **Clear Hierarchy**: Base → Elements → Modifiers → States
3. **Reusable Variables**: Uses design tokens from `variables.css`
4. **Easy to Find**: Know exactly where to look for memory card styles
5. **Maintainable**: Change one file to update all memory cards
6. **Scalable**: Easy to add new variants (e.g., `.memory-card--highlighted`)

## Migration Steps

1. **Create the component file**: `css/components/memory-card.css`
2. **Copy related styles**: Gather all memory card related CSS
3. **Replace hardcoded values**: Use CSS variables
4. **Organize by BEM**: Structure as Block__Element--Modifier
5. **Test**: Verify all memory cards still work
6. **Import in main CSS**: Add `@import 'components/memory-card.css';`
7. **Remove from old file**: Delete the old styles from `style.css`

## File Structure After Refactoring

```
css/
├── style.css (main import file)
├── core/
│   ├── reset.css
│   ├── variables.css
│   ├── base.css
│   └── animations.css
├── layout/
│   ├── sidebar.css
│   ├── container.css
│   └── header.css
├── components/
│   ├── memory-card.css  ← This example
│   ├── buttons.css
│   ├── modals.css
│   └── tags.css
└── pages/
    ├── memories.css
    └── gallery.css
```

## Main style.css After Refactoring

```css
/* ============================================
   MAIN STYLESHEET - Imports Only
   ============================================ */

/* Core Foundation */
@import 'core/reset.css';
@import 'core/variables.css';
@import 'core/base.css';
@import 'core/animations.css';

/* Layout */
@import 'layout/sidebar.css';
@import 'layout/container.css';
@import 'layout/header.css';

/* Components */
@import 'components/memory-card.css';
@import 'components/buttons.css';
@import 'components/modals.css';
@import 'components/tags.css';

/* Pages */
@import 'pages/memories.css';
@import 'pages/gallery.css';
@import 'pages/quiz.css';
@import 'pages/thaali.css';
```
