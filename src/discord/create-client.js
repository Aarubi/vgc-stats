import { Client, GatewayIntentBits } from 'discord.js';
import { handlePstatsCommand } from './pstats-handler.js';

export function createClient() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== 'pstats') return;
    await handlePstatsCommand(interaction);
  });

  return client;
}
