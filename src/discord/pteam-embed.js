import { EmbedBuilder } from 'discord.js';
import {
  getAllowedPokepasteUrl,
  sanitizeDiscordText
} from './content-security.js';

function describeFilters({ pokemon, rental, evs }) {
  return [
    pokemon && `Pokémon: ${pokemon}`,
    rental != null && `Rental code: ${rental ? 'sim' : 'não'}`,
    evs != null && `EVs: ${evs ? 'sim' : 'não'}`
  ].filter(Boolean).join('\n');
}

export function createPteamEmbed(team, { filters = {}, matchingCount } = {}) {
  const pokepasteUrl = getAllowedPokepasteUrl(team.pokepaste);
  const embed = new EmbedBuilder()
    .setTitle(sanitizeDiscordText(team.id, 256, 'Team'))
    .setDescription(sanitizeDiscordText(team.description, 4096, 'Time selecionado da planilha'))
    .addFields(
      { name: 'Pokémon', value: sanitizeDiscordText(team.pokemon.join('\n'), 1024) },
      {
        name: 'Pokepaste',
        value: pokepasteUrl ? `[Abrir Pokepaste](${pokepasteUrl})` : 'Não informado'
      },
      { name: 'EVs', value: sanitizeDiscordText(team.hasEvs, 1024), inline: true }
    )
    .setColor(0xFF0000);

  const filterDescription = describeFilters(filters);
  if (filterDescription) {
    embed.addFields({
      name: 'Filtros aplicados',
      value: sanitizeDiscordText(filterDescription, 1024)
    });
  }

  if (team.rentalCode && team.rentalCode !== 'None') {
    embed.addFields({
      name: 'Rental Code',
      value: sanitizeDiscordText(team.rentalCode, 1024)
    });
  }

  if (matchingCount != null) {
    embed.setFooter({
      text: `${matchingCount} ${matchingCount === 1 ? 'time encontrado' : 'times encontrados'} • Regulation M-C`
    });
  }

  return embed;
}
