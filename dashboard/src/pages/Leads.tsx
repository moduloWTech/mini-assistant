import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface Lead {
  id: string
  name: string
  phone?: string
  email?: string
  interest?: string
  sourceChannel: string
  status: string
}

export const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([])

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data } = await api.get<Lead[]>('/leads')
        setLeads(data || [])
      } catch (err) {
        toast.error('Erro ao carregar leads.')
      }
    }
    fetchLeads()
  }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Leads Capturados pela IA</span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">Acompanhe os contatos gerados automaticamente.</CardDescription>
            </div>
            <span className="text-xs text-slate-400">Total: {leads.length} leads</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Nome</TableHead>
                  <TableHead className="text-slate-400">Contato (WhatsApp/Email)</TableHead>
                  <TableHead className="text-slate-400">Interesse</TableHead>
                  <TableHead className="text-slate-400">Canal</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center py-6 text-slate-500 text-xs">
                      Nenhum lead capturado ainda. A IA registrará contatos automaticamente nas conversas.
                    </TableCell>
                  </TableRow>
                ) : leads.map(l => (
                  <TableRow key={l.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-semibold text-white">{l.name}</TableCell>
                    <TableCell className="text-slate-300">{l.phone || l.email || 'N/A'}</TableCell>
                    <TableCell className="text-brand-300 font-medium">{l.interest || 'Geral'}</TableCell>
                    <TableCell>
                      <span className="uppercase text-[10px] font-bold text-slate-400">{l.sourceChannel}</span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold text-[10px]">
                        {l.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
