import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { motion } from "framer-motion";
import FallingStars from "./FallingStar";
import { toast, Bounce } from "react-toastify";

export function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    username: "",
    password: "",
    email: ""
  });

  function validateFields(username: string, password: string, email: string) {
    const newErrors = { username: "", password: "", email: "" };
    let isValid = true;

    if (username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
      isValid = false;
    }

const parts = email.split(".");
const tld = parts[parts.length - 1].toLowerCase();
const validTLDs = ["com", "org", "net", "io", "dev", "app", "co", "edu", "gov", "in", "us"];

if (!/\S+@\S+\.\S+/.test(email) || !validTLDs.includes(tld)) {
  newErrors.email = "Enter a valid email address with a real TLD";
  isValid = false;
}

    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function signup() {
    const username = usernameRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    const email = emailRef.current?.value || "";

    if (!validateFields(username, password, email)) return;

    try {
      const response = await axios.post(
  BACKEND_URL + "/api/v1/signup",
  {
    username,
    password,
    email,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  }
);

       console.log(response.data.token);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
      toast.success("🦄SignedUp in successfully!", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
        transition: Bounce
      });
    }
    catch (e: unknown) {
  if (axios.isAxiosError(e) && e.response) {
    toast.error(e.response.data.msg, {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
      transition: Bounce,
    });
  } else {
    toast.error("An unknown error occurred", {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
      transition: Bounce,
    });
  }
}

  }

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
      <FallingStars />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 bg-black/60 backdrop-blur-lg border border-cyan-700 rounded-3xl px-10 py-12 w-full max-w-md shadow-2xl"
      >
        {/* Glowing Brain Logo */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="absolute inset-0 bg-cyan-400 blur-3xl rounded-full opacity-30 animate-pulse" />
          <motion.img
            src="/brain2.jpg"
            alt="Second Brain"
            className="relative rounded-full w-full h-full object-cover shadow-[0_0_30px_10px_rgba(0,255,255,0.3)]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
          />
        </div>

        <h2 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 tracking-wide mb-2">
          Join Us
        </h2>
        <h3 className="text-lg font-semibold text-center text-cyan-300 mb-8">
          Create your <span className="text-cyan-400 font-bold">Second Brain</span>
        </h3>

        <div className="flex flex-col space-y-5 w-full">
          <div>
            <Input reference={usernameRef} placeholder="Username" />
            {errors.username && (
              <p className="text-pink-400 text-sm underline mt-1">{errors.username}</p>
            )}
          </div>
          <div>
            <Input reference={passwordRef} placeholder="Password" />
            {errors.password && (
              <p className="text-pink-400 text-sm underline mt-1">{errors.password}</p>
            )}
          </div>
          <div>
            <Input reference={emailRef} placeholder="Email" />
            {errors.email && (
              <p className="text-pink-400 text-sm underline mt-1">{errors.email}</p>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full"
          >
            <Button
              size="lg"
              onClick={signup}
              loading={false}
              variant="primary"
              text="Sign Up"
              fullWidth
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
