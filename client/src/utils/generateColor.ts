export default function generateDarkColor() {
  const h = Math.floor(Math.random() * 360); // Random Hue
  const s = Math.floor(Math.random() * 50) + 50; // High Saturation (50-100%) for "pop"
  const l = Math.floor(Math.random() * 30) + 20; // Low Lightness (20-50%) for contrast

  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Deterministic color for a given seed (e.g. username) so the same user
// always gets the same avatar color across renders/sessions.
export function generateColorFromString(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
}
