# Univia Tech · sitio

Sitio comercial de Univia Tech, publicado con GitHub Pages en https://landing.univiatech.com (copia de prueba, `noindex`).
Los leads del formulario van al CRM de QA (canal `landing-univia`) con `lead.js` de `qa.univiatech.com`.

**Desde 2026-11-16 este repositorio es la fuente principal del sitio.** Antes se copiaba desde artefactos de claude.ai
con `sincronizar_landing.py`. Ese script ya no publica aquí: si los artefactos originales cambian, solo avisa, y
lo que se quiera incorporar se trae a mano en una rama.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html` | Inicio |
| `plataforma/`, `planes/` | Páginas comerciales |
| `politica-de-datos/` | Política de protección de datos |
| `blog/` | Índice del blog y 7 artículos (`blog/<artículo>/`) |
| `assets/css/` | `landing.css` (inicio, plataforma, planes), `blog.css` + `articulo.css` / `blog-indice.css`, `politica.css` |
| `assets/js/` | `agenda.js` (calendario de la demo), `landing.js` (planes, menú, videos, formulario), `articulo.js`, `blog.js` |
| `media/` | Videos, portadas y logo (`logo-mask.png`, usado por todos los CSS) |
| `scripts/verificar_sitio.py` | Revisión antes de publicar (también corre en cada PR) |

Cada página es un `index.html` con su contenido y sus datos estructurados (JSON-LD); estilos y scripts comunes
viven en `assets/`, así que una funcionalidad nueva se programa una sola vez. Las rutas son relativas
(`../assets/...`), por eso el sitio también funciona abierto desde una carpeta local o en otro hosting.

Datos de contacto y planes: al inicio de `assets/js/landing.js` (`CONTACTO`, `PLANES`).
Horarios y feriados de la demo: al inicio de `assets/js/agenda.js` (`HORAS`, `DIAS`, `BLOQUEADOS`).

## Cookies y medición

`seguimiento.js` (raíz, lo cargan las 12 páginas) muestra el aviso de cookies, agrega el enlace "Cookies" al pie y
carga Google Analytics 4, Tag Manager, Pixel de Meta y LinkedIn Insight **solo si la persona acepta**, como dice la
política de datos. Los IDs van al inicio del archivo (`SEGUIMIENTO`); mientras estén vacíos no se carga nada ni
aparece el aviso. Mide el envío del formulario (`generate_lead` / `Lead`) y los clics a WhatsApp (`contact`), sin
datos personales y nunca en modo prueba.

## Probar el formulario

El WhatsApp y el correo del formulario son los reales. Para probar sin escribirles, abre el sitio con
`?prueba=1` (ej. https://landing.univiatech.com/?prueba=1): aparece un aviso rojo, el formulario no abre
WhatsApp ni el correo y el lead llega al CRM con origen `PRUEBA · …` y el mensaje con `[PRUEBA]`.
Dura toda la sesión del navegador; `?prueba=0` lo quita. Los botones sueltos de WhatsApp siguen abriendo el chat real
(no envían nada solos).

## Cómo hacer un cambio

1. Crea una rama desde `main`: `git switch -c mi-cambio`.
2. Prueba en local: `python -m http.server 8000` y abre http://localhost:8000.
3. Revisa: `python scripts/verificar_sitio.py` (debe terminar con `0 errores`).
4. Abre un pull request hacia `main`. GitHub Actions corre el mismo verificador (`.github/workflows/verificar.yml`)
   y marca el PR en rojo si hay errores. Al unirlo, GitHub Pages publica en 1-2 minutos.

## Pendientes conocidos

- `politica-de-datos/`: tiene 2 textos `[Completar: …]` (razón social y RUC, domicilio legal) visibles en la página.
