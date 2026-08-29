# DOCUMENTO MESTRE DO PRODUTO — [NOME PROVISÓRIO: MINI-ASSISTANT]

**Empresa proprietária:** MW Technology  
**Produto:** Mini-Assistant — nome provisório  
**Tipo:** Plataforma empresarial white-label de agentes de Inteligência Artificial  
**Modelo prioritário atual:** Licenciamento + implantação customer-hosted  
**Status:** Produto em desenvolvimento e reposicionamento estratégico  
**Versão deste documento:** 1.0

---

# 1. HIERARQUIA DOCUMENTAL

Este documento está subordinado às diretrizes corporativas da MW Technology.

A ordem de autoridade é:

**01 — Documento Mestre da MW Technology**

↓

**02 — Padrão de Produtos e Engenharia**

↓

**03 — Metodologia de Desenvolvimento SDD**

↓

**04 — Segurança de Software**

↓

**05 — Automação de Engenharia MW**

↓

**06 — Stack Tecnológica Preferencial**

↓

**Este Documento Mestre do Produto**

↓

**Arquitetura específica do produto**

↓

**Constitution / architecture-rules**

↓

**Specs**

↓

**Plans**

↓

**Tasks**

↓

**Implementação**

Em caso de conflito, prevalece a regra do documento de nível superior.

---

# 2. FUNÇÃO DESTE DOCUMENTO

Este documento representa a direção estratégica atual do produto provisoriamente chamado Mini-Assistant.

Ele existe para impedir que:

- decisões antigas continuem sendo implementadas automaticamente;
- funcionalidades planejadas sejam confundidas com funcionalidades existentes;
- o produto continue evoluindo segundo o antigo modelo SaaS;
- agentes de IA desenvolvam features sem compreender o novo comprador;
- decisões técnicas entrem em conflito com o modelo econômico;
- a MW assuma custos de infraestrutura que decidiu não financiar;
- o produto se torne apenas mais um criador genérico de chatbots.

Toda nova feature significativa deve ser avaliada à luz deste documento.

---

# 3. REGRA CRÍTICA DE INTERPRETAÇÃO

A documentação existente do projeto foi produzida durante diferentes fases de sua concepção.

Por isso, ela pode conter referências à estratégia anterior, incluindo:

- Mini-Assistant como SaaS operado diretamente pela MW;
- planos Basic, Pro e Enterprise próprios da MW;
- cobrança mensal direta ao cliente final;
- infraestrutura centralizada;
- crescimento baseado em grande quantidade de pequenos clientes;
- MW assumindo operação de produção;
- billing projetado prioritariamente para cobrar usuários diretos;
- posicionamento como assistente de atendimento.

Essas referências devem ser interpretadas como **contexto histórico ou implementação existente**, e não automaticamente como direção estratégica atual.

Quando houver conflito, este documento prevalece.

---

# 4. RESUMO DA MUDANÇA ESTRATÉGICA

## VISÃO ANTERIOR

A concepção inicial era aproximadamente:

**MW Technology**

↓

opera uma plataforma SaaS

↓

empresa assina o serviço

↓

cria/configura um agente

↓

agente atende seus clientes

Exemplo:

MW

↓

Clínica ABC paga mensalidade

↓

Recepcionista IA

↓

Pacientes

Esse modelo exigiria que a MW progressivamente financiasse e administrasse:

- servidores;
- banco;
- armazenamento;
- Redis;
- processamento;
- tráfego;
- APIs de IA;
- canais;
- suporte;
- operação;
- escalabilidade;

para uma quantidade crescente de pequenos clientes.

Essa NÃO é mais a estratégia prioritária.

---

# 5. NOVA VISÃO DO PRODUTO

O produto passa a ser desenvolvido prioritariamente como:

> **Uma plataforma empresarial white-label que permite a outra empresa criar, operar e comercializar soluções baseadas em agentes de IA sem precisar desenvolver toda a infraestrutura tecnológica do zero.**

A nova cadeia é:

**MW TECHNOLOGY**

↓

desenvolve e licencia a plataforma

↓

**EMPRESA PARCEIRA / COMPRADORA**

↓

implanta com sua marca e infraestrutura

↓

cria soluções verticais de IA

↓

**CLIENTES DO PARCEIRO**

↓

utilizam agentes para suas operações

↓

**USUÁRIOS FINAIS**

---

# 6. O QUE A MW ESTÁ VENDENDO

A MW não está vendendo apenas:

> "um chatbot com inteligência artificial."

Também não está vendendo simplesmente:

> "um criador de agentes."

A MW está fornecendo:

> **a infraestrutura tecnológica pronta para uma empresa construir um negócio ou uma operação de agentes de IA em cima dela.**

Em linguagem comercial:

> **Nós construímos a infraestrutura. O parceiro constrói o negócio em cima dela.**

---

# 7. DEFINIÇÃO OFICIAL DO PRODUTO

Definição curta:

> **Plataforma empresarial white-label de agentes de IA, licenciável e implantável na infraestrutura do comprador.**

Definição ampliada:

> **Uma plataforma white-label que permite a empresas criar, configurar, operar e gerenciar agentes de Inteligência Artificial capazes de conhecer um negócio, conversar com pessoas através de múltiplos canais e executar ações em sistemas externos.**

Definição voltada ao comprador:

> **Uma infraestrutura pronta para uma empresa lançar suas próprias soluções de agentes de IA sem construir toda a tecnologia do zero.**

---

# 8. O PRODUTO NÃO É

O produto não deve ser desenvolvido ou comunicado prioritariamente como:

- chatbot;
- construtor genérico de prompts;
- ChatGPT personalizado;
- ferramenta de atendimento apenas;
- SaaS simples para clínicas;
- SaaS simples para pequenos negócios;
- plataforma onde MW obrigatoriamente hospeda tudo;
- produto dependente de infraestrutura da MW;
- solução limitada a um único nicho;
- simples interface para uma API de LLM.

Essas interpretações reduzem o valor estratégico da plataforma.

---

# 9. ESSÊNCIA FUNCIONAL

Um agente criado através da plataforma deve possuir cinco capacidades fundamentais:

**OBJETIVO**

↓

**CONHECIMENTO**

↓

**RACIOCÍNIO**

↓

**AÇÃO**

↓

**RESULTADO**

O sistema deve permitir definir:

## Objetivo

Quem é o agente?

Qual seu papel?

O que deve conseguir?

## Conhecimento

O que ele sabe sobre a empresa?

Quais documentos, dados, páginas ou informações pode consultar?

## Raciocínio

Como utiliza contexto e modelos de IA para decidir como responder ou agir?

## Ação

Quais sistemas externos pode utilizar?

## Resultado

Que trabalho efetivamente produz para a empresa?

---

# 10. AGENTE NÃO É APENAS CONVERSA

Uma regra conceitual do produto:

> **Agentes devem evoluir de respostas para execução de trabalho.**

Um agente poderá:

- responder;
- consultar conhecimento;
- qualificar;
- registrar;
- agendar;
- consultar sistemas;
- atualizar CRM;
- executar webhooks;
- coletar informações;
- encaminhar;
- acionar pessoas;
- executar processos autorizados.

O valor aumenta quando a IA deixa de apenas conversar e passa a concluir tarefas.

---

# 11. UMA EMPRESA PODE POSSUIR VÁRIOS AGENTES

A unidade conceitual não deve ser:

> empresa = chatbot.

Devemos suportar:

**EMPRESA**

↓

**MÚLTIPLOS AGENTES**

↓

**MÚLTIPLAS FUNÇÕES**

↓

**MÚLTIPLOS CANAIS**

↓

**MÚLTIPLAS INTEGRAÇÕES**

Exemplo:

Empresa X

↓

Agente Comercial

Agente de Atendimento

Agente de Agendamento

Agente de Pós-Venda

Agente de Suporte

Agente Interno

Cada agente pode possuir:

- objetivo;
- persona;
- conhecimento;
- permissões;
- ferramentas;
- canais;
- regras próprias.

