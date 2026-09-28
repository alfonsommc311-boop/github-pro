"""Extracción de entidades y grafo de conocimiento a partir del material semilla."""
import re
from collections import Counter

STOP = {"El", "La", "Los", "Las", "Un", "Una", "Y", "En", "De", "Del", "Que", "Se", "Por", "Con",
        "Para", "Es", "Al", "Lo", "The", "A", "An", "And", "In", "Of", "To", "It", "This", "That",
        "Pero", "Sin", "Sobre", "Como", "Su", "Sus", "Este", "Esta", "Ese", "Esa", "Si", "No"}
ENT = re.compile(r"\b[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+(?:de\s+|del\s+)?[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)*")

POS = set("apoyo apoya apoyar éxito exitoso crece crecimiento mejora mejor beneficio positivo gana ganar "
          "aprueba aprobado acuerdo confianza avance oportunidad estable success growth improve gain "
          "support approve agreement trust benefit positive win".split())
NEG = set("rechazo rechaza rechazar crisis caída cae pérdida negativo fracaso riesgo conflicto protesta "
          "amenaza escándalo baja peor problema colapso falla fail loss risk conflict protest threat "
          "scandal decline worse problem collapse reject".split())


def sentiment(text: str) -> float:
    words = re.findall(r"\w+", text.lower())
    p = sum(w in POS for w in words)
    n = sum(w in NEG for w in words)
    return 0.0 if p + n == 0 else (p - n) / (p + n)


def build_graph(seed: str, max_entities: int = 12) -> dict:
    counts = Counter()
    for m in ENT.findall(seed):
        words = m.split()
        while words and words[0] in STOP:
            words.pop(0)
        m = " ".join(words)
        if m in STOP or len(m) < 3:
            continue
        counts[m] += 1
    entities = [e for e, _ in counts.most_common(max_entities)]
    sentences = [s for s in re.split(r"(?<=[.!?])\s+|\n+", seed) if s.strip()]
    edges = Counter()
    for s in sentences:
        present = [e for e in entities if e in s]
        for i, a in enumerate(present):
            for b in present[i + 1:]:
                edges[tuple(sorted((a, b)))] += 1
    return {
        "entities": [{"name": e, "mentions": counts[e],
                      "sentiment": round(sentiment(" ".join(s for s in sentences if e in s)), 2)}
                     for e in entities],
        "edges": [{"a": a, "b": b, "weight": w} for (a, b), w in edges.most_common()],
        "sentiment": round(sentiment(seed), 2),
    }
