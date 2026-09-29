import { getUsageEntries } from '../pokemon/usage-report.js';
import {
  createPmetaEmbed,
  getPageComponents,
  getPageCount
} from './pmeta-embed.js';

const COLLECTOR_TTL_MS = 5 * 60 * 1000;
const MAX_COLLECTED_INTERACTIONS = 50;

async function updatePage(interaction, entries, page) {
  const pageCount = getPageCount(entries);
  return interaction.editReply({
    embeds: [createPmetaEmbed(entries, page)],
    components: getPageComponents(page, pageCount)
  });
}

export async function handlePmetaCommand(interaction) {
  await interaction.deferReply();

  try {
    const entries = await getUsageEntries();
    const message = await updatePage(interaction, entries, 0);

    const collector = message.createMessageComponentCollector({
      time: COLLECTOR_TTL_MS,
      max: MAX_COLLECTED_INTERACTIONS,
      filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id
        && buttonInteraction.customId.startsWith('pmeta:')
    });

    collector.on('collect', async (buttonInteraction) => {
      try {
        const [, direction, currentPage] = buttonInteraction.customId.split(':');
        const page = Number(currentPage) + (direction === 'next' ? 1 : -1);

        await buttonInteraction.deferUpdate();
        await updatePage(interaction, entries, page);
      } catch (error) {
        console.error('Erro ao atualizar a página de usage:', error.message);
      }
    });

    collector.on('end', async () => {
      await interaction.editReply({ components: [] }).catch(() => {});
    });
  } catch (error) {
    console.error('Erro ao consultar o arquivo de usage:', error.message);
    await interaction.editReply('Erro ao consultar o arquivo de usage');
  }
}
