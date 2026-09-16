# FROMAGO Planificador

Planificador compartido para FROMAGO 2026.

## Versión activa

**v10**

- `index.html`: programa oficial y base de la interfaz.
- `secure-v10.js`: experiencia multiusuario, privacidad, Mi plan y administración.
- `sync-config.js`: configuración pública de conexión a Supabase.
- `sw.js`: PWA y control de caché; solo activa v10.
- `manifest.webmanifest` + iconos: instalación PWA.

## Modelo de privacidad

Cada participante solo recibe y modifica su propia selección. El servidor únicamente revela los nombres de otros participantes cuando coinciden en una actividad que el propio usuario ha seleccionado. No se exponen itinerarios completos de terceros.

El propietario dispone de una vista Admin separada para gestionar participantes, altas y enlace compartido. Admin muestra recuentos, no itinerarios individuales.

## Persistencia

Los participantes y selecciones se almacenan en Supabase. Las actualizaciones de interfaz no recrean ni migran esos registros.
