import axios from 'axios';

const SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;
const TEAMS_SHEET_NAME = 'Champions M-C';
// Reservado para quando a aba e o comando de featured teams da M-C forem reativados.
const FEATURED_TEAMS_SHEET_NAME = 'Champions M-C Featured Teams';

function findColumn(headers, name) {
  return headers.findIndex((header) => header.trim() === name);
}

function findColumnFromOptions(headers, names) {
  return names.map((name) => findColumn(headers, name)).find((index) => index !== -1) ?? -1;
}

function parseTeamRows(rows) {
  const headerIndex = rows.findIndex((row) => row.includes('Team ID'));
  if (headerIndex === -1) {
    throw new Error('Team header not found in Google Sheet');
  }

  const headers = rows[headerIndex];
  const teamIdIndex = findColumn(headers, 'Team ID');
  const descriptionIndex = findColumn(headers, 'Team Description');
  const pokepasteIndex = findColumn(headers, 'Pokepaste');
  const evsIndex = findColumn(headers, 'EVs');
  const pokemonIndex = findColumn(headers, 'Pokemon Text for Copypasta');
  const rentalCodeIndex = findColumnFromOptions(headers, [
    'Replica Code\n(Click text for image)',
    'Rental Code\n(Click text for image)'
  ]);

  if ([teamIdIndex, descriptionIndex, pokepasteIndex, evsIndex, pokemonIndex, rentalCodeIndex].includes(-1)) {
    throw new Error('Required team columns not found in Google Sheet');
  }

  return rows.slice(headerIndex + 1)
    .map((row) => ({
      id: row[teamIdIndex]?.trim(),
      description: row[descriptionIndex]?.trim(),
      pokepaste: row[pokepasteIndex]?.trim(),
      hasEvs: row[evsIndex]?.trim(),
      rentalCode: row[rentalCodeIndex]?.trim(),
      pokemon: row.slice(pokemonIndex).filter(Boolean).slice(0, 6).map((name) => name.trim())
    }))
    .filter((team) => team.id && team.pokemon.length > 0);
}

export async function getTeams({ apiKey, sheetId, sheetName = TEAMS_SHEET_NAME }) {
  const range = encodeURIComponent(`'${sheetName}'!A:AZ`);
  const response = await axios.get(`${SHEETS_API_URL}/${sheetId}/values/${range}`, {
    headers: { 'x-goog-api-key': apiKey },
    timeout: REQUEST_TIMEOUT_MS,
    maxContentLength: MAX_RESPONSE_SIZE,
    maxBodyLength: MAX_RESPONSE_SIZE
  });

  return parseTeamRows(response.data.values || []);
}

export { FEATURED_TEAMS_SHEET_NAME, TEAMS_SHEET_NAME, parseTeamRows };
