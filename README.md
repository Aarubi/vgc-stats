# VGC Pokedex Bot

Bot em JavaScript para Discord que consulta a PokeAPI e exibe um card em embed com informações do Pokémon.

Setup rápido

1. Instale dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto e preencha `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID`, `GOOGLE_SHEETS_API_KEY` e `GOOGLE_SHEET_ID`.

Use `.env.example` como modelo, restrinja a chave do Google à API do Google Sheets e proteja o arquivo local:

```bash
chmod 600 .env
```

3. Registre o comando na sua guild (teste):

```bash
npm run deploy-commands
```

4. Rode o bot:

```bash
npm start
```

Uso

- `/help` — lista todos os comandos disponíveis do bot e uma breve descrição de cada um.
- `/pstats nome:<nome-ou-id>` — consulta um Pokémon na PokeAPI e exibe seu sprite, habilidades, stats base e ranges no nível 50. As páginas seguintes mostram o uso de Abilities, Items, Spreads, Moves e Teammates.
- `/pmeta` — exibe o usage mensal dos Pokémon a partir do arquivo em `src/assets`, com rank, nome, percentual de Usage e paginação.
- `/pteam [pokemon] [rental] [evs]` — sorteia um time da aba `Champions M-C`, com filtros opcionais por Pokémon, rental code e EVs. O resultado permite sortear outro time mantendo os filtros ou abrir o Pokepaste.

O comando `/pteam-featured` está temporariamente desativado enquanto não houver uma aba de featured teams para a Regulation M-C.

Arquivos principais

- [src/index.js](src/index.js#L1) — inicializa e autentica o bot
- [src/deploy-commands.js](src/deploy-commands.js#L1) — registra os comandos na guild
