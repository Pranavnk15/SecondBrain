import { ReactElement } from "react";

interface ButtonProps {
  text: string;
  size: "lg" | "sm" | "md";
  startIcon?: ReactElement;
  endIcon?: ReactElement;
  variant: "primary" | "secondary";
  onClick?: () => void;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantStyles = {
  primary:
    "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-blue-500 hover:to-cyan-500",
  secondary:
    "bg-gray-800 text-cyan-300 hover:bg-gray-700 border border-cyan-500",
};

const sizeStyles = {
  lg: "px-8 py-4 text-xl rounded-xl",
  md: "px-4 py-2 text-md rounded-md",
  sm: "px-2 py-1 text-sm rounded-sm",
};

const defaultStyles =
  "transition-all duration-300 font-semibold flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-500";

export const Button = (props: ButtonProps) => {
  return (
    <button
      onClick={props.onClick}
      disabled={props.loading}
      className={`
        ${variantStyles[props.variant]} 
        ${sizeStyles[props.size]} 
        ${defaultStyles}
        ${props.fullWidth ? "w-full" : ""}
        ${props.loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {props.startIcon && <div className="mr-2">{props.startIcon}</div>}
      <span>{props.text}</span>
      {props.endIcon && <div className="ml-2">{props.endIcon}</div>}
    </button>
  );
};
