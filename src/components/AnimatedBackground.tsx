import { motion } from "framer-motion";
import { useMemo } from "react";

type Dot = { id: number; x: number; y: number; size: number; hue: number; delay: number };

const generateDots = (count: number): Dot[] => {
  const dots: Dot[] = [];
  for (let i = 0; i < count; i += 1) {
    dots.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      hue: Math.floor(180 + Math.random() * 180),
      delay: Math.random() * 6,
    });
  }
  return dots;
};

const AnimatedBackground = () => {
  const dots = useMemo(() => generateDots(80), []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Vignette + gradient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,rgba(80,200,255,0.25),transparent),radial-gradient(800px_400px_at_80%_10%,rgba(180,120,255,0.25),transparent),radial-gradient(1000px_600px_at_10%_20%,rgba(0,220,130,0.2),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6))]" />

      {/* Floating particles */}
      {dots.map((dot) => (
        <motion.span
          key={dot.id}
          className="absolute rounded-full shadow-[0_0_12px_2px_rgba(255,255,255,0.35)]"
          style={{
            top: `${dot.y}%`,
            left: `${dot.x}%`,
            width: dot.size,
            height: dot.size,
            background: `hsl(${dot.hue} 100% 60%)`,
            filter: "blur(0.2px)",
          }}
          initial={{ y: 0, opacity: 0.4 }}
          animate={{ y: [-10, 10, -10], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 8 + dot.size, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
        />
      ))}

      {/* Subtle scanlines */}
      <div className="absolute inset-0 opacity-[0.075] bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_1px,transparent_1px,transparent_3px)]" />
    </div>
  );
};

export default AnimatedBackground;


