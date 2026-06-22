const GRADIENTS = [
  "from-[#111014] via-[#2a1026] to-[#db2777]",
  "from-[#171018] via-[#4a1538] to-[#ec4899]",
  "from-[#2a1026] via-[#831843] to-[#f9a8d4]",
  "from-[#111014] via-[#701a75] to-[#db2777]",
  "from-[#171018] via-[#be185d] to-[#f9a8d4]",
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
  return settingsColor?.trim() || "#171018";
}
