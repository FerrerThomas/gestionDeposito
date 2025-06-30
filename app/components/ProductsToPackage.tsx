"use client"

import { useState } from "react"
import { AlertTriangle, Package, TrendingDown, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

interface ProductsToPackageProps {
  products: Product[]
  getLowStockProducts: () => Product[]
  getStockDeficit: (product: Product) => number
  isLoading: boolean
}

export default function ProductsToPackage({
  products,
  getLowStockProducts,
  getStockDeficit,
  isLoading,
}: ProductsToPackageProps) {
  const [showAllLowStock, setShowAllLowStock] = useState(false)

  // Obtener productos con stock bajo ordenados por déficit (mayor a menor)
  const lowStockProducts = getLowStockProducts().sort((a, b) => {
    const deficitA = getStockDeficit(a)
    const deficitB = getStockDeficit(b)
    return deficitB - deficitA // Orden descendente (mayor déficit primero)
  })

  const displayedLowStockProducts = showAllLowStock ? lowStockProducts : lowStockProducts.slice(0, 9)

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Productos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">A Envasar</p>
                <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Total</p>
                <p className="text-2xl font-bold">{products.reduce((sum, product) => sum + product.quantity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Demanda Mensual</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, product) => sum + product.monthly_demand, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de productos a envasar */}
      {lowStockProducts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong className="text-red-800">Productos para Envasar:</strong> {lowStockProducts.length} productos
            necesitan ser envasados urgentemente.
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de productos a envasar */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-600 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Productos a Envasar ({lowStockProducts.length} productos)
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllLowStock(!showAllLowStock)}
                className="flex items-center"
              >
                {showAllLowStock ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Mostrar menos
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver todos ({lowStockProducts.length})
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-gray-600">
              <p>
                <strong>Prioridad por cantidad faltante:</strong> Los productos que más necesitan envasado aparecen
                primero
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedLowStockProducts.map((product) => {
                const deficit = getStockDeficit(product)
                return (
                  <div key={product.codigo} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {product.codigo}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sector:</span>
                        <Badge variant="secondary">{product.sector_id}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className="font-medium text-red-600">{product.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mínimo:</span>
                        <span className="font-medium">{product.min_stock}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 mt-2">
                        <span className="text-gray-600">A Envasar:</span>
                        <span className="font-bold text-red-700 text-lg">{deficit}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {!showAllLowStock && lowStockProducts.length > 9 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => setShowAllLowStock(true)}>
                  Ver {lowStockProducts.length - 9} productos más para envasar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