---

# 12. PLATAFORMA HORIZONTAL, COMERCIALIZAÇÃO VERTICAL

A tecnologia será horizontal.

Isso significa que a mesma infraestrutura deve ser capaz de atender múltiplos segmentos.

Entretanto, a comercialização realizada pelo parceiro poderá e provavelmente deverá ser vertical.

Exemplo:

A plataforma MW tecnicamente permite criar agentes.

O parceiro não precisa vender:

> "Nossa plataforma cria agentes."

Ele poderá vender:

> "Recepcionista IA para Clínicas"

ou:

> "Corretor IA para Imobiliárias"

ou:

> "Vendedor IA para Concessionárias"

O produto horizontal fornece a infraestrutura.

A solução vertical fornece a proposta comercial.

---

# 13. EXEMPLOS DE VERTICALIZAÇÃO

A mesma plataforma poderá permitir ao parceiro criar soluções como:

## Clínicas

Recepcionista IA:

- responde dúvidas;
- informa serviços;
- consulta conhecimento;
- qualifica;
- agenda;
- transfere para humano.

## Odontologia

Agente de atendimento e agendamento.

## Laboratórios e centros diagnósticos

Agente para atendimento, preparação de exames e agendamento.

## Estética

Recepcionista e qualificadora de leads.

## Imobiliárias

Corretor IA:

- consulta imóveis;
- entende perfil;
- qualifica;
- registra lead;
- agenda visita.

## Concessionárias

Agente comercial:

- consulta veículos;
- responde dúvidas;
- coleta interesse;
- registra CRM;
- agenda test-drive.

## Software / ERP

Agente de suporte:

- consulta documentação;
- responde dúvidas;
- orienta usuários;
- abre ou qualifica chamados.

## Empresas B2B

Agente comercial para qualificação de leads.

## Operações internas

Agentes para acesso e consulta de conhecimento corporativo.

Esses são exemplos de uso.

Não significam que todos constituem mercados validados.

---

# 14. QUEM É O COMPRADOR PRIORITÁRIO

O comprador prioritário NÃO é necessariamente a clínica, imobiliária ou concessionária individual.

O comprador que melhor se encaixa na estratégia atual tende a ser uma empresa intermediária com capacidade de distribuição.

Exemplos:

- empresa de software;
- empresa de ERP;
- integradora;
- software house vertical;
- consultoria tecnológica;
- empresa de automação;
- agência com carteira B2B relevante;
- BPO tecnológico;
- provedor de soluções empresariais.

---

# 15. CARACTERÍSTICAS DO ICP PRIORITÁRIO

O comprador ideal tende a possuir:

- empresa estabelecida;
- carteira de clientes B2B;
- faturamento;
- receita recorrente;
- equipe comercial;
- capacidade de investimento;
- alguma capacidade técnica;
- experiência com cloud ou infraestrutura;
- relacionamento com um mercado específico;
- demanda crescente por IA;
- interesse em criar uma nova linha de receita;
- falta de uma plataforma madura própria de agentes.

O ativo mais importante desse parceiro é:

> **distribuição.**

---

# 16. POR QUE O PARCEIRO COMPRA

O parceiro não deve comparar o produto apenas com:

> "quanto custa escrever esse código?"

A comparação é:

**LICENCIAR DA MW**

versus

**CRIAR INTERNAMENTE**

incluindo:

- meses de desenvolvimento;
- equipe;
- arquitetura;
- IA;
- RAG;
- omnichannel;
- multi-tenancy;
- billing;
- segurança;
- integrações;
- deployment;
- testes;
- manutenção;
- risco;
- experiência necessária;
- time-to-market.

A plataforma deve reduzir drasticamente o tempo e o risco de entrada do parceiro nesse mercado.

---

# 17. PROPOSTA PARA O PARCEIRO

Mensagem conceitual:

> **Em vez de passar meses ou anos construindo toda sua infraestrutura de agentes de IA, licencie uma plataforma pronta, implante-a na sua própria infraestrutura, coloque sua marca e concentre sua empresa naquilo que já sabe fazer: vender para seu mercado.**

---

# 18. MODELO ECONÔMICO PRIORITÁRIO DA MW

Nesta fase, o modelo prioritário é:

**LICENÇA**

+

**IMPLANTAÇÃO**

+

**CUSTOMIZAÇÃO QUANDO NECESSÁRIA**

+

**SUPORTE**

+

**MANUTENÇÃO / ATUALIZAÇÕES**

+

**EVOLUÇÃO**

O formato final dos contratos e preços ainda precisa de validação comercial.

Não assumir preços sem pesquisa e negociação real.

---

# 19. CUSTOMER-HOSTED É REQUISITO CENTRAL

Esta é uma das decisões mais importantes da nova fase.

O produto deve ser capaz de operar em infraestrutura pertencente ou contratada pelo comprador.

Fluxo:

**MW TECHNOLOGY**

↓

desenvolve plataforma

↓

licencia

↓

implanta

↓

**INFRAESTRUTURA DO COMPRADOR**

↓

parceiro opera

↓

clientes do parceiro utilizam

O produto não deve possuir dependência obrigatória de infraestrutura de produção financiada pela MW.

---

# 20. RESPONSABILIDADE DE INFRAESTRUTURA

Por padrão estratégico atual:

## MW TECHNOLOGY

Responsável por:

- desenvolvimento;
- produto;
- propriedade intelectual;
- implantação contratada;
- documentação;
- atualização;
- suporte contratado;
- evolução;
- metodologia de deployment.

## COMPRADOR / PARCEIRO

Preferencialmente responsável financeiramente por:

- VPS;
- VMs;
- cloud;
- banco;
- Redis;
- storage;
- domínio;
- tráfego;
- APIs de IA;
- WhatsApp/Meta;
- Telegram quando houver custo;
- e-mail;
- SMS;
- integrações externas;
- demais serviços utilizados por sua operação.

A divisão definitiva deve constar no contrato.

---

# 21. BYOK — BRING YOUR OWN KEY

O produto deve caminhar para permitir que o parceiro utilize suas próprias credenciais de serviços externos.

Exemplos:

- OpenAI;
- Gemini;
- outros LLMs homologados;
- Meta;
- Google;
- CRM;
- gateways;
- webhooks;
- storage.

Isso significa:

> consumo do parceiro → conta do parceiro → pagamento do parceiro.

Secrets devem ser armazenados e manipulados seguindo as regras corporativas de segurança da MW.

---

# 22. BYOI — BRING YOUR OWN INFRASTRUCTURE

O produto deverá ser compatível, dentro dos ambientes homologados, com infraestrutura fornecida pelo comprador.

Não devemos construir o software de forma rigidamente dependente de:

- um projeto cloud da MW;
- um banco exclusivo da MW;
- um bucket exclusivo da MW;
- uma conta exclusiva da MW;
- uma API key exclusiva da MW.

A aplicação deve receber essas dependências através de configuração.

---

# 23. PORTABILIDADE

O produto deve seguir o princípio:

**MOTOR ≠ COMBUSTÍVEL**

Motor:

- código;
- lógica;
- agentes;
- RAG;
- orquestração;
- ferramentas;
- dashboard.

Combustível:

- banco;
- Redis;
- storage;
- domínio;
- chaves;
- LLM;
- canais;
- credenciais.

A instalação de um novo parceiro deve exigir principalmente configuração, e não reescrita de código.

---

# 24. DEPLOYMENT É PARTE DO PRODUTO

Deploy não deve ser tratado como tarefa artesanal secundária.

Deve existir processo repetível:

**INFRAESTRUTURA**

↓

**CONFIGURAÇÃO**

↓

**INSTALL**

↓

**MIGRATIONS**

↓

**SEED**

↓

**SECRETS**

↓

**INTEGRAÇÕES**

↓

**TESTES**

↓

**HOMOLOGAÇÃO**

↓

**PRODUÇÃO**

↓

**MONITORAMENTO**

O objetivo é reduzir progressivamente o esforço de implantação de cada comprador.

