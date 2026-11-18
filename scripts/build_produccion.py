"""Arma la versión de producción del sitio en `dist/` (WEB-01, Cloudflare Pages).

El repositorio publica dos sitios desde el mismo `main`:
- GitHub Pages sirve el repo tal cual en https://landing.univiatech.com: copia de prueba, leads a QA.
- Cloudflare Pages corre este script y sirve `dist/` en https://univiatech.com y www: leads a producción (erp).
  Mientras no se lance, Cloudflare Access lo protege y solo entran los correos autorizados.

Cambios respecto del repo:
- El ERP de QA pasa a ser el de producción (`lead.js` y `data-erp`, en las 12 páginas).
- El dominio de la copia de prueba (landing.univiatech.com) pasa a https://univiatech.com en canonical, og:url,
  og:image y datos estructurados (#15).
- Solo con la variable de entorno LANZAMIENTO=1 (Cloudflare Pages → Settings → Variables): se quita el `noindex` y se
  generan robots.txt y sitemap.xml. Sin ella el sitio sigue sin indexarse (además de Cloudflare Access).

Cloudflare Pages: comando de build `python3 scripts/build_produccion.py`, carpeta de salida `dist`.
En local: `python scripts/build_produccion.py` y luego `python -m http.server 8000 -d dist`.
"""

import os
import shutil
import sys
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIST = RAIZ / "dist"
ERP_PRUEBA = "https://qa.univiatech.com"
ERP_PRODUCCION = "https://erp.univiatech.com"
SITIO_PRUEBA = "https://landing.univiatech.com"
SITIO = "https://univiatech.com"
NOINDEX = '<meta name="robots" content="noindex,nofollow">'
# Lo que no se publica: herramientas del repo y el dominio de GitHub Pages.
FUERA = {".git", ".github", "scripts", "dist", "README.md", "CNAME", ".nojekyll", ".gitattributes", ".gitignore"}


def main() -> int:
	if DIST.exists():
		shutil.rmtree(DIST)
	DIST.mkdir()
	for item in RAIZ.iterdir():
		if item.name in FUERA:
			continue
		destino = DIST / item.name
		if item.is_dir():
			shutil.copytree(item, destino)
		else:
			shutil.copy2(item, destino)

	lanzamiento = os.environ.get("LANZAMIENTO", "").strip().lower() in ("1", "si", "sí", "true")
	cambiadas, restos, rutas = 0, [], []
	for pagina in sorted(DIST.rglob("*.html")):
		texto = pagina.read_text(encoding="utf-8")
		nuevo = texto.replace(ERP_PRUEBA, ERP_PRODUCCION).replace(SITIO_PRUEBA, SITIO)
		if lanzamiento:
			nuevo = nuevo.replace(NOINDEX, "")
		if ERP_PRUEBA in texto:
			cambiadas += 1
		if nuevo != texto:
			pagina.write_text(nuevo, encoding="utf-8", newline="\n")
		if pagina.name == "index.html":
			ruta = pagina.parent.relative_to(DIST).as_posix()
			rutas.append("/" if ruta == "." else f"/{ruta}/")
	for archivo in DIST.rglob("*"):
		if archivo.is_file() and archivo.suffix in (".html", ".js", ".css", ".json", ".xml", ".txt"):
			contenido = archivo.read_text(encoding="utf-8", errors="ignore")
			if ERP_PRUEBA in contenido or SITIO_PRUEBA in contenido:
				restos.append(str(archivo.relative_to(DIST)))
			if lanzamiento and NOINDEX in contenido:
				restos.append(f"{archivo.relative_to(DIST)} (noindex)")

	if lanzamiento:
		(DIST / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {SITIO}/sitemap.xml\n", encoding="utf-8")
		hoy = date.today().isoformat()
		urls = "".join(f"  <url><loc>{SITIO}{r}</loc><lastmod>{hoy}</lastmod></url>\n" for r in sorted(rutas))
		(DIST / "sitemap.xml").write_text(
			'<?xml version="1.0" encoding="UTF-8"?>\n'
			'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n",
			encoding="utf-8",
		)

	paginas = len(list(DIST.rglob("index.html")))
	print(f"dist/: {paginas} páginas, {cambiadas} apuntan ahora a {ERP_PRODUCCION}; dominio {SITIO}")
	print("LANZAMIENTO: sin noindex, con robots.txt y sitemap.xml" if lanzamiento else "Sin lanzar: noindex en todas")
	if restos:
		print(f"ERROR: quedan referencias de prueba: {', '.join(restos)}")
		return 1
	if cambiadas == 0:
		print("ERROR: ninguna página cargaba lead.js de QA; revisar antes de publicar.")
		return 1
	return 0


if __name__ == "__main__":
	sys.exit(main())
