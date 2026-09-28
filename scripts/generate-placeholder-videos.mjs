import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const outputDir = new URL("../public/placeholders/videos/", import.meta.url);
const outputs = [
  ["intro-boot.webm", 0],
  ["hero-scroll.webm", 1.4],
  ["motion-study.webm", 2.8],
  ["outro-loop.webm", 4.2],
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage();
await page.addScriptTag({
  path: fileURLToPath(
    new URL("../node_modules/fix-webm-duration/fix-webm-duration.js", import.meta.url)
  ),
});

for (const [filename, phase] of outputs) {
  const bytes = await page.evaluate(async ({ phase }) => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 540;
    const context = canvas.getContext("2d");
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm;codecs=vp8";
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 900_000 });
    const chunks = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    const finished = new Promise((resolve) => {
      recorder.onstop = resolve;
    });
    recorder.start(200);
    const duration = 3_000;
    const start = performance.now();

    await new Promise((resolve) => {
      function draw(now) {
        const elapsed = now - start;
        const t = elapsed / 1000;
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#07070a");
        gradient.addColorStop(0.55, `hsl(${8 + phase * 22 + Math.sin(t) * 8} 92% 42%)`);
        gradient.addColorStop(1, "#15131d");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.lineWidth = 2;
        for (let index = 0; index < 11; index += 1) {
          const radius = 70 + index * 38 + Math.sin(t * 1.5 + index + phase) * 20;
          context.strokeStyle = `rgba(255,255,255,${0.05 + index * 0.012})`;
          context.beginPath();
          context.arc(690 + Math.sin(t + phase) * 80, 230 + Math.cos(t * 0.8) * 50, radius, 0, Math.PI * 2);
          context.stroke();
        }
        context.strokeStyle = "rgba(255,255,255,.28)";
        context.beginPath();
        context.moveTo(90, 430);
        context.lineTo(870, 110 + Math.sin(t + phase) * 50);
        context.stroke();
        if (elapsed < duration) requestAnimationFrame(draw);
        else resolve();
      }
      requestAnimationFrame(draw);
    });

    recorder.stop();
    await finished;
    const rawBlob = new Blob(chunks, { type: mimeType });
    const fixedBlob = await window.ysFixWebmDuration(rawBlob, duration);
    const buffer = await fixedBlob.arrayBuffer();
    return Array.from(new Uint8Array(buffer));
  }, { phase });
  await writeFile(new URL(filename, outputDir), Buffer.from(bytes));
  console.log(`Generated ${filename} (${bytes.length} bytes)`);
}

await browser.close();
