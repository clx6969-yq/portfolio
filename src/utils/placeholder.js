export function placeholderImage({
  width = 1600,
  height = 1000,
  title = "YOUR PROJECT",
  sub = "REPLACE THIS MEDIA",
  accent = "#2f83d8",
} = {}) {
  const safeTitle = String(title).replace(/[<>&]/g, "");
  const safeSub = String(sub).replace(/[<>&]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#eaf3fb"/><circle cx="${width * 0.72}" cy="${height * 0.32}" r="${Math.min(width, height) * 0.24}" fill="${accent}" opacity=".55"/><path d="M0 ${height * 0.75} L${width} ${height * 0.25}" stroke="#1b3348" stroke-opacity=".12" stroke-width="2"/><text x="8%" y="76%" fill="#1b3348" font-family="Arial,sans-serif" font-size="${Math.round(width * 0.06)}" font-weight="700">${safeTitle}</text><text x="8%" y="84%" fill="#5b7891" font-family="monospace" font-size="${Math.round(width * 0.018)}">${safeSub}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
