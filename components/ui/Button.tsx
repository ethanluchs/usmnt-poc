import React from "react";

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  onClick,
  disabled,
  children,
  className = "",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`border border-black rounded px-4 py-2 bg-white text-black hover:bg-black hover:text-white active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
