import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// GET - Obtener todos los productos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const sector = searchParams.get("sector")

    let products

    if (search) {
      products = await ProductService.searchProducts(search)
    } else if (sector) {
      products = await ProductService.getProductsBySector(sector)
    } else {
      products = await ProductService.getAllProducts()
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json({ error: "Error obteniendo productos" }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request) {
  try {
    const productData = await request.json()
    const product = await ProductService.createProduct(productData)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/products:", error)
    return NextResponse.json({ error: error.message || "Error creando producto" }, { status: 400 })
  }
}
