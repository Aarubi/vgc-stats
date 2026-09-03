import { EmbedBuilder } from 'discord.js';
import { createPokemonEmbed, getPokemonSprite } from './pokemon-embed.js';

const META_SECTIONS = ['Abilities', 'Items', 'Spreads', 'Moves', 'Teammates'];

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function createSectionDescription(entries) {
  return entries.length > 0
    ? entries.map((entry) => `**${entry.name}:** ${entry.usage}`).join('\n')
    : 'Não informado';
}

export function createPstatsPages(pokemon, metaStats) {
  const pages = [createPokemonEmbed(pokemon)];
  const sprite = getPokemonSprite(pokemon);

  for (const section of META_SECTIONS) {
    pages.push(new EmbedBuilder()
      .setTitle(`${capitalize(pokemon.name)} - ${section}`)
      .setDescription(createSectionDescription(metaStats?.sections?.[section] || []))
      .setThumbnail(sprite)
      .setColor(0xFF0000));
  }

  return pages;
}

export function getPstatsPageComponents(page, pageCount) {
  return [{
    type: 1,
    components: [
      {
        type: 2,
        custom_id: `pstats:prev:${page}`,
        label: 'Anterior',
        style: 2,
        disabled: page === 0
      },
      {
        type: 2,
        custom_id: `pstats:next:${page}`,
        label: 'Próxima',
        style: 2,
        disabled: page >= pageCount - 1
      }
    ]
  }];
}

export { META_SECTIONS };
