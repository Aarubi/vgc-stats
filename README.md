# VGC Pokedex Bot

Bot em JavaScript para Discord que consulta a PokeAPI e exibe um card em embed com informações do Pokémon.

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

Quando a versão do bot que atende aos comandos estiver pronta em produção, use `npm run deploy-commands:global` no ambiente de deploy. O script utiliza o `DISCORD_TOKEN` e o `CLIENT_ID` da aplicação de produção e disponibiliza os comandos nos servidores que a instalaram.

Execute o registro global quando publicar ou atualizar as definições de comandos. Ele substitui a lista de comandos globais do app sem alterar o registro do servidor de testes.

## Execução em produção

O bot roda diretamente no Node.js e dispensa uma etapa de build. Na hospedagem, instale as dependências com `npm ci --omit=dev`, configure `DISCORD_TOKEN` e as variáveis do Google Sheets para `/pteam`, e use `npm start` para iniciar o processo. A inicialização conecta o bot ao Discord pelo Gateway. O registro dos comandos é uma etapa separada do deploy.

Na Discloud, cadastre as credenciais nas variáveis da aplicação no painel. O `.discloudignore` exclui arquivos locais de configuração nos envios que respeitam essa lista. Se montar o ZIP manualmente, selecione apenas os arquivos de execução e confira que arquivos `.env` e `.npmrc` ficaram fora.

Para adicionar o bot a outro servidor, use o link de instalação gerado pelo Portal de Desenvolvedores do Discord.

## Uso

- `/help` — lista todos os comandos disponíveis do bot e uma breve descrição de cada um.
- `/pstats nome:<nome-ou-id>` — consulta um Pokémon na PokeAPI e exibe seu sprite, habilidades, stats base e ranges no nível 50. As páginas seguintes mostram o uso de Abilities, Items, Spreads, Moves e Teammates.
- `/pinfo tipo:<habilidade|item> nome:<nome-ou-id>` — consulta a descrição e os principais dados de uma habilidade ou item na PokéAPI. Prioriza textos em português e usa inglês quando não houver tradução disponível.
- `/pmeta` — exibe o usage mensal dos Pokémon a partir do arquivo em `src/assets`, com rank, nome, percentual de Usage e paginação.
- `/pteam [pokemon] [rental] [evs]` — sorteia um time da aba `Champions M-C`, com filtros opcionais por Pokémon, rental code e EVs. O resultado permite sortear outro time mantendo os filtros ou abrir o Pokepaste.

O comando `/pteam-featured` está temporariamente desativado enquanto não houver uma aba de featured teams para a Regulation M-C.

Arquivos principais

- [src/index.js](src/index.js#L1) — inicializa e autentica o bot
- [scripts/deploy-commands.js](scripts/deploy-commands.js#L1) — registra os comandos no servidor de testes ou globalmente


## Dados de VGC

- `/pmeta` e as páginas de uso de `/pstats` mostram o relatório mensal de [Smogon University / Pokémon Showdown](https://www.smogon.com/stats/) para Champions VGC Bo3 (1760). O rodapé identifica o mês e o regulamento.
- `/pladder` mostra os 15 Pokémon mais usados na amostra recente de [Project Red Data](https://github.com/jamesrcode/project-red-data). `/pladder nome:Sneasler` detalha uso, itens, habilidades, golpes, distribuições de pontos e parceiros. A fonte reúne replays públicos (Bo1 e Bo3) e sinaliza estimativas e dados de sets complementados pela Smogon.
- O bot busca as duas fontes só quando solicitado e reutiliza os dados em memória. A Smogon tem cache de 6 h e usa os TXT em `src/assets` como contingência no primeiro acesso. Project Red tem cache de 1 h. Uma falha de atualização preserva a última cópia carregada em memória.

### Atualização automática da Smogon

A integração do workflow em `main` dispara a primeira execução. Para rodar novamente, abra **Actions → Atualizar dados da Smogon → Run workflow**. Deixe o mês em branco para usar o último mês encerrado em UTC. O agendamento diário repete a consulta até o par de relatórios estar disponível. O workflow valida o ranking e os movesets antes de publicar `usage.txt`, `moveset.txt` e `smogon.json` juntos na branch de dados `meta-data`. Use o mês explicitamente para baixar novamente o mês publicado. Em caso de falha, a branch mantém a última publicação.

Quando o regulamento mudar, configure `SMOGON_FORMAT` em **Settings → Secrets and variables → Actions → Variables** com o slug Champions VGC Bo3 publicado pela Smogon. O valor inicial é `gen9championsvgc2026regmcbo3`. A atualização mensal usa apenas o `GITHUB_TOKEN` do workflow. Depois de implantar esta versão no Discloud, os dados novos chegam sem novo deploy. Registre `/pladder` junto com os comandos existentes após implantar o código compatível.
