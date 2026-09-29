import assert from 'node:assert/strict';
import test from 'node:test';
import { commands } from '../src/discord/commands.js';
import { getPokemon } from '../src/pokemon/pokemon-api.js';

test('limita entradas textuais nos slash commands', () => {
  const pstatsName = commands.find(({ name }) => name === 'pstats')
    .options.find(({ name }) => name === 'nome');
  const pteamPokemon = commands.find(({ name }) => name === 'pteam')
    .options.find(({ name }) => name === 'pokemon');

  assert.equal(pstatsName.max_length, 64);
  assert.equal(pteamPokemon.max_length, 64);
});

test('rejeita consultas inválidas antes de acessar a PokeAPI', async () => {
  await assert.rejects(() => getPokemon(''), RangeError);
  await assert.rejects(() => getPokemon('x'.repeat(65)), RangeError);
});
