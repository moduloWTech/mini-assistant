import { useState } from 'react'
import { Calendar, Webhook } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Tools = () => {
  const { client, updateClient } = useAuth()
  
  const [hasCalendar, setHasCalendar] = useState(client?.hasGoogleCalendar || false)
  const [webhookUrl, setWebhookUrl] = useState(client?.webhookUrl || '')

  const toggleCalendar = async () => {
    try {
      const { data } = await api.put('/client/tools/google-calendar', { enabled: !hasCalendar })
      toast.success(data.message || 'Status do Google Calendar atualizado!')
      setHasCalendar(!hasCalendar)
      updateClient({ ...client!, hasGoogleCalendar: !hasCalendar })
    } catch { toast.error('Erro ao atualizar Google Calendar.') }
  }

  const saveWebhook = async () => {
    try {
      await api.put('/client/tools/webhook', { webhookUrl })
      toast.success('URL de Webhook salva com sucesso no banco de dados!')
      updateClient({ ...client!, webhookUrl })
    } catch { toast.error('Erro ao salvar Webhook.') }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Calendar */}
      <Card className={`bg-slate-900/40 backdrop-blur-xl border ${hasCalendar ? 'border-emerald-500/40' : 'border-slate-800'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Google Calendar (Agendamentos)</span>
            </CardTitle>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${hasCalendar ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
              {hasCalendar ? '🟢 Conectado' : '⚪ Desconectado'}
            </span>
          </div>
          <CardDescription className="text-xs mt-1">Permite que a IA consulte horários disponíveis e agende compromissos automaticamente nas conversas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={toggleCalendar} 
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition w-full ${hasCalendar ? 'bg-rose-600/80 hover:bg-rose-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {hasCalendar ? 'Desconectar Google Calendar' : 'Conectar Conta Google'}
          </Button>
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm flex items-center space-x-2">
            <Webhook className="w-4 h-4 text-brand-400" />
            <span>Webhook para CRM (HubSpot / Make / Zapier)</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">Dispare eventos HTTP para sistemas externos toda vez que um novo lead for capturado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            type="url" 
            value={webhookUrl} 
            onChange={e => setWebhookUrl(e.target.value)} 
            placeholder="Ex: https://hook.eu1.make.com/abc123xyz" 
            className="bg-slate-950/50 border-slate-800 text-white text-xs" 
          />
          <Button onClick={saveWebhook} className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs">
            Salvar URL de Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
