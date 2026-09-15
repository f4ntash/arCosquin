# Cosquín Rock AR — prueba manual en dispositivos

Objetivo: completar en 5–10 minutos por teléfono antes de autorizar el envío. Requiere la URL pública `https://cosquinrock.corsteno.com/`, el póster físico que corresponda al target compilado y conectividad. No aceptar ubicación para probar el flujo AR.

## iPhone — Safari (5–10 min)

1. En Safari, abrir la URL canónica y confirmar que aparece la pantalla inicial, el botón **INICIAR EXPERIENCIA** y ningún error visible. Anotar modelo de iPhone e iOS.
2. Tocar **INICIAR EXPERIENCIA** una vez. En el permiso de cámara, elegir **Permitir**. Confirmar que aparece la cámara en vivo y el mensaje que indica apuntar al cartel. Si Safari no pide permiso, revisar Ajustes → Safari → Cámara y recargar.
3. Apuntar al póster `cosquin-rock.mind` desde unos 30–60 cm, mantenerlo entero y bien iluminado. Confirmar detección, contenido visible y que no queda el estado de búsqueda. Retirar el póster y volver a apuntar: anotar pérdida y readquisición.
4. Rotar vertical → horizontal → vertical. Confirmar cámara, canvas, overlays y botones bien alineados. Mandar Safari a segundo plano unos 10 segundos y volver; anotar si recupera cámara/tracking o hace falta reiniciar.
5. Cerrar AR y volver a iniciarla. Rechazar el permiso o denegarlo desde Ajustes (solo si se puede revertir enseguida) y confirmar un mensaje comprensible y una forma de volver. Rehabilitar permiso después.
6. En la pantalla inicial, recargar y usar Atrás/Adelante. Confirmar que no se queda cámara activa ni aparece una pantalla bloqueada. Guardar captura/notas de cualquier fallo y versión de Safari/iOS.

## Android — Chrome (5–10 min)

1. En Chrome, abrir la URL canónica y confirmar pantalla inicial y botón de inicio. Anotar fabricante/modelo y versión Android/Chrome.
2. Tocar **INICIAR EXPERIENCIA** y permitir cámara. Confirmar video en vivo y ayuda para apuntar. Repetir iniciando dos veces rápidamente: no deben quedar dos cámaras, overlays o loops.
3. Apuntar al mismo póster con iluminación normal; confirmar detección, contenido, pérdida al retirarlo y reacquisición. Repetir con poca luz y más distancia y anotar el límite práctico.
4. Rotar vertical → horizontal → vertical. Enviar Chrome a segundo plano 10 segundos y volver. Confirmar cámara/AR recuperadas o que se ofrece un reinicio claro.
5. Cerrar AR e iniciar de nuevo. Probar denegar cámara desde el prompt o permisos del sitio y verificar recuperación. Volver a habilitarla después.
6. Recargar y probar Atrás. En una segunda visita, activar modo avión antes de abrir: anotar qué ofrece el service worker tras haber cargado una vez online. Restaurar red.

## Registro mínimo de resultado

Para cada teléfono, marcar **Pasa / Falla / No probado**: carga inicial; permiso permitido; permiso denegado; cámara en vivo; target detectado; target perdido/recuperado; orientación; background/resume; doble toque; Atrás/recarga; consola/errores visibles. Guardar modelo, sistema operativo, navegador y pasos exactos para reproducir cada fallo.

No considerar aprobada la compatibilidad iOS/Android hasta ejecutar estos pasos en equipos físicos. No hace falta compartir ubicación ni datos personales.
