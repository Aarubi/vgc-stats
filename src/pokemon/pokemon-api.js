import axios from 'axios';

const POKE_API_URL = 'https://pokeapi.co/api/v2/pokemon';

export async function getPokemon(nameOrId) {
  const query = encodeURIComponent(nameOrId.toLowerCase());
  const response = await axios.get(`${POKE_API_URL}/${query}`);
  return response.data;
}