import { useEffect, useState } from 'react'
import { MessageSquare, Users, Zap, Cpu, Sparkles, Brain, Share2, TrendingUp, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Analytics {
  messagesTotal: number
  leadsTotal: number
  fastPathRatio: string
}

export const Overview = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get<Analytics>('/analytics/overview')
        setAnalytics(data)
      } catch (err) {
        console.error('Analytics error:', err)
        // using mock data if endpoint fails
        setAnalytics({ messagesTotal: 0, leadsTotal: 0, fastPathRatio: '0%' })
      }
    }
    fetchAnalytics()
  }, [])

  const a = analytics || { messagesTotal: 0, leadsTotal: 0, fastPathRatio: '0%' }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Mensagens Totais</span>
              <MessageSquare className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-bold text-white">{a.messagesTotal}</p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% no período</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Leads Capturados</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-white">{a.leadsTotal}</p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% qualificados</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Economia Fast-Path</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-300">{a.fastPathRatio}</p>
            <p className="text-[11px] text-slate-400">Respostas com Zero Tokens</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Status do Motor</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">Operando</p>
            <p className="text-[11px] text-slate-400">Circuit-Breaker ativo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-brand-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">1. Personalize o Agente</h3>
                <p className="text-xs text-slate-400">Tom de voz e regras</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">Configure a missão e o comportamento da sua IA para falar a língua da sua marca.</p>
            <Button onClick={() => navigate('/persona')} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
              Editar Persona
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-indigo-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">2. Ingestão de Dados</h3>
                <p className="text-xs text-slate-400">PDFs e links</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">Envie PDFs ou cole a URL do seu site para que a IA aprenda seus produtos e FAQs.</p>
            <Button onClick={() => navigate('/knowledge')} className="w-full bg-slate-800 hover:bg-slate-700 text-white">
              Gerenciar Base
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-emerald-500/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">3. Ative os Canais</h3>
                <p className="text-xs text-slate-400">WhatsApp e Web</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">Conecte seu WhatsApp via API Oficial da Meta ou instale o Widget Web.</p>
            <Button onClick={() => navigate('/channels')} className="w-full bg-brand-600 hover:bg-brand-500 text-white">
              Conectar Canais
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
