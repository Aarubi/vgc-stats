import { Client, GatewayIntentBits } from 'discord.js';
import { handlePmetaCommand } from './pmeta-handler.js';
import { handlePteamFeaturedCommand } from './pteam-featured-handler.js';
import { handlePteamCommand } from './pteam-handler.js';
import { handlePstatsCommand } from './pstats-handler.js';

export function createClient() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'pstats') {
        await handlePstatsCommand(interaction);
      } else if (interaction.commandName === 'pmeta') {
        await handlePmetaCommand(interaction);
      } else if (interaction.commandName === 'pteam') {
        await handlePteamCommand(interaction);
      } else if (interaction.commandName === 'pteam-featured') {
        await handlePteamFeaturedCommand(interaction);
      }
      return;
    }
  });

  return client;
}
