import { useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import "./App.css";
import { type Coordinates } from "./types/coordinates";
import { planets } from "./data/planet";
import PlanetView from "./components/PlanetView";
import EndScreen from "./components/EndScreen";
import SceneCanvas from "./components/SceneCanvas";

export default function App() {
  const target = useRef<Coordinates>({ x: 0, y: 0 });
  const [offset, setOffset] = useState<Coordinates>({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      target.current.x = -x;
      target.current.y = -y;
    }

    window.addEventListener("mousemove", handleMouseMove);

    let frame: number;

    function animate() {
      setOffset((prev) => ({
        x: prev.x + (target.current.x - prev.x) * 0.5,
        y: prev.y + (target.current.y - prev.y) * 0.5,
      }));

      frame = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  const [screen, setScreen] = useState<"hero" | "planets" | "end">("hero");
  const [index, setIndex] = useState(0);
  const [planetDirection, setPlanetDirection] = useState<"next" | "prev">(
    "next"
  );

  const currentPlanet = planets[index];

  const goNext = () => {
    setPlanetDirection("next");
    if (index < planets.length - 1) setIndex(index + 1);
    else setScreen("end");
  };

  const goPrev = () => {
    setPlanetDirection("prev");
    if (index > 0) setIndex(index - 1);
    else setScreen("hero");
  };

  const goBackToLastPlanet = () => {
    setPlanetDirection("prev");
    setIndex(planets.length - 1);
    setScreen("planets");
  };

  return (
    <div className="app-root min-h-screen bg-black text-white overflow-hidden">
      <SceneCanvas />
      <div className="app-content">
        <Header />
        <div className="min-h-screen text-white overflow-hidden screen-stack">
        <div
          className={`screen-panel panel-hero ${
            screen === "hero" ? "is-active" : ""
          }`}
        >
          <Hero
            onNext={() => {
              setPlanetDirection("next");
              setScreen("planets");
            }}
            offset={offset}
          />
        </div>

        <div
          className={`screen-panel panel-planets ${
            screen === "planets" ? "is-active" : ""
          }`}
        >
          <PlanetView
            key={currentPlanet.id}
            planet={currentPlanet}
            offset={offset}
            transitionDirection={planetDirection}
            onNext={goNext}
            onPrev={goPrev}
          />
        </div>

        <div
          className={`screen-panel panel-end ${
            screen === "end" ? "is-active" : ""
          }`}
        >
          <EndScreen onBack={goBackToLastPlanet} />
        </div>
        </div>
      </div>
    </div>
  );
}
