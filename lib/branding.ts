const GRADIENTS = [
  "from-[#581C87] via-[#BE185D] to-[#F9A8D4]",
  "from-[#6B21A8] via-[#DB2777] to-[#FBCFE8]",
  "from-[#581C87] via-[#9D174D] to-[#F5D0A9]",
  "from-[#701A75] via-[#C026D3] to-[#F9A8D4]",
  "from-[#581C87] via-[#BE185D] to-[#E9D5FF]",
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
  return settingsColor?.trim() || "#581C87";
}
