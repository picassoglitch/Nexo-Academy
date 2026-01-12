# Landing Page Specification - Nexo AI Course Platform

## Overview
This is a comprehensive specification for rebuilding the Nexo AI course landing page. The page is a modern, conversion-focused landing page for an AI education platform targeting Mexican entrepreneurs. It uses Next.js, React, TypeScript, Tailwind CSS, and includes scroll animations, dynamic content loading, and multiple interactive sections.

## Technical Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components using shadcn/ui patterns
- **Icons**: Lucide React
- **Animations**: Custom scroll reveal hooks
- **State Management**: React hooks (useState, useEffect)

## Page Structure & Sections

### 1. Header (MainHeader Component)
**Location**: Sticky at top, `z-index: 50`

**Desktop Layout**:
- Left: NexusLogo (text-based logo: "NEXUS" with "Inteligencia Artificial" subtitle)
- Right: Navigation links + "Iniciar Sesión" button
  - Links: Inicio, Programas, Cómo Funciona, Comunidad, Quiénes Somos
  - All links use smooth scroll to sections (except Inicio)
  - Button: Outline variant, small size, links to `/login`

**Mobile Layout**:
- Hamburger menu (Menu/X icon toggle)
- Same navigation links in vertical stack
- Login button at bottom with border-top separator

**Styling**:
- Background: `bg-white/95 backdrop-blur-sm`
- Border: `border-b border-gray-200`
- Sticky positioning with smooth transitions

**Component File**: `components/main-header.tsx`

---

### 2. Hero Section
**Background**: Gradient `bg-gradient-to-br from-blue-50 via-white to-orange-50`
**Padding**: `py-20 md:py-32`
**Overflow**: `overflow-hidden`

**Background Decoration**:
- Two blurred circular gradients (opacity-5):
  - Top-left: `w-72 h-72 bg-blue-500 rounded-full blur-3xl`
  - Bottom-right: `w-96 h-96 bg-orange-500 rounded-full blur-3xl`

**Layout**: 2-column grid on large screens (`lg:grid-cols-2`), stacked on mobile

**Left Column - Content**:
- **Title (H1)**: 
  - Size: `text-4xl md:text-5xl lg:text-6xl`
  - Weight: `font-bold`
  - Color: `text-gray-900`
  - Special formatting: "ingresos reales" in `text-blue-600`, "comunidad que te respalda" in `text-orange-500`
  - Uses `dangerouslySetInnerHTML` for colored spans
  - Content loaded from config API or defaults

- **Subtitle (P)**:
  - Size: `text-xl md:text-2xl`
  - Color: `text-gray-600`
  - Margin: `mb-8`

- **CTA Buttons**:
  - Primary: Blue button (`bg-blue-600 hover:bg-blue-700`), size `lg`, links to `/quiz`
  - Secondary: Outline button with border, scrolls to "como-funciona" section
  - Both buttons: `text-lg px-8 py-6`

**Right Column - Lead Magnet Form**:
- **Card**: White background, `border-2 border-blue-200 shadow-2xl`
- **Header**: Gradient `from-blue-600 to-blue-700`, white text
  - Icon: Sparkles
  - Title: "Guía Gratis de IA"
  - Subtitle: "Descubre cómo empezar a generar ingresos con IA en 7 días"
- **Form**:
  - Email input: `border-2 border-gray-300`, focus ring blue
  - Submit button: Orange (`bg-orange-500 hover:bg-orange-600`), full width
  - Small text: "Sin spam. Cancela cuando quieras. 100% gratis."
- **Footer**: Border-top, shows "+2,500 descargas esta semana" with green checkmark

**Animations**: All elements wrapped in `<Reveal>` component with staggered delays (0, 100, 200, 300ms)

**Config Loading**: Fetches from `/api/admin/landing-page-config` on mount, falls back to defaults

---

### 3. Quiénes Somos Section
**Background**: White
**Padding**: `py-20 md:py-28`
**ID**: `#quienes-somos`

**Layout**: 2-column grid, centered content (`max-w-5xl`)

**Left Column**:
- **Avatar**: NexusAvatar component, size 160, centered on mobile
- **Title**: "Somos un equipo de ingenieros en IA de México con experiencia real en startups"
- **Description**: Paragraph about building and scaling AI products
- **Checklist**: 3 items with green checkmarks:
  - "+10 años de experiencia en IA"
  - "Productos escalados a miles de usuarios"
  - "Nacidos en México, con visión global"

