import { EmbedBuilder, escapeMarkdown } from 'discord.js';
import {
  findProjectRedPokemon,
  getProjectRedReport,
  PROJECT_RED_REPO
} from '../pokemon/project-red.js';

const FORMAT_PERCENT = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 2
});
const FORMAT_COUNT = new Intl.NumberFormat('pt-BR');
const SECTIONS = {
  abilities: 'Habilidades',
  items: 'Itens',
  moves: 'Golpes',
  spreads: 'Distribuições de pontos',
  teammates: 'Parceiros de time'
};

function formatStats(entries) {
  return entries.map(([name, usage]) =>
    `${escapeMarkdown(name)} · **${FORMAT_PERCENT.format(usage)}**`).join('\n');
}

export function createPladderEmbed(report, pokemon) {
  const generated = new Date(report.generated).toISOString().slice(0, 10)
    .split('-').reverse().join('/');
  const embed = new EmbedBuilder()
    .setTitle(pokemon ? `${pokemon.name} · Project Red` : 'Top 15 de usage · Project Red')
    .setURL(PROJECT_RED_REPO)
    .setColor(0xFF0000)
    .setFooter({
      text: `Reg. ${report.regulation} · Dados de ${generated} (UTC) · ${FORMAT_COUNT.format(report.battles)} replays`
    });

  if (!pokemon) {
    const ranking = report.ranking.slice(0, 15).map(({ name, usage }, index) =>
      `**#${index + 1}** ${escapeMarkdown(name)} · **${FORMAT_PERCENT.format(usage)}**`);
    return embed.setDescription([
      'Replays públicos do Showdown com rating no top 10% (Bo1 e Bo3).',
      report.days ? `Janela de ${report.days} dias.` : 'Amostra recente.',
      `${FORMAT_COUNT.format(report.teams)} times · ${FORMAT_COUNT.format(report.sheets)} fichas abertas`,
      '',
      ...ranking
    ].join('\n'));
  }

  const period = report.days ? `dos últimos ${report.days} dias` : 'recente';
  const notes = [`Usage na amostra ${period} · **${FORMAT_PERCENT.format(pokemon.usage)}**`];
  if (pokemon.sheets !== undefined) notes.push(`Fichas abertas do Pokémon · ${FORMAT_COUNT.format(pokemon.sheets)}`);
  if (pokemon.setsFromSmogon) notes.push('Dados de set complementados pelo relatório mensal da Smogon.');
  if (pokemon.sections.spreads.length && report.spreadsEstimated === true) {
    notes.push('Distribuições de pontos estimadas pelo Project Red.');
  } else if (pokemon.sections.spreads.length && report.spreadsEstimated === false) {
    notes.push('Distribuições de pontos baseadas nos dados mensais da Smogon.');
  }

  return embed.setDescription(notes.join('\n')).addFields(
    Object.entries(SECTIONS).map(([key, label]) => ({
      name: label,
      value: formatStats(pokemon.sections[key]) || 'Sem dados na amostra.'
    }))
  );
}

export async function handlePladderCommand(interaction) {
  const query = interaction.options.getString('nome')?.trim();
  await interaction.deferReply();

  const report = await getProjectRedReport();
  if (!report) {
    await interaction.editReply('Dados do Project Red temporariamente indisponíveis. Tente novamente em alguns minutos.');
    return;
  }

  const pokemon = query && findProjectRedPokemon(report, query);
  if (query && !pokemon) {
    await interaction.editReply('Pokémon não encontrado na amostra recente do Project Red. Confira o nome e a forma.');
    return;
  }

  await interaction.editReply({ embeds: [createPladderEmbed(report, pokemon)] });
}
