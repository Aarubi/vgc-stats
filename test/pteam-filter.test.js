import assert from 'node:assert/strict';
import test from 'node:test';
import {
  filterTeams,
  getPokemonSuggestions,
  teamHasEvs,
  teamHasRentalCode
} from '../src/discord/pteam-filter.js';

const teams = [
  {
    id: 'A',
    pokemon: ['Incineroar', 'Rillaboom'],
    hasEvs: 'Yes',
    rentalCode: 'https://example.com/rental-a'
  },
  {
    id: 'B',
    pokemon: ['Miraidon', 'Farigiraf'],
    hasEvs: 'No',
    rentalCode: 'None'
  },
  {
    id: 'C',
    pokemon: ['Incineroar', 'Urshifu-Rapid-Strike'],
    hasEvs: 'No',
    rentalCode: ''
  }
];

test('identifica a disponibilidade de rental code e EVs', () => {
  assert.equal(teamHasRentalCode(teams[0]), true);
  assert.equal(teamHasRentalCode(teams[1]), false);
  assert.equal(teamHasEvs(teams[0]), true);
  assert.equal(teamHasEvs(teams[1]), false);
});

test('filtra por Pokémon sem diferenciar maiúsculas e minúsculas', () => {
  const result = filterTeams(teams, { pokemon: 'incineroar', rental: null, evs: null });
  assert.deepEqual(result.map((team) => team.id), ['A', 'C']);
});

test('combina os filtros de Pokémon, rental code e EVs', () => {
  const result = filterTeams(teams, { pokemon: 'Incineroar', rental: true, evs: true });
  assert.deepEqual(result.map((team) => team.id), ['A']);
});

test('aceita filtros negativos de rental code e EVs', () => {
  const result = filterTeams(teams, { pokemon: null, rental: false, evs: false });
  assert.deepEqual(result.map((team) => team.id), ['B', 'C']);
});

test('gera sugestões únicas, filtradas e limitadas para o autocomplete', () => {
  assert.deepEqual(
    getPokemonSuggestions(teams, 'ra'),
    ['Farigiraf', 'Miraidon', 'Urshifu-Rapid-Strike']
  );
  assert.equal(getPokemonSuggestions(teams, '', 3).length, 3);
});
