import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

const imageSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
};

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className={cn("rounded-full object-cover", sizeStyles[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700",
        sizeStyles[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