---

# 25. ZERO DEPENDÊNCIA OBRIGATÓRIA DA MW PARA OPERAÇÃO

O produto deve caminhar para conseguir funcionar mesmo que:

- infraestrutura da MW esteja indisponível;
- MW não hospede o sistema;
- banco esteja na conta do cliente;
- APIs estejam na conta do cliente.

Exceções podem existir para:

- licenciamento;
- atualização;
- telemetria autorizada;
- serviços contratados.

Mesmo nesses casos, dependências críticas devem possuir estratégia de tolerância a falha.

---

# 26. LICENCIAMENTO

A MW mantém a propriedade intelectual da plataforma, salvo contrato específico de buyout.

O mecanismo de licença poderá evoluir para suportar:

## Online

Validação periódica.

## Offline

Licença criptograficamente assinada.

## Enterprise

Modelo específico para ambientes restritos.

O produto não deve obrigatoriamente consultar um servidor MW em cada request.

Indisponibilidade temporária do serviço de licenciamento não deve derrubar imediatamente uma instalação legítima.

---

# 27. WHITE-LABEL PASSA A SER CAPACIDADE CENTRAL

White-label não é apenas trocar um logotipo.

O parceiro deve poder apresentar a plataforma como parte de sua própria operação.

Elementos configuráveis devem evoluir para incluir:

- nome da plataforma;
- marca;
- logotipo;
- favicon;
- cores;
- domínio;
- textos;
- e-mails;
- identidade visual;
- páginas públicas relevantes.

Um novo parceiro não deve exigir alterações espalhadas pelo código.

---

# 28. NOVA CAMADA ESTRATÉGICA: PARTNER EDITION

A arquitetura deverá evoluir para reconhecer que existe uma camada acima dos clientes finais.

Conceitualmente:

**MW**

↓

**PARCEIRO**

↓

**CLIENTE DO PARCEIRO / TENANT**

↓

**AGENTES**

↓

**USUÁRIOS FINAIS**

Isso é diferente de um SaaS tradicional simples.

---

# 29. PARTNER CONSOLE — DIREÇÃO ESTRATÉGICA

A plataforma deverá evoluir para possuir capacidades de gestão do parceiro.

Possíveis capacidades:

- visualizar seus clientes;
- criar tenant;
- suspender tenant;
- definir limites;
- acompanhar utilização;
- configurar planos;
- visualizar custos;
- acompanhar consumo;
- visualizar receita;
- administrar branding;
- administrar agentes disponíveis;
- acompanhar saúde das instalações/operações quando permitido.

**Status:** DIREÇÃO ESTRATÉGICA.

Não tratar automaticamente como implementado.

---

# 30. BILLING: MUDANÇA DE SIGNIFICADO

Billing NÃO deve ser removido automaticamente.

O produto já possuir estruturas de cobrança pode ser uma vantagem.

Mas seu propósito muda.

Antes:

> MW cobra diretamente todos os pequenos clientes.

Agora:

> parceiro pode usar o mecanismo de billing para monetizar seus próprios clientes.

Portanto, Stripe/Asaas, planos, quotas e metering podem se tornar infraestrutura comercial white-label do parceiro.

---

# 31. BILLING DEVE SER DESACOPLÁVEL

O comprador poderá desejar:

- utilizar Stripe;
- utilizar Asaas;
- utilizar outro gateway;
- utilizar ERP próprio;
- realizar cobrança fora da plataforma;
- não utilizar billing.

Portanto, billing não deve ser dependência obrigatória para o core dos agentes.

O motor de agentes precisa operar independentemente da estratégia de cobrança utilizada pelo parceiro.

---

# 32. METERING CONTINUA IMPORTANTE

Medição de consumo deve ganhar importância.

Não apenas para cobrar.

Também para compreender:

- tokens;
- mensagens;
- custo de LLM;
- consumo por tenant;
- consumo por agente;
- uso por canal;
- volume de processamento.

Essa informação será fundamental para unit economics.

---

# 33. NOVA DIREÇÃO: COST CONTROL CENTER

A plataforma deverá evoluir para mostrar economicamente o que está acontecendo.

O parceiro precisa conseguir responder:

> Quanto estou gastando para operar este cliente?

Informações desejáveis:

- consumo de LLM;
- custo estimado de IA;
- consumo de canais;
- infraestrutura atribuível quando calculável;
- custo estimado por cliente;
- custo por agente;
- custo agregado.

**Status:** DIREÇÃO ESTRATÉGICA.

---

# 34. NOVA DIREÇÃO: PARTNER ECONOMICS

Além de analytics técnicos, queremos analytics econômicos.

Exemplo conceitual:

CLIENTE X

Receita mensal: R$ X

Custo IA: R$ Y

Outros custos: R$ Z

Margem estimada: R$ W

Margem percentual: X%

Também:

- receita total;
- custo total;
- margem;
- clientes ativos;
- consumo;
- tendências.

A plataforma deve ajudar o parceiro a operar um negócio rentável.

---

# 35. ANALYTICS DEVEM EVOLUIR DE TÉCNICOS PARA ECONÔMICOS

Analytics tradicionais respondem:

- quantas mensagens;
- quantos usuários;
- quantos tokens.

Analytics estratégicos precisam responder:

- quanto custa;
- quanto gera;
- quais clientes são rentáveis;
- quais agentes consomem mais;
- onde existe margem;
- onde existe desperdício.

---

# 36. MULTI-TENANCY PERMANECE FUNDAMENTAL

O isolamento entre empresas continua sendo requisito essencial.

Cada tenant deve possuir isoladamente:

- dados;
- agentes;
- conhecimento;
- configurações;
- contatos;
- credenciais;
- conversas;
- consumo.

Evolução adicional poderá exigir hierarquia:

PARTNER

↓

TENANT

↓

AGENT

↓

USER

---

# 37. RAG PERMANECE NO CORE

A capacidade de fornecer conhecimento empresarial privado continua sendo central.

O produto deverá permitir que agentes consultem:

- PDFs;
- páginas;
- documentos;
- bases autorizadas;
- informações empresariais.

Pipeline conceitual:

DOCUMENTO

↓

EXTRAÇÃO

↓

CHUNKING

↓

EMBEDDING

↓

VETORIZAÇÃO

↓

BUSCA SEMÂNTICA

↓

CONTEXTO PARA IA

A implementação atual deverá ser auditada e evoluída conforme necessário.

---

# 38. KNOWLEDGE HUB — DIREÇÃO

A experiência de conhecimento deverá evoluir de simples upload para uma gestão clara das fontes utilizadas pelos agentes.

Possíveis capacidades:

- fontes;
- status de processamento;
- data de sincronização;
- erros;
- documentos atribuídos por agente;
- reindexação;
- atualização;
- origem da resposta;
- rastreabilidade.

**Status:** DIREÇÃO ESTRATÉGICA.

---

# 39. CITAÇÃO / RASTREABILIDADE DE FONTES

Quando aplicável, respostas baseadas em RAG deverão conseguir fornecer evidência de qual fonte sustentou determinada resposta.

Objetivos:

- aumentar confiança;
- facilitar debugging;
- reduzir respostas incorretas;
- melhorar ambiente empresarial.

---

# 40. TOOL USE PERMANECE CENTRAL

Function Calling / Tool Use deve ser apresentado ao usuário de negócio como:

> **Ações**

e não necessariamente com terminologia técnica.

Exemplos:

- Consultar agenda;
- Agendar;
- Criar lead;
- Consultar CRM;
- Atualizar oportunidade;
- Enviar webhook;
- Consultar sistema;
- Criar ticket.

O usuário define o que o agente tem autorização para fazer.

---

# 41. PERMISSÕES POR AGENTE

À medida que o produto evoluir, cada agente deve possuir permissões explícitas.

Exemplo:

Agente Comercial:

- pode consultar preços;
- pode criar lead;
- pode agendar demonstração;
- não pode alterar faturamento.

Agente Financeiro:

