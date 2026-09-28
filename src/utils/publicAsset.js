export function joinPublicBase(base, assetPath) {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = String(assetPath).replace(/^\/+/, "");
  return `${normalizedBase}${normalizedPath}`;
}

export function publicAsset(assetPath) {
  const base = import.meta.env?.BASE_URL || "/";
  return joinPublicBase(base, assetPath);
}
