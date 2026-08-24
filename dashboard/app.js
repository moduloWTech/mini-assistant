// Mini-Assistant SaaS Enterprise Dashboard App
const API_BASE = window.location.origin;

const state = {
  token: localStorage.getItem('saas_token') || '',
  client: JSON.parse(localStorage.getItem('saas_client') || 'null'),
  profile: null,
  currentView: 'overview',
  authMode: 'login', // 'login' | 'register'
  whatsappMode: 'qr', // 'qr' | 'meta'
  analytics: null,
  knowledgeSources: [],
  leads: [],
  conversations: [],
  selectedConversation: null,
  messages: [],
  billing: null,
  sandboxMessages: [
    { role: 'model', content: 'Olá! Sou sua inteligência artificial. Como posso ajudar você hoje?' }
  ],
  loading: false,
};

// --- AUTH SERVICES ---
async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    
    state.token = data.token;
    localStorage.setItem('saas_token', data.token);
    
    const payload = JSON.parse(atob(data.token.split('.')[1]));
    state.client = { id: payload.clientId, email, name: 'Administrador' };
    localStorage.setItem('saas_client', JSON.stringify(state.client));
    
    render();
    loadDashboardData();
  } catch (err) {
    alert(err.message);
  }
}

async function register(name, email, password, companyName) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, companyName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar empresa');
    
    state.token = data.token;
    state.client = data.client;
    localStorage.setItem('saas_token', data.token);
    localStorage.setItem('saas_client', JSON.stringify(data.client));
    
    alert('Conta criada com sucesso! Seja bem-vindo ao seu painel.');
    render();
    loadDashboardData();
  } catch (err) {
    alert(err.message);
  }
}

function logout() {
  state.token = '';
  state.client = null;
  state.profile = null;
  localStorage.removeItem('saas_token');
  localStorage.removeItem('saas_client');
  render();
}

// --- DATA FETCHING ---
async function apiFetch(endpoint, options = {}) {
  if (!state.token) return null;
  const headers = {
    'Authorization': `Bearer ${state.token}`,
    ...(options.headers || {})
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    logout();
    return null;
  }
  return res.json();
}

async function loadDashboardData() {
  if (!state.token) return;
  state.loading = true;
  
  try {
    const [analytics, sources, leads, convs, billing, profile] = await Promise.all([
      apiFetch('/analytics/overview'),
      apiFetch('/knowledge/sources'),
      apiFetch('/leads'),
      apiFetch('/inbox/conversations'),
      apiFetch('/billing/subscription'),
      apiFetch('/client/profile')
    ]);

    state.analytics = analytics;
    state.knowledgeSources = sources || [];
    state.leads = leads || [];
    state.conversations = convs || [];
    state.billing = billing;
    state.profile = profile;
    if (profile?.name) {
      state.client.name = profile.name;
    }
  } catch (e) {
    console.error('Erro ao carregar dados:', e);
  } finally {
    state.loading = false;
    render();
  }
}

// --- HELPER COMPONENT ---
function renderHelper(id, text) {
  return `
    <div class="mt-1.5">
      <button type="button" onclick="toggleHelper('${id}')" class="text-[11px] text-brand-400 hover:text-brand-300 font-medium flex items-center space-x-1 focus:outline-none transition">
        <i data-lucide="help-circle" class="w-3.5 h-3.5"></i>
        <span>O que preencher aqui? (Clique para ver explicação)</span>
      </button>
      <div id="helper-${id}" class="hidden mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1 animate-fadeIn">
        ${text}
      </div>
    </div>
  `;
}

function toggleHelper(id) {
  const el = document.getElementById(`helper-${id}`);
  if (el) {
    el.classList.toggle('hidden');
    initIcons();
  }
}

