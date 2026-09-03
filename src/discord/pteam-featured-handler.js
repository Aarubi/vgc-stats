import { FEATURED_TEAMS_SHEET_NAME } from '../google/sheets-api.js';
import { handlePteamCommand } from './pteam-handler.js';

export function handlePteamFeaturedCommand(interaction) {
  return handlePteamCommand(interaction, FEATURED_TEAMS_SHEET_NAME);
}