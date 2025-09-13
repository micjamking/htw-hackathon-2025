# HTW Website Design System & Style Guide

## Overview
This is the comprehensive design system for the Honolulu Tech Week (HTW) website. Use this guide to maintain consistency across all pages and components.

## Color Palette

### Primary Colors
```css
/* HTW Brand Colors */
--htw-primary: #00D4FF        /* Bright cyan - primary brand color */
--htw-deep-sea: #003366       /* Dark navy blue - headings & text */
--htw-tech-blue: #1E40AF      /* Medium blue - backgrounds & accents */
```

### Text Colors
```css
/* Light Backgrounds */
--text-headings: text-htw-deep-sea     /* #003366 - Main headings */
--text-body: text-gray-700             /* Body text */
--text-secondary: text-gray-600        /* Secondary text */
--text-accent: text-htw-primary        /* #00D4FF - Links & accents */

/* Dark Backgrounds */
--text-headings-dark: text-white       /* White headings on dark */
--text-body-dark: text-white/90        /* 90% opacity white */
--text-secondary-dark: text-white/80   /* 80% opacity white */
--text-accent-dark: text-htw-primary   /* Cyan accent on dark */
```

### Background Colors
```css
--bg-primary: bg-white
--bg-secondary: bg-gray-50
--bg-dark: bg-htw-deep-sea
--bg-tech: bg-htw-tech-blue
--bg-accent: bg-htw-primary
--bg-gradient: bg-gradient-to-br from-htw-deep-sea via-htw-tech-blue to-htw-deep-sea
```

## Typography

### Font Families
```css
/* Primary Font Stack */
font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Condensed Headlines */
font-family: 'IBM Plex Sans Condensed', 'Geist', sans-serif;
font-class: font-ibm-condensed
```

### Font Size Hierarchy
```css
/* Hero Headlines */
.hero-headline {
  @apply text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-ibm-condensed;
}

/* Section Headlines */
.section-headline {
  @apply text-2xl md:text-3xl lg:text-4xl font-black font-ibm-condensed;
}

/* Card Titles - Feature */
.card-title-feature {
  @apply text-lg font-bold;
}

/* Card Titles - Compact */
.card-title-compact {
  @apply text-base font-bold;
}

/* Body Text - Primary */
.body-primary {
  @apply text-lg leading-relaxed;
}

/* Body Text - Secondary */
.body-secondary {
  @apply text-base leading-relaxed;
}

/* Captions */
.caption {
  @apply text-sm;
}

/* Fine Print */
.fine-print {
  @apply text-xs;
}
```

### Font Weights
```css
--font-light: font-light     /* 300 */
--font-normal: font-normal   /* 400 */
--font-medium: font-medium   /* 500 */
--font-semibold: font-semibold /* 600 */
--font-bold: font-bold       /* 700 */
--font-black: font-black     /* 900 - for headlines */
```

## Component Patterns

### Buttons
```tsx
// Primary Button
<Button variant="primary" href="/register">
  Register Now
</Button>

// Button Classes
.btn-primary {
  @apply bg-htw-primary text-htw-deep-sea font-bold px-6 py-3 rounded-lg 
         hover:bg-htw-primary/90 transition-all duration-300;
}

.btn-secondary {
  @apply bg-transparent border-2 border-htw-primary text-htw-primary 
         hover:bg-htw-primary hover:text-htw-deep-sea transition-all duration-300;
}
```

### Cards
```tsx
// Standard Card Pattern
<div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
  <div className="p-6">
    <h3 className="text-xl font-bold text-htw-deep-sea mb-3">{title}</h3>
    <p className="text-gray-700 leading-relaxed">{description}</p>
  </div>
</div>

// Sponsor Card Pattern
<div className="bg-white rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-2 
                transition-all duration-500 p-6 flex items-center justify-center 
                min-h-[140px] border-2 border-gray-200 hover:border-gray-400 
                relative group overflow-hidden">
  {/* Content */}
</div>
```

