# Prometheus Style Guide

## Brand Identity
**Project Name**: Prometheus  
**Tagline**: "Bringing forethought to proposal planning"  
**Personality**: Professional, Intelligent, Reliable, Forward-thinking

---

## Aesthetic Guidelines

### Core Design Principles

1. **Bold Simplicity with Intuitive Navigation**
   - Create frictionless experiences through clear information architecture
   - Minimize cognitive load with predictable interaction patterns
   - Use progressive disclosure for complex features
   - Maintain consistency across all user touchpoints

2. **Breathable Whitespace with Strategic Color Accents**
   - Implement generous spacing for visual hierarchy
   - Use the primary blue (#3B82F6) for CTAs and key interactions
   - Apply success green (#10B981) for positive states
   - Reserve warning yellow (#F59E0B) and error red (#EF4444) for system states
   - Create a modern, "techy" feel through precise accent placement

3. **Strategic Negative Space for Cognitive Breathing Room**
   - Calibrate spacing for content prioritization
   - Adapt density based on screen real estate
   - Use the 4px base unit system consistently
   - Ensure responsive scaling across all devices

4. **Systematic Color Theory Application**
   - Utilize the white and dark-green palette systematically
   - Apply subtle gradients where appropriate for depth
   - Maintain purposeful accent placement
   - Ensure color consistency across all features

5. **Clear Typography Hierarchy**
   - Implement weight variance for information architecture
   - Use responsive proportional scaling
   - Maintain readability across all screen sizes
   - Apply consistent type treatments for similar content

6. **Visual Density Optimization**
   - Balance information availability with cognitive load
   - Adapt layouts for different screen sizes
   - Use progressive disclosure for complex data
   - Prioritize scannability and quick comprehension

7. **Motion Choreography with Physics-Based Transitions**
   - Implement smooth transitions for spatial continuity
   - Provide immediate user feedback through micro-interactions
   - Ensure performance across all devices
   - Use motion to guide attention and indicate state changes

8. **Accessibility-Driven Design**
   - Ensure WCAG 2.1 AA compliance
   - Provide sufficient color contrast (minimum 4.5:1)
   - Include clear focus indicators for keyboard navigation
   - Implement proper ARIA labels and roles
   - Design for screen reader compatibility

9. **Feedback Responsiveness**
   - Communicate system status through state transitions
   - Ensure minimal latency in all interactions
   - Provide clear loading states and progress indicators
   - Use appropriate feedback for user actions

10. **Content-First Layouts**
    - Prioritize user objectives over decorative elements
    - Design for efficiency and clarity
    - Remove unnecessary visual noise
    - Focus on task completion and information access

11. **Consistent Visual Language**
    - Maintain uniform interaction patterns across platforms
    - Ensure design consistency between web desktop and mobile
    - Use the same component library across all features
    - Apply systematic design tokens throughout

---

## Color Palette

### Primary Colors
```css
/* Blues - Primary brand colors */
--primary-blue-50: #EFF6FF;  /* Lightest blue for backgrounds */
--primary-blue-100: #DBEAFE; /* Light blue for hover states */
--primary-blue-500: #3B82F6; /* Main blue for CTAs and primary actions */
--primary-blue-600: #2563EB; /* Darker blue for hover states */
--primary-blue-700: #1D4ED8; /* Darkest blue for active states */
```

### Semantic Colors
```css
/* Success States */
--success-green-50: #F0FDF4;  /* Light green backgrounds */
--success-green-300: #86EFAC; /* Green borders */
--success-green-500: #10B981; /* Main green for success indicators */
--success-green-600: #059669; /* Darker green for text */

/* Warning/Pending States */
--warning-yellow-50: #FFFBEB;  /* Light yellow backgrounds */
--warning-yellow-300: #FCD34D; /* Yellow borders */
--warning-yellow-500: #F59E0B; /* Main yellow for warnings */

/* Error States */
--error-red-500: #EF4444;     /* Red for errors */
--error-red-600: #DC2626;     /* Darker red for text */

/* Neutral Colors */
--gray-50: #F9FAFB;   /* Lightest gray for backgrounds */
--gray-100: #F3F4F6;  /* Light gray for cards */
--gray-200: #E5E7EB;  /* Medium gray for borders */
--gray-300: #D1D5DB;  /* Darker borders */
--gray-400: #9CA3AF;  /* Disabled state */
--gray-500: #6B7280;  /* Secondary text */
--gray-600: #4B5566;  /* Primary text */
--gray-700: #374151;  /* Headers */
--gray-900: #111827;  /* Main headings */
```

### Usage Guidelines
- **Primary Actions**: Use `primary-blue-500` for CTAs and primary buttons
- **Success States**: Use green colors for completed stages and success messages
- **Progress**: Use blue for current/active states
- **Warnings**: Use yellow for pending dependencies or warnings
- **Backgrounds**: Use gray-50 for main backgrounds, white for cards

---

## Typography

### Font Family
```css
--font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
--font-code: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px - Small labels */
--text-sm: 0.875rem;   /* 14px - Secondary text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body text */
--text-xl: 1.25rem;    /* 20px - Section headers */
--text-2xl: 1.5rem;    /* 24px - Page headers */
--text-3xl: 1.875rem;  /* 30px - Main headings */
```

### Font Weights
```css
--font-normal: 400;    /* Regular text */
--font-medium: 500;    /* Emphasized text */
--font-semibold: 600;  /* Subheadings */
--font-bold: 700;      /* Headings */
```

### Text Styles
```css
/* Headings */
h1 { 
  font-size: var(--text-3xl); 
  font-weight: var(--font-bold); 
  color: var(--gray-900);
}

h2 { 
  font-size: var(--text-2xl); 
  font-weight: var(--font-bold); 
  color: var(--gray-900);
}

h3 { 
  font-size: var(--text-xl); 
  font-weight: var(--font-semibold); 
  color: var(--gray-700);
}

/* Body Text */
body { 
  font-size: var(--text-base); 
  font-weight: var(--font-normal); 
  color: var(--gray-600);
  line-height: 1.5;
}

/* Labels */
.label { 
  font-size: var(--text-sm); 
  font-weight: var(--font-medium); 
  color: var(--gray-700);
}

/* Small Text */
.text-small { 
  font-size: var(--text-xs); 
  color: var(--gray-500);
}
```

---

## Icons

### Icon Library
**Lucide React** - Chosen for its clean, consistent design and React compatibility

### Common Icons Used
```javascript
import {
  CheckCircle2,    // Success/completion states
  Circle,          // Empty/pending states
  AlertCircle,     // Warnings/info
  ChevronRight,    // Navigation forward
  ChevronDown,     // Expandable sections
  Lock,            // Locked/unavailable states
  Save,            // Save actions
  ClipboardList,   // Questionnaire
  Plus,            // Add/create actions
  Folder,          // Proposals
  Clock,           // In-progress states
  Edit2,           // Edit actions
  Trash2,          // Delete actions
  XCircle          // Close/cancel
} from 'lucide-react';
```

### Icon Sizes
```javascript
size={16}  // Small icons (inline with text)
size={18}  // Medium icons (buttons)
size={20}  // Standard icons
size={24}  // Large icons (status indicators)
size={48}  // Extra large (empty states)
```

### Icon Colors
- **Primary Actions**: `text-blue-500`
- **Success States**: `text-green-500`
- **Warnings**: `text-yellow-500`
- **Errors**: `text-red-500`
- **Neutral**: `text-gray-400` or `text-gray-500`

---

## Spacing

### Spacing Scale
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
```

### Usage
- **Component Padding**: `p-4` (16px)
- **Section Spacing**: `mb-8` (32px)
- **Element Spacing**: `gap-4` (16px)
- **Small Gaps**: `gap-2` (8px)

---

## Components

### Buttons
```css
/* Primary Button */
.btn-primary {
  background-color: var(--primary-blue-500);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-blue-600);
}

/* Secondary Button */
.btn-secondary {
  background-color: var(--gray-200);
  color: var(--gray-700);
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: var(--gray-300);
}

/* Disabled State */
.btn:disabled {
  background-color: var(--gray-100);
  color: var(--gray-400);
  cursor: not-allowed;
}
```

### Cards
```css
.card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}

.card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### Form Elements
```css
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.375rem;
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: var(--primary-blue-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.75rem;
  cursor: pointer;
}
```

### Progress Indicators
```css
.progress-bar {
  width: 100%;
  height: 0.5rem;
  background-color: var(--gray-200);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-blue-500);
  transition: width 0.3s ease;
}
```

---

## Animations

### Transition Durations
```css
--transition-fast: 200ms;
--transition-normal: 300ms;
--transition-slow: 500ms;
```

### Common Animations
```css
/* Pulse Animation (for saving indicator) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Default Transition */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: var(--transition-normal);
}

/* Color Transition */
.transition-colors {
  transition-property: background-color, border-color, color;
  transition-duration: var(--transition-fast);
}

/* Shadow Transition */
.transition-shadow {
  transition-property: box-shadow;
  transition-duration: var(--transition-fast);
}
```

### Interactive States
```css
/* Hover Effects */
.hover-lift {
  transition: transform 0.2s;
}

.hover-lift:hover {
  transform: translateY(-2px);
}

/* Click Effects */
.active-scale {
  transition: transform 0.1s;
}

.active-scale:active {
  transform: scale(0.98);
}

/* Focus Effects */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

## Layout Principles

### Responsive Breakpoints
```css
/* Mobile First */
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Desktops */
--screen-xl: 1280px;  /* Large screens */
```

### Container Widths
```css
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}
```

### Grid System
```css
.grid {
  display: grid;
  gap: 1rem;
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
```

---

## Shadows and Effects

### Box Shadows
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Border Radius
```css
--rounded-sm: 0.125rem;  /* 2px */
--rounded: 0.25rem;      /* 4px */
--rounded-md: 0.375rem;  /* 6px */
--rounded-lg: 0.5rem;    /* 8px */
--rounded-full: 9999px;  /* Circle */
```

---

## Implementation Guidelines

### Component Architecture
1. Use composition over inheritance
2. Keep components small and focused
3. Implement proper prop validation
4. Ensure components are accessible by default
5. Follow naming conventions consistently

### State Management
1. Use appropriate state management solutions
2. Keep state as local as possible
3. Implement proper loading states
4. Handle error states gracefully
5. Provide optimistic updates where appropriate

### Performance
1. Implement code splitting
2. Use lazy loading for heavy components
3. Optimize images and assets
4. Minimize re-renders
5. Use memoization appropriately

### Testing
1. Write unit tests for utilities
2. Implement integration tests for features
3. Use visual regression testing
4. Test accessibility compliance
5. Ensure cross-browser compatibility

---

## Validation Checklist

When creating new features, validate against these principles:

✓ **Bold Simplicity**: Is the interface clean and intuitive?  
✓ **Whitespace**: Is there adequate breathing room?  
✓ **Color Accents**: Are colors used strategically?  
✓ **Typography**: Is the hierarchy clear and readable?  
✓ **Density**: Is information balanced with clarity?  
✓ **Motion**: Are transitions smooth and purposeful?  
✓ **Accessibility**: Can everyone use this feature?  
✓ **Feedback**: Does the interface respond immediately?  
✓ **Content-First**: Is functionality prioritized over decoration?  
✓ **Consistency**: Does it match existing patterns?  

---

## Best Practices

### Accessibility
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure sufficient color contrast (WCAG AA)
- Support keyboard navigation
- Include focus indicators

### Performance
- Use CSS transitions instead of JavaScript animations
- Limit animation complexity
- Optimize icon usage
- Lazy load components when possible

### Consistency
- Follow the established color palette
- Use consistent spacing
- Maintain typography hierarchy
- Apply animations uniformly

### Responsive Design
- Design mobile-first
- Test on multiple screen sizes
- Use flexible units (rem, %)
- Ensure touch-friendly targets (minimum 44px)

This style guide ensures consistent visual design throughout the Prometheus application, creating a professional and intuitive user experience that aligns with modern web standards and accessibility requirements.
