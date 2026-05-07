import { type Coordinates } from "../types/coordinates";
import RacingArrows from "./RacingArrows";

export default function Hero({
  offset,
  onNext,
}: {
  offset: Coordinates;
  onNext: () => void;
}) {
  return (
    <>
      <section
        className="relative flex flex-col items-start justify-center min-h-[80vh] px-8 transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `translate(${offset.x * 10}px, ${offset.y * 10}px)`,
        }}
      >
        {/* Small label */}
        <p className="font-(family-name:--font-code) text-cyan-300 text-sm tracking-widest mb-4">
          INTERPLANETARY TRAVEL PLATFORM
        </p>

        {/* Main heading */}
        <h1 className="font-(family-name:--font-heading) text-5xl md:text-7xl tracking-widest font-bold text-white leading-tight">
          EXPLORE THE
          <br />
          SOLAR SYSTEM
        </h1>

        {/* Sub text */}
        <p className="font-(family-name:--font-text) text-gray-300 max-w-md mt-6">
          Book curated space tourism experiences to Mars, Jupiter’s moons, and
          beyond. Built for the next generation of explorers.
        </p>

        {/* CTA buttons */}
        <div className="flex gap-4 mt-8">
          <button className="px-6 py-3 bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/20 transition">
            View Destinations
          </button>

          <button className="px-6 py-3 border border-white/10 text-white hover:border-cyan-400/30 transition">
            Learn More
          </button>
        </div>
      </section>
      <div className="absolute right-10 top-1/2 -translate-y-1/2">
        <RacingArrows onClick={onNext} />
      </div>
    </>
  );
}
