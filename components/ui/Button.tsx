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
      className={`border border-black dark:border-[#b8b2a0] rounded px-4 py-2 bg-[#ede8d0] dark:bg-[#1a1917] text-black dark:text-[#b8b2a0] hover:bg-black hover:text-[#ede8d0] dark:hover:bg-[#ede8d0] dark:hover:text-black active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none ${className}`}
    >
      {children}
    </button>
  );
}
