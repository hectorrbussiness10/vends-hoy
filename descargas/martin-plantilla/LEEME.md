# Plantilla de Martin Tattoo

No hay un negocio «Martin Barber» en este proyecto. Esta carpeta es la de **Martin Tattoo** (id `martin-tattoo`), el local editable de referencia. Los originales siguen en su sitio: aquí solo hay copias.

## Qué archivo es la plantilla de la web

`martin-tattoo.ts` es la ficha del negocio: textos, servicios, opiniones, locales, horario, cita, colores y fotos de partida. Es una copia del bloque que está dentro de `config/business.ts`.

`types.ts` es el contrato `BusinessConfig`. Sirve para leer qué campos tiene la ficha. Es una copia de `config/types.ts`.

Editar estos archivos en la carpeta de descarga no cambia la web publicada.

## Cómo se edita la web de verdad

El panel de edición es la ruta `/panel` de esa misma web:

https://martin-tattoo-malaga-six.vercel.app/panel

Ahí se puede cambiar la portada, los servicios, las opiniones, los locales, el horario, la cita, los textos, los colores y las fotos. El botón Guardar escribe en la web.

En el servidor hace falta la variable `PANEL_PASSWORD`. Sin ella, el panel dice que falta la contraseña. El valor no va en esta carpeta.

## Dirección publicada

En las notas del repo (`prospectos/enviados.md`) la web en producción es:

https://martin-tattoo-malaga-six.vercel.app

La ficha también guarda otra dirección en el campo `seo.website`: `https://martin-tattoo-malaga.vercel.app`.
