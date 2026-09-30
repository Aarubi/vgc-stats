import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024;
const RESOURCE_PATHS = new Map([
  ['ability', 'ability'],
  ['item', 'item']
]);

export function normalizeInfoQuery(value) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '-');

  if (!normalized || normalized.length > 64) {
    throw new RangeError('Invalid ability or item name');
  }

  return normalized;
}

export async function getPokemonInfo(type, nameOrId) {
  const resourcePath = RESOURCE_PATHS.get(type);
  if (!resourcePath) throw new RangeError('Invalid info type');

  const query = encodeURIComponent(normalizeInfoQuery(nameOrId));
  const response = await axios.get(`${POKE_API_URL}/${resourcePath}/${query}`, {
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: MAX_RESPONSE_SIZE,
    maxBodyLength: MAX_RESPONSE_SIZE
  });

  return response.data;
}
