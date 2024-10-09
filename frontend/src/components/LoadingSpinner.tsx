import { Loader2 } from "lucide-react";
import { type FC } from "react";

type SpinnerSize = "sm" | "default" | "lg" | "xl";

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = "default", 
  className = "" 
}) => {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 
        className={`animate-spin text-primary ${sizeClasses[size]} ${className}`}
      />
    </div>
  );
};

export default LoadingSpinner;