- pode consultar faturas;
- pode enviar segunda via;
- não pode alterar contrato.

Princípio:

> **Agente só executa ações explicitamente autorizadas.**

---

# 42. OMNICHANNEL PERMANECE ESTRATÉGICO

O cérebro do agente deve permanecer independente do canal.

Canais são adaptadores.

Exemplos:

- WhatsApp;
- Web;
- Telegram;
- canais futuros.

Objetivo:

> mesmo agente + mesmo conhecimento + mesmas regras + múltiplos pontos de contato.

---

# 43. HUMAN HANDOFF PERMANECE ESSENCIAL

Automação não significa eliminar humanos.

O sistema deve permitir:

IA

↓

identifica necessidade

↓

pausa ou encaminha

↓

humano assume

↓

histórico permanece disponível

O handoff é especialmente importante em:

- exceções;
- reclamações;
- negociação;
- problemas sensíveis;
- limitações da IA.

---

# 44. MODEL-AGNOSTIC

A plataforma não deve construir sua proposta de valor em torno de um único LLM.

O objetivo é permitir uma camada de provedores.

Exemplos atuais ou futuros podem incluir:

- Gemini;
- OpenAI;
- outros modelos homologados.

O parceiro deve poder utilizar opções conforme:

- custo;
- qualidade;
- disponibilidade;
- contexto;
- política;
- necessidade.

---

# 45. MULTI-LLM GATEWAY

O gateway deverá evoluir para abstrair o provedor do restante da plataforma.

Fluxo conceitual:

AGENTE

↓

AI GATEWAY

↓

PROVEDOR A / B / C

Isso facilita:

- fallback;
- troca;
- roteamento;
- custo;
- resiliência.

---

# 46. AUTO-ROUTING DE MODELOS — DIREÇÃO

No futuro, tarefas diferentes podem utilizar modelos diferentes.

Exemplo:

Pergunta simples

↓

modelo rápido/barato

Tarefa complexa

↓

modelo mais capaz

A escolha deverá considerar custo e qualidade.

**Status:** DIREÇÃO ESTRATÉGICA.

---

# 47. OBSERVABILIDADE DE IA — DIREÇÃO

Precisamos conseguir entender:

- modelo utilizado;
- prompt/contexto;
- ferramentas acionadas;
- RAG utilizado;
- duração;
- tokens;
- erro;
- fallback;
- resultado.

Sem observabilidade, erros de agentes tornam-se difíceis de diagnosticar.

---

# 48. EVALUATION / TEST SUITE — PRIORIDADE ESTRATÉGICA

Antes de um agente ser colocado em produção, o parceiro deveria conseguir testá-lo.

Exemplos:

- perguntas esperadas;
- perguntas perigosas;
- consultas fora de escopo;
- uso correto de ferramentas;
- respostas com conhecimento;
- handoff;
- limites.

Objetivo:

> deixar de testar agentes apenas manualmente em produção.

**Status:** DIREÇÃO ESTRATÉGICA / ALTA PRIORIDADE.

---

# 49. AGENT BUILDER

A experiência de criação de agentes deverá evoluir para ser compreensível por usuários de negócio.

Configuração desejada:

- nome;
- função;
- objetivo;
- personalidade;
- tom;
- conhecimento;
- ações;
- canais;
- regras;
- limites;
- fallback humano.

A interface deve esconder complexidade técnica desnecessária.

---

# 50. TEMPLATES DE AGENTES

Para acelerar implantação e verticalização, a plataforma poderá possuir templates.

Exemplos:

- Recepcionista;
- SDR;
- Vendedor;
- Suporte;
- Agendamento;
- Pós-venda;
- Qualificador;
- Assistente interno.

Um template deve ser:

> ponto de partida configurável.

Não um agente rígido.

---

# 51. TEMPLATES VERTICAIS

Parceiros poderão criar ou receber templates para segmentos.

Exemplo:

CLÍNICA

↓

Recepcionista

↓

Conhecimento

↓

Agenda

↓

WhatsApp

↓

Handoff

Outro:

IMOBILIÁRIA

↓

Corretor

↓

Imóveis

↓

CRM

↓

Visitas

A engine permanece a mesma.

---

# 52. MARKETPLACE — POSSIBILIDADE FUTURA

No futuro, pode existir distribuição de:

- templates;
- ferramentas;
- integrações;
- agentes;
- configurações.

**Status:** IDEIA / DIREÇÃO FUTURA.

Não desenvolver antes de validar necessidade.

---

# 53. CRM NÃO DEVE VIRAR O CENTRO DO PRODUTO

CRM próprio pode existir como recurso operacional.

Mas o produto não deve tentar competir prioritariamente como um CRM completo.

A plataforma deve possuir:

- capacidades mínimas necessárias;
- integrações;
- webhooks;
- conectores.

Quando o parceiro já possuir CRM, devemos conseguir conectar.

---

# 54. INTEGRAÇÕES SÃO PARTE DO VALOR

O valor dos agentes aumenta quando eles conseguem atuar nos sistemas existentes.

A arquitetura deverá facilitar integrações através de:

- APIs;
- webhooks;
- connectors;
- ferramentas;
- MCP quando apropriado;
- plataformas de automação quando apropriado.

---

# 55. SEGURANÇA ENTERPRISE

O produto deve seguir as diretrizes corporativas de segurança da MW.

Capacidades importantes incluem:

- autenticação;
- autorização;
- RBAC;
- isolamento;
- rate limiting;
- validação;
- criptografia;
- secrets;
- logs;
- auditoria;
- backups;
- atualização segura.

---

# 56. RBAC — DIREÇÃO

Empresas e parceiros precisarão de papéis diferentes.

Exemplo:

- owner do parceiro;
- administrador do parceiro;
- operador;
- administrador do cliente;
- atendente;
- visualizador.

As permissões devem evoluir conforme as necessidades reais de mercado.

---

# 57. AUDIT LOGS — DIREÇÃO

A plataforma deverá registrar ações administrativas críticas.

Exemplos:

- alteração de configuração;
- alteração de credencial;
- criação de agente;
- exclusão;
- mudanças de permissões;
- ações administrativas;
- operações sensíveis.

Objetivo:

> rastreabilidade empresarial.

---

# 58. BACKUP E RECUPERAÇÃO

Como o produto será implantado na infraestrutura do cliente, backup precisa fazer parte do processo de implantação.

Devemos definir:

- o que é salvo;
- responsável;
- frequência;
- retenção;
- restore;
- teste de recuperação.

Responsabilidade contratual precisa ser clara.

---

# 59. ATUALIZAÇÃO CUSTOMER-HOSTED

Vender customer-hosted não pode significar:

> instalar uma vez e nunca mais conseguir atualizar.

Devemos possuir processo de:

VERSION

↓

BUILD

↓

RELEASE

↓

BACKUP

↓

MIGRATION

↓

DEPLOY

↓

HEALTH CHECK

↓

ROLLBACK SE NECESSÁRIO

Esse processo precisa ser padronizado.

---

# 60. HEALTH CHECK

Uma instalação deve ser verificável.

Exemplos de componentes:

- aplicação;
- banco;
- Redis;
- filas;
- storage;
- LLM;
- canais;
- webhooks.

A MW ou parceiro deve conseguir identificar rapidamente onde existe uma falha.

---

# 61. INFRAESTRUTURA NÃO É UMA FEATURE INVISÍVEL

Por causa do modelo customer-hosted, itens como:

- installer;
- Docker;
- Compose;
- configuração;
- migrations;
- atualização;
- backup;
- logs;
- documentação;

passam a ter importância comercial.

Eles reduzem:

- custo de implantação;
- tempo;
- risco;
- suporte.

Portanto, são parte do produto.

---

# 62. FIRST-HOUR EXPERIENCE

O parceiro deve conseguir avançar rapidamente para uma demonstração de valor.

Experiência desejada:

