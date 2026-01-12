"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Save, X, Trash2, Filter, Search, CheckSquare, Square, CheckCircle2, XCircle } from "lucide-react"

const TIER_NAMES: Record<number, string> = {
  0: "Gratis",
  1: "Starter",
  2: "Pro",
  3: "Operator",
}

const TIER_COLORS: Record<number, string> = {
  0: "bg-gray-100 text-gray-800",
  1: "bg-blue-100 text-blue-800",
  2: "bg-purple-100 text-purple-800",
  3: "bg-yellow-100 text-yellow-800",
}

export default function UsersAdmin({ users: initialUsers }: { users: any[] }) {
  const [users, setUsers] = useState(initialUsers)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedTier, setEditedTier] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false)
  const [filterEmail, setFilterEmail] = useState("")
  const [filterName, setFilterName] = useState("")
  const [filterTier, setFilterTier] = useState<string>("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  
  // Selección masiva
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [bulkTier, setBulkTier] = useState<number>(0)
  const [bulkLoading, setBulkLoading] = useState(false)

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filterEmail && !user.email.toLowerCase().includes(filterEmail.toLowerCase())) {
        return false
      }
      if (filterName && !(user.name || "").toLowerCase().includes(filterName.toLowerCase())) {
        return false
      }
      if (filterTier !== "" && user.tier !== parseInt(filterTier)) {
        return false
      }
      if (filterDateFrom) {
        const userDate = new Date(user.createdAt)
        const fromDate = new Date(filterDateFrom)
        if (userDate < fromDate) return false
      }
      if (filterDateTo) {
        const userDate = new Date(user.createdAt)
        const toDate = new Date(filterDateTo)
        toDate.setHours(23, 59, 59, 999) // End of day
        if (userDate > toDate) return false
      }
      return true
    })
  }, [users, filterEmail, filterName, filterTier, filterDateFrom, filterDateTo])

  const handleEdit = (user: any) => {
    setEditingId(user.id)
    setEditedTier(user.tier || 0)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedTier(0)
  }

  const handleSave = async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/tier`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: editedTier }),
      })

      if (response.ok) {
        const updated = await response.json()
        setUsers(users.map((u) => (u.id === userId ? updated : u)))
        setEditingId(null)
        alert(`Tier actualizado exitosamente a: ${TIER_NAMES[updated.tier || 0]}`)
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        alert(errorData.error || `Error al actualizar el tier (${response.status})`)
      }
    } catch (error: any) {
      console.error("Error updating tier:", error)
      alert(`Error al actualizar el tier: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!confirm(`¿Estás seguro de que deseas borrar al usuario ${userEmail}? Esta acción no se puede deshacer.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        setSelectedUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        alert("Usuario borrado exitosamente")
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        alert(errorData.error || `Error al borrar el usuario (${response.status})`)
      }
    } catch (error: any) {
      console.error("Error deleting user:", error)
      alert(`Error al borrar el usuario: ${error.message || "Error desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })
  }

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      alert("Por favor, selecciona al menos un usuario")
      return
    }

    if (!confirm(`¿Estás seguro de que deseas borrar ${selectedUsers.size} usuario(s)? Esta acción no se puede deshacer.`)) {
      return
    }

    setBulkLoading(true)
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers) }),
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(users.filter((u) => !selectedUsers.has(u.id)))
        setSelectedUsers(new Set())
        alert(data.message || `${selectedUsers.size} usuario(s) borrado(s) exitosamente`)
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        alert(errorData.error || `Error al borrar usuarios (${response.status})`)
      }
    } catch (error: any) {
      console.error("Error deleting users:", error)
      alert(`Error al borrar usuarios: ${error.message || "Error desconocido"}`)
    } finally {
      setBulkLoading(false)
    }
  }

  const handleBulkUpdateTier = async () => {
    if (selectedUsers.size === 0) {
      alert("Por favor, selecciona al menos un usuario")
      return
    }

    if (!confirm(`¿Estás seguro de que deseas actualizar el tier de ${selectedUsers.size} usuario(s) a ${TIER_NAMES[bulkTier]}?`)) {
      return
    }

    setBulkLoading(true)
    try {
      const response = await fetch("/api/admin/users/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers), tier: bulkTier }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state
        setUsers(
          users.map((u) => (selectedUsers.has(u.id) ? { ...u, tier: bulkTier } : u))
        )
        setSelectedUsers(new Set())
        setBulkTier(0)
        alert(data.message || `${selectedUsers.size} usuario(s) actualizado(s) exitosamente`)
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        alert(errorData.error || `Error al actualizar usuarios (${response.status})`)
      }
    } catch (error: any) {
      console.error("Error updating users:", error)
      alert(`Error al actualizar usuarios: ${error.message || "Error desconocido"}`)
    } finally {
      setBulkLoading(false)
    }
  }

  const clearFilters = () => {
    setFilterEmail("")
    setFilterName("")
    setFilterTier("")
    setFilterDateFrom("")
    setFilterDateTo("")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra los tiers y acceso de los usuarios</p>
        </div>

        {/* Filtros y acciones masivas */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Ocultar" : "Mostrar"} Filtros
              </Button>
            </div>
          </CardHeader>
          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-email">Email</Label>
                  <Input
                    id="filter-email"
                    type="text"
                    placeholder="Buscar por email..."
                    value={filterEmail}
                    onChange={(e) => setFilterEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-name">Nombre</Label>
                  <Input
                    id="filter-name"
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-tier">Tier</Label>
                  <select
                    id="filter-tier"
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md"
                  >
                    <option value="">Todos</option>
                    <option value="0">Gratis (0)</option>
                    <option value="1">Starter (1)</option>
                    <option value="2">Pro (2)</option>
                    <option value="3">Operator (3)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-date-from">Fecha Desde</Label>
                  <Input
                    id="filter-date-from"
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="filter-date-to">Fecha Hasta</Label>
                  <Input
                    id="filter-date-to"
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Acciones masivas */}
        {selectedUsers.size > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {selectedUsers.size} usuario(s) seleccionado(s)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="bulk-tier">Cambiar Tier a:</Label>
                  <select
                    id="bulk-tier"
                    value={bulkTier}
                    onChange={(e) => setBulkTier(parseInt(e.target.value))}
                    className="p-2 border rounded-md"
                  >
                    <option value={0}>Gratis (0)</option>
                    <option value={1}>Starter (1)</option>
                    <option value={2}>Pro (2)</option>
                    <option value={3}>Operator (3)</option>
                  </select>
                  <Button
                    size="sm"
                    onClick={handleBulkUpdateTier}
                    disabled={bulkLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {bulkLoading ? "Actualizando..." : "Actualizar Tier"}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {bulkLoading ? "Borrando..." : `Borrar ${selectedUsers.size}`}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedUsers(new Set())}
                >
                  Deseleccionar Todo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Lista de Usuarios ({filteredUsers.length})
              </CardTitle>
              <div className="text-sm text-gray-600">
                Mostrando {filteredUsers.length} de {users.length} usuarios
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 w-12">
                      <button
                        onClick={handleSelectAll}
                        className="flex items-center justify-center"
                      >
                        {selectedUsers.size === filteredUsers.length && filteredUsers.length > 0 ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Nombre</th>
                    <th className="text-left p-4">Tier</th>
                    <th className="text-left p-4">Email Validado</th>
                    <th className="text-left p-4">Último Acceso</th>
                    <th className="text-left p-4">Fecha Registro</th>
                    <th className="text-left p-4">Última Compra</th>
                    <th className="text-left p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-gray-500">
                        No se encontraron usuarios con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className={`border-b hover:bg-gray-50 ${
                          selectedUsers.has(user.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="p-4">
                          <button
                            onClick={() => handleSelectUser(user.id)}
                            className="flex items-center justify-center"
                          >
                            {selectedUsers.has(user.id) ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.name || "-"}</td>
                        <td className="p-4">
                          {editingId === user.id ? (
                            <select
                              value={editedTier}
                              onChange={(e) => setEditedTier(parseInt(e.target.value))}
                              className="p-2 border rounded-md"
                            >
                              <option value={0}>Gratis (0)</option>
                              <option value={1}>Starter (1)</option>
                              <option value={2}>Pro (2)</option>
                              <option value={3}>Operator (3)</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                TIER_COLORS[user.tier || 0]
                              }`}
                            >
                              {TIER_NAMES[user.tier || 0]} ({user.tier || 0})
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {user.emailConfirmed ? (
                              <>
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                <span className="text-green-700 font-medium">Sí</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="text-red-700 font-medium">No</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {user.lastSignInAt ? (
                            <div className="text-sm">
                              <div>
                                {new Date(user.lastSignInAt).toLocaleDateString("es-MX", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(user.lastSignInAt).toLocaleTimeString("es-MX", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Nunca</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            <div>
                              {new Date(user.createdAt).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(user.createdAt).toLocaleTimeString("es-MX", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {user.orders && user.orders.length > 0
                            ? new Date(user.orders[0].createdAt).toLocaleDateString("es-MX", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "-"}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {editingId === user.id ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleSave(user.id)}
                                  disabled={loading}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={handleCancel}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(user)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDelete(user.id, user.email)}
                                  disabled={loading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