### Sections
```tsx
// Standard Section Pattern
<section className="py-16 sm:py-20 md:py-24 bg-white">
  <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
    <div className="text-center mb-16">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-htw-deep-sea mb-4 font-ibm-condensed">
        SECTION TITLE
      </h2>
      <p className="text-lg text-gray-700 max-w-3xl mx-auto">
        Section description
      </p>
    </div>
    {/* Section content */}
  </div>
</section>

// Dark Section Pattern
<section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-htw-deep-sea via-htw-tech-blue to-htw-deep-sea">
  <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 font-ibm-condensed">
      SECTION TITLE
    </h2>
  </div>
</section>
```

## Layout Patterns

### Container Widths
```css
.container-standard {
  @apply container mx-auto px-4 sm:px-6;
}

.container-narrow {
  @apply container mx-auto px-4 sm:px-6 max-w-4xl;
}

.container-wide {
  @apply container mx-auto px-4 sm:px-6 max-w-6xl;
}

.container-full {
  @apply container mx-auto px-4 sm:px-6 max-w-7xl;
}
```

### Grid Patterns
```css
/* Logo Grids */
.logo-grid-small {
  @apply grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4;
}

.logo-grid-medium {
  @apply grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4;
}

.logo-grid-large {
  @apply grid grid-cols-2 md:grid-cols-3 gap-6;
}

/* Content Grids */
.content-grid-2 {
  @apply grid grid-cols-1 md:grid-cols-2 gap-8;
}

.content-grid-3 {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8;
}
```

### Spacing System
```css
/* Vertical Spacing */
--spacing-section: py-16 sm:py-20 md:py-24
--spacing-component: py-8 sm:py-12
--spacing-element: py-4 sm:py-6

/* Horizontal Spacing */
--spacing-container: px-4 sm:px-6
--spacing-card: p-4 sm:p-6
--spacing-tight: p-3 sm:p-4
```

## Animation & Transitions

### Standard Transitions
```css
.transition-standard {
  @apply transition-all duration-300 ease-in-out;
}

.transition-slow {
  @apply transition-all duration-500 ease-in-out;
}

.transition-fast {
  @apply transition-all duration-200 ease-in-out;
}
```

### Hover Effects
```css
/* Card Hover */
.card-hover {
  @apply hover:shadow-xl hover:-translate-y-2 transition-all duration-500;
}

/* Logo Hover */
.logo-hover {
  @apply group-hover:scale-110 transition-all duration-500;
}

/* Button Hover */
.btn-hover {
  @apply hover:scale-105 transition-all duration-300;
}
```

### Animations
```css
/* Marquee Scroll */
@keyframes scroll-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

.animate-scroll-left {
  animation: scroll-left 30s linear infinite;
}

.animate-scroll-left:hover {
  animation-play-state: paused;
}
```

## Component Library

### Sponsor Components
```tsx
// Sponsor Accordion Card
function SponsorAccordionCard({ 
  name, 
  logo, 
  description, 
  learnMoreUrl,
  logoClassName 
}: { 
  name: string; 
  logo: string; 
  description: string | React.ReactNode; 
  learnMoreUrl: string;
  logoClassName?: string; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sponsorId = `sponsor-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

  return (
    <div id={sponsorId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Implementation */}
    </div>
  );
}

// Sponsor Band/Marquee
function SponsorBandSection() {
  // Scrolling sponsor logos implementation
}
```

### Partner Components
```tsx
// Partner Card
function PartnerCard({ 
  partner, 
  showDescription = true 
}: { 
  partner: any; 
  showDescription?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Implementation */}
    </div>
  );
}
```

## Responsive Design

### Breakpoints
```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Patterns
```tsx
// Responsive Text
className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"

// Responsive Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Responsive Spacing
className="py-16 sm:py-20 md:py-24"
className="px-4 sm:px-6"

// Responsive Visibility
className="hidden md:block"  // Hide on mobile
className="md:hidden"        // Show only on mobile
```

## Image Guidelines

