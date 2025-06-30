"use client"

import { useState, useMemo } from "react"
import { Search, MapPin, Package, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface ProductSearchProps {
  products: Product[]
  sectors: Sector[]
  onSearch: (query: string) => Promise<Product[]>
}

export default function ProductSearch({ products, sectors, onSearch }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [formatFilter, setFormatFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const results = await onSearch(query)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let filtered = products

    // Filtro por búsqueda de texto
    if (searchQuery) {
      filtered = filtered.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter((product) => product.type === typeFilter)
    }

    // Filtro por formato
    if (formatFilter !== "all") {
      filtered = filtered.filter((product) => product.format === formatFilter)
    }

    // Filtro por stock
    if (stockFilter === "low") {
      filtered = filtered.filter((product) => product.quantity < 20)
    } else if (stockFilter === "high") {
      filtered = filtered.filter((product) => product.quantity >= 20)
    }

    return filtered
  }, [products, searchQuery, typeFilter, formatFilter, stockFilter])

  const getSectorInfo = (sectorId: string) => {
    return sectors.find((sector) => sector.id === sectorId)
  }

  const uniqueTypes = [...new Set(products.map((p) => p.type))]
  const uniqueFormats = [...new Set(products.map((p) => p.format))]

  const displayProducts = searchQuery ? searchResults : filteredProducts

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2" />
            Búsqueda de Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Campo de búsqueda */}
            <div className="lg:col-span-2">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleSearch(e.target.value)
                }}
                className="w-full"
              />
            </div>

            {/* Filtro por tipo */}
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

            {/* Filtro por formato */}
            <Select value={formatFilter} onValueChange={setFormatFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los formatos</SelectItem>
                {uniqueFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por stock */}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo el stock</SelectItem>
                <SelectItem value="low">Stock bajo (&lt; 20)</SelectItem>
                <SelectItem value="high">Stock alto (≥ 20)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón para limpiar filtros */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setTypeFilter("all")
                setFormatFilter("all")
                setStockFilter("all")
                setSearchResults([])
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados ({displayProducts.length} productos encontrados)</CardTitle>
        </CardHeader>
        <CardContent>
          {displayProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayProducts.map((product) => {
                const sectorInfo = getSectorInfo(product.sector_id)
                return (
                  <div key={product._id} className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <Badge variant="outline">{product.format}</Badge>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>Sector: </span>
                        <Badge
                          variant="secondary"
                          className="ml-1"
                          style={{ backgroundColor: sectorInfo?.color + "20", color: sectorInfo?.color }}
                        >
                          {product.sector_id}
                        </Badge>
                      </div>

                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        <span>Stock: {product.quantity} unidades</span>
                      </div>

                      <div className="flex items-center">
                        <Badge variant="secondary" className="text-xs">
                          {product.type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>

                    {product.quantity < 20 && (
                      <div className="mt-3">
                        <Badge variant="destructive" className="text-xs">
                          Stock Bajo
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron productos que coincidan con los criterios de búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