**Right Column**:
- **Video Container**: 
  - If `config.videoUrl` exists: iframe embed
  - Else: Placeholder with play button (Play icon, white circle)
  - Aspect ratio: `aspect-video`
  - Rounded: `rounded-2xl`
  - Shadow: `shadow-2xl`
  - Video title overlay at bottom (if provided)

**Bottom Text**:
- Two paragraphs with bold highlights:
  - Mentions "$50,000+ MXN mensuales", "6 cifras", "libertad financiera"
  - Mentions "$100,000+ MXN en 90 días", "millones de pesos"

**Animations**: Reveal with delays (0, 200, 300ms)

---

### 4. Testimonials Section
**Background**: Gradient `from-gray-50 to-white`
**Padding**: `py-20 md:py-28`

**Header**:
- Title: "Historias de Éxito Reales"
- Subtitle: "Emprendedores mexicanos que están generando ingresos reales con IA"

**Grid**: 2 columns on medium+ screens, 4 testimonial cards

**Testimonial Card Structure**:
- Border: `border-2 border-gray-200`
- Hover: `hover:shadow-xl transition-shadow`
- **Avatar Circle**: Gradient background, initial letter, size 16x16
- **Name & Location**: Bold name, role + city in gray
- **Quote**: Italic, gray-700, larger text
- **Metric**: Large gradient text (e.g., "$8,000 MXN") with label below
- **Gradient Colors**: Each card has unique gradient (blue, orange, green, purple)

**Testimonial Data** (hardcoded):
1. María González, CDMX - "$8,000 MXN en 45 días"
2. Carlos Ramírez, Guadalajara - "3 clientes recurrentes"
3. Ana Martínez, Monterrey - "$3,000 MXN/mes recurrentes"
4. Roberto Sánchez, Puebla - "$25,000 MXN ingresos mensuales"

**Animations**: Reveal with staggered delays (0, 100, 200, 300ms)

---

### 5. Cómo Funciona Section
**Background**: White
**Padding**: `py-20 md:py-28`
**ID**: `#como-funciona`

**Header**: Centered title "Cómo Funciona"

**Grid**: 4 columns on large screens (`lg:grid-cols-4`), 2 on medium, 1 on mobile

**Step Cards** (4 steps):
1. **Aprendes** (BookOpen icon, blue gradient)
2. **Implementas** (Zap icon, orange gradient)
3. **Ajustas** (TrendingUp icon, green gradient)
4. **Escalas** (Rocket icon, purple gradient)

**Card Structure**:
- Centered content
- **Icon Container**: `w-24 h-24`, gradient background, rounded-3xl, shadow-lg
- **Title**: `text-2xl font-bold`
- **Description**: Gray text, leading-relaxed
- Hover: `hover:shadow-xl hover:-translate-y-1 transition-all`

**Animations**: Reveal with 100ms delay increments

---

### 6. Pricing Section
**Background**: Gradient `from-gray-50 to-white`
**Padding**: `py-20 md:py-32`
**ID**: `#programas`

**Header**:
- Title: "Elige cómo quieres avanzar"
- Subtitle: "Planes diseñados para diferentes niveles de compromiso y objetivos"

**Grid**: 3 columns on medium+ (`md:grid-cols-3`), all cards same height

**Plan Cards** (from `PLANS_DATA`):
- **Starter**: $299 MXN (was $599), tier 0
- **PRO**: $999 MXN (was $4999), **MOST POPULAR** (orange badge, scale-105, border-orange-500)
- **Operator**: $3999 MXN (was $7999), tier 2

**Card Structure**:
- **Popular Badge**: Orange gradient badge at top if `isPopular`
- **Header**: 
  - Title: `text-2xl font-bold`
  - Tagline: Small gray text
  - Old price: Strikethrough, gray
  - Current price: Large bold (orange if popular)
  - MSI text: Small gray (if provided)
- **Features List**:
  - Green checkmark for included features
  - Gray X for excluded features
  - Text with line-through for excluded
- **CTA Button**:
  - PRO: Orange gradient button
  - Others: Blue button
  - Full width, large size
  - Links to `/checkout?tier={TIER}`
- **Popular Badge Footer**: "Acceso inmediato" with clock icon

**Trust Badges** (below cards):
- 3 icons with text: Shield (Garantía 30 días), Zap (Acceso inmediato), Lock (Pago seguro)
- Small text: "Pago seguro con Mercado Pago • Sin compromiso • Cancela cuando quieras"

