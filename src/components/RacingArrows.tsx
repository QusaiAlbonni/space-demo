type Props = {
  direction?: "left" | "right";
  onClick?: () => void;
};

export default function RacingArrows({
  direction = "right",
  onClick,
}: Props) {
  const symbol = direction === "right" ? "›" : "‹";

  return (
    <div
      onClick={onClick}
      className="
        flex gap-1 text-cyan-400 text-2xl font-bold
        cursor-pointer select-none
        transition-transform duration-200
        hover:scale-125
        active:scale-95
      "
    >
      <span className="animate-[arrowFlow_1.2s_infinite] opacity-40 [animation-delay:0ms]">
        {symbol}
      </span>

      <span className="animate-[arrowFlow_1.2s_infinite] opacity-70 [animation-delay:150ms]">
        {symbol}
      </span>

      <span className="animate-[arrowFlow_1.2s_infinite] opacity-100 [animation-delay:300ms]">
        {symbol}
      </span>
    </div>
  );
}