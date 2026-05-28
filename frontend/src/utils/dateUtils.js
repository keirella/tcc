// ── dateUtils.js ──────────────────────────────────────────────────
// Taruh di: src/utils/dateUtils.js
// ─────────────────────────────────────────────────────────────────

const TZ = "Asia/Jakarta";

function parseDate(isoString) {
  if (!isoString) return null;
  // Handle MySQL format "2026-05-28 05:32:00" (spasi bukan T)
  const s = String(isoString).trim().replace(" ", "T");
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

/**
 * "2026-05-28T05:32:00.000Z" → "28 Mei 2026, 12.32"
 */
export function fmtDateTime(isoString) {
  if (!isoString) return "-";
  try {
    const d = parseDate(isoString);
    if (!d) return String(isoString);
    const tgl = d.toLocaleDateString("id-ID", {
      timeZone: TZ,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const jam = d.toLocaleTimeString("id-ID", {
      timeZone: TZ,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${tgl}, ${jam}`;
  } catch {
    return String(isoString);
  }
}

/**
 * "2026-05-28T05:32:00.000Z" → "28 Mei 2026"
 */
export function fmtDate(isoString) {
  if (!isoString) return "-";
  try {
    const d = parseDate(isoString);
    if (!d) return String(isoString);
    return d.toLocaleDateString("id-ID", {
      timeZone: TZ,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return String(isoString);
  }
}

/**
 * "2 menit lalu", "1 jam lalu", dst.
 */
export function fmtRelative(isoString) {
  if (!isoString) return "-";
  try {
    const d = parseDate(isoString);
    if (!d) return "-";
    const diff = Date.now() - d.getTime();
    const mnt = Math.floor(diff / 60000);
    if (mnt < 1) return "Baru saja";
    if (mnt < 60) return `${mnt} menit lalu`;
    const jam = Math.floor(mnt / 60);
    if (jam < 24) return `${jam} jam lalu`;
    return `${Math.floor(jam / 24)} hari lalu`;
  } catch {
    return "-";
  }
}
