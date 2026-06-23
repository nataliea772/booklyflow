import Image from "next/image";

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
  className = "",
  size = "md",
}: ServiceImageProps) {
  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden ring-1 ring-black/10 ${sizeClasses[size]} ${className}`}
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
      className={`flex items-center justify-center bg-charcoal font-bold text-white shadow-md shadow-black/10 ring-1 ring-black/10 ${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    >
      {name.charAt(0)}
    </div>
  );
}
