# VGC Pokedex Bot

Bot em JavaScript para Discord que consulta a PokeAPI e exibe um card em embed com informações do Pokémon.

Setup rápido

1. Instale dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto com as variáveis `DISCORD_TOKEN`, `CLIENT_ID` e `GUILD_ID`.

3. Registre o comando na sua guild (teste):

```bash
npm run deploy-commands
```

4. Rode o bot:

```bash
npm start
```

Uso

- Use `/pstats nome:<nome-ou-id>` no canal da guild onde o comando foi registrado.
- O bot responde com um embed contendo sprite, habilidades e stats.

Arquivos principais

- [src/index.js](src/index.js#L1) — bot e handler do comando
- [src/deploy-commands.js](src/deploy-commands.js#L1) — registra o comando `/pstats` na guild
