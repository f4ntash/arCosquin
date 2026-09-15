# Cosquín Rock AR — auditoría final de release

Fecha de auditoría: **2026-09-15**. Repositorio: `corsteno-ar-demo`. Producción revisada: `https://cosquinrock.corsteno.com/`. Resultado de esa auditoría: **NO-GO** hasta ejecutar la prueba física descrita en [cosquin-release-device-test.md](./cosquin-release-device-test.md). La instrucción posterior de producto confirma que el reloj y las ubicaciones simuladas deben conservarse; esta actualización los etiqueta explícitamente como demo.

Actualización y deploy: `2026-09-15`, versión Worker `9d19e110-9262-444f-a856-58461401fec3`. Se publicó el ajuste de demo y el mensaje de recuperación de cámara. La verificación post-deploy cubrió home, ocho anchos, asset bundles y flujo de denegación de cámara en el navegador de auditoría.

## Alcance y evidencia

Inspección de todo el repo (Vite + TypeScript, Worker de Cloudflare, assets públicos, MindAR, target, manifest, service worker, analytics, navegación, datos, calendario, scripts y docs); home de producción en navegador con tamaños 320/360/375/390/414/430/768/1280; endpoints públicos de assets; build y auditoría de dependencias de producción. No se concedieron permisos de cámara/ubicación, no se envió un POST de analytics a producción y no se usaron teléfonos físicos. Las limitaciones están identificadas explícitamente; no se infiere que AR o analytics estén operativos solo porque la página carga.

## Mapa del producto y deploy

Actualización de producto posterior a la auditoría: demo time y navegación demo son intencionales. No deben eliminarse ni reemplazarse; la UI debe informar claramente que shows, fechas y ubicaciones son simulados.

- Entrada: `index.html` → `src/main.ts` → `src/styles.css`; Vite 8, TypeScript. `npm run build` usa `scripts/build-production.mjs` para correr typecheck, Vite y `scripts/generate-service-worker.mjs`; impide que `.env.local` entre al bundle salvo variables proporcionadas explícitamente por el entorno de build.
- AR: dependencia `mind-ar` (MindAR Image Tracking), importación diferida desde `src/ar/ARExperience.ts`, target `/targets/cosquin-rock.mind`, anchor de índice 0 y una capa Three.js renderizada. La búsqueda del target tiene timeout de inicio de 12 s. Errores normalizados se pasan a UI.
- Datos/acciones: agenda 14–15 febrero 2026, ocho escenarios, favoritos persistidos en almacenamiento local, exportación ICS y link de Google Calendar. `src/config/navigation.ts` configura coordenadas/distancias de demo; `NavigationController` lee geolocalización y orientación del dispositivo.
- Offline: el build genera `dist/sw.js`, que precachea todos los archivos de `dist` y shell/target. No hay service worker fuente estático; es generado al compilar.
- Publicación: `wrangler.jsonc` declara Worker `arcosquin`, compatibilidad `2026-08-26` y assets `./dist`; no declara route, binding ni variables. La resolución del dominio/route debe comprobarse en Cloudflare. La home responde desde Cloudflare y el dominio canónico abre sin redirección observada.
- `three` está en package.json y se importa MindAR Three; sí hay render Three indirecto dentro de MindAR aunque no se encontraron GLB/GLTF o modelos 3D propios. El bundle MindAR contiene Three y tracking; no retirar la dependencia hoy.
- Manifest presente: nombre Cosquín Rock 2026, start_url/scope `/`, standalone, colores. No declara iconos. No se inventa una PWA/instalabilidad completa.

## Tabla final

