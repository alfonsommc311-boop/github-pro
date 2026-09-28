"""Servidor HTTP (solo biblioteca estándar) + interfaz web."""
import json
import os
import threading
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from .report import build_report
from .simulation import Simulation

SIMS: dict = {}
STATIC = os.path.join(os.path.dirname(__file__), "static")


class Handler(BaseHTTPRequestHandler):
    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _body(self):
        n = int(self.headers.get("Content-Length", 0))
        return json.loads(self.rfile.read(n) or b"{}")

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            with open(os.path.join(STATIC, "index.html"), "rb") as f:
                data = f.read()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        elif self.path.startswith("/api/sim/"):
            sim = SIMS.get(self.path.split("/")[3])
            if not sim:
                return self._json({"error": "no existe"}, 404)
            res = sim["sim"].result()
            res["status"] = sim["status"]
            if sim["status"] == "done":
                res["report"] = build_report(res)
            self._json(res)
        else:
            self._json({"error": "not found"}, 404)

    def do_POST(self):
        try:
            b = self._body()
            if self.path == "/api/sim":
                sim = Simulation(b["seed"], b["question"], int(b.get("agents", 60)),
                                 int(b.get("rounds", 20)), int(b.get("rng_seed", 42)), b.get("events"))
                sid = uuid.uuid4().hex[:8]
                SIMS[sid] = {"sim": sim, "status": "running"}

                def work():
                    for r in range(1, sim.rounds + 1):
                        sim.step(r)
                    SIMS[sid]["status"] = "done"
                threading.Thread(target=work, daemon=True).start()
                self._json({"id": sid})
            elif self.path.startswith("/api/chat/"):
                sim = SIMS[self.path.split("/")[3]]["sim"]
                self._json({"reply": sim.chat(int(b["agent"]), b["message"])})
            else:
                self._json({"error": "not found"}, 404)
        except (KeyError, ValueError, IndexError) as e:
            self._json({"error": f"solicitud inválida: {e}"}, 400)

    def log_message(self, *a):
        pass


def main():
    port = int(os.environ.get("PORT", 8000))
    print(f"SwarmCast en http://localhost:{port}")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()


if __name__ == "__main__":
    main()
