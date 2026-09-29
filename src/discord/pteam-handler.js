import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} from 'discord.js';
import { getBotConfig } from '../config/env.js';
import { getTeams, TEAMS_SHEET_NAME } from '../google/sheets-api.js';
import { getAllowedPokepasteUrl } from './content-security.js';
import { createPteamEmbed } from './pteam-embed.js';
import { filterTeams, getPokemonSuggestions } from './pteam-filter.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const COLLECTOR_TTL_MS = 5 * 60 * 1000;
const MAX_COLLECTED_INTERACTIONS = 50;
const teamCache = new Map();
const pendingLoads = new Map();

function logSheetsError(message, error) {
  console.error(message, error.response?.data?.error?.message ?? error.message);
}

async function loadTeams(sheetName = TEAMS_SHEET_NAME) {
  const cached = teamCache.get(sheetName);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL_MS) {
    return cached.teams;
  }

  if (pendingLoads.has(sheetName)) {
    return pendingLoads.get(sheetName);
  }

  const loadPromise = (async () => {
    const { googleSheetsApiKey, googleSheetId } = getBotConfig();
    if (!googleSheetsApiKey || !googleSheetId) {
      throw new Error('Missing GOOGLE_SHEETS_API_KEY or GOOGLE_SHEET_ID');
    }

    const teams = await getTeams({
      apiKey: googleSheetsApiKey,
      sheetId: googleSheetId,
      sheetName
    });
    teamCache.set(sheetName, { teams, loadedAt: Date.now() });
    return teams;
  })();

  pendingLoads.set(sheetName, loadPromise);
  try {
    return await loadPromise;
  } finally {
    pendingLoads.delete(sheetName);
  }
}

function getFilters(interaction) {
  return {
    pokemon: interaction.options.getString('pokemon')?.trim() || null,
    rental: interaction.options.getBoolean('rental'),
    evs: interaction.options.getBoolean('evs')
  };
}

function describeFilters(filters) {
  return [
    filters.pokemon && `Pokémon ${filters.pokemon}`,
    filters.rental != null && `${filters.rental ? 'com' : 'sem'} rental code`,
    filters.evs != null && `${filters.evs ? 'com' : 'sem'} EVs`
  ].filter(Boolean).join(', ');
}

function getRandomTeam(teams, currentTeam) {
  const candidates = teams.length > 1
    ? teams.filter((team) => team !== currentTeam)
    : teams;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function getTeamComponents(team, canReroll) {
  const buttons = [
    new ButtonBuilder()
      .setCustomId('pteam:reroll')
      .setLabel('Outro time')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!canReroll)
  ];

  const pokepasteUrl = getAllowedPokepasteUrl(team.pokepaste);
  if (pokepasteUrl) {
    buttons.push(
      new ButtonBuilder()
        .setLabel('Abrir Pokepaste')
        .setStyle(ButtonStyle.Link)
        .setURL(pokepasteUrl)
    );
  }

  return [new ActionRowBuilder().addComponents(buttons)];
}

function getTeamReply(team, teams, filters) {
  return {
    embeds: [createPteamEmbed(team, { filters, matchingCount: teams.length })],
    components: getTeamComponents(team, teams.length > 1)
  };
}

export async function warmPteamCache() {
  try {
    await loadTeams();
  } catch (error) {
    logSheetsError('Erro ao preparar o cache de times:', error);
  }
}

export async function handlePteamAutocomplete(interaction) {
  const cachedTeams = teamCache.get(TEAMS_SHEET_NAME)?.teams;
  if (!cachedTeams) {
    void warmPteamCache();
    await interaction.respond([]);
    return;
  }

  const query = interaction.options.getFocused();
  const suggestions = getPokemonSuggestions(cachedTeams, query)
    .map((name) => ({ name, value: name }));
  await interaction.respond(suggestions);
}

export async function handlePteamCommand(interaction, sheetName = TEAMS_SHEET_NAME) {
  await interaction.deferReply();

  try {
    const filters = getFilters(interaction);
    const teams = filterTeams(await loadTeams(sheetName), filters);
    if (teams.length === 0) {
      const description = describeFilters(filters);
      await interaction.editReply(
        `Nenhum time encontrado${description ? ` com os filtros: ${description}` : ''}.`
      );
      return;
    }

    let currentTeam = getRandomTeam(teams);
    const message = await interaction.editReply(getTeamReply(currentTeam, teams, filters));
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: COLLECTOR_TTL_MS,
      max: MAX_COLLECTED_INTERACTIONS,
      filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id
        && buttonInteraction.customId === 'pteam:reroll'
    });

    collector.on('collect', async (buttonInteraction) => {
      try {
        await buttonInteraction.deferUpdate();
        currentTeam = getRandomTeam(teams, currentTeam);
        await interaction.editReply(getTeamReply(currentTeam, teams, filters));
      } catch (error) {
        console.error('Erro ao sortear outro time:', error.message);
      }
    });

    collector.on('end', async () => {
      await interaction.editReply({
        components: getTeamComponents(currentTeam, false)
      }).catch(() => {});
    });
  } catch (error) {
    logSheetsError('Erro ao consultar os times:', error);
    await interaction.editReply('Erro ao consultar os times da planilha');
  }
}
