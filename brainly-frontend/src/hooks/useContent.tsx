import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { BACKEND_URL } from "../config";

export function useContent() {
  const [contents, setContents] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setContents(response.data.data);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }, []);

  useEffect(() => {
    refresh(); // Only runs on mount
  }, [refresh]);

  return { contents, refresh };
}


// interface User {
//     _id: string;
//     username: string;
//   }
  
//   interface Content {
//     _id: string;
//     link: string;
//     type: "youtube" | "twitter";
//     title: string;
//     userId: User;
//   }
  

//   export function useContent() {
//     // State to hold the fetched content
//     const [contents, setContents] = useState<Content[]>([]);
  
//     // Function to fetch content from the backend
//     async function refresh() {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("Token not found");
//         return;
//       }
  
//       try {
//         const response = await axios.get(`${BACKEND_URL}/api/v1/content`, {
//           headers: { token },
//         });
  
//         // Ensure response data is valid before updating state
//         if (response.data && Array.isArray(response.data.data)) {
//           setContents(response.data.data);
//         //   console.log("Fetched content:", response.data.data);
//         } else {
//           console.warn("Unexpected response format:", response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching content:", error);
//       }
//     }
  
//     // useEffect to fetch data on mount and periodically
//     useEffect(() => {
//       refresh(); // Initial fetch when the component mounts
  
//       // Set an interval to refresh content every 10 seconds
//       const interval = setInterval(refresh, 10000);
  
//       // Cleanup the interval on component unmount
//       return () => clearInterval(interval);
//     }, []);
  
//     // Return contents and refresh function for manual refresh
//     return { contents, refresh };
//   }