export function getBotConfig() {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    throw new Error('Missing DISCORD_TOKEN in environment');
  }

  return { token };
}

export function getCommandConfig() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    throw new Error('Set DISCORD_TOKEN, CLIENT_ID and GUILD_ID in environment');
  }

  return { token, clientId, guildId };
}