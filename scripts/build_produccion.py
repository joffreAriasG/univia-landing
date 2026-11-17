"""Arma la versión de producción del sitio en `dist/` (WEB-01, Cloudflare Pages).

El repositorio publica dos sitios desde el mismo `main`:
- GitHub Pages sirve el repo tal cual en https://landing.univiatech.com: copia de prueba, leads a QA.
- Cloudflare Pages corre este script y sirve `dist/` en https://univiatech.com y www: leads a producción (erp).
  Mientras no se lance, Cloudflare Access lo protege y solo entran los correos autorizados.

Único cambio respecto del repo: el ERP de QA pasa a ser el de producción (`lead.js` y `data-erp`, en las 12
páginas). El `noindex` se queda hasta el lanzamiento (issue #15).

Cloudflare Pages: comando de build `python3 scripts/build_produccion.py`, carpeta de salida `dist`.
En local: `python scripts/build_produccion.py` y luego `python -m http.server 8000 -d dist`.
"""

import shutil
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIST = RAIZ / "dist"
ERP_PRUEBA = "https://qa.univiatech.com"
ERP_PRODUCCION = "https://erp.univiatech.com"
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

	cambiadas, restos = 0, []
	for pagina in sorted(DIST.rglob("*.html")):
		texto = pagina.read_text(encoding="utf-8")
		if ERP_PRUEBA in texto:
			pagina.write_text(texto.replace(ERP_PRUEBA, ERP_PRODUCCION), encoding="utf-8", newline="\n")
			cambiadas += 1
	for archivo in DIST.rglob("*"):
		if archivo.is_file() and archivo.suffix in (".html", ".js", ".css", ".json", ".xml", ".txt"):
			if ERP_PRUEBA in archivo.read_text(encoding="utf-8", errors="ignore"):
				restos.append(str(archivo.relative_to(DIST)))

	paginas = len(list(DIST.rglob("index.html")))
	print(f"dist/: {paginas} páginas, {cambiadas} apuntan ahora a {ERP_PRODUCCION}")
	if restos:
		print(f"ERROR: siguen apuntando a {ERP_PRUEBA}: {', '.join(restos)}")
		return 1
	if cambiadas == 0:
		print("ERROR: ninguna página cargaba lead.js de QA; revisar antes de publicar.")
		return 1
	return 0


if __name__ == "__main__":
	sys.exit(main())
