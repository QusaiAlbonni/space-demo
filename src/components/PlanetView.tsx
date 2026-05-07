import { type MouseEvent } from "react";
import { type Coordinates } from "../types/coordinates";
import { type Planet } from "../types/planet";
import RacingArrows from "./RacingArrows";

type Props = {
  planet: Planet;
  offset: Coordinates;
  transitionDirection: "next" | "prev";
  onNext: () => void;
  onPrev: () => void;
};

export default function PlanetView({
  planet,
  offset,
  transitionDirection,
  onNext,
  onPrev,
}: Props) {
  const motionClass =
    transitionDirection === "prev" ? "planet-card-prev" : "planet-card-next";

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.currentTarget.style.setProperty("--spot-x", `${x}px`);
    event.currentTarget.style.setProperty("--spot-y", `${y}px`);
    event.currentTarget.style.setProperty("--spot-opacity", "1");
  };

  const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--spot-opacity", "0");
  };

  return (
    <div className="relative min-h-screen flex items-center bg-transparent">
      <div className="flex-1 h-screen bg-transparent">
        <div className="w-full h-full bg-transparent">
        </div>
      </div>

      {/* RIGHT: INFO CARD */}
      <div className={`planet-card-motion ${motionClass} z-10 mr-12`}>
        <div
          className="planet-card-surface w-100 p-8 border border-gray-400/60 transition-transform duration-200 ease-out will-change-transform"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `translate(${offset.x * 10}px, ${offset.y * 10}px)`,
          }}
        >
          <h2 className="text-4xl font-(family-name:--font-heading) tracking-widest">
            {planet.name}
          </h2>

          <p className="text-gray-300 mt-4 font-(family-name:--font-code)">
            {planet.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-cyan-200 font-(family-name:--font-code)">
            <div>Distance: {planet.distance}</div>
            <div>Travel time: {planet.travelTime}</div>
            <div>Day length: {planet.dayLength}</div>
            <div>Gravity: {planet.gravity}</div>
            <div>Moons: {planet.moons}</div>
            <div>Avg temp: {planet.avgTemp}</div>
            <div>Signal delay: {planet.signalDelay}</div>
          </div>

          {/* PRICING */}
          <p className="mt-6 text-xs uppercase tracking-widest text-cyan-300 font-(family-name:--font-code)">
            Plans
          </p>

          <div className="mt-3 grid grid-cols-2 gap-4 font-(family-name:--font-code) ">
            <div className="border border-white/40 p-3 backdrop-blur-sm bg-black/20">
              <div className="flex items-center justify-between text-sm text-cyan-200">
                <span>Basic</span>
                <span>${planet.price.basic.toLocaleString()}</span>
              </div>
              <ul className="mt-2 text-xs text-gray-300 space-y-1">
                <li>3-day training</li>
                <li>Shared cabin</li>
                <li>Rover excursion</li>
                <li>Meal plan</li>
              </ul>
            </div>

            <div className="border border-cyan-500/50 p-3 backdrop-blur-3xl bg-black/20">
              <div className="flex items-center justify-between text-sm text-cyan-200">
                <span>Premium</span>
                <span>${planet.price.premium.toLocaleString()}</span>
              </div>
              <ul className="mt-2 text-xs text-gray-300 space-y-1">
                <li>VIP launch access</li>
                <li>Private suite</li>
                <li>Extended EVA time</li>
                <li>Astro photo pack</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* NAV ARROWS */}
      <div className="absolute left-4">
        <RacingArrows direction="left" onClick={onPrev} />
      </div>

      <div className="absolute right-4">
        <RacingArrows direction="right" onClick={onNext} />
      </div>
    </div>
  );
}
