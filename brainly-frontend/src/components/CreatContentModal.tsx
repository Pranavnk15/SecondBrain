import { useRef, useState } from "react";
import { Input } from "./Input";
import { DeleteIcon } from "../icons/DeleteIcon";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { Bounce, toast } from "react-toastify";

enum ContentType {
  Youtube = "youtube",
  Twitter = "twitter",
  Reddit = "reddit",
  Link = "link",
}

interface CreateContentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateContentModal({ open, onClose }: CreateContentModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [type, setType] = useState(ContentType.Youtube);

 async function addContent() {
  const toastId = toast.loading("Adding content...", {
    position: "top-center",
    theme: "dark",
  });

  try {
    const title = titleRef.current?.value;
    const link = linkRef.current?.value;
    const description = descriptionRef.current?.value;

    if (!link || link.trim().length === 0) {
      throw new Error("Link is required");
    }

    await axios.post(
      `${BACKEND_URL}/api/v1/content`,
      { link, title, description, type },
      {
        headers: {
            Authorization: "Bearer "+ localStorage.getItem("token") || "",
            "Content-Type": "application/json",
        },
         withCredentials:true,
      }
    );

    toast.update(toastId, {
      render: "🦄 Content added!",
      type: "success",
      isLoading: false,
      autoClose: 1000,
      transition: Bounce,
    });

    onClose();
  } catch {
    toast.update(toastId, {
      render: "Failed to add content",
      type: "error",
      isLoading: false,
      autoClose: 1500,
      transition: Bounce,
    });
    onClose();
  }
}


  return (
    <>
      {open && (
        <div className="fixed top-0 left-0 w-full h-screen z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[95%] max-w-2xl p-8 rounded-2xl 
              bg-white/5 backdrop-blur-md 
              border border-white/30 text-white 
              animate-fade-in 
              shadow-[0_0_60px_#00ffffcc,0_0_20px_#00ffffcc,0_0_6px_#00ffffcc]">
            
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                title="sa"
                onClick={onClose}
                className="text-cyan-400 hover:text-white hover:scale-125 transition-all duration-200 animate-pulse shadow-[0_0_20px_#00ffffcc]"
              >
                <DeleteIcon />
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-2">
              <Input
                reference={titleRef}
                placeholder="Title"
                className="bg-transparent text-white placeholder-white/60 border border-cyan-400/40 focus:ring-2 focus:ring-cyan-400 shadow-[0_0_15px_#00ffffaa]"
              />
              <Input
                reference={linkRef}
                placeholder="Link"
                className="bg-transparent text-white placeholder-white/60 border border-cyan-400/40 focus:ring-2 focus:ring-cyan-400 shadow-[0_0_15px_#00ffffaa]"
              />
              <textarea
                ref={descriptionRef}
                placeholder="Description (optional)"
                rows={4}
                className="w-full resize-none rounded-md p-3 bg-transparent text-white placeholder-white/60 border border-cyan-400/40 focus:ring-2 focus:ring-cyan-400 shadow-[0_0_15px_#00ffffaa]"
              />
            </div>

            {/* Type Selector */}
            <div className="pt-6">
              <h1 className="text-center font-semibold pb-2 text-white/90">Type</h1>
              <div className="flex gap-2 justify-center flex-wrap">
                {Object.values(ContentType).map((contentType) => (
                  <button
                    key={contentType}
                    onClick={() => setType(contentType)}
                    className={`px-4 py-1 rounded-md font-medium text-sm transition-all duration-200
                      ${
                        type === contentType
                          ? "bg-gradient-to-r from-cyan-300 to-purple-500 text-white shadow-[0_0_25px_#00ffff,0_0_15px_#00ffffaa]"
                          : "bg-transparent border border-white/40 text-white hover:bg-white/10"
                      }`}
                  >
                    {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex justify-center">
              <button
                onClick={addContent}
                className="px-6 py-2 rounded-md font-semibold text-white bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500 shadow-[0_0_40px_#00ffff,0_0_25px_#00ffffaa] hover:scale-105 transition-all duration-200"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
