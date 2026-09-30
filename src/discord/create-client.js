import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags
} from 'discord.js';
import { handleHelpCommand } from './help-handler.js';
import { handlePinfoCommand } from './pinfo-handler.js';
import { handlePmetaCommand } from './pmeta-handler.js';
import {
  handlePteamAutocomplete,
  handlePteamCommand,
  warmPteamCache
} from './pteam-handler.js';
import { handlePstatsCommand } from './pstats-handler.js';
import { takeCommandCooldown } from './rate-limit.js';

const commandHandlers = new Map([
  ['help', handleHelpCommand],
  ['pinfo', handlePinfoCommand],
  ['pmeta', handlePmetaCommand],
  ['pstats', handlePstatsCommand],
  ['pteam', handlePteamCommand]
]);

function getSafeErrorMessage(error) {
  return error instanceof Error ? error.message : 'Erro desconhecido';
}

async function handleInteractionError(interaction, error) {
  console.error(
    `Erro na interação ${interaction.commandName ?? 'desconhecida'}:`,
    getSafeErrorMessage(error)
  );

  try {
    if (interaction.isAutocomplete()) {
      if (!interaction.responded) await interaction.respond([]);
      return;
    }

    if (!interaction.isRepliable()) return;
    const content = 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.';
    if (interaction.deferred) {
      await interaction.editReply({ content, embeds: [], components: [] });
    } else if (interaction.replied) {
      await interaction.followUp({ content, flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content, flags: MessageFlags.Ephemeral });
    }
  } catch (replyError) {
    console.error('Não foi possível responder à interação com erro:', getSafeErrorMessage(replyError));
  }
}

async function handleInteraction(interaction) {
  if (interaction.isAutocomplete()) {
    if (interaction.commandName === 'pteam') {
      await handlePteamAutocomplete(interaction);
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const handler = commandHandlers.get(interaction.commandName);
  if (!handler) return;

  const remainingCooldown = takeCommandCooldown(
    interaction.user.id,
    interaction.commandName
  );
  if (remainingCooldown > 0) {
    await interaction.reply({
      content: `Aguarde ${Math.ceil(remainingCooldown / 1000)}s antes de usar este comando novamente.`,
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  await handler(interaction);
}

export function createClient() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [], repliedUser: false }
  });

  client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
    void warmPteamCache();
  });

  client.on(Events.InteractionCreate, (interaction) => {
    void handleInteraction(interaction)
      .catch((error) => handleInteractionError(interaction, error));
  });

  client.on(Events.Error, (error) => {
    console.error('Erro no cliente do Discord:', getSafeErrorMessage(error));
  });

  return client;
}