1. Instalar ou acessar plataforma.
2. Aplicar sua marca.
3. Criar um cliente.
4. Criar agente.
5. Definir objetivo.
6. Adicionar conhecimento.
7. Adicionar uma ação.
8. Conectar canal.
9. Testar.
10. Publicar.

O tempo para chegar ao primeiro agente funcional deve ser reduzido progressivamente.

---

# 63. EXPERIÊNCIA DO CLIENTE DO PARCEIRO

O cliente final do parceiro não deve precisar compreender:

- embeddings;
- pgvector;
- function calling;
- tokens;
- temperatura;
- filas;
- modelos complexos.

A interface deve falar em conceitos como:

- Agente;
- Conhecimento;
- Ações;
- Canais;
- Conversas;
- Clientes;
- Consumo;
- Resultados.

---

# 64. EXPERIÊNCIA DO PARCEIRO

O parceiro precisa de mais controle.

Ele deve compreender:

- clientes;
- consumo;
- custos;
- branding;
- planos;
- agentes;
- limites;
- integrações;
- operação.

Portanto:

**Partner Experience ≠ Client Experience**

Essa separação precisa aparecer na arquitetura do produto.

---

# 65. MODELO COMERCIAL NÃO DEVE SER HARDCODED

Evitar programar o sistema assumindo que todos os parceiros venderão:

- plano Basic;
- plano Pro;
- plano Enterprise;
- mensalidade fixa;
- determinada moeda;
- determinado gateway.

Esses são modelos comerciais possíveis.

A plataforma deverá permitir flexibilidade.

---

# 66. NÃO CONSTRUIR UM SISTEMA DIFERENTE PARA CADA NICHO

Verticalização deve acontecer preferencialmente através de:

- configuração;
- templates;
- conhecimento;
- branding;
- ferramentas;
- integrações;
- permissões;
- workflows.

Evitar forks independentes do produto para cada mercado.

Objetivo:

> **um core → muitas soluções.**

---

# 67. ESTRATÉGIA DE PROPRIEDADE INTELECTUAL

O core pertence à MW Technology.

Customizações realizadas para um parceiro devem, sempre que contratualmente possível, ser classificadas entre:

## Core reutilizável

Volta para a plataforma.

## Configuração do parceiro

Pertence à implantação.

## Integração específica

Pode ser específica, mas deve ser desacoplada.

## Desenvolvimento exclusivo

Precisa de regra contratual explícita.

Evitar fragmentar a base principal.

---

# 68. O QUE A MW NÃO DEVE FAZER AGORA

Não priorizar:

- hospedar centenas de pequenos clientes por conta própria;
- marketing massivo para usuário final;
- subsidiar tokens de IA em escala;
- subsidiar infraestrutura dos parceiros;
- criar dezenas de verticais antes de validar comprador;
- marketplace antes de necessidade real;
- features sofisticadas sem impacto comercial;
- mudanças estéticas enormes sem efeito na venda;
- desenvolvimento interminável antes de colocar o produto diante de compradores.

---

# 69. O QUE PRECISAMOS VALIDAR COMERCIALMENTE

Ainda existem hipóteses importantes.

## Hipótese 1

Empresas com carteira B2B preferem licenciar essa tecnologia em vez de construir internamente.

**Status:** NÃO VALIDADA SUFICIENTEMENTE.

## Hipótese 2

Essas empresas possuem orçamento compatível com um contrato empresarial.

**Status:** NÃO VALIDADA SUFICIENTEMENTE.

## Hipótese 3

Customer-hosted é comercialmente aceitável e desejável para o ICP.

**Status:** HIPÓTESE FORTE, A VALIDAR.

## Hipótese 4

O parceiro consegue monetizar sua base utilizando a plataforma.

**Status:** A VALIDAR.

## Hipótese 5

O atual conjunto de funcionalidades é suficiente para um piloto pago.

**Status:** A VALIDAR.

---

# 70. NÃO CONFUNDIR MERCADO PROMISSOR COM PRODUTO VALIDADO

O mercado de agentes de IA pode ser relevante.

Isso não significa que:

- nossa proposta foi validada;
- nosso preço foi validado;
- nosso ICP foi validado;
- nosso modelo comercial foi validado.

A validação necessária é do:

> **nosso produto + nosso comprador + nossa proposta + nosso preço.**

---

# 71. VALIDAÇÃO COMERCIAL IMEDIATA

A próxima fase de desenvolvimento deve coexistir com mercado.

Objetivo:

- conversar com compradores reais;
- demonstrar software funcionando;
- identificar objeções;
- compreender build-vs-buy;
- compreender orçamento;
- compreender infraestrutura;
- compreender requisitos;
- buscar piloto pago.

Uma boa meta inicial de exploração é realizar diversas conversas qualificadas com empresas do ICP e tentar chegar a pelo menos um compromisso financeiro real.

---

# 72. PILOTO PAGO

Um piloto realmente útil deve envolver:

- comprador real;
- problema real;
- infraestrutura definida;
- aplicação prática;
- prazo;
- critérios;
- pagamento.

Pagamento não precisa significar produto final.

Significa que a empresa acredita no problema o suficiente para comprometer recursos.

---

# 73. CO-DESENVOLVIMENTO COMERCIAL

O primeiro parceiro poderá influenciar determinadas funcionalidades.

Isso é aceitável se:

- pagar;
- representar ICP;
- necessidade for reutilizável;
- mudança fortalecer o produto.

Evitar construir um sistema exclusivo disfarçado de produto.

---

# 74. RECEITA PODE FINANCIAR DESENVOLVIMENTO

O modelo comercial poderá utilizar marcos contratuais.

Conceitualmente:

ASSINATURA

↓

PAGAMENTO INICIAL

↓

IMPLANTAÇÃO

↓

HOMOLOGAÇÃO

↓

GO-LIVE

Isso permite que contratos financiem parte da implementação sem a MW assumir todo o risco antecipadamente.

Valores precisam ser definidos comercialmente.

---

# 75. MÉTRICAS DO PARCEIRO

A plataforma deverá caminhar para fornecer dados que ajudem o parceiro a acompanhar:

- clientes;
- agentes;
- usuários;
- conversas;
- mensagens;
- tokens;
- custo;
- receita quando configurada;
- margem;
- disponibilidade;
- resultados.

---

# 76. MÉTRICAS DA MW

Para avaliar o próprio produto, a MW deverá acompanhar:

- empresas prospectadas;
- reuniões;
- demos;
- propostas;
- pilotos;
- contratos;
- ticket;
- tempo de implantação;
- custo de implantação;
- suporte;
- margem;
- churn de licença;
- pedidos recorrentes;
- blockers técnicos.

---

# 77. REGRA DE PRIORIZAÇÃO DE FEATURES

Antes de implementar nova feature significativa, perguntar:

1. Quem precisa?
2. Qual problema resolve?
3. Existe comprador pedindo?
4. Ajuda a fechar contrato?
5. Reduz implantação?
6. Reduz custo?
7. Aumenta confiabilidade?
8. Aumenta segurança?
9. É reutilizável?
10. Diferencia a plataforma?
11. Precisamos disso para o próximo piloto?

Se não houver resposta convincente, a feature deve competir com prioridades mais importantes.

---

# 78. ORDEM DE PRIORIDADE ATUAL

A direção geral deve favorecer:

## 1. PRODUTO VENDÁVEL

Fluxo principal funcionando.

## 2. CUSTOMER-HOSTED PROFISSIONAL

Instalar e operar fora da infraestrutura MW.

## 3. SEGURANÇA E ISOLAMENTO

Produto empresarial.

## 4. EXPERIÊNCIA DO PARCEIRO

White-label e gestão.

## 5. TESTABILIDADE DOS AGENTES

Evitar comportamento imprevisível.

## 6. CONTROLE DE CUSTO

Unit economics.

## 7. OBSERVABILIDADE

Entender operação.

## 8. VERTICALIZAÇÃO

Templates e velocidade de configuração.

Features adicionais vêm depois conforme validação.

---

# 79. AUDITORIA IMPLEMENTADO VS. DOCUMENTADO

