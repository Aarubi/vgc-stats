import 'dotenv/config';
import {
  ApplicationIntegrationType,
  InteractionContextType,
  REST,
  Routes
} from 'discord.js';
import { commands } from '../src/discord/commands.js';

try {
  const args = process.argv.slice(2);
  const [mode] = args;
  if (args.length !== 1 || (mode !== '--guild' && mode !== '--global')) {
    throw new Error('Informe exatamente uma opção: --guild ou --global.');
  }

  const global = mode === '--global';
  const { DISCORD_TOKEN: token, CLIENT_ID: clientId, GUILD_ID: guildId } = process.env;
  if (!token || !clientId) {
    throw new Error('Configure DISCORD_TOKEN e CLIENT_ID.');
  }
  if (!global && !guildId) {
    throw new Error('Configure GUILD_ID para registrar comandos no servidor de testes.');
  }

  const route = global
    ? Routes.applicationCommands(clientId)
    : Routes.applicationGuildCommands(clientId, guildId);
  const body = global
    ? commands.map((command) => ({
        ...command,
        integration_types: [ApplicationIntegrationType.GuildInstall],
        contexts: [InteractionContextType.Guild]
      }))
    : commands;
  const rest = new REST({ version: '10' }).setToken(token);

  await rest.put(route, { body });
  console.log(global ? 'Comandos globais registrados.' : 'Comandos registrados no servidor de testes.');
} catch (error) {
  console.error('Erro ao registrar comandos:', error.message);
  process.exitCode = 1;
}
