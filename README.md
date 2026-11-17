# Univia Tech · sitio

Sitio comercial de Univia Tech, publicado con GitHub Pages en https://landing.univiatech.com (copia de prueba, `noindex`).
Los leads del formulario van al CRM de QA (canal `landing-univia`) con `lead.js` de `qa.univiatech.com`.

**Desde 2026-11-16 este repositorio es la fuente principal del sitio.** Antes se copiaba desde artefactos de claude.ai
con `sincronizar_landing.py`. Ese script ya no publica aquí: si los artefactos originales cambian, solo avisa, y
lo que se quiera incorporar se trae a mano en una rama.

## Repositorio público

Este repositorio es **público** (decisión 2026-11-16): GitHub Pages lo publica gratis y su contenido es el mismo
sitio que cualquiera ve en el navegador. Por eso aquí **no va**:

- credenciales, tokens, llaves ni archivos `.env`;
- lógica de negocio, integraciones o datos de clientes (eso vive en `app_univia_plataforma` y el ERP);
- leads, exportaciones del CRM ni documentos internos.

Los IDs de analítica (`seguimiento.js`) y la URL del ERP (`data-erp`) sí pueden estar: son públicos por naturaleza.
Para commits, usa el correo noreply de GitHub en vez del personal.

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

El formulario tiene dos botones: **Enviar por WhatsApp** (abre el chat con el mensaje listo y además manda el lead
al CRM) y **Solo enviar solicitud** (CTO-03: solo al CRM; espera su respuesta y confirma, o si el CRM no responde en
12 s ofrece WhatsApp o copiar el mensaje). El correo de contacto sigue en la tarjeta de contacto.

El WhatsApp del formulario es el real. Para probar sin escribirle, abre el sitio con
`?prueba=1` (ej. https://landing.univiatech.com/?prueba=1): aparece un aviso rojo, el formulario no abre
WhatsApp y el lead llega al CRM con origen `PRUEBA · …` y el mensaje con `[PRUEBA]`.
Dura toda la sesión del navegador; `?prueba=0` lo quita. Los botones sueltos de WhatsApp siguen abriendo el chat real
(no envían nada solos).

## Calendario de la demo

`assets/js/agenda.js` pide los horarios libres al ERP del canal (citas de ERPNext en QA: horarios, agentes,
feriados y lo ya reservado). Al enviar, el horario queda reservado como cita del lead; si se ocupó justo antes, el lead
se guarda igual sin reserva y el visitante lo ve. Si el ERP no responde en 3,5 s, el calendario usa los horarios y
feriados fijos de `agenda.js` (solo preferencia, como antes). En modo prueba la reserva es real: borrarla en QA.

`lead.js` se sirve con caché de un año: cuando cambie en la plataforma, subir la versión `?v=` en las 12 páginas.

## Cómo hacer un cambio

1. Crea una rama desde `main`: `git switch -c mi-cambio`.
2. Prueba en local: `python -m http.server 8000` y abre http://localhost:8000.
3. Revisa: `python scripts/verificar_sitio.py` (debe terminar con `0 errores`).
4. Abre un pull request hacia `main`. GitHub Actions corre el mismo verificador (`.github/workflows/verificar.yml`)
   y marca el PR en rojo si hay errores. Al unirlo, GitHub Pages publica en 1-2 minutos.

## Pendientes conocidos

- `politica-de-datos/`: tiene 2 textos `[Completar: …]` (razón social y RUC, domicilio legal) visibles en la página.
