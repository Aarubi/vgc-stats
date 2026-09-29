const COMMAND_COOLDOWNS_MS = new Map([
  ['help', 2_000],
  ['pmeta', 3_000],
  ['pstats', 5_000],
  ['pteam', 3_000]
]);

const expirations = new Map();

function removeExpiredEntries(now) {
  for (const [key, expiresAt] of expirations) {
    if (expiresAt <= now) expirations.delete(key);
  }
}

export function takeCommandCooldown(userId, commandName, now = Date.now()) {
  const duration = COMMAND_COOLDOWNS_MS.get(commandName);
  if (!duration) return 0;

  removeExpiredEntries(now);
  const key = `${userId}:${commandName}`;
  const expiresAt = expirations.get(key) ?? 0;
  if (expiresAt > now) return expiresAt - now;

  expirations.set(key, now + duration);
  return 0;
}

export function clearCommandCooldowns() {
  expirations.clear();
}
