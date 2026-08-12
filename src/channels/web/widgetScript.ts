export const getWidgetScript = (hostUrl: string) => `
(function() {
  // 1. Captura o script atual para ler o data-client-id
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var clientId = currentScript.getAttribute('data-client-id');
  if (!clientId) {
    console.error('[MWT Widget] Erro: data-client-id não foi fornecido no script.');
    return;
  }

  var userId = 'web_' + Math.random().toString(36).substring(2, 9);
  var apiUrl = '${hostUrl}'.replace(/^http:\/\//, 'https://');

  // 2. Injeta os Estilos CSS Dinamicamente
  var style = document.createElement('style');
  style.innerHTML = \`
    #mwt-chat-button {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: #ffffff;
      border: none;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.4);
      cursor: pointer;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    #mwt-chat-button:hover {
      transform: scale(1.1);
    }
    #mwt-chat-button svg {
      width: 28px;
      height: 28px;
      fill: currentColor;
    }
    #mwt-chat-modal {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 360px;
      max-width: calc(100vw - 48px);
      height: 520px;
      max-height: calc(100vh - 120px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      border: 1px solid rgba(0,0,0,0.08);
      z-index: 999998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      animation: mwtFadeIn 0.3s ease-out;
    }
    @keyframes mwtFadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    #mwt-chat-header {
      background: linear-gradient(135deg, #1e293b, #0f172a);
      color: #ffffff;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #mwt-chat-header-title {
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #mwt-chat-header-status {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
    }
    #mwt-chat-close {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 20px;
      cursor: pointer;
      line-height: 1;
    }
    #mwt-chat-close:hover { color: #ffffff; }
    #mwt-chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .mwt-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 14px;
      line-height: 1.45;
      word-wrap: break-word;
    }
    .mwt-msg-user {
      align-self: flex-end;
      background: #2563eb;
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    .mwt-msg-bot {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
    }
    .mwt-typing {
      align-self: flex-start;
      background: #e2e8f0;
      color: #64748b;
      padding: 8px 14px;
      border-radius: 14px;
      font-size: 13px;
      font-style: italic;
    }
    #mwt-chat-form {
      padding: 12px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }
    #mwt-chat-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      padding: 10px 12px;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }
    #mwt-chat-input:focus {
      border-color: #2563eb;
    }
    #mwt-chat-submit {
      background: #2563eb;
      color: #ffffff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    }
    #mwt-chat-submit:hover {
      background: #1d4ed8;
    }
  \`;
  document.head.appendChild(style);

  // 3. Injeta a Bolha de Chat no DOM
  var button = document.createElement('button');
  button.id = 'mwt-chat-button';
  button.setAttribute('aria-label', 'Abrir Chat');
  button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>';

  // 4. Injeta a Janela Modal do Chat no DOM
  var modal = document.createElement('div');
  modal.id = 'mwt-chat-modal';
  modal.innerHTML = \`
    <div id="mwt-chat-header">
      <div id="mwt-chat-header-title">
        <span id="mwt-chat-header-status"></span>
        <span>Atendimento Virtual</span>
      </div>
      <button id="mwt-chat-close">&times;</button>
    </div>
    <div id="mwt-chat-messages">
      <div class="mwt-msg mwt-msg-bot">Olá! Como posso te ajudar hoje?</div>
    </div>
    <form id="mwt-chat-form">
      <input type="text" id="mwt-chat-input" placeholder="Digite sua mensagem..." autocomplete="off" />
      <button type="submit" id="mwt-chat-submit">➤</button>
    </form>
  \`;

  document.body.appendChild(button);
  document.body.appendChild(modal);

  // 5. Lógica de Interação
  var messagesContainer = modal.querySelector('#mwt-chat-messages');
  var inputEl = modal.querySelector('#mwt-chat-input');
  var formEl = modal.querySelector('#mwt-chat-form');
  var closeBtn = modal.querySelector('#mwt-chat-close');

  button.addEventListener('click', function() {
    if (modal.style.display === 'flex') {
      modal.style.display = 'none';
    } else {
      modal.style.display = 'flex';
      inputEl.focus();
    }
  });

  closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
  });

  formEl.addEventListener('submit', async function(e) {
    e.preventDefault();
    var text = inputEl.value.trim();
    if (!text) return;

    // Adiciona mensagem do usuário
    var userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'mwt-msg mwt-msg-user';
    userMsgDiv.textContent = text;
    messagesContainer.appendChild(userMsgDiv);

    inputEl.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Adiciona indicador de digitação
    var typingDiv = document.createElement('div');
    typingDiv.className = 'mwt-typing';
    typingDiv.textContent = 'Digitando...';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      var res = await fetch(apiUrl + '/channels/web/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          clientId: clientId,
          userId: userId
        })
      });

      var data = await res.json();
      messagesContainer.removeChild(typingDiv);

      var botMsgDiv = document.createElement('div');
      botMsgDiv.className = 'mwt-msg mwt-msg-bot';
      botMsgDiv.textContent = data.response || 'Desculpe, não consegui entender.';
      messagesContainer.appendChild(botMsgDiv);
    } catch (err) {
      if (typingDiv.parentNode) {
        messagesContainer.removeChild(typingDiv);
      }
      var errorDiv = document.createElement('div');
      errorDiv.className = 'mwt-msg mwt-msg-bot';
      errorDiv.textContent = 'Erro ao se comunicar com o servidor.';
      messagesContainer.appendChild(errorDiv);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
})();
`;
