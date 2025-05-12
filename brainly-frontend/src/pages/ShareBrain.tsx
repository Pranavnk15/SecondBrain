import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { Card } from "../components/Card";
import { Bounce, toast } from "react-toastify";
import { ShareFallback } from "./ShareFallback";

export function ShareBrain() {
  const { hash } = useParams();
  const [username, setUsername] = useState("");
  const [content, setContent] = useState([]);
  const [error, setError] = useState(false);
  const [hasToastShown, setHasToastShown] = useState(false);

  useEffect(() => {
    async function fetchSharedContent() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/v1/brain/${hash}`, {
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
        if (!res.data.username && res.data.content?.length) {
          setUsername(res.data.username);
          setContent(res.data.content);
          setError(false);
        } else {
          setError(true);
          if (!hasToastShown) {
            toast.error("Invalid or expired link.", {
              position: "top-center",
              autoClose: 500,
              theme: "dark",
              transition: Bounce,
            });
            setHasToastShown(true);
          }
        }
      } catch  {


        setError(true);
        if (!hasToastShown) {
          toast.error("Could not fetch shared brain.", {
            position: "top-center",
            autoClose: 500,
            theme: "dark",
            transition: Bounce,
          });
          setHasToastShown(true);
        }
      }
    }

    if (hash) fetchSharedContent();
  }, [hash, hasToastShown]);

  if (error) return <ShareFallback />;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white px-6 py-10 overflow-hidden">
      {/* Floating cosmic flair */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-30 blur-sm" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-500 rounded-full animate-pulse opacity-20 blur" />
        <div className="absolute bottom-1/4 left-1/5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-20 blur" />
        <div className="absolute bottom-20 right-10 w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping opacity-20 blur-sm" />
        <div className="absolute top-10 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-10 blur-sm" />
      </div>

      {/* Header */}
      <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-md">
        {username ? `${username}'s Shared Brain 🧠` : "Loading..."}
      </h1>

      {/* Cards */}
      <div className="relative z-10 flex flex-wrap gap-6 justify-center">
        {content.map(({ type, link, title, _id }) => (
          <Card
            key={_id}
            type={type}
            link={link}
            title={title}
            onShare={() => {
              navigator.clipboard.writeText(link);
              toast.info("Link copied!", {
                position: "top-center",
                autoClose: 400,
                theme: "dark",
                transition: Bounce,
              });
            }}
            onDelete={undefined}
          />
        ))}
      </div>
    </div>
  );
}
