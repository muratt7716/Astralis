import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}

const glassButtonVariants = cva(
  "relative isolate all-unset cursor-pointer rounded-full transition-all duration-500 active:scale-95 group/btn",
  {
    variants: {
      size: {
        default: "text-base font-medium",
        sm: "text-sm font-medium",
        lg: "text-lg font-medium",
        icon: "h-10 w-10",
      },
      variant: {
        primary: "",
        secondary: "opacity-90 hover:opacity-100 grayscale-[0.3] hover:grayscale-0",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "primary",
    },
  }
);

const glassButtonTextVariants = cva(
  "glass-button-text relative block select-none tracking-widest uppercase font-brand",
  {
    variants: {
      size: {
        default: "px-8 py-4",
        sm: "px-5 py-2.5 text-xs",
        lg: "px-10 py-5 text-base",
        icon: "flex h-10 w-10 items-center justify-center",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
  fullWidth?: boolean;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, variant, contentClassName, fullWidth, ...props }, ref) => {
    return (
      <div
        className={cn(
          "glass-button-wrap cursor-pointer rounded-full relative group",
          fullWidth && "w-full flex",
          className
        )}
      >
        <button
          className={cn("glass-button overflow-hidden", glassButtonVariants({ size, variant }), fullWidth && "w-full")}
          ref={ref}
          {...props}
        >
          {/* Subtle light streak effect */}
          <div className="absolute inset-x-0 -top-full h-full bg-gradient-to-b from-white/20 to-transparent skew-y-12 transition-all duration-1000 group-hover:top-full opacity-0 group-hover:opacity-100" />
          
          <span
            className={cn(
              glassButtonTextVariants({ size }),
              contentClassName,
              "relative z-10 transition-colors duration-500"
            )}
          >
            {children}
          </span>
        </button>
        {/* Animated Background Shadow/Glow */}
        <div className="glass-button-shadow absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500 scale-90 group-hover:scale-110 -z-10 bg-gradient-to-r from-purple-500 via-amber-400 to-pink-500" />
      </div>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
