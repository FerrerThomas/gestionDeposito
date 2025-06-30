import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// POST - Importar productos desde CSV
export async function POST(request) {
  try {
    const { csvUrl } = await request.json()

    // Fetch CSV data
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    const csvData = []

    for (let i = 1; i < lines.length && i <= 100; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3 && values[0]) {
        const codigo = values[0] || `PROD-${i}`
        const nombre = values[1] || `Producto ${i}`
        const porMes = Number.parseInt(values[2]) || Math.floor(Math.random() * 100) + 10
        const porMeses = Number.parseInt(values[3]) || porMes * 12

        csvData.push({
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

    const result = await ProductService.importProductsFromCSV(csvData)

    return NextResponse.json({
      message: `Importación completada: ${result.imported} productos de ${result.total} procesados`,
      result,
    })
  } catch (error) {
    console.error("Error in POST /api/products/import-csv:", error)
    return NextResponse.json({ error: "Error importando productos desde CSV" }, { status: 500 })
  }
}

function extractFormat(productName) {
  const formatRegex = /(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|cc)/i
  const match = productName.match(formatRegex)
  if (match) {
    return `${match[1]}${match[2].toLowerCase()}`
  }
  return "1kg"
}

function extractType(productName) {
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
