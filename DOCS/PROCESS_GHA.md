# Processo de Deploy com GitHub Actions (GHCR)

Este documento descreve o fluxo para atualizar a aplicação na máquina virtual (GCP) utilizando a imagem Docker pré-compilada no GitHub Container Registry (GHCR). 
Com essa arquitetura, a VM não precisa gastar memória (RAM) ou processamento (CPU) para compilar (`npm install` e `npm run build`) o projeto.

## 1. O Fluxo de Atualização no Código (Sua Máquina Local)

Você não precisa fazer nada diferente na sua máquina para subir as atualizações, o fluxo continua o mesmo:
1. Faça as modificações no código da aplicação.
2. Comite as alterações: `git commit -m "sua alteracao"`.
3. Envie para o GitHub: `git push origin main`.

👉 **O que acontece por trás das cortinas?**
O GitHub Actions "escuta" o seu `git push`, inicia uma máquina virtual super potente lá no GitHub, compila seu código, cria a imagem Docker e salva ela de forma privada no **GitHub Container Registry (GHCR)**.

---

## 2. O Fluxo de Atualização na VM do GCP (Deploy)

Quando o GitHub Actions terminar de rodar (bolinha verde no GitHub), siga este roteiro na sua máquina virtual (via SSH no navegador):

### Passo 2.1: Autenticação no GitHub (Apenas na primeira vez ou se o token expirar)
Para baixar a imagem privada, sua VM precisa se autenticar no registro de containers do GitHub.

1. Se precisar de um token, vá no GitHub: `Settings` -> `Developer settings` -> `Personal access tokens` -> `Tokens (classic)` -> `Generate new token (classic)`. Marque a opção **`read:packages`**. Copie o token (`ghp_...`).
2. No terminal da VM, execute:
   ```bash
   sudo docker login ghcr.io -u SEU_USUARIO_GITHUB
   ```
3. Cole o token (`ghp_...`) quando pedir o `Password:`. Deverá aparecer a mensagem **`Login Succeeded`**.

### Passo 2.2: Obter/Atualizar o Arquivo docker-compose.production.yml
Como não há código clonado diretamente na VM (rodamos apenas a imagem docker e o Redis), caso haja alguma alteração estrutural no arquivo `docker-compose.production.yml`, você pode atualizá-lo fazendo o download direto ou editando-o manualmente:
```bash
# Caso precise puxar a versão atualizada do repositório via cURL:
curl -H "Authorization: token GHP_TOKEN" -H "Accept: application/vnd.github.v3.raw" -L "https://raw.githubusercontent.com/claudiojas/mini-assistant/main/docker-compose.production.yml" -o docker-compose.production.yml
```

### Passo 2.3: Baixar a Imagem Pronta
Peça ao Docker para baixar a imagem novinha que o GitHub preparou para você. Esse passo é muito rápido e não trava a máquina:
```bash
sudo docker compose -f docker-compose.production.yml pull
```

### Passo 2.4: Subir os Contêineres
Inicie a aplicação com a nova versão:
```bash
sudo docker compose -f docker-compose.production.yml up -d
```
O Docker irá reiniciar apenas os contêineres que sofreram alteração (sua `api`), mantendo o banco de dados e a fila intactos.

---

## Resumo dos Comandos Rápidos na VM
Com as credenciais salvas e o arquivo `docker-compose.production.yml` em dia na VM, basta rodar estes comandos para aplicar as novas versões compiladas pela Action:

```bash
sudo docker compose -f docker-compose.production.yml pull
sudo docker compose -f docker-compose.production.yml up -d
sudo docker system prune -a -f
```
