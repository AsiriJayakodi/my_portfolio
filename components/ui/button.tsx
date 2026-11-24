import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./ui.module.css";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "glassPrimary" | "glass" | "ghost";
  size?: "default" | "sm" | "lg";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "glass", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          styles.buttonBase,
          styles[`button_${variant}`],
          styles[`buttonSize_${size}`],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
