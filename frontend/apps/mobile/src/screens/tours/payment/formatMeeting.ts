export function formatMeetingPoint(mp: Record<string, string | null> | undefined): string {
  if (!mp || typeof mp !== 'object') return '—';
  const direct = mp.address ?? mp.formatted ?? mp.text ?? mp.name;
  if (direct?.trim()) return direct.trim();
  const v = Object.values(mp).find((x) => x && String(x).trim());
  return v ? String(v).trim() : '—';
}
