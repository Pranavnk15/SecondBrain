import { useState, useEffect } from "react";
import axios from "axios";
import { Bounce, toast } from "react-toastify";
import { ShareIcon } from "../icons/ShareIcon";
import { Button } from "./Button";
import { BACKEND_URL } from "../config";

export function ShareButton() {
  const [isSharing, setIsSharing] = useState(false);

  // Fetch share status from backend when the component mounts
  useEffect(() => {
    const fetchShareStatus = async () => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/v1/brain/share`,
          { share: 2 }, // Request the current status
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token"),
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setIsSharing(response.data.isSharing === 1);
      } catch {
        toast.error("❌ Error fetching share status.", {
          position: "top-center",
          autoClose: 500,
          theme: "dark",
          transition: Bounce,
        });
      }
    };

    fetchShareStatus();
  }, []);

  const handleShareToggle = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`,
        { share: isSharing ? 0 : 1 }, // Toggle the share state (0 to disable, 1 to enable)
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (!isSharing && response.data.link) {
        const shareUrl = `${window.location.origin}/shareBrain/${response.data.link}`;
        navigator.clipboard.writeText(shareUrl);
        toast.info("🔗 Share link copied to clipboard!", {
          position: "top-center",
          autoClose: 500,
          theme: "dark",
          transition: Bounce,
        });
      } else {
        toast.success("🛡️ Sharing disabled.", {
          position: "top-center",
          autoClose: 500,
          theme: "dark",
          transition: Bounce,
        });
      }

      setIsSharing(!isSharing);
    } catch {
      toast.error("❌ Error toggling share status.", {
        position: "top-center",
        autoClose: 500,
        theme: "dark",
        transition: Bounce,
      });
    }
  };

  return (
    <Button
      onClick={handleShareToggle}
      size="md"
      variant={isSharing ? "primary" : "secondary"}
      text={isSharing ? "Unshare brain" : "Share brain"}
      startIcon={<ShareIcon size="lg" />}
    />
  );
}
