import { getPokemonInfo } from '../pokemon/info-api.js';
import { createPinfoEmbed } from './pinfo-embed.js';

const TYPE_LABELS = new Map([
  ['ability', 'Habilidade'],
  ['item', 'Item']
]);

export async function handlePinfoCommand(interaction) {
  const type = interaction.options.getString('tipo', true);
  const query = interaction.options.getString('nome', true);
  await interaction.deferReply();

  try {
    const resource = await getPokemonInfo(type, query);
    await interaction.editReply({ embeds: [createPinfoEmbed(type, resource)] });
  } catch (error) {
    if (error.response?.status === 404) {
      await interaction.editReply(`${TYPE_LABELS.get(type) ?? 'Informação'} não encontrada: ${query}`);
      return;
    }

    if (error instanceof RangeError) {
      await interaction.editReply('Informe um tipo e um nome válidos para a consulta.');
      return;
    }

    console.error('Erro ao consultar habilidade ou item na PokéAPI:', error.message);
    await interaction.editReply('Erro ao consultar a PokéAPI. Tente novamente em alguns instantes.');
  }
}