### Logo Specifications
```tsx
// Standard Logo Sizes
const logoSizes = {
  small: { width: 120, height: 60 },    // Event hosts grid
  medium: { width: 160, height: 80 },   // Gold sponsors
  large: { width: 220, height: 110 },   // Platinum sponsors
  hero: { width: 300, height: 150 }     // Hero sections
};

// Logo Classes
.logo-small {
  @apply max-w-full max-h-10 sm:max-h-12 object-contain;
}

.logo-medium {
  @apply max-w-full max-h-14 object-contain;
}

.logo-large {
  @apply max-w-full max-h-18 object-contain;
}
```

### Image Optimization
```tsx
// Next.js Image Component Usage
<Image
  src="/images/logos/logo.png"
  alt="Company Name"
  width={160}
  height={80}
  className="max-w-full max-h-14 object-contain"
  priority={false} // Set to true for above-fold images
/>
```

## Accessibility Guidelines

### ARIA Labels
```tsx
// Button accessibility
<button 
  aria-label="Learn more about Company Name"
  title="Learn more about Company Name"
>

// Image accessibility
<Image
  src="/logo.png"
  alt="Company Name - Supporting Hawaii's tech ecosystem"
/>
```

### Focus States
```css
.focus-visible {
  @apply focus:outline-none focus:ring-2 focus:ring-htw-primary focus:ring-offset-2;
}
```

## File Structure

### Component Organization
```
src/
├── components/
│   ├── Button.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── index.ts
├── pages/
│   ├── index.tsx        # Homepage
│   ├── partners.tsx     # Partners page
│   ├── register.tsx     # Registration
│   └── about.tsx        # About page
└── styles/
    └── globals.css      # Global styles
```

### Asset Organization
```
public/
├── images/
│   ├── sponsor-logos-2025/
│   │   └── HTW 2025 Sponsor Logos/
│   ├── community-partner-logos/
│   ├── home-events-carousel/
│   └── logos-htw/
└── favicon.ico
```

## UTM Tracking Standards

### UTM Parameter Structure
```tsx
// Standard UTM format for sponsor links
const utmParams = {
  utm_source: 'htw',
  utm_medium: 'website',
  utm_campaign: '2025-sponsor',
  utm_content: 'home-sponsorbox-{companyname}'
};

// Example implementation
const sponsorUrl = `https://company.com/?utm_source=htw&utm_medium=website&utm_campaign=2025-sponsor&utm_content=home-sponsorbox-companyname`;
```

## Development Guidelines

### Code Style
```tsx
// Component naming: PascalCase
function SponsorCard() {}

// Props interface naming: ComponentNameProps
interface SponsorCardProps {
  name: string;
  logo: string;
}

// CSS classes: kebab-case with Tailwind
className="bg-white rounded-lg shadow-sm hover:shadow-xl"
```

### State Management
```tsx
// Use React hooks for component state
const [isExpanded, setIsExpanded] = useState(false);

// Use descriptive state names
const [isLoading, setIsLoading] = useState(true);
const [showModal, setShowModal] = useState(false);
```

## Performance Guidelines

### Image Loading
```tsx
// Use priority for above-fold images
<Image priority={true} />

// Use lazy loading for below-fold images (default)
<Image priority={false} />

// Optimize image sizes
width={160} height={80} // Specify dimensions
```

### Bundle Optimization
```tsx
// Import only what you need
import { useState } from 'react';

// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

## Brand Voice & Content Guidelines

### Tone
- **Professional yet approachable**
- **Tech-forward and innovative**
- **Community-focused**
- **Inclusive and welcoming**

### Content Patterns
```tsx
// Headlines: ALL CAPS with font-ibm-condensed
"2025 SPONSORS"
"MAHALO 2025 SPONSORS"
"EVENT HOSTS"

// Descriptions: Sentence case, professional tone
"Supporting Hawaii's economic development and innovation ecosystem."

// CTAs: Action-oriented
"Register Now"
"Learn More"
"Get Involved"
```

This design system ensures consistency across the HTW website and provides clear guidelines for future development and maintenance.
