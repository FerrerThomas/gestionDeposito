import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// POST - Actualizar stock de productos existentes desde CSV
export async function POST(request) {
  try {
    const { csvUrl } = await request.json()

    console.log("Descargando archivo de stock...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("Procesando archivo de stock...")

    // Detectar separador
    const lines = csvText.split("\n").filter((line) => line.trim())
    const firstLine = lines[0]
    const separator = firstLine.includes(";") ? ";" : ","
    console.log("Separador detectado:", separator)

    // Parse CSV
    const headers = lines[0].split(separator).map((h) => h.trim().replace(/"/g, ""))
    console.log("Headers encontrados:", headers)

    // Encontrar índices de las columnas importantes con mejor detección
    const codigoIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("codigo") || header.includes("código") || header.includes("cdigo")
    })

    const stockIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("stock") || header.includes("cantidad") || header.includes("cant")
    })

    const descripcionIndex = headers.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return (
        header.includes("descripcion") ||
        header.includes("descripción") ||
        header.includes("descripcin") ||
        header.includes("articulo") ||
        header.includes("producto")
      )
    })

    // Si no se encuentran por nombre, usar posiciones fijas basadas en el schema
    const codigoIndexFinal = codigoIndex !== -1 ? codigoIndex : 0 // Primera columna
    const stockIndexFinal = stockIndex !== -1 ? stockIndex : 6 // Séptima columna (STOCK)
    const descripcionIndexFinal = descripcionIndex !== -1 ? descripcionIndex : 1 // Segunda columna

    console.log(`Usando CÓDIGO en posición: ${codigoIndexFinal} (${headers[codigoIndexFinal]})`)
    console.log(`Usando STOCK en posición: ${stockIndexFinal} (${headers[stockIndexFinal]})`)
    console.log(`Usando DESCRIPCIÓN en posición: ${descripcionIndexFinal} (${headers[descripcionIndexFinal]})`)

    const stockUpdates = []
    let processedCount = 0
    let updatedCount = 0
    let notFoundCount = 0

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(separator).map((v) => v.trim().replace(/"/g, ""))

      if (
        values.length > Math.max(codigoIndexFinal, stockIndexFinal) &&
        values[codigoIndexFinal] &&
        values[stockIndexFinal] !== undefined &&
        values[stockIndexFinal] !== ""
      ) {
        const codigoOriginal = values[codigoIndexFinal].toString().trim()

        // 🔧 MEJORAR PARSING DE STOCK: Manejar diferentes formatos
        let nuevoStock = 0
        const stockStr = values[stockIndexFinal] ? values[stockIndexFinal].toString().replace(/[^\d.,]/g, "") : "0"

        // Intentar parsear como número, manejando comas como separadores decimales
        if (stockStr.includes(",") && !stockStr.includes(".")) {
          // Formato europeo: 1,5 = 1.5
          nuevoStock = Math.floor(Number.parseFloat(stockStr.replace(",", ".")) || 0)
        } else {
          // Formato estándar
          nuevoStock = Math.floor(Number.parseFloat(stockStr) || 0)
        }

        const descripcion =
          descripcionIndexFinal >= 0 && values[descripcionIndexFinal] ? values[descripcionIndexFinal] : ""

        // 🔧 NORMALIZAR CÓDIGO: Remover ceros al principio
        const codigoNormalizado = codigoOriginal.replace(/^0+/, "") || "0"

        console.log(`Procesando: ${codigoOriginal} → ${codigoNormalizado} (Stock: ${stockStr} → ${nuevoStock})`)

        // Buscar el producto por código normalizado
        try {
          let producto = await ProductService.getProductByCode(codigoNormalizado)

          // Si no se encuentra con el código normalizado, intentar con el original
          if (!producto && codigoOriginal !== codigoNormalizado) {
            producto = await ProductService.getProductByCode(codigoOriginal)
          }

          if (producto) {
            // Actualizar solo el stock
            await ProductService.updateProduct(producto.codigo, {
              quantity: nuevoStock,
            })

            stockUpdates.push({
              codigoOriginal,
              codigoNormalizado,
              codigoEncontrado: producto.codigo,
              descripcion,
              stockAnterior: producto.quantity,
              stockNuevo: nuevoStock,
              diferencia: nuevoStock - producto.quantity,
              stockStringOriginal: values[stockIndexFinal], // Para debug
            })
            updatedCount++
            console.log(`✅ Actualizado: ${producto.codigo} → Stock: ${nuevoStock} (anterior: ${producto.quantity})`)
          } else {
            console.log(`❌ Producto no encontrado: ${codigoOriginal} (${codigoNormalizado}) - ${descripcion}`)
            notFoundCount++
          }
        } catch (error) {
          console.error(`Error actualizando producto ${codigoOriginal}:`, error)
        }

        processedCount++
      } else {
        console.log(`⚠️ Línea ${i} omitida: datos insuficientes o stock vacío`)
      }
    }

    console.log(`Procesadas ${processedCount} líneas`)
    console.log(`Actualizados ${updatedCount} productos`)
    console.log(`No encontrados ${notFoundCount} productos`)

    return NextResponse.json({
      message: `Actualización de stock completada: ${updatedCount} productos actualizados de ${processedCount} procesados`,
      result: {
        processed: processedCount,
        updated: updatedCount,
        notFound: notFoundCount,
        updates: stockUpdates.slice(0, 15), // Mostrar más ejemplos
        totalUpdates: stockUpdates.length,
        separator: separator,
        headers: headers,
        columnMapping: {
          codigo: { index: codigoIndexFinal, header: headers[codigoIndexFinal] },
          stock: { index: stockIndexFinal, header: headers[stockIndexFinal] },
          descripcion: { index: descripcionIndexFinal, header: headers[descripcionIndexFinal] },
        },
      },
    })
  } catch (error) {
    console.error("Error in POST /api/products/update-stock:", error)
    return NextResponse.json({ error: error.message || "Error actualizando stock desde CSV" }, { status: 500 })
  }
}
