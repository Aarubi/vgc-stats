import { EmbedBuilder } from 'discord.js';

const PAGE_SIZE = 20;

function createPageDescription(entries) {
  return entries.map((entry) => (
    `**#${entry.rank} ${entry.name}**\nUsage: **${entry.usage}**`
  )).join('\n\n');
}

export function getPageCount(entries) {
  return Math.ceil(entries.length / PAGE_SIZE);
}

export function createPmetaEmbed(entries, page) {
  const start = page * PAGE_SIZE;
  const pageEntries = entries.slice(start, start + PAGE_SIZE);
  const pageCount = getPageCount(entries);

  return new EmbedBuilder()
    .setTitle('Usage of the Month')
    .setDescription(createPageDescription(pageEntries))
    .setFooter({ text: `Página ${page + 1} de ${pageCount}` })
    .setColor(0xFF0000);
}

export function getPageComponents(page, pageCount) {
  return [{
    type: 1,
    components: [
      {
        type: 2,
        custom_id: `pmeta:prev:${page}`,
        label: 'Anterior',
        style: 2,
        disabled: page === 0
      },
      {
        type: 2,
        custom_id: `pmeta:next:${page}`,
        label: 'Próxima',
        style: 2,
        disabled: page >= pageCount - 1
      }
    ]
  }];
}
