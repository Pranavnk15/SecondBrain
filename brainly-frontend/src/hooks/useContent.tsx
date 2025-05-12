import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "../config";

interface User {
  _id: string;
  username: string;
}

interface Content {
  _id: string;
  link: string;
  type: "youtube" | "twitter" | string;
  title: string;
  userId?: User;
}

export function useContent() {
  const [contents, setContents] = useState<Content[]>([]);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }

    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.data && Array.isArray(response.data.data)) {
        setContents(response.data.data);
      } else {
        console.warn("Unexpected content response structure", response.data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }, []);

  useEffect(() => {
    refresh();

    // const interval = setInterval(refresh, 10000); // auto-refresh every 10s
    // return () => clearInterval(interval);
  }, [refresh]);

  return { contents, refresh };
}
