import unittest
from swarmcast.simulation import Simulation
from swarmcast.graph import build_graph
from swarmcast.report import build_report

SEED = "El Gobierno anunció una reforma. Los Sindicatos expresaron rechazo y protesta. Analistas ven oportunidad de crecimiento."


class T(unittest.TestCase):
    def test_graph(self):
        g = build_graph(SEED)
        self.assertTrue(any(e["name"] == "Sindicatos" for e in g["entities"]))

    def test_deterministic_and_bounded(self):
        a = Simulation(SEED, "q", 30, 10, 1).run()
        b = Simulation(SEED, "q", 30, 10, 1).run()
        self.assertEqual(a["metrics"], b["metrics"])
        self.assertTrue(all(-1 <= x["stance"] <= 1 for x in a["agents"]))
        self.assertEqual(len(a["metrics"]), 11)

    def test_event_shifts_opinion(self):
        base = Simulation(SEED, "q", 40, 10, 3).run()["metrics"][-1]["mean"]
        ev = Simulation(SEED, "q", 40, 10, 3, {5: {"shift": -0.8, "text": "x"}}).run()["metrics"][-1]["mean"]
        self.assertLess(ev, base)

    def test_report_and_chat(self):
        s = Simulation(SEED, "¿Apoyo?", 20, 5, 2)
        self.assertIn("Informe", build_report(s.run()))
        self.assertIn("opinión", s.chat(0, "hola"))


if __name__ == "__main__":
    unittest.main()