// --- MAIN RENDER ---
function render() {
  const app = document.getElementById('app');
  if (!state.token) {
    app.innerHTML = renderAuthView();
    initIcons();
    return;
  }

  app.innerHTML = `
    <div class="flex h-screen overflow-hidden">
      <!-- SIDEBAR -->
      <aside class="w-64 glass border-r border-slate-800 flex flex-col justify-between p-4 z-20">
        <div>
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-3 px-2 py-3 mb-6 border-b border-slate-800/80">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <i data-lucide="bot" class="w-6 h-6 text-white"></i>
            </div>
            <div>
              <h1 class="font-bold text-base leading-tight text-white tracking-tight">Mini-Assistant</h1>
              <span class="text-xs text-brand-400 font-medium tracking-wide uppercase">Enterprise SaaS</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <nav class="space-y-1">
            ${renderNavItem('overview', 'layout-dashboard', 'Visão Geral')}
            ${renderNavItem('persona', 'sparkles', 'Persona & Agentes')}
            ${renderNavItem('knowledge', 'brain', 'Base de Conhecimento')}
            ${renderNavItem('channels', 'share-2', 'Hub de Canais')}
            ${renderNavItem('inbox', 'messages-square', 'Inbox & Atendimento')}
            ${renderNavItem('leads', 'users', 'Leads & CRM')}
            ${renderNavItem('tools', 'wrench', 'Habilidades (Tools)')}
            ${renderNavItem('billing', 'credit-card', 'Planos & Faturamento')}
          </nav>
        </div>

        <!-- User Profile & Logout -->
        <div class="pt-4 border-t border-slate-800/80">
          <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div class="flex items-center space-x-3 truncate">
              <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                ${state.client?.name?.[0] || 'U'}
              </div>
              <div class="truncate text-left">
                <p class="text-xs font-semibold text-white truncate">${state.client?.name || 'Admin'}</p>
                <p class="text-[10px] text-slate-400 truncate">${state.client?.email || 'empresa@corp.com'}</p>
              </div>
            </div>
            <button onclick="logout()" title="Sair" class="text-slate-400 hover:text-rose-400 p-1.5 transition">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT AREA -->
      <main class="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-dark-bg">
        <!-- TOP HEADER -->
        <header class="h-16 glass border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 class="text-lg font-bold text-white capitalize">${getViewTitle(state.currentView)}</h2>
            <p class="text-xs text-slate-400">Gerencie sua inteligência artificial e métricas em tempo real.</p>
          </div>
          <div class="flex items-center space-x-4">
            <a href="/api-docs" target="_blank" class="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-brand-500 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
              <span>Swagger API</span>
            </a>
            <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Motor Online (v2.0)</span>
            </div>
          </div>
        </header>

        <!-- VIEW CONTAINER -->
        <div class="p-8 flex-1">
          ${renderCurrentView()}
        </div>
      </main>
    </div>
  `;

  initIcons();
}

function renderNavItem(viewId, icon, label) {
  const active = state.currentView === viewId;
  const activeClasses = active 
    ? 'bg-brand-600/20 text-brand-300 border-l-2 border-brand-500 font-medium' 
    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200';
  return `
    <button onclick="navigate('${viewId}')" class="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs transition text-left ${activeClasses}">
      <i data-lucide="${icon}" class="w-4 h-4"></i>
      <span>${label}</span>
    </button>
  `;
}

function getViewTitle(view) {
  const titles = {
    overview: 'Visão Geral & Métricas',
    persona: 'Estúdio de Personas & Agentes',
    knowledge: 'Base de Conhecimento (RAG)',
    channels: 'Hub de Conexão de Canais',
    inbox: 'Central de Atendimento ao Vivo',
    leads: 'Gestão de Leads & CRM',
    tools: 'Loja de Ferramentas & Habilidades',
    billing: 'Planos & Faturamento'
  };
  return titles[view] || view;
}

function navigate(view) {
  state.currentView = view;
  render();
  if (view === 'inbox' && state.conversations.length > 0 && !state.selectedConversation) {
    selectConversation(state.conversations[0].id);
  }
}

// --- VIEW COMPONENTS ---

function renderOverview() {
  const s = state.analytics?.summary || {
    totalConversations: 0,
    totalMessages: 0,
    totalLeads: 0,
    totalDocuments: 0,
    fastPathRate: '0%',
    estimatedSavingsUsd: '$0.00'
  };

  return `
    <div class="space-y-6">
      <!-- STATS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-card p-5 rounded-xl">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Conversas Totais</span>
            <i data-lucide="message-square" class="w-4 h-4 text-brand-400"></i>
          </div>
          <p class="text-2xl font-extrabold text-white">${s.totalConversations}</p>
          <span class="text-[11px] text-emerald-400 flex items-center mt-1"><i data-lucide="arrow-up-right" class="w-3 h-3 mr-0.5"></i> Omnichannel ativo</span>
        </div>

        <div class="glass-card p-5 rounded-xl">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Leads Capturados</span>
            <i data-lucide="users" class="w-4 h-4 text-indigo-400"></i>
          </div>
          <p class="text-2xl font-extrabold text-white">${s.totalLeads}</p>
          <span class="text-[11px] text-indigo-400 flex items-center mt-1">Prontos para vendas</span>
        </div>

        <div class="glass-card p-5 rounded-xl">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Taxa de Fast-Path</span>
            <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i>
          </div>
          <p class="text-2xl font-extrabold text-white">${s.fastPathRate}</p>
          <span class="text-[11px] text-amber-400 flex items-center mt-1">Economia de Tokens LLM</span>
        </div>

        <div class="glass-card p-5 rounded-xl">
          <div class="flex items-center justify-between text-slate-400 mb-2">
            <span class="text-xs font-semibold uppercase tracking-wider">Conhecimento RAG</span>
            <i data-lucide="file-check" class="w-4 h-4 text-emerald-400"></i>
          </div>
          <p class="text-2xl font-extrabold text-white">${s.totalDocuments} Docs</p>
          <span class="text-[11px] text-slate-400 flex items-center mt-1">Indexados no pgvector</span>
        </div>
      </div>

      <!-- BANNER WIDGET QUICK ACCESS -->
      <div class="p-6 rounded-2xl bg-gradient-to-r from-brand-900/60 to-slate-900 border border-brand-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 class="font-bold text-lg text-white">Integre o Chat no seu Site em 30 segundos</h3>
          <p class="text-xs text-slate-300 mt-1">Cole a tag de script no rodapé ou no &lt;head&gt; do seu site para ativar o chat flutuante com a inteligência artificial.</p>
        </div>
        <button onclick="navigate('channels')" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30 whitespace-nowrap">
          Configurar Canais
        </button>
      </div>
    </div>
  `;
}

