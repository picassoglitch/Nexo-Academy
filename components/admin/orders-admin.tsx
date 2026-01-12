"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, Download, Filter } from "lucide-react"
import { OrderStatus } from "@/lib/types"

export default function OrdersAdmin({ orders: initialOrders }: { orders: any[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const filteredOrders = useMemo(() => {
    return initialOrders.filter((order) => {
      const matchesSearch =
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.externalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [initialOrders, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "PENDING":
      case "IN_PROCESS":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportToCSV = () => {
    const headers = ["ID", "Email", "Monto", "Estado", "Fecha", "Cupón", "External ID"]
    const rows = filteredOrders.map((order) => [
      order.id,
      order.user.email,
      (order.amount / 100).toFixed(2),
      order.status,
      formatDate(order.createdAt),
      order.coupon?.code || "",
      order.externalId,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `ordenes_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalRevenue = filteredOrders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Órdenes</h1>
            <p className="text-gray-600 mt-1">
              {filteredOrders.length} órdenes • Ingresos: {formatCurrency(totalRevenue)}
            </p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Email, ID de orden, External ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md"
                >
                  <option value="ALL">Todos</option>
                  <option value="APPROVED">Aprobadas</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="IN_PROCESS">En Proceso</option>
                  <option value="REJECTED">Rechazadas</option>
                  <option value="CANCELLED">Canceladas</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">Orden #{order.id.slice(0, 8)}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <strong>Usuario:</strong> {order.user.email} {order.user.name && `(${order.user.name})`}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Fecha:</strong> {formatDate(order.createdAt)}
                    </p>
                    {order.coupon && (
                      <p className="text-sm text-gray-600">
                        <strong>Cupón:</strong> {order.coupon.code}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      <strong>External ID:</strong> {order.externalId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(order.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.currency}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              {searchTerm || statusFilter !== "ALL"
                ? "No se encontraron órdenes con los filtros aplicados"
                : "No hay órdenes aún"}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
