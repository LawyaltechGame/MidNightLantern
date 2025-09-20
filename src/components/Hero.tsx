import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

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
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
        >
          <img
            src="/Logo For GameForge.jpeg"
            alt="Midnight Lantern logo"
            width={800}
            height={250}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="w-[520px] md:w-[800px] h-[110px] md:h-[250px]   max-w-full object-contain drop-shadow-[0_0_18px_rgba(56,189,248,0.45)]"
          />
        </motion.div>

        <motion.p
          className="mx-auto mt-6 max-w-3xl text-base text-slate-300 md:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Crafting epic gaming experiences with immersive worlds, cinematic visuals, and
          revolutionary technology that push the boundaries of interactive entertainment.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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


