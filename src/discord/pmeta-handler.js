import { getUsageEntries } from '../pokemon/usage-report.js';
import {
  createPmetaEmbed,
  getPageComponents,
  getPageCount
} from './pmeta-embed.js';

async function updatePage(interaction, entries, page) {
  const pageCount = getPageCount(entries);
  await interaction.editReply({
    embeds: [createPmetaEmbed(entries, page)],
    components: getPageComponents(page, pageCount)
  });
}

export async function handlePmetaCommand(interaction) {
  await interaction.deferReply();

  try {
    const entries = await getUsageEntries();
    await updatePage(interaction, entries, 0);

    const collector = interaction.channel.createMessageComponentCollector({
      time: 10 * 60 * 1000,
      filter: (buttonInteraction) => buttonInteraction.user.id === interaction.user.id
        && buttonInteraction.customId.startsWith('pmeta:')
    });

    collector.on('collect', async (buttonInteraction) => {
      const [, direction, currentPage] = buttonInteraction.customId.split(':');
      const page = Number(currentPage) + (direction === 'next' ? 1 : -1);

      await buttonInteraction.deferUpdate();
      await updatePage(interaction, entries, page);
    });

    collector.on('end', async () => {
      await interaction.editReply({ components: [] }).catch(() => {});
    });
  } catch (error) {
    console.error(error);
    await interaction.editReply('Erro ao consultar o arquivo de usage');
  }
}
