import { useState } from "react";
import { Card } from "../components/Card";
import { Bounce, toast } from "react-toastify";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";

interface SearchResult {
  userId: string;
  type: "twitter" | "youtube" | "reddit" | "Link";
  link: string;
  title: string;
  description?: string;
}

export function AiSearch() {
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);

  async function handleSearch() {
    if (!prompt.trim()) {
      toast.info("Please enter a search prompt.", {
        position: "top-center",
        autoClose: 500,
        theme: "dark",
        transition: Bounce,
      });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/search`,
        {
          query: prompt,
        },
        {
          headers: {
             Authorization: "Bearer "+ localStorage.getItem("token")|| "",
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status !== 200) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = res.data;
      console.log(data)
      if (Array.isArray(data.results) && data.results.length > 0) {
        setResults(data.results);
      } else {
        toast.info("No relevant brain content found.", {
          position: "top-center",
          autoClose: 500,
          theme: "dark",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 500,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!contentToDelete) return;
        console.log(contentToDelete +'dmsdsds')
    try {
      // Send delete request to the backend
      await axios.delete(`${BACKEND_URL}/api/v1/content`, {
        data: { contentId: contentToDelete },
        headers: {
             Authorization: "Bearer "+ localStorage.getItem("token")
             
           },
      });

      toast.success("Content deleted!", {
        position: "top-center",
        autoClose: 500,
        theme: "dark",
        transition: Bounce,
      });

      // Remove deleted content from the results
      setResults((prev) => prev.filter((result) => result.userId!== contentToDelete));
    } catch {
      toast.error("Failed to delete content.", {
        position: "top-center",
        autoClose: 500,
        theme: "dark",
        transition: Bounce,
      });
    } finally {
      // Close modal after deletion attempt
      setDeleteModalOpen(false);
      setContentToDelete(null); // Reset content to delete state
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white px-6 py-12 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Glowing particles */}
      </div>

      {/* Header */}
      <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-center mb-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-lg animate-fade-in">
        Ask your Second Brain 🧠
      </h1>

      {/* Search Input */}
      <div className="relative z-10 flex justify-center">
        <div className="bg-black/50 backdrop-blur-md p-8 rounded-xl border border-cyan-700 shadow-[0_0_20px_#00ffff33] w-full max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything you’ve stored..."
              className="w-full text-lg p-4 rounded-lg bg-gray-950 border border-cyan-600 text-cyan-200 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 text-lg rounded-lg bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:brightness-110 transition-all text-white font-semibold shadow-lg whitespace-nowrap"
            >
              {loading ? "Searching..." : "🔍 Search"}
            </button>
          </div>
          {loading && (
            <p className="mt-4 text-cyan-300 text-center animate-pulse text-lg">
              Thinking...
            </p>
          )}
        </div>
      </div>

      {/* Multiple Results */}
      {results.length > 0 && (
        <div className="relative z-10 mt-10 flex flex-wrap justify-center gap-6">
          {results.map(({ type, link, title }) => (
            <Card
              key={link}
              type={type as "twitter" | "youtube" | "reddit" | "Link"}
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
              // onDelete={() => {
                // setContentToDelete(userId); // Set the content ID to be deleted
                // setDeleteModalOpen(true); // Open the delete modal
              // }}
            />
          ))}
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)} // Close the modal when cancel
        onConfirm={handleDelete} // Confirm deletion
      />
    </div>
  );
}
