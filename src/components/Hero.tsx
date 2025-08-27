import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

const TitleWord = ({ children, delay = 0 }: { children: string; delay?: number }) => (
  <motion.span
    className="inline-block bg-gradient-to-br from-cyan-400 to-fuchsia-400 bg-clip-text text-transparent drop-shadow"
    initial={{ y: 30, opacity: 0, scale: 0.98 }}
    animate={{ y: 0, opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.span>
);

const PillButton = ({ children }: { children: React.ReactNode }) => (
  <motion.button
    whileHover={{ y: -2, boxShadow: "0 0 24px rgba(56,189,248,0.6)" }}
    whileTap={{ scale: 0.98 }}
    className="group inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur-lg"
  >
    {children}
    <FaArrowRight className="transition-transform group-hover:translate-x-1" />
  </motion.button>
);

const Hero = () => {
  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16 md:pt-28">
      <div className="text-center">
        <h1 className="text-[48px] leading-[1.05] font-extrabold tracking-widest md:text-[96px]">
          <TitleWord delay={0.1}>GAME</TitleWord>{" "}
          <TitleWord delay={0.3}>FORGE</TitleWord>
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-3xl text-base text-slate-300 md:text-lg"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Crafting epic gaming experiences with immersive worlds, cinematic visuals, and
          revolutionary technology that push the boundaries of interactive entertainment.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <PillButton>View Our Work</PillButton>
          <PillButton>Our Services</PillButton>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;


