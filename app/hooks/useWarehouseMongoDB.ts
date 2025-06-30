"use client"

import { useState, useEffect } from "react"

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
  created_at?: string
  updated_at?: string
}

interface Sector {
  _id?: string
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
}

export function useWarehouseMongoDB() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar sectores
  const loadSectors = async () => {
    try {
      const response = await fetch("/api/sectors")
      if (!response.ok) throw new Error("Error loading sectors")

      const data = await response.json()
      setSectors(data.sectors)
    } catch (err) {
      console.error("Error loading sectors:", err)
      setError("Error cargando sectores")
    }
  }

  // Cargar productos
  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Error loading products")

      const data = await response.json()
      setProducts(data.products)
    } catch (err) {
      console.error("Error loading products:", err)
      setError("Error cargando productos")
    }
  }

  // Refrescar todos los datos
  const refreshData = async () => {
    setIsLoading(true)
    await Promise.all([loadSectors(), loadProducts()])
    setIsLoading(false)
  }

  // Cargar datos iniciales
  useEffect(() => {
    refreshData()
  }, [])

  // Buscar productos
  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error("Error searching products")

      const data = await response.json()
      return data.products
    } catch (err) {
      console.error("Error searching products:", err)
      return []
    }
  }

  // Obtener productos por sector
  const getProductsBySector = (sectorId: string): Product[] => {
    return products.filter((product) => product.sector_id === sectorId)
  }

  // Obtener productos con stock bajo
  const getLowStockProducts = (): Product[] => {
    return products.filter((product) => product.quantity < product.min_stock)
  }

  // Calcular déficit de stock
  const getStockDeficit = (product: Product): number => {
    return Math.max(0, product.min_stock - product.quantity)
  }

  // Actualizar producto
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const response = await fetch(`/api/products/${updatedProduct.codigo}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      })

      if (!response.ok) throw new Error("Error updating product")

      const data = await response.json()

      // Actualizar estado local
      setProducts((prev) => prev.map((product) => (product.codigo === updatedProduct.codigo ? data.product : product)))
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Error actualizando producto")
    }
  }

  // Agregar producto
  const addProduct = async (newProduct: Omit<Product, "_id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error adding product")
      }

      const data = await response.json()

      // Actualizar estado local
      setProducts((prev) => [...prev, data.product])
    } catch (err) {
      console.error("Error adding product:", err)
      setError(err instanceof Error ? err.message : "Error agregando producto")
    }
  }

  // Importar productos desde CSV (método legacy)
  const importProductsFromCSV = async () => {
    try {
      setIsLoading(true)
      const csvUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gu%C3%ADa%20produccion-inyD1sGm4whTha5pmG6ctlenvQGMBS.csv"

      const response = await fetch("/api/products/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvUrl }),
      })

      if (!response.ok) throw new Error("Error importing CSV")

      const data = await response.json()
      console.log("Import result:", data.message)

      // Recargar productos
      await loadProducts()
    } catch (err) {
      console.error("Error importing CSV:", err)
      setError("Error importando datos del CSV")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    sectors,
    products,
    isLoading,
    error,
    searchProducts,
    getProductsBySector,
    getLowStockProducts,
    getStockDeficit,
    updateProduct,
    addProduct,
    importProductsFromCSV,
    refreshData,
  }
}
