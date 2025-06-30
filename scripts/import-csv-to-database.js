// Script para importar datos del CSV a la base de datos
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gu%C3%ADa%20produccion-inyD1sGm4whTha5pmG6ctlenvQGMBS.csv"

async function importCSVToDatabase() {
  try {
    console.log("🔄 Iniciando importación de datos del CSV...")

    // Fetch CSV data
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("📄 CSV descargado exitosamente")

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("📋 Headers encontrados:", headers)

    const products = []

    for (let i = 1; i < lines.length && i <= 100; i++) {
      // Limitar a 100 productos para la demo
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3 && values[0]) {
        const codigo = values[0] || `PROD-${i}`
        const nombre = values[1] || `Producto ${i}`
        const porMes = Number.parseInt(values[2]) || Math.floor(Math.random() * 100) + 10
        const porMeses = Number.parseInt(values[3]) || porMes * 12

        const product = {
          codigo: codigo,
          name: nombre,
          sector_id: ["A", "B", "C", "D", "E"][i % 5],
          quantity: Math.floor(Math.random() * 200) + 20,
          format: extractFormat(nombre),
          type: extractType(nombre),
          min_stock: porMes,
          monthly_demand: porMes,
          total_demand: porMeses,
        }

        products.push(product)
      }
    }

    console.log(`✅ Procesados ${products.length} productos`)
    console.log("📦 Productos de ejemplo:", products.slice(0, 3))

    // Aquí normalmente insertaríamos en la base de datos
    // Para la demo, solo mostramos los datos procesados
    console.log("🎯 Datos listos para insertar en la base de datos")

    return products
  } catch (error) {
    console.error("❌ Error importando CSV:", error)
    return []
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

// Ejecutar la importación
importCSVToDatabase().then((products) => {
  console.log(`🚀 Importación completada: ${products.length} productos procesados`)
})
