import { useState, useRef, useEffect } from 'react'
import { Sparkles, Save, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Client } from '@/types/auth'

type Message = { role: 'user' | 'model', content: string }

export const Persona = () => {
  const { client, updateClient } = useAuth()
  
  const [botName, setBotName] = useState(client?.name || 'Assistente Virtual')
  const [persona, setPersona] = useState(client?.systemPersona || '')
  
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Olá! Sou sua inteligência artificial. Como posso ajudar você hoje?' }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put<{ client: Client }>('/client/profile', { name: botName, systemPersona: persona })
      updateClient(data.client)
      toast.success('Diretrizes da Persona salvas e sincronizadas!')
    } catch (err) {
      toast.error('Erro ao salvar persona no servidor.')
    } finally {
      setSaving(false)
    }
  }

  const handleSend = async () => {
    if (!inputMsg.trim() || loading) return
    const userText = inputMsg.trim()
    setInputMsg('')
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setLoading(true)

    try {
      const { data } = await api.post('/channels/web/message', {
        message: userText,
        clientId: client?.id,
        userId: 'sandbox_user'
      })
      setMessages(prev => [...prev, { role: 'model', content: data.response || 'Sem resposta' }])
    } catch (e: any) {
      const errMsg = e.response?.data?.error || 'Erro de conexão com o servidor.'
      setMessages(prev => [...prev, { role: 'model', content: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
        <CardContent className="p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Diretrizes Gerais do Assistente</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Defina a identidade, tom de voz e regras de atendimento.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome do Assistente / Empresa</label>
              <Input 
                value={botName} 
                onChange={(e) => setBotName(e.target.value)}
                placeholder="Ex: Sofia (Atendente Virtual)" 
                className="bg-slate-950/50 border-slate-800 text-white" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Missão & Tom de Voz (Prompt)</label>
              <textarea 
                rows={8}
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                placeholder="Descreva como o assistente deve responder..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-xs focus:border-brand-500 focus:outline-none custom-scrollbar"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-brand-600 hover:bg-brand-500 text-white">
              <Save className="w-4 h-4 mr-2" />
              Salvar Diretrizes da Persona
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 flex flex-col h-[560px]">
        <CardContent className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Simulador de Conversa (Sandbox)</h3>
            </div>
            <button 
              onClick={() => setMessages([{ role: 'model', content: 'Olá! Sou sua inteligência artificial. Como posso ajudar você hoje?' }])}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Limpar Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 text-xs bg-slate-800 text-slate-400 border border-slate-700 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="pt-3 border-t border-slate-800 flex gap-2 shrink-0">
            <Input 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Faça uma pergunta para testar a IA..." 
              className="bg-slate-950/50 border-slate-800 text-white" 
            />
            <Button onClick={handleSend} disabled={loading} className="bg-brand-600 hover:bg-brand-500 text-white">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