**Animations**: Reveal with delays

---

### 7. Por Qué Confiar Section
**Background**: White
**Padding**: `py-20 md:py-28`

**Header**: Centered "Por Qué Confiar en Nosotros"

**Grid**: 3 columns on large (`lg:grid-cols-3`), 2 on medium, 1 on mobile

**Trust Cards** (6 items):
1. Mercado Mexicano enfocado (Target icon, blue)
2. Ejecución Real (Zap icon, orange)
3. Sin Afiliados (Shield icon, green)
4. Contenido Actualizado (Award icon, purple)
5. Comunidad Moderada (Users icon, pink)
6. Garantía 30 días (Shield icon, indigo)

**Card Structure**:
- Icon container: `w-16 h-16`, gradient background, rounded-2xl
- Title: `text-xl font-bold`
- Description: Gray text, leading-relaxed
- Hover: `hover:shadow-xl transition-all`

**Trust Badges Footer**:
- Border-top separator
- Icons with text: Lock (Pago seguro), "Mercado Pago", "Stripe", Shield (SSL Encriptado)

**Animations**: Reveal with 50ms increments

---

### 8. Comunidad Section
**Background**: Gradient `from-blue-50 via-white to-orange-50`
**Padding**: `py-20 md:py-28`
**ID**: `#comunidad`

**Header**:
- Title: "Accede a Nuestra Comunidad Privada"
- Subtitle: About subscription access

**Layout**: 2 columns on large screens

**Left Card**:
- Border: `border-2 border-blue-200`
- Background: Gradient `from-white to-blue-50/30`
- **Header**: Icon + title "Comunidad Privada"
- **Description**: Large paragraph
- **Checklist**: 3 items with green checkmarks
- **Testimonial Box**: Gradient background, NexusAvatar, quote from "Juan P."

**Right Mockup**:
- Dark gradient background (`from-gray-900 to-gray-800`)
- Mockup of community interface:
  - Header with icon and "En línea" badge
  - 4 message bubbles with avatars
  - Footer: "+500 miembros activos" and "Acceso con suscripción"
- Aspect ratio: `aspect-[4/3]`
- Rounded: `rounded-2xl`
- Shadow: `shadow-2xl`

**Animations**: Reveal with delays (0, 200ms)

---

### 9. FAQ Section
**Background**: White
**Padding**: `py-20 md:py-28`

**Header**: Centered "Preguntas Frecuentes"

**FAQ Items** (5 questions):
1. "¿Puedo cambiar de plan después?"
2. "¿Hay garantía de ingresos?" (includes DISCLAIMER_TEXT)
3. "¿Qué métodos de pago aceptan?"
4. "¿Cuándo empiezo?"
5. "¿El contenido se actualiza?"

**FAQ Component**:
- Card with border, hover shadow
- Clickable header to toggle open/close
- ChevronUp/ChevronDown icon
- Content revealed with smooth transition
- Answer text in gray, leading-relaxed

**Layout**: Centered, max-width 3xl, vertical stack with spacing

---

### 10. Final CTA Section
**Background**: Gradient `from-blue-600 via-blue-700 to-orange-600`
**Text**: White
**Padding**: `py-24 md:py-32`
**Overflow**: Hidden

**Background Decoration**:
- Two large white blurred circles (opacity-10)

**Content** (centered, max-width 4xl):
- **Title**: `text-4xl md:text-5xl lg:text-6xl font-bold`
- **Subtitle**: `text-xl md:text-2xl text-blue-100`
- **Buttons**:
  - Primary: White background, blue text, links to `/quiz`
  - Secondary: Outline with white border, scrolls to `#programas`
- Both buttons: `text-lg px-10 py-7`

**Animations**: Reveal with delays

---

### 11. Footer
**Background**: `bg-gray-900`
**Text**: `text-gray-300`
**Padding**: `py-12`

**Layout**: 4 columns on medium+ screens

**Column 1 - Brand**:
- Logo: "NEXUS" + "Inteligencia Artificial" subtitle
- Description: Small text about the platform

**Column 2 - Programas**:
- Links: Nexo, Precios
- All link to `/#programas`

**Column 3 - Información**:
- Links: Quiénes Somos, Cómo Funciona, Comunidad, Términos, Privacidad
- Smooth scroll to sections or full pages

