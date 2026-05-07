export default function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-cyan-500/20 shadow-[0_1px_10px_rgba(0,255,255,0.08)] backdrop-blur-sm">
      <h1 className="font-(family-name:--font-heading) text-2xl tracking-widest font-bold text-white text-shadow-[0_0_4px_rgb(0_255_255/0.6)]">
        SPACE TRAVEL
      </h1>

      <nav className="font-(family-name:--font-text) space-x-6">
        <a
          href="#"
          className="hover:text-cyan-300 hover:[text-shadow:0_0_6px_rgba(34,211,238,0.4)] transition"
        >
          Destinations
        </a>
        <a
          href="#"
          className="hover:text-cyan-300 hover:[text-shadow:0_0_6px_rgba(34,211,238,0.4)] transition"
        >
          Pricing
        </a>
        <a
          href="#"
          className="hover:text-cyan-300 hover:[text-shadow:0_0_6px_rgba(34,211,238,0.4)] transition"
        >
          About
        </a>
      </nav>
    </header>
  );
}
