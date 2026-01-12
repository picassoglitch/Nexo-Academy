# Guía de Animaciones Premium - TailwindCSS

## 📋 Resumen

Se ha implementado un sistema completo de animaciones "live" tipo premium SaaS usando **TailwindCSS puro** y **IntersectionObserver** (sin librerías externas). El sitio ahora tiene:

- ✅ Animaciones de scroll reveal (reveal on scroll)
- ✅ Micro-interacciones hover/press
- ✅ Transiciones suaves
- ✅ Diseño premium sin verse "gimmicky"
- ✅ Accesibilidad (reduced motion)

---

## 🎨 Design Tokens (Tailwind Config)

### Colores Brand
- `brand-50` a `brand-950`: Escala azul-violeta moderna
- `surface.DEFAULT` y `surface.soft`: Fondos
- `text.primary`, `text.secondary`, `text.muted`: Textos
- `border.soft`: Bordes sutiles

### Sombras
- `shadow-soft`: Sombra suave para cards
- `shadow-lift`: Sombra elevada para hover
- `shadow-glow`: Sombra con glow para elementos destacados

### Border Radius
- `rounded-xl`, `rounded-2xl`, `rounded-3xl`: Radios premium

### Background Gradients
- `bg-gradient-brand`: Gradiente azul-violeta
- `bg-gradient-hero`: Gradiente para hero sections

---

## 🧩 Componentes Base

### 1. `<Button />`
**Variantes:** `primary`, `secondary`, `outline`, `ghost`  
**Tamaños:** `sm`, `md`, `lg`

**Características:**
- Hover: `hover:-translate-y-[1px]` (no `translate-y-0.5`)
- Active: `active:scale-[0.98]`
- Focus: `focus-visible:ring-2 focus-visible:ring-brand-400/50`
- Transición: `transition-all duration-200 ease-out`

### 2. `<Card />`
**Estilos base:**
- `rounded-2xl`
- `border border-slate-200/60`
- `bg-white/80 backdrop-blur-md`
- `shadow-soft`
- Hover: `hover:-translate-y-1 hover:shadow-lift`

### 3. `<Badge />`
**Variantes:** `default`, `secondary`, `destructive`, `outline`

**Estilo default:**
- `rounded-full px-3 py-1 text-xs`
- `bg-brand-50 text-brand-700 border border-brand-200/60`

---

## ✨ Animaciones Scroll Reveal

### Hook: `useRevealOnScroll()`

**Ubicación:** `hooks/use-reveal-on-scroll.ts`

**Características:**
- Usa `IntersectionObserver`
- Respeta `prefers-reduced-motion`
- Soporta `delay` y `once`
- Estados:
  - Inicial: `opacity-0 translate-y-6 blur-[2px]`
  - Visible: `opacity-100 translate-y-0 blur-0`
  - Transición: `transition-all duration-700 ease-out`

### Componente: `<Reveal />`

**Ubicación:** `components/reveal.tsx`

**Uso:**
```tsx
<Reveal delay={0}>
  <h1>Título</h1>
</Reveal>

<Reveal delay={100}>
  <p>Subtítulo</p>
</Reveal>

<Reveal delay={200} once={false}>
  <Card>Contenido que se anima cada vez que entra en viewport</Card>
</Reveal>
```

**Props:**
- `delay?: number` - Delay en ms (0, 100, 200, etc.)
- `once?: boolean` - Si solo anima una vez (default: true)
- `className?: string` - Clases adicionales
- `threshold?: number` - Threshold del IntersectionObserver (default: 0.1)

---

## 📄 Páginas Actualizadas

### 1. Landing Page (`/30-dias-ia`)
- ✅ Hero con Reveal en badge, H1, subtext, CTA
- ✅ Spotlight background que se mueve con scroll
- ✅ Cards de beneficios con Reveal stagger
- ✅ Pricing con Reveal en cada card

### 2. Home Page (`/`)
- ✅ Hero sin urgencia, con Reveal
- ✅ Sección "Quiénes Somos" con Reveal
- ✅ "Cómo Funciona" con 4 cards en stagger
- ✅ Programs Overview con Reveal
- ✅ Pricing Preview con Reveal

### 3. Quiz Results (`/quiz`)
- ✅ Alternative Tiers con Reveal stagger
- ✅ Cards premium con hover effects

