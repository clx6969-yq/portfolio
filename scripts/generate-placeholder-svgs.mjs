import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDir = path.resolve("public/placeholders");
const outputs = [
  ["landscape-01.svg", 1600, 1000, "PROJECT 01", "#2f83d8"],
  ["landscape-02.svg", 1600, 1000, "PROJECT 02", "#7755ff"],
  ["portrait-01.svg", 1000, 1400, "PORTRAIT 01", "#2f83d8"],
  ["portrait-02.svg", 1000, 1400, "PORTRAIT 02", "#22aacc"],
  ["square-01.svg", 1200, 1200, "SQUARE 01", "#2f83d8"],
  ["square-02.svg", 1200, 1200, "SQUARE 02", "#e6b94a"],
  ["poster-video.svg", 1600, 900, "MOTION STUDY", "#2f83d8"],
];

function makeSvg(width, height, label, accent) {
  const typeSize = Math.round(width * 0.065);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#0d1b26"/><stop offset="1" stop-color="${accent}" stop-opacity=".65"/></linearGradient></defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <circle cx="${width * 0.78}" cy="${height * 0.28}" r="${Math.min(width, height) * 0.24}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/>
  <path d="M${width * 0.08} ${height * 0.18}H${width * 0.92}M${width * 0.08} ${height * 0.82}H${width * 0.92}M${width * 0.22} 0V${height}" stroke="#fff" stroke-opacity=".14"/>
  <text x="8%" y="72%" fill="#fff" font-family="Arial,sans-serif" font-size="${typeSize}" font-weight="700">${label}</text>
  <text x="8%" y="79%" fill="#fff" fill-opacity=".6" font-family="monospace" font-size="${Math.round(width * 0.018)}">REPLACE WITH YOUR WORK</text>
</svg>`;
}

await mkdir(outputDir, { recursive: true });
for (const [name, width, height, label, accent] of outputs) {
  await writeFile(path.join(outputDir, name), makeSvg(width, height, label, accent));
}
console.log(`Generated ${outputs.length} placeholder SVG files.`);
