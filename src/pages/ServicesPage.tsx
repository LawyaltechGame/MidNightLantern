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
      className="relative h-full min-h-[400px] rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      {/* Actual content */}
      <div className="flex flex-col h-full">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl flex-shrink-0"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 60%), rgba(2,6,23,0.6)",
              boxShadow: `0 0 24px hsla(${service.hue}, 90%, 60%, 0.25)`,
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <Icon className="text-2xl" style={{ color: `hsl(${service.hue} 90% 65%)` }} />
          </div>
          <h3 
            className="text-xl md:text-2xl font-extrabold tracking-wide leading-tight" 
            style={{ color: `hsl(${service.hue} 90% 70%)` }}
          >
            {service.title}
          </h3>
        </div>

        <p className="text-slate-300 leading-relaxed mb-4 flex-shrink-0">
          {service.description}
        </p>

        <ul className="space-y-2 text-left text-slate-300/90 flex-grow mb-6">
          {service.points.map((point, pointIndex) => (
            <li 
              key={point} 
              className="flex items-start gap-2"
            >
              <span 
                className="text-slate-500 mt-1 flex-shrink-0"
                style={{ color: `hsl(${service.hue} 60% 60%)` }}
              >
                •
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ 
            y: -2,
            scale: 1.02,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-5 py-3 text-sm font-bold text-slate-900 transition-all duration-200 hover:shadow-lg"
          style={{
            boxShadow: `0 4px 20px hsla(${service.hue}, 90%, 60%, 0.3)`
          }}
        >
          LEARN MORE
        </motion.button>
      </div>

      {/* Glow effect with reduced intensity for performance */}
      <div
        className="pointer-events-none absolute -inset-px -z-10 rounded-3xl opacity-60"
        style={{ 
          boxShadow: `0 0 60px 8px hsla(${service.hue},90%,60%,0.15)`,
          filter: 'blur(1px)'
        }}
      />
    </motion.div>
  );
};

const HelpCard = ({ title, text, icon: Icon, hue, index = 0 }: { 
  title: string; 
  text: string; 
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; 
  hue: number;
  index?: number;
}) => {
  return (
    <motion.div
      className="relative h-full min-h-[200px] rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: index * 0.03, duration: 0.4 }}
    >
      {/* Actual content */}
      <div className="flex flex-col h-full text-center">
        <div className="mb-4 grid place-items-center">
          <div
            className="grid h-12 w-12 place-items-center rounded-2xl"
            style={{ 
              border: "1px solid rgba(255,255,255,0.12)", 
              boxShadow: `0 0 22px hsla(${hue},90%,60%,0.25)`,
              background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 60%), rgba(2,6,23,0.4)"
            }}
          >
            <Icon className="text-2xl" style={{ color: `hsl(${hue} 90% 65%)` }} />
          </div>
        </div>

        <h4 
          className="text-lg md:text-xl font-extrabold mb-3 leading-tight" 
          style={{ color: `hsl(${hue} 90% 68%)` }}
        >
          {title}
        </h4>

        <p className="text-slate-300 leading-relaxed text-sm md:text-base flex-grow flex items-center">
          {text}
        </p>
      </div>

      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute -inset-px -z-10 rounded-3xl opacity-40"
        style={{ 
          boxShadow: `0 0 40px 4px hsla(${hue},90%,60%,0.1)`,
        }}
      />
    </motion.div>
  );
};

const ServicesPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Our Services Section */}
      <section className="text-center">
        <motion.h2 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-widest leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            Our Services
          </span>
        </motion.h2>
      </section>

      {/* Services Grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, index) => (
          <ServiceCard key={service.title} service={service} index={index} />
        ))}
      </div>

      {/* Who We Help Section */}
      <section className="mt-16 md:mt-20 text-center">
        <motion.h3 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-widest leading-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent">
            Who We Help
          </span>
        </motion.h3>
      </section>

      {/* Help Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <HelpCard 
          title="Enterprise" 
          text="Large corporations entering gaming or enhancing digital presence." 
          icon={FaBuilding} 
          hue={190} 
          index={0}
        />
        <HelpCard 
          title="Indie Developers" 
          text="Indies needing technical expertise and publishing guidance." 
          icon={FaRocket} 
          hue={280} 
          index={1}
        />
        <HelpCard 
          title="Startups" 
          text="Gaming startups needing full‑stack dev and GTM strategy." 
          icon={FaVrCardboard} 
          hue={150} 
          index={2}
        />
        <HelpCard 
          title="Publishers" 
          text="Publishers seeking reliable dev partners for their portfolio." 
          icon={FaUsers} 
          hue={60} 
          index={3}
        />
      </div>
    </div>
  );
};

// Add keyframes for smooth animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.querySelector('#services-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'services-animations';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default ServicesPage;