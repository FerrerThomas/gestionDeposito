"use client"

import { useState, useMemo } from "react"
import { Plus, Edit, Save, X, Search, Filter, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Sector {
  id: string
  name: string
  color: string
}

interface ProductManagementProps {
  products: Product[]
  sectors: Sector[]
  onUpdateProduct: (product: Product) => void
  onAddProduct: (product: Omit<Product, "_id">) => void
  isLoading: boolean
}

export default function ProductManagement({
  products,
  sectors,
  onUpdateProduct,
  onAddProduct,
  isLoading,
}: ProductManagementProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editForm, setEditForm] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
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

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filtro por búsqueda de texto
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.codigo.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filtro por sector
    if (sectorFilter !== "all") {
      filtered = filtered.filter((product) => product.sector_id === sectorFilter)
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((product) => product.type === typeFilter)
    }

    // Filtro por stock
    if (stockFilter === "low") {
      filtered = filtered.filter((product) => product.quantity < product.min_stock)
    } else if (stockFilter === "high") {
      filtered = filtered.filter((product) => product.quantity >= product.min_stock)
    } else if (stockFilter === "zero") {
      filtered = filtered.filter((product) => product.quantity === 0)
    }

    return filtered
  }, [products, searchQuery, sectorFilter, typeFilter, stockFilter])

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

  const clearFilters = () => {
    setSearchQuery("")
    setSectorFilter("all")
    setTypeFilter("all")
    setStockFilter("all")
  }

  const uniqueTypes = [...new Set(products.map((p) => p.type))]

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
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
              <Search className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filtrados</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p className="text-2xl font-bold text-orange-600">
                  {products.filter((p) => p.quantity < p.min_stock).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sin Stock</p>
                <p className="text-2xl font-bold text-red-600">{products.filter((p) => p.quantity === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Búsqueda y Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Campo de búsqueda */}
            <div className="lg:col-span-2">
              <Label htmlFor="search">Buscar productos</Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filtro por sector */}
            <div>
              <Label>Sector</Label>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los sectores</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      Sector {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por tipo */}
            <div>
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por stock */}
            <div>
              <Label>Stock</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todo el stock</SelectItem>
                  <SelectItem value="low">Stock bajo</SelectItem>
                  <SelectItem value="high">Stock normal</SelectItem>
                  <SelectItem value="zero">Sin stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex space-x-2">
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Producto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar producto */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo Producto</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Lista de productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Productos ({filteredProducts.length} de {products.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredProducts.map((product) => (
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
                          onChange={(e) =>
                            setEditForm({ ...editForm, min_stock: Number.parseInt(e.target.value) || 0 })
                          }
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
                            {product.quantity === 0 && (
                              <Badge variant="destructive" className="text-xs">
                                Sin Stock
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
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron productos que coincidan con los filtros aplicados.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4 bg-transparent">
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
