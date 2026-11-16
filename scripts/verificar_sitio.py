# Revisa el sitio antes de publicar: enlaces internos, archivos que faltan y restos del origen en claude.ai.
# Uso (desde la raíz del repo): python scripts/verificar_sitio.py
# Sale con código 1 si encuentra errores. Los avisos no detienen la publicación.
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit, unquote

RAIZ = Path(__file__).resolve().parent.parent
OPCIONALES = {"seguimiento.js"}  # del sitio original; si falta, la página funciona igual
EXTERNOS = ("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "#")
REF = re.compile(r'(?:href|src|poster)="([^"]+)"|url\(["\']?([^"\')]+)["\']?\)')
PROPIO = re.compile(r'https://(?:landing\.)?univiatech\.com/([^"\'\s<>?#]*)')  # URLs absolutas del propio sitio
CANONICAL = re.compile(r'<link rel="canonical" href="https://[^/"]+/([^"]*)"')

errores, avisos = [], []


def destino(base: Path, ref: str) -> Path:
    ruta = unquote(urlsplit(ref).path)
    p = (RAIZ / ruta.lstrip("/")) if ruta.startswith("/") else (base.parent / ruta)
    return p / "index.html" if ref.endswith("/") or p.is_dir() else p


def revisar(archivo: Path):
    texto = re.sub(r"<!--.*?-->", "", archivo.read_text(encoding="utf-8"), flags=re.S)  # sin comentarios
    rel = archivo.relative_to(RAIZ)
    if "claude.ai/artifact/" in texto:
        errores.append(f"{rel}: todavía enlaza artefactos de claude.ai")
    for m in REF.finditer(texto):
        ref = m.group(1) or m.group(2)
        if not ref or ref.startswith(EXTERNOS) or "{" in ref:
            continue
        p = destino(archivo, ref)
        if not p.exists():
            (avisos if p.name in OPCIONALES else errores).append(f"{rel}: no existe {ref}")
    if archivo.suffix == ".html" and 'id="lead"' in texto and "lead.js" not in texto:
        errores.append(f"{rel}: tiene formulario pero no carga lead.js (los leads no llegan al CRM)")
    if archivo.name == "index.html":
        ruta = archivo.parent.relative_to(RAIZ).as_posix()
        ruta = "" if ruta == "." else ruta + "/"
        can = CANONICAL.search(texto)
        if can and can.group(1) != ruta:
            errores.append(f"{rel}: canonical apunta a /{can.group(1)} y la página es /{ruta}")
        for u in sorted(set(PROPIO.findall(texto))):
            p = RAIZ / unquote(u)
            if not (p.is_file() or (p / "index.html").is_file()):
                avisos.append(f"{rel}: URL absoluta a una ruta que no existe en el sitio: /{u}")
    if "[Completar" in texto:
        avisos.append(f"{rel}: tiene textos por completar ({texto.count('[Completar')})")


for f in sorted(RAIZ.glob("**/index.html")) + sorted(RAIZ.glob("assets/**/*.css")):
    if ".git" not in f.parts:
        revisar(f)

for a in sorted(set(avisos)):
    print("AVISO ", a)
for e in sorted(set(errores)):
    print("ERROR ", e)
print(f"{len(set(errores))} errores, {len(set(avisos))} avisos")
sys.exit(1 if errores else 0)
