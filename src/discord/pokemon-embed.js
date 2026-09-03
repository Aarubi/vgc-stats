import { EmbedBuilder } from 'discord.js';
import { buildStatsLines, formatStats } from '../pokemon/stats.js';

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatWeight(weightInHectograms) {
  return `${(weightInHectograms / 10).toFixed(1)} kg`;
}

export function getPokemonSprite(pokemon) {
  return pokemon.sprites.other?.['official-artwork']?.front_default
    || pokemon.sprites.front_default;
}

export function createPokemonEmbed(pokemon) {
  const abilities = pokemon.abilities
    .map((ability) => ability.is_hidden
      ? `${capitalize(ability.ability.name)} (hidden)`
      : capitalize(ability.ability.name))
    .join(', ');
  const stats = formatStats(pokemon.stats);
  const sprite = getPokemonSprite(pokemon);

  return new EmbedBuilder()
    .setTitle(`${capitalize(pokemon.name)} (#${pokemon.id})`)
    .setDescription(`**Weight:** ${formatWeight(pokemon.weight)}`)
    .setThumbnail(sprite)
    .setColor(0xFF0000)
    .addFields(
      { name: 'Abilities', value: abilities || '—', inline: false },
      { name: 'Base Stats', value: buildStatsLines(stats), inline: false }
    );
}
