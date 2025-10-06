const clients = [
  {
    title: "Pokémon",
    img: "https://assets-prd.ignimgs.com/2024/02/02/all-pokemon-games-switch-1706832348539.png?width=1280&format=jpg&auto=webp&quality=80",
    width: 1200,
    height: 675,
    alt: "Pokémon showcase",
    blurb: "High-fidelity gameplay systems and polished UI/UX across multiple SKUs, delivered to exacting brand standards.",
  },
  {
    title: "Temple Run 2",
    img: "https://imangistudios.com/wp-content/uploads/2022/01/thumb-video-tr2.webp",
    width: 1200,
    height: 675,
    alt: "Temple Run 2 showcase",
    blurb: "Performance-focused content updates and live-ops tooling enabling fast iteration at global scale.",
  }
];

const ClientWorkPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-3xl font-bold tracking-wide">Client Work</h2>
      <p className="mt-2 text-slate-300">A selection of shipped titles and collaborations.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {clients.map((c) => (
          <div key={c.title} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
            <div className="relative aspect-[17/8] w-full overflow-hidden bg-slate-800">
              <img
                src={c.img}
                alt={c.alt}
                width={c.width}
                height={c.height}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 640px) 50vw, 100vw"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-wide">{c.title}</h3>
                <span className="text-xs text-slate-400">Showcase</span>
              </div>
              {c.blurb && (
                <p className="mt-2 text-sm text-slate-300/90 leading-relaxed line-clamp-2">{c.blurb}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientWorkPage;


