# PLANO OFICIAL DE REESTRUTURAÇÃO DA BASE DE CONHECIMENTO DA MW TECHNOLOGY

## INSTRUÇÃO AO AGENTE RESPONSÁVEL PELO NOTION

Você está autorizado a reorganizar, renomear, dividir e atualizar a documentação estratégica e técnica da MW Technology conforme as instruções deste documento.

O objetivo não é apagar conhecimento existente.

O objetivo é:

1. eliminar contradições;
2. estabelecer uma hierarquia documental clara;
3. separar estratégia empresarial de engenharia;
4. separar regras gerais de regras específicas;
5. impedir que agentes de IA interpretem tecnologias específicas como regras universais;
6. preservar todo conhecimento técnico ainda válido;
7. tornar o Notion da MW Technology uma fonte de contexto coerente para humanos e agentes de IA.

Não faça alterações conceituais fora das instruções abaixo.

Quando encontrar informações técnicas úteis que não se encaixem exatamente na nova estrutura, preserve o conteúdo e mova-o para a seção ou documento mais apropriado.

---

# PARTE 1 — HIERARQUIA OFICIAL DA DOCUMENTAÇÃO

A partir desta reorganização, a documentação oficial da MW Technology deverá obedecer à seguinte hierarquia:

MW TECHNOLOGY
│
├── 00 — Índice e Hierarquia Documental
│
├── 01 — Documento Mestre da MW Technology
│
├── 02 — Padrão de Produtos e Engenharia
│
├── 03 — Metodologia de Desenvolvimento SDD
│
├── 04 — Segurança de Software
│
├── 05 — Automação de Engenharia MW
│
├── 06 — Stack Tecnológica Preferencial
│
└── 10 — Produtos
       │
       ├── [Produto 1]
       │    ├── Documento Mestre
       │    ├── Arquitetura
       │    ├── Especificações
       │    └── Roadmap
       │
       └── [Produto futuro]

---

# PARTE 2 — REGRA DE AUTORIDADE

A seguinte hierarquia deve ser considerada obrigatória:

01 — Documento Mestre da MW Technology

↓

02 — Padrão de Produtos e Engenharia

↓

03 / 04 / 05 / 06 — Documentos especializados

↓

Documento Mestre de cada Produto

↓

Arquitetura específica de cada Produto

↓

Constitution / architecture-rules do repositório

↓

Especificações de funcionalidades

↓

Tasks e implementação

Quando dois documentos entrarem em conflito, prevalece o documento localizado acima na hierarquia.

---

# PARTE 3 — CABEÇALHO PADRÃO

Adicionar ao início dos documentos 02, 03, 04, 05, 06 e documentos específicos de produtos:

> ## Hierarquia Documental
>
> Este documento está subordinado ao **01 — Documento Mestre da MW Technology**.
>
> Também deve respeitar o **02 — Padrão de Produtos e Engenharia**, quando aplicável.
>
> Em caso de conflito entre este documento e uma diretriz de nível superior, prevalece a diretriz de nível superior.
>
> As regras contidas aqui se aplicam exclusivamente ao domínio deste documento e não devem ser interpretadas como definição geral da estratégia empresarial da MW Technology.

Nos documentos específicos de produto, acrescentar:

> As regras deste produto também estão subordinadas aos padrões corporativos de Engenharia, Segurança e Desenvolvimento da MW Technology.

---

# PARTE 4 — CRIAR O DOCUMENTO 00

Criar:

# 00 — ÍNDICE E HIERARQUIA DOCUMENTAL

Esse documento deverá explicar resumidamente a função de cada documento.

Utilizar a seguinte definição:

## 01 — Documento Mestre da MW Technology

Define:

- identidade da empresa;
- estratégia;
- seleção de mercados;
- criação de produtos;
- validação;
- caixa;
- propriedade intelectual;
- modelos de negócio;
- critérios de investimento.

Pergunta respondida:

> "Como a MW pensa e toma decisões?"

---

## 02 — Padrão de Produtos e Engenharia

Define:

- princípios de arquitetura;
- customer-hosted;
- configuração;
- portabilidade;
- deployment;
- bancos;
- storage;
- containers;
- versionamento;
- backup;
- atualização;
- observabilidade;
- licenciamento.

