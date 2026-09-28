"""Sirve el curso GitHub Pro en local (solo biblioteca estándar).

    python3 serve.py            # http://localhost:8080
    PORT=3000 python3 serve.py
"""
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DOCS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")


def main():
    port = int(os.environ.get("PORT", 8080))
    handler = partial(SimpleHTTPRequestHandler, directory=DOCS)
    print(f"GitHub Pro en http://localhost:{port}  (Ctrl+C para salir)")
    ThreadingHTTPServer(("0.0.0.0", port), handler).serve_forever()


if __name__ == "__main__":
    main()
