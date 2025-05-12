import { Linkicon } from "../icons/Linkicon";
import { Logo } from "../icons/Logo";
import { RedditIcon } from "../icons/RedditIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SidebarItem } from "./SidebarItem";
import { Glob } from "../icons/glob";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function Sidebar({
  textData,
  setText,
}: {
  textData: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}) {
   const navigate = useNavigate();


  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-screen w-72 fixed left-0 top-0 pl-6 bg-gradient-to-b from-black via-[#0a0a1f] to-black border-r border-cyan-800 shadow-[0_0_20px_#00ffff33] backdrop-blur-xl z-20"
    >
      <div className="flex text-3xl pt-8 items-center text-cyan-300 font-extrabold tracking-wider cursor-pointer drop-shadow-md">
        <div className="pr-2 scale-110">
          <Logo />
        </div>
        Second Brain
      </div>

      <div className="pt-10 pl-2 flex flex-col gap-4 text-cyan-200">
        <SidebarItem
          onClick={() => setText("ALL")}
          text="ALL"
          selector={textData}
          icon={<Glob />}
        />
        <SidebarItem
          onClick={() => setText("twitter")}
          text="Twitter"
          selector={textData}
          icon={
            <TwitterIcon open className="h-7 w-7 text-cyan-300 drop-shadow" />
          }
        />
        <SidebarItem
          onClick={() => setText("youtube")}
          text="Youtube"
          selector={textData}
          icon={
            <YoutubeIcon open className="h-7 w-7 text-red-400 drop-shadow" />
          }
        />
        <SidebarItem
          onClick={() => setText("reddit")}
          text="Reddit"
          selector={textData}
          icon={
            <RedditIcon open className="h-7 w-7 text-orange-400 drop-shadow" />
          }
        />
        <SidebarItem
          onClick={() => setText("link")}
          text="Link"
          selector={textData}
          icon={
            <Linkicon open className="h-7 w-7 text-violet-300 drop-shadow" />
          }
        />
        <SidebarItem
          onClick={() => navigate("/ai-search")}
          text="AI Search"
          selector={textData}
          icon={<span className="text-cyan-400 text-lg font-bold">🤖</span>}
        />
      </div>
    </motion.div>
  );
}
