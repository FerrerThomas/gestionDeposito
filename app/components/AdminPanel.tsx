"use client"

import { useState } from "react"
import { Plus, Edit, Save, X, AlertTriangle, Package, TrendingDown, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CSVImporter from "./CSVImporter"
import StockUpdater from "./StockUpdater"

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

interface Sector {
  id: string
  name: string
  color: string
}

interface AdminPanelProps {
  products: Product[]
  sectors: Sector[]
  onUpdateProduct: (product: Product) => void
  onAddProduct: (product: Omit<Product, "_id">) => void
  getLowStockProducts: () => Product[]
  getStockDeficit: (product: Product) => number
  onImportCSV: () => Promise<void>
  onRefreshData: () => Promise<void>
  isLoading: boolean
}

export default function AdminPanel({
  products,
  sectors,
  onUpdateProduct,
  onAddProduct,
  getLowStockProducts,
  getStockDeficit,
  onImportCSV,
  onRefreshData,
  isLoading,
}: AdminPanelProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showAllLowStock, setShowAllLowStock] = useState(false)
  const [editForm, setEditForm] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({
    codigo: "",
    name: "",
    sector_id: "",
    quantity: 0,
    format: "",
    type: "",
    min_stock: 0,
    monthly_demand: 0,
    total_demand: 0,
  })

  // Obtener productos con stock bajo ordenados por déficit (mayor a menor)
  const lowStockProducts = getLowStockProducts().sort((a, b) => {
    const deficitA = getStockDeficit(a)
    const deficitB = getStockDeficit(b)
    return deficitB - deficitA // Orden descendente (mayor déficit primero)
  })

  const handleEditStart = (product: Product) => {
    setEditingProduct(product.codigo)
    setEditForm({ ...product })
  }

  const handleEditSave = () => {
    if (editForm) {
      onUpdateProduct(editForm)
      setEditingProduct(null)
      setEditForm(null)
    }
  }

  const handleEditCancel = () => {
    setEditingProduct(null)
    setEditForm(null)
  }

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sector_id && newProduct.codigo) {
      onAddProduct(newProduct)
      setNewProduct({
        codigo: "",
        name: "",
        sector_id: "",
        quantity: 0,
        format: "",
        type: "",
        min_stock: 0,
        monthly_demand: 0,
        total_demand: 0,
      })
      setShowAddForm(false)
    }
  }

  const handleDataRefresh = async () => {
    await onRefreshData()
  }

  const displayedLowStockProducts = showAllLowStock ? lowStockProducts : lowStockProducts.slice(0, 9)

  return (
    <div className="space-y-6">
      {/* Tabs para diferentes tipos de importación */}
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Importar Productos Nuevos</TabsTrigger>
          <TabsTrigger value="stock">Actualizar Stock Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          <CSVImporter onImportComplete={handleDataRefresh} />
        </TabsContent>

        <TabsContent value="stock" className="space-y-4">
          <StockUpdater onUpdateComplete={handleDataRefresh} />
        </TabsContent>
      </Tabs>

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
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
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

      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong className="text-red-800">Alerta de Stock Bajo:</strong> {lowStockProducts.length} productos
            necesitan reposición urgente.
          </AlertDescription>
        </Alert>
      )}

      {/* Productos con stock bajo */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-red-600 flex items-center">
                <TrendingDown className="h-5 w-5 mr-2" />
                Productos con Stock Bajo ({lowStockProducts.length} productos)
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
                <strong>Ordenados por déficit:</strong> Los productos que más necesitan reposición aparecen primero
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
                        <span className="text-gray-600">Faltan:</span>
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
                  Ver {lowStockProducts.length - 9} productos más con stock bajo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Gestión de productos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Gestión de Productos ({products.length} productos)
            </CardTitle>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <div className="border rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="font-medium mb-4">Nuevo Producto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="new-codigo">Código</Label>
                  <Input
                    id="new-codigo"
                    value={newProduct.codigo}
                    onChange={(e) => setNewProduct({ ...newProduct, codigo: e.target.value })}
                    placeholder="Código único"
                  />
                </div>
                <div>
                  <Label htmlFor="new-name">Nombre</Label>
                  <Input
                    id="new-name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Nombre del producto"
                  />
                </div>
                <div>
                  <Label htmlFor="new-sector">Sector</Label>
                  <Select
                    value={newProduct.sector_id}
                    onValueChange={(value) => setNewProduct({ ...newProduct, sector_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          Sector {sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="new-quantity">Stock Actual</Label>
                  <Input
                    id="new-quantity"
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Cantidad actual"
                  />
                </div>
                <div>
                  <Label htmlFor="new-format">Formato</Label>
                  <Input
                    id="new-format"
                    value={newProduct.format}
                    onChange={(e) => setNewProduct({ ...newProduct, format: e.target.value })}
                    placeholder="ej: 100gr, 1kg"
                  />
                </div>
                <div>
                  <Label htmlFor="new-type">Tipo</Label>
                  <Input
                    id="new-type"
                    value={newProduct.type}
                    onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                    placeholder="ej: semillas"
                  />
                </div>
                <div>
                  <Label htmlFor="new-minstock">Stock Mínimo</Label>
                  <Input
                    id="new-minstock"
                    type="number"
                    value={newProduct.min_stock}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock: Number.parseInt(e.target.value) || 0 })}
                    placeholder="Mínimo requerido"
                  />
                </div>
                <div>
                  <Label htmlFor="new-monthly">Demanda Mensual</Label>
                  <Input
                    id="new-monthly"
                    type="number"
                    value={newProduct.monthly_demand}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, monthly_demand: Number.parseInt(e.target.value) || 0 })
                    }
                    placeholder="Venta por mes"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button onClick={handleAddProduct}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de productos */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {products.slice(0, 20).map((product) => (
              <div key={product.codigo} className="border rounded-lg p-4 bg-white">
                {editingProduct === product.codigo && editForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4 items-end">
                    <div>
                      <Label>Código</Label>
                      <Input
                        value={editForm.codigo}
                        onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Nombre</Label>
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Sector</Label>
                      <Select
                        value={editForm.sector_id}
                        onValueChange={(value) => setEditForm({ ...editForm, sector_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {sectors.map((sector) => (
                            <SelectItem key={sector.id} value={sector.id}>
                              Sector {sector.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div>
                      <Label>Formato</Label>
                      <Input
                        value={editForm.format}
                        onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <Input
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Min. Stock</Label>
                      <Input
                        type="number"
                        value={editForm.min_stock}
                        onChange={(e) => setEditForm({ ...editForm, min_stock: Number.parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleEditSave}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleEditCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{product.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {product.codigo}
                          </Badge>
                          {product.quantity < product.min_stock && (
                            <Badge variant="destructive" className="text-xs">
                              Stock Bajo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Badge variant="outline">Sector {product.sector_id}</Badge>
                          <span>Stock: {product.quantity}</span>
                          <span>Min: {product.min_stock}</span>
                          <Badge variant="secondary">{product.format}</Badge>
                          <Badge variant="secondary">{product.type}</Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Demanda mensual: {product.monthly_demand} | Total: {product.total_demand}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEditStart(product)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {products.length > 20 && (
              <p className="text-center text-gray-500 py-4">
                Mostrando los primeros 20 productos de {products.length} total. Usa la búsqueda para encontrar productos
                específicos.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
