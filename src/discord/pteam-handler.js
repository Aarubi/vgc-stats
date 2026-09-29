import { getBotConfig } from '../config/env.js';
import { getTeams, TEAMS_SHEET_NAME } from '../google/sheets-api.js';
import { createPteamEmbed } from './pteam-embed.js';

export async function handlePteamCommand(interaction, sheetName = TEAMS_SHEET_NAME) {
  await interaction.deferReply();

  try {
    const { googleSheetsApiKey, googleSheetId } = getBotConfig();
    if (!googleSheetsApiKey || !googleSheetId) {
      throw new Error('Missing GOOGLE_SHEETS_API_KEY or GOOGLE_SHEET_ID');
    }

    const teams = await getTeams({ apiKey: googleSheetsApiKey, sheetId: googleSheetId, sheetName });
    if (teams.length === 0) {
      await interaction.editReply('Nenhum time disponível na planilha');
      return;
    }

    const randomTeam = teams[Math.floor(Math.random() * teams.length)];
    await interaction.editReply({ embeds: [createPteamEmbed(randomTeam)] });
  } catch (error) {
    console.error(
      'Erro ao consultar os times:',
      error.response?.data?.error?.message ?? error.message
    );
    await interaction.editReply('Erro ao consultar os times da planilha');
  }
}
