import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bounce, toast } from "react-toastify";

import { Card } from "../components/Card";
import { PlusIcon } from "../icons/PlusIcon";
import { CreateContentModal } from "../components/CreatContentModal";
import { ConfirmDeleteModal } from "../components/ConfirmDeleteModal";
import { Sidebar } from "../components/Sidebar";
import { ShareButton } from "../components/ShareButton";
import { BACKEND_URL } from "../config";
import { useContent } from "../hooks/useContent";
import { Button } from "../components/Button";
import { LogoutConfirmModal } from "../components/LogoutConfirmModal";
import { LogOut } from "lucide-react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

interface ContentItem {
  _id: string;
  title: string;
  link: string;
  type: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const [textData, setText] = useState("ALL");
  const [name, setName] = useState("");
  const { contents, refresh } = useContent();

  useEffect(() => {
    async function getName() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BACKEND_URL}/api/v1/username`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        setName(response.data.username);
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    }
    getName();
  }, []);

  const filteredContents = useMemo(() => {
    return textData === "ALL"
      ? contents
      : contents.filter((item: ContentItem) => item.type === textData);
  }, [contents, textData]);

  const handleDelete = async () => {
    if (!contentToDelete) return;

    const toastId = toast.loading("Deleting...", {
      position: "top-center",
      theme: "dark",
    });

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await axios.delete(`${BACKEND_URL}/api/v1/content`, {
        data: { contentId: contentToDelete },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.update(toastId, {
        render: "Content deleted!",
        type: "success",
        isLoading: false,
        autoClose: 800,
        transition: Bounce,
      });
      refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.update(toastId, {
        render: "Failed to delete content.",
        type: "error",
        isLoading: false,
        autoClose: 800,
        transition: Bounce,
      });
    } finally {
      setDeleteModalOpen(false);
      setContentToDelete(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      localStorage.removeItem("token");
      toast.info("Logging out...", {
        position: "top-center",
        autoClose: 300,
        theme: "dark",
        transition: Bounce,
      });
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch {
      toast.error("Logout failed.", {
        position: "top-center",
        autoClose: 500,
        theme: "dark",
      });
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-indigo-950 to-black text-white overflow-hidden relative">
      {/* Galactic particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-ping opacity-30 blur-sm" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-500 rounded-full animate-pulse opacity-20 blur" />
        <div className="absolute bottom-1/4 left-1/5 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse opacity-20 blur" />
        <div className="absolute bottom-20 right-10 w-2.5 h-2.5 bg-purple-400 rounded-full animate-ping opacity-20 blur-sm" />
        <div className="absolute top-10 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-10 blur-sm" />
      </div>

      <Sidebar textData={textData} setText={setText} />

      <CreateContentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          refresh();
        }}
      />

      <ConfirmDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      <LogoutConfirmModal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      <div className="pt-3 ml-[300px] h-[690px] flex flex-col relative z-10">
        {name && (
          <div className="text-lg font-semibold px-4 bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-lg animate-pulse">
            Welcome back, <span className="font-bold">{name}</span>!
          </div>
        )}

        <div className="flex justify-between items-center mt-0 pl-4 shrink-0">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-300 drop-shadow-[0_0_10px_#f9a8d4]">
            {name ? `${name}'s Second Brain 🧠` : "Your Second Brain"}
          </h1>

          <div className="flex items-center gap-6">
            <Button
              onClick={() => setModalOpen(true)}
              size="md"
              variant="primary"
              text="Add content"
              startIcon={<PlusIcon size="lg" />}
            />

            <div className="flex items-center gap-3">
              <ShareButton />

              <button
                onClick={() => setLogoutModalOpen(true)}
                disabled={isLoggingOut}
                aria-label="Logout"
                data-tooltip-id="logout-tooltip"
                data-tooltip-content="Logout"
                className="p-2 rounded-full border border-cyan-500 hover:bg-pink-500/20 transition"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-cyan-300 border-t-transparent animate-spin rounded-full" />
                ) : (
                  <LogOut className="w-5 h-5 text-cyan-200 hover:text-pink-400 transition" />
                )}
              </button>
              <Tooltip id="logout-tooltip" place="bottom" className="z-50" />
            </div>
          </div>
        </div>

        <div className="flex-1 mt-8 overflow-y-auto pb-6 flex flex-wrap gap-6">
          {[...filteredContents]
            .slice()
            .reverse()
            .map(({ type, link, title, _id }) => (
              <Card
                key={_id}
                type={type}
                link={link}
                title={title}
                onShare={() => {
                  navigator.clipboard.writeText(link);
                  toast.info("Link copied to clipboard!", {
                    position: "top-center",
                    autoClose: 400,
                    theme: "dark",
                    transition: Bounce,
                  });
                }}
                onDelete={() => {
                  setContentToDelete(_id);
                  setDeleteModalOpen(true);
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
