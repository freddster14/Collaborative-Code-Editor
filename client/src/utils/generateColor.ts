export default function generateDarkColor() {
  const h = Math.floor(Math.random() * 360); // Random Hue
  const s = Math.floor(Math.random() * 50) + 50; // High Saturation (50-100%) for "pop"
  const l = Math.floor(Math.random() * 30) + 20; // Low Lightness (20-50%) for contrast
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}