Pergunta respondida:

> "Depois que decidimos criar um produto, quais características ele deve possuir para se tornar um produto profissional da MW?"

---

## 03 — Metodologia de Desenvolvimento SDD

Define:

- Spec-Driven Development;
- Spec Kit;
- constitution;
- specify;
- clarify;
- plan;
- tasks;
- analyze;
- checklist;
- implement;
- relação entre especificação e código.

Pergunta respondida:

> "Qual processo utilizamos para transformar requisitos aprovados em software?"

---

## 04 — Segurança de Software

Define:

- autenticação;
- autorização;
- validação;
- IDOR;
- rate limiting;
- CORS;
- secrets;
- auditoria;
- dependências;
- controles de segurança.

Pergunta respondida:

> "Quais controles mínimos de segurança o software MW deve possuir?"

---

## 05 — Automação de Engenharia MW

Define:

- Code Review com IA;
- CI/CD;
- automações internas;
- agentes de engenharia;
- self-healing;
- MCP;
- triagem automática de bugs;
- criação automática de Pull Requests.

Pergunta respondida:

> "Como a MW utiliza automação e agentes para aumentar sua capacidade de engenharia?"

---

## 06 — Stack Tecnológica Preferencial

Define:

- tecnologias preferenciais;
- frameworks;
- bibliotecas;
- padrões de frontend;
- padrões de backend;
- banco;
- filas;
- ferramentas.

Pergunta respondida:

> "Quais tecnologias a MW prefere utilizar quando não existe motivo para escolher outra?"

---

## 10 — Produtos

Cada produto deverá possuir sua própria documentação.

Pergunta respondida:

> "O que exatamente estamos construindo e vendendo neste produto?"

---

# PARTE 5 — DOCUMENTO ANTIGO DE DIRETRIZES PARA ESTRUTURAÇÃO DE PROJETOS

O documento antigo chamado:

**Diretrizes Oficiais para Estruturação de Projetos da MW Technology**

não deve continuar como documento mestre.

Renomear para:

**LEGADO — Diretrizes Antigas de Produtos e Licenciamento**

Adicionar no topo:

> ⚠️ DOCUMENTO LEGADO
>
> Este documento pertence a uma fase anterior da estratégia da MW Technology.
>
> Ele é mantido apenas como histórico e fonte de referências técnicas.
>
> Não deve ser utilizado por agentes de IA como diretriz estratégica atual.
>
> Para decisões atuais, consultar:
>
> 01 — Documento Mestre da MW Technology  
> 02 — Padrão de Produtos e Engenharia

Não apagar o documento.

---

# PARTE 6 — REESTRUTURAÇÃO DO DOCUMENTO ATUAL 06

Documento atual:

**06 — SDD & Arquitetura Multi-Agentes**

Esse documento mistura assuntos que agora pertencem a três documentos diferentes.

Ele deve ser dividido.

---

# AÇÃO 6.1 — CRIAR O NOVO DOCUMENTO 03

Criar:

# 03 — METODOLOGIA DE DESENVOLVIMENTO SDD

Mover para ele todo o conteúdo referente a:

- Spec-Driven Development;
- instalação do specify-cli;
- atualização do Spec Kit;
- specify init;
- constitution;
- /speckit.specify;
- /speckit.clarify;
- /speckit.plan;
- /speckit.tasks;
- /speckit.taskstoissues;
- /speckit.analyze;
- /speckit.checklist;
- /speckit.implement;
- princípios de especificar antes de implementar.

Preservar os comandos técnicos atuais.

Remover desse novo documento:

- posicionamento comercial da MW;
- definição da MW como "fábrica de software";
- stack tecnológica;
- infraestrutura de multiagentes;
- definições gerais sobre o negócio.

---

# AÇÃO 6.2 — REMOVER DEFINIÇÃO EMPRESARIAL DO DOCUMENTO ANTIGO 06

Não manter como regra de engenharia frases equivalentes a:

> "A MW Technology não vende sites ou sistemas. Nós construímos Fábricas de Software e Ecossistemas de IA Autônomos."

Esse tipo de definição pertence exclusivamente ao Documento Mestre da MW.

