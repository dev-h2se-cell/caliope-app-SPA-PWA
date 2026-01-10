# Registro de Cambios - Agente Gemini (Caliope App)

Este archivo es la memoria técnica y bitácora de navegación para el desarrollo de Caliope App. Documenta la arquitectura, decisiones estratégicas y el historial de cambios para asegurar la coherencia en cada sesión.

## Resumen del Proyecto (10/01/2026)

*   **Nombre:** Caliope App
*   **Misión:** Plataforma integral de bienestar y estética (B2B2C).
*   **Stack Tecnológico:**
    *   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS.
    *   **UI Components:** ShadCN/UI, Framer Motion, Lucide Icons.
    *   **Backend:** Firebase (Auth, Firestore, Admin SDK).
    *   **Estado de Datos:** Implementación de `DEMO_MODE` para resiliencia sin credenciales.
*   **Documento Maestro:** `docs/CALIOPE_MASTER_DOCUMENT.md` (Fuente de verdad).

---

## Estado de la Arquitectura

*   **Autenticación:** Operativa con Firebase Auth y hooks personalizados (`use-auth`).
*   **Navegación:** Estructura de App Router completa (admin, catalog, profile, memberships, etc.).
*   **Gestión de Datos:** Centralizada en `src/lib`. Los datos de catálogo se manejan mediante carga de JSON y persistencia en Firestore.
*   **Protección de Rutas:** Implementada en cliente (`router.push`) y componentes de bloqueo (`AccessDenied`).

---

## Historial de Cambios y Hitos

### 10/01/2026 - SEO Dinámico y Cierre de Venta (Fase 4)
*   **Contexto:** Preparación para Beta. Solución de problemas de visibilidad (SEO) y flujo de pago manual.
*   **Cambios Realizados:**
    1.  **SEO:** Implementación de `generateMetadata` en `/service/[id]`. Ahora los enlaces compartidos muestran imagen, título y descripción correctos.
    2.  **Checkout Success:** Nueva página `/checkout/success/[orderId]` con animación de confeti y botón de WhatsApp pre-llenado para coordinar el pago. Esto resuelve la falta de pasarela de pagos automática.
    3.  **Dependencias:** Instalación de `canvas-confetti`.
*   **Resultado:** El proyecto está listo para ser desplegado en una Beta Cerrada.

### 10/01/2026 - Reparación y Refactorización
*   **Contexto:** El frontend se reportó dañado (error de sintaxis) y se solicitó limpieza.
*   **Cambios Realizados:**
    1.  **Fix Crítico:** Corrección de error de sintaxis en `AdminPageClient.tsx` (tags mal cerrados en `LoadingSkeleton`).
    2.  **Limpieza:** Eliminación de múltiples `console.log` de depuración y simulación en `app/actions.ts`, `concierge/actions.ts` y `admin/actions.ts`.
    3.  **Refactorización:**
        *   Implementación de `useCallback` en `UserManagement.tsx` y `AdminPageClient.tsx` para optimizar funciones de fetch.
        *   Resolución de advertencias de linter (dependencias de `useEffect`).
    4.  **Verificación:** Build y Lint exitosos.
*   **Resultado:** El proyecto compila correctamente y el código está más limpio y optimizado.

---
## Pendientes Inmediatos
1.  **QA Final:** Pruebas de integración del flujo completo (Registro -> Concierge -> Reserva -> Compra).

---
## Guías de Trabajo (Recordatorios)
1. **Prioridad Estabilidad:** No romper el arranque; usar `DEMO_MODE` si fallan las credenciales.
2. **Estilo UI:** Respetar variables de `globals.css` (Azul #34388D, Verde #8ECC98).
3. **Persistencia:** Siempre verificar que una acción de servidor tenga su contraparte real en Firebase.
