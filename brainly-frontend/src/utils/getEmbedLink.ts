interface CardProps {
  link: string;
  type: "twitter" | "youtube" | "reddit" | "Link";
}

export const getEmbedLink = ({ link, type }: CardProps): string => {
  switch (type) {
    case "youtube": {
      const videoIdMatch = link.match(
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|.+?v=))([^?&]+)/,
);
const videoId = videoIdMatch ? videoIdMatch[1] : "";
return `https://www.youtube.com/embed/${videoId}?autoplay=0&origin=${window.location.origin}`;

    }

    case "reddit": {
      // Reddit embedding handled via script, so return the original link
      return link;
    }

    case "Link": {
      // Generic links displayed in iframe (if embeddable)
      return link.startsWith("http") ? link : `https://${link}`;
    }

    default:
      return link;
  }
};