A estratégia oficial atual deverá ser obtida do documento 01.

---

# AÇÃO 6.3 — MOVER A STACK PARA O DOCUMENTO 06 NOVO

Criar:

# 06 — STACK TECNOLÓGICA PREFERENCIAL DA MW TECHNOLOGY

Mover para esse documento as referências a:

Frontend:

- React;
- Vite;
- Next.js;
- TypeScript;
- Tailwind;
- shadcn/ui;
- TanStack Query;
- react-hook-form;
- Zod.

Backend:

- Node.js;
- Express;
- Fastify;
- NestJS quando aplicável.

Dados:

- PostgreSQL;
- Prisma;
- Drizzle;
- pgvector.

Processamento:

- Redis;
- BullMQ.

Segurança:

- AES-256-GCM para segredos persistidos quando aplicável.

---

# AÇÃO 6.4 — ALTERAR "INEGOCIÁVEL"

Não utilizar mais expressões como:

- "Stack MW inegociável";
- "obrigatório em todos os produtos";
- "nunca utilizar outra tecnologia";

quando estiver se referindo apenas à escolha de framework ou biblioteca.

Utilizar:

> **Stack Tecnológica Preferencial**

Adicionar:

> A stack descrita neste documento representa a escolha padrão da MW Technology por motivo de experiência acumulada, velocidade de desenvolvimento, reutilização de componentes e capacidade de manutenção.
>
> Ela não é uma restrição absoluta.
>
> Tecnologias diferentes podem ser adotadas quando existir justificativa técnica, econômica, operacional, de infraestrutura, segurança ou requisito específico do comprador/produto.
>
> Toda exceção relevante deve ser registrada na documentação arquitetural do produto.

---

# PARTE 7 — REESTRUTURAÇÃO DO DOCUMENTO ATUAL 05

Documento atual:

**05 — Diretrizes Estritas de Segurança para Desenvolvimento de APIs**

Esse documento será preservado quase integralmente.

Renomear para:

# 04 — SEGURANÇA DE SOFTWARE — MW TECHNOLOGY

Preservar as regras atuais referentes a:

- JWT;
- refresh tokens;
- rate limiting;
- IDOR;
- validação de entrada;
- CORS;
- logs de auditoria;
- gestão de segredos;
- dependências;
- proteção de APIs.

---

# AÇÃO 7.1 — GENERALIZAR BIBLIOTECAS

Quando uma regra estiver vinculada a uma biblioteca específica, separar:

CONTROLE DE SEGURANÇA

de:

IMPLEMENTAÇÃO PREFERENCIAL.

Exemplo:

Em vez de:

> "Helmet é sempre obrigatório."

Utilizar:

> "Headers HTTP de segurança adequados ao framework são obrigatórios."

Em seguida:

> Implementação preferencial:
>
> Express → helmet  
> Fastify → @fastify/helmet  
> Outros frameworks → equivalente homologado.

---

# AÇÃO 7.2 — PRESERVAR REGRAS FORTES

Não enfraquecer princípios como:

- ausência de secrets no código;
- validação de entrada;
- verificação de autorização;
- rate limiting;
- auditoria;
- dependências seguras.

Esses são padrões corporativos de segurança.

---

# PARTE 8 — REESTRUTURAÇÃO DO DOCUMENTO ATUAL 04

Documento atual:

**04 — Esteira Auto-Replicável de Code Review e Ecossistema de Auto-Cura via Multi-Agentes**

Este é o documento que exige maior reorganização.

Ele NÃO deve ser apagado.

Renomear para:

# 05 — AUTOMAÇÃO DE ENGENHARIA MW — CODE REVIEW, CI/CD E SELF-HEALING

---

# AÇÃO 8.1 — REMOVER "FONTE ÚNICA DA VERDADE"

Remover qualquer definição equivalente a:

> "Este documento é a Fonte Única da Verdade da MW Technology."

Substituir por:

> Este documento é a referência técnica oficial da MW Technology para automação da engenharia, incluindo Code Review automatizado, CI/CD assistido por IA, triagem de incidentes e mecanismos de Self-Healing.
>
> Ele não define a estratégia empresarial nem a arquitetura obrigatória de todos os produtos MW.

