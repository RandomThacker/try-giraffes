import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};

const variants = {
  primary:
    "bg-[#666CFF] text-white shadow-[0_2px_6px_rgba(102,108,255,0.28)] hover:bg-[#5c62f2]",
  secondary: "bg-[#F1F1F2] text-[#6d6d75] hover:bg-[#e6e6e8]",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-[8px] px-5 text-[15px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#666CFF] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
