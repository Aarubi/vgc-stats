import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_SIZE = 2 * 1024 * 1024;

export async function getPokemon(nameOrId) {
  const normalizedQuery = nameOrId?.trim().toLowerCase();
  if (!normalizedQuery || normalizedQuery.length > 64) {
    throw new RangeError('Invalid Pokémon name or ID');
  }

  const query = encodeURIComponent(normalizedQuery);
  const response = await axios.get(`${POKE_API_URL}/${query}`, {
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: MAX_RESPONSE_SIZE,
    maxBodyLength: MAX_RESPONSE_SIZE
  });
  return response.data;
}
