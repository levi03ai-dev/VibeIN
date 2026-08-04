export interface LyricLine {
  time: number;
  text: string;
}

export function parseLRC(raw: string): LyricLine[] {
  if (!raw) return [];
  const lines = raw.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const textPart = line.replace(timeRegex, '').trim();
    if (!textPart) continue;

    let match: RegExpExecArray | null;
    timeRegex.lastIndex = 0;
    while ((match = timeRegex.exec(line)) !== null) {
      const min = Number(match[1]);
      const sec = Number(match[2]);
      const msRaw = match[3].padEnd(3, '0');
      const ms = Number(msRaw);
      const time = min * 60 + sec + ms / 1000;
      result.push({ time, text: textPart });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}
