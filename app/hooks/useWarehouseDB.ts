"use client"

import { useState, useEffect } from "react"
import { supabase, type Product, type Sector, type StockMovement } from "@/lib/supabase"

export function useWarehouseDB() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar sectores
  const loadSectors = async () => {
    try {
      const { data, error } = await supabase.from("sectors").select("*").order("id")

      if (error) throw error
      setSectors(data || [])
    } catch (err) {
      console.error("Error loading sectors:", err)
      setError("Error cargando sectores")
    }
  }

  // Cargar productos
  const loadProducts = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*").order("name")

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error("Error loading products:", err)
      setError("Error cargando productos")
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([loadSectors(), loadProducts()])
      setIsLoading(false)
    }

    loadData()
  }, [])

  // Buscar productos
  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,codigo.ilike.%${query}%`)
        .order("name")

      if (error) throw error
      return data || []
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
      const { error } = await supabase
        .from("products")
        .update({
          codigo: updatedProduct.codigo,
          name: updatedProduct.name,
          sector_id: updatedProduct.sector_id,
          quantity: updatedProduct.quantity,
          format: updatedProduct.format,
          type: updatedProduct.type,
          min_stock: updatedProduct.min_stock,
          monthly_demand: updatedProduct.monthly_demand,
          total_demand: updatedProduct.total_demand,
        })
        .eq("id", updatedProduct.id)

      if (error) throw error

      // Actualizar estado local
      setProducts((prev) => prev.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))

      // Registrar movimiento de stock si cambió la cantidad
      const originalProduct = products.find((p) => p.id === updatedProduct.id)
      if (originalProduct && originalProduct.quantity !== updatedProduct.quantity) {
        await recordStockMovement({
          product_id: updatedProduct.id,
          movement_type: "ajuste",
          quantity: updatedProduct.quantity - originalProduct.quantity,
          previous_quantity: originalProduct.quantity,
          new_quantity: updatedProduct.quantity,
          reason: "Ajuste manual desde panel de administración",
          user_name: "Administrador",
        })
      }
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Error actualizando producto")
    }
  }

  // Agregar producto
  const addProduct = async (newProduct: Omit<Product, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("products").insert([newProduct]).select().single()

      if (error) throw error

      // Actualizar estado local
      setProducts((prev) => [...prev, data])
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Error agregando producto")
    }
  }

  // Registrar movimiento de stock
  const recordStockMovement = async (movement: Omit<StockMovement, "id" | "created_at">) => {
    try {
      const { error } = await supabase.from("stock_movements").insert([movement])

      if (error) throw error
    } catch (err) {
      console.error("Error recording stock movement:", err)
    }
  }

  // Obtener historial de movimientos
  const getStockMovements = async (productId?: string): Promise<StockMovement[]> => {
    try {
      let query = supabase.from("stock_movements").select("*").order("created_at", { ascending: false })

      if (productId) {
        query = query.eq("product_id", productId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (err) {
      console.error("Error getting stock movements:", err)
      return []
    }
  }

  // Importar productos desde CSV
  const importProductsFromCSV = async () => {
    try {
      setIsLoading(true)
      const csvUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gu%C3%ADa%20produccion-inyD1sGm4whTha5pmG6ctlenvQGMBS.csv"
      const response = await fetch(csvUrl)
      const csvText = await response.text()

      // Parse CSV
      const lines = csvText.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const productsToImport = []

      for (let i = 1; i < lines.length && i <= 100; i++) {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length >= 3 && values[0]) {
          const codigo = values[0] || `PROD-${i}`
          const nombre = values[1] || `Producto ${i}`
          const porMes = Number.parseInt(values[2]) || Math.floor(Math.random() * 100) + 10
          const porMeses = Number.parseInt(values[3]) || porMes * 12

          productsToImport.push({
            codigo,
            name: nombre,
            sector_id: ["A", "B", "C", "D", "E"][i % 5],
            quantity: Math.floor(Math.random() * 200) + 20,
            format: extractFormat(nombre),
            type: extractType(nombre),
            min_stock: porMes,
            monthly_demand: porMes,
            total_demand: porMeses,
          })
        }
      }

      // Insertar productos en la base de datos
      const { error } = await supabase.from("products").upsert(productsToImport, { onConflict: "codigo" })

      if (error) throw error

      // Recargar productos
      await loadProducts()
    } catch (err) {
      console.error("Error importing CSV:", err)
      setError("Error importando datos del CSV")
    } finally {
      setIsLoading(false)
    }
  }

  const extractFormat = (productName: string): string => {
    const formatRegex = /(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|cc)/i
    const match = productName.match(formatRegex)
    if (match) {
      return `${match[1]}${match[2].toLowerCase()}`
    }
    return "1kg"
  }

  const extractType = (productName: string): string => {
    const name = productName.toLowerCase()

    if (
      name.includes("almendra") ||
      name.includes("nuez") ||
      name.includes("avellana") ||
      name.includes("pistacho") ||
      name.includes("anacardo") ||
      name.includes("mani")
    ) {
      return "frutos-secos"
    }
    if (
      name.includes("semilla") ||
      name.includes("chia") ||
      name.includes("girasol") ||
      name.includes("sesamo") ||
      name.includes("lino")
    ) {
      return "semillas"
    }
    if (
      name.includes("pasa") ||
      name.includes("datil") ||
      name.includes("arandano") ||
      name.includes("ciruela") ||
      name.includes("higo")
    ) {
      return "frutas-secas"
    }
    if (name.includes("granola") || name.includes("cereal") || name.includes("avena")) {
      return "cereales"
    }
    if (name.includes("mix") || name.includes("mezcla")) {
      return "mezclas"
    }

    return "otros"
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
    getStockMovements,
    importProductsFromCSV,
  }
}
