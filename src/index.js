import 'dotenv/config';
import axios from 'axios';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in environment');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

function capitalize(s){
  return s.charAt(0).toUpperCase()+s.slice(1);
}

function formatStats(stats){
  return stats.map(s => ({ name: s.stat.name, value: s.base_stat }));
}

function formatStatLabel(name){
  switch (name) {
    case 'hp':
      return 'HP';
    case 'attack':
      return 'Attack';
    case 'defense':
      return 'Defense';
    case 'special-attack':
      return 'SP.ATk';
    case 'special-defense':
      return 'SP.DEF';
    case 'speed':
      return 'Speed';
    default:
      return name;
  }
}

function renderEmojiGradientBar(value, max = 255, length = 10){
  const ratio = Math.max(0, Math.min(1, value / max));
  const filled = Math.floor(ratio * length);
  let filledColor = '🟥';
  if (value >= 130) {
    filledColor = '🟦';
  } else if (value >= 80) {
    filledColor = '🟩';
  } else if (value >= 60) {
    filledColor = '🟧';
  }

  let bar = '';
  for (let i = 0; i < length; i++) {
    if (i < filled) {
      bar += filledColor;
    } else {
      bar += '⬜';
    }
  }

  return bar;
}

function statMinMax(base, level = 50, isHP = false){
  // Using typical Pokémon formulas
  // HP: floor(((2*Base + IV + floor(EV/4)) * Level)/100) + Level + 10
  // Other: floor((floor(((2*Base + IV + floor(EV/4)) * Level)/100) + 5) * nature)
  const minIV = 31;
  const maxIV = 31;
  const minEV = 0;
  const maxEV = 252; // common max per stat
  const minNature = 0.9;
  const maxNature = 1.1;

  if(isHP){
    const min = Math.floor(((2*base + minIV + Math.floor(minEV/4)) * level)/100) + level + 10;
    const max = Math.floor(((2*base + maxIV + Math.floor(maxEV/4)) * level)/100) + level + 10;
    return { min, max };
  }

  const minBase = Math.floor(((2*base + minIV + Math.floor(minEV/4)) * level)/100);
  const maxBase = Math.floor(((2*base + maxIV + Math.floor(maxEV/4)) * level)/100);

  const min = Math.floor((minBase + 5) * minNature);
  const max = Math.floor((maxBase + 5) * maxNature);
  return { min, max };
}

function buildStatsLines(stats){
  const rows = stats.map((s) => {
    const name = formatStatLabel(s.name);
    const base = s.value;
    const isHP = s.name === 'hp';
    const lv50 = statMinMax(base, 50, isHP);
    const lv50Range = `${lv50.min}-${lv50.max}`;
    const bar = renderEmojiGradientBar(base, 255, 10);
    return `**${name}: ${base}** ${bar} ${lv50Range}`;
  });

  const totalBase = stats.reduce((sum, stat) => sum + stat.value, 0);
  rows.push(`**TOTAL BASE STATS:** ${totalBase}`);
  return rows.join('\n');
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'pstats') return;

  const query = interaction.options.getString('nome');
  await interaction.deferReply();

  try {
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query.toLowerCase())}`);
    const p = res.data;

    const abilities = p.abilities.map(a => (a.is_hidden ? `${capitalize(a.ability.name)} (hidden)` : capitalize(a.ability.name))).join(', ');
    const stats = formatStats(p.stats);
    const sprite = p.sprites.other?.['official-artwork']?.front_default || p.sprites.front_default;

    const statLines = buildStatsLines(stats);

    const embed = new EmbedBuilder()
      .setTitle(`${capitalize(p.name)} (#${p.id})`)
      .setThumbnail(sprite)
      .setColor(0xFF0000)
      .addFields(
        { name: 'Abilities', value: abilities || '—', inline: false },
        { name: 'Base Stats', value: statLines, inline: false }
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      await interaction.editReply(`Pokémon não encontrado: ${query}`);
      return;
    }
    console.error(err);
    await interaction.editReply('Erro ao consultar a PokeAPI');
  }
});

client.login(token);