**Column 4 - Newsletter**:
- Form with email input (dark background, gray border)
- Submit button: Blue, full width
- Placeholder: "tu@email.com"

**Bottom**:
- Border-top separator
- Copyright: "© 2026 Nexo. Todos los derechos reservados."
- Disclaimer text (DISCLAIMER_TEXT constant)

---

## Key Components

### Reveal Component
**Purpose**: Scroll-triggered animations
**Props**:
- `delay`: Number (milliseconds)
- `once`: Boolean (default true)
- `className`: String
- `threshold`: Number (default 0.1)

**Behavior**:
- Fades in and slides up on scroll
- Respects `prefers-reduced-motion`
- Uses Intersection Observer

**File**: `components/reveal.tsx`

### NexusLogo Component
**Props**:
- `className`: String
- `href`: String (default "/")
- `width`: Number
- `height`: Number

**Output**: Text-based logo with "NEXUS" and subtitle

**File**: `components/nexus-logo.tsx`

### NexusAvatar Component
**Props**:
- `size`: Number (default 40)
- `className`: String

**Output**: Circular avatar using `/nexus-avatar.svg` image

**File**: `components/nexus-avatar.tsx`

### FAQItem Component
**Props**:
- `question`: String
- `answer`: String

**Behavior**: Accordion with click to toggle, smooth transitions

---

## Color Scheme

### Primary Colors
- **Blue**: `blue-50`, `blue-500`, `blue-600`, `blue-700`
- **Orange**: `orange-50`, `orange-500`, `orange-600`
- **Gray**: `gray-50`, `gray-100`, `gray-200`, `gray-300`, `gray-500`, `gray-600`, `gray-700`, `gray-900`

### Gradients
- Hero: `from-blue-50 via-white to-orange-50`
- Final CTA: `from-blue-600 via-blue-700 to-orange-600`
- Various card gradients: `from-{color}-500 to-{color}-600`

### Text Colors
- Headings: `text-gray-900`
- Body: `text-gray-600`, `text-gray-700`
- White text on colored backgrounds

---

## Typography

### Headings
- H1: `text-4xl md:text-5xl lg:text-6xl font-bold`
- H2: `text-3xl md:text-4xl font-bold`
- H3: `text-2xl font-bold` or `text-xl font-bold`

### Body
- Large: `text-xl md:text-2xl`
- Medium: `text-lg`
- Base: `text-base`
- Small: `text-sm`

### Font Weights
- Bold: `font-bold`
- Semibold: `font-semibold`
- Medium: `font-medium`
- Normal: default

---

## Spacing & Layout

### Container
- Max width: `container mx-auto`
- Padding: `px-4 md:px-6`
- Section max-widths vary: `max-w-3xl`, `max-w-4xl`, `max-w-5xl`, `max-w-6xl`, `max-w-7xl`

### Section Padding
- Standard: `py-20 md:py-28`
- Hero/CTA: `py-20 md:py-32` or `py-24 md:py-32`

### Gaps
- Grid gaps: `gap-8`, `gap-12`
- Flex gaps: `gap-4`, `gap-6`

---

## Interactive Elements

### Buttons
- **Primary**: Blue or orange gradient, white text, large size
- **Secondary**: Outline variant, gray border
- **Hover**: Shadow and color transitions
- **Sizes**: `sm`, `lg` (most common)

### Links
- Smooth scroll for anchor links
- Hover: Color transitions
- All external links use Next.js `Link` component

### Forms
- Email inputs: `border-2`, focus ring
- Submit buttons: Full width on forms
- Placeholders: Gray text

---

## Animations

### Scroll Reveal
- All major sections use `<Reveal>` component
- Staggered delays (0ms, 50ms, 100ms, 200ms, 300ms)
- Fade in + slide up + blur effect
- Respects reduced motion preference

### Hover Effects
- Cards: Shadow increase, slight translate
- Buttons: Color transitions, shadow changes
- Links: Color transitions

### Transitions
- Duration: `transition-all` with default timing
- Specific: `transition-shadow`, `transition-colors`

---

## Data & Configuration

### Landing Page Config API
**Endpoint**: `/api/admin/landing-page-config`
**Method**: GET
**Response**: `{ config: { heroTitle, heroSubtitle, heroCtaText, heroCtaLink, heroSecondaryCtaText, videoUrl, videoTitle, videoDescription } }`

