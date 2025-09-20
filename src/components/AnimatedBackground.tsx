import { motion } from "framer-motion";
import { useMemo, useState, useEffect, useCallback, useRef } from "react";

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

// Balanced particle count for visual impact while maintaining performance
const generateDots = (count: number = 24): Dot[] => {
  const dots: Dot[] = [];
  for (let i = 0; i < count; i += 1) {
    dots.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3.5 + 2, // Slightly larger for visibility
      hue: Math.floor(160 + Math.random() * 200),
      delay: Math.random() * 3, // Reduced delay range
      speed: 0.3 + Math.random() * 1.2, // Slower animations
      amplitude: 12 + Math.random() * 18, // Balanced movement
    });
  }
  return dots;
};

// Optimized connection finding with smart limits
const findConnections = (dots: Dot[], maxDistance: number = 28): Connection[] => {
  const connections: Connection[] = [];
  const maxConnections = 45; // Increased for better visual density
  
  for (let i = 0; i < dots.length && connections.length < maxConnections; i++) {
    for (let j = i + 1; j < dots.length && connections.length < maxConnections; j++) {
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
  const dots = useMemo(() => generateDots(), []);
  const connections = useMemo(() => findConnections(dots), [dots]);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Performance optimizations
  const rafIdRef = useRef<number>(0);
  const lastUpdateRef = useRef(0);
  const UPDATE_INTERVAL = 32; // ~30fps instead of 60fps

  // Intersection Observer for visibility optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.body; // Or specific container
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // Defer mounting with longer delay for better LCP
  useEffect(() => {
    const idle = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: any) => number);
    let id: number | undefined;
    
    if (typeof idle === 'function') {
      id = idle(() => setEnabled(true), { timeout: 500 });
    } else {
      const t = setTimeout(() => setEnabled(true), 400);
      return () => clearTimeout(t);
    }
    return () => { if (id != null) (window as any).cancelIdleCallback?.(id); };
  }, []);

  // Throttled mouse movement handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) return;
    
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
      lastUpdateRef.current = now;
    });
  }, []);

  useEffect(() => {
    if (!isVisible || !enabled) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter, { passive: true } as any);
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true } as any);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      document.removeEventListener('mousemove', handleMouseMove as any);
      document.removeEventListener('mouseenter', handleMouseEnter as any);
      document.removeEventListener('mouseleave', handleMouseLeave as any);
    };
  }, [handleMouseMove, isVisible, enabled]);

  // Slower pulse for better performance
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev + 1) % 80);
    }, 200); // Slower pulse
    return () => clearInterval(interval);
  }, [isVisible]);

  // Early return with minimal static background
  if (!enabled || !isVisible) {
    return (
      <div 
        className="pointer-events-none absolute inset-0 bg-slate-950"
        style={{ willChange: 'auto' }} // Remove will-change when not animating
      />
    );
  }

  return (
    <div 
      className="pointer-events-none absolute inset-0 overflow-hidden bg-slate-950"
      style={{ 
        willChange: 'transform',
        transform: 'translateZ(0)', // Force hardware acceleration
        backfaceVisibility: 'hidden' // Optimize rendering
      }}
    >
      {/* Simplified gradient backdrop */}
      <div 
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          background: `
            radial-gradient(1200px_600px_at_${mousePos.x}%_${mousePos.y - 15}%,rgba(0,255,255,${isHovering ? 0.3 : 0.18}),transparent),
            radial-gradient(800px_400px_at_${75 + mousePos.x * 0.15}%_${15 + mousePos.y * 0.1}%,rgba(255,0,255,${isHovering ? 0.25 : 0.15}),transparent),
            linear-gradient(45deg, rgba(20,20,40,0.7), rgba(5,5,15,0.8))
          `,
          willChange: 'background'
        }}
      />

      {/* Optimized neural network connections */}
      <svg 
        className="absolute inset-0 w-full h-full"
        style={{ 
          shapeRendering: 'optimizeSpeed',
          willChange: 'transform'
        }}
      >
        {connections.slice(0, 35).map((connection) => { // Render more connections for depth
          const opacity = Math.max(0, (25 - connection.distance) / 25) * 0.35;
          const pulse = Math.sin((pulseIntensity + connection.distance) * 0.08) * 0.15 + 0.7;
          
          return (
            <motion.line
              key={connection.id}
              x1={`${connection.x1}%`}
              y1={`${connection.y1}%`}
              x2={`${connection.x2}%`}
              y2={`${connection.y2}%`}
              stroke="url(#connectionGradient)"
              strokeWidth={isHovering ? 0.6 : 0.4}
              opacity={opacity * pulse * (isHovering ? 1.3 : 1)}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, ease: "easeOut" }}
              style={{ vectorEffect: 'non-scaling-stroke' }}
            />
          );
        })}
        
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,255,255,0.5)" />
            <stop offset="50%" stopColor="rgba(255,0,255,0.6)" />
            <stop offset="100%" stopColor="rgba(0,255,100,0.5)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Performance-optimized floating particles */}
      {dots.map((dot) => {
        const distanceToMouse = Math.sqrt(
          Math.pow(dot.x - mousePos.x, 2) + Math.pow(dot.y - mousePos.y, 2)
        );
        const mouseInfluence = Math.max(0, (28 - distanceToMouse) / 28);
        const glowIntensity = 0.35 + mouseInfluence * 0.45;
        
        return (
          <motion.div
            key={dot.id}
            className="absolute rounded-full"
            style={{
              top: `${dot.y}%`,
              left: `${dot.x}%`,
              width: dot.size + mouseInfluence * 2.5,
              height: dot.size + mouseInfluence * 2.5,
              background: `hsl(${dot.hue + mouseInfluence * 40} 90% ${55 + mouseInfluence * 15}%)`,
              boxShadow: `
                0 0 ${6 + glowIntensity * 8}px ${1 + glowIntensity * 3}px hsla(${dot.hue}, 90%, 55%, ${glowIntensity}),
                0 0 ${12 + glowIntensity * 16}px ${3 + glowIntensity * 6}px hsla(${dot.hue}, 90%, 65%, ${glowIntensity * 0.2})
              `,
              willChange: 'transform',
              transform: 'translateZ(0)', // Hardware acceleration
            }}
            initial={{ y: 0, opacity: 0.55, scale: 0.75 }}
            animate={{ 
              y: [
                -dot.amplitude, 
                dot.amplitude * (1 + mouseInfluence * 0.5), 
                -dot.amplitude
              ],
              opacity: [
                0.35 + mouseInfluence * 0.25, 
                0.65 + mouseInfluence * 0.2, 
                0.35 + mouseInfluence * 0.25
              ],
              scale: [
                0.75 + mouseInfluence * 0.35,
                1.1 + mouseInfluence * 0.45,
                0.75 + mouseInfluence * 0.35
              ],
            }}
            transition={{ 
              duration: 8 + dot.speed + mouseInfluence * 1.5, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: dot.delay,
              repeatType: "reverse" // More efficient than full rotation
            }}
          />
        );
      })}

      {/* Simplified mouse cursor effect */}
      {isHovering && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            left: `${mousePos.x}%`,
            top: `${mousePos.y}%`,
            transform: 'translate(-50%, -50%) translateZ(0)',
            background: 'radial-gradient(circle, rgba(0,255,255,0.2) 0%, rgba(255,0,255,0.15) 50%, transparent 100%)',
            filter: 'blur(3px)',
            willChange: 'transform, opacity',
          }}
          animate={{
            width: [40, 60, 40],
            height: [40, 60, 40],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Simplified scanlines */}
      <div 
        className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,255,255,0.015)_0px,rgba(0,255,255,0.015)_1px,transparent_1px,transparent_5px)]"
        style={{
          opacity: isHovering ? 0.1 : 0.05,
          transition: 'opacity 0.4s ease',
          willChange: 'opacity'
        }}
      />

      {/* Enhanced digital rain effect for better ambiance */}
      <div className="absolute inset-0 opacity-4">
        {Array.from({ length: 8 }).map((_, i) => ( // Increased from 6 to 8
          <motion.div
            key={`rain-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
            style={{
              left: `${(i * 8 + Math.random() * 4)}%`,
              height: '80px', // Smaller rain drops
              willChange: 'transform',
            }}
            initial={{ y: '-80px', opacity: 0 }}
            animate={{ 
              y: 'calc(100vh + 80px)', 
              opacity: [0, 0.2, 0.2, 0] 
            }}
            transition={{
              duration: 4 + Math.random() * 3, // Slower
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Simplified vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};

export default AnimatedBackground;