| Área | Resultado | Riesgo | Acción |
|---|---|---|---|
| Build | **Pasa**: `npm run build`, typecheck incluido; wrapper evita filtrar valores locales de `.env.local`; bundle publicado comprobado sin endpoint ni key locales. No hay scripts test/lint. | Medio: warnings de `fs` y `util` externalizados al bundle browser; chunks >500 kB. | P2: validar esos módulos en dispositivos; sin actualizaciones masivas. |
| Domain | **Pasa tras deploy**: dominio canónico sirve los assets/versiones nuevas mediante Cloudflare. | Bajo: route no está declarada en wrangler.jsonc aunque el dominio está operativo. | No se tocó DNS; verificar el dashboard en una revisión de infraestructura si hace falta. |
| First load | **Pasa en producción**: “MODO DEMO”, explicación de agenda/ubicaciones simuladas, CTA e indicación de cámara visibles. Screenshot revisado; consola limpia. Sin logo/imagen. | Bajo: queda por confirmar aprobación final de la marca “CORSTENO LABS / AR CONCEPT”. | Aprobar branding si lo requiere el cliente. |
| Mobile | **Pasa home responsive en emulación** a los ocho anchos pedidos, sin overflow horizontal; CTA dentro del viewport. | Medio: emulación no cubre notch, address bar real, teclado ni gestos. | Ejecutar iPhone y Android físicos. |
| iOS readiness | **No verificado en hardware**. Safari requiere HTTPS; orientación en iOS puede requerir permiso con gesto. | Alto hasta prueba física. | Seguir plan manual en iPhone Safari. |
| Android readiness | **No verificado en hardware**. Chrome requiere HTTPS para cámara; comportamiento real depende de dispositivo/permisos. | Alto hasta prueba física. | Seguir plan manual en Android Chrome. |
| Camera | El click llegó a `getUserMedia`, pero el entorno de auditoría devolvió `NotAllowedError` por política del sistema; no se otorgó permiso ni se probó video de cámara. | Alto: flujo allow y dispositivos reales no verificados. | Probar allow/deny desde Safari iOS y Chrome Android con teléfonos físicos. |
| AR init | **Parcial**: en producción target devuelve 200, MindAR importa y crea anchor; inicio termina en cámara denegada por sistema. Rótulo demo permanece visible y el error ahora es comprensible, sin stack trace. | Alto: stream, render loop y tracking real pendientes. | Prueba física con cámara permitida y target correcto. |
| Target detection | **Asset disponible**: 200, 340.100 bytes; mismo-origin; la copia sin extensión es byte idéntica. Matching real no probado. | Alto hasta prueba del póster correcto. | Confirmar que el póster entregado corresponde al target compilado y detectar en teléfono. |
| Target recovery | Código recibe onTargetFound/onTargetLost con guard contra eventos repetidos. Recuperación visual no probada; al perder target se conserva modo `target`. | Medio: puede no ser obvio que se perdió el tracking. | Observar pérdida/reacquisición en equipos y revisar si el indicador informa estado real. |
| Orientation | CSS usa `100dvh` y safe-area; no se probó cámara/canvas real en rotación. | Medio. | Prueba portrait → landscape → portrait en ambos equipos. |
| Background/resume | Sin manejo explícito `visibilitychange`/resume encontrado. | Alto: browser puede pausar video/render y volver con cámara congelada. | Probar cambio de app/tab; documentar si requiere reiniciar AR. |
| Navigation | Lógica intacta; el overlay ahora rotula “NAVEGACIÓN DEMO” y advierte que las ubicaciones no corresponden al predio. No fue posible entrar al flujo sin cámara/target real. | Medio hasta comprobar espacio/visibilidad en teléfono. | Validar tras detección en dispositivo. |
| Content | Home se presenta literalmente como “Experiencia conceptual”; lista extensa de agenda/artistas hardcodeada. Veracidad artística no se puede certificar desde el código. | Alto si se comunica como agenda oficial. | Matías debe aprobar contenido fuente y estatus demo/producción. |
| Dates | Reloj intencionalmente fijo a 14-feb-2026 18:00; producción etiqueta la experiencia “MODO DEMO · Shows simulados · 14 FEB 2026”. Agenda simulada conserva 14–15 feb 2026. | Bajo con rótulo persistente; datos no oficiales. | Conservado y verificado en producción. No cambiar nombres/horarios sin fuente aprobada. |
| Coordinates | `DEMO_STAGE_LOCATIONS` ficticias alimentan destinos y distancias; overlay rotula “NAVEGACIÓN DEMO” y aclara que no son del predio. | Bajo con aviso visible; las direcciones no deben usarse en el evento real. | Conservado y rotulado en producción; validar tamaño/legibilidad de aviso durante prueba física. |
| External links | No hay enlaces externos visibles en home; código arma Google Calendar. No se encontraron enlaces WhatsApp, mapas, tickets o redes codificados. | Bajo/medio: destino Google Calendar generado no se probó en producción. | Probar ICS/Google Calendar en ambos SO y confirmar si faltan CTAs oficiales. |
| Analytics | Cliente espera POST `${VITE_CORSTENO_ANALYTICS_URL}/v1/events`, Bearer key. Bundle desplegado no contiene endpoint ni key, por lo que el cliente está apagado y no se observó ningún evento. El código agrega `demo_mode: true` cuando analytics está configurado; no se bloquearon triggers existentes. | Alto: analytics no está enviando en producción. La key VITE queda pública en cliente y debe ser una key de ingestión restringida. | Configurar key frontend aprobada, verificar auth/CRM y observar un único evento de demo. No usar secreto admin. |
| Event map | El doc enumera **19**, no 20 nombres. La integración local declara 19 eventos tipados. La documentación de triggers/payloads se cotejó con código, pero ningún evento se observó en producción porque el bundle no habilita el cliente. | Alto para medición/atribución. | Corregir expectativa a 19 o explicar el evento faltante; validar por evento en API al habilitar analytics. Tabla abajo. |
| CORS | Preflight `OPTIONS` a analytics respondió 204 y `Access-Control-Allow-Origin: https://cosquinrock.corsteno.com`; GET de target es same-origin. No se hizo POST con credencial. | Medio para analytics: falta verificar auth/ingestión. | Smoke con key de ingestión y un único evento de prueba cuando la app la tenga configurada. |
| Offline/error handling | Worker `/sw.js` responde 200 y fue generado para 11 URLs en build local. No se simuló offline en producción. Analytics captura fallo de fetch sin bloquear UI. | Medio: instalación offline es posterior a primera carga; `cache.addAll` podría fallar completo. | Probar segunda visita offline y error de asset/red lenta. |
| Assets | Home, JS/CSS publicados, manifest, sw, favicon y target responden 200; sourcemap no existe (404 esperado). Target 340 KB x2 idéntico; favicon 184.399 bytes. | Bajo/medio: copia de target duplicada en precache y favicon grande. | P2: documentar limpieza/optimización posterior si no afecta deploy. |
| Performance | JS app publicado ~45,9 KB; CSS ~16 KB; MindAR local ~1,71 MB minificado (444 KB gzip), target ~340 KB; service worker precachea assets de build. Tiempo de carga reportado por browser no se midió con perfil móvil. | Medio, sobre todo Android de gama baja/red lenta; precarga aumenta transferencia. | P2: medir en hardware/red mala; no optimizar arriesgadamente hoy. |
| Console | Cero logs al cargar home de producción. AR no activado; por eso no se afirma cero errores durante tracking. Build warnings son los citados arriba. | Medio por falta de AR real. | Revisar consola durante plan manual. |
| Security | No se vio endpoint/key analytics en bundle publicado. Analytics usa ID anónimo en localStorage + sessionStorage; no manda ubicación en sus propiedades visibles. Navegación sí solicita geolocalización. No hay CSP configurada en repo; assets públicos. | Medio: si se inyecta key en VITE queda expuesta; orientación/GPS requieren consentimiento contextual. Inicializar analytics podría fallar si el storage está bloqueado. | Usar key de ingestión de menor privilegio; revisar headers del Worker y explicar permisos al usuario. |
| Cloudflare | Worker `arcosquin` desplegado con assets `dist`; el dominio canónico sirve el build tras deploy. Wrangler reportó version ID `9d19e110-9262-444f-a856-58461401fec3`. No hay route/bindings/env declarados en wrangler.jsonc. | Bajo/medio: route se conserva fuera del archivo de configuración. | No se cambió DNS; validar route en dashboard al revisar infraestructura. |
| CRM contract | El repo documenta endpoint y forma de payload. No se inspeccionó CRM ni se verificó atribución Workspace/User/application en backend. | Medio: atribución requerida por contrato no comprobable desde cliente. | Confirmar en CRM Workspace Cosquín Rock, user `cosquinrock@corsteno.com`, `experiences.type=ar`, URL pública indicada, ingestion URL y `applications.application_type=webar` si ése sigue siendo contrato. |

