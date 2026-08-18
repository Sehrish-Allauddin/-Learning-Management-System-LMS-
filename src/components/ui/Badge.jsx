import React from "react";
import { cn } from "../../lib/utils";

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-primary text-white border-transparent",
    secondary: "bg-green-100 text-primary border-transparent",
    destructive: "bg-red-100 text-red-600 border-transparent",
    outline: "text-text-dark border-border",
    warning: "bg-amber-100 text-amber-600 border-transparent",
    success: "bg-green-100 text-green-700 border-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
