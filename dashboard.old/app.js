// Mini-Assistant SaaS Enterprise Dashboard App
const API_BASE = window.location.origin;

let qrPollingInterval = null;

const state = {
  token: localStorage.getItem('saas_token') || '',
  client: JSON.parse(localStorage.getItem('saas_client') || 'null'),
  profile: null,
  currentView: 'overview',
  authMode: 'login', // 'login' | 'register'
  analytics: null,
  knowledgeSources: [],
  leads: [],
  conversations: [],
  selectedConversation: null,
  messages: [],
  billing: null,
  sandboxMessages: [
    { role: 'model', content: 'Olá! Sou seu assistente de inteligência artificial. Como posso ajudar você hoje?' }
  ],
  sandboxLoading: false,
  loading: false,
};

// --- GLOBAL TOAST NOTIFICATION COMPONENT ---
function showToast(message, type = 'info', title = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toastId = 'toast-' + Math.random().toString(36).substring(2, 9);
  
  const typeConfig = {
    success: {
      bg: 'bg-emerald-950/90',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
      icon: 'check-circle-2',
      defaultTitle: 'Sucesso'
    },
    error: {
      bg: 'bg-rose-950/90',
      border: 'border-rose-500/40',
      text: 'text-rose-300',
      icon: 'alert-triangle',
      defaultTitle: 'Erro'
    },
    warning: {
      bg: 'bg-amber-950/90',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
      icon: 'alert-circle',
      defaultTitle: 'Atenção'
    },
    info: {
      bg: 'bg-slate-900/95',
      border: 'border-brand-500/40',
      text: 'text-brand-300',
      icon: 'info',
      defaultTitle: 'Informação'
    }
  };

  const cfg = typeConfig[type] || typeConfig.info;
  const heading = title || cfg.defaultTitle;

  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl ${cfg.bg} border ${cfg.border} backdrop-blur-xl shadow-2xl toast-enter transition-all duration-300`;
  toast.innerHTML = `
    <div class="${cfg.text} shrink-0 mt-0.5">
      <i data-lucide="${cfg.icon}" class="w-5 h-5"></i>
    </div>
    <div class="flex-1 text-left">
      <h4 class="text-xs font-bold text-white leading-tight">${heading}</h4>
      <p class="text-xs ${cfg.text} mt-0.5 leading-relaxed">${message}</p>
    </div>
    <button onclick="dismissToast('${toastId}')" class="text-slate-400 hover:text-white transition shrink-0 p-1 -mr-1 -mt-1">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  initIcons();

  setTimeout(() => {
    dismissToast(toastId);
  }, 4000);
}

function dismissToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  toast.classList.remove('toast-enter');
  toast.classList.add('toast-exit');
  setTimeout(() => {
    toast.remove();
  }, 260);
}

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
    
    showToast('Login realizado com sucesso!', 'success');
    render();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
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
    if (!res.ok) throw new Error(data.error || 'Erro ao registrar empresa.');
    
    state.token = data.token;
    state.client = data.client;
    localStorage.setItem('saas_token', data.token);
    localStorage.setItem('saas_client', JSON.stringify(data.client));
    
    showToast('Conta criada com sucesso! Seja bem-vindo ao painel.', 'success');
    render();
    loadDashboardData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function logout() {
  stopQrPolling();
  state.token = '';
  state.client = null;
  state.profile = null;
  localStorage.removeItem('saas_token');
  localStorage.removeItem('saas_client');
  showToast('Sessão encerrada com sucesso.', 'info');
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
    if (profile?.name && state.client) {
      state.client.name = profile.name;
    }

    // Checa status do Baileys
    if (state.client?.id) {
      checkBaileysStatus(false);
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
  if (!app) return;

  if (!state.token) {
    app.innerHTML = renderAuthView();
    initIcons();
    return;
  }

  app.innerHTML = `
    <div class="flex h-screen overflow-hidden">
      <!-- SIDEBAR -->
      <aside class="w-64 glass border-r border-slate-800 flex flex-col justify-between p-4 z-20 shrink-0">
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
              <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
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
      <main class="flex-1 flex flex-col overflow-y-auto custom-scrollbar bg-dark-bg min-w-0">
        <!-- TOP HEADER -->
        <header class="h-16 glass border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
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
              <span>Motor Baileys Online</span>
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
    persona: 'Personalidade & Diretrizes do Assistente',
    knowledge: 'Base de Conhecimento RAG',
    channels: 'Hub de Canais & Conexões',
    inbox: 'Inbox de Conversas & Handoff Humano',
    leads: 'Gestão de Leads & CRM',
    tools: 'Habilidades & Integrações (Tools)',
    billing: 'Planos & Faturamento White-Label'
  };
  return titles[view] || 'Painel';
}

function navigate(viewId) {
  state.currentView = viewId;
  render();
}

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// --- VIEWS ---

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

// 1. OVERVIEW VIEW
function renderOverview() {
  const a = state.analytics || {
    messagesTotal: 0,
    leadsTotal: 0,
    fastPathRatio: '0%',
    activeChannels: { whatsapp: false, telegram: false, web: true },
    recentActivity: []
  };

  return `
    <div class="space-y-8">
      <!-- KPI METRIC CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="glass-card p-5 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-medium uppercase tracking-wider">Mensagens Totais</span>
            <i data-lucide="message-square" class="w-4 h-4 text-brand-400"></i>
          </div>
          <p class="text-2xl font-bold text-white">${a.messagesTotal || 0}</p>
          <p class="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
            <i data-lucide="trending-up" class="w-3 h-3"></i>
            <span>+12% em relação ao mês anterior</span>
          </p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-medium uppercase tracking-wider">Leads Capturados</span>
            <i data-lucide="users" class="w-4 h-4 text-emerald-400"></i>
          </div>
          <p class="text-2xl font-bold text-white">${a.leadsTotal || state.leads.length || 0}</p>
          <p class="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
            <i data-lucide="check-circle-2" class="w-3 h-3"></i>
            <span>100% qualificados automaticamente</span>
          </p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-medium uppercase tracking-wider">Economia Fast-Path</span>
            <i data-lucide="zap" class="w-4 h-4 text-amber-400"></i>
          </div>
          <p class="text-2xl font-bold text-amber-300">${a.fastPathRatio || '85%'}</p>
          <p class="text-[11px] text-slate-400">Das respostas servidas com Zero Tokens</p>
        </div>

        <div class="glass-card p-5 rounded-2xl space-y-2">
          <div class="flex items-center justify-between text-slate-400">
            <span class="text-xs font-medium uppercase tracking-wider">Status do Motor</span>
            <i data-lucide="cpu" class="w-4 h-4 text-sky-400"></i>
          </div>
          <p class="text-2xl font-bold text-emerald-400">Ativo & Operando</p>
          <p class="text-[11px] text-slate-400">Circuit-Breaker & Fallback Ativados</p>
        </div>
      </div>

      <!-- QUICK ONBOARDING CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="glass p-6 rounded-2xl space-y-4 border border-brand-500/20">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
              <i data-lucide="sparkles" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">1. Personalize o Agente</h3>
              <p class="text-xs text-slate-400">Defina tom de voz e regras</p>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">Configure a missão e o comportamento da sua IA para falar a língua da sua marca.</p>
          <button onclick="navigate('persona')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition">
            Editar Persona
          </button>
        </div>

        <div class="glass p-6 rounded-2xl space-y-4 border border-indigo-500/20">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <i data-lucide="brain" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">2. Ingestão de Dados (RAG)</h3>
              <p class="text-xs text-slate-400">Carregue manuais e links</p>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">Envie PDFs ou cole a URL do seu site para que a IA aprenda seus produtos e FAQs.</p>
          <button onclick="navigate('knowledge')" class="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition">
            Gerenciar Base
          </button>
        </div>

        <div class="glass p-6 rounded-2xl space-y-4 border border-emerald-500/20">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <i data-lucide="share-2" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white">3. Ative os Canais</h3>
              <p class="text-xs text-slate-400">WhatsApp Baileys, Telegram e Web</p>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">Conecte seu WhatsApp via QR Code ou copie a tag do Web Widget para o seu site.</p>
          <button onclick="navigate('channels')" class="w-full py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/20">
            Conectar Canais
          </button>
        </div>
      </div>
    </div>
  `;
}

// 2. PERSONA VIEW
function renderPersona() {
  const currentPersona = state.profile?.systemPersona || 'Você é o assistente virtual inteligente da empresa. Seu objetivo é atender os clientes com simpatia, esclarecer dúvidas e coletar contatos de forma natural.';
  const botName = state.profile?.name || state.client?.name || 'Assistente Virtual';

  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- PERSONA CONFIGURATION FORM -->
      <div class="glass-card p-6 rounded-2xl space-y-6">
        <div class="border-b border-slate-800 pb-4">
          <h3 class="text-sm font-bold text-white flex items-center space-x-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-brand-400"></i>
            <span>Diretrizes Gerais do Assistente</span>
          </h3>
          <p class="text-xs text-slate-400 mt-1">Defina a identidade, tom de voz e regras de atendimento.</p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Nome do Assistente / Empresa</label>
            <input type="text" id="botName" value="${botName}" placeholder="Ex: Sofia (Atendente Virtual da ModuloWeb)" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            ${renderHelper('botName', 'O nome com o qual o assistente se apresentará aos seus clientes.')}
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Missão & Tom de Voz (Prompt de Sistema)</label>
            <textarea id="systemPersona" rows="8" placeholder="Descreva detalhadamente como o assistente deve responder..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none custom-scrollbar">${currentPersona}</textarea>
            ${renderHelper('systemPersona', `
              <p><b>Dica de Estrutura:</b></p>
              <p>1. Quem é o assistente? (Ex: Atendente comercial cordial da empresa X).</p>
              <p>2. Qual o tom de voz? (Ex: Amigável, consultivo, objetivo e sem gírias).</p>
              <p>3. O que fazer se não souber a resposta? (Ex: Pedir o WhatsApp do cliente para um atendente humano responder).</p>
            `)}
          </div>

          <div class="pt-2">
            <button onclick="savePersonaConfig()" class="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/30 flex items-center space-x-2">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Salvar Diretrizes da Persona</span>
            </button>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE SANDBOX CHAT -->
      <div class="glass-card p-6 rounded-2xl flex flex-col h-[560px]">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div class="flex items-center space-x-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 class="text-sm font-bold text-white">Simulador de Conversa (Sandbox)</h3>
          </div>
          <button onclick="state.sandboxMessages = [{ role: 'model', content: 'Olá! Sou sua inteligência artificial. Como posso ajudar você hoje?' }]; render();" class="text-xs text-slate-400 hover:text-slate-200 transition">
            Limpar Chat
          </button>
        </div>

        <div id="sandboxThread" class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          ${state.sandboxMessages.map(m => `
            <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
              <div class="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-800 text-slate-200 border border-slate-700'}">
                ${m.content}
              </div>
            </div>
          `).join('')}
          ${state.sandboxLoading ? `
            <div class="flex justify-start">
              <div class="rounded-2xl px-4 py-2.5 text-xs bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-brand-400 animate-bounce"></span>
                <span class="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style="animation-delay: 0.2s"></span>
                <span class="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style="animation-delay: 0.4s"></span>
                <span class="text-[11px] ml-1 text-slate-400">Pensando...</span>
              </div>
            </div>
          ` : ''}
        </div>

        <div class="pt-3 border-t border-slate-800 flex gap-2 shrink-0">
          <input type="text" id="sandboxInput" placeholder="Faça uma pergunta para testar a IA..." onkeydown="if(event.key==='Enter') sendSandboxMessage()" class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
          <button onclick="sendSandboxMessage()" class="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 rounded-xl text-white text-xs font-semibold flex items-center space-x-1.5 transition">
            <span>Enviar</span>
            <i data-lucide="send" class="w-3.5 h-3.5"></i>
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
      showToast('Diretrizes da Persona salvas e sincronizadas!', 'success');
      loadDashboardData();
    }
  } catch (e) {
    showToast('Erro ao salvar persona no servidor.', 'error');
  }
}

async function sendSandboxMessage() {
  const input = document.getElementById('sandboxInput');
  const text = input ? input.value.trim() : '';
  if (!text || state.sandboxLoading) return;

  state.sandboxMessages.push({ role: 'user', content: text });
  state.sandboxLoading = true;
  if (input) input.value = '';
  render();

  const thread = document.getElementById('sandboxThread');
  if (thread) thread.scrollTop = thread.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/channels/web/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, clientId: state.client?.id, userId: 'sandbox_user' })
    });
    const data = await res.json();
    
    if (res.ok && data.response) {
      state.sandboxMessages.push({ role: 'model', content: data.response });
    } else {
      state.sandboxMessages.push({ role: 'model', content: data.error || 'Não foi possível obter uma resposta no momento.' });
    }
  } catch (e) {
    state.sandboxMessages.push({ role: 'model', content: 'Erro de conexão com o servidor.' });
  } finally {
    state.sandboxLoading = false;
    render();
    const thread = document.getElementById('sandboxThread');
    if (thread) thread.scrollTop = thread.scrollHeight;
  }
}

// 3. KNOWLEDGE VIEW
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
            <button onclick="scrapeUrl()" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2">
              <i data-lucide="download-cloud" class="w-4 h-4"></i>
              <span>Extrair e Vetorizar Página</span>
            </button>
          </div>
          ${renderHelper('scrapeUrl', `
            <p><b>O que colocar aqui:</b> Qualquer link público do seu site que contenha informações úteis para os clientes.</p>
            <p><b>Exemplos:</b> Página 'Sobre Nós', página de 'Perguntas Frequentes', ou descrição dos serviços.</p>
          `)}
        </div>
      </div>

      <!-- SOURCES TABLE -->
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white">Documentos & Fontes Ativas na Memória Vetorial</h3>
          <span class="text-xs text-slate-400">Total: ${state.knowledgeSources.length} fontes</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400">
                <th class="py-2.5 font-semibold">Fonte</th>
                <th class="py-2.5 font-semibold">Tipo</th>
                <th class="py-2.5 font-semibold">Fragmentos (Chunks)</th>
                <th class="py-2.5 font-semibold">Status</th>
                <th class="py-2.5 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              ${state.knowledgeSources.length === 0 ? `
                <tr><td colspan="5" class="py-6 text-center text-slate-500">Nenhum documento cadastrado ainda. Faça o upload acima para começar a treinar seu bot.</td></tr>
              ` : state.knowledgeSources.map(s => `
                <tr class="hover:bg-slate-800/30">
                  <td class="py-3 font-medium text-white">${s.fileName}</td>
                  <td class="py-3 uppercase text-brand-400 font-semibold">${s.fileType}</td>
                  <td class="py-3 text-slate-300">${s.chunkCount || 0} fragmentos</td>
                  <td class="py-3"><span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">${s.status}</span></td>
                  <td class="py-3 text-right">
                    <button onclick="deleteSource('${s.id}')" class="text-slate-400 hover:text-rose-400 p-1 transition" title="Excluir">
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

  showToast('Enviando e processando documento...', 'info');

  try {
    const res = await apiFetch('/knowledge/upload', {
      method: 'POST',
      body: formData
    });
    if (res && res.documentId) {
      showToast('Documento processado e vetorizado com sucesso!', 'success');
      loadDashboardData();
    } else {
      showToast(res?.error || 'Erro ao processar arquivo.', 'error');
    }
  } catch (e) {
    showToast('Erro ao enviar arquivo.', 'error');
  }
}

async function scrapeUrl() {
  const url = document.getElementById('scrapeUrlInput')?.value.trim();
  if (!url) return showToast('Por favor, digite uma URL válida.', 'warning');

  showToast('Raspando e vetorizando URL...', 'info');

  try {
    const res = await apiFetch('/knowledge/url', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
    if (res && res.documentId) {
      showToast('Página web raspada e vetorizada com sucesso!', 'success');
      loadDashboardData();
    } else {
      showToast(res?.error || 'Erro ao raspar URL.', 'error');
    }
  } catch (e) {
    showToast('Erro ao raspar URL.', 'error');
  }
}

async function deleteSource(id) {
  if (!confirm('Deseja excluir este documento e todos os seus vetores da base de conhecimento?')) return;
  try {
    await apiFetch(`/knowledge/sources/${id}`, { method: 'DELETE' });
    showToast('Documento removido com sucesso!', 'info');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao excluir documento.', 'error');
  }
}

// 4. CHANNELS VIEW
function renderChannels() {
  const clientId = state.client?.id || 'CLIENT_ID';
  const scriptSnippet = `<script src="${API_BASE}/widget.js" data-client-id="${clientId}" defer></script>`;
  const phoneId = state.profile?.whatsappPhoneNumberId || '';
  const currentDomains = Array.isArray(state.profile?.allowedDomains) ? state.profile.allowedDomains.join(', ') : '*';
  const tgVerifyToken = state.profile?.telegramVerifyToken || '';

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
            <span class="text-[10px] text-emerald-400 font-bold">
              ☁️ Meta Cloud API
            </span>
          </div>
        </div>

        <!-- MODO META CLOUD API -->
        <div class="space-y-3">
          <p class="text-xs text-slate-400 leading-relaxed">Para contas oficiais cadastradas no Meta for Developers.</p>
          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number ID</label>
            <input type="text" id="waPhoneId" value="${phoneId}" placeholder="Ex: 109283746501928" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            ${renderHelper('phoneId', 'O código numérico identificador do seu número gerado no painel da Meta for Developers.')}
          </div>
          <div>
            <label class="block text-[11px] font-semibold text-slate-300 mb-1">Access Token da Meta</label>
            <input type="password" id="waToken" placeholder="Ex: EAAB..." class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            ${renderHelper('accessToken', 'A chave secreta fornecida pela Meta que autoriza o envio seguro de mensagens.')}
          </div>
          <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1 text-[11px] text-slate-300">
            <p class="font-semibold text-white">Configuração do Webhook na Meta:</p>
            <p class="text-slate-400 font-mono select-all text-[10px]">${API_BASE}/webhook/whatsapp</p>
            <p class="text-slate-400 text-[10px]">Token de Verificação: <b class="text-emerald-400">verify_token_dev</b></p>
          </div>
          <button onclick="saveWhatsAppMeta()" class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20">
            Salvar Credenciais Meta
          </button>
        </div>
      </div>

      <!-- 2. Telegram Bot Card -->
      <div class="glass-card p-6 rounded-2xl space-y-4 lg:col-span-1">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <i data-lucide="send" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Telegram Bot</h3>
            <span class="text-[10px] text-sky-400 font-semibold">${state.profile?.hasTelegram ? '🟢 Conectado' : 'Atendimento no Telegram'}</span>
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

        <div>
          <label class="block text-[11px] font-semibold text-slate-300 mb-1">URL Pública do Servidor (Opcional para Localhost/Ngrok)</label>
          <input type="text" id="tgPublicUrlInput" placeholder="Ex: https://meudominio.com ou ngrok URL" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
        </div>

        ${tgVerifyToken ? `
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <p class="font-semibold text-white">Webhook do seu bot:</p>
            <p class="font-mono text-[10px] text-sky-300 select-all">${API_BASE}/channels/telegram/${tgVerifyToken}</p>
          </div>
        ` : ''}

        <button onclick="saveTelegramToken()" class="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition shadow-lg shadow-sky-600/20">
          Salvar e Conectar Telegram
        </button>
      </div>

      <!-- 3. Web Chat Widget Card -->
      <div class="glass-card p-6 rounded-2xl space-y-4 lg:col-span-1 border border-brand-500/20">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <i data-lucide="globe" class="w-5 h-5"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-white">Chat no Site (Web Widget)</h3>
            <span class="text-[10px] text-blue-400 font-semibold">Tag de Incorporação</span>
          </div>
        </div>
        
        <p class="text-xs text-slate-300 leading-relaxed">
          Copie o código abaixo e cole no HTML do seu site para ativar o chat flutuante instantaneamente:
        </p>

        <!-- SCRIPT TAG DISPLAY BOX -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[11px] font-semibold text-slate-300">
            <span>Tag de Instalação (Script)</span>
            <span class="text-[10px] text-brand-400">HTML Embed</span>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-950 border border-brand-500/30 text-[11px] text-brand-300 font-mono select-all break-all custom-scrollbar">
            ${escapeHtml(scriptSnippet)}
          </div>
        </div>

        <button onclick="navigator.clipboard.writeText(\`${scriptSnippet}\`); showToast('Código do widget copiado com sucesso!', 'success');" class="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/20">
          <i data-lucide="copy" class="w-4 h-4"></i>
          <span>Copiar Código do Widget</span>
        </button>

        <div class="pt-2 border-t border-slate-800/80 space-y-2">
          <label class="block text-[11px] font-semibold text-slate-300">Domínios Autorizados</label>
          <div class="flex gap-2">
            <input type="text" id="allowedDomainsInput" value="${currentDomains}" placeholder="Ex: seusite.com.br, *" class="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            <button onclick="saveAllowedDomains()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition">
              Salvar
            </button>
          </div>
          <p class="text-[10px] text-slate-400">Use <b class="text-white">*</b> para permitir qualquer site ou informe domínios separados por vírgula.</p>
        </div>

        ${renderHelper('widgetCode', 'Cole a tag copiada logo antes do fechamento da tag &lt;/body&gt; ou no &lt;head&gt; do seu site WordPress, Wix, Shopify ou HTML puro.')}
      </div>

    </div>
  `;
}

function escapeHtml(string) {
  return String(string).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function setWhatsAppMode(mode) {
  state.whatsappMode = mode;
  render();
}

async function saveAllowedDomains() {
  const input = document.getElementById('allowedDomainsInput');
  const allowedDomains = input ? input.value.trim() : '*';

  try {
    await apiFetch('/client/channels/domains', {
      method: 'PUT',
      body: JSON.stringify({ allowedDomains })
    });
    showToast('Domínios autorizados atualizados com sucesso!', 'success');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao atualizar domínios.', 'error');
  }
}

async function saveTelegramToken() {
  const botToken = document.getElementById('tgTokenInput')?.value.trim();
  const publicBaseUrl = document.getElementById('tgPublicUrlInput')?.value.trim();

  if (!botToken) return showToast('Por favor, informe o token do @BotFather.', 'warning');

  try {
    const res = await apiFetch('/client/channels/telegram', {
      method: 'PUT',
      body: JSON.stringify({ botToken, publicBaseUrl })
    });
    
    if (res && res.verifyToken) {
      if (res.registeredWithTelegram) {
        showToast('Token salvo e Webhook registrado automaticamente no Telegram!', 'success');
      } else {
        showToast('Token do Telegram salvo com sucesso!', 'success');
      }
      loadDashboardData();
    } else {
      showToast('Erro ao salvar token do Telegram.', 'error');
    }
  } catch (e) {
    showToast('Erro ao salvar token do Telegram.', 'error');
  }
}

async function saveWhatsAppMeta() {
  const phoneNumberId = document.getElementById('waPhoneId')?.value.trim();
  const accessToken = document.getElementById('waToken')?.value.trim();

  if (!phoneNumberId) return showToast('Por favor, informe o Phone Number ID da Meta.', 'warning');

  try {
    await apiFetch('/client/channels/whatsapp', {
      method: 'PUT',
      body: JSON.stringify({ phoneNumberId, accessToken })
    });
    showToast('Credenciais da Meta salvas com sucesso!', 'success');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao salvar credenciais do WhatsApp.', 'error');
  }
}

// 5. INBOX VIEW
function renderInbox() {
  return `
    <div class="glass-card rounded-2xl flex h-[620px] overflow-hidden border border-slate-800">
      <!-- CONVERSATIONS LIST -->
      <div class="w-80 border-r border-slate-800 flex flex-col bg-slate-950/40 shrink-0">
        <div class="p-4 border-b border-slate-800">
          <h3 class="text-sm font-bold text-white">Atendimentos ao Vivo</h3>
          <span class="text-xs text-slate-400">${state.conversations.length} conversas registradas</span>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
          ${state.conversations.length === 0 ? `
            <div class="p-6 text-center text-xs text-slate-500">Nenhuma conversa ativa no momento.</div>
          ` : state.conversations.map(c => `
            <div onclick="selectConversation('${c.id}')" class="p-3.5 hover:bg-slate-800/50 cursor-pointer transition ${state.selectedConversation?.id === c.id ? 'bg-slate-800/70 border-l-2 border-brand-500' : ''}">
              <div class="flex items-center justify-between mb-1">
                <p class="text-xs font-semibold text-white truncate">${c.name || 'Usuário ' + c.chatId.slice(0,6)}</p>
                <span class="text-[10px] uppercase font-bold text-slate-400">${c.platform || 'web'}</span>
              </div>
              <p class="text-[11px] text-slate-400 truncate">${c.lastMessage || 'Conversa iniciada'}</p>
              ${c.isAiPaused ? `<span class="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">Atendimento Humano</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CHAT MESSAGE THREAD -->
      <div class="flex-1 flex flex-col bg-slate-900/30 min-w-0">
        ${state.selectedConversation ? `
          <div class="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                ${state.selectedConversation.name?.[0] || 'U'}
              </div>
              <div>
                <p class="text-xs font-bold text-white">${state.selectedConversation.name || 'Cliente ' + state.selectedConversation.chatId}</p>
                <p class="text-[10px] text-slate-400">Canal: ${state.selectedConversation.platform || 'Web'}</p>
              </div>
            </div>

            <button onclick="toggleHumanHandoff('${state.selectedConversation.id}')" class="px-3 py-1.5 rounded-lg text-xs font-semibold transition ${state.selectedConversation.isAiPaused ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white'}">
              ${state.selectedConversation.isAiPaused ? '▶️ Reativar IA' : '⏸️ Assumir Atendimento'}
            </button>
          </div>

          <div id="inboxMessages" class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
            ${state.messages.map(m => `
              <div class="flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}">
                <div class="max-w-[70%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-slate-800 text-white border border-slate-700' : (m.role === 'agent' ? 'bg-amber-600 text-white' : 'bg-brand-600 text-white')}">
                  <p class="text-[10px] opacity-70 font-bold mb-0.5">${m.role === 'user' ? 'Cliente' : (m.role === 'agent' ? 'Atendente Humano' : 'Assistente IA')}</p>
                  ${m.content}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="p-4 border-t border-slate-800 flex gap-2 shrink-0">
            <input type="text" id="inboxInput" placeholder="Digite sua resposta humana para o cliente..." onkeydown="if(event.key==='Enter') sendInboxMessage()" class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            <button onclick="sendInboxMessage()" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition">
              Enviar
            </button>
          </div>
        ` : `
          <div class="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
            <i data-lucide="message-square" class="w-8 h-8 text-slate-600"></i>
            <p>Selecione uma conversa ao lado para visualizar as mensagens e assumir o atendimento.</p>
          </div>
        `}
      </div>
    </div>
  `;
}

async function selectConversation(id) {
  const conv = state.conversations.find(c => c.id === id);
  if (!conv) return;
  state.selectedConversation = conv;
  render();

  try {
    const msgs = await apiFetch(`/inbox/conversations/${id}/messages`);
    state.messages = msgs || [];
    render();
    const thread = document.getElementById('inboxMessages');
    if (thread) thread.scrollTop = thread.scrollHeight;
  } catch (e) {
    console.error('Erro ao carregar mensagens:', e);
  }
}

async function toggleHumanHandoff(id) {
  try {
    await apiFetch(`/inbox/conversations/${id}/handoff`, { method: 'POST' });
    showToast('Status da IA atualizado para esta conversa.', 'info');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao alterar status de atendimento.', 'error');
  }
}

async function sendInboxMessage() {
  const input = document.getElementById('inboxInput');
  const message = input ? input.value.trim() : '';
  if (!message || !state.selectedConversation) return;

  try {
    await apiFetch(`/inbox/conversations/${state.selectedConversation.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    if (input) input.value = '';
    selectConversation(state.selectedConversation.id);
  } catch (e) {
    showToast('Erro ao enviar mensagem.', 'error');
  }
}

// 6. LEADS VIEW
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
              <tr><td colspan="5" class="py-6 text-center text-slate-500">Nenhum lead capturado ainda. A IA registrará contatos automaticamente durante as conversas.</td></tr>
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

// 7. TOOLS VIEW
function renderTools() {
  const currentWebhook = state.profile?.webhookUrl || '';
  const hasGoogleCalendar = state.profile?.hasGoogleCalendar || false;

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="glass-card p-6 rounded-2xl space-y-4 border ${hasGoogleCalendar ? 'border-emerald-500/40' : 'border-slate-800'}">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-bold text-white flex items-center space-x-2">
            <i data-lucide="calendar" class="w-4 h-4 text-emerald-400"></i>
            <span>Google Calendar (Agendamentos)</span>
          </h3>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasGoogleCalendar ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}">
            ${hasGoogleCalendar ? '🟢 Conectado' : '⚪ Desconectado'}
          </span>
        </div>
        <p class="text-xs text-slate-400 leading-relaxed">Permite que a IA consulte horários disponíveis e agende compromissos automaticamente nas conversas.</p>
        <button onclick="toggleGoogleCalendar(${!hasGoogleCalendar})" class="px-4 py-2.5 rounded-xl font-semibold text-xs transition ${hasGoogleCalendar ? 'bg-rose-600/80 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'}">
          ${hasGoogleCalendar ? 'Desconectar Google Calendar' : 'Conectar Conta Google'}
        </button>
        ${renderHelper('googleCal', 'Conecta a agenda para que a ferramenta schedule_meeting confirme reuniões sem conflitos de horário.')}
      </div>

      <div class="glass-card p-6 rounded-2xl space-y-4">
        <h3 class="text-sm font-bold text-white flex items-center space-x-2">
          <i data-lucide="webhook" class="w-4 h-4 text-brand-400"></i>
          <span>Webhook para CRM (HubSpot / Make / Zapier)</span>
        </h3>
        <p class="text-xs text-slate-400 leading-relaxed">Dispare eventos HTTP para sistemas externos toda vez que um novo lead for capturado.</p>
        <input type="url" id="webhookInput" value="${currentWebhook}" placeholder="Ex: https://hook.eu1.make.com/abc123xyz" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
        <button onclick="saveWebhookUrl()" class="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition shadow-lg shadow-brand-600/20">
          Salvar URL de Webhook
        </button>
        ${renderHelper('crmWebhook', 'Link para enviar uma cópia instantânea dos dados do cliente capturado para outro software de vendas.')}
      </div>
    </div>
  `;
}

async function toggleGoogleCalendar(enabled) {
  try {
    const res = await apiFetch('/client/tools/google-calendar', {
      method: 'PUT',
      body: JSON.stringify({ enabled })
    });
    showToast(res.message || 'Status do Google Calendar atualizado!', 'success');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao atualizar Google Calendar.', 'error');
  }
}

async function saveWebhookUrl() {
  const webhookUrl = document.getElementById('webhookInput')?.value.trim();

  try {
    await apiFetch('/client/tools/webhook', {
      method: 'PUT',
      body: JSON.stringify({ webhookUrl })
    });
    showToast('URL de Webhook salva com sucesso no banco de dados!', 'success');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao salvar Webhook.', 'error');
  }
}

// 8. BILLING VIEW
function renderBilling() {
  const b = state.billing || {
    plan: 'basic',
    monthlyMessageLimit: 1000,
    currentMessagesCount: 0,
    usagePercentage: 0
  };

  return `
    <div class="space-y-8">
      <!-- CURRENT USAGE CARD -->
      <div class="glass-card p-6 rounded-2xl space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-white">Plano Atual: <span class="text-brand-400 capitalize">${b.plan}</span></h3>
            <p class="text-xs text-slate-400 mt-0.5">Limite renovado mensalmente.</p>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs">Assinatura Ativa</span>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-400">Consumo de Mensagens no Período:</span>
            <span class="font-bold text-white">${b.currentMessagesCount} / ${b.monthlyMessageLimit} msgs</span>
          </div>
          <div class="w-full h-3 rounded-full bg-slate-900 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-400" style="width: ${Math.min(b.usagePercentage, 100)}%"></div>
          </div>
        </div>
      </div>

      <!-- AVAILABLE TIERS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${renderPlanCard('Basic', 'R$ 97', '1.000 msgs/mês', ['Orquestrador Multi-Agente', 'RAG com 10 Documentos', 'Widget Web', 'Cache Semântico'], b.plan === 'basic')}
        ${renderPlanCard('Pro', 'R$ 247', '5.000 msgs/mês', ['Tudo do Basic', 'WhatsApp & Telegram', 'Tools & Agendamentos', 'Suporte Prioritário'], b.plan === 'pro')}
        ${renderPlanCard('Enterprise', 'R$ 590', 'Ilimitado', ['Tudo do Pro', 'Instâncias Dedicadas', 'White-Label Total', 'SLA 99.9%'], b.plan === 'enterprise')}
      </div>
    </div>
  `;
}

function renderPlanCard(name, price, limit, features, isCurrent) {
  return `
    <div class="glass-card p-6 rounded-2xl space-y-6 flex flex-col justify-between border ${isCurrent ? 'border-brand-500 bg-brand-950/20' : 'border-slate-800'}">
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold text-white">${name}</h4>
          ${isCurrent ? '<span class="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase">Plano Atual</span>' : ''}
        </div>
        <div>
          <span class="text-2xl font-black text-white">${price}</span>
          <span class="text-xs text-slate-400">/mês</span>
        </div>
        <p class="text-xs font-semibold text-brand-300">${limit}</p>
        <ul class="space-y-2 text-xs text-slate-300">
          ${features.map(f => `
            <li class="flex items-center space-x-2">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0"></i>
              <span>${f}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <button onclick="upgradePlan('${name.toLowerCase()}')" class="w-full py-2.5 rounded-xl text-xs font-bold transition ${isCurrent ? 'bg-slate-800 text-slate-400 cursor-default' : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30'}">
        ${isCurrent ? 'Plano Ativo' : 'Fazer Upgrade'}
      </button>
    </div>
  `;
}

async function upgradePlan(plan) {
  try {
    await apiFetch('/billing/subscription', {
      method: 'PUT',
      body: JSON.stringify({ plan })
    });
    showToast(`Plano alterado para ${plan.toUpperCase()} com sucesso!`, 'success');
    loadDashboardData();
  } catch (e) {
    showToast('Erro ao trocar plano.', 'error');
  }
}

// --- AUTH VIEW (LOGIN / REGISTER) ---
function renderAuthView() {
  const isLogin = state.authMode === 'login';

  return `
    <div class="min-h-screen flex items-center justify-center p-6 bg-gradient-to-tr from-[#060911] via-[#0b101d] to-[#0f172a]">
      <div class="w-full max-w-md glass p-8 rounded-3xl space-y-6 shadow-2xl border border-slate-800">
        
        <!-- HEADER -->
        <div class="text-center space-y-2">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/30 mx-auto mb-3">
            <i data-lucide="bot" class="w-7 h-7 text-white"></i>
          </div>
          <h2 class="text-xl font-bold text-white tracking-tight">Mini-Assistant SaaS</h2>
          <p class="text-xs text-slate-400">Plataforma Enterprise White-Label de Agentes Autônomos</p>
        </div>

        <!-- TABS LOGIN / REGISTER -->
        <div class="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
          <button onclick="state.authMode = 'login'; render();" class="flex-1 py-2 text-xs font-semibold rounded-lg transition ${isLogin ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            Entrar na Conta
          </button>
          <button onclick="state.authMode = 'register'; render();" class="flex-1 py-2 text-xs font-semibold rounded-lg transition ${!isLogin ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
            Criar Nova Conta
          </button>
        </div>

        <!-- FORM -->
        <form onsubmit="handleAuthSubmit(event)" class="space-y-4">
          ${!isLogin ? `
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Seu Nome Completo</label>
              <input type="text" id="authName" required placeholder="Ex: Carlos Silva" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Nome da Empresa / Tenant</label>
              <input type="text" id="authCompany" required placeholder="Ex: ModuloWeb Tecnologia" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
            </div>
          ` : ''}

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">E-mail Corporativo</label>
            <input type="email" id="authEmail" required placeholder="Ex: contato@suaempresa.com.br" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Senha de Acesso</label>
            <input type="password" id="authPassword" required placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-brand-500 focus:outline-none">
          </div>

          <button type="submit" class="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 mt-2">
            <span>${isLogin ? 'Acessar Painel Administrativo' : 'Criar Minha Conta White-Label'}</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        </form>

      </div>
    </div>
  `;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('authEmail')?.value.trim();
  const password = document.getElementById('authPassword')?.value.trim();

  if (state.authMode === 'login') {
    if (!email || !password) return showToast('Por favor, preencha seu e-mail e senha.', 'warning');
    login(email, password);
  } else {
    const name = document.getElementById('authName')?.value.trim();
    const company = document.getElementById('authCompany')?.value.trim();
    if (!email || !password || !name || !company) {
      return showToast('Por favor, preencha todos os campos do formulário.', 'warning');
    }
    register(name, email, password, company);
  }
}

// --- INITIALIZE APPLICATION ---
window.addEventListener('DOMContentLoaded', () => {
  render();
  if (state.token) {
    loadDashboardData();
  }
});