Antes de iniciar grandes novas funcionalidades, realizar auditoria do repositório.

Para cada feature descrita na documentação, classificar:

**IMPLEMENTADO**

Código existente e funcional.

**PARCIALMENTE IMPLEMENTADO**

Existe, mas não cumpre todo o comportamento.

**QUEBRADO / NÃO HOMOLOGADO**

Existe código, mas não deve ser vendido como funcional.

**DOCUMENTADO, MAS NÃO IMPLEMENTADO**

Aparece em documentação sem implementação correspondente.

**PLANEJADO**

Aprovado para evolução futura.

**IDEIA**

Ainda sem aprovação.

Essa auditoria é obrigatória para evitar decisões baseadas em documentação desatualizada.

---

# 80. ESTADO DOCUMENTADO ATUAL DO PRODUTO

A documentação existente descreve atualmente capacidades como:

- multi-tenancy;
- white-label;
- RAG;
- WhatsApp;
- Telegram;
- Web Widget;
- dashboard administrativo;
- personas;
- upload de documentos;
- Inbox;
- CRM/leads;
- handoff humano;
- gateway multi-LLM;
- fallback;
- Google Calendar;
- webhooks/CRM;
- rate limiting;
- criptografia de secrets;
- Redis;
- BullMQ;
- billing;
- metering;
- PostgreSQL;
- pgvector;
- Docker;
- deploy script.

IMPORTANTE:

> **“Documentado atualmente” não significa automaticamente “auditado e pronto para produção”.**

O repositório deve confirmar cada item.

---

# 81. STACK ATUAL DOCUMENTADA

A documentação existente indica aproximadamente:

## Backend

- Node.js;
- TypeScript;
- Express;
- Prisma;
- PostgreSQL;
- pgvector;
- Redis;
- BullMQ.

## Frontend

- React;
- Vite;
- Tailwind;
- Radix/Shadcn.

## IA

- Gemini;
- OpenAI como alternativa/fallback.

## RAG

- parsing;
- scraping;
- embeddings;
- PostgreSQL + pgvector.

## Canais

- WhatsApp;
- Telegram;
- Web.

A stack deverá seguir as diretrizes da Stack Tecnológica Preferencial da MW e ser alterada apenas quando justificado.

---

# 82. MUDANÇAS ARQUITETURAIS A AVALIAR

A nova estratégia exige revisar especialmente:

## Infraestrutura

Eliminar dependências hardcoded da MW.

## Secrets

Permitir chaves do parceiro.

## Storage

Configuração agnóstica.

## Banco

Configuração através de conexão externa homologada.

## Redis

Permitir endpoint do ambiente do parceiro.

## Branding

Externalizar completamente.

## Billing

Desacoplar do core.

## Hierarquia

Avaliar Partner → Tenant → Agents.

## Licensing

Criar mecanismo compatível com customer-hosted.

## Updates

Criar estratégia profissional.

## Backup

Formalizar.

## Observabilidade

Formalizar.

## Cost tracking

Expandir.

---

# 83. REQUISITOS DE CONFIGURAÇÃO

A longo prazo, configuração específica de implantação deve vir de:

- variáveis de ambiente;
- banco;
- configuração administrativa;
- secret storage.

Evitar:

- logos hardcoded;
- URLs fixas;
- chaves no código;
- domínio MW obrigatório;
- IDs fixos;
- conta cloud MW obrigatória;
- gateway específico obrigatório quando não necessário.

---

# 84. AMBIENTE DE DEMONSTRAÇÃO DA MW

A MW pode manter infraestrutura própria pequena para:

- desenvolvimento;
- testes;
- homologação;
- demonstrações comerciais.

Isso não significa que a MW assumirá infraestrutura de produção dos compradores.

Separar claramente:

**DEMO MW**

de

**PRODUÇÃO DO PARCEIRO.**

---

# 85. MODELO MANAGED PODE EXISTIR NO FUTURO

Customer-hosted é prioridade atual.

Não é limitação eterna.

No futuro, MW poderá oferecer:

## Customer-Hosted

Cliente hospeda.

## Managed

MW hospeda e cobra pelo serviço.

## Hybrid

Ambos disponíveis.

Managed somente deve crescer quando:

- houver caixa;
- margem conhecida;
- automação;
- capacidade operacional;
- unit economics comprovados.

---

# 86. SAAS NÃO FOI ELIMINADO

A decisão atual não significa:

> "Nunca teremos SaaS."

Significa:

> "Não financiaremos prematuramente uma operação SaaS proporcional ao crescimento dos clientes."

O software pode inclusive permitir que o **parceiro opere seu próprio SaaS** sobre a plataforma.

Essa diferença é central.

---

# 87. O PARCEIRO PODE CRIAR UM SAAS SOBRE O PRODUTO MW

Fluxo:

MW

↓

licencia infraestrutura tecnológica

↓

Parceiro

↓

cria seu SaaS vertical

↓

Clientes do parceiro

Isso significa que o produto MW pode conter:

- multi-tenancy;
- billing;
- quotas;
- onboarding;
- white-label;
- analytics;

sem que a própria MW precise ser a operadora SaaS do cliente final.

---

# 88. DIFERENCIAL QUE DEVEMOS BUSCAR

Recursos básicos de agentes tendem a se tornar cada vez mais comuns.

Não devemos depender somente de:

- chamar LLM;
- RAG;
- prompt;
- function calling;
- WhatsApp;
- chat com PDF.

O diferencial deve caminhar para:

> **infraestrutura empresarial pronta para outra empresa lançar, operar e monetizar soluções de IA.**

Isso inclui combinação de:

- white-label;
- partner management;
- customer-hosted;
- deployment;
- segurança;
- governance;
- agentes;
- RAG;
- actions;
- omnichannel;
- cost control;
- economics;
- templates;
- observabilidade.

---

# 89. GOVERNANÇA DE AGENTES — DIREÇÃO

À medida que empresas operem vários agentes, precisarão saber:

- quem criou;
- quem alterou;
- o que pode fazer;
- quais ferramentas utiliza;
- quais dados consulta;
- qual versão está publicada;
- quanto custa;
- como está performando.

Governança passa a ser parte importante do produto empresarial.

---

# 90. VERSIONAMENTO DE AGENTES — DIREÇÃO FUTURA

Agentes poderão evoluir para possuir versões.

Exemplo:

Agent v1

↓

alteração de prompt/conhecimento/tools

↓

testes

↓

Agent v2

↓

publicação

↓

rollback se necessário.

**Status:** DIREÇÃO FUTURA.

---

# 91. PUBLICAÇÃO SEGURA

Mudanças de configuração potencialmente críticas não deveriam necessariamente entrar imediatamente em produção.

Fluxo desejável futuramente:

EDITAR

↓

TESTAR

↓

VALIDAR

↓

PUBLICAR

Isso reduz risco operacional.

---

# 92. PRINCÍPIO DE SIMPLICIDADE

Apesar da sofisticação interna, o produto precisa parecer simples.

A complexidade deve ficar no motor.

Usuário deve conseguir pensar em:

> "Quero criar um agente comercial que conheça meus produtos, converse pelo WhatsApp e cadastre leads."

e não precisar pensar em:

> embeddings + vector dimensions + function schemas + queues + API orchestration.

---

# 93. PRINCÍPIO DE TEMPO PARA VALOR

Uma das principais métricas de experiência deverá ser:

> **Quanto tempo leva para um parceiro colocar o primeiro agente útil em funcionamento?**

Devemos reduzir esse tempo.

Quanto menor:

- instalação;
- configuração;
- conhecimento;
- conexão;
- teste;
- publicação;

mais valor percebido a plataforma possui.

---

# 94. PRINCÍPIO DE REUTILIZAÇÃO

Uma feature construída deve preferencialmente servir:

- múltiplos clientes;
- múltiplos agentes;
- múltiplos nichos;
- múltiplos parceiros.

Evitar lógica excessivamente específica dentro do core.

---

