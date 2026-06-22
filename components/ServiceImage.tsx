import Image from "next/image";
import { getPlaceholderGradient } from "@/lib/branding";

type ServiceImageProps = {
  name: string;
  imageUrl?: string;
  seed: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-12 w-12 rounded-2xl text-lg",
  md: "h-20 w-20 rounded-2xl text-2xl",
  lg: "h-32 w-full rounded-2xl text-4xl",
};

export default function ServiceImage({
  name,
  imageUrl,
  seed,
  className = "",
  size = "md",
}: ServiceImageProps) {
  const gradient = getPlaceholderGradient(seed);

  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden ring-1 ring-primary/10 ${sizeClasses[size]} ${className}`}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes={size === "lg" ? "400px" : "80px"}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-bl ${gradient} font-bold text-white shadow-md shadow-primary/20 ring-1 ring-white/30 ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}
