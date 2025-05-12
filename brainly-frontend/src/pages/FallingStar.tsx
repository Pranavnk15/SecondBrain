import { motion } from "framer-motion";
import { useMemo } from "react";

export default function FallingStars() {
  const fallingStars = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: `falling-${i}`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: 3 + Math.random() * 2,
      delay: Math.random() * 5,
      opacity: 0.4 + Math.random() * 0.4,
    }));
  }, []);

  const twinklingStars = useMemo(() => {
    const colors = ["#00ffff", "#ff00ff", "#ffffff", "#66ccff", "#ff66cc"];
    return Array.from({ length: 50 }).map((_, i) => ({
      id: `twinkle-${i}`,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.4,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Falling Stars */}
      {fallingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size * 5}px`,
            left: star.left,
            top: '-10%',
            opacity: star.opacity,
            filter: "drop-shadow(0 0 6px white)",
          }}
          animate={{ y: "120vh" }}
          transition={{
            delay: star.delay,
            duration: star.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        />
      ))}

      {/* Twinkling Stars */}
      {twinklingStars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            backgroundColor: star.color,
            opacity: star.opacity,
            filter: `drop-shadow(0 0 6px ${star.color})`,
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
    </div>
  );
}
