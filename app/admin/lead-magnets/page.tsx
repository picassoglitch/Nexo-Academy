"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Users, Mail, Download, Trash2, Plus, RefreshCw, Eye, Search } from "lucide-react"

interface LeadMagnet { id: string; name: string; fileName: string; fileUrl: string; variant: string; active: boolean; sendCount: number; createdAt: string }
interface Subscriber { id: string; email: string; name: string | null; source: string | null; pdfVariant: string | null; createdAt: string }
interface Stats { sentA: number; sentB: number; totalSubscribers: number; activeSubscribers: number }

export default function LeadMagnetsPage() {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"magnets" | "subscribers">("magnets")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newMagnet, setNewMagnet] = useState({ name: "", fileUrl: "", variant: "A" })
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)

  const fetchLeadMagnets = async () => {
    try {
      const res = await fetch("/api/admin/lead-magnets")
      const data = await res.json()
      if (res.ok) { setLeadMagnets(data.leadMagnets || []); setStats(data.stats || null) }
    } catch (e) { console.error(e) }
  }

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams({ page: currentPage.toString(), limit: "25", ...(searchTerm && { search: searchTerm }) })
      const res = await fetch(`/api/admin/subscribers?${params}`)
      const data = await res.json()
      if (res.ok) { setSubscribers(data.subscribers || []); setPagination(data.pagination || null) }
    } catch (e) { console.error(e) }
  }

  useEffect(() => { Promise.all([fetchLeadMagnets(), fetchSubscribers()]).then(() => setLoading(false)) }, [])
  useEffect(() => { if (activeTab === "subscribers") fetchSubscribers() }, [currentPage, searchTerm, activeTab])

  const handleAddMagnet = async () => {
    if (!newMagnet.name || !newMagnet.fileUrl) { alert("Nombre y URL requeridos"); return }
    const res = await fetch("/api/admin/lead-magnets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMagnet) })
    if (res.ok) { setShowAddDialog(false); setNewMagnet({ name: "", fileUrl: "", variant: "A" }); fetchLeadMagnets() }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await fetch("/api/admin/lead-magnets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, active: !active }) })
    fetchLeadMagnets()
  }

  const handleDeleteMagnet = async (id: string) => {
    if (!confirm("Eliminar?")) return
    await fetch(`/api/admin/lead-magnets?id=${id}`, { method: "DELETE" })
    fetchLeadMagnets()
  }

  const handleExportCSV = async () => {
    const res = await fetch("/api/admin/subscribers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "export" }) })
    const data = await res.json()
    if (res.ok && data.csv) { const blob = new Blob([data.csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = data.filename; a.click() }
  }

  if (loading) return <div className="p-6 flex items-center justify-center"><RefreshCw className="h-8 w-8 animate-spin text-gray-400" /></div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Lead Magnets y Suscriptores</h1><p className="text-gray-600">Gestiona tus PDFs y lista de emails</p></div>
        <Button onClick={() => setShowAddDialog(true)}><Plus className="h-4 w-4 mr-2" />Agregar PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-blue-100 rounded-full"><FileText className="h-6 w-6 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats?.sentA || 0}</p><p className="text-sm text-gray-600">PDFs Variante A</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-purple-100 rounded-full"><FileText className="h-6 w-6 text-purple-600" /></div><div><p className="text-2xl font-bold">{stats?.sentB || 0}</p><p className="text-sm text-gray-600">PDFs Variante B</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-green-100 rounded-full"><Users className="h-6 w-6 text-green-600" /></div><div><p className="text-2xl font-bold">{stats?.totalSubscribers || 0}</p><p className="text-sm text-gray-600">Total Suscriptores</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 bg-orange-100 rounded-full"><Mail className="h-6 w-6 text-orange-600" /></div><div><p className="text-2xl font-bold">{stats?.activeSubscribers || 0}</p><p className="text-sm text-gray-600">Activos</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b">
        <button className={`px-4 py-2 font-medium ${activeTab === "magnets" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`} onClick={() => setActiveTab("magnets")}><FileText className="h-4 w-4 inline mr-2" />Lead Magnets</button>
        <button className={`px-4 py-2 font-medium ${activeTab === "subscribers" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`} onClick={() => setActiveTab("subscribers")}><Users className="h-4 w-4 inline mr-2" />Suscriptores</button>
      </div>

      {activeTab === "magnets" && (
        <Card><CardHeader><CardTitle>PDFs Configurados</CardTitle></CardHeader><CardContent>
          {leadMagnets.length === 0 ? <div className="text-center py-8 text-gray-500"><FileText className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No hay lead magnets</p></div> : (
            <Table><TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Variante</TableHead><TableHead>Enviados</TableHead><TableHead>Estado</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader>
              <TableBody>{leadMagnets.map((m) => (
                <TableRow key={m.id}>
                  <TableCell><div><p className="font-medium">{m.name}</p><p className="text-xs text-gray-500 truncate max-w-xs">{m.fileUrl}</p></div></TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs font-medium ${m.variant === "A" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{m.variant}</span></TableCell>
                  <TableCell>{m.sendCount}</TableCell>
                  <TableCell><span className={`px-2 py-1 rounded text-xs ${m.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>{m.active ? "Activo" : "Inactivo"}</span></TableCell>
                  <TableCell><div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => window.open(m.fileUrl, "_blank")}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleToggleActive(m.id, m.active)}>{m.active ? "Desactivar" : "Activar"}</Button><Button variant="ghost" size="sm" onClick={() => handleDeleteMagnet(m.id)} className="text-red-600"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
        </CardContent></Card>
      )}

      {activeTab === "subscribers" && (
        <Card><CardHeader><div className="flex justify-between items-center"><CardTitle>Lista de Suscriptores</CardTitle><Button variant="outline" onClick={handleExportCSV}><Download className="h-4 w-4 mr-2" />Exportar CSV</Button></div></CardHeader><CardContent>
          <div className="flex gap-4 mb-4"><div className="flex-1 relative"><Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" /><Input placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></div>
          <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Nombre</TableHead><TableHead>Fuente</TableHead><TableHead>PDF</TableHead><TableHead>Fecha</TableHead></TableRow></TableHeader>
            <TableBody>{subscribers.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.email}</TableCell>
                <TableCell>{s.name || "-"}</TableCell>
                <TableCell><span className="text-xs bg-gray-100 px-2 py-1 rounded">{s.source || "website"}</span></TableCell>
                <TableCell>{s.pdfVariant ? <span className={`px-2 py-1 rounded text-xs font-medium ${s.pdfVariant === "A" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}`}>{s.pdfVariant}</span> : "-"}</TableCell>
                <TableCell className="text-sm text-gray-600">{new Date(s.createdAt).toLocaleDateString("es-MX")}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
              <span className="px-4 py-2 text-sm">Pagina {currentPage} de {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</Button>
            </div>
          )}
        </CardContent></Card>
      )}

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}><DialogContent><DialogHeader><DialogTitle>Agregar Lead Magnet (PDF)</DialogTitle></DialogHeader>
        <div className="space-y-4 pt-4">
          <div><Label>Nombre del PDF</Label><Input placeholder="ej: Fast Start Kit" value={newMagnet.name} onChange={(e) => setNewMagnet({ ...newMagnet, name: e.target.value })} /></div>
          <div><Label>URL del archivo PDF</Label><Input placeholder="https://..." value={newMagnet.fileUrl} onChange={(e) => setNewMagnet({ ...newMagnet, fileUrl: e.target.value })} /><p className="text-xs text-gray-500 mt-1">Sube el PDF a Supabase Storage y pega la URL</p></div>
          <div><Label>Variante (A/B)</Label>
            <select value={newMagnet.variant} onChange={(e) => setNewMagnet({ ...newMagnet, variant: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="A">Variante A</option>
              <option value="B">Variante B</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Los PDFs se envian alternando A y B</p>
          </div>
          <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button><Button onClick={handleAddMagnet}>Guardar</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  )
}
