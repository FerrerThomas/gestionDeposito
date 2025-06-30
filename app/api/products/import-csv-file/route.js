import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// POST - Importar productos desde archivo CSV subido (sin limpiar existentes)
export async function POST(request) {
  try {
    const { csvData } = await request.json()

    if (!csvData) {
      return NextResponse.json({ error: "No se proporcionaron datos CSV" }, { status: 400 })
    }

    console.log("Procesando CSV desde archivo subido (modo actualización)...")

    // Parse CSV
    const lines = csvData.split("\n").filter((line) => line.trim())

    // Detectar separador (coma o punto y coma)
    const firstLine = lines[0]
    const separator = firstLine.includes(";") ? ";" : ","
    console.log("Separador detectado:", separator)

    const headers = lines[0].split(separator).map((h) => h.trim().replace(/"/g, ""))
    console.log("Headers encontrados:", headers)

    // Detectar columnas automáticamente (mismo código que clear-and-import-file)
    const codigoIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("codigo") || header.includes("código") || header.includes("cdigo")
    })

    const nombreIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return (
        header.includes("articulo") ||
        header.includes("artículo") ||
        header.includes("nombre") ||
        header.includes("producto") ||
        header.includes("descripcion")
      )
    })

    const demandaIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return (
        header.includes("demanda") ||
        header.includes("mensual") ||
        header.includes("minimo") ||
        header.includes("mínimo") ||
        header.includes("stock_min") ||
        header.includes("cantidad")
      )
    })

    const formatoIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("formato") || header.includes("presentacion") || header.includes("presentación")
    })

    const tipoIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("tipo") || header.includes("categoria") || header.includes("categoría")
    })

    const sectorIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("sector") || header.includes("ubicacion") || header.includes("ubicación")
    })

    // Usar posiciones por defecto si no se encuentran
    const codigoIndexFinal = codigoIndex !== -1 ? codigoIndex : 0
    const nombreIndexFinal = nombreIndex !== -1 ? nombreIndex : 1
    const demandaIndexFinal = demandaIndex !== -1 ? demandaIndex : 2

    console.log(`Usando CÓDIGO en posición: ${codigoIndexFinal} (${headers[codigoIndexFinal]})`)
    console.log(`Usando NOMBRE en posición: ${nombreIndexFinal} (${headers[nombreIndexFinal]})`)
    console.log(`Usando DEMANDA en posición: ${demandaIndexFinal} (${headers[demandaIndexFinal]})`)

    const csvDataProcessed = []
    let processedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3 && values[codigoIndexFinal] && values[nombreIndexFinal]) {
        const codigo = values[codigoIndexFinal].toString().trim()
        const nombre = values[nombreIndexFinal].trim()

        // Procesar demanda/stock mínimo
        let demandaMensual = 0
        if (values[demandaIndexFinal]) {
          const demandaStr = values[demandaIndexFinal].toString().replace(/[^\d.,]/g, "")
          if (demandaStr.includes(",") && !demandaStr.includes(".")) {
            demandaMensual = Math.ceil(Number.parseFloat(demandaStr.replace(",", ".")) || 0)
          } else {
            demandaMensual = Math.ceil(Number.parseFloat(demandaStr) || 0)
          }
        }

        // Si no hay demanda específica, usar un valor por defecto
        if (demandaMensual === 0) {
          demandaMensual = Math.floor(Math.random() * 50) + 10
        }

        // Obtener valores opcionales o generar automáticamente
        const formato = formatoIndex !== -1 && values[formatoIndex] ? values[formatoIndex] : extractFormat(nombre)
        const tipo = tipoIndex !== -1 && values[tipoIndex] ? values[tipoIndex] : extractType(nombre)
        const sector =
          sectorIndex !== -1 && values[sectorIndex] ? values[sectorIndex] : ["A", "B", "C", "D", "E"][i % 5]

        csvDataProcessed.push({
          codigo: codigo,
          name: nombre,
          sector_id: sector,
          quantity: Math.floor(Math.random() * 200) + 20,
          format: formato,
          type: tipo,
          min_stock: Math.max(demandaMensual, 5),
          monthly_demand: demandaMensual,
          total_demand: demandaMensual * 12,
        })

        processedCount++
      }
    }

    console.log(`Procesados ${processedCount} productos de ${lines.length - 1} líneas`)

    // Importar productos a la base de datos (modo upsert)
    const result = await ProductService.importProductsFromCSV(csvDataProcessed, false) // false = no reemplazar

    return NextResponse.json({
      message: `Importación completada: ${result.imported} productos importados/actualizados de ${csvDataProcessed.length} procesados`,
      result: {
        ...result,
        totalProcessed: processedCount,
        totalLines: lines.length - 1,
        separator: separator,
        columnMapping: {
          codigo: { index: codigoIndexFinal, header: headers[codigoIndexFinal] },
          nombre: { index: nombreIndexFinal, header: headers[nombreIndexFinal] },
          demanda: { index: demandaIndexFinal, header: headers[demandaIndexFinal] },
        },
        sampleData: csvDataProcessed.slice(0, 3),
      },
    })
  } catch (error) {
    console.error("Error in POST /api/products/import-csv-file:", error)
    return NextResponse.json({ error: "Error importando productos desde archivo CSV" }, { status: 500 })
  }
}

function extractFormat(productName) {
  const formatRegex = /(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|cc|unid|u)/i
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
    name.includes("mani") ||
    name.includes("pecan")
  ) {
    return "frutos-secos"
  }

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

  if (
    name.includes("lenteja") ||
    name.includes("garbanzo") ||
    name.includes("poroto") ||
    name.includes("arveja") ||
    name.includes("soja")
  ) {
    return "legumbres"
  }

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

  if (name.includes("mix") || name.includes("mezcla") || name.includes("trail")) {
    return "mezclas"
  }

  return "otros"
}
