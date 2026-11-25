export function getBotConfig() {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    throw new Error('Missing DISCORD_TOKEN in environment');
  }

  return {
    token,
    googleSheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY,
    googleSheetId: process.env.GOOGLE_SHEET_ID
  };
}
