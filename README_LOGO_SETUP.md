# Configuración del Logo NEXUS

## Archivos de Imagen Requeridos

Para que el logo funcione correctamente, necesitas agregar las siguientes imágenes a la carpeta `/public`:

### 1. Logo Principal (`nexus-logo.svg` o `nexus-logo.png`)
- **Ubicación**: `/public/nexus-logo.svg` o `/public/nexus-logo.png`
- **Descripción**: El logo completo de NEXUS con el texto "NEXUS" y "INTELIGENCIA ARTIFICIAL"
- **Uso**: Se usa en headers, navegación y footer
- **Dimensiones recomendadas**: 120x40px (o proporción similar)

### 2. Avatar Circular (`nexus-avatar.svg` o `nexus-avatar.png`)
- **Ubicación**: `/public/nexus-avatar.svg` o `/public/nexus-avatar.png`
- **Descripción**: El logo circular (en círculo gris claro) sin el texto de abajo
- **Uso**: Se usa para avatares de perfil, testimonios y elementos circulares
- **Dimensiones recomendadas**: 200x200px (o mayor, se escalará automáticamente)

## Componentes Creados

### `NexusLogo`
Componente reutilizable para mostrar el logo principal.

```tsx
import NexusLogo from "@/components/nexus-logo"

// Uso básico
<NexusLogo />

// Con personalización
<NexusLogo width={120} height={40} href="/" className="custom-class" />
```

### `NexusAvatar`
Componente reutilizable para mostrar el avatar circular.

```tsx
import NexusAvatar from "@/components/nexus-avatar"

// Uso básico
<NexusAvatar />

// Con tamaño personalizado
<NexusAvatar size={48} className="shadow-lg" />
```

## Lugares Actualizados

Los siguientes componentes y páginas ahora usan el nuevo logo:

- ✅ `components/main-header.tsx` - Header principal
- ✅ `components/simple-header.tsx` - Header simple
- ✅ `app/admin/layout.tsx` - Sidebar del admin
- ✅ `app/page.tsx` - Landing page (avatar en sección "Quiénes Somos", testimonios, footer)
- ✅ Footer del landing page

## Notas

- Si las imágenes no se encuentran, Next.js mostrará un error. Asegúrate de que los archivos estén en `/public` con los nombres exactos.
- Los componentes usan `next/image` para optimización automática.
- El avatar se muestra dentro de un contenedor circular con fondo gris claro para mantener consistencia visual.



