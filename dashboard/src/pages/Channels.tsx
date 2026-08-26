import { useState } from 'react'
import { Phone, Send, Globe, Copy, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Channels = () => {
  const { client, updateClient } = useAuth()
  
  // WhatsApp
  const [waPhoneId, setWaPhoneId] = useState(client?.whatsappPhoneNumberId || '')
  const [waToken, setWaToken] = useState('')
  
  // Telegram
  const [tgToken, setTgToken] = useState('')
  const [tgPublicUrl, setTgPublicUrl] = useState('')
  
  // Widget
  const [allowedDomains, setAllowedDomains] = useState(client?.allowedDomains?.join(', ') || '*')
  const [copied, setCopied] = useState(false)

  const API_BASE = window.location.origin
  const scriptSnippet = `<script src="${API_BASE}/widget.js" data-client-id="${client?.id}" defer></script>`
  const tgVerifyToken = client?.telegramVerifyToken || ''

  const handleSaveWhatsApp = async () => {
    if (!waPhoneId) return toast.warning('Informe o Phone Number ID da Meta.')
    try {
      await api.put('/client/channels/whatsapp', { phoneNumberId: waPhoneId, accessToken: waToken })
      toast.success('Credenciais da Meta salvas com sucesso!')
      updateClient({ ...client!, whatsappPhoneNumberId: waPhoneId })
    } catch { toast.error('Erro ao salvar credenciais do WhatsApp.') }
  }

  const handleSaveTelegram = async () => {
    if (!tgToken) return toast.warning('Informe o token do @BotFather.')
    try {
      const { data } = await api.put('/client/channels/telegram', { botToken: tgToken, publicBaseUrl: tgPublicUrl })
      if (data.verifyToken) {
        toast.success(data.registeredWithTelegram ? 'Token salvo e Webhook registrado!' : 'Token salvo com sucesso!')
        updateClient({ ...client!, telegramVerifyToken: data.verifyToken, hasTelegram: true })
      }
    } catch { toast.error('Erro ao salvar token do Telegram.') }
  }

  const handleSaveDomains = async () => {
    try {
      await api.put('/client/channels/domains', { allowedDomains })
      toast.success('Domínios autorizados atualizados!')
      const domainsArr = allowedDomains.split(',').map(d => d.trim())
      updateClient({ ...client!, allowedDomains: domainsArr })
    } catch { toast.error('Erro ao atualizar domínios.') }
  }

  const copyWidget = () => {
    navigator.clipboard.writeText(scriptSnippet)
    setCopied(true)
    toast.success('Código do widget copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* WhatsApp */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border-emerald-500/30 lg:col-span-1">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm">WhatsApp Business</CardTitle>
              <CardDescription className="text-[10px] text-emerald-400 font-bold mt-1">☁️ Meta Cloud API</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-400">Para contas oficiais no Meta for Developers.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Phone Number ID</label>
              <Input value={waPhoneId} onChange={e => setWaPhoneId(e.target.value)} placeholder="Ex: 109283..." className="bg-slate-950/50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Access Token da Meta</label>
              <Input type="password" data-lpignore="true" autoComplete="off" value={waToken} onChange={e => setWaToken(e.target.value)} placeholder="Ex: EAAB..." className="bg-slate-950/50 text-xs" />
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-[11px] text-slate-300">
              <p className="font-semibold text-white">Webhook Meta:</p>
              <p className="text-slate-400 font-mono text-[10px]">{API_BASE}/webhook/whatsapp</p>
              <p className="text-slate-400 text-[10px]">Token: <b className="text-emerald-400">verify_token_dev</b></p>
            </div>
            <Button onClick={handleSaveWhatsApp} className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs">
              Salvar Credenciais
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Telegram */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border-sky-500/30 lg:col-span-1">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm">Telegram Bot</CardTitle>
              <CardDescription className="text-[10px] text-sky-400 font-semibold mt-1">
                {client?.hasTelegram ? '🟢 Conectado' : 'Atendimento no Telegram'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-400">Vincule o robô ao canal oficial usando o @BotFather.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">BotFather Token</label>
              <Input data-lpignore="true" autoComplete="off" value={tgToken} onChange={e => setTgToken(e.target.value)} placeholder="Ex: 123456789:ABC..." className="bg-slate-950/50 text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">URL Pública (Ngrok opcional)</label>
              <Input data-lpignore="true" autoComplete="off" value={tgPublicUrl} onChange={e => setTgPublicUrl(e.target.value)} placeholder="Ex: https://dominio.com" className="bg-slate-950/50 text-xs" />
            </div>
            {tgVerifyToken && (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <p className="font-semibold text-white">Webhook Bot:</p>
                <p className="font-mono text-[10px] text-sky-300 break-all">
                  {tgPublicUrl ? tgPublicUrl.replace(/\/$/, "") : (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)}/channels/telegram/{tgVerifyToken}
                </p>
              </div>
            )}
            <Button onClick={handleSaveTelegram} className="w-full bg-sky-600 hover:bg-sky-500 text-xs">
              Conectar Telegram
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Web Widget */}
      <Card className="bg-slate-900/40 backdrop-blur-xl border-brand-500/30 lg:col-span-1">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm">Web Widget</CardTitle>
              <CardDescription className="text-[10px] text-blue-400 font-semibold mt-1">Tag de Incorporação</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-slate-300">Copie o código e cole no HTML do seu site.</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-300">
              <span>Script HTML Embed</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-brand-500/30 text-[11px] text-brand-300 font-mono break-all">
              {scriptSnippet}
            </div>
          </div>
          <Button onClick={copyWidget} className="w-full bg-brand-600 hover:bg-brand-500 text-xs">
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? 'Copiado!' : 'Copiar Código'}
          </Button>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <label className="block text-[11px] font-semibold text-slate-300">Domínios Autorizados</label>
            <div className="flex gap-2">
              <Input value={allowedDomains} onChange={e => setAllowedDomains(e.target.value)} className="bg-slate-950/50 text-xs" />
              <Button onClick={handleSaveDomains} className="bg-slate-800 hover:bg-slate-700 text-xs">Salvar</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
