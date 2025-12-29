import * as React from "react";
import { cn } from "../../../lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-3 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400 transition",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
