import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAllowedPokepasteUrl,
  sanitizeDiscordText
} from '../src/discord/content-security.js';

test('aceita somente links HTTPS do domínio oficial do Pokepaste', () => {
  assert.equal(
    getAllowedPokepasteUrl('https://pokepast.es/example'),
    'https://pokepast.es/example'
  );
  assert.equal(getAllowedPokepasteUrl('http://pokepast.es/example'), null);
  assert.equal(getAllowedPokepasteUrl('https://evil.pokepast.es/example'), null);
  assert.equal(getAllowedPokepasteUrl('https://example.com/pokepaste'), null);
});

test('neutraliza menções e limita textos externos', () => {
  assert.equal(sanitizeDiscordText('@everyone', 20), '@\u200Beveryone');
  assert.equal(sanitizeDiscordText('abcdef', 5), 'abcd…');
  assert.equal(sanitizeDiscordText('', 10), 'Não informado');
});