---

# AÇÃO 8.2 — SEPARAR INFRAESTRUTURA INTERNA DA MW DE INFRAESTRUTURA DE PRODUTO

Criar logo no início uma seção:

# Escopo de Infraestrutura

Inserir:

> A infraestrutura descrita neste documento refere-se principalmente à **fábrica interna de engenharia da MW Technology**.
>
> A utilização de Google Cloud Platform, Vertex AI, GitHub Actions, Sentry ou outros provedores neste documento não significa que produtos comercializados pela MW devam obrigatoriamente utilizar os mesmos fornecedores.
>
> Produtos customer-hosted devem seguir o Padrão de Produtos e Engenharia e suas próprias decisões arquiteturais.

---

# AÇÃO 8.3 — MANTER GCP COMO IMPLEMENTAÇÃO INTERNA

Preservar a arquitetura atual envolvendo:

- Google Cloud;
- Workload Identity Federation;
- OIDC;
- Vertex AI;
- GitHub Actions;
- service accounts;
- pipelines;
- revisão automática.

Mas classificá-la como:

> **Implementação Atual/Preferencial da Infraestrutura Interna de Engenharia MW**

e não como arquitetura universal dos produtos.

---

# AÇÃO 8.4 — CORRIGIR SUPABASE/NEON COMO REGRA UNIVERSAL

Onde o documento determinar:

> PostgreSQL gerenciado via Supabase ou Neon

alterar para:

> **Banco padrão: PostgreSQL.**
>
> Para projetos internos, protótipos e ambientes nos quais a MW controla a infraestrutura, Supabase e Neon podem ser provedores preferenciais.
>
> Produtos customer-hosted devem conectar-se através de configuração agnóstica sempre que possível, como DATABASE_URL, permitindo outros provedores PostgreSQL homologados.

---

# AÇÃO 8.5 — PRESERVAR `.ai/architecture-rules.md`

Manter o princípio de que cada repositório possui seu próprio:

`.ai/architecture-rules.md`

ou equivalente.

Esse arquivo deverá conter decisões locais, como:

- framework específico;
- banco;
- padrões de componentes;
- particularidades de performance;
- integrações;
- exceções à stack padrão.

Adicionar:

> O arquivo local de arquitetura nunca poderá contrariar regras corporativas de nível superior sem decisão arquitetural registrada.

---

# AÇÃO 8.6 — PRESERVAR CODE REVIEW AUTOMATIZADO

Manter a arquitetura conceitual:

Pull Request

↓

Extração do Diff

↓

IA analisa alterações

↓

Consulta regras arquiteturais

↓

Identifica desvios

↓

Publica comentários no Pull Request

O código técnico existente pode ser preservado como implementação de referência.

---

# AÇÃO 8.7 — PRESERVAR SELF-HEALING COM GATES

Manter a classificação:

L1 — bug simples

L2 — bug médio

L3 — bug complexo

Manter o princípio:

L1/L2 podem ser analisados e corrigidos automaticamente em sandbox.

L3 deve escalar para engenharia humana.

Manter:

IA

↓

cria branch

↓

faz correção

↓

executa testes

↓

abre Pull Request

↓

Code Review

↓

gate humano ou política de aprovação definida

↓

merge/deploy

Não permitir que a documentação interprete Self-Healing como autorização geral para alterações silenciosas diretamente em produção.

---

# AÇÃO 8.8 — NÃO TRATAR ACP COMO VERDADE CORPORATIVA UNIVERSAL

Caso o documento utilize um protocolo específico de comunicação entre agentes chamado ACP:

manter como arquitetura adotada ou planejada naquela automação.

Não apresentá-lo como requisito universal para qualquer sistema multiagente construído pela MW.

---

# PARTE 9 — CRIAR O DOCUMENTO 06 DE STACK

O novo:

# 06 — STACK TECNOLÓGICA PREFERENCIAL

deverá conter apenas escolhas tecnológicas.

Estruturar como:

## Frontend

Tecnologias preferenciais.

## Backend

Tecnologias preferenciais.

## Banco de Dados

Tecnologias preferenciais.

## Filas e Cache

Tecnologias preferenciais.

## IA

Provedores e padrões preferenciais.

