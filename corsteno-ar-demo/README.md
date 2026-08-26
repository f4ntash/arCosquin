# Corsteno AR Demo

POC técnico de WebAR para validar cámara, image tracking con MindAR y contenido Three.js anclado a una imagen target.

## Ejecutar

```bash
npm install
npm run dev
```

Abrí la URL local en el navegador. En desarrollo, `localhost` puede usar la cámara sin HTTPS.

## Build

```bash
npm run build
```

## Target

La app intenta cargar:

```text
public/targets/cosquin-rock.mind
```

Si el archivo no existe, la experiencia muestra un mensaje de desarrollo claro en lugar de fallar con una pantalla negra.

Más adelante vamos a crear el póster target y compilar `cosquin-rock.mind` usando el compiler de MindAR Image Tracking.

## HTTPS

Fuera de `localhost`, los navegadores móviles normalmente requieren HTTPS para permitir acceso a cámara. Para probar desde un teléfono vamos a necesitar servir este proyecto con HTTPS o hacer un deploy posterior.

No se configura todavía Cloudflare ni dominio en esta iteración.

## Próximos pasos

1. crear póster target;
2. compilar `cosquin-rock.mind`;
3. probar tracking físico;
4. reemplazar contenido provisional por experiencia Cosquín;
5. deploy HTTPS;
6. conectar posteriormente con `corsteno.com/cosquin-rock-2027-ar`.
