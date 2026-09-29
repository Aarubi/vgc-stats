import { Client, Events, GatewayIntentBits } from 'discord.js';
import { handleHelpCommand } from './help-handler.js';
import { handlePmetaCommand } from './pmeta-handler.js';
import { handlePteamCommand } from './pteam-handler.js';
import { handlePstatsCommand } from './pstats-handler.js';

export function createClient() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'help') {
        await handleHelpCommand(interaction);
      } else if (interaction.commandName === 'pstats') {
        await handlePstatsCommand(interaction);
      } else if (interaction.commandName === 'pmeta') {
        await handlePmetaCommand(interaction);
      } else if (interaction.commandName === 'pteam') {
        await handlePteamCommand(interaction);
      }
      return;
    }
  });

  return client;
}
