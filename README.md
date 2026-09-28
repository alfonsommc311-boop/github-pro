# SwarmCast

Motor de predicción por simulación multiagente, inspirado en MiroFish. Sin dependencias (solo Python 3.10+).

**Pipeline:** material semilla → grafo de entidades → agentes con personalidad y red social →
simulación por rondas (confianza acotada + repulsión, eventos inyectables) → informe + chat con agentes.

```bash
python3 -m swarmcast.server      # http://localhost:8000
python3 -m unittest discover -s tests
```

Opcional: exporta `ANTHROPIC_API_KEY` (o `OPENAI_API_KEY`/`OPENAI_BASE_URL`) para que el informe y el chat
con agentes usen un LLM; sin clave funciona con plantillas locales. `SWARMCAST_MODEL` cambia el modelo.

API: `POST /api/sim {seed, question, agents, rounds, events}` · `GET /api/sim/<id>` · `POST /api/chat/<id> {agent, message}`.
