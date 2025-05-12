// src/components/ShareButton.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Bounce, toast } from "react-toastify";
import { ShareIcon } from "../icons/ShareIcon";
import { Button } from "./Button";
import { BACKEND_URL } from "../config";

export function ShareButton() {
  const [isSharing, setIsSharing] = useState<boolean | null>(null);  // Initially null to indicate loading

  // Fetch the initial sharing state from the backend
  useEffect(() => {
    const fetchShareStatus = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/v1/brain/share`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Set initial share state based on backend response
        setIsSharing(response.data.share);
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
    if (isSharing === null) return; // Prevent action while loading

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/brain/share`,
        { share: !isSharing },
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

  if (isSharing === null) return <div>Loading...</div>; // Show loading until state is fetched

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
