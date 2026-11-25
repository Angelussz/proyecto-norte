import { getClientIp } from "@/lib/rate-limit";

export interface RequestContext {
  ipAddress: string;
  userAgent: string;
  deviceLabel: string;
}

/**
 * Parsea un header User-Agent a una etiqueta legible para la UI
 * (ej: "macOS · Chrome", "iPhone · Safari", "Windows · Edge").
 */
export function parseDeviceLabel(userAgent: string): string {
  const ua = userAgent.trim();
  if (!ua) return "Navegador desconocido";

  let os = "Dispositivo desconocido";
  if (/iPhone/i.test(ua)) os = "iPhone";
  else if (/iPad/i.test(ua)) os = "iPad";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X|Macintosh/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Navegador";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Chrome\/|CriOS\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua)) browser = /iPhone|iPad/i.test(ua) ? "Safari Mobile" : "Safari";
  else if (/curl/i.test(ua)) browser = "cURL";

  return `${os} · ${browser}`;
}

/**
 * Enmascara los últimos segmentos de una IP para mostrarla en la UI sin exponerla entera.
 */
export function maskIpAddress(ip: string): string {
  const clean = ip.trim();
  if (!clean || clean === "unknown") return "IP no disponible";
  if (clean === "::1" || clean === "127.0.0.1" || clean === "::ffff:127.0.0.1") {
    return "Localhost (127.0.0.1)";
  }

  const ipv4 = clean.replace(/^::ffff:/, "");
  const v4Parts = ipv4.split(".");
  if (v4Parts.length === 4) {
    return `${v4Parts[0]}.${v4Parts[1]}.***.***`;
  }

  const v6Parts = clean.split(":");
  if (v6Parts.length >= 3) {
    return `${v6Parts[0]}:${v6Parts[1]}:****`;
  }

  return "IP oculta";
}

/**
 * Extrae IP, User-Agent y etiqueta de dispositivo de una Request de Next.js.
 */
export function extractRequestContext(req: Request): RequestContext {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? "";
  const deviceLabel = parseDeviceLabel(userAgent);

  return {
    ipAddress,
    userAgent: userAgent.slice(0, 500),
    deviceLabel,
  };
}
