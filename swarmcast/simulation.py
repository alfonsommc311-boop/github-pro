"""Motor de simulación social: dinámica de opiniones con confianza acotada y repulsión."""
import random
import statistics

from . import agents as agents_mod
from . import graph as graph_mod

POST_FOR = ["Creo que {t} va a salir adelante, los datos lo respaldan.",
            "Buenas noticias sobre {t}: veo señales claras de avance.",
            "Apoyo lo que se está haciendo con {t}."]
POST_AGAINST = ["Tengo serias dudas sobre {t}; los riesgos se subestiman.",
                "{t} me parece un error, no va a funcionar.",
                "Rechazo el rumbo que toma {t}."]
POST_NEUTRAL = ["Aún no tengo claro qué pasará con {t}, hay que esperar más datos.",
                "Sobre {t}: hay argumentos válidos en ambos lados."]


def label(s: float) -> str:
    return "a favor" if s > 0.15 else "en contra" if s < -0.15 else "neutral"


class Simulation:
    def __init__(self, seed_text: str, question: str, n_agents: int = 60, rounds: int = 20,
                 rng_seed: int = 42, events: dict | None = None):
        self.rng = random.Random(rng_seed)
        self.question = question
        self.rounds = rounds
        self.events = {int(k): v for k, v in (events or {}).items()}  # ronda -> {"text", "shift"}
        self.graph = graph_mod.build_graph(seed_text)
        self.agents = agents_mod.generate_agents(n_agents, self.graph, self.rng)
        self.topic = (self.graph["entities"][0]["name"] if self.graph["entities"] else "el tema")
        self.posts, self.metrics = [], []
        self._snapshot(0)

    def _snapshot(self, r):
        s = [a.stance for a in self.agents]
        self.metrics.append({
            "round": r, "mean": round(statistics.fmean(s), 4),
            "polarization": round(statistics.pstdev(s), 4),
            "favor": sum(x > 0.15 for x in s), "against": sum(x < -0.15 for x in s),
            "neutral": sum(-0.15 <= x <= 0.15 for x in s),
        })

    def _text(self, a):
        pool = POST_FOR if a.stance > 0.15 else POST_AGAINST if a.stance < -0.15 else POST_NEUTRAL
        return self.rng.choice(pool).format(t=self.topic)

    def step(self, r):
        ev = self.events.get(r)
        if ev:
            shift = float(ev.get("shift", 0))
            for a in self.agents:
                a.stance = max(-1, min(1, a.stance + shift * a.openness))
            self.posts.append({"round": r, "author": "EVENTO", "role": "sistema",
                               "text": ev.get("text", "Evento externo"), "stance": shift})
        order = self.agents[:]
        self.rng.shuffle(order)
        for a in order:
            if self.rng.random() > a.activity:
                continue
            feed = [self.agents[j] for j in a.following]
            feed.sort(key=lambda o: -o.influence * self.rng.random())
            for other in feed[:2]:
                d = other.stance - a.stance
                w = 0.35 * other.influence * a.openness
                if abs(d) < 0.8 * (0.4 + a.openness):   # confianza acotada: converge
                    a.stance += w * d
                else:                                     # repulsión leve: polariza
                    a.stance -= 0.05 * w * d
                a.stance = max(-1.0, min(1.0, a.stance))
                a.memory.append((r, other.id, round(other.stance, 2)))
            if self.rng.random() < 0.5:
                self.posts.append({"round": r, "author": a.name, "role": a.role, "id": a.id,
                                   "text": self._text(a), "stance": round(a.stance, 3)})
        self._snapshot(r)

    def run(self):
        for r in range(1, self.rounds + 1):
            self.step(r)
        return self.result()

    def result(self):
        top = sorted(self.agents, key=lambda a: -a.influence * (1 + abs(a.stance)))[:5]
        wsum = sum(a.influence for a in self.agents)
        wmean = sum(a.stance * a.influence for a in self.agents) / wsum
        last = self.metrics[-1]
        prob = round(50 + 50 * wmean, 1)
        return {"question": self.question, "topic": self.topic, "graph": self.graph,
                "metrics": self.metrics, "probability_favor": prob,
                "verdict": label(wmean), "agents": [a.public() for a in self.agents],
                "top_influencers": [a.public() for a in top],
                "posts": self.posts[-200:], "final": last}

    def chat(self, agent_id: int, message: str) -> str:
        from . import llm
        a = self.agents[agent_id]
        sys = (f"Eres {a.name}, {a.bio} Tu postura sobre '{self.question}' es {label(a.stance)} "
               f"({a.stance:+.2f}). Responde en primera persona, breve, en español.")
        out = llm.complete(sys, message, 300)
        if out:
            return out
        return f"({a.name}, {a.role}) Estoy {label(a.stance)} respecto a {self.topic}. " \
               f"Mi opinión pasó de {a.initial_stance:+.2f} a {a.stance:+.2f} tras interactuar."
