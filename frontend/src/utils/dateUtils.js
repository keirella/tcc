// ── dateUtils.js ──────────────────────────────────────────────────
// Taruh di: src/utils/dateUtils.js
// Format ISO string dari BE ke tampilan manusia
// ─────────────────────────────────────────────────────────────────

const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

/**
 * "2026-05-27T16:24:11.000Z" → "27 Mei 2026, 16.24"
 * Kalau input null/undefined → "-"
 */
//   export function fmtDateTime(isoString) {
//     if (!isoString) return "-";
//     try {
//       const d = new Date(isoString);
//       if (isNaN(d)) return isoString; // kalau bukan ISO, kembalikan apa adanya
//       const tgl = d.getDate();
//       const bln = BULAN[d.getMonth()];
//       const thn = d.getFullYear();
//       const jam = String(d.getHours()).padStart(2, "0");
//       const mnt = String(d.getMinutes()).padStart(2, "0");
//       return `${tgl} ${bln} ${thn}, ${jam}.${mnt}`;
//     } catch {
//       return isoString;
//     }
//   }
export function fmtDateTime(dateString) {
  if (!dateString) return "-";

  try {
    let d;

    // Kalau format MySQL: 2026-05-28 05:24:18
    if (dateString.includes(" ") && !dateString.includes("T")) {
      d = new Date(dateString.replace(" ", "T") + "Z");
    }
    // Kalau sudah ISO
    else {
      d = new Date(dateString);
    }

    if (isNaN(d)) return "Invalid date";

    return d.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
/**
 * "2026-05-27T16:24:11.000Z" → "27 Mei 2026"
 */
export function fmtDate(isoString) {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    if (isNaN(d)) return isoString;
    return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return isoString;
  }
}

/**
 * Relative time: "2 menit lalu", "1 jam lalu", dst.
 */
export function fmtRelative(isoString) {
  if (!isoString) return "-";
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const mnt = Math.floor(diff / 60000);
    if (mnt < 1) return "Baru saja";
    if (mnt < 60) return `${mnt} menit lalu`;
    const jam = Math.floor(mnt / 60);
    if (jam < 24) return `${jam} jam lalu`;
    const hari = Math.floor(jam / 24);
    return `${hari} hari lalu`;
  } catch {
    return isoString;
  }
}
