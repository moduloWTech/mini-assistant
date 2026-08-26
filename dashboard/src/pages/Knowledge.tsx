import { useEffect, useState, useRef } from 'react'
import { UploadCloud, FileUp, Globe, DownloadCloud, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'

interface Source {
  id: string
  fileName: string
  fileType: string
  chunkCount: number
  status: string
}

export const Knowledge = () => {
  const [sources, setSources] = useState<Source[]>([])
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadSources = async () => {
    try {
      const { data } = await api.get<Source[]>('/knowledge/sources')
      setSources(data || [])
    } catch (e) {
      toast.error('Erro ao carregar fontes de conhecimento.')
    }
  }

  useEffect(() => { loadSources() }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', 'general')

    setLoading(true)
    const t = toast.loading('Enviando e processando documento...')
    try {
      await api.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Documento vetorizado com sucesso!', { id: t })
      loadSources()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao processar arquivo.', { id: t })
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleScrapeUrl = async () => {
    if (!url.trim()) return toast.warning('Digite uma URL válida.')
    setLoading(true)
    const t = toast.loading('Raspando e vetorizando URL...')
    try {
      await api.post('/knowledge/url', { url: url.trim() })
      toast.success('Página web raspada e vetorizada!', { id: t })
      setUrl('')
      loadSources()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erro ao raspar URL.', { id: t })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este documento e todos os seus vetores?')) return
    try {
      await api.delete(`/knowledge/sources/${id}`)
      toast.success('Documento removido com sucesso!')
      loadSources()
    } catch (e) {
      toast.error('Erro ao excluir documento.')
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center text-brand-400 text-sm space-x-2">
              <UploadCloud className="w-4 h-4" />
              <span>Upload de Arquivos (PDF, TXT, CSV)</span>
            </CardTitle>
            <CardDescription className="text-xs">Envie manuais para o cérebro vetorial.</CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/30"
            >
              <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Clique para selecionar arquivos</p>
              <p className="text-[10px] text-slate-500 mt-1">Aceito: PDF, TXT ou CSV (até 10MB)</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.csv" onChange={handleFileUpload} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center text-indigo-400 text-sm space-x-2">
              <Globe className="w-4 h-4" />
              <span>Web Scraper de URLs</span>
            </CardTitle>
            <CardDescription className="text-xs">Extrair FAQ de uma URL do site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ex: https://suaempresa.com.br/duvidas" 
              className="bg-slate-950/50 border-slate-800 text-white" 
            />
            <Button onClick={handleScrapeUrl} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">
              <DownloadCloud className="w-4 h-4 mr-2" /> Extrair e Vetorizar Página
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Documentos & Fontes na Memória</CardTitle>
            <span className="text-xs text-slate-400">Total: {sources.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/50">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Fonte</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Chunks</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-right text-slate-400">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={5} className="text-center py-6 text-slate-500 text-xs">
                      Nenhum documento cadastrado.
                    </TableCell>
                  </TableRow>
                ) : sources.map(s => (
                  <TableRow key={s.id} className="border-slate-800 hover:bg-slate-800/30">
                    <TableCell className="font-medium text-white">{s.fileName}</TableCell>
                    <TableCell className="uppercase text-brand-400 font-semibold">{s.fileType}</TableCell>
                    <TableCell className="text-slate-300">{s.chunkCount || 0}</TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="h-8 w-8 text-slate-400 hover:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
