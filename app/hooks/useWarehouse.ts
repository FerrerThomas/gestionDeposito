"use client"

import { useState, useEffect } from "react"

interface Product {
  id: string
  codigo: string
  name: string
  sector: string
  quantity: number
  format: string
  type: string
  minStock: number
  monthlyDemand: number
  totalDemand: number
}

interface Sector {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
}

export function useWarehouse() {
  const [sectors] = useState<Sector[]>([
    { id: "D", name: "D", color: "#eab308", x: 20, y: 20, width: 180, height: 80 },
    { id: "C", name: "C", color: "#22c55e", x: 220, y: 20, width: 180, height: 80 },
    { id: "B", name: "B", color: "#3b82f6", x: 420, y: 20, width: 160, height: 80 },
    { id: "A", name: "A", color: "#ef4444", x: 600, y: 20, width: 120, height: 320 },
    { id: "E", name: "E", color: "#a855f7", x: 220, y: 220, width: 280, height: 120 },
  ])

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load products from CSV data
  useEffect(() => {
    loadProductsFromCSV()
  }, [])

  const loadProductsFromCSV = async () => {
    try {
      setIsLoading(true)
      const csvUrl =
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gu%C3%ADa%20produccion-inyD1sGm4whTha5pmG6ctlenvQGMBS.csv"
      const response = await fetch(csvUrl)
      const csvText = await response.text()

      // Parse CSV
      const lines = csvText.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const parsedProducts: Product[] = []

      for (let i = 1; i < lines.length && i <= 50; i++) {
        // Limit to first 50 products for demo
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length >= 3 && values[0]) {
          // Try to extract data from different possible column positions
          const codigo = values[0] || `PROD-${i}`
          const nombre = values[1] || `Producto ${i}`
          const porMes = Number.parseInt(values[2]) || Math.floor(Math.random() * 100) + 10
          const porMeses = Number.parseInt(values[3]) || porMes * 12

          const product: Product = {
            id: codigo,
            codigo: codigo,
            name: nombre,
            sector: ["A", "B", "C", "D", "E"][i % 5],
            quantity: Math.floor(Math.random() * 200) + 20, // Random current stock
            format: extractFormat(nombre),
            type: extractType(nombre),
            minStock: porMes,
            monthlyDemand: porMes,
            totalDemand: porMeses,
          }

          parsedProducts.push(product)
        }
      }

      setProducts(parsedProducts)
    } catch (error) {
      console.error("Error loading CSV:", error)
      // Fallback to sample data
      setProducts(getSampleProducts())
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

  const getSampleProducts = (): Product[] => [
    {
      id: "CHIA100",
      codigo: "CHIA100",
      name: "Chia Semilla de 100gr",
      sector: "A",
      quantity: 45,
      format: "100gr",
      type: "semillas",
      minStock: 91,
      monthlyDemand: 91,
      totalDemand: 1092,
    },
    {
      id: "ALM500",
      codigo: "ALM500",
      name: "Almendras 500gr",
      sector: "B",
      quantity: 120,
      format: "500gr",
      type: "frutos-secos",
      minStock: 65,
      monthlyDemand: 65,
      totalDemand: 780,
    },
    {
      id: "NUEZ1K",
      codigo: "NUEZ1K",
      name: "Nueces 1kg",
      sector: "C",
      quantity: 30,
      format: "1kg",
      type: "frutos-secos",
      minStock: 45,
      monthlyDemand: 45,
      totalDemand: 540,
    },
  ]

  const searchProducts = (query: string): Product[] => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.codigo.toLowerCase().includes(query.toLowerCase()),
    )
  }

  const getProductsBySector = (sectorId: string): Product[] => {
    return products.filter((product) => product.sector === sectorId)
  }

  const getLowStockProducts = (): Product[] => {
    return products.filter((product) => product.quantity < product.minStock)
  }

  const getStockDeficit = (product: Product): number => {
    return Math.max(0, product.minStock - product.quantity)
  }

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((product) => (product.id === updatedProduct.id ? updatedProduct : product)))
  }

  const addProduct = (newProduct: Omit<Product, "id">) => {
    const id = `PROD-${Date.now()}`
    setProducts((prev) => [...prev, { ...newProduct, id }])
  }

  return {
    sectors,
    products,
    isLoading,
    searchProducts,
    getProductsBySector,
    getLowStockProducts,
    getStockDeficit,
    updateProduct,
    addProduct,
  }
}
