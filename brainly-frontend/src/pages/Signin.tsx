import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios,{ AxiosError } from "axios";
import { BACKEND_URL } from "../config";
import { motion } from "framer-motion";
import FallingStars from "./FallingStar";
import {toast,Bounce } from "react-toastify"

export function Signin() {
  // const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  async function signin() {
    try {
      const email = emailRef.current?.value;
      const password = passwordRef.current?.value;
      // const email = emailRef.current?.value;

      const response = await axios.post(
  BACKEND_URL + "/api/v1/signin",
  {
    email,
    password,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  }
);


      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      
      navigate("/dashboard");
      toast.success('🦄Signed in successfully!', {
position: "top-center",
autoClose: 2000,
hideProgressBar: false,
closeOnClick: false,
pauseOnHover: true,
draggable: true,
progress: undefined,
theme: "dark",
transition: Bounce,
});

    } catch (err) {
  const error = err as AxiosError<{ msg: string }>;
  console.log(error);

  toast.error(error.response?.data.msg || "An error occurred", {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce
  });
    }
  }

  return (
    <div className=" h-screen w-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
        <FallingStars/>
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
          Welcome Back
        </h2>
        <h3 className="text-lg font-semibold text-center text-cyan-300 mb-8">
          to <span className="text-cyan-400 font-bold">Second Brain</span>
        </h3>

        <div className="flex flex-col space-y-5 w-full">
          <Input reference={emailRef} placeholder="Email" />
          {/* <Input reference={passwordRef} placeholder="Password" /> */}
          <Input reference={passwordRef} placeholder="Password" />
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="w-full"
          >
            <Button
              size="lg"
              onClick={signin}
              loading={false}
              variant="primary"
              text="Sign In"
              fullWidth
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
