import { motion } from "framer-motion";
import { useMemo } from "react";

export default function GalaxyStars() {
  const twinklingStars = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: `twinkle-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      opacity: 0.6 + Math.random() * 0.4,
    }));
  }, []);

  const nebulas = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: `nebula-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 160 + Math.random() * 120,
      color: `rgba(${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 120 + 100)}, 255, 0.1)`,
      blur: 60 + Math.random() * 30,
      delay: Math.random() * 2,
    }));
  }, []);

  const planets = useMemo(() => {
    return [
      {
        id: "planet-1",
        top: "20%",
        left: "10%",
        size: 40,
        color: "#8be9fd",
      },
      {
        id: "planet-2",
        top: "70%",
        left: "80%",
        size: 60,
        color: "#bd93f9",
      },
    ];
  }, []);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {/* Twinkling Stars */}
      {twinklingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute bg-white rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            opacity: star.opacity,
            filter: "drop-shadow(0 0 8px white)",
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{
            delay: star.delay,
            duration: star.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Nebula Glow Blobs */}
      {nebulas.map((nebula) => (
        <motion.div
          key={nebula.id}
          className="absolute rounded-full"
          style={{
            width: `${nebula.size}px`,
            height: `${nebula.size}px`,
            top: nebula.top,
            left: nebula.left,
            backgroundColor: nebula.color,
            filter: `blur(${nebula.blur}px)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.14, 0.08],
          }}
          transition={{
            delay: nebula.delay,
            duration: 6,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Animated Planets */}
      {planets.map((planet) => (
        <motion.div
          key={planet.id}
          className="absolute rounded-full"
          style={{
            width: `${planet.size}px`,
            height: `${planet.size}px`,
            backgroundColor: planet.color,
            top: planet.top,
            left: planet.left,
            filter: "drop-shadow(0 0 20px white)",
            opacity: 0.9,
          }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
