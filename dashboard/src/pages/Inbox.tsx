import { useEffect, useState, useRef } from 'react'
import { MessageSquare, Pause, Play, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

interface Conversation {
  id: string
  chatId: string
  name?: string
  platform?: string
  lastMessage?: string
  isAiPaused: boolean
}

interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'model'
  content: string
}

export const Inbox = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = async () => {
    try {
      const { data } = await api.get<Conversation[]>('/inbox/conversations')
      setConversations(data || [])
    } catch { toast.error('Erro ao carregar conversas') }
  }

  useEffect(() => { fetchConversations() }, [])
  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const selectConv = async (conv: Conversation) => {
    setSelectedConv(conv)
    try {
      const { data } = await api.get<ChatMessage[]>(`/inbox/conversations/${conv.id}/messages`)
      setMessages(data || [])
    } catch { toast.error('Erro ao carregar mensagens') }
  }

  const toggleHandoff = async () => {
    if (!selectedConv) return
    try {
      await api.post(`/inbox/conversations/${selectedConv.id}/handoff`)
      toast.success('Status da IA atualizado.')
      fetchConversations()
      setSelectedConv({ ...selectedConv, isAiPaused: !selectedConv.isAiPaused })
    } catch { toast.error('Erro ao alterar status de atendimento.') }
  }

  const sendMessage = async () => {
    if (!input.trim() || !selectedConv) return
    try {
      await api.post(`/inbox/conversations/${selectedConv.id}/messages`, { message: input })
      setInput('')
      selectConv(selectedConv) // reload msgs
    } catch { toast.error('Erro ao enviar mensagem.') }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-800 flex flex-col bg-slate-950/40 shrink-0">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Atendimentos ao Vivo</h3>
          <span className="text-xs text-slate-400">{conversations.length} conversas</span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">Nenhuma conversa ativa.</div>
          ) : conversations.map(c => (
            <div 
              key={c.id} 
              onClick={() => selectConv(c)}
              className={`p-3.5 hover:bg-slate-800/50 cursor-pointer transition ${selectedConv?.id === c.id ? 'bg-slate-800/70 border-l-2 border-brand-500' : ''}`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-white truncate">{c.name || `Usuário ${c.chatId.slice(0,6)}`}</p>
                <span className="text-[10px] uppercase font-bold text-slate-400">{c.platform || 'web'}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{c.lastMessage || 'Conversa iniciada'}</p>
              {c.isAiPaused && <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">Humano</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConv ? (
          <>
            <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-900/60">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedConv.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{selectedConv.name || `Cliente ${selectedConv.chatId}`}</p>
                  <p className="text-[10px] text-slate-400">Canal: {selectedConv.platform || 'Web'}</p>
                </div>
              </div>
              <Button 
                onClick={toggleHandoff} 
                className={`text-xs h-8 ${selectedConv.isAiPaused ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}
              >
                {selectedConv.isAiPaused ? <><Play className="w-3 h-3 mr-1" /> Reativar IA</> : <><Pause className="w-3 h-3 mr-1" /> Assumir Atendimento</>}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3 bg-slate-900/20">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-slate-800 text-white border border-slate-700' : (m.role === 'agent' ? 'bg-amber-600 text-white' : 'bg-brand-600 text-white')}`}>
                    <p className="text-[10px] opacity-70 font-bold mb-0.5">
                      {m.role === 'user' ? 'Cliente' : (m.role === 'agent' ? 'Humano' : 'Assistente IA')}
                    </p>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={msgsEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 flex gap-2 shrink-0 bg-slate-900/60">
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder="Digite sua resposta humana para o cliente..." 
                className="bg-slate-950/50 border-slate-800 text-white" 
              />
              <Button onClick={sendMessage} className="bg-brand-600 hover:bg-brand-500 text-white">
                Enviar <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600" />
            <p>Selecione uma conversa ao lado para assumir o atendimento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
