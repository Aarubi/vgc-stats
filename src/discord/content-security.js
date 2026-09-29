const ALLOWED_POKEPASTE_HOSTS = new Set(['pokepast.es']);

export function sanitizeDiscordText(value, maxLength, fallback = 'Não informado') {
  const text = String(value ?? '').trim().replaceAll('@', '@\u200B');
  if (!text) return fallback;
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function getAllowedPokepasteUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !ALLOWED_POKEPASTE_HOSTS.has(url.hostname.toLowerCase())) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
