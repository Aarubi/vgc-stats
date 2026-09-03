export const commands = [
  {
    name: 'pstats',
    description: 'Mostra informações de um Pokémon (stats, moves, tipos, sprite e habilidades)',
    options: [
      {
        name: 'nome',
        description: 'Nome ou ID do Pokémon',
        type: 3,
        required: true
      }
    ]
  }
];