## Tabla de eventos (19 documentados)

Los payloads, cuando se envían, incluyen `surface=web` y `experience=cosquin_ar`; user/session IDs aleatorios se añaden en el cliente. “Producción observada” significa observado durante la visita de auditoría (no una prueba de activación de cámara).

| Event | Trigger (código) | Payload OK | Production observed |
|---|---|---|---|
| `app_opened` | Carga, `trackOnce` | `app_version`, `language` | No; analytics ausente del bundle |
| `session_started` | Carga, `trackOnce` | Propiedades base | No; analytics ausente del bundle |
| `experience_started` | Click iniciar | `experience: ar` | No; CTA no ejecutado |
| `camera_permission_granted` | `ARExperience.onReady` | Propiedades base | No; cámara sin probar |
| `image_target_detected` | `onTargetFound` | `target_id: cosquin-rock` | No; target físico sin probar |
| `current_shows_viewed` | Primera detección por activación | Propiedades base | No; target físico sin probar |
| `ar_target_lost` | `onTargetLost` | Propiedades base | No; target físico sin probar |
| `camera_permission_denied` | Error con texto camera/permission | Propiedades base | No; cámara sin probar |
| `experience_finished` | Click cerrar AR | `experience: ar` | No; AR no iniciado |
| `favorite_added` | Toggle favorito | `artist_name`, `stage` | No; AR/UI interior no activado |
| `favorite_removed` | Toggle favorito | `artist_name`, `stage` | No; AR/UI interior no activado |
| `go_to_show_clicked` | Solicitar navegación a show | `artist_name`, `stage` | No; interior no activado |
| `offline_mode_used` | Primera notificación offline de la página | Propiedades base | No; sin sesión offline |
| `navigation_started` | Entrar a navegación (una por ciclo) | `artist_name`, `stage` si hay show | No; interior no activado |
| `direction_viewed` | Entrar a navegación (una por ciclo, antes de confirmar dirección real) | Propiedades base | No; interior no activado |
| `navigation_stopped` | Salir de navegación si inició | Propiedades base | No; interior no activado |
| `schedule_viewed` | Abrir agenda | Propiedades base | No; interior no activado |
| `my_schedule_viewed` | Abrir Mi Grilla | Propiedades base | No; interior no activado |
| `map_viewed` | Abrir mapa interno | Propiedades base | No; interior no activado |

