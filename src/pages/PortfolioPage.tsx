const projects = [
  {
    title: "Project Cubes",
    image: "/public/cubes.png", // TODO: replace with your image path
    description:
      "Cubes is 2d game in which your aim is to  collect points and get a Highscore ,but it's not as simple as it looks, there are some coins which give you points but some ends your game when you collide with them, same is the case  with obstacles, some ends your game while some gives you points. So try to  get a good  Highscore and Enjoy. ",
    downloadUrl: "https://imperfect-wizard.itch.io/cubes", // TODO: replace
  },
  {
    title: "colorbump-clone",
    image: "/public/colorbump.png",
    description:
      "A clone of Color Bump 3D game. Avoid the obstacles of other color and reach the finish line.",
    downloadUrl: "https://imperfect-wizard.itch.io/color-bumpclone",
  },
  {
    title: "Mirror World",
    image: "/public/mirrorworld.png",
    description:
      "Mirror World is Hyper casual game in which you have to control two balls which are in opposite worlds(Mirror images of each other) , try to control them together avoiding the obstacles.",
    downloadUrl: "https://imperfect-wizard.itch.io/mirror-world",
  },
  {
    title: "Pixelate shader",
    image: "/public/pixelateproject.png",
    description:
      "This is a simple 2D shader to convert a 2D image to pixel image and add old cartoon style movement to image",
    downloadUrl: "https://imperfect-wizard.itch.io/2d-pixelate-shader",
  },
  {
    title: "Rider Santa",
    image: "/public/ridersanta.png",
    description:
      "The Santa is in town to deliver presents, make sure he does it on time, you have to drive Santa to the destination before the fuel runs out!!. Use arrow keys right and left to control the vehicle. ",
    downloadUrl: "https://imperfect-wizard.itch.io/rider-santa",
  },
  {
    title: "An Unordinary Place",
    image: "/public/unordinaryproject.png",
    description:
      "An Unordinary Place is a 2D puzzle game designed to demonstrate our expertise in creating engaging and immersive gameplay experiences. The game challenges players to navigate a unique world by solving puzzles and overcoming obstacles, while atmospheric background music enhances player immersion. With a focus on clean visuals, intuitive mechanics, and polished audio integration, this project highlights our ability to deliver complete end-to-end game development solutions.",
    downloadUrl: "https://imperfect-wizard.itch.io/an-unordinary-place",
  },
];

const PortfolioPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-3xl font-bold tracking-wide">Portfolio</h2>
      <p className="mt-2 text-slate-300">
        A selection of games and projects. Click a card to download.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <a
            key={p.title}
            href={p.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur transition 
                       hover:-translate-y-1 hover:border-white/20 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label={`Download ${p.title}`}
            title={`Download ${p.title}`}
          >
            {/* Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
              {/* If you're using Next.js <Image>, swap this <img> out */}
              <img
                src={p.image}
                alt={`${p.title} cover`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
            </div>

            {/* Copy */}
            <div className="p-5">
              <h3 className="text-lg font-semibold tracking-wide">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300 line-clamp-3">
                {p.description}
              </p>

              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                <span className="transition group-hover:underline">
                  Download
                </span>
                <svg
                  className="h-4 w-4 transition group-hover:translate-x-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 3.75a.75.75 0 0 0-1.5 0v7.69L6.53 8.72a.75.75 0 1 0-1.06 1.06l4.25 4.25a.75.75 0 0 0 1.06 0l4.25-4.25a.75.75 0 1 0-1.06-1.06l-2.72 2.72V3.75z" />
                  <path d="M4.5 15.25a.75.75 0 0 0 0 1.5h11a.75.75 0 0 0 0-1.5h-11z" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default PortfolioPage;

