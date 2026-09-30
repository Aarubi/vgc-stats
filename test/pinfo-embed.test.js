import assert from 'node:assert/strict';
import test from 'node:test';
import { createPinfoEmbed } from '../src/discord/pinfo-embed.js';

test('cria embed de habilidade com fallback para descrição em inglês', () => {
  const embed = createPinfoEmbed('ability', {
    name: 'intimidate',
    names: [{ language: { name: 'en' }, name: 'Intimidate' }],
    flavor_text_entries: [{
      language: { name: 'en' },
      flavor_text: 'Lowers the opposing Pokémon’s Attack stat.'
    }],
    effect_entries: [{
      language: { name: 'en' },
      short_effect: 'Lowers opponents’ Attack when entering battle.'
    }],
    generation: { name: 'generation-iii' }
  }).toJSON();

  assert.equal(embed.title, 'Habilidade: Intimidate');
  assert.equal(embed.description, 'Lowers the opposing Pokémon’s Attack stat.');
  assert.match(embed.footer.text, /Inglês/);
  assert.equal(embed.fields[0].name, 'Efeito');
  assert.equal(embed.fields[1].value, 'III');
});

test('cria embed de item e neutraliza menções vindas da API', () => {
  const embed = createPinfoEmbed('item', {
    name: 'safety-goggles',
    names: [{ language: { name: 'pt-br' }, name: 'Óculos de Proteção' }],
    flavor_text_entries: [{
      language: { name: 'pt-br' },
      flavor_text: 'Protege @everyone contra pó.'
    }],
    effect_entries: [],
    category: { name: 'held-items' },
    cost: 4000,
    sprites: { default: 'https://example.com/item.png' }
  }).toJSON();

  assert.equal(embed.title, 'Item: Óculos de Proteção');
  assert.equal(embed.description, 'Protege @\u200Beveryone contra pó.');
  assert.equal(embed.fields[1].value, '4000₽');
  assert.match(embed.footer.text, /Português \(Brasil\)/);
});
