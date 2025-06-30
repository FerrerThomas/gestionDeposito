import { NextResponse } from "next/server"
import { SectorService } from "@/lib/services/sectorService"

// GET - Obtener todos los sectores
export async function GET() {
  try {
    let sectors = await SectorService.getAllSectors()

    // Si no hay sectores, inicializar los por defecto
    if (sectors.length === 0) {
      sectors = await SectorService.initializeDefaultSectors()
    }

    return NextResponse.json({ sectors })
  } catch (error) {
    console.error("Error in GET /api/sectors:", error)
    return NextResponse.json({ error: "Error obteniendo sectores" }, { status: 500 })
  }
}
