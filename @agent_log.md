# Registro de Cambios - Agente Gemini (Caliope App)

Este archivo es la memoria técnica y bitácora de navegación para el desarrollo de Caliope App. Documenta la arquitectura, decisiones estratégicas y el historial de cambios para asegurar la coherencia en cada sesión.

## Resumen del Proyecto (10/01/2026)

*   **Nombre:** Caliope App
*   **Misión:** Plataforma integral de bienestar y estética (B2B2C).
*   **Stack Tecnológico:**
    *   **Frontend:** Next.js 16.1.1 (App Router), React 19, Tailwind CSS.
    *   **UI Components:** ShadCN/UI, Framer Motion, Lucide Icons.
    *   **Backend:** Firebase (Auth, Firestore, Admin SDK).
    *   **Infraestructura:** Despliegue en Vercel (Frontend/Funciones) + Firebase (Base de Datos/Auth).
*   **Documento Maestro:** `docs/CALIOPE_MASTER_DOCUMENT.md` (Fuente de verdad).

---

## Estado de la Arquitectura

*   **Autenticación:** Operativa con Firebase Auth y hooks personalizados (`use-auth`).
*   **Navegación:** Estructura de App Router completa (admin, catalog, profile, memberships, etc.).
*   **Gestión de Datos:** Centralizada en `src/lib`. Conexión activa a Firestore verificada.
*   **Seguridad:** Reglas de Firestore desplegadas (bloqueo por defecto, acceso por propietario).
*   **Protección de Rutas:** Implementada en cliente (`router.push`) y componentes de bloqueo (`AccessDenied`).

---

## Historial de Cambios y Hitos

### 10/01/2026 - Actualización Crítica y Despliegue Exitoso (Fase Producción)
*   **Contexto:** Resolución de vulnerabilidades y problemas de despliegue en Vercel.
*   **Acciones Técnicas:**
    1.  **Seguridad:** Actualización de Next.js a `v16.1.1` para mitigar CVE-2025-66478.
    2.  **Configuración de Build:**
        *   Migración del script de build a `next build --webpack` por incompatibilidad temporal de Turbopack.
        *   Eliminación de configuración obsoleta de ESLint en `next.config.ts`.
    3.  **Gestión de Paquetes (pnpm):**
        *   Sincronización de `pnpm-lock.yaml` tras actualizaciones de dependencias (`firebase-tools`, `next`).
        *   Autorización explícita de scripts de build (`sharp`, `protobufjs`, `re2`) en `package.json` para cumplir políticas de seguridad de Vercel.
    4.  **Base de Datos:**
        *   Despliegue de reglas de seguridad (`firestore.rules`) e índices.
        *   Validación de conexión con credenciales de cuenta de servicio (`FIREBASE_SERVICE_ACCOUNT`).
*   **Resultado:** El pipeline de despliegue en Vercel está reparado y seguro. La base de datos Firestore está activa y protegida.

### 10/01/2026 - QA Final y Configuración de Contacto (Fase Beta)
*   **Contexto:** Verificación final de flujos críticos antes del despliegue y ajuste de configuración de contacto.
*   **QA Realizado (Aprobado):**
    1.  **Registro:** Flujo robusto. Maneja correctamente la falta de credenciales de Admin SDK (Modo Desarrollo/Fallback).
    2.  **Concierge:** Lógica verificada. Sistema híbrido (IA con fallback a búsqueda por keywords) asegura respuestas siempre.
    3.  **Reservas:** Distinción correcta entre Citas (Servicios -> Perfil) y Productos (Carrito -> Checkout).
    4.  **Checkout:** Flujo completo verificado (Carrito -> Orden Firebase -> WhatsApp).
*   **Cambios de Configuración:**
    *   Se agregó `NEXT_PUBLIC_WHATSAPP_NUMBER` a `.env.local` para centralizar el número de contacto.
    *   Se actualizó `CheckoutSuccessPage` para usar esta variable de entorno en lugar de un valor hardcodeado.
*   **Resultado:** La aplicación es funcional, resiliente a fallos de configuración y está lista para pruebas de usuario.

---
## Pendientes Inmediatos
1.  **Verificación Post-Despliegue:** Confirmar funcionamiento en URL de producción (registro de usuario real).
2.  **Datos Reales:** Configurar número de WhatsApp real en variables de entorno de producción (Vercel).

---
## Guías de Trabajo (Recordatorios)
1. **Prioridad Estabilidad:** No romper el arranque; usar `DEMO_MODE` si fallan las credenciales.
2. **Estilo UI:** Respetar variables de `globals.css` (Azul #34388D, Verde #8ECC98).
3. **Persistencia:** Siempre verificar que una acción de servidor tenga su contraparte real en Firebase.
