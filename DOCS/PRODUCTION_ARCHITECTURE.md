# Arquitetura de Produção - Mini Assistant

Este documento descreve detalhadamente a infraestrutura de produção, o fluxo de implantação (deploy), o gerenciamento de banco de dados e os comandos operacionais do Mini Assistant.

---

## 1. Infraestrutura Cloud (Google Cloud Platform)

A aplicação está hospedada no **Google Cloud Platform (GCP)**, projetada para ser leve, econômica e altamente disponível.

- **Instância (VM):** Servidor E2-micro localizado na nuvem do Google.
- **Projeto GCP:** `mw-technology-saas`
- **Endereço IP Estático:** `136.113.84.206`
- **Domínio e SSL:** Todo o tráfego de internet passa pelo **Cloudflare**, que atua como proxy reverso, fornecendo proteção DDoS e terminação de SSL (HTTPS) no domínio `api.moduloweb.com.br`. A VM recebe as requisições roteadas de forma segura.

---

## 2. Containerização e Orquestração (Docker)

O ambiente de produção não possui o Node.js instalado diretamente no sistema operacional da VM. Toda a aplicação é orquestrada via **Docker Compose** através do arquivo `docker-compose.production.yml`.

O ambiente é composto por dois containers independentes e um serviço gerenciado externo:

1. **API (Backend) [Docker]:**
   - Roda a aplicação Node.js (Express, Agentes Gemini, Roteamento Web e Telegram).
   - A imagem Docker não é construída na VM. Ela é gerada automaticamente pelo **GitHub Actions** (CI/CD) e enviada para o **GitHub Container Registry (GHCR)**. A VM apenas baixa a imagem pronta e executa, economizando memória e CPU.
2. **Redis [Docker]:**
   - Imagem leve baseada em Alpine.
   - Utilizado para cache rápido, controle de sessões, mensageria e filas de tarefas (BullMQ).
3. **Banco de Dados (Supabase PostgreSQL + pgvector) [Gerenciado Externamente]:**
   - Banco de dados PostgreSQL gerenciado na nuvem (Supabase).
   - Armazena as configurações SaaS (clientes), memória de longo prazo do chat, e os vetores (Embeddings de 768 dimensões gerados pelo `gemini-embedding-2`) para o RAG.
   - A VM conecta-se remotamente por meio do pooler de conexões do Supabase em modo Session (porta 5432).

---

## 3. Gestão de Variáveis de Ambiente e Segurança

Na VM, a configuração da aplicação reside no arquivo **`.env.production`**. Este arquivo nunca é enviado ao GitHub (ignorado no `.gitignore`) por conter chaves críticas:

- **`GEMINI_API_KEY`:** Chave gratuita ou paga do Google AI Studio. (Dica: Se houver problemas de faturamento 429 ou alta demanda 503, esta chave é atualizada aqui).
- **`DATABASE_URL`:** URL de conexão da API com o banco de dados remoto do Supabase (porta 5432).
- **`ENCRYPTION_KEY`:** Chave mestra AES-256-GCM para criptografar tokens do WhatsApp/Telegram diretamente no banco de dados.
- **`TELEGRAM_BOT_TOKEN`:** Token de comunicação com os webhooks do Telegram.

Para editar este arquivo na VM:
```bash
nano .env.production
```
*(Lembre-se de salvar com `Ctrl+O`, `Enter`, e sair com `Ctrl+X`).*

---

## 4. O "Ritual de Ouro": Como Atualizar a Aplicação

Sempre que uma nova funcionalidade for finalizada e o código enviado ao GitHub (`git push`), o GitHub Actions compilará uma nova imagem. 
Para aplicar a atualização na VM sem deixar rastros de versões antigas (evitando falta de disco), utilize o bloco de comandos abaixo:

```bash
# 1. Derruba a versão atual da API
sudo docker compose -f docker-compose.production.yml down api

# 2. Limpa completamente imagens velhas e em cache (Libera espaço em disco!)
sudo docker system prune -a -f

# 3. Baixa a versão mais recente do GitHub Registry e sobe a aplicação
sudo docker compose -f docker-compose.production.yml up -d
```

---

## 5. Manutenção de Banco de Dados e Regras de Negócio

O sistema foi desenhado para gerenciar as "personas" e configurações da IA via Banco de Dados (não via código). Isso significa que, ao alterar o comportamento de um agente ativo (como a persona **Keiko** usada nos testes da MW Technology, incluindo suas instruções de sistema ou redirecionamentos `[REDIRECT:URL]`), o banco de produção precisa ser atualizado.

### Atualizando a Personalidade (Setup Manual)
Existe um script sagrado em `scripts/setup-manual-client.ts`. Ele é responsável por inserir o `Client` correto, atualizar os prompts do sistema e registrar configurações do RAG.

Sempre que este arquivo for modificado, após o deploy (item 4), você deve executá-lo diretamente **dentro do container em produção**:

```bash
sudo docker compose -f docker-compose.production.yml exec api npx tsx scripts/setup-manual-client.ts
```

### Lidando com Erros e Fallbacks
O backend foi blindado contra indisponibilidades. Se:
1. A API Key do Gemini esgotar o saldo (Erro 429)
2. Os servidores do Google sofrerem sobrecarga global (Erro 503)
3. O container do PostgreSQL for apagado ou corrompido (`P2003 Foreign Key Error`)

A arquitetura intercepta a falha e utiliza um **Sistema de Fallback**, entregando graciosamente uma mensagem padrão predefinida (como a do agente de testes: *"Oi, aqui é a Keiko. Estou com alguns problemas em meu servidor, mas já estamos tentando resolver..."*), protegendo o cliente final de mensagens de erro técnicas ou tela em branco.

---

## 6. Comandos de Sobrevivência (Troubleshooting)

Se o sistema apresentar instabilidades ou comportamentos estranhos, utilize os comandos abaixo no terminal da VM:

- **Ver logs em tempo real da API:**
  ```bash
  sudo docker compose -f docker-compose.production.yml logs -f api
  ```
- **Listar os containers ativos (verificar o "Status" e se estão 'Up'):**
  ```bash
  sudo docker ps
  ```
- **Reiniciar os contêineres locais (API + Redis):**
  ```bash
  sudo docker compose -f docker-compose.production.yml down
  sudo docker compose -f docker-compose.production.yml up -d
  ```
