function normalize(value) {
  return value.trim().toLocaleLowerCase('en-US');
}

export function teamHasRentalCode(team) {
  const rentalCode = team.rentalCode?.trim();
  return Boolean(rentalCode && normalize(rentalCode) !== 'none');
}

export function teamHasEvs(team) {
  return normalize(team.hasEvs ?? '') === 'yes';
}

export function filterTeams(teams, { pokemon, rental, evs }) {
  const normalizedPokemon = pokemon ? normalize(pokemon) : null;

  return teams.filter((team) => {
    const matchesPokemon = !normalizedPokemon || team.pokemon.some(
      (name) => normalize(name) === normalizedPokemon
    );
    const matchesRental = rental == null || teamHasRentalCode(team) === rental;
    const matchesEvs = evs == null || teamHasEvs(team) === evs;

    return matchesPokemon && matchesRental && matchesEvs;
  });
}

export function getPokemonSuggestions(teams, query, limit = 25) {
  const normalizedQuery = normalize(query);
  const names = [...new Set(teams.flatMap((team) => team.pokemon))];

  return names
    .filter((name) => normalize(name).includes(normalizedQuery))
    .sort((left, right) => left.localeCompare(right, 'en'))
    .slice(0, limit);
}
