# Cosquín Rock — event map (implementación actual)

Esta tabla refleja únicamente los nombres que llegan a `client.track(...)` desde `src/analytics.ts`. Todos incluyen automáticamente `surface: web`, `experience: cosquin_ar` y `demo_mode: true`. El marcador de demo se envía como propiedad del evento solo cuando el cliente Analytics está configurado.

## Lista completa de Event Names

```text
app_opened
session_started
experience_started
camera_permission_granted
image_target_detected
current_shows_viewed
ar_target_lost
camera_permission_denied
experience_finished
favorite_added
favorite_removed
go_to_show_clicked
offline_mode_used
navigation_started
direction_viewed
navigation_stopped
schedule_viewed
my_schedule_viewed
map_viewed
```

| event | archivo | trigger | properties |
|---|---|---|---|
| `app_opened` | `src/main.ts:1112` | Carga; `trackOnce` | `app_version`, `language` |
| `session_started` | `src/main.ts:1113` | Carga; `trackOnce` | — |
| `experience_started` | `src/main.ts:591` | Click en iniciar experiencia | `experience: ar` |
| `camera_permission_granted` | `src/main.ts:595` | `ARExperience.onReady` | — |
| `image_target_detected` | `src/main.ts:600` | `MindAR.onTargetFound` | `target_id: cosquin-rock` |
| `current_shows_viewed` | `src/main.ts:602` | Primera detección del target | — |
| `ar_target_lost` | `src/main.ts:611` | `MindAR.onTargetLost` | — |
| `camera_permission_denied` | `src/main.ts:622` | `ARExperience.onError` si el mensaje refiere a permiso/cámara | — |
| `experience_finished` | `src/main.ts:691` | Click en cerrar AR | `experience: ar` |
| `favorite_added` / `favorite_removed` | `src/main.ts:383` | Toggle de favorito | `artist_name`, `stage` |
| `go_to_show_clicked` | `src/main.ts:489` | Solicitud de navegación a show | `artist_name`, `stage` |
| `offline_mode_used` | `src/main.ts:538` | Primera notificación offline en producción | — |
| `navigation_started` | `src/main.ts:636` | Inicio de navegación | `artist_name`, `stage` si hay show |
| `direction_viewed` | `src/main.ts:640` | Primera dirección del ciclo | — |
| `navigation_stopped` | `src/main.ts:665` | Salida de navegación, si inició | — |
| `schedule_viewed` | `src/main.ts:821` | Apertura de agenda | — |
| `my_schedule_viewed` | `src/main.ts:822` | Apertura de favoritos / Mi Grilla | — |
| `map_viewed` | `src/main.ts:823` | Apertura del mapa | — |

## Inconsistencias

- No se encontraron typos o variantes de `image_target_detected`.
- Existen realmente los pares `camera_permission_granted` / `camera_permission_denied` y `favorite_added` / `favorite_removed`.
- No existen variantes conceptuales adicionales como `add_favorite`, `show_favorited` o `favorites_viewed`.
- Recordatorios, Google Calendar, calendario del dispositivo, cambios de día/escenario y acciones internas del mapa no envían eventos Analytics.

## Eventos potenciales no instrumentados

Los flujos de recordatorios/calendario y sus controles existen en la app, pero no tienen eventos Corsteno. No se agregan en esta auditoría.