function renderPersona() {
  const currentName = state.profile?.name || '';
  const currentPersona = state.profile?.systemPersona || '';

  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- CONFIG FORM -->
      <div class="glass-card p-6 rounded-2xl space-y-6">
        <h3 class="text-base font-bold text-white flex items-center space-x-2">
          <i data-lucide="sparkles" class="w-5 h-5 text-brand-400"></i>
          <span>Personalidade & Diretrizes do Assistente</span>
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nome do Assistente / Robô</label>
            <input type="text" id="botName" value="${currentName}" placeholder="Ex: Maya, Sofia, Alex, Assistente Virtual..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            ${renderHelper('botName', `
              <p><b>O que é:</b> O nome que o robô usará para se apresentar nas conversas.</p>
              <p><b>Dica:</b> Escolha um nome amigável e que combine com a identidade visual da sua empresa.</p>
            `)}
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Missão & Tom de Voz (Instruções da IA)</label>
            <textarea id="systemPersona" rows="5" placeholder="Ex: Você é o assistente virtual da [Nome da sua Empresa]. Seu objetivo é atender os clientes de forma educada, tirar dúvidas sobre [Seus Serviços ou Produtos] e pedir o telefone/WhatsApp para contato. Mantenha respostas curtas e objetivas." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">${currentPersona}</textarea>
            ${renderHelper('systemPersona', `
              <p><b>O que é:</b> Aqui você define o comportamento e a personalidade da sua IA.</p>
              <p><b>Exemplos do que você pode escrever:</b></p>
              <ul class="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li><i>"Fale de forma formal e profissional."</i> (para advocacia ou clínicas)</li>
                <li><i>"Seja descontraído, empolgado e use emojis."</i> (para lojas de roupas ou e-commerce)</li>
                <li><i>"Nunca dê descontos sem autorização prévia da gerência."</i> (regras de segurança)</li>
              </ul>
            `)}
          </div>

          <div class="pt-2">
            <button onclick="savePersonaConfig()" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30">
              Salvar Diretrizes da Persona
            </button>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE SANDBOX CHAT -->
      <div class="glass-card p-6 rounded-2xl flex flex-col h-[520px]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 class="text-sm font-bold text-white">Simulador de Conversa (Sandbox)</h3>
          </div>
          <button onclick="state.sandboxMessages = []; render();" class="text-xs text-slate-400 hover:text-slate-200">Limpar</button>
        </div>

        <div id="sandboxThread" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          ${state.sandboxMessages.map(m => `
            <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}">
                ${m.content}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="pt-3 border-t border-slate-800 flex gap-2">
          <input type="text" id="sandboxInput" placeholder="Faça uma pergunta para testar a IA..." onkeydown="if(event.key==='Enter') sendSandboxMessage()" class="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
          <button onclick="sendSandboxMessage()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-xs font-semibold">
            Enviar
          </button>
        </div>
      </div>
    </div>
  `;
}

async function savePersonaConfig() {
  const name = document.getElementById('botName')?.value.trim();
  const systemPersona = document.getElementById('systemPersona')?.value.trim();

  try {
    const res = await apiFetch('/client/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, systemPersona })
    });
    if (res && res.client) {
      state.profile = res.client;
      alert('Diretrizes da Persona salvas com sucesso no banco de dados!');
      loadDashboardData();
    }
  } catch (e) {
    alert('Erro ao salvar persona no servidor.');
  }
}

async function sendSandboxMessage() {
  const input = document.getElementById('sandboxInput');
  const text = input.value.trim();
  if (!text) return;

  state.sandboxMessages.push({ role: 'user', content: text });
  input.value = '';
  render();

  try {
    const res = await fetch(`${API_BASE}/channels/web/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, clientId: state.client.id, userId: 'sandbox_user' })
    });
    const data = await res.json();
    state.sandboxMessages.push({ role: 'model', content: data.response || 'Erro ao obter resposta.' });
  } catch (e) {
    state.sandboxMessages.push({ role: 'model', content: 'Erro de conexão com o servidor.' });
  }
  render();
}

