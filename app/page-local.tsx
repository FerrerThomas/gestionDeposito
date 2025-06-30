"use client"

import { useState } from "react"
import { Search, Package, MapPin, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import WarehouseMap from "./components/WarehouseMap"
import ProductSearch from "./components/ProductSearch"
import AdminPanel from "./components/AdminPanel"
import { useWarehouse } from "./hooks/useWarehouse" // Usar el hook local sin DB

export default function WarehouseManagement() {
  const [activeTab, setActiveTab] = useState("map")
  const [isAdmin, setIsAdmin] = useState(false)
  const {
    sectors,
    products,
    searchProducts,
    updateProduct,
    addProduct,
    getProductsBySector,
    getLowStockProducts,
    getStockDeficit,
  } = useWarehouse() // Hook local sin base de datos

  const handleLogin = () => {
    setIsAdmin(true)
  }

  const handleLogout = () => {
    setIsAdmin(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Sistema de Gestión de Depósito</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin ? (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">Administrador</Badge>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Cerrar Sesión
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={handleLogin}>
                  Acceso Admin
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("map")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "map"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MapPin className="h-4 w-4 inline mr-2" />
              Plano del Depósito
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "search"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Búsqueda de Productos
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "admin"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Panel de Administración
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "map" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plano Interactivo del Depósito</h2>
              <p className="text-gray-600">Haz clic en cualquier sector para ver los productos disponibles</p>
            </div>
            <WarehouseMap
              sectors={sectors}
              onSectorClick={(sectorId) => {
                const sectorProducts = getProductsBySector(sectorId)
                console.log(`Productos en sector ${sectorId}:`, sectorProducts)
              }}
            />
          </div>
        )}

        {activeTab === "search" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Búsqueda de Productos</h2>
              <p className="text-gray-600">Encuentra productos y su ubicación en el depósito</p>
            </div>
            <ProductSearch products={products} sectors={sectors} onSearch={searchProducts} />
          </div>
        )}

        {activeTab === "admin" && isAdmin && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Panel de Administración</h2>
              <p className="text-gray-600">Gestiona productos y asignaciones de sectores</p>
            </div>
            <AdminPanel
              products={products}
              sectors={sectors}
              onUpdateProduct={updateProduct}
              onAddProduct={addProduct}
              getLowStockProducts={getLowStockProducts}
              getStockDeficit={getStockDeficit}
            />
          </div>
        )}
      </main>
    </div>
  )
}
