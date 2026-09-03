export function formatStats(stats) {
  return stats.map((stat) => ({ name: stat.stat.name, value: stat.base_stat }));
}

function formatStatLabel(name) {
  const labels = {
    hp: 'HP',
    attack: 'ATTACK',
    defense: 'DEFENSE',
    'special-attack': 'SP.ATK',
    'special-defense': 'SP.DEF',
    speed: 'SPEED'
  };

  return labels[name] || name;
}

function renderEmojiGradientBar(value, max = 255, length = 10) {
  const ratio = Math.max(0, Math.min(1, value / max));
  const filled = Math.floor(ratio * length);
  let filledColor = '🟥';

  if (value >= 130) {
    filledColor = '🟦';
  } else if (value >= 80) {
    filledColor = '🟩';
  } else if (value >= 60) {
    filledColor = '🟧';
  }

  return Array.from({ length }, (_, index) => index < filled ? filledColor : '⬜').join('');
}

function statMinMax(base, level = 50, isHP = false) {
  const minIV = 31;
  const maxIV = 31;
  const minEV = 0;
  const maxEV = 252;
  const minNature = 0.9;
  const maxNature = 1.1;

  if (isHP) {
    const min = Math.floor(((2 * base + minIV + Math.floor(minEV / 4)) * level) / 100) + level + 10;
    const max = Math.floor(((2 * base + maxIV + Math.floor(maxEV / 4)) * level) / 100) + level + 10;
    return { min, max };
  }

  const minBase = Math.floor(((2 * base + minIV + Math.floor(minEV / 4)) * level) / 100);
  const maxBase = Math.floor(((2 * base + maxIV + Math.floor(maxEV / 4)) * level) / 100);

  return {
    min: Math.floor((minBase + 5) * minNature),
    max: Math.floor((maxBase + 5) * maxNature)
  };
}

export function buildStatsLines(stats) {
  const formattedStats = stats.map((stat) => ({
    ...stat,
    label: formatStatLabel(stat.name)
  }));
  const labelWidth = Math.max(...formattedStats.map((stat) => stat.label.length));

  const rows = formattedStats.map((stat) => {
    const label = stat.label.padEnd(labelWidth);
    const value = String(stat.value).padStart(3);
    const range = statMinMax(stat.value, 50, stat.name === 'hp');
    const bar = renderEmojiGradientBar(stat.value);
    return `${label}: ${value} ${bar} ${range.min}-${range.max}`;
  });

  const totalBase = stats.reduce((sum, stat) => sum + stat.value, 0);
  rows.push(`TOTAL BASE STATS: ${totalBase}`);
  return `\`\`\`\n${rows.join('\n')}\n\`\`\``;
}