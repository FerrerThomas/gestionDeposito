// Script para probar la actualización de stock
const stockUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StockActual%201%28Sheet%29-vHmUmZMUnVHRd110sjUibnqR15VHOb.csv"

async function testStockUpdate() {
  try {
    console.log("🔄 Probando actualización de stock...")

    // Fetch CSV data
    const response = await fetch(stockUrl)
    const csvText = await response.text()

    console.log("📄 CSV de stock descargado exitosamente")
    console.log("📏 Tamaño del archivo:", csvText.length, "caracteres")

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("📋 Headers encontrados:", headers)
    console.log("📊 Total de líneas:", lines.length - 1)

    // Usar posiciones fijas basadas en el schema
    const codigoIndexFinal = 0 // Primera columna
    const stockIndexFinal = 6 // Séptima columna (STOCK)
    const descripcionIndexFinal = 1 // Segunda columna

    console.log(`📍 Columna CÓDIGO en posición: ${codigoIndexFinal}`)
    console.log(`📍 Columna STOCK en posición: ${stockIndexFinal}`)
    console.log(`📍 Columna DESCRIPCIÓN en posición: ${descripcionIndexFinal}`)

    // Procesar primeras 10 líneas como ejemplo
    console.log("\n🔍 Primeros 10 productos para actualizar:")
    for (let i = 1; i <= Math.min(10, lines.length - 1); i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (
        values.length > Math.max(codigoIndexFinal, stockIndexFinal) &&
        values[codigoIndexFinal] &&
        values[stockIndexFinal]
      ) {
        const codigoOriginal = values[codigoIndexFinal].toString().trim()
        const codigoNormalizado = codigoOriginal.replace(/^0+/, "") || "0"
        const nuevoStock = Number.parseInt(values[stockIndexFinal]) || 0
        const descripcion =
          descripcionIndexFinal >= 0 && values[descripcionIndexFinal]
            ? values[descripcionIndexFinal]
            : "Sin descripción"

        console.log(`${i}. Código Original: ${codigoOriginal}`)
        console.log(`   Código Normalizado: ${codigoNormalizado}`)
        console.log(`   Descripción: ${descripcion}`)
        console.log(`   Nuevo Stock: ${nuevoStock}`)
        console.log("   ---")
      }
    }

    // Estadísticas generales
    let totalProductos = 0
    let totalStock = 0
    const stockPorCodigo = new Map()
    const codigosNormalizados = new Map()

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      if (
        values.length > Math.max(codigoIndexFinal, stockIndexFinal) &&
        values[codigoIndexFinal] &&
        values[stockIndexFinal]
      ) {
        const codigoOriginal = values[codigoIndexFinal].toString().trim()
        const codigoNormalizado = codigoOriginal.replace(/^0+/, "") || "0"
        const stock = Number.parseInt(values[stockIndexFinal]) || 0

        stockPorCodigo.set(codigoOriginal, stock)
        codigosNormalizados.set(codigoNormalizado, { original: codigoOriginal, stock })
        totalProductos++
        totalStock += stock
      }
    }

    console.log("\n📈 Estadísticas del archivo de stock:")
    console.log(`✅ Productos con stock: ${totalProductos}`)
    console.log(`📦 Stock total: ${totalStock}`)
    console.log(`📊 Stock promedio: ${Math.round(totalStock / totalProductos)}`)

    // Buscar algunos códigos específicos
    console.log("\n🔍 Búsqueda de códigos específicos (normalizados):")
    const codigosEjemplo = ["116", "215", "500"]
    codigosEjemplo.forEach((codigo) => {
      if (codigosNormalizados.has(codigo)) {
        const info = codigosNormalizados.get(codigo)
        console.log(`✅ Código ${codigo}: Original ${info.original} → Stock ${info.stock}`)
      } else {
        console.log(`❌ Código ${codigo}: No encontrado`)
      }
    })

    // Mostrar algunos ejemplos de normalización
    console.log("\n🔧 Ejemplos de normalización de códigos:")
    let ejemplosCount = 0
    for (const [normalizado, info] of codigosNormalizados) {
      if (info.original !== normalizado && ejemplosCount < 5) {
        console.log(`   ${info.original} → ${normalizado} (Stock: ${info.stock})`)
        ejemplosCount++
      }
    }

    return {
      totalProductos,
      totalStock,
      headers,
      codigosNormalizados,
    }
  } catch (error) {
    console.error("❌ Error probando actualización de stock:", error)
    return null
  }
}

// Ejecutar la prueba
testStockUpdate().then((result) => {
  if (result) {
    console.log(`\n🚀 Listo para actualizar stock de ${result.totalProductos} productos!`)
    console.log("🔧 Los códigos se normalizarán automáticamente removiendo ceros iniciales")
  }
})
