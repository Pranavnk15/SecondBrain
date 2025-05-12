import { ReactElement } from "react";
import { motion } from "framer-motion";

export function SidebarItem({
  text,
  icon,
  selector,
  onClick,
}: {
  text: string;
  icon: ReactElement;
  selector: string;
  onClick: () => void;
}) {
  const isActive = text.toLowerCase() === selector.toLowerCase();

  return (
    <motion.div
      onClick={onClick}
      initial={false}
      animate={isActive ? { scale: 1.0, opacity: 1 } : { scale: 1, opacity: 0.85 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`
        flex items-center py-3 px-4 cursor-pointer rounded-lg transition-all duration-300
        ${isActive
          ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-[0_0_25px_#38bdf8cc] animate-pulse"
          : "text-cyan-200 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white hover:shadow-[0_0_15px_#e879f9aa]"}
      `}
    >
      <div className="pr-3">{icon}</div>
      <div className="font-semibold text-cyan-100 tracking-wide text-md">{text}</div>
    </motion.div>
  );
}
