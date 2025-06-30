import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// GET - Obtener productos con stock bajo
export async function GET() {
  try {
    const products = await ProductService.getLowStockProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error in GET /api/products/low-stock:", error)
    return NextResponse.json({ error: "Error obteniendo productos con stock bajo" }, { status: 500 })
  }
}