Listeners se vuelven a enlazar a nodos que se regeneran, así que no se observó duplicación obvia por render. Hay guardas en `trackOnce`, target found/lost y algunos eventos por ciclo. No se pudo validar duplicados de clicks/AR sin activar esos flujos. `initializeAnalytics()` no realiza acción.

## Faltantes

### P0 — bloquea envío hoy

- [x] Conservar reloj demo y navegación con coordenadas ficticias, según instrucción de producto; rotularlos en home, pantalla AR y overlay de navegación para que no se interpreten como datos reales. Deploy y home confirmados en la versión indicada arriba.
- [ ] Revisar branding/copy final. El rótulo de demo aclara los datos simulados, pero falta confirmar si “AR CONCEPT”/“CORSTENO LABS” son los nombres visuales aprobados.

### P1 — resolver hoy si forma parte del release

- [ ] Verificar config de Worker/domain route y analytics productivo con CRM; ahora analytics no está habilitado en JS de producción.
- [ ] Hacer pruebas físicas iOS y Android de cámara/target/permisos/orientación/resume/offline; no se puede certificar AR sin ellas.
- [x] Reemplazar el título interno “ERROR DE DESARROLLO” y evitar exponer stack trace; el estado ahora comunica que AR no inició y sugiere revisar cámara/compatibilidad. Verificado con denegación en navegador de auditoría.
- [ ] Aprobar links/CTAs y contenido; no hay tickets/redes/maps/WhatsApp visibles.
- [ ] Probar doble toque del CTA: código no tiene guard de arranque en `startExperience`, por lo que taps rápidos pueden instanciar más de una experiencia/cámara.
- [ ] Confirmar comportamiento si almacenamiento local está bloqueado: el cliente analytics accede a localStorage/sessionStorage durante inicialización sin capturar excepciones.

### P2 — posterior a entrega

- [ ] Optimizar o justificar target duplicado y favicon grande; medir transferencia y rendimiento en móvil de gama media/baja.
- [ ] Revisar estrategia de caché/instalación offline después de primer load.
- [ ] Validar instalabilidad del manifest; actualmente no declara iconos.

