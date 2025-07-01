"use client"

import { useState } from "react"
import { AlertTriangle, Package, TrendingDown, Eye, EyeOff, Check, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  onUpdateProduct: (product: Product) => void
  isLoading: boolean
}

interface PackagingTask {
  productCode: string
  isCompleting: boolean
  quantityToAdd: number
  isCompleted: boolean
}

export default function ProductsToPackage({
  products,
  getLowStockProducts,
  getStockDeficit,
  onUpdateProduct,
  isLoading,
}: ProductsToPackageProps) {
  const [showAllLowStock, setShowAllLowStock] = useState(false)
  const [packagingTasks, setPackagingTasks] = useState<Record<string, PackagingTask>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  // Obtener productos con stock bajo ordenados por déficit (mayor a menor)
  const lowStockProducts = getLowStockProducts().sort((a, b) => {
    const deficitA = getStockDeficit(a)
    const deficitB = getStockDeficit(b)
    return deficitB - deficitA // Orden descendente (mayor déficit primero)
  })

  const displayedLowStockProducts = showAllLowStock ? lowStockProducts : lowStockProducts.slice(0, 9)

  // Inicializar tarea de envasado
  const startPackagingTask = (productCode: string) => {
    setPackagingTasks((prev) => ({
      ...prev,
      [productCode]: {
        productCode,
        isCompleting: true,
        quantityToAdd: 0,
        isCompleted: false,
      },
    }))
  }

  // Cancelar tarea de envasado
  const cancelPackagingTask = (productCode: string) => {
    setPackagingTasks((prev) => {
      const newTasks = { ...prev }
      delete newTasks[productCode]
      return newTasks
    })
  }

  // Actualizar cantidad a agregar
  const updateQuantityToAdd = (productCode: string, quantity: number) => {
    setPackagingTasks((prev) => ({
      ...prev,
      [productCode]: {
        ...prev[productCode],
        quantityToAdd: Math.max(0, quantity),
      },
    }))
  }

  // Completar tarea de envasado
  const completePackagingTask = async (productCode: string) => {
    const task = packagingTasks[productCode]
    if (!task || task.quantityToAdd <= 0) return

    const product = products.find((p) => p.codigo === productCode)
    if (!product) return

    try {
      setIsUpdating(true)

      // Actualizar el producto con el nuevo stock
      const updatedProduct = {
        ...product,
        quantity: product.quantity + task.quantityToAdd,
      }

      // Llamar a la función de actualización
      await onUpdateProduct(updatedProduct)

      // Marcar como completado
      setPackagingTasks((prev) => ({
        ...prev,
        [productCode]: {
          ...prev[productCode],
          isCompleted: true,
          isCompleting: false,
        },
      }))

      // Remover la tarea después de 3 segundos
      setTimeout(() => {
        setPackagingTasks((prev) => {
          const newTasks = { ...prev }
          delete newTasks[productCode]
          return newTasks
        })
      }, 3000)
    } catch (error) {
      console.error("Error actualizando stock:", error)
      alert("Error al actualizar el stock. Intenta nuevamente.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Verificar si un producto está completado
  const isProductCompleted = (productCode: string) => {
    return packagingTasks[productCode]?.isCompleted || false
  }

  // Verificar si un producto está en proceso
  const isProductInProgress = (productCode: string) => {
    return packagingTasks[productCode]?.isCompleting || false
  }

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
              <Check className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(packagingTasks).filter((task) => task.isCompleted).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Object.values(packagingTasks).filter((task) => task.isCompleting).length}
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
                primero. Marca como completado cuando termines de envasar.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedLowStockProducts.map((product) => {
                const deficit = getStockDeficit(product)
                const task = packagingTasks[product.codigo]
                const isCompleted = isProductCompleted(product.codigo)
                const isInProgress = isProductInProgress(product.codigo)

                return (
                  <div
                    key={product.codigo}
                    className={`border rounded-lg p-4 transition-all ${
                      isCompleted
                        ? "border-green-200 bg-green-50"
                        : isInProgress
                          ? "border-orange-200 bg-orange-50"
                          : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {product.codigo}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            ✓ Completado
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sector:</span>
                        <Badge variant="secondary">{product.sector_id}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock actual:</span>
                        <span className="font-medium text-red-600">{product.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mínimo:</span>
                        <span className="font-medium">{product.min_stock}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-600">A Envasar:</span>
                        <span className="font-bold text-red-700 text-lg">{deficit}</span>
                      </div>
                    </div>

                    {/* Controles de envasado */}
                    <div className="mt-4 pt-3 border-t">
                      {!isInProgress && !isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => startPackagingTask(product.codigo)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como Envasado
                        </Button>
                      )}

                      {isInProgress && !isCompleted && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`quantity-${product.codigo}`} className="text-xs">
                              Cantidad envasada:
                            </Label>
                            <Input
                              id={`quantity-${product.codigo}`}
                              type="number"
                              min="0"
                              placeholder="Ej: 30"
                              value={task?.quantityToAdd || ""}
                              onChange={(e) =>
                                updateQuantityToAdd(product.codigo, Number.parseInt(e.target.value) || 0)
                              }
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Stock resultante: {product.quantity + (task?.quantityToAdd || 0)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => completePackagingTask(product.codigo)}
                              disabled={!task?.quantityToAdd || task.quantityToAdd <= 0 || isUpdating}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {isUpdating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              ) : (
                                <Save className="h-4 w-4 mr-2" />
                              )}
                              Confirmar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => cancelPackagingTask(product.codigo)}
                              disabled={isUpdating}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {isCompleted && (
                        <div className="text-center">
                          <div className="flex items-center justify-center text-green-600 text-sm">
                            <Check className="h-4 w-4 mr-2" />
                            Envasado completado
                          </div>
                          <p className="text-xs text-gray-500 mt-1">+{task?.quantityToAdd} agregado al stock</p>
                        </div>
                      )}
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

      {/* Mensaje cuando no hay productos para envasar */}
      {lowStockProducts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">¡Excelente trabajo!</h3>
            <p className="text-gray-600">
              Todos los productos tienen stock suficiente. No hay productos que necesiten envasado en este momento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
