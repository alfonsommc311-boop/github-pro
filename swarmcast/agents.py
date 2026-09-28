"""Generación de agentes con personalidad, postura inicial y red social."""
import random
from dataclasses import dataclass, field, asdict

ROLES = [
    ("Periodista", 0.8, 0.9, 0.5), ("Analista", 0.6, 0.7, 0.4), ("Ciudadano", 0.4, 0.3, 0.8),
    ("Influencer", 0.9, 0.95, 0.3), ("Experto técnico", 0.5, 0.6, 0.3), ("Activista", 0.7, 0.6, 0.15),
    ("Inversor", 0.5, 0.6, 0.5), ("Estudiante", 0.3, 0.2, 0.9), ("Funcionario", 0.4, 0.5, 0.35),
    ("Escéptico", 0.5, 0.4, 0.2),
]  # (rol, actividad, influencia, apertura)
NAMES = "Ana Luis Marta Pablo Lucía Diego Sofía Jorge Elena Raúl Carla Iván Nora Hugo Irene Sergio Alba Tomás Rosa Óscar".split()
SURN = "García Ruiz Soto Vega Mora Ríos Paz Cruz León Nieto Lara Ortiz Gil Roca Ibáñez".split()


@dataclass
class Agent:
    id: int
    name: str
    role: str
    activity: float
    influence: float
    openness: float
    stance: float          # -1 (en contra) .. +1 (a favor)
    initial_stance: float
    following: list = field(default_factory=list)
    memory: list = field(default_factory=list)
    bio: str = ""

    def public(self):
        d = asdict(self)
        d.pop("memory")
        return d


def generate_agents(n: int, graph: dict, rng: random.Random) -> list:
    ents = [e["name"] for e in graph["entities"]] or ["el tema"]
    base = graph["sentiment"]
    agents = []
    for i in range(n):
        role, act, inf, opn = rng.choice(ROLES)
        jitter = lambda v, s=0.15: min(1.0, max(0.02, v + rng.uniform(-s, s)))
        bias = -0.4 if role in ("Escéptico", "Activista") and rng.random() < 0.6 else 0.0
        stance = max(-1.0, min(1.0, base * 0.5 + bias + rng.gauss(0, 0.5)))
        a = Agent(i, f"{rng.choice(NAMES)} {rng.choice(SURN)}", role, jitter(act), jitter(inf),
                  jitter(opn), stance, stance)
        a.bio = f"{role} interesado en {', '.join(rng.sample(ents, min(2, len(ents))))}."
        agents.append(a)
    # red con enlace preferencial por influencia
    weights = [a.influence ** 2 for a in agents]
    for a in agents:
        k = min(n - 1, rng.randint(3, 8))
        seen = set()
        while len(seen) < k:
            j = rng.choices(range(n), weights)[0]
            if j != a.id:
                seen.add(j)
        a.following = sorted(seen)
    return agents
