// Script para procesar los datos del CSV de productos
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gu%C3%ADa%20produccion-inyD1sGm4whTha5pmG6ctlenvQGMBS.csv"

async function processProductsData() {
  try {
    console.log("Fetching CSV data...")
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("Raw CSV content:")
    console.log(csvText.substring(0, 500) + "...")

    // Parse CSV manually
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("Headers found:", headers)

    const products = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= headers.length && values[0]) {
        const product = {}
        headers.forEach((header, index) => {
          product[header] = values[index] || ""
        })
        products.push(product)
      }
    }

    console.log(`Processed ${products.length} products`)
    console.log("Sample products:", products.slice(0, 3))

    // Transform data for our system
    const transformedProducts = products.map((product, index) => {
      // Extract product info from the data
      const codigo = product[""] || product["codigo"] || product["Codigo"] || `PROD-${index + 1}`
      const nombre =
        product["nombre"] || product["Nombre"] || product["producto"] || product["Producto"] || `Producto ${index + 1}`
      const porMes = Number.parseInt(product["por mes"] || product["Por Mes"] || product["mensual"] || "0") || 0
      const porMeses = Number.parseInt(product["por meses"] || product["Por Meses"] || product["total"] || "0") || 0

      return {
        id: codigo,
        codigo: codigo,
        name: nombre,
        sector: ["A", "B", "C", "D", "E"][index % 5], // Distribute across sectors
        quantity: Math.floor(Math.random() * 200) + 50, // Random current stock
        format: extractFormat(nombre),
        type: extractType(nombre),
        minStock: porMes, // Minimum stock is monthly requirement
        monthlyDemand: porMes,
        totalDemand: porMeses,
      }
    })

    console.log("Transformed products:", transformedProducts.slice(0, 5))
    return transformedProducts
  } catch (error) {
    console.error("Error processing CSV:", error)
    return []
  }
}

function extractFormat(productName) {
  const formatRegex = /(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|cc)/i
  const match = productName.match(formatRegex)
  if (match) {
    return `${match[1]}${match[2].toLowerCase()}`
  }
  return "1kg" // Default format
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

// Execute the function
processProductsData().then((products) => {
  console.log("Final processed products:", products.length)
})
