interface CardProps {
  link: string;
  type: "twitter" | "youtube" | "reddit" | "Link";
}

export const getEmbedLink = ({ link, type }: CardProps): string => {
  switch (type) {
    case "youtube": {
      // Match regular youtube.com/watch or youtube.com/live links
      const videoIdMatch = link.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([^?&"/]+)/,
      );
      const videoId = videoIdMatch ? videoIdMatch[1] : "";
      if (!videoId) return "";
      return `https://www.youtube.com/embed/${videoId}?autoplay=0&origin=${window.location.origin}`;
    }

    case "reddit":
      return link;

    case "Link":
      return link.startsWith("http") ? link : `https://${link}`;

    default:
      return link;
  }
};
