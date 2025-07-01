"use client"

import { useState } from "react"
import { Search, Package, MapPin, Settings, Package2, Edit } from "lucide-react"
import WarehouseMap from "./components/WarehouseMap"
import ProductSearch from "./components/ProductSearch"
import StockManagement from "./components/StockManagement"
import ProductsToPackage from "./components/ProductsToPackage"
import ProductManagement from "./components/ProductManagement"
import { useWarehouseMongoDB } from "./hooks/useWarehouseMongoDB"

export default function WarehouseManagement() {
  const [activeTab, setActiveTab] = useState("map")
  const {
    sectors,
    products,
    searchProducts,
    updateProduct,
    addProduct,
    getProductsBySector,
    getLowStockProducts,
    getStockDeficit,
    importProductsFromCSV,
    refreshData,
    isLoading,
    error,
  } = useWarehouseMongoDB()

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error de Conexión</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
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
              {isLoading && (
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Cargando...
                </div>
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
            <button
              onClick={() => setActiveTab("stock")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "stock"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Package2 className="h-4 w-4 inline mr-2" />
              Gestión de Stock
            </button>
            <button
              onClick={() => setActiveTab("packaging")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "packaging"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Settings className="h-4 w-4 inline mr-2" />
              Productos a Envasar
            </button>
            <button
              onClick={() => setActiveTab("management")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "management"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Gestión de Productos
            </button>
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
              products={products}
              onSectorClick={async (sectorId) => {
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
            <ProductSearch
              products={products}
              sectors={sectors}
              onSearch={async (query) => {
                const results = await searchProducts(query)
                return results
              }}
            />
          </div>
        )}

        {activeTab === "stock" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Stock</h2>
              <p className="text-gray-600">Importa nuevos productos y actualiza el stock existente</p>
            </div>
            <StockManagement onDataRefresh={refreshData} />
          </div>
        )}

        {activeTab === "packaging" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos a Envasar</h2>
              <p className="text-gray-600">Gestiona productos que necesitan ser envasados y actualiza el stock</p>
            </div>
            <ProductsToPackage
              products={products}
              getLowStockProducts={getLowStockProducts}
              getStockDeficit={getStockDeficit}
              onUpdateProduct={updateProduct}
              isLoading={isLoading}
            />
          </div>
        )}

        {activeTab === "management" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Productos</h2>
              <p className="text-gray-600">Busca, edita y administra todos los productos del inventario</p>
            </div>
            <ProductManagement
              products={products}
              sectors={sectors}
              onUpdateProduct={updateProduct}
              onAddProduct={addProduct}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>
    </div>
  )
}
