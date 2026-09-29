import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearCommandCooldowns,
  takeCommandCooldown
} from '../src/discord/rate-limit.js';

test('aplica cooldown por usuário e comando', () => {
  clearCommandCooldowns();
  assert.equal(takeCommandCooldown('user-1', 'pstats', 1_000), 0);
  assert.equal(takeCommandCooldown('user-1', 'pstats', 2_000), 4_000);
  assert.equal(takeCommandCooldown('user-1', 'pstats', 6_000), 0);
});

test('não compartilha cooldown entre usuários ou comandos', () => {
  clearCommandCooldowns();
  assert.equal(takeCommandCooldown('user-1', 'pteam', 1_000), 0);
  assert.equal(takeCommandCooldown('user-2', 'pteam', 1_000), 0);
  assert.equal(takeCommandCooldown('user-1', 'pmeta', 1_000), 0);
});

test('ignora comandos sem cooldown configurado', () => {
  clearCommandCooldowns();
  assert.equal(takeCommandCooldown('user-1', 'unknown', 1_000), 0);
  assert.equal(takeCommandCooldown('user-1', 'unknown', 1_001), 0);
});