function renderKnowledge() {
  return `
    <div class="space-y-6">
      <!-- UPLOAD & SCRAPER CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- File Upload -->
        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-bold text-white flex items-center space-x-2">
            <i data-lucide="upload-cloud" class="w-4 h-4 text-brand-400"></i>
            <span>Upload de Arquivos (PDF, TXT, CSV)</span>
          </h3>
          <p class="text-xs text-slate-400">Envie manuais, catálogos ou regras para o cérebro vetorial do bot.</p>
          <div class="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition" onclick="document.getElementById('fileInput').click()">
            <i data-lucide="file-up" class="w-8 h-8 text-slate-400 mx-auto mb-2"></i>
            <p class="text-xs text-slate-300 font-medium">Clique para selecionar arquivos do seu computador</p>
            <p class="text-[10px] text-slate-500 mt-1">Formatos aceitos: PDF, TXT ou CSV (até 10MB)</p>
            <input type="file" id="fileInput" class="hidden" accept=".pdf,.txt,.csv" onchange="uploadFile(this)">
          </div>
          ${renderHelper('fileUpload', `
            <p><b>Como funciona:</b> A IA lê o seu documento, divide em pedaços e armazena no banco de dados vetorial.</p>
            <p><b>O que você pode enviar:</b> Tabela de preços, cardápio, políticas de troca, contratos ou manuais de instrução.</p>
          `)}
        </div>

        <!-- URL Scraper -->
        <div class="glass-card p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-bold text-white flex items-center space-x-2">
            <i data-lucide="globe" class="w-4 h-4 text-indigo-400"></i>
            <span>Web Scraper de URLs (Site / FAQ)</span>
          </h3>
          <p class="text-xs text-slate-400">Cole o link de uma página do seu site para extrair e vetorizar automaticamente.</p>
          <div class="space-y-3">
            <input type="url" id="scrapeUrlInput" placeholder="Ex: https://suaempresa.com.br/duvidas-frequentes" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            <button onclick="scrapeUrl()" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition">
              Extrair e Vetorizar Página
            </button>
          </div>
          ${renderHelper('scrapeUrl', `
            <p><b>O que colocar aqui:</b> Qualquer link público do seu site que contenha informações úteis para os clientes.</p>
            <p><b>Exemplos:</b> Página "Sobre Nós", página de "Perguntas Frequentes", ou página de descrição dos seus serviços.</p>
          `)}
        </div>
      </div>

      <!-- SOURCES TABLE -->
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <h3 class="text-sm font-bold text-white">Documentos & Fontes Ativas</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="py-2.5 font-semibold">Fonte</th>
                <th class="py-2.5 font-semibold">Tipo</th>
                <th class="py-2.5 font-semibold">Chunks Vetorizados</th>
                <th class="py-2.5 font-semibold">Status</th>
                <th class="py-2.5 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${state.knowledgeSources.length === 0 ? `
                <tr><td colspan="5" class="py-4 text-center text-slate-500">Nenhum documento cadastrado ainda. Faça o upload acima para começar.</td></tr>
              ` : state.knowledgeSources.map(s => `
                <tr class="hover:bg-slate-800/30">
                  <td class="py-3 font-medium text-white">${s.fileName}</td>
                  <td class="py-3 uppercase text-brand-400 font-semibold">${s.fileType}</td>
                  <td class="py-3">${s.chunkCount || 0} fragmentos</td>
                  <td class="py-3"><span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">${s.status}</span></td>
                  <td class="py-3 text-right">
                    <button onclick="deleteSource('${s.id}')" class="text-slate-400 hover:text-rose-400 p-1">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function uploadFile(input) {
  const file = input.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', 'general');

  try {
    const res = await apiFetch('/knowledge/upload', {
      method: 'POST',
      body: formData
    });
    alert('Documento processado e vetorizado com sucesso!');
    loadDashboardData();
  } catch (e) {
    alert('Erro ao enviar arquivo.');
  }
}

async function scrapeUrl() {
  const url = document.getElementById('scrapeUrlInput').value.trim();
  if (!url) return alert('Por favor, digite uma URL válida.');

  try {
    await apiFetch('/knowledge/url', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    alert('Página web raspada e vetorizada!');
    loadDashboardData();
  } catch (e) {
    alert('Erro ao raspar URL.');
  }
}

async function deleteSource(id) {
  if (!confirm('Deseja excluir este documento e seus vetores?')) return;
  await apiFetch(`/knowledge/sources/${id}`, { method: 'DELETE' });
  loadDashboardData();
}

function renderChannels() {
  const clientId = state.client?.id || 'CLIENT_ID';
  const scriptSnippet = `<!-- Mini-Assistant Web Chat Widget -->\n<script src="${API_BASE}/widget.js" data-client-id="${clientId}" defer><\/script>`;
  const isQrMode = state.whatsappMode === 'qr';
  const phoneId = state.profile?.whatsappPhoneNumberId || '';

  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 1. WhatsApp Card -->
      <div class="glass-card p-6 rounded-2xl space-y-4 lg:col-span-1 border border-emerald-500/30">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <i data-lucide="phone" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">WhatsApp Business</h3>
            <span class="text-[10px] text-emerald-400 font-semibold">Atendimento 24/7</span>
          </div>
        </div>

        <!-- TABS QR CODE / META CLOUD -->
        <div class="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button onclick="setWhatsAppMode('qr')" class="flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition ${isQrMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            📱 QR Code (Fácil)
          </button>
          <button onclick="setWhatsAppMode('meta')" class="flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition ${!isQrMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            ☁️ Meta Cloud API
          </button>
        </div>

        ${isQrMode ? `
          <!-- MODO QR CODE -->
          <div class="space-y-4 text-center">
            <p class="text-xs text-slate-300">Conecte qualquer número de WhatsApp escaneando o QR Code abaixo:</p>
            
            <div class="bg-white p-3 rounded-2xl inline-block shadow-xl mx-auto border-4 border-emerald-500/40">
              <svg class="w-36 h-36 mx-auto text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h30 v30 h-30 z M5,5 v20 h20 v-20 z M10,10 h10 v10 h-10 z" />
                <path d="M70,0 h30 v30 h-30 z M75,5 v20 h20 v-20 z M80,10 h10 v10 h-10 z" />
                <path d="M0,70 h30 v30 h-30 z M5,75 v20 h20 v-20 z M10,80 h10 v10 h-10 z" />
                <rect x="40" y="10" width="8" height="8" />
                <rect x="55" y="10" width="8" height="8" />
                <rect x="40" y="25" width="8" height="8" />
                <rect x="45" y="45" width="10" height="10" fill="#059669" />
                <rect x="10" y="40" width="8" height="8" />
                <rect x="25" y="55" width="8" height="8" />
                <rect x="70" y="40" width="8" height="8" />
                <rect x="85" y="55" width="8" height="8" />
                <rect x="70" y="70" width="8" height="8" />
                <rect x="85" y="85" width="8" height="8" />
                <rect x="40" y="75" width="8" height="8" />
                <rect x="55" y="85" width="8" height="8" />
              </svg>
            </div>

            <div class="text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <p class="font-semibold text-white">Como conectar:</p>
              <p>1. Abra o WhatsApp no seu celular.</p>
              <p>2. Toque em <b>Aparelhos Conectados</b> ➔ <b>Conectar Aparelho</b>.</p>
              <p>3. Aponte a câmera para o QR Code acima.</p>
            </div>
          </div>
        ` : `
          <!-- MODO META CLOUD API -->
          <div class="space-y-3">
            <p class="text-xs text-slate-400">Para contas oficiais cadastradas no Meta for Developers.</p>
            <div>
              <label class="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number ID</label>
              <input type="text" id="waPhoneId" value="${phoneId}" placeholder="Ex: 109283746501928" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
              ${renderHelper('phoneId', 'O código numérico identificador do seu número de WhatsApp gerado no painel da Meta.')}
            </div>
            <div>
              <label class="block text-[11px] font-semibold text-slate-300 mb-1">Access Token da Meta</label>
              <input type="password" id="waToken" placeholder="Ex: EAAB..." class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
              ${renderHelper('accessToken', 'A chave secreta fornecida pela Meta que autoriza o envio seguro de mensagens.')}
            </div>
            <button onclick="saveWhatsAppMeta()" class="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition">
              Salvar Credenciais Meta
            </button>
          </div>
        `}
      </div>

      <!-- 2. Telegram Bot Card -->
      <div class="glass-card p-6 rounded-2xl space-y-4 lg:col-span-1">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <i data-lucide="send" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Telegram Bot</h3>
            <span class="text-[10px] text-sky-400 font-semibold">${state.profile?.hasTelegram ? '🟢 Conectado' : 'Atendimento no App'}</span>
          </div>
        </div>
        <p class="text-xs text-slate-400">Vincule o robô ao seu canal oficial de atendimento no Telegram.</p>
        <div>
          <label class="block text-[11px] font-semibold text-slate-300 mb-1">BotFather Token</label>
          <input type="text" id="tgTokenInput" placeholder="Ex: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
          ${renderHelper('telegramToken', `
            <p><b>Como pegar esse código:</b></p>
            <p>1. Abra o Telegram e procure por <b>@BotFather</b>.</p>
            <p>2. Envie <b>/newbot</b> e escolha um nome para seu robô.</p>
            <p>3. Copie o token enviado e cole aqui.</p>
          `)}
        </div>
        <button onclick="saveTelegramToken()" class="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition">
          Salvar Token do Telegram
        </button>
      </div>

      <!-- 3. Web Chat Widget Card -->
      <div class="glass-card p-6 rounded-2xl space-y-4 lg:col-span-1">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <i data-lucide="globe" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Chat no Site (Widget)</h3>
            <span class="text-[10px] text-blue-400 font-semibold">Copie e Cole</span>
          </div>
        </div>
        <p class="text-xs text-slate-400">Adicione o chat flutuante no seu site inserindo esta tag no HTML:</p>
        <pre class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-brand-300 overflow-x-auto select-all custom-scrollbar">${scriptSnippet}</pre>
        <button onclick="navigator.clipboard.writeText(\`${scriptSnippet}\`); alert('Código copiado para a área de transferência!')" class="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition">
          Copiar Código do Widget
        </button>
        ${renderHelper('widgetCode', 'Cole essa linha de código no rodapé (antes do &lt;/body&gt;) ou no cabeçalho do seu site para ativar o chat flutuante.')}
      </div>

    </div>
  `;
}

async function saveTelegramToken() {
  const botToken = document.getElementById('tgTokenInput')?.value.trim();
  if (!botToken) return alert('Por favor, informe o token do @BotFather.');

  try {
    await apiFetch('/client/channels/telegram', {
      method: 'PUT',
      body: JSON.stringify({ botToken })
    });
    alert('Token do Telegram salvo e criptografado com sucesso!');
    loadDashboardData();
  } catch (e) {
    alert('Erro ao salvar token do Telegram.');
  }
}

async function saveWhatsAppMeta() {
  const phoneNumberId = document.getElementById('waPhoneId')?.value.trim();
  const accessToken = document.getElementById('waToken')?.value.trim();
  if (!phoneNumberId) return alert('Por favor, informe o Phone Number ID.');

  try {
    await apiFetch('/client/channels/whatsapp', {
      method: 'PUT',
      body: JSON.stringify({ phoneNumberId, accessToken })
    });
    alert('Credenciais da Meta salvas com sucesso!');
    loadDashboardData();
  } catch (e) {
    alert('Erro ao salvar credenciais do WhatsApp.');
  }
}

function setWhatsAppMode(mode) {
  state.whatsappMode = mode;
  render();
}

function renderInbox() {
  return `
    <div class="glass-card rounded-2xl h-[620px] flex overflow-hidden border border-slate-800">
      <!-- CONVERSATION LIST -->
      <div class="w-80 border-r border-slate-800 flex flex-col bg-slate-900/40">
        <div class="p-4 border-b border-slate-800">
          <h3 class="text-sm font-bold text-white">Atendimentos Ativos</h3>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
          ${state.conversations.length === 0 ? `
            <p class="p-4 text-xs text-slate-500 text-center">Nenhuma conversa registrada ainda.</p>
          ` : state.conversations.map(c => `
            <div onclick="selectConversation('${c.id}')" class="p-3.5 cursor-pointer transition hover:bg-slate-800/40 ${state.selectedConversation?.id === c.id ? 'bg-brand-600/10 border-l-2 border-brand-500' : ''}">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-semibold text-white truncate">${c.name}</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${c.platform === 'whatsapp' ? 'bg-emerald-500/20 text-emerald-400' : c.platform === 'telegram' ? 'bg-sky-500/20 text-sky-400' : 'bg-blue-500/20 text-blue-400'}">${c.platform}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate">${c.lastMessage}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CHAT THREAD & HUMAN TAKEOVER -->
      <div class="flex-1 flex flex-col bg-dark-bg/60">
        ${!state.selectedConversation ? `
          <div class="flex-1 flex items-center justify-center text-slate-500 text-xs">
            Selecione uma conversa para visualizar o histórico e atender.
          </div>
        ` : `
          <!-- Header -->
          <div class="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/40">
            <div>
              <h4 class="text-xs font-bold text-white">${state.selectedConversation.name} (${state.selectedConversation.chatId})</h4>
              <span class="text-[10px] text-slate-400">Canal: ${state.selectedConversation.platform}</span>
            </div>
            <div class="flex items-center space-x-3">
              <button onclick="toggleAiPause()" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${state.selectedConversation.isAiPaused ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:text-white'}">
                ${state.selectedConversation.isAiPaused ? '⏸️ IA Pausada (Atendente Ativo)' : '🤖 IA Ativa (Pausar e Assumir)'}
              </button>
            </div>
          </div>

          <!-- Messages Body -->
          <div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
            ${state.messages.map(m => `
              <div class="flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}">
                <div class="max-w-[70%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-slate-800 text-slate-200' : m.role === 'agent' ? 'bg-amber-600 text-white' : 'bg-brand-600 text-white'}">
                  ${m.content}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Reply Input -->
          <div class="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/40">
            <input type="text" id="replyInput" placeholder="Envie uma mensagem manual como atendente humano..." onkeydown="if(event.key==='Enter') sendManualReply()" class="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            <button onclick="sendManualReply()" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-xs font-semibold">
              Responder
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

async function selectConversation(id) {
  const data = await apiFetch(`/inbox/conversations/${id}/messages`);
  if (!data) return;
  state.selectedConversation = data.endUser;
  state.messages = data.messages || [];
  render();
}

async function toggleAiPause() {
  if (!state.selectedConversation) return;
  const newStatus = !state.selectedConversation.isAiPaused;
  await apiFetch(`/inbox/conversations/${state.selectedConversation.id}/toggle-ai`, {
    method: 'POST',
    body: JSON.stringify({ pause: newStatus })
  });
  state.selectedConversation.isAiPaused = newStatus;
  render();
}

async function sendManualReply() {
  const input = document.getElementById('replyInput');
  const message = input.value.trim();
  if (!message || !state.selectedConversation) return;

  await apiFetch(`/inbox/conversations/${state.selectedConversation.id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ message })
  });

  input.value = '';
  selectConversation(state.selectedConversation.id);
}

function renderLeads() {
  return `
    <div class="glass-card p-6 rounded-2xl space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-white">Leads Capturados pela IA</h3>
        <span class="text-xs text-slate-400">Total: ${state.leads.length} leads</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="border-b border-slate-800 text-slate-400">
              <th class="py-2.5 font-semibold">Nome</th>
              <th class="py-2.5 font-semibold">Contato (WhatsApp/Email)</th>
              <th class="py-2.5 font-semibold">Interesse</th>
              <th class="py-2.5 font-semibold">Canal</th>
              <th class="py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60">
            ${state.leads.length === 0 ? `
              <tr><td colspan="5" class="py-4 text-center text-slate-500">Nenhum lead capturado ainda. A IA registrará contatos automaticamente durante as conversas.</td></tr>
            ` : state.leads.map(l => `
              <tr class="hover:bg-slate-800/30">
                <td class="py-3 font-semibold text-white">${l.name}</td>
                <td class="py-3 text-slate-300">${l.phone || l.email || 'N/A'}</td>
                <td class="py-3 text-brand-300 font-medium">${l.interest || 'Geral'}</td>
                <td class="py-3 uppercase text-[10px] font-bold text-slate-400">${l.sourceChannel}</td>
                <td class="py-3">
                  <span class="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold text-[10px]">${l.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTools() {
  const currentWebhook = state.profile?.webhookUrl || '';

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center space-x-2">
          <i data-lucide="calendar" class="w-4 h-4 text-emerald-400"></i>
          <span>Google Calendar (Agendamentos)</span>
        </h3>
        <p class="text-xs text-slate-400">Permite que o agente consulte horários livres e marque compromissos automaticamente.</p>
        <button onclick="alert('Conexão com o Google Calendar ativada com sucesso!')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition">
          Conectar Conta Google
        </button>
        ${renderHelper('googleCal', 'Conecta sua agenda para que o robô marque reuniões nos horários livres sem conflitos.')}
      </div>

      <div class="glass-card p-6 rounded-2xl space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center space-x-2">
          <i data-lucide="webhook" class="w-4 h-4 text-brand-400"></i>
          <span>Webhook para CRM (HubSpot / Make / Zapier)</span>
        </h3>
        <p class="text-xs text-slate-400">Dispare eventos HTTP para sistemas externos toda vez que um novo lead for capturado.</p>
        <input type="url" id="webhookInput" value="${currentWebhook}" placeholder="Ex: https://hook.eu1.make.com/abc123xyz" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
        <button onclick="saveWebhookUrl()" class="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition">
          Salvar URL de Webhook
        </button>
        ${renderHelper('crmWebhook', 'Link opcional para enviar uma cópia instantânea dos dados do cliente para outro software de vendas.')}
      </div>
    </div>
  `;
}

async function saveWebhookUrl() {
  const webhookUrl = document.getElementById('webhookInput')?.value.trim();

  try {
    await apiFetch('/client/tools/webhook', {
      method: 'PUT',
      body: JSON.stringify({ webhookUrl })
    });
    alert('URL de Webhook salva com sucesso no banco de dados!');
    loadDashboardData();
  } catch (e) {
    alert('Erro ao salvar Webhook.');
  }
}

function renderBilling() {
  const b = state.billing || {
    plan: 'basic',
    monthlyMessageLimit: 1000,
    currentMessagesCount: 0,
    usagePercentage: 0
  };

  return `
    <div class="space-y-6 max-w-4xl">
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Plano Atual</span>
            <h3 class="text-xl font-extrabold text-white capitalize">${b.plan}</h3>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">Assinatura Ativa</span>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs text-slate-300">
            <span>Consumo Mensal de Mensagens</span>
            <span>${b.currentMessagesCount} / ${b.monthlyMessageLimit} (${b.usagePercentage}%)</span>
          </div>
          <div class="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div class="h-full bg-brand-500 rounded-full transition-all" style="width: ${b.usagePercentage}%"></div>
          </div>
        </div>
      </div>

      <!-- PRICING TIERS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${renderPlanCard('Basic', 'R$ 97', '1.000 msgs/mês', ['Orquestrador Multi-Agente', 'RAG com 10 Documentos', 'Widget Web', 'Cache Semântico'], b.plan === 'basic')}
        ${renderPlanCard('Pro', 'R$ 297', '5.000 msgs/mês', ['Tudo do Basic', 'WhatsApp & Telegram', 'Dynamic Tools (Google Calendar)', 'Leads CRM Ilimitados'], b.plan === 'pro')}
        ${renderPlanCard('Enterprise', 'R$ 697', '25.000 msgs/mês', ['Tudo do Pro', 'Multi-LLM Fallback SLA 99.9%', 'Suporte Dedicado', 'Custom Webhooks'], b.plan === 'enterprise')}
      </div>
    </div>
  `;
}

function renderPlanCard(name, price, limit, features, isCurrent) {
  return `
    <div class="glass-card p-6 rounded-2xl flex flex-col justify-between border ${isCurrent ? 'border-brand-500 bg-brand-950/20' : 'border-slate-800'}">
      <div>
        <h4 class="font-bold text-base text-white">${name}</h4>
        <p class="text-2xl font-extrabold text-white mt-2">${price}<span class="text-xs text-slate-400 font-normal">/mês</span></p>
        <span class="text-xs text-brand-300 font-semibold mt-1 block">${limit}</span>

        <ul class="mt-4 space-y-2 text-xs text-slate-300">
          ${features.map(f => `<li class="flex items-center space-x-2"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400"></i><span>${f}</span></li>`).join('')}
        </ul>
      </div>

      <button onclick="upgradePlan('${name.toLowerCase()}')" class="w-full mt-6 py-2 rounded-xl text-xs font-semibold transition ${isCurrent ? 'bg-slate-800 text-slate-400 cursor-default' : 'bg-brand-600 hover:bg-brand-500 text-white'}">
        ${isCurrent ? 'Plano Atual' : 'Fazer Upgrade'}
      </button>
    </div>
  `;
}

async function upgradePlan(plan) {
  try {
    await apiFetch('/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ newPlan: plan })
    });
    alert(`Plano alterado para ${plan.toUpperCase()} com sucesso!`);
    loadDashboardData();
  } catch (e) {
    alert('Erro ao trocar plano.');
  }
}

function renderCurrentView() {
  switch (state.currentView) {
    case 'overview': return renderOverview();
    case 'persona': return renderPersona();
    case 'knowledge': return renderKnowledge();
    case 'channels': return renderChannels();
    case 'inbox': return renderInbox();
    case 'leads': return renderLeads();
    case 'tools': return renderTools();
    case 'billing': return renderBilling();
    default: return renderOverview();
  }
}

function renderAuthView() {
  const isLogin = state.authMode === 'login';

  return `
    <div class="min-h-screen flex items-center justify-center p-4">
      <div class="w-full max-w-md glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-brand-500/30">
            <i data-lucide="bot" class="w-7 h-7 text-white"></i>
          </div>
          <h2 class="text-xl font-extrabold text-white">Mini-Assistant SaaS</h2>
          <p class="text-xs text-slate-400 mt-1">Painel Administrativo Multi-Agente Enterprise</p>
        </div>

        <!-- TABS LOGIN / CADASTRO -->
        <div class="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800 mb-6">
          <button onclick="setAuthMode('login')" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${isLogin ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            Entrar (Login)
          </button>
          <button onclick="setAuthMode('register')" class="flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${!isLogin ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            Criar Nova Conta
          </button>
        </div>

        ${isLogin ? `
          <!-- LOGIN FORM -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">E-mail Corporativo</label>
              <input type="email" id="authEmail" placeholder="Ex: contato@suaempresa.com" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
              ${renderHelper('authLoginEmail', 'O e-mail cadastrado como administrador da sua empresa.')}
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Senha</label>
              <input type="password" id="authPassword" placeholder="Sua senha secreta" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
              ${renderHelper('authLoginPass', 'A senha que você definiu ao criar sua conta.')}
            </div>

            <button onclick="handleLogin()" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30">
              Entrar no Painel
            </button>
          </div>
        ` : `
          <!-- REGISTER FORM -->
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Seu Nome</label>
              <input type="text" id="regName" placeholder="Ex: Carlos Silva" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa</label>
              <input type="text" id="regCompany" placeholder="Ex: Consultoria Alpha, Loja Bela Vista..." class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
              ${renderHelper('regCompanyHelp', 'O nome da sua empresa que aparecerá no cabeçalho do painel.')}
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">E-mail Corporativo</label>
              <input type="email" id="regEmail" placeholder="Ex: contato@empresa.com" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Criar Senha</label>
              <input type="password" id="regPassword" placeholder="Crie uma senha segura (mínimo 6 caracteres)" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            </div>

            <button onclick="handleRegister()" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30 mt-2">
              Cadastrar e Acessar Painel
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

function setAuthMode(mode) {
  state.authMode = mode;
  render();
}

function handleLogin() {
  const email = document.getElementById('authEmail').value.trim();
  const password = document.getElementById('authPassword').value.trim();
  if (!email || !password) return alert('Por favor, preencha seu e-mail e senha.');
  login(email, password);
}

function handleRegister() {
  const name = document.getElementById('regName').value.trim();
  const company = document.getElementById('regCompany').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  if (!name || !company || !email || !password) {
    return alert('Por favor, preencha todos os campos do formulário.');
  }

  register(name, email, password, company);
}

function initIcons() {
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
  render();
  if (state.token) {
    loadDashboardData();
  }
});