## Infraestrutura de Desenvolvimento

Ferramentas utilizadas pela MW.

## Observabilidade

Ferramentas preferenciais.

## Testes

Ferramentas preferenciais.

## Exceções

Como registrar quando um produto utiliza stack diferente.

Não incluir nesse documento:

- estratégia comercial;
- ICP;
- precificação;
- filosofia empresarial;
- posicionamento da MW;
- regras específicas de um único produto.

---

# PARTE 10 — PRODUTOS

Criar a página:

# 10 — PRODUTOS

Dentro dela, cada produto deverá possuir uma pasta/página própria.

Estrutura:

PRODUTO
│
├── 01 — Documento Mestre do Produto
├── 02 — Arquitetura
├── 03 — Roadmap
├── 04 — Validação Comercial
├── 05 — Unit Economics
├── 06 — Instalação e Deployment
└── 07 — Decisões Arquiteturais

Não criar conteúdo inventado para preencher lacunas.

Se alguma informação ainda não existir, utilizar:

> NÃO DEFINIDO

ou:

> HIPÓTESE A VALIDAR

---

# PARTE 11 — DIFERENCIAR FATO, ROADMAP E IDEIA

Em todos os documentos de produto, informações devem ser classificadas em:

## IMPLEMENTADO

Existe no software atualmente.

## PARCIALMENTE IMPLEMENTADO

Existe, mas ainda não atende ao objetivo completo.

## EM DESENVOLVIMENTO

Está sendo implementado atualmente.

## PLANEJADO

Foi aprovado para roadmap, mas ainda não existe.

## HIPÓTESE / IDEIA

Está sendo considerada, mas ainda não foi aprovada.

Agentes nunca devem falar de funcionalidades planejadas como se já estivessem disponíveis.

---

# PARTE 12 — LINKS ENTRE DOCUMENTOS

Ao final de cada documento, adicionar uma seção:

# Documentos Relacionados

Exemplo para Segurança:

- 01 — Documento Mestre MW Technology
- 02 — Padrão de Produtos e Engenharia
- 03 — Metodologia de Desenvolvimento SDD
- 06 — Stack Tecnológica Preferencial

No Documento de Automação:

- Documento Mestre;
- Engenharia;
- Segurança;
- Stack;
- documentação de testes.

---

# PARTE 13 — NÃO DUPLICAR REGRAS

Quando uma regra já estiver definida em documento superior, documentos inferiores devem referenciar essa regra em vez de copiá-la integralmente.

Exemplo:

Não repetir toda a política de customer-hosted no documento de Self-Healing.

Utilizar:

> "Para regras de infraestrutura customer-hosted, consultar 02 — Padrão de Produtos e Engenharia."

Isso reduz futuras contradições.

---

# PARTE 14 — REGRAS PARA AGENTES DE IA

Todos os documentos relevantes devem orientar agentes a:

1. consultar documentos superiores antes de tomar decisões;
2. não inventar funcionalidades;
3. não assumir que roadmap significa implementação;
4. não transformar tecnologia preferencial em obrigação universal;
5. não alterar estratégia empresarial com base em documento técnico;
6. explicitar hipóteses;
7. respeitar decisões específicas do produto;
8. preservar segurança;
9. priorizar reutilização quando fizer sentido;
10. considerar restrições econômicas e de infraestrutura da MW.

---

# PARTE 15 — ORDEM EXATA DE EXECUÇÃO

Executar as alterações obrigatoriamente nesta sequência.

## PASSO 1

Garantir que exista e esteja atualizado:

**01 — Documento Mestre da MW Technology**

Não modificar sua estratégia sem solicitação explícita.

---

## PASSO 2

Garantir que exista:

**02 — Padrão de Produtos e Engenharia**

Não misturar nele stack detalhada de um único framework.

---

## PASSO 3

Criar:

**00 — Índice e Hierarquia Documental**

Inserir a árvore oficial.

---

## PASSO 4

Renomear o documento antigo de licenciamento para:

**LEGADO — Diretrizes Antigas de Produtos e Licenciamento**

Adicionar aviso de legado.

---

## PASSO 5

Dividir:

**06 — SDD & Arquitetura Multi-Agentes**

em:

