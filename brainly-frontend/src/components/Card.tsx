import { useEffect, useRef } from "react";
import { getEmbedLink } from "../utils/getEmbedLink";
import { ShareIcon } from "../icons/ShareIcon";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { TwitterIcon } from "../icons/TwitterIcon";
import { RedditIcon } from "../icons/RedditIcon";
import { Linkicon } from "../icons/Linkicon";
import { DeleteIcon } from "../icons/DeleteIcon";

// Extend global window types
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
    reddit?: {
      init?: () => void;
    };
  }
}

interface CardProps {
  title: string;
  link: string;
  type: "twitter" | "youtube" | "reddit" | "Link";
  onDelete?: () => void;
  onShare?: () => void;
}

export function Card({ title, link, type, onDelete, onShare }: CardProps) {
  const tweetContainerRef = useRef<HTMLDivElement>(null);
  const redditContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (type === "twitter" && window.twttr && tweetContainerRef.current) {
      window.twttr.widgets.load(tweetContainerRef.current);
    }
  }, [link, type]);

  useEffect(() => {
    if (type === "reddit" && redditContainerRef.current) {
      const container = redditContainerRef.current;
      container.innerHTML = "";

      const blockquote = document.createElement("blockquote");
      blockquote.className = "reddit-card";

      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.textContent = "View Reddit Post";

      blockquote.appendChild(anchor);
      container.appendChild(blockquote);

      if (!document.querySelector('script[src="https://embed.redditmedia.com/widgets/platform.js"]')) {
        const script = document.createElement("script");
        script.src = "https://embed.redditmedia.com/widgets/platform.js";
        script.async = true;
        script.setAttribute("charset", "UTF-8");
        document.body.appendChild(script);
      } else {
        window.reddit?.init?.();
      }
    }
  }, [link, type]);

  const renderIcon = () => {
    const baseStyle = "w-4 h-4 drop-shadow-md";
    switch (type) {
      case "youtube":
        return <YoutubeIcon className={`${baseStyle} text-red-400`} />;
      case "twitter":
        return <TwitterIcon className={`${baseStyle} text-blue-400`} />;
      case "reddit":
        return <RedditIcon className={`${baseStyle} text-orange-400`} />;
      case "Link":
        return <Linkicon className={`${baseStyle} text-cyan-400`} />;
      default:
        return null;
    }
  };

  const embedLink = getEmbedLink({ type, link });

  return (
    <div className="w-96 h-[440px] rounded-xl border border-cyan-500/20 bg-gradient-to-br from-white/5 via-white/10 to-white/5 shadow-[0_0_20px_#0ff2,0_0_40px_#0ff2] transition hover:shadow-[0_0_30px_#0ff5,0_0_60px_#0ff5] overflow-hidden backdrop-blur-xl relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/40 backdrop-blur-md z-10">
        <div className="flex items-center gap-2 truncate max-w-[180px]">
          {renderIcon()}
          <span className="text-sm text-cyan-100 font-medium truncate">{title}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onShare}
            className="text-white/60 hover:text-white transition"
            aria-label="Share"
            title="Share"
          >
            <ShareIcon size="sm" />
          </button>
          <button
            onClick={onDelete}
            className="text-white/40 hover:text-red-500 transition"
            aria-label="Delete"
            title="Delete"
          >
            <DeleteIcon />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="rounded-lg overflow-hidden min-h-full">
          {type === "twitter" ? (
            <div ref={tweetContainerRef}>
              <blockquote className="twitter-tweet">
                <a aria-label="Tweet" href={link.replace("x.com", "twitter.com")} />
              </blockquote>
            </div>
          ) : type === "reddit" ? (
            <div ref={redditContainerRef} className="w-full h-full px-2 pt-2" />
          ) : embedLink ? (
            <iframe
              className="w-full h-[100%] min-h-[380px] rounded-md border border-white/10"
              src={embedLink}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <div className="text-sm text-red-400 p-4">Invalid YouTube link</div>
          )}
        </div>
      </div>
    </div>
  );
}
