import { EmbedBuilder } from 'discord.js';
import { sanitizeDiscordText } from './content-security.js';

const LANGUAGE_PREFERENCES = ['pt-br', 'pt', 'en'];
const LANGUAGE_LABELS = new Map([
  ['pt-br', 'Português (Brasil)'],
  ['pt', 'Português'],
  ['en', 'Inglês']
]);

function formatIdentifier(value) {
  return String(value ?? '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatGeneration(value) {
  const generation = String(value ?? '').replace(/^generation-/, '').toUpperCase();
  return generation || 'Não informada';
}

function normalizeText(value, effectChance) {
  return String(value ?? '')
    .replaceAll('$effect_chance', String(effectChance ?? '—'))
    .replace(/[\n\f\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findLocalizedEntry(entries, getText, effectChance) {
  for (const language of LANGUAGE_PREFERENCES) {
    const entry = [...(entries ?? [])]
      .reverse()
      .find(({ language: entryLanguage }) => entryLanguage?.name === language);
    const text = normalizeText(entry && getText(entry), effectChance);
    if (text) return { text, language };
  }

  return null;
}

function getDisplayName(resource) {
  const localizedName = findLocalizedEntry(resource.names, (entry) => entry.name);
  return localizedName?.text || formatIdentifier(resource.name);
}

function getDescription(resource) {
  return findLocalizedEntry(
    resource.flavor_text_entries,
    (entry) => entry.flavor_text,
    resource.effect_chance
  ) || findLocalizedEntry(
    resource.effect_entries,
    (entry) => entry.short_effect || entry.effect,
    resource.effect_chance
  );
}

function getEffect(resource) {
  return findLocalizedEntry(
    resource.effect_entries,
    (entry) => entry.short_effect || entry.effect,
    resource.effect_chance
  );
}

function addAbilityFields(embed, resource) {
  const effect = getEffect(resource);
  const description = getDescription(resource);
  if (effect && effect.text !== description?.text) {
    embed.addFields({
      name: 'Efeito',
      value: sanitizeDiscordText(effect.text, 1024)
    });
  }

  embed.addFields({
    name: 'Geração',
    value: formatGeneration(resource.generation?.name),
    inline: true
  });
}

function addItemFields(embed, resource) {
  embed.addFields(
    {
      name: 'Categoria',
      value: formatIdentifier(resource.category?.name) || 'Não informada',
      inline: true
    },
    {
      name: 'Custo base',
      value: Number.isFinite(resource.cost) ? `${resource.cost}₽` : 'Não informado',
      inline: true
    }
  );

  if (resource.sprites?.default) embed.setThumbnail(resource.sprites.default);
}

export function createPinfoEmbed(type, resource) {
  const description = getDescription(resource);
  const typeLabel = type === 'ability' ? 'Habilidade' : 'Item';
  const embed = new EmbedBuilder()
    .setTitle(`${typeLabel}: ${getDisplayName(resource)}`)
    .setDescription(sanitizeDiscordText(description?.text, 4096, 'Descrição não disponível.'))
    .setColor(type === 'ability' ? 0x9B59B6 : 0xF1C40F)
    .setFooter({
      text: `Fonte: PokéAPI • ${LANGUAGE_LABELS.get(description?.language) ?? 'Idioma não informado'}`
    });

  if (type === 'ability') addAbilityFields(embed, resource);
  else addItemFields(embed, resource);

  return embed;
}
