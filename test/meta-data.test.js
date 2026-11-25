import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDataCache } from '../src/pokemon/remote-data.js';
import { parseSmogonReport, serializeSmogonSnapshot } from '../src/pokemon/smogon-report.js';
import { findProjectRedPokemon, parseProjectRed } from '../src/pokemon/project-red.js';
import { createPladderEmbed } from '../src/discord/pladder-handler.js';

test('valida o par mensal de ranking e movesets da Smogon', () => {
  const snapshot = {
    period: '2026-10',
    format: 'gen9championsvgc2026regmcbo3',
    rating: '1760',
    usageText: '| 1 | Sneasler | 46.2% |',
    movesetText: [
      '+----------+',
      '| Sneasler |',
      '+----------+',
      '| Raw count: 2000 |',
      '+----------+',
      '| Moves |',
      '| Protect 80.0% |'
    ].join('\n')
  };

  const report = parseSmogonReport(snapshot);
  assert.equal(report.usage[0].usage, '46.2%');
  assert.deepEqual(report.movesets.get('sneasler').sections.Moves, [
    { name: 'Protect', usage: '80.0%' }
  ]);
  assert.throws(() => parseSmogonReport({
    ...snapshot,
    movesetText: snapshot.movesetText.replace('Sneasler', 'Incineroar')
  }), /incompatíveis/);
});

test('limita o tamanho do snapshot mensal serializado em bytes UTF-8', () => {
  const limit = 4 * 1024 * 1024;
  const snapshot = { usageText: 'a'.repeat(limit - 100), movesetText: '' };
  const overhead = Buffer.byteLength(JSON.stringify({ ...snapshot, usageText: '' }) + '\n');
  snapshot.movesetText = 'é'.repeat((100 - overhead) / 2);
  if (overhead % 2 !== 0) snapshot.usageText += 'a';

  assert.equal(Buffer.byteLength(serializeSmogonSnapshot(snapshot)), limit);
  snapshot.movesetText += 'é';
  assert.throws(() => serializeSmogonSnapshot(snapshot), /acima do limite/);
});

test('mostra formas, percentuais e origem dos sets do Project Red', () => {
  const report = parseProjectRed({
    battles: 10,
    info: {
      generated: '2026-11-23T21:15Z',
      regulation: 'M-C',
      source: 'Showdown public replays, last 30 days',
      teams: 20,
      sheets: 5,
      spreadsEstimated: true
    },
    pokemon: {
      Sneasler: { usage: { raw: 0.10 } },
      'Indeedee-F': {
        usage: { raw: 0.75 },
        setsFromSmogon: true,
        moves: { Protect: 0.80 },
        spreads: { 'Bold:32/0/32/0/2/0': 1 }
      }
    }
  });

  const entry = findProjectRedPokemon(report, 'Indeedee-Female');
  assert.equal(entry, report.ranking[0]);
  const embed = createPladderEmbed(report, entry).toJSON();
  assert.match(embed.description, /30 dias.*75/);
  assert.match(embed.description, /Smogon/);
  assert.match(embed.description, /estimadas/);
  assert.match(embed.fields[2].value, /Protect.*80/);
});

test('compartilha uma atualização simultânea por fonte', async () => {
  let calls = 0;
  const get = createDataCache(async () => {
    calls += 1;
    return { report: 'válido' };
  }, 1_000);
  const [first, second] = await Promise.all([get(), get()]);
  assert.equal(first, second);
  assert.equal(await get(), first);
  assert.equal(calls, 1);
});
