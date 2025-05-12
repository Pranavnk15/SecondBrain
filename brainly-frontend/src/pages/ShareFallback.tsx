import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ShareFallback() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Floating cosmic flair background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-30 blur-sm" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-500 rounded-full animate-pulse opacity-20 blur" />
        <div className="absolute bottom-1/4 left-1/5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-20 blur" />
        <div className="absolute bottom-20 right-10 w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping opacity-20 blur-sm" />
        <div className="absolute top-10 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-10 blur-sm" />
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-md">
          🔒 Link Expired
        </h1>
        <p className="text-white/70 max-w-md mb-6 text-lg">
          This shared brain link is no longer valid or has expired in the cosmic void.
        </p>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-medium shadow-lg"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>
    </div>
  );
}
