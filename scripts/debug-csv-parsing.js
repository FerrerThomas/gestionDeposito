// Script para debuggear el parsing de CSV y verificar los datos específicos
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DatosProduccion%28Hoja1%29-33bmaw0juHwe3o2tFYoX5i5CMxRaZd.csv"
const stockUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StockActual%201%28Sheet%29-vHmUmZMUnVHRd110sjUibnqR15VHOb.csv"

async function debugCSVParsing() {
  try {
    console.log("🔍 DEBUGGEANDO PARSING DE CSV...")

    // === ARCHIVO DE PRODUCTOS ===
    console.log("\n📋 === ARCHIVO DE PRODUCTOS ===")
    const productResponse = await fetch(csvUrl)
    const productCsvText = await productResponse.text()

    const productLines = productCsvText.split("\n").filter((line) => line.trim())
    const productSeparator = productLines[0].includes(";") ? ";" : ","
    console.log("Separador detectado:", productSeparator)

    const productHeaders = productLines[0].split(productSeparator).map((h) => h.trim().replace(/"/g, ""))
    console.log("Headers:", productHeaders)

    // Buscar producto 218 específicamente
    console.log("\n🔍 Buscando producto 218...")
    for (let i = 1; i < productLines.length; i++) {
      const values = productLines[i].split(productSeparator).map((v) => v.trim().replace(/"/g, ""))

      if (values[0] && values[0].toString().trim() === "218") {
        console.log(`✅ ENCONTRADO en línea ${i}:`)
        console.log("Código:", values[0])
        console.log("Nombre:", values[1])
        console.log("Cantidad 2 meses (raw):", values[2])

        // Procesar cantidad
        let cantidad2Meses = 0
        const cantidadStr = values[2] ? values[2].toString().replace(/[^\d.,]/g, "") : "0"

        if (cantidadStr.includes(",") && !cantidadStr.includes(".")) {
          cantidad2Meses = Number.parseFloat(cantidadStr.replace(",", ".")) || 0
        } else {
          cantidad2Meses = Number.parseFloat(cantidadStr) || 0
        }

        const demandaMensual = Math.ceil(cantidad2Meses / 2)

        console.log("Cantidad procesada:", cantidad2Meses)
        console.log("Demanda mensual calculada:", demandaMensual)
        console.log("Stock mínimo que debería ser:", Math.max(demandaMensual, 5))
        break
      }
    }

    // === ARCHIVO DE STOCK ===
    console.log("\n📦 === ARCHIVO DE STOCK ===")
    const stockResponse = await fetch(stockUrl)
    const stockCsvText = await stockResponse.text()

    const stockLines = stockCsvText.split("\n").filter((line) => line.trim())
    const stockSeparator = stockLines[0].includes(";") ? ";" : ","
    console.log("Separador detectado:", stockSeparator)

    const stockHeaders = stockLines[0].split(stockSeparator).map((h) => h.trim().replace(/"/g, ""))
    console.log("Headers:", stockHeaders)

    // Detectar columnas
    const codigoIndex = stockHeaders.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("codigo") || header.includes("código")
    })

    const stockIndex = stockHeaders.findIndex((h) => {
      const header = h
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      return header.includes("stock") || header.includes("cantidad")
    })

    console.log(`Columna código: ${codigoIndex} (${stockHeaders[codigoIndex]})`)
    console.log(`Columna stock: ${stockIndex} (${stockHeaders[stockIndex]})`)

    // Buscar producto 218 en stock
    console.log("\n🔍 Buscando producto 218 en archivo de stock...")
    for (let i = 1; i < stockLines.length; i++) {
      const values = stockLines[i].split(stockSeparator).map((v) => v.trim().replace(/"/g, ""))

      const codigoOriginal = values[codigoIndex] ? values[codigoIndex].toString().trim() : ""
      const codigoNormalizado = codigoOriginal.replace(/^0+/, "") || "0"

      if (codigoNormalizado === "218" || codigoOriginal === "218") {
        console.log(`✅ ENCONTRADO en línea ${i}:`)
        console.log("Código original:", codigoOriginal)
        console.log("Código normalizado:", codigoNormalizado)
        console.log("Stock (raw):", values[stockIndex])

        // Procesar stock
        let nuevoStock = 0
        const stockStr = values[stockIndex] ? values[stockIndex].toString().replace(/[^\d.,]/g, "") : "0"

        if (stockStr.includes(",") && !stockStr.includes(".")) {
          nuevoStock = Math.floor(Number.parseFloat(stockStr.replace(",", ".")) || 0)
        } else {
          nuevoStock = Math.floor(Number.parseFloat(stockStr) || 0)
        }

        console.log("Stock procesado:", nuevoStock)
        console.log("Stock que debería ser:", nuevoStock)
        break
      }
    }

    // Mostrar algunos ejemplos más
    console.log("\n📊 === PRIMEROS 5 PRODUCTOS ===")
    for (let i = 1; i <= Math.min(5, productLines.length - 1); i++) {
      const values = productLines[i].split(productSeparator).map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3) {
        const codigo = values[0]
        const nombre = values[1]
        const cantidadRaw = values[2]

        let cantidad2Meses = 0
        const cantidadStr = cantidadRaw ? cantidadRaw.toString().replace(/[^\d.,]/g, "") : "0"

        if (cantidadStr.includes(",") && !cantidadStr.includes(".")) {
          cantidad2Meses = Number.parseFloat(cantidadStr.replace(",", ".")) || 0
        } else {
          cantidad2Meses = Number.parseFloat(cantidadStr) || 0
        }

        const demandaMensual = Math.ceil(cantidad2Meses / 2)

        console.log(
          `${codigo}: ${nombre} | Raw: "${cantidadRaw}" | Procesado: ${cantidad2Meses} | Mensual: ${demandaMensual}`,
        )
      }
    }
  } catch (error) {
    console.error("❌ Error debuggeando CSV:", error)
  }
}

// Ejecutar debug
debugCSVParsing()
