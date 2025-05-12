import React from "react";

interface InputProps {
  placeholder: string;
  reference?: React.Ref<HTMLInputElement>;
  className?: string;
}

export function Input({ placeholder, reference, className = "" }: InputProps) {
  return (
    <input
      ref={reference}
      placeholder={placeholder}
      type="text"
      className={`w-full px-4 py-3 rounded-md bg-[#0f0f1f] text-white border border-cyan-500 placeholder-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${className}`}
    />
  );
}
