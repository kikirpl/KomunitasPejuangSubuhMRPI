import Image from "next/image";

export function Logo({ className = "size-14" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt=""
      loading="eager"
      width={112}
      height={112}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

