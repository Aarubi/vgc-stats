import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error('Set DISCORD_TOKEN, CLIENT_ID and GUILD_ID in environment');
  process.exit(1);
}

const commands = [
  {
    name: 'pstats',
    description: 'Mostra informações de um Pokémon (stats, moves, tipos, sprite e habilidades)',
    options: [
      {
        name: 'nome',
        description: 'Nome ou ID do Pokémon',
        type: 3,
        required: true
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(token);

async function deploy(){
  try{
    console.log('Registrando comandos...');
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log('Comandos registrados.');
  }catch(e){
    console.error('Erro ao registrar comandos', e);
  }
}

deploy();
