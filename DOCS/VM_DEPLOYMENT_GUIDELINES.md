# Diretrizes de Deploy e Operação na Máquina Virtual (VM)

**REGRA DE OURO (NUNCA ESQUECER):**
A Máquina Virtual (VM) de produção no Google Cloud **NÃO POSSUI UM REPOSITÓRIO GIT LOCAL**.
Portanto, o comando `git pull` **NUNCA DEVE SER SUGERIDO OU UTILIZADO** na VM.

## Arquitetura de Deploy
A VM roda exclusivamente baseada em imagens Docker hospedadas no GitHub Container Registry (GHCR). O código fonte não reside na VM.

## Fluxo Correto de Atualização de Código na Produção
Quando qualquer código for alterado (como `scripts/setup-manual-client.ts` ou arquivos em `src/`), siga EXATAMENTE este fluxo:

1. **No Ambiente de Desenvolvimento (Computador Local / IA):**
   - Fazer as alterações no código.
   - Fazer o commit e push para o GitHub (`git add . && git commit -m "..." && git push`).

2. **No GitHub (Automático):**
   - O GitHub Actions (`docker-build.yml`) irá capturar o push e realizar o build da nova imagem Docker, publicando em `ghcr.io/claudiojas/mini-assistant:latest`.
   - Aguarde o build finalizar (geralmente de 2 a 3 minutos).

3. **Na Máquina Virtual (VM de Produção):**
   - Fazer o pull da nova imagem Docker gerada:
     ```bash
     sudo docker compose -f docker-compose.production.yml pull
     ```
   - Reiniciar os containers para aplicar o novo código:
     ```bash
     sudo docker compose -f docker-compose.production.yml up -d
     ```
   - (Opcional) Executar scripts ou migrações necessárias DENTRO do container atualizado:
     ```bash
     sudo docker compose -f docker-compose.production.yml exec api npx tsx scripts/nome-do-script.ts
     ```

## Acesso Rápido ao Banco de Dados (Sem alterar código)
Se precisar extrair ou editar um dado pontual no banco de dados sem passar por um deploy de Docker, utilize o Postgres diretamente no container:
```bash
sudo docker compose -f docker-compose.production.yml exec pg psql -U <usuario> -d <banco> -c "QUERY_SQL_AQUI;"
```