# 95. PRINCÍPIO DE MODULARIDADE

Integrações e capacidades específicas devem, quando possível, ser módulos.

Exemplo:

CORE

↓

CHANNELS

TOOLS

LLM PROVIDERS

STORAGE

BILLING

INTEGRATIONS

Isso reduz acoplamento e facilita customer-hosted.

---

# 96. DOCUMENTAÇÃO É PARTE DA ENTREGA

O produto deve possuir documentação suficiente para:

- instalar;
- configurar;
- atualizar;
- recuperar;
- integrar;
- administrar;
- solucionar problemas.

Especialmente porque o modelo prioriza infraestrutura do comprador.

---

# 97. SUPORTE NÃO DEVE COMPENSAR PRODUTO MAL EMPACOTADO

Quando o mesmo problema de implantação ou configuração aparecer repetidamente:

não apenas resolver manualmente.

Perguntar:

> como podemos eliminar isso do próximo deployment?

O objetivo é transformar conhecimento de suporte em:

- automação;
- validação;
- installer;
- documentação;
- health check;
- UX.

---

# 98. ESTRATÉGIA DE NOME

“Mini-Assistant” é atualmente um nome provisório.

Não estruturar marca definitiva, domínio ou decisões arquiteturais profundas dependentes desse nome.

Utilizar referências substituíveis.

Quando um nome definitivo for escolhido:

- atualizar branding;
- documentação;
- interfaces;
- artefatos comerciais;
- domínios;
- packages quando necessário.

O nome não deve bloquear desenvolvimento ou validação.

---

# 99. NOMES E IDENTIDADE NÃO DEVEM ESTAR HARDCODED

Mesmo após escolha do nome oficial, o white-label exige separação.

Existem dois níveis:

## Produto MW

Nome da tecnologia/produto.

## Marca do parceiro

Nome apresentado pelo parceiro aos seus clientes.

A arquitetura deve suportar essa diferença.

---

# 100. FASES ESTRATÉGICAS

## FASE 1 — CONSOLIDAÇÃO DO PRODUTO

Objetivo:

saber exatamente o que já existe e garantir core funcional.

Prioridades:

- auditoria;
- correções;
- fluxos centrais;
- documentação.

---

## FASE 2 — PORTABILIDADE E CUSTOMER-HOSTED

Objetivo:

tornar implantação empresarial previsível.

Prioridades:

- configuração;
- infra agnóstica;
- secrets;
- Docker;
- banco;
- Redis;
- storage;
- licensing;
- backup;
- update.

---

## FASE 3 — PARTNER EXPERIENCE

Objetivo:

transformar plataforma em infraestrutura comercial para parceiros.

Prioridades:

- hierarquia partner/tenant;
- branding;
- gestão;
- clientes;
- limites;
- analytics.

---

## FASE 4 — CONFIABILIDADE E GOVERNANÇA

Objetivo:

permitir operação empresarial segura.

Prioridades:

- RBAC;
- audit logs;
- observabilidade;
- testing;
- evals;
- health;
- versionamento.

---

## FASE 5 — BUSINESS INFRASTRUCTURE

Objetivo:

ajudar parceiro a monetizar.

Prioridades:

- metering;
- costs;
- economics;
- billing flexível;
- planos;
- margem.

---

## FASE 6 — VERTICALIZAÇÃO E ESCALA

Objetivo:

reduzir tempo de criação de soluções de nicho.

Prioridades:

- templates;
- packs;
- integrações;
- catálogo;
- automação.

Essas fases representam direção.

O roadmap real deve ser atualizado conforme validação comercial.

---

# 101. O QUE TEM PRIORIDADE SOBRE ROADMAP

Um comprador real pode revelar que nossa ordem está errada.

Portanto:

> evidência comercial deve poder reorganizar roadmap.

Se cinco compradores qualificados precisarem de determinada capacidade para fechar contrato, isso possui peso maior do que uma feature imaginada internamente sem demanda comprovada.

---

# 102. REGRA DO PRÓXIMO CONTRATO

Durante esta fase, uma excelente pergunta para priorização é:

> **Essa mudança aumenta nossa probabilidade de conquistar e implantar o próximo parceiro pagante?**

Se sim, alta relevância.

Se não, justificar o investimento.

---

# 103. DEFINITION OF DONE PARA FEATURE

Uma feature comercial importante não está pronta apenas quando:

> código compila.

Ela deve considerar, conforme aplicável:

- comportamento;
- testes;
- segurança;
- autorização;
- logs;
- erros;
- multi-tenancy;
- configuração;
- documentação;
- deployment;
- atualização.

---

# 104. DEFINIÇÃO DE PRODUTO PRONTO PARA PILOTO

O produto não precisa possuir todo o roadmap para iniciar piloto.

Precisa conseguir demonstrar de ponta a ponta:

PARCEIRO

↓

CONFIGURA SUA MARCA

↓

CRIA/CONFIGURA CLIENTE

↓

CRIA AGENTE

↓

ADICIONA CONHECIMENTO

↓

CONFIGURA AÇÃO

↓

CONECTA CANAL

↓

USUÁRIO INTERAGE

↓

AGENTE CONSULTA

↓

AGENTE AGE

↓

PARCEIRO ACOMPANHA

Se esse fluxo funciona de maneira segura e reproduzível, existe base para validação comercial.

---

# 105. NÃO BUSCAR PERFEIÇÃO ANTES DA VENDA

A plataforma possui ambição grande.

Isso não significa desenvolver cada item deste documento antes de vender.

Este documento contém:

- princípios obrigatórios;
- mudanças aprovadas;
- direções estratégicas;
- ideias futuras.

A prioridade deve ser:

> construir o suficiente para vender, aprender e melhorar.

---

# 106. CLASSIFICAÇÃO OBRIGATÓRIA DE ROADMAP

Toda tarefa futura significativa deverá possuir uma das classificações:

**CRÍTICO PARA PILOTO**

**CRÍTICO PARA CUSTOMER-HOSTED**

**CRÍTICO PARA SEGURANÇA**

**CRÍTICO PARA VENDA**

**MELHORIA DE PRODUTO**

**FUTURO**

**EXPERIMENTO**

Isso facilita decisões.

---

# 107. INSTRUÇÕES PARA AGENTES DE IA QUE TRABALHAM NO REPOSITÓRIO

Antes de criar código ou alterar arquitetura, o agente deve compreender:

> O produto não está mais sendo orientado prioritariamente como um SaaS operado pela MW para pequenos clientes finais.

A direção atual é:

> **plataforma white-label licenciável, customer-hosted e orientada a parceiros.**

Toda sugestão deve considerar isso.

---

# 108. REGRAS ESPECÍFICAS PARA AGENTES DE DESENVOLVIMENTO

O agente NÃO deve:

- criar dependência desnecessária de infraestrutura MW;
- hardcodar contas MW;
- assumir que MW paga LLM;
- assumir que MW cobra cliente final;
- assumir Basic/Pro/Enterprise como modelo universal;
- criar lógica de nicho dentro do core sem abstração;
- tratar roadmap como implementação;
- substituir arquitetura sem justificativa;
- ignorar customer-hosted;
- ignorar multi-tenancy;
- ignorar segurança;
- criar features grandes sem spec.

---

# 109. O AGENTE DEVE PREFERIR

Quando houver alternativas tecnicamente equivalentes:

- configuração > hardcode;
- módulo > acoplamento;
- provider abstraction > dependência exclusiva;
- reutilização > fork;
- tenant isolation > filtro implícito;
- automation > instalação artesanal;
- measurement > estimativa cega;
- documentação > conhecimento tribal;
- buyer-hosted > MW financiando infraestrutura, nesta fase.

---

# 110. PERGUNTAS ANTES DE NOVA FEATURE

Agentes devem perguntar internamente:

- Esta feature pertence ao core?
- É específica de parceiro?
- É específica de nicho?
- Deve ser configuração?
- Deve ser integração?
- É necessária agora?
- Há evidência comercial?
- Afeta customer-hosted?
- Afeta segurança?
- Afeta multi-tenancy?
- Aumenta custo da MW?
- Cria lock-in?
- Pode ser reutilizada?

