export function parseUsageReport(report) {
  const entries = [];

  for (const line of report.split('\n')) {
    const match = line.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*([\d.]+%)\s*\|/);
    if (!match) continue;

    entries.push({
      rank: Number(match[1]),
      name: match[2].trim(),
      usage: match[3]
    });
  }

  return entries;
}
