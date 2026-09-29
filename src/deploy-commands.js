import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { getCommandConfig } from './config/env.js';
import { commands } from './discord/commands.js';

try {
  const { token, clientId, guildId } = getCommandConfig();
  const rest = new REST({ version: '10' }).setToken(token);

  console.log('Registrando comandos...');
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
  console.log('Comandos registrados.');
} catch (error) {
  console.error('Erro ao registrar comandos:', error.message);
  process.exit(1);
}
