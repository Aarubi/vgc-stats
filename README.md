# VGC Stats

Bot em JavaScript para Discord que consulta a PokéAPI e exibe informações de Pokémon em cards. Também reúne estatísticas de VGC e times para consulta.

## Desenvolvimento

Use Node.js 22 ou superior. Instale as dependências com `npm ci` e copie `.env.example` para `.env`.

Preencha `DISCORD_TOKEN`, `CLIENT_ID` e `GUILD_ID` para trabalhar com o servidor de testes. Para usar `/pteam`, preencha também `GOOGLE_SHEETS_API_KEY` e `GOOGLE_SHEET_ID`. Restrinja a chave à API do Google Sheets e proteja o arquivo local com `chmod 600 .env`.

| Comando | Quando usar |
| --- | --- |
| `npm run dev` | Executar localmente com reinício automático ao editar os arquivos carregados pelo bot. |
| `npm run deploy-commands` | Registrar os comandos apenas no servidor de testes definido por `GUILD_ID`. |
| `npm test` | Rodar os testes locais. |
| `npm run audit` | Auditar as dependências usadas em produção. |

## Deploy

Configure uma vez o ambiente `discord-production` em **Settings → Environments** no GitHub. Em **Deployment branches and tags**, permita apenas a branch `main`. Em **Environment secrets**, adicione `DISCORD_TOKEN` com o token do bot de produção. Em **Environment variables**, adicione `CLIENT_ID` com o Application ID do mesmo aplicativo no Portal de Desenvolvedores do Discord.

Quando publicar ou mudar as definições dos comandos, integre a versão em `main` e suba essa mesma revisão no Discloud. Assim que o bot estiver online, abra **Actions → Registrar comandos globais do Discord → Run workflow** e selecione `main`. O workflow é manual, roda os testes e usa `npm run deploy-commands:global` para substituir a lista global de comandos pelos comandos dessa revisão. O registro do servidor de testes continua separado.

## Execução em produção

O bot roda diretamente no Node.js e dispensa uma etapa de build. Na hospedagem, instale as dependências com `npm ci --omit=dev`, configure `DISCORD_TOKEN` e as variáveis do Google Sheets para `/pteam`, e use `npm start` para iniciar o processo. A inicialização conecta o bot ao Discord pelo Gateway. O registro dos comandos é uma etapa separada do deploy.

Na Discloud, cadastre `DISCORD_TOKEN`, `GOOGLE_SHEETS_API_KEY` e `GOOGLE_SHEET_ID` nas variáveis da aplicação. O `discloud.config` define a inicialização do bot a partir de `src/index.js`. O `.discloudignore` exclui arquivos locais de configuração nos envios que respeitam essa lista.

Com a revisão que você vai publicar em `HEAD`, gere o ZIP na raiz do repositório e envie-o em **Commit → Novo commit** no painel do app existente.

```bash
git archive --format=zip --output=vgc-stats.zip HEAD -- discloud.config package.json package-lock.json src/
```

O comando inclui os TXT de contingência em `src/assets` e deixa de fora `.env`, `.npmrc` e `node_modules`. Confira o status do app e os logs depois do envio. [Documentação da Discloud](https://docs.discloud.com/configurations/discloud.config)

Para adicionar o bot a outro servidor, use o link de instalação gerado pelo Portal de Desenvolvedores do Discord.

## Uso

- `/help` — lista todos os comandos disponíveis do bot e uma breve descrição de cada um.
- `/pstats nome:<nome-ou-id>` — consulta um Pokémon na PokeAPI e exibe seu sprite, habilidades, stats base e ranges no nível 50. As páginas seguintes mostram o uso mensal de habilidades, itens, distribuições de pontos, golpes e parceiros na Smogon.
- `/pinfo tipo:<habilidade|item> nome:<nome-ou-id>` — consulta a descrição e os principais dados de uma habilidade ou item na PokéAPI. Prioriza textos em português e usa inglês quando não houver tradução disponível.
- `/pmeta` — exibe o ranking mensal da Smogon com nome, percentual de uso e paginação.
- `/pladder [nome]` — mostra o top 15 do Project Red ou, com um nome como `/pladder nome:Sneasler`, detalha o uso e os sets desse Pokémon.
- `/pteam [pokemon] [rental] [evs]` — sorteia um time da aba `Champions M-C`, com filtros opcionais por Pokémon, rental code e EVs. O resultado permite sortear outro time mantendo os filtros ou abrir o Pokepaste.

O comando `/pteam-featured` está temporariamente desativado enquanto não houver uma aba de featured teams para a Regulation M-C.

Arquivos principais

- [src/index.js](src/index.js#L1) — inicializa e autentica o bot.
- [scripts/deploy-commands.js](scripts/deploy-commands.js#L1) — registra os comandos no servidor de testes ou globalmente.
- [scripts/sync-smogon.js](scripts/sync-smogon.js#L1) — baixa e valida os relatórios mensais para o GitHub Actions.

## Dados de VGC

- `/pmeta` e as páginas de uso de `/pstats` mostram o relatório mensal de [Smogon University / Pokémon Showdown](https://www.smogon.com/stats/) para Champions VGC Bo3 (1760). O rodapé identifica o mês e o regulamento.
- `/pladder` mostra os 15 Pokémon mais usados na amostra recente de [Project Red Data](https://github.com/jamesrcode/project-red-data). `/pladder nome:Sneasler` detalha uso, itens, habilidades, golpes, distribuições de pontos e parceiros. A fonte reúne replays públicos (Bo1 e Bo3) e sinaliza estimativas e dados de sets complementados pela Smogon.
- O bot busca as duas fontes só quando solicitado e reutiliza os dados em memória. A Smogon tem cache de 6 h e usa os TXT em `src/assets` quando o relatório remoto está indisponível e ainda não há uma cópia em memória. Project Red tem cache de 1 h. Uma falha de atualização preserva a última cópia carregada em memória.

### Atualização automática da Smogon

A integração do workflow em `main` dispara a primeira execução. Para rodar novamente, abra **Actions → Atualizar dados da Smogon → Run workflow**. Deixe o mês em branco para usar o último mês encerrado em UTC. O agendamento diário repete a consulta até o par de relatórios estar disponível. O workflow valida o ranking e os movesets antes de publicar `usage.txt`, `moveset.txt` e `smogon.json` juntos na branch de dados `meta-data`. Use o mês explicitamente para baixar novamente o mês publicado. Em caso de falha, a branch mantém a última publicação.

Quando o regulamento mudar, configure `SMOGON_FORMAT` em **Settings → Secrets and variables → Actions → Variables** com o slug Champions VGC Bo3 publicado pela Smogon. O valor inicial é `gen9championsvgc2026regmcbo3`. A atualização mensal usa apenas o `GITHUB_TOKEN` do workflow. Depois de implantar esta versão no Discloud, os novos relatórios chegam sem novo deploy.
