import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={cn("rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center", sizeClasses[size], className)}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={cn("text-white", {
            "h-4 w-4": size === "sm",
            "h-5 w-5": size === "md",
            "h-6 w-6": size === "lg",
          })} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" 
          />
        </svg>
      </div>
    </div>
  );
}
