import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Bot, Loader2, UserPlus } from 'lucide-react'

import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { AuthResponse, ApiError } from '@/types/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  companyName: z.string().min(2, 'Nome da empresa obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', companyName: '', email: '', password: '' },
  })

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true)
    try {
      const { data } = await api.post<AuthResponse>('/auth/register', values)
      signIn(data.token, data.client)
      toast.success('Conta criada! Bem-vindo ao painel.')
      navigate('/')
    } catch (error: any) {
      const msg = (error.response?.data as ApiError)?.error || 'Erro ao criar conta.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden py-10">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/30 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/30 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 p-8 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-slate-800 shadow-2xl">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 mx-auto flex items-center justify-center shadow-lg shadow-brand-500/20 ring-1 ring-brand-400/30">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Crie sua Conta</h1>
            <p className="text-sm text-slate-400 mt-1">Sua nova plataforma de agentes autônomos</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Seu Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Carlos Silva" className="bg-slate-950/50 border-slate-800 text-white h-11" {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="ModuloWeb" className="bg-slate-950/50 border-slate-800 text-white h-11" {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">E-mail Corporativo</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@empresa.com" className="bg-slate-950/50 border-slate-800 text-white h-11" {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" className="bg-slate-950/50 border-slate-800 text-white h-11" {...field} />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-12 mt-4 bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-600/20 rounded-xl" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <div className="flex items-center space-x-2">
                  <span>Cadastrar Empresa</span>
                  <UserPlus className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-center text-sm text-slate-400 mt-8">
          Já possui conta?{' '}
          <button onClick={() => navigate('/login')} className="text-brand-400 hover:text-brand-300 font-semibold transition">
            Fazer login
          </button>
        </p>
      </div>
    </div>
  )
}
