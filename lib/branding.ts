const GRADIENTS = [
  "from-[#6d28d9] via-[#8b5cf6] to-[#f472b6]",
  "from-[#7c3aed] via-[#a78bfa] to-[#fbcfe8]",
  "from-[#5b21b6] via-[#7c3aed] to-[#ec4899]",
  "from-[#4c1d95] via-[#8b5cf6] to-[#f9a8d4]",
  "from-[#6d28d9] via-[#c084fc] to-[#fda4af]",
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getPlaceholderGradient(seed: string): string {
  return GRADIENTS[hashSeed(seed) % GRADIENTS.length];
}

export function getBrandColor(settingsColor?: string): string {
  return settingsColor?.trim() || "#6d28d9";
}
