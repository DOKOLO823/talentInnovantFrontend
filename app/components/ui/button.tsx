import * as React from "react";
import { cn } from "../../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const buttonStyles = {
  default:
    "bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700",
  outline:
    "border border-orange-400 text-orange-500 hover:bg-orange-50",
  ghost: "text-gray-700 hover:bg-gray-100",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "px-4 py-2 rounded-xl text-sm font-medium transition-all",
        buttonStyles[variant],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
