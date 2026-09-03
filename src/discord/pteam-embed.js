import { EmbedBuilder } from 'discord.js';

export function createPteamEmbed(team) {
  const embed = new EmbedBuilder()
    .setTitle(team.id || 'Team')
    .setDescription(team.description || 'Time selecionado da planilha')
    .addFields(
      { name: 'Pokémon', value: team.pokemon.join('\n') || 'Não informado' },
      { name: 'Pokepaste', value: team.pokepaste || 'Não informado' },
      { name: 'EVs', value: team.hasEvs || 'Não informado', inline: true }
    )
    .setColor(0xFF0000);

  if (team.rentalCode && team.rentalCode !== 'None') {
    embed.addFields({ name: 'Rental Code', value: team.rentalCode });
  }

  return embed;
}