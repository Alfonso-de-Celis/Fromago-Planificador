# FROMAGO Planificador

Planificador compartido para FROMAGO 2026.

## Versión activa

**v11**

- `index.html`: programa oficial y base de la interfaz.
- `secure-v11.js`: experiencia multiusuario privada, dos niveles de interés, Mi plan, modo Durante FROMAGO, offline, Realtime y administración.
- `secure-v10.js`: puente mínimo para que terminales antiguos salten a v11.
- `sync-config.js`: configuración pública de conexión a Supabase.
- `sw.js`: PWA, caché offline y actualización sin recargas forzadas.
- `manifest.webmanifest` + iconos: instalación PWA.

## Modelo de privacidad

Cada participante solo recibe y modifica su propia selección. El servidor únicamente revela los nombres de otros participantes cuando coinciden en una actividad que el propio usuario ha seleccionado. No se exponen itinerarios completos de terceros.

El propietario dispone de una vista Admin separada para gestionar participantes, altas, enlace compartido y una llave de recuperación. Admin muestra recuentos, no itinerarios individuales.

## Preferencias

- `♥ Quiero ir`: compromiso principal; participa en avisos de solape y desplazamiento.
- `☆ Me interesa`: alternativa; aparece en Mi plan pero no genera falsos conflictos con el plan principal.

Las selecciones existentes anteriores a v11 se conservan como `♥ Quiero ir`.

## Offline y sincronización

El programa y el último estado conocido de Mi plan quedan disponibles sin conexión. Los cambios realizados offline se guardan en el terminal y se sincronizan al recuperar red. La actualización entre participantes usa eventos Realtime y ya no realiza polling periódico.

## Persistencia

Los participantes y preferencias se almacenan en Supabase. Las actualizaciones de interfaz no recrean los registros existentes.
