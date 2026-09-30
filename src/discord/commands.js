export const commands = [
  {
    name: 'help',
    description: 'Lista os comandos disponíveis do bot'
  },
  {
    name: 'pstats',
    description: 'Mostra informações de um Pokémon (stats, moves, tipos, sprite e habilidades)',
    options: [
      {
        name: 'nome',
        description: 'Nome ou ID do Pokémon',
        type: 3,
        max_length: 64,
        required: true
      }
    ]
  },
  {
    name: 'pinfo',
    description: 'Consulta a descrição de uma habilidade ou item',
    options: [
      {
        name: 'tipo',
        description: 'Tipo de informação que será consultada',
        type: 3,
        required: true,
        choices: [
          { name: 'Habilidade', value: 'ability' },
          { name: 'Item', value: 'item' }
        ]
      },
      {
        name: 'nome',
        description: 'Nome ou ID da habilidade ou item',
        type: 3,
        max_length: 64,
        required: true
      }
    ]
  },
  {
    name: 'pmeta',
    description: 'Mostra o usage mensal dos Pokémon'
  },
  {
    name: 'pteam',
    description: 'Mostra um time aleatório da Regulation M-C',
    options: [
      {
        name: 'pokemon',
        description: 'Filtra times que contenham este Pokémon',
        type: 3,
        max_length: 64,
        autocomplete: true
      },
      {
        name: 'rental',
        description: 'Filtra pela disponibilidade de rental code',
        type: 5
      },
      {
        name: 'evs',
        description: 'Filtra pela disponibilidade dos EVs',
        type: 5
      }
    ]
  }
];
