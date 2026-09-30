import assert from 'node:assert/strict';
import test from 'node:test';
import { commands } from '../src/discord/commands.js';
import { getPokemonInfo, normalizeInfoQuery } from '../src/pokemon/info-api.js';
import { getPokemon } from '../src/pokemon/pokemon-api.js';

test('limita entradas textuais nos slash commands', () => {
  const pstatsName = commands.find(({ name }) => name === 'pstats')
    .options.find(({ name }) => name === 'nome');
  const pteamPokemon = commands.find(({ name }) => name === 'pteam')
    .options.find(({ name }) => name === 'pokemon');
  const pinfoName = commands.find(({ name }) => name === 'pinfo')
    .options.find(({ name }) => name === 'nome');

  assert.equal(pstatsName.max_length, 64);
  assert.equal(pteamPokemon.max_length, 64);
  assert.equal(pinfoName.max_length, 64);
});

test('rejeita consultas inválidas antes de acessar a PokeAPI', async () => {
  await assert.rejects(() => getPokemon(''), RangeError);
  await assert.rejects(() => getPokemon('x'.repeat(65)), RangeError);
});

test('normaliza nomes de habilidades e itens para a PokéAPI', () => {
  assert.equal(normalizeInfoQuery('  Choice Scarf '), 'choice-scarf');
  assert.equal(normalizeInfoQuery('King_s Rock'), 'king-s-rock');
});

test('rejeita consultas inválidas de habilidades e itens antes da requisição', async () => {
  await assert.rejects(() => getPokemonInfo('move', 'protect'), RangeError);
  await assert.rejects(() => getPokemonInfo('ability', ''), RangeError);
  await assert.rejects(() => getPokemonInfo('item', 'x'.repeat(65)), RangeError);
});
