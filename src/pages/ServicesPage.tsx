import { motion } from "framer-motion";
import { FaGamepad, FaPalette, FaVrCardboard, FaBuilding, FaRocket, FaUsers } from "react-icons/fa";

type Service = {
  title: string;
  description: string;
  points: string[];
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  hue: number;
};

const SERVICES: Service[] = [
  {
    title: "Game Development",
    description:
      "Full‑cycle development from concept to launch. We craft engaging gameplay across all platforms and genres.",
    points: ["Mobile & PC Games", "Console Development", "Cross‑Platform Solutions", "Game Design & Prototyping"],
    icon: FaGamepad,
    hue: 190,
  },
  {
    title: "Art & Animation",
    description:
      "Stunning visual art and smooth animations that bring your worlds to life with professional quality.",
    points: ["2D/3D Art Creation", "Character Design", "Environment Art", "Animation & VFX"],
    icon: FaPalette,
    hue: 280,
  },
  {
    title: "VR/AR Development",
    description:
      "Cutting‑edge virtual and augmented reality experiences that push the boundaries of immersion.",
    points: ["VR Game Development", "AR Applications", "Mixed Reality", "Hardware Integration"],
    icon: FaVrCardboard,
    hue: 150,
  },
];

const ServiceCard = ({ service, index }: { service: Service; index: number }) => {
  const Icon = service.icon;
  return (
    <motion.div
      className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div
          className="grid h-12 w-12 place-items-center rounded-2xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 60%), rgba(2,6,23,0.6)",
            boxShadow: `0 0 24px hsla(${service.hue}, 90%, 60%, 0.25)`,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <Icon className="text-2xl" style={{ color: `hsl(${service.hue} 90% 65%)` }} />
        </div>
        <h3 className="text-2xl font-extrabold tracking-wide" style={{ color: `hsl(${service.hue} 90% 70%)` }}>
          {service.title}
        </h3>
      </div>
      <p className="text-slate-300">{service.description}</p>
      <ul className="mt-4 space-y-2 text-left text-slate-300/90">
        {service.points.map((p) => (
          <li key={p} className="before:mr-2 before:content-['•'] before:text-slate-500">{p}</li>
        ))}
      </ul>
      <motion.button
        whileHover={{ y: -2 }}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-2 text-sm font-bold text-slate-900"
      >
        LEARN MORE
      </motion.button>

      {/* glow */}
      <div
        className="pointer-events-none absolute -inset-px -z-10 rounded-3xl"
        style={{ boxShadow: `0 0 80px 10px hsla(${service.hue},90%,60%,0.18)` }}
      />
    </motion.div>
  );
};

const HelpCard = ({ title, text, icon: Icon, hue }: { title: string; text: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; hue: number }) => (
  <motion.div
    className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 backdrop-blur-xl"
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.5 }}
  >
    <div className="mb-4 grid place-items-center">
      <div
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={{ border: "1px solid rgba(255,255,255,0.12)", boxShadow: `0 0 22px hsla(${hue},90%,60%,0.25)` }}
      >
        <Icon className="text-2xl" style={{ color: `hsl(${hue} 90% 65%)` }} />
      </div>
    </div>
    <h4 className="text-center text-xl font-extrabold" style={{ color: `hsl(${hue} 90% 68%)` }}>
      {title}
    </h4>
    <p className="mt-2 text-center text-slate-300">{text}</p>
  </motion.div>
);

const ServicesPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Our Services */}
      <div className="text-center">
        <h2 className="text-[40px] font-extrabold tracking-widest md:text-[56px]">
          <span className="bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Our Services</span>
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s, i) => (
          <ServiceCard key={s.title} service={s} index={i} />
        ))}
      </div>

      {/* Who We Help */}
      <div className="mt-16 text-center">
        <h3 className="text-[36px] font-extrabold tracking-widest md:text-[48px]">
          <span className="bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">Who We Help</span>
        </h3>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <HelpCard title="Enterprise" text="Large corporations entering gaming or enhancing digital presence." icon={FaBuilding} hue={190} />
        <HelpCard title="Indie Developers" text="Indies needing technical expertise and publishing guidance." icon={FaRocket} hue={280} />
        <HelpCard title="Startups" text="Gaming startups needing full‑stack dev and GTM strategy." icon={FaVrCardboard} hue={150} />
        <HelpCard title="Publishers" text="Publishers seeking reliable dev partners for their portfolio." icon={FaUsers} hue={60} />
      </div>
    </div>
  );
};

export default ServicesPage;


