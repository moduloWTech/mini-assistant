import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BillingInfo {
  plan: string
  monthlyMessageLimit: number
  currentMessagesCount: number
  usagePercentage: number
}

const PLAN_FEATURES = {
  basic: ['Orquestrador Multi-Agente', 'RAG com 10 Documentos', 'Widget Web', 'Cache Semântico'],
  pro: ['Tudo do Basic', 'WhatsApp & Telegram', 'Tools & Agendamentos', 'Suporte Prioritário'],
  enterprise: ['Tudo do Pro', 'Instâncias Dedicadas', 'White-Label Total', 'SLA 99.9%']
}

export const Billing = () => {
  const [billing, setBilling] = useState<BillingInfo>({
    plan: 'basic',
    monthlyMessageLimit: 1000,
    currentMessagesCount: 0,
    usagePercentage: 0
  })

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const { data } = await api.get<BillingInfo>('/billing/subscription')
        if (data) setBilling(data)
      } catch { toast.error('Erro ao carregar dados de faturamento') }
    }
    fetchBilling()
  }, [])

  const upgradePlan = async (plan: string) => {
    try {
      await api.put('/billing/subscription', { plan })
      toast.success(`Plano alterado para ${plan.toUpperCase()} com sucesso!`)
      setBilling(prev => ({ ...prev, plan }))
    } catch { toast.error('Erro ao trocar plano.') }
  }

  const PlanCard = ({ name, id, price, limit, features }: { name: string, id: string, price: string, limit: string, features: string[] }) => {
    const isCurrent = billing.plan === id
    return (
      <Card className={`bg-slate-900/40 backdrop-blur-xl border ${isCurrent ? 'border-brand-500 bg-brand-950/20' : 'border-slate-800'} flex flex-col justify-between`}>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-white">{name}</h4>
              {isCurrent && <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold uppercase">Ativo</span>}
            </div>
            <div>
              <span className="text-2xl font-black text-white">{price}</span>
              <span className="text-xs text-slate-400">/mês</span>
            </div>
            <p className="text-xs font-semibold text-brand-300">{limit}</p>
            <ul className="space-y-2 text-xs text-slate-300">
              {features.map((f, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <Button 
            onClick={() => upgradePlan(id)}
            disabled={isCurrent}
            className={`w-full ${isCurrent ? 'bg-slate-800 text-slate-400' : 'bg-brand-600 hover:bg-brand-500 text-white'}`}
          >
            {isCurrent ? 'Plano Ativo' : 'Fazer Upgrade'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Plano Atual: <span className="text-brand-400 capitalize">{billing.plan}</span></h3>
              <p className="text-xs text-slate-400 mt-0.5">Limite renovado mensalmente.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold text-xs">Assinatura Ativa</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Consumo de Mensagens no Período:</span>
              <span className="font-bold text-white">{billing.currentMessagesCount} / {billing.monthlyMessageLimit} msgs</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-indigo-400" 
                style={{ width: `${Math.min(billing.usagePercentage, 100)}%` }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard name="Basic" id="basic" price="R$ 97" limit="1.000 msgs/mês" features={PLAN_FEATURES.basic} />
        <PlanCard name="Pro" id="pro" price="R$ 247" limit="5.000 msgs/mês" features={PLAN_FEATURES.pro} />
        <PlanCard name="Enterprise" id="enterprise" price="R$ 590" limit="Ilimitado" features={PLAN_FEATURES.enterprise} />
      </div>
    </div>
  )
}