**Default Config**:
```typescript
{
  heroTitle: "Aprende a usar IA para generar ingresos reales, con guías probadas y una comunidad que te respalda",
  heroSubtitle: "Educación práctica enfocada en ejecución. Únete a cientos de emprendedores mexicanos que ya están transformando ideas en negocios con IA.",
  heroCtaText: "Empieza a ganar dinero",
  heroCtaLink: "/quiz",
  heroSecondaryCtaText: "Ver Cómo Funciona",
  videoUrl: "",
  videoTitle: "Video: Conoce más sobre Nexo y nuestro enfoque",
  videoDescription: "",
}
```

### Plans Data
**File**: `lib/plans-data.ts`
**Structure**: Array of plan objects with:
- `name`: String
- `price`: Number
- `oldPrice`: Number (optional)
- `tagline`: String (optional)
- `features`: Array of `{ text: string, included: boolean }`
- `isPopular`: Boolean
- `ctaText`: String
- `ctaHref`: String
- `msiText`: String (optional)

### Constants
**File**: `lib/constants.ts`
- `DISCLAIMER_TEXT`: Used in FAQ and footer

---

## Responsive Breakpoints

### Tailwind Defaults
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Common Patterns
- Mobile: Single column, stacked layout
- Tablet (`md:`): 2 columns, adjusted padding
- Desktop (`lg:`): 3-4 columns, full features

---

## Accessibility

### Features
- Semantic HTML (header, section, footer, nav)
- ARIA labels where needed
- Keyboard navigation support
- Focus states on interactive elements
- Reduced motion support in animations
- Alt text for images (via Next.js Image)

### Color Contrast
- Text on white: Gray-900, Gray-700, Gray-600
- Text on colored: White
- Sufficient contrast ratios maintained

---

## Performance Considerations

### Images
- Next.js Image component with optimization
- Avatar uses SVG
- Lazy loading where appropriate

### Code Splitting
- Client components marked with `"use client"`
- Server components where possible
- Dynamic imports not used (but could be added)

### Animations
- CSS transitions (GPU accelerated)
- Intersection Observer for scroll triggers
- Reduced motion support

---

## Important Notes for Implementation

1. **All text is in Spanish** - Maintain language consistency
2. **Currency is MXN** - All prices in Mexican Pesos
3. **Target audience**: Mexican entrepreneurs
4. **Config is dynamic** - Landing page content can be updated via admin panel
5. **Smooth scrolling** - All anchor links use smooth scroll behavior
6. **Form handlers** - Currently show alerts, should be connected to backend
7. **Newsletter form** - Footer newsletter form needs backend integration
8. **Lead magnet form** - Hero form needs backend integration
9. **Video support** - Video URL from config, iframe embed
10. **No breaking changes** - Maintain all existing functionality and features

---

## File Structure Reference

```
app/
  page.tsx                    # Main landing page
  globals.css                  # Global styles, Tailwind setup

components/
  main-header.tsx              # Header component
  reveal.tsx                   # Scroll animation component
  nexus-logo.tsx               # Logo component
  nexus-avatar.tsx             # Avatar component
  ui/
    button.tsx                 # Button component (shadcn/ui)
    card.tsx                   # Card component (shadcn/ui)

lib/
  plans-data.ts               # Plans configuration
  constants.ts                 # Constants (DISCLAIMER_TEXT)

api/
  admin/
    landing-page-config/
      route.ts                # API endpoint for config
```

---

## Testing Checklist

- [ ] All sections render correctly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Smooth scroll to sections works
- [ ] Animations trigger on scroll
- [ ] Forms submit (or show alerts)
- [ ] All links navigate correctly
- [ ] Config API loads and updates content
- [ ] Video embed works (if URL provided)
- [ ] FAQ accordion toggles correctly
- [ ] Hover effects work
- [ ] Footer newsletter form works
- [ ] Reduced motion preference respected
- [ ] Keyboard navigation works
- [ ] All images load correctly

---

## Additional Implementation Tips

1. **Start with structure** - Build HTML structure first, then add styling
2. **Component by component** - Build and test each section independently
3. **Mobile first** - Design for mobile, then enhance for larger screens
4. **Test animations** - Ensure they don't cause performance issues
5. **Validate forms** - Add proper validation before backend integration
6. **SEO considerations** - Add proper meta tags, structured data
7. **Error handling** - Handle API failures gracefully (fallback to defaults)
8. **Loading states** - Consider adding loading states for config fetch

---

This specification should provide everything needed to rebuild the landing page accurately while maintaining all features and functionality.