**03 — Metodologia de Desenvolvimento SDD**

e partes destinadas a:

**05 — Automação de Engenharia MW**

e:

**06 — Stack Tecnológica Preferencial**

---

## PASSO 6

Renomear:

**05 — Diretrizes Estritas de Segurança para Desenvolvimento de APIs**

para:

**04 — Segurança de Software — MW Technology**

Preservar conteúdo e aplicar somente as generalizações descritas neste plano.

---

## PASSO 7

Renomear:

**04 — Esteira Auto-Replicável de Code Review e Ecossistema de Auto-Cura**

para:

**05 — Automação de Engenharia MW — Code Review, CI/CD e Self-Healing**

Aplicar todas as correções de escopo descritas na Parte 8.

---

## PASSO 8

Criar e consolidar:

**06 — Stack Tecnológica Preferencial**

utilizando conteúdo atualmente espalhado pelos documentos.

---

## PASSO 9

Criar:

**10 — Produtos**

Não mover ainda documentação de produtos sem identificar corretamente qual produto ela descreve.

---

## PASSO 10

Adicionar cabeçalhos de hierarquia a todos os documentos.

---

## PASSO 11

Adicionar links cruzados.

---

## PASSO 12

Realizar auditoria final procurando expressões como:

- "Fonte Única da Verdade";
- "Documento Mestre";
- "inegociável";
- "obrigatório";
- "todo produto";
- "sempre";
- "nunca";

Sempre que essas expressões aparecerem, verificar se realmente pertencem àquele nível da hierarquia.

Não remover automaticamente "sempre" ou "nunca" de regras de segurança genuínas.

---

# PARTE 16 — O QUE NÃO DEVE SER FEITO

NÃO:

- apagar documentação técnica útil;
- inventar novas tecnologias;
- mudar stack sem necessidade;
- remover segurança;
- remover metodologia SDD;
- remover automações;
- reescrever scripts apenas por estética;
- transformar GCP em requisito de produtos;
- transformar Supabase/Neon em requisito universal;
- transformar SaaS em modelo obrigatório;
- transformar customer-hosted em proibição futura de SaaS;
- alterar a estratégia do Documento Mestre;
- apagar histórico empresarial.

---

# PARTE 17 — RESULTADO ESPERADO

Ao final, a documentação deverá permitir que qualquer agente responda corretamente:

## Quem é a MW e como decide?

→ Documento 01

## Como produtos devem ser construídos?

→ Documento 02

## Como desenvolvemos software?

→ Documento 03

## Quais regras de segurança seguimos?

→ Documento 04

## Como automatizamos nossa própria engenharia?

→ Documento 05

## Qual stack normalmente utilizamos?

→ Documento 06

## O que determinado produto faz?

→ Pasta do Produto em 10 — Produtos

Nenhum documento técnico deve se declarar autoridade máxima sobre a estratégia empresarial.

Nenhuma ferramenta específica deve ser interpretada automaticamente como requisito universal.

Nenhuma funcionalidade futura deve ser interpretada como já existente.

---

# PARTE 18 — RELATÓRIO FINAL DO AGENTE

Após realizar as alterações, não encerre simplesmente dizendo que concluiu.

Produza um relatório contendo:

## Documentos criados

[lista]

## Documentos renomeados

[antes → depois]

## Documentos divididos

[lista]

## Conteúdos movidos

[origem → destino]

## Contradições corrigidas

[lista]

## Conteúdos mantidos como legado

[lista]

## Pontos que exigem decisão humana

[lista]

## Estrutura final da base

[árvore completa]

Se algum conteúdo não puder ser classificado com segurança, não o apague.

Mantenha-o no documento original e marque:

> ⚠️ REVISÃO HUMANA NECESSÁRIA

---

# REGRA FINAL

O objetivo desta reorganização não é fazer todos os documentos dizerem a mesma coisa.

O objetivo é fazer cada documento possuir **uma responsabilidade clara**.

A nova arquitetura documental da MW Technology deverá seguir o princípio:

**ESTRATÉGIA DECIDE → ENGENHARIA PADRONIZA → ESPECIALIDADES DETALHAM → PRODUTO ESPECIFICA → PROJETO IMPLEMENTA.**