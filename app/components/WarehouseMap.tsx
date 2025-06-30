"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, AlertTriangle } from "lucide-react"

interface Sector {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
}

interface Product {
  _id?: string
  codigo: string
  name: string
  sector_id: string
  quantity: number
  format: string
  type: string
  min_stock: number
  monthly_demand: number
  total_demand: number
}

interface WarehouseMapProps {
  sectors: Sector[]
  products: Product[]
  onSectorClick: (sectorId: string) => void
}

export default function WarehouseMap({ sectors, products, onSectorClick }: WarehouseMapProps) {
  const [selectedSector, setSelectedSector] = useState<string | null>(null)

  // Obtener productos por sector
  const getProductsBySector = (sectorId: string): Product[] => {
    return products.filter((product) => product.sector_id === sectorId)
  }

  const handleSectorClick = (sectorId: string) => {
    setSelectedSector(sectorId)
    onSectorClick(sectorId)
  }

  const selectedSectorProducts = selectedSector ? getProductsBySector(selectedSector) : []

  // Obtener estadísticas del sector
  const getSectorStats = (sectorId: string) => {
    const sectorProducts = getProductsBySector(sectorId)
    const totalProducts = sectorProducts.length
    const lowStockProducts = sectorProducts.filter((p) => p.quantity < p.min_stock).length
    const totalStock = sectorProducts.reduce((sum, p) => sum + p.quantity, 0)

    return { totalProducts, lowStockProducts, totalStock }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mapa del Depósito */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Mapa del Depósito</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative bg-gray-100 rounded-lg p-4" style={{ height: "500px" }}>
              <svg width="100%" height="100%" viewBox="0 0 800 400" className="border rounded">
                {/* Fondo del depósito */}
                <rect x="0" y="0" width="800" height="400" fill="#f8f9fa" stroke="#333" strokeWidth="3" />

                {/* Entrada/área de carga (lado izquierdo) */}
                <rect x="0" y="120" width="40" height="160" fill="#e5e7eb" stroke="#333" strokeWidth="2" />
                <path d="M 40 200 Q 60 180 80 200 Q 60 220 40 200" fill="#e5e7eb" stroke="#333" strokeWidth="2" />

                {/* Sectores del depósito */}
                {sectors.map((sector) => {
                  const stats = getSectorStats(sector.id)
                  const isSelected = selectedSector === sector.id

                  return (
                    <g key={sector.id}>
                      <rect
                        x={sector.x}
                        y={sector.y}
                        width={sector.width}
                        height={sector.height}
                        fill={isSelected ? sector.color : sector.color}
                        stroke={isSelected ? "#000" : "#333"}
                        strokeWidth={isSelected ? "4" : "3"}
                        className="cursor-pointer hover:opacity-80 transition-all"
                        onClick={() => handleSectorClick(sector.id)}
                        style={{
                          opacity: isSelected ? 1 : 0.9,
                          filter: isSelected ? "brightness(1.1)" : "none",
                        }}
                      />
                      <text
                        x={sector.x + sector.width / 2}
                        y={sector.y + sector.height / 2 - 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-2xl font-bold fill-white pointer-events-none"
                        style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
                      >
                        {sector.name}
                      </text>
                      {/* Mostrar cantidad de productos */}
                      <text
                        x={sector.x + sector.width / 2}
                        y={sector.y + sector.height / 2 + 10}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-medium fill-white pointer-events-none"
                        style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.7)" }}
                      >
                        {stats.totalProducts} productos
                      </text>
                      {/* Indicador de stock bajo */}
                      {stats.lowStockProducts > 0 && (
                        <circle
                          cx={sector.x + sector.width - 15}
                          cy={sector.y + 15}
                          r="8"
                          fill="#ef4444"
                          stroke="#fff"
                          strokeWidth="2"
                          className="pointer-events-none"
                        />
                      )}
                    </g>
                  )
                })}

                {/* Líneas de división internas */}
                <line x1="200" y1="20" x2="200" y2="100" stroke="#666" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="400" y1="20" x2="400" y2="100" stroke="#666" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="580" y1="20" x2="580" y2="340" stroke="#666" strokeWidth="1" strokeDasharray="5,5" />

                {/* Etiquetas de medidas (decorativas) */}
                <text x="400" y="15" textAnchor="middle" className="text-xs fill-gray-600">
                  Ancho Total
                </text>
                <text
                  x="15"
                  y="200"
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                  transform="rotate(-90 15 200)"
                >
                  Alto
                </text>

                {/* Leyenda */}
                <text x="20" y="380" className="text-sm font-semibold fill-gray-700">
                  Haz clic en un sector para ver los productos disponibles
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panel de información del sector */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              {selectedSector ? `Sector ${selectedSector}` : "Selecciona un Sector"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSector ? (
              <div className="space-y-4">
                {/* Estadísticas del sector */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Productos</p>
                    <p className="text-2xl font-bold text-blue-800">{selectedSectorProducts.length}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-600 font-medium">Stock Bajo</p>
                    <p className="text-2xl font-bold text-red-800">
                      {selectedSectorProducts.filter((p) => p.quantity < p.min_stock).length}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">Productos disponibles en el sector {selectedSector}:</p>

                {selectedSectorProducts.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {selectedSectorProducts.map((product) => (
                      <div key={product.codigo} className="border rounded-lg p-3 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {product.codigo}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Stock:</span>
                            <span
                              className={`font-medium ${
                                product.quantity < product.min_stock ? "text-red-600" : "text-green-600"
                              }`}
                            >
                              {product.quantity} unidades
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Mínimo:</span>
                            <span className="text-gray-800">{product.min_stock}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <Badge variant="secondary" className="text-xs">
                              {product.format}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {product.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          </div>
                          {product.quantity < product.min_stock && (
                            <div className="flex items-center mt-2 p-2 bg-red-50 rounded">
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                              <span className="text-red-700 text-xs font-medium">
                                Faltan {product.min_stock - product.quantity} unidades
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No hay productos en este sector</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Selecciona un sector en el mapa para ver los productos disponibles.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Leyenda de colores */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Leyenda de Sectores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sectors.map((sector) => {
                const stats = getSectorStats(sector.id)
                return (
                  <div key={sector.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded border" style={{ backgroundColor: sector.color }}></div>
                      <span className="text-sm">Sector {sector.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{stats.totalProducts} prod.</span>
                      {stats.lowStockProducts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {stats.lowStockProducts} bajo
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
