import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gmod: "bg-orange-600 text-white hover:bg-orange-700 shadow-md border-2 border-orange-800",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:bg-white/20",
        glassmorphic: "relative overflow-hidden backdrop-blur-md bg-white/10 border border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:z-[-1] before:bg-gradient-to-br before:from-white/10 before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        gmod: "h-12 px-8 py-3 text-lg font-bold",
        glass: "h-14 px-10 py-3 text-lg font-bold tracking-wide"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Motion Button Component
export interface MotionButtonProps extends ButtonProps {
  hoverScale?: number;
  showGlow?: boolean;
}

const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant, size, hoverScale = 1.02, showGlow = false, ...props }, ref) => {
    const Comp = motion.button;
    
    return (
      <div className="relative group">
        {/* Optional glow effect */}
        {showGlow && (
          <motion.div 
            className="absolute inset-0 bg-primary/30 rounded-md blur-xl"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 0 }}
            whileHover={{ opacity: 0.7, scale: 1.05 }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
          />
        )}
        
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          whileHover={{ 
            scale: hoverScale,
            y: -4,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
          whileTap={{ scale: 0.98, y: -2 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 15
          }}
          {...props as any}
        />
        
        {/* Add subtle interactive shine effect for glassmorphic buttons */}
        {(variant === 'glass' || variant === 'glassmorphic') && (
          <motion.div 
            className="absolute inset-0 pointer-events-none rounded-md opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ left: '-100%' }}
            whileHover={{ left: '100%' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </div>
    );
  }
);
MotionButton.displayName = "MotionButton";

export { Button, MotionButton, buttonVariants }; 