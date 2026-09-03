# VGC Pokedex Bot

Bot em JavaScript para Discord que consulta a PokeAPI e exibe um card em embed com informações do Pokémon.

Setup rápido

1. Instale dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto e preencha `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `GOOGLE_SHEETS_API_KEY` e `GOOGLE_SHEET_ID`.

3. Registre o comando na sua guild (teste):

```bash
npm run deploy-commands
```

4. Rode o bot:

```bash
npm start
```

Uso

- `/pstats nome:<nome-ou-id>` — consulta um Pokémon na PokeAPI e exibe seu sprite, habilidades, stats base e ranges no nível 50. As páginas seguintes mostram o uso de Abilities, Items, Spreads, Moves e Teammates.
- `/pmeta` — exibe o usage mensal dos Pokémon a partir do arquivo em `src/assets`, com rank, nome, percentual de Usage e paginação.
- `/pteam` — sorteia um time da aba `Champions M-B` da planilha do Google e exibe Team ID, descrição, os seis Pokémon, Pokepaste, status de EVs e rental code.
- `/pteam-featured` — sorteia um time da aba `Champions M-B Featured Teams` e exibe os mesmos dados do `/pteam`.

Arquivos principais

- [src/index.js](src/index.js#L1) — bot e handler do comando
- [src/deploy-commands.js](src/deploy-commands.js#L1) — registra o comando `/pstats` na guild
