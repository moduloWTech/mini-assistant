# 🌐 Guia de Integração Web (Widget de Exemplo: Agente)

Este documento ensina como integrar a inteligência da **Agente** (agente de teste da MW Technology utilizado como caso de uso) ou qualquer outro agente de atendimento criado nesta plataforma SaaS dentro de uma aplicação Frontend (React, Next.js, Vue, Vanilla JS).

Em vez de usar canais de terceiros como WhatsApp ou Telegram, você pode criar o seu próprio "Chatbot Widget" flutuante ou fixo na página inicial (Home Page) do seu site.

---

## 🔗 1. A Rota da API (Web Channel)

A nossa API de produção no Google Cloud já possui um canal exclusivo para receber requisições de sites.

- **URL:** `https://api.moduloweb.com.br/channels/web/message`
- **Método:** `POST`
- **Headers:** `Content-Type: application/json`

### 📦 Payload (O que você precisa enviar)
Para que o Orquestrador saiba quem está falando e de qual cliente é esse bot, você deve enviar 3 informações no corpo (Body) da requisição:

```json
{
  "text": "Olá, queria saber como funciona a criação de sites",
  "clientId": "ID_DA_SUA_EMPRESA_NO_BANCO_DE_DADOS",
  "userId": "SESSAO_DO_USUARIO_12345"
}
```

- **`text`**: O que o usuário digitou no chat do site.
- **`clientId`**: O UUID da sua empresa no banco de dados (o mesmo usado na Agente). Se você perdeu esse ID, busque no banco da VM a tabela `Client`.
- **`userId`**: Um ID único e aleatório gerado pelo Frontend (usando `uuid` ou apenas `Date.now().toString()`) quando o visitante acessa o site. **É crucial enviar sempre o mesmo `userId` durante a mesma sessão para que o bot lembre do histórico da conversa**.

### 📨 Resposta (O que a API devolve)
A API processa via RAG e retorna:
```json
{
  "message": "Na MW Technology criamos sites de altíssima performance! Qual o seu nicho?"
}
```

---

## 💻 2. Exemplo de Implementação no React / Next.js

Abaixo está um modelo pronto de um componente `ChatWidget.tsx` que você pode copiar e colar no seu projeto `moduloWeb_page`.

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';

// O ID do cliente gerado no banco de dados quando rodamos o script "setup-client"
const AGENT_CLIENT_ID = "SEU_CLIENT_ID_AQUI"; 

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{sender: 'user' | 'bot', text: string}[]>([
    { sender: 'bot', text: 'Olá! Eu sou a Agente, da MW Technology. Como posso te ajudar hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Gera um ID de sessão único para este visitante quando ele entra na página
  const [userId] = useState(() => \`web-user-\${Math.random().toString(36).substring(7)}\`);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Faz scroll automático para a última mensagem
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.moduloweb.com.br/channels/web/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userMsg,
          clientId: AGENT_CLIENT_ID,
          userId: userId
        })
      });

      const data = await response.json();
      let botResponse = data.message;

      // Intercepta comando secreto de redirecionamento
      const redirectRegex = /\[REDIRECT:(.*?)\]/;
      const match = botResponse.match(redirectRegex);

      if (match && match[1]) {
        const url = match[1].trim();
        // Remove a tag da resposta para não aparecer pro usuário
        botResponse = botResponse.replace(redirectRegex, '').trim();
        
        // Exemplo: Dispara o redirecionamento após 2.5s (pode ser adaptado para botões)
        setTimeout(() => {
          window.location.href = url;
        }, 2500);
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Erro ao falar com a Agente:", error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Desculpe, meus servidores estão muito ocupados. Pode tentar de novo em um segundo?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão de Abrir/Fechar */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          💬 Falar com a Agente
        </button>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="w-80 h-96 bg-white shadow-2xl rounded-lg flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 p-3 text-white flex justify-between items-center">
            <span className="font-bold">Agente (MW Technology)</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-300">
              ✖
            </button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div key={i} className={\`p-3 rounded-lg max-w-[85%] \${msg.sender === 'user' ? 'bg-blue-500 text-white self-end rounded-br-none' : 'bg-gray-200 text-gray-800 self-start rounded-bl-none'}\`}>
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-200 text-gray-800 self-start rounded-lg rounded-bl-none p-3 animate-pulse">
                Agente está digitando...
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Input de Texto */}
          <form onSubmit={sendMessage} className="p-3 border-t bg-white flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..." 
              className="flex-1 border p-2 rounded-md focus:outline-none focus:border-blue-500 text-gray-800"
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
```

---

## 🚀 3. Tratamento de Erro Comum (CORS)

Ao implementar a Agente no Frontend de produção, os navegadores possuem uma trava de segurança chamada **CORS**. Eles bloqueiam requisições AJAX (`fetch`) feitas do seu site (`meusite.com`) para a nossa API (`api.moduloweb.com.br`) se a API não autorizar expressamente aquele site.

Se você receber um erro vermelho de CORS no console do Chrome (`Access to fetch at... from origin... has been blocked by CORS policy`), você só precisa fazer uma alteração simples no Backend:

1. Acesse o servidor da API.
2. Edite o arquivo `.env.production`.
3. Adicione a variável `CORS_ORIGIN` com o endereço exato do seu site. Exemplo:
   `CORS_ORIGIN="https://www.moduloweb.com.br"`
4. Reinicie o docker (`sudo docker compose ... up -d`).

Com isso, a API confia no seu site e o Widget funcionará perfeitamente!
