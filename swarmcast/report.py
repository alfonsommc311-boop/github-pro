"""Generación del informe de predicción."""
from . import llm


def build_report(res: dict) -> str:
    m0, m1 = res["metrics"][0], res["metrics"][-1]
    drift = m1["mean"] - m0["mean"]
    lines = [
        f"# Informe de predicción\n\n**Pregunta:** {res['question']}",
        f"**Veredicto:** {res['verdict']} — probabilidad estimada a favor: **{res['probability_favor']}%**",
        f"\n## Evolución\n- Postura media: {m0['mean']:+.2f} → {m1['mean']:+.2f} ({drift:+.2f})",
        f"- Polarización (desv. estándar): {m0['polarization']:.2f} → {m1['polarization']:.2f}",
        f"- Distribución final: {m1['favor']} a favor, {m1['against']} en contra, {m1['neutral']} neutrales",
        "\n## Actores clave",
    ]
    for a in res["top_influencers"]:
        lines.append(f"- {a['name']} ({a['role']}): postura {a['stance']:+.2f}, influencia {a['influence']:.2f}")
    lines.append("\n## Entidades del material semilla")
    for e in res["graph"]["entities"][:8]:
        lines.append(f"- {e['name']} ({e['mentions']} menciones, sentimiento {e['sentiment']:+.2f})")
    text = "\n".join(lines)
    narrative = llm.complete("Eres analista de predicción. Redacta en español una conclusión de 1 párrafo.", text, 400)
    return text + (f"\n\n## Conclusión\n{narrative}" if narrative else "")