---

# 111. DOCUMENTAÇÃO EXISTENTE QUE PRECISA SER REVISADA

Especial atenção a documentos cujo nome ou conteúdo ainda trate o produto como:

- SaaS MW;
- assinatura direta;
- estrutura obrigatoriamente hospedada pela MW.

Exemplo conhecido:

`SAAS_STRATEGY.md`

Esse documento deve ser revisado ou marcado como legado quando contradizer esta direção.

README e whitepaper também deverão ser atualizados posteriormente para refletir a nova definição do produto.

---

# 112. COMO O README DEVERÁ PASSAR A DESCREVER O PRODUTO

Conceito recomendado:

> **[NOME DO PRODUTO] é uma plataforma empresarial white-label para criação, operação e comercialização de agentes de Inteligência Artificial. Projetada para implantação customer-hosted, permite que empresas e parceiros construam soluções de IA com conhecimento privado, ações, múltiplos canais e gestão multi-tenant sem desenvolver toda a infraestrutura do zero.**

Evitar chamar simplesmente:

> "Plataforma SaaS da MW."

---

# 113. MUDANÇA DE LINGUAGEM

Substituir gradualmente:

**Assistente**

por:

**Agente**

quando representar execução autônoma.

Substituir:

**Function Calling**

na experiência comercial por:

**Ações**

Substituir:

**Cliente da MW**

quando apropriado por:

**Parceiro / Comprador**

Substituir:

**Usuário SaaS**

por estrutura apropriada:

**Partner → Tenant → User**

---

# 114. COMO MEDIR O SUCESSO DO PRODUTO

Sucesso não será:

- quantidade de features;
- quantidade de prompts;
- quantidade de integrações;
- complexidade;
- quantidade de código.

Sucesso será progressivamente demonstrado por:

- parceiro pagante;
- implantação funcionando;
- clientes criados;
- agentes em produção;
- margem saudável;
- baixo tempo de implantação;
- reutilização;
- confiabilidade;
- renovação;
- expansão.

---

# 115. MAIOR RISCO ESTRATÉGICO

O maior risco não é apenas a tecnologia falhar.

É desenvolver uma excelente plataforma tecnicamente e descobrir tarde demais que:

- posicionamento estava errado;
- comprador não paga;
- implantação custa demais;
- diferenciação é pequena;
- parceiro não consegue vender;
- features não resolvem problema econômico.

Por isso:

> **desenvolvimento e validação comercial precisam acontecer em paralelo.**

---

# 116. MAIOR VANTAGEM POTENCIAL

A vantagem potencial da MW não está em possuir acesso exclusivo a modelos de IA.

Está em transformar diferentes tecnologias em uma infraestrutura empresarial pronta que outra empresa possa utilizar rapidamente.

Essa vantagem pode vir da combinação de:

- arquitetura;
- know-how;
- integrações;
- deployment;
- white-label;
- segurança;
- custo;
- templates;
- operação;
- governança;
- experiência.

---

# 117. PRINCÍPIO FINANCEIRO DO PRODUTO

Enquanto a MW não possuir caixa e receita recorrente suficientes:

> **o crescimento do produto não deve exigir que a MW financie infraestrutura proporcional ao crescimento dos clientes dos parceiros.**

Essa regra deve influenciar arquitetura e contratos.

---

# 118. PRINCÍPIO COMERCIAL

O parceiro ideal compra:

> **tempo + tecnologia + redução de risco + capacidade de gerar nova receita.**

Não apenas código.

---

# 119. PRINCÍPIO DE ARQUITETURA

> **Uma base tecnológica, múltiplos parceiros, múltiplos clientes, múltiplos agentes, múltiplos nichos.**

Sem reescrever o core para cada caso.

---

# 120. PRINCÍPIO DE PRODUTO

> **A plataforma transforma configuração de objetivo, conhecimento, ferramentas e canais em trabalhadores digitais capazes de executar tarefas empresariais.**

---

# 121. PRINCÍPIO DE POSICIONAMENTO

Não vender:

> "Nós temos IA."

Vender:

> "Você pode colocar uma operação de agentes de IA no mercado sem construir toda a infraestrutura do zero."

---

# 122. PRINCÍPIO DE EXECUÇÃO

Toda decisão relevante deve passar por:

**COMPRADOR**

↓

**PROBLEMA**

↓

**VALOR**

↓

**EVIDÊNCIA**

↓

**ARQUITETURA**

↓

**IMPLEMENTAÇÃO**

Não o contrário.

---

# 123. RESUMO OFICIAL PARA AGENTES

Se um agente de IA precisar compreender este produto rapidamente, considerar:

> **O projeto provisoriamente chamado Mini-Assistant é uma plataforma empresarial white-label de agentes de IA desenvolvida pela MW Technology. Sua estratégia original de SaaS direto foi reposicionada. A prioridade atual é licenciar e implantar a plataforma na infraestrutura de empresas parceiras que já possuem distribuição e desejam criar suas próprias soluções verticais de IA. A plataforma deve permitir múltiplos clientes e múltiplos agentes, conhecimento privado via RAG, ações em sistemas externos, múltiplos canais, handoff humano, white-label, gestão de consumo e infraestrutura comercial. O software deve ser customer-hosted, configurável, modular e evitar dependências obrigatórias da infraestrutura ou das chaves da MW. Billing, metering e analytics existentes devem evoluir para servir ao negócio do parceiro. O desenvolvimento deve priorizar portabilidade, deployment, segurança, Partner Experience, governança, controle de custos e capacidade de validar um piloto pago antes de expandir indiscriminadamente o roadmap.**

---

# 124. ESTADO DE DECISÃO

## DECIDIDO

- Produto continuará sendo desenvolvido.
- Estratégia antiga de SaaS direto não é mais prioridade.
- Customer-hosted é prioridade.
- Infraestrutura de produção deve ser preferencialmente paga pelo comprador.
- BYOK/BYOI são direções centrais.
- White-label permanece central.
- Multi-tenancy permanece central.
- Múltiplos agentes por empresa são parte da visão.
- Produto será horizontal.
- Parceiros poderão verticalizar comercialmente.
- ICP prioritário é empresa com distribuição B2B.
- MW monetiza propriedade intelectual e serviços relacionados.
- Billing deve ser reutilizável pelo parceiro, não apenas pela MW.
- Deployment passa a ser parte central do produto.
- Desenvolvimento deve ocorrer junto com validação comercial.
- Nome Mini-Assistant é provisório.

## A VALIDAR

- preço;
- formato exato da licença;
- ticket;
- duração do contrato;
- comprador inicial definitivo;
- vertical inicial mais atraente;
- disposição a pagar;
- payback real do parceiro;
- requisitos enterprise mais demandados;
- infraestrutura mínima aceita;
- primeiro piloto.

## DIREÇÃO ESTRATÉGICA

- Partner Console;
- Cost Control Center;
- Partner Economics;
- Agent Builder melhorado;
- Templates;
- Knowledge Hub;
- Evaluation Suite;
- observabilidade de IA;
- RBAC;
- audit logs;
- versionamento de agentes;
- roteamento inteligente de modelos;
- marketplace futuro.

---

# 125. REGRA FINAL

Este produto não deve evoluir tentando ser:

> **o maior criador genérico de agentes possível.**

Ele deve evoluir tentando ser:

> **a infraestrutura mais prática, confiável e economicamente utilizável possível para uma empresa lançar e operar suas próprias soluções de agentes de IA.**

A pergunta que deve orientar o desenvolvimento passa a ser:

> **“O que falta para uma empresa comprar esta plataforma, implantá-la, colocar sua marca, criar soluções para seu mercado e ganhar dinheiro utilizando nossa tecnologia?”**

Essa pergunta deve orientar produto, engenharia, vendas e roadmap até que evidências reais indiquem uma direção melhor.