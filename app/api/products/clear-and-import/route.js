import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// POST - Limpiar todos los productos e importar nuevos desde CSV
export async function POST(request) {
  try {
    const { csvUrl, clearExisting = true } = await request.json()

    // Si se solicita, limpiar productos existentes
    if (clearExisting) {
      console.log("Limpiando productos existentes...")
      await ProductService.clearAllProducts()
    }

    // Fetch CSV data
    console.log("Descargando nuevo archivo CSV...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("Procesando CSV con formato específico...")
    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())

    // Detectar separador (coma o punto y coma)
    const firstLine = lines[0]
    const separator = firstLine.includes(";") ? ";" : ","
    console.log("Separador detectado:", separator)

    const headers = lines[0].split(separator).map((h) => h.trim().replace(/"/g, ""))
    console.log("Headers encontrados:", headers)

    const csvData = []
    let processedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3 && values[0] && values[1]) {
        // Formato específico: Codigo, Articulos, Cantidad 2 Meses
        const codigo = values[0].toString().trim()
        const nombre = values[1].trim()

        // 🔧 MEJORAR PARSING DE CANTIDAD: Manejar diferentes formatos
        let cantidad2Meses = 0
        const cantidadStr = values[2] ? values[2].toString().replace(/[^\d.,]/g, "") : "0"

        // Intentar parsear como número, manejando comas como separadores decimales
        if (cantidadStr.includes(",") && !cantidadStr.includes(".")) {
          // Formato europeo: 1,5 = 1.5
          cantidad2Meses = Number.parseFloat(cantidadStr.replace(",", ".")) || 0
        } else {
          // Formato estándar
          cantidad2Meses = Number.parseFloat(cantidadStr) || 0
        }

        // Convertir cantidad de 2 meses a demanda mensual
        const demandaMensual = Math.ceil(cantidad2Meses / 2)

        console.log(
          `Procesando: ${codigo} - ${nombre} - Cantidad 2M: ${cantidad2Meses} - Demanda mensual: ${demandaMensual}`,
        )

        csvData.push({
          codigo: codigo,
          name: nombre,
          sector_id: ["A", "B", "C", "D", "E"][i % 5], // Distribuir entre sectores
          quantity: Math.floor(Math.random() * 300) + 50, // Stock inicial aleatorio
          format: extractFormat(nombre),
          type: extractType(nombre),
          min_stock: Math.max(demandaMensual, 5), // Stock mínimo = demanda mensual (mínimo 5)
          monthly_demand: demandaMensual,
          total_demand: demandaMensual * 12, // Proyección anual
        })

        processedCount++
      }
    }

    console.log(`Procesados ${processedCount} productos de ${lines.length - 1} líneas`)

    // Importar productos a la base de datos
    const result = await ProductService.importProductsFromCSV(csvData)

    return NextResponse.json({
      message: `Importación completada: ${result.imported} productos importados de ${csvData.length} procesados`,
      result: {
        ...result,
        totalProcessed: processedCount,
        totalLines: lines.length - 1,
        separator: separator,
        sampleData: csvData.slice(0, 3), // Mostrar ejemplos para debug
      },
    })
  } catch (error) {
    console.error("Error in POST /api/products/clear-and-import:", error)
    return NextResponse.json({ error: "Error importando productos desde CSV" }, { status: 500 })
  }
}

function extractFormat(productName) {
  const formatRegex = /(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|cc|unid|u)/i
  const match = productName.match(formatRegex)
  if (match) {
    return `${match[1]}${match[2].toLowerCase()}`
  }
  return "1kg" // Formato por defecto
}

function extractType(productName) {
  const name = productName.toLowerCase()

  // Frutos secos
  if (
    name.includes("almendra") ||
    name.includes("nuez") ||
    name.includes("avellana") ||
    name.includes("pistacho") ||
    name.includes("anacardo") ||
    name.includes("mani") ||
    name.includes("pecan")
  ) {
    return "frutos-secos"
  }

  // Semillas
  if (
    name.includes("semilla") ||
    name.includes("chia") ||
    name.includes("girasol") ||
    name.includes("sesamo") ||
    name.includes("lino") ||
    name.includes("zapallo") ||
    name.includes("amapola")
  ) {
    return "semillas"
  }

  // Frutas secas
  if (
    name.includes("pasa") ||
    name.includes("datil") ||
    name.includes("arandano") ||
    name.includes("ciruela") ||
    name.includes("higo") ||
    name.includes("banana") ||
    name.includes("mango") ||
    name.includes("coco")
  ) {
    return "frutas-secas"
  }

  // Cereales y granos
  if (
    name.includes("granola") ||
    name.includes("cereal") ||
    name.includes("avena") ||
    name.includes("quinoa") ||
    name.includes("arroz") ||
    name.includes("trigo")
  ) {
    return "cereales"
  }

  // Legumbres
  if (
    name.includes("lenteja") ||
    name.includes("garbanzo") ||
    name.includes("poroto") ||
    name.includes("arveja") ||
    name.includes("soja")
  ) {
    return "legumbres"
  }

  // Especias y condimentos
  if (
    name.includes("pimienta") ||
    name.includes("comino") ||
    name.includes("oregano") ||
    name.includes("sal") ||
    name.includes("azucar") ||
    name.includes("canela")
  ) {
    return "especias"
  }

  // Mezclas (MIX)
  if (name.includes("mix") || name.includes("mezcla") || name.includes("trail")) {
    return "mezclas"
  }

  return "otros"
}
