import { createPstatsPages, getPstatsPageComponents } from './pstats-pages.js';
import { getPokemon } from '../pokemon/pokemon-api.js';
import { getPokemonMetaStats } from '../pokemon/meta-stats.js';

const COLLECTOR_TTL_MS = 5 * 60 * 1000;
const MAX_COLLECTED_INTERACTIONS = 50;

export async function handlePstatsCommand(interaction) {
  const query = interaction.options.getString('nome');
  await interaction.deferReply();

  try {
    const pokemon = await getPokemon(query);
    const metaStats = await getPokemonMetaStats(pokemon.name);
    const pages = createPstatsPages(pokemon, metaStats);
    const updatePage = (page) => interaction.editReply({
      embeds: [pages[page]],
      components: getPstatsPageComponents(page, pages.length)
    });

    const message = await updatePage(0);

    const collector = message.createMessageComponentCollector({
      time: COLLECTOR_TTL_MS,
      max: MAX_COLLECTED_INTERACTIONS,
      filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id
        && buttonInteraction.customId.startsWith('pstats:')
    });

    collector.on('collect', async (buttonInteraction) => {
      try {
        const [, direction, currentPage] = buttonInteraction.customId.split(':');
        const page = Number(currentPage) + (direction === 'next' ? 1 : -1);

        await buttonInteraction.deferUpdate();
        await updatePage(page);
      } catch (error) {
        console.error('Erro ao atualizar a página do Pokémon:', error.message);
      }
    });

    collector.on('end', async () => {
      await interaction.editReply({ components: [] }).catch(() => {});
    });
  } catch (error) {
    if (error.response?.status === 404) {
      await interaction.editReply(`Pokémon não encontrado: ${query}`);
      return;
    }

    console.error('Erro ao consultar a PokeAPI:', error.message);
    await interaction.editReply('Erro ao consultar a PokeAPI');
  }
}
