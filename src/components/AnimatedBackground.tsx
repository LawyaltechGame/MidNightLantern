import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";

type Dot = { 
  id: number; 
  x: number; 
  y: number; 
  size: number; 
  hue: number; 
  delay: number;
  speed: number;
  amplitude: number;
};

type Connection = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  distance: number;
};

const generateDots = (count: number): Dot[] => {
  const dots: Dot[] = [];
  for (let i = 0; i < count; i += 1) {
    dots.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      hue: Math.floor(160 + Math.random() * 200), // Gaming colors: cyan to magenta
      delay: Math.random() * 4,
      speed: 0.5 + Math.random() * 2,
      amplitude: 15 + Math.random() * 25,
    });
  }
  return dots;
};

const findConnections = (dots: Dot[], maxDistance: number = 32): Connection[] => {
  const connections: Connection[] = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < maxDistance) {
        connections.push({
          id: `${i}-${j}`,
          x1: dots[i].x,
          y1: dots[i].y,
          x2: dots[j].x,
          y2: dots[j].y,
          distance,
        });
      }
    }
  }
  return connections;
};

const AnimatedBackground = () => {
  const dots = useMemo(() => generateDots(35), []);
  const connections = useMemo(() => findConnections(dots), [dots]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-950">
      {/* Dynamic gradient backdrop with gaming colors */}
      <div 
        className="absolute inset-0 transition-all duration-300"
        style={{
          background: `
            radial-gradient(1400px_700px_at_${mousePos.x}%_${mousePos.y - 20}%,rgba(0,255,255,${isHovering ? 0.4 : 0.25}),transparent),
            radial-gradient(1000px_500px_at_${80 + mousePos.x * 0.2}%_${10 + mousePos.y * 0.1}%,rgba(255,0,255,${isHovering ? 0.35 : 0.2}),transparent),
            radial-gradient(1200px_600px_at_${10 + mousePos.x * 0.1}%_${30 + mousePos.y * 0.15}%,rgba(0,255,100,${isHovering ? 0.3 : 0.15}),transparent),
            linear-gradient(45deg, rgba(20,20,40,0.8), rgba(5,5,15,0.9))
          `
        }}
      />

      {/* Neural network connections */}
      <svg className="absolute inset-0 w-full h-full">
        {connections.map((connection) => {
          const opacity = Math.max(0, (25 - connection.distance) / 25) * 0.4;
          const pulse = Math.sin((pulseIntensity + connection.distance) * 0.1) * 0.2 + 0.8;
          
          return (
            <motion.line
              key={connection.id}
              x1={`${connection.x1}%`}
              y1={`${connection.y1}%`}
              x2={`${connection.x2}%`}
              y2={`${connection.y2}%`}
              stroke="url(#connectionGradient)"
              strokeWidth={isHovering ? 0.8 : 0.5}
              opacity={opacity * pulse * (isHovering ? 1.5 : 1)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          );
        })}
        
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,255,255,0.6)" />
            <stop offset="50%" stopColor="rgba(255,0,255,0.8)" />
            <stop offset="100%" stopColor="rgba(0,255,100,0.6)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Enhanced floating particles */}
      {dots.map((dot) => {
        const distanceToMouse = Math.sqrt(
          Math.pow(dot.x - mousePos.x, 2) + Math.pow(dot.y - mousePos.y, 2)
        );
        const mouseInfluence = Math.max(0, (30 - distanceToMouse) / 30);
        const glowIntensity = 0.4 + mouseInfluence * 0.6;
        
        return (
          <motion.div
            key={dot.id}
            className="absolute rounded-full"
            style={{
              top: `${dot.y}%`,
              left: `${dot.x}%`,
              width: dot.size + mouseInfluence * 3,
              height: dot.size + mouseInfluence * 3,
              background: `hsl(${dot.hue + mouseInfluence * 60} 100% ${60 + mouseInfluence * 20}%)`,
              boxShadow: `
                0 0 ${8 + glowIntensity * 12}px ${2 + glowIntensity * 4}px hsla(${dot.hue}, 100%, 60%, ${glowIntensity}),
                0 0 ${16 + glowIntensity * 24}px ${4 + glowIntensity * 8}px hsla(${dot.hue}, 100%, 70%, ${glowIntensity * 0.3})
              `,
              filter: `blur(${0.5 - mouseInfluence * 0.3}px) brightness(${1 + mouseInfluence * 0.5})`,
            }}
            initial={{ y: 0, opacity: 0.6, scale: 0.8 }}
            animate={{ 
              y: [
                -dot.amplitude, 
                dot.amplitude * (1 + mouseInfluence), 
                -dot.amplitude
              ],
              opacity: [
                0.4 + mouseInfluence * 0.3, 
                0.8 + mouseInfluence * 0.2, 
                0.4 + mouseInfluence * 0.3
              ],
              scale: [
                0.8 + mouseInfluence * 0.4,
                1.2 + mouseInfluence * 0.6,
                0.8 + mouseInfluence * 0.4
              ],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 6 + dot.speed + mouseInfluence * 2, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: dot.delay 
            }}
          />
        );
      })}

      {/* Mouse cursor glow effect */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          left: `${mousePos.x}%`,
          top: `${mousePos.y}%`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(255,0,255,0.2) 50%, transparent 100%)',
          filter: 'blur(4px)',
        }}
        animate={{
          width: isHovering ? [60, 80, 60] : [0, 0, 0],
          height: isHovering ? [60, 80, 60] : [0, 0, 0],
          opacity: isHovering ? [0.2, 0.4, 0.2] : [0, 0, 0],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Enhanced scanlines with gaming effect */}
      <div 
        className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.02)_0px,rgba(0,255,255,0.02)_1px,transparent_1px,transparent_4px)]"
        style={{
          opacity: isHovering ? 0.15 : 0.08,
          transition: 'opacity 0.3s ease'
        }}
      />

      {/* Matrix-like digital rain effect */}
      <div className="absolute inset-0 opacity-5">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
            style={{
              left: `${(i * 5 + Math.random() * 3)}%`,
              height: '100px',
            }}
            initial={{ y: '-100px', opacity: 0 }}
            animate={{ 
              y: 'calc(100vh + 100px)', 
              opacity: [0, 0.3, 0.3, 0] 
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
    </div>
  );
};

export default AnimatedBackground;