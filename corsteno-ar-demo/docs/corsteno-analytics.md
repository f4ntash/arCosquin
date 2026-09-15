# Corsteno Analytics en Cosquín

Cosquín usa un cliente interno compatible con Corsteno Event API en `src/lib/corstenoAnalyticsClient.ts`. El wrapper está en `src/analytics.ts`; los componentes solo llaman `trackEvent`/`trackOnce`. En el futuro puede reemplazarse por un paquete publicado sin cambiar el contrato de eventos.

## Configuración local

Copiar `.env.example` a `.env.local` y completar la key local fuera del repositorio. La credential debe permitir solo ingestión (`POST /v1/events` y batch), nunca lectura o administración. La API URL y key no se hardcodean en componentes.

Con API local se mantiene la configuración existente en `.env.local` (`https://127.0.0.1:8787`). Para producción, pasar `VITE_CORSTENO_ANALYTICS_URL=https://api.corsteno.com`, la key de ingestión frontend y `VITE_CORSTENO_ANALYTICS_DEBUG=false` al entorno que ejecuta `npm run build`; como la app es estática, esas variables se incorporan al cliente durante el build, no se leen desde variables runtime del Worker. `scripts/build-production.mjs` evita que los valores de `.env.local` pasen a producción si no se suministran explícitamente. La key resultante es visible para visitantes: debe permitir ingestión únicamente y nunca ser un secreto administrativo. Si faltan URL o key, el tracking se desactiva y la app sigue funcionando; solo se muestra warning en development/debug.

El endpoint productivo resultante es `https://api.corsteno.com/v1/events`; el batch del cliente usa el mismo endpoint por evento. Todos los eventos añaden `surface=web`, `experience=cosquin_ar` y `demo_mode=true` en `properties`; no se modificó el contrato superior del payload.

## CORS de producción

No se modifica el backend. El origin exacto de la app desplegada no está declarado en este repositorio ni en `wrangler.jsonc`; debe agregarse al CORS como el origin que figure en Cloudflare, por ejemplo `https://<dominio-real-cosquin>`. No asumir `arcosquin.pages.dev` sin confirmarlo en el dashboard.

## Cloudflare Build

Crear en el entorno de producción, sin guardar valores reales en el repositorio:

```text
VITE_CORSTENO_ANALYTICS_URL=https://api.corsteno.com
VITE_CORSTENO_ANALYTICS_KEY=<credential productiva de ingestion>
VITE_CORSTENO_ANALYTICS_DEBUG=false
```

Para validar localmente sin certificados: `npm run dev:http` sirve temporalmente en `http://localhost:5175`. Este modo no modifica ni elimina la configuración HTTPS normal. El API CRM actualmente deriva CORS de `WEB_ORIGIN` y por defecto permite `http://localhost:5173`; para esta prueba debe iniciarse el CRM con `WEB_ORIGIN=http://localhost:5175` (cambio en el repo CRM, no en esta app).

El cliente genera y persiste un `anonymous_user_id` en localStorage y un `session_id` en sessionStorage. No se envía PII. Los fallos de red son absorbidos por el cliente y nunca bloquean cámara, navegación o UI.

## Prueba

Ejecutar `npm install`, `npm run dev`, abrir la app, iniciar AR, detectar `cosquin-rock` y cerrar. Revisar los eventos en el Analytics del proyecto Cosquín Rock 2026. No se implementan aún configuración dinámica, premios, probabilidades, stock ni backend propio.
