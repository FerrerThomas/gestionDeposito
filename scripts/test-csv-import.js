// Script para probar la importación del nuevo CSV
const csvUrl =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DatosProduccion%28Hoja1%29-33bmaw0juHwe3o2tFYoX5i5CMxRaZd.csv"

async function testCSVImport() {
  try {
    console.log("🔄 Probando importación del nuevo CSV...")

    // Fetch CSV data
    const response = await fetch(csvUrl)
    const csvText = await response.text()

    console.log("📄 CSV descargado exitosamente")
    console.log("📏 Tamaño del archivo:", csvText.length, "caracteres")

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("📋 Headers encontrados:", headers)
    console.log("📊 Total de líneas:", lines.length - 1)

    // Procesar primeras 5 líneas como ejemplo
    console.log("\n🔍 Primeros 5 productos:")
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

      if (values.length >= 3) {
        const codigo = values[0].toString().trim()
        const nombre = values[1].trim()
        const cantidad2Meses = Number.parseFloat(values[2]) || 0
        const demandaMensual = Math.ceil(cantidad2Meses / 2)

        console.log(`${i}. Código: ${codigo}`)
        console.log(`   Nombre: ${nombre}`)
        console.log(`   Cantidad 2 meses: ${cantidad2Meses}`)
        console.log(`   Demanda mensual: ${demandaMensual}`)
        console.log(`   Formato detectado: ${extractFormat(nombre)}`)
        console.log(`   Tipo detectado: ${extractType(nombre)}`)
        console.log("   ---")
      }
    }

    // Estadísticas generales
    let totalProductos = 0
    let totalDemanda = 0

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      if (values.length >= 3 && values[0] && values[1]) {
        totalProductos++
        const cantidad2Meses = Number.parseFloat(values[2]) || 0
        totalDemanda += Math.ceil(cantidad2Meses / 2)
      }
    }

    console.log("\n📈 Estadísticas:")
    console.log(`✅ Productos válidos: ${totalProductos}`)
    console.log(`📊 Demanda mensual total: ${totalDemanda}`)
    console.log(`📅 Demanda anual proyectada: ${totalDemanda * 12}`)

    return {
      totalProductos,
      totalDemanda,
      headers,
    }
  } catch (error) {
    console.error("❌ Error probando CSV:", error)
    return null
  }
}

function extractFormat(productName) {
  const formatRegex = /(\d+(?:\.\d+)?)\s*(kg|gr|g|ml|l|cc|unid|u)/i
  const match = productName.match(formatRegex)
  if (match) {
    return `${match[1]}${match[2].toLowerCase()}`
  }
  return "1unid" // Formato por defecto para productos sin peso específico
}

function extractType(productName) {
  const name = productName.toLowerCase()

  // Chocolates y dulces
  if (name.includes("chocolate") || name.includes("dulce") || name.includes("caramelo") || name.includes("bon o bon")) {
    return "chocolates-dulces"
  }

  // Frutos secos
  if (name.includes("almendra") || name.includes("nuez") || name.includes("avellana") || name.includes("pistacho")) {
    return "frutos-secos"
  }

  // Semillas
  if (name.includes("semilla") || name.includes("chia") || name.includes("girasol") || name.includes("sesamo")) {
    return "semillas"
  }

  // Frutas secas
  if (name.includes("pasa") || name.includes("datil") || name.includes("arandano") || name.includes("ciruela")) {
    return "frutas-secas"
  }

  // Cereales
  if (name.includes("granola") || name.includes("cereal") || name.includes("avena")) {
    return "cereales"
  }

  // Snacks
  if (name.includes("snack") || name.includes("mix") || name.includes("mezcla")) {
    return "snacks"
  }

  return "otros"
}

// Ejecutar la prueba
testCSVImport().then((result) => {
  if (result) {
    console.log(`\n🚀 Listo para importar ${result.totalProductos} productos!`)
  }
})
