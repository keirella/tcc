const TZ = "Asia/Jakarta";

function parseDate(isoString) {
  if (!isoString) return null;
  const s = String(isoString).trim().replace(" ", "T");
  const d = new Date(s);
  if (isNaN(d)) return null;
  
  d.setTime(d.getTime() + (7 * 60 * 60 * 1000));
  return d;
}

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