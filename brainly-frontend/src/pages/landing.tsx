import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import brainImage from "/brain2.jpg"; // Adjust path if needed
import GalaxyStars from "./GalaxyStars";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
        <GalaxyStars/>
      {/* Glowing Orbit Behind Brain */}
       
      <div className="relative flex  justify-center items-center mb-6">

       
        <div className="absolute w-[300px] h-[300px] rounded-full bg-cyan-400/20 blur-3xl z-0 animate-pulse" />
        
        <motion.img
          src={brainImage}
          alt="Galaxy Brain"
          className="relative rounded-full  w-64 h-64 object-contain z-10 animate-float drop-shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
      </div>

      {/* Title */}
      <motion.h1
        className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-500 to-orange-400 animate-text-glow mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Second Brain
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg md:text-xl text-slate-300 max-w-2xl text-center leading-relaxed mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Your intelligent knowledge management platform. Think of it as your external memory bank — organize and retrieve content using AI embeddings.
      </motion.p>

      {/* Buttons */}
      <motion.div
        className="flex space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <button
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-white font-semibold shadow-lg transition duration-300"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
        <button
          className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold shadow-lg transition duration-300"
          onClick={() => navigate("/signin")}
        >
          Sign In
        </button>
      </motion.div>
    </section>
  );
};

export default Landing;