### 4. Dashboard (`/dashboard`)
- ✅ Cards de progreso con hover effects
- ✅ Locked features con overlay sutil
- ✅ Enabled features con iconos animados

---

## 🎯 Clases Estándar

### Card Base
```tsx
className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-lift"
```

### Section Spacing
```tsx
className="py-16 md:py-24"
```

### Container
```tsx
className="mx-auto max-w-6xl px-4 md:px-6"
```

### H1
```tsx
className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900"
```

### Body Text
```tsx
className="text-base md:text-lg text-slate-600"
```

### Primary Button
```tsx
className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-white font-medium shadow-soft transition-all duration-200 ease-out hover:bg-brand-700 hover:shadow-lift active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50"
```

---

## 🧪 Cómo Probar las Animaciones

### 1. Scroll Reveal
1. Abre cualquier página (landing, home, quiz)
2. Haz scroll hacia abajo lentamente
3. Observa cómo los elementos aparecen con fade + translate + blur
4. Los elementos con `delay` aparecen escalonados

### 2. Hover Effects
1. Pasa el mouse sobre cualquier card
2. Observa el lift (`-translate-y-1`) y shadow más fuerte
3. Los botones tienen `-translate-y-[1px]` sutil
4. Los iconos en cards cambian de color de fondo

### 3. Active States
1. Haz clic en cualquier botón
2. Observa el `scale-[0.98]` al presionar

### 4. Focus States
1. Navega con Tab
2. Observa el ring de focus (`ring-2 ring-brand-400/50`)

---

## ♿ Accesibilidad (Reduced Motion)

### Cómo Desactivar Animaciones

**Opción 1: Sistema Operativo**
1. Windows: Configuración → Accesibilidad → Efectos visuales → "Reducir animaciones"
2. macOS: Preferencias del Sistema → Accesibilidad → Pantalla → "Reducir movimiento"
3. El sitio detecta automáticamente y desactiva animaciones

**Opción 2: Navegador**
- Chrome/Edge: `chrome://flags/#prefers-reduced-motion`
- Firefox: `about:config` → `ui.prefersReducedMotion`

**Comportamiento con Reduced Motion:**
- ❌ Sin `translate-y` ni `blur`
- ✅ Solo `opacity` fade (más rápido)
- ✅ Hover effects se mantienen (no son molestos)

---

## 📁 Archivos Creados/Modificados

### Nuevos
- `hooks/use-reveal-on-scroll.ts` - Hook para scroll reveal
- `hooks/use-scroll-progress.ts` - Hook para progress del scroll
- `components/reveal.tsx` - Componente wrapper para Reveal
- `components/ui/badge.tsx` - Componente Badge premium

### Modificados
- `tailwind.config.ts` - Tokens premium agregados
- `components/ui/button.tsx` - Estilos premium actualizados
- `components/ui/card.tsx` - Estilos premium actualizados
- `components/ui/dialog.tsx` - Estilos premium para modales
- `app/30-dias-ia/page.tsx` - Animaciones Reveal aplicadas
- `app/page.tsx` - Animaciones Reveal aplicadas
- `app/quiz/page.tsx` - Animaciones Reveal en results
- `components/plan-card.tsx` - Estilos premium
- `components/plan-option-card.tsx` - Estilos premium
- `components/dashboard-content.tsx` - Cards premium
- `components/locked-feature-card.tsx` - Overlay sutil
- `components/enabled-feature-card.tsx` - Iconos animados
- `components/upsell-modal.tsx` - Modal premium

---

## 🚀 Performance

- ✅ No se anima layout pesado en scroll
- ✅ `will-change` solo cuando necesario
- ✅ IntersectionObserver desconecta después de `once: true`
- ✅ Transiciones optimizadas con `ease-out`
- ✅ Backdrop blur solo en elementos necesarios

---

## 🎨 Inspiración

Inspirado en **tixu.ai** (sensación viva y premium) sin copiar directamente. El diseño mantiene:
- Colores brand consistentes
- Espaciado generoso
- Tipografía clara
- Micro-interacciones sutiles
- Sin efectos "gimmicky"

---

## 📝 Notas Finales

- **No se rompió ninguna ruta, checkout, ni lógica**
- **Mantiene accesibilidad completa**
- **Compatible con responsive (mobile/desktop)**
- **Listo para producción**

---

**Última actualización:** 2026-01-06





