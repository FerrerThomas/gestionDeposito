import clientPromise from "../mongodb.js"
import { Sector } from "../models/Product.js"

export class SectorService {
  static async getDatabase() {
    const client = await clientPromise
    return client.db("warehouse_management")
  }

  // Obtener todos los sectores
  static async getAllSectors() {
    try {
      const db = await this.getDatabase()
      const sectors = await db.collection("sectors").find({}).toArray()
      return sectors
    } catch (error) {
      console.error("Error getting sectors:", error)
      throw error
    }
  }

  // Inicializar sectores por defecto
  static async initializeDefaultSectors() {
    try {
      const db = await this.getDatabase()

      const defaultSectors = [
        { id: "D", name: "D", color: "#eab308", x: 20, y: 20, width: 180, height: 80 },
        { id: "C", name: "C", color: "#22c55e", x: 220, y: 20, width: 180, height: 80 },
        { id: "B", name: "B", color: "#3b82f6", x: 420, y: 20, width: 160, height: 80 },
        { id: "A", name: "A", color: "#ef4444", x: 600, y: 20, width: 120, height: 320 },
        { id: "E", name: "E", color: "#a855f7", x: 220, y: 220, width: 280, height: 120 },
      ]

      const bulkOps = defaultSectors.map((sectorData) => {
        const sector = new Sector(sectorData)
        return {
          updateOne: {
            filter: { id: sector.id },
            update: { $set: sector },
            upsert: true,
          },
        }
      })

      await db.collection("sectors").bulkWrite(bulkOps)
      return defaultSectors
    } catch (error) {
      console.error("Error initializing default sectors:", error)
      throw error
    }
  }
}
