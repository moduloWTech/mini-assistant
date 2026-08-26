import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, BookOpen, Settings, Users, LogOut, Sparkles, Share2 } from 'lucide-react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'

import { Overview } from '@/pages/Overview'
import { Persona } from '@/pages/Persona'
import { Knowledge } from '@/pages/Knowledge'
import { Leads } from '@/pages/Leads'
import { Inbox } from '@/pages/Inbox'
import { Channels } from '@/pages/Channels'
import { Tools } from '@/pages/Tools'
import { Billing } from '@/pages/Billing'

const Sidebar = () => {
  const { signOut, client } = useAuth()

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-800 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="mb-8 font-bold text-xl text-white flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span>Mini-Assistant</span>
        </div>
        <nav className="space-y-1">
          <Link to="/" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Visão Geral</span>
          </Link>
          <Link to="/persona" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Editar Persona</span>
          </Link>
          <Link to="/knowledge" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm font-medium">Base RAG</span>
          </Link>
          <Link to="/leads" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">CRM Leads</span>
          </Link>
          <Link to="/channels" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <Share2 className="w-4 h-4" />
            <span className="text-sm font-medium">Canais</span>
          </Link>
          <Link to="/inbox" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Inbox</span>
          </Link>
          <Link to="/tools" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Habilidades</span>
          </Link>
          <Link to="/billing" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Faturamento</span>
          </Link>
        </nav>
      </div>
      
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {client?.name?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{client?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{client?.email || 'empresa@corp.com'}</p>
            </div>
          </div>
          <button onClick={signOut} title="Sair" className="text-slate-400 hover:text-rose-400 p-2 transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-500/30">
    <Sidebar />
    <main className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-8 max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout><Overview /></Layout>} />
            <Route path="/persona" element={<Layout><Persona /></Layout>} />
            <Route path="/knowledge" element={<Layout><Knowledge /></Layout>} />
            <Route path="/leads" element={<Layout><Leads /></Layout>} />
            <Route path="/channels" element={<Layout><Channels /></Layout>} />
            <Route path="/inbox" element={<Layout><Inbox /></Layout>} />
            <Route path="/tools" element={<Layout><Tools /></Layout>} />
            <Route path="/billing" element={<Layout><Billing /></Layout>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
