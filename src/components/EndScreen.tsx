import RacingArrows from "./RacingArrows";

type Props = {
  onBack: () => void;
};

export default function EndScreen({ onBack }: Props) {
  return (
    <div className="relative min-h-screen flex items-center justify-center backdrop-blur-2xl bg-black/50">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">More destinations coming soon</h1>
        <p className="text-sm text-cyan-200 font-(family-name:--font-code)">
          Return to the last planet to review details.
        </p>
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <RacingArrows direction="left" onClick={onBack} />
      </div>
    </div>
  );
}
