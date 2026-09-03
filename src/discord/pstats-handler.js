import { createPokemonEmbed } from './pokemon-embed.js';
import { getPokemon } from '../pokemon/pokemon-api.js';

export async function handlePstatsCommand(interaction) {
  const query = interaction.options.getString('nome');
  await interaction.deferReply();

  try {
    const pokemon = await getPokemon(query);
    await interaction.editReply({ embeds: [createPokemonEmbed(pokemon)] });
  } catch (error) {
    if (error.response?.status === 404) {
      await interaction.editReply(`Pokémon não encontrado: ${query}`);
      return;
    }

    console.error(error);
    await interaction.editReply('Erro ao consultar a PokeAPI');
  }
}
