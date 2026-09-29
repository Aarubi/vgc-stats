import { EmbedBuilder } from 'discord.js';
import { commands } from './commands.js';

function formatCommand(command) {
  const options = (command.options ?? [])
    .map((option) => option.required ? `<${option.name}>` : `[${option.name}]`)
    .join(' ');
  const usage = `/${command.name}${options ? ` ${options}` : ''}`;

  return `**${usage}**\n${command.description}`;
}

export function createHelpEmbed() {
  return new EmbedBuilder()
    .setTitle('Comandos do VGCStats')
    .setDescription(commands.map(formatCommand).join('\n\n'))
    .setColor(0xFF0000)
    .setFooter({ text: `${commands.length} comandos disponíveis` });
}

export async function handleHelpCommand(interaction) {
  await interaction.reply({ embeds: [createHelpEmbed()] });
}