### P3 — mejora futura

- [ ] Añadir pruebas automatizadas para navegación, analytics, calendario y fechas tras aprobar contratos/datos; hoy no hay suite ni scripts test/lint.
- [ ] Revisar headers CSP y política de seguridad de recursos en Cloudflare.
- [ ] Reconsiderar dependencia/deuda Three.js solo en ciclo posterior; MindAR Three la usa indirectamente.

## Preguntas para Matías antes de enviar

### PREGUNTAS PARA MATÍAS ANTES DE ENVIAR

1. ¿El entregable final es todavía un “Cosquín Rock AR Concept” o debe presentarse como experiencia oficial? ¿“CORSTENO LABS” es branding aprobado para el primer render?
2. ¿La agenda/artistas de 14 y 15 de febrero de 2026 debe seguir identificada como simulación o hay una fuente aprobada para sustituir algún dato? El reloj 14-feb-2026 18:00 se conserva intencionalmente para demo.
3. ¿El link público debe mantener siempre habilitado el reloj simulado para demos de cliente? La decisión de producto actual es conservarlo; cambiarlo requiere una nueva instrucción.
4. ¿Los ocho escenarios y nombres publicados están aprobados? ¿Hay cambios de agenda/escenario que aún no estén incorporados?
5. La navegación actual está confirmada como demostrativa y usa ubicaciones ficticias. ¿El aviso “Ubicaciones simuladas · no corresponden al predio real” es suficiente para el cliente en móvil?
6. ¿Cuál es el target físico definitivo (póster/cartel), quién confirma que corresponde a `cosquin-rock.mind` y qué comportamiento visual exacto debe ocurrir al detectarlo/perderlo?
7. ¿Cuál es el copy final de cámara y de error/permiso denegado, y se debe indicar cómo reactivar permiso en Ajustes?
8. ¿Qué dispositivos/SO mínimos soportan? ¿La prueba manual en un iPhone y un Android cubre el compromiso de release?
9. ¿Analytics debe estar activo al envío? ¿Puede CRM confirmar la key de ingestión frontend, CORS para el dominio canónico, attribution Workspace/User y que `application_type=webar` continúa válido? La app publicada no muestra analytics habilitado.
10. El event map contiene 19 eventos aunque el pedido habla de 20. ¿Hay un evento esperado faltante o el total correcto es 19?
11. ¿Qué CTA externos deben existir (tickets, redes, mapas, WhatsApp)? No encontré esos links en la implementación actual.
12. ¿Se deben ofrecer favoritos, agenda y recordatorios como funciones de producción? Los calendarios actualmente dependen de los datos hardcodeados indicados.
13. ¿Existe una aprobación de privacidad para ID anónimo persistente (localStorage) y para solicitar ubicación/orientación cuando se entra en navegación? La ubicación no se incluye en payloads de analytics visibles.
14. ¿Qué versiones de marca, assets y textos finales deben usarse? El home actual es tipográfico y no carga un logo/foto de producto.

## GO / NO-GO

# COSQUÍN ROCK AR RELEASE

P0: los rótulos de modo demo están implementados y publicados; confirmar aprobación de branding final.

P1: falta probar cámara permitida, target detection/recovery, navegación y lifecycle en teléfonos; analytics sigue apagado en producción; verificar contrato CRM y alcance final de contenido/CTAs.

P2: optimización y validación del offline/manifest/assets.

P3: regresiones automatizadas y hardening CSP.

Preguntas para Matías: las 14 preguntas listadas arriba.

Faltantes: completar pruebas físicas iPhone/Android y verificar analytics/CRM si son parte del alcance; la home pasó los viewports emulados, las etiquetas se sirven en producción y el deploy quedó registrado arriba.

# NO-GO — AR NOT READY

Antes de enviar: (1) confirmar branding/target/contenido; (2) si analytics es requisito, habilitarlo con key de ingestión y observar evento de prueba con CRM, incluyendo `demo_mode`; (3) ejecutar plan físico iPhone/Android y corregir fallos de cámara/tracking/resume; (4) validar legibilidad del aviso de navegación en teléfonos. No eliminar el modo EN VIVO ni la navegación demo. El bundle local usado en el deploy excluye valores de `.env.local`.
