import { NextResponse } from "next/server"
import { ProductService } from "@/lib/services/productService"

// GET - Obtener producto por código
export async function GET(request, { params }) {
  try {
    const { codigo } = params
    const product = await ProductService.getProductByCode(codigo)

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in GET /api/products/[codigo]:", error)
    return NextResponse.json({ error: "Error obteniendo producto" }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(request, { params }) {
  try {
    const { codigo } = params
    const updateData = await request.json()

    console.log("PUT request para producto:", codigo)
    console.log("Datos recibidos:", updateData)

    // 🔧 ARREGLO: Limpiar datos antes de enviar al servicio
    const cleanUpdateData = { ...updateData }

    // Remover campos que no deben actualizarse
    delete cleanUpdateData._id
    delete cleanUpdateData.created_at

    console.log("Datos limpios para actualizar:", cleanUpdateData)

    const product = await ProductService.updateProduct(codigo, cleanUpdateData)

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in PUT /api/products/[codigo]:", error)
    return NextResponse.json({ error: error.message || "Error actualizando producto" }, { status: 400 })
  }
}

// DELETE - Eliminar producto
export async function DELETE(request, { params }) {
  try {
    const { codigo } = params
    await ProductService.deleteProduct(codigo)

    return NextResponse.json({ message: "Producto eliminado exitosamente" })
  } catch (error) {
    console.error("Error in DELETE /api/products/[codigo]:", error)
    return NextResponse.json({ error: error.message || "Error eliminando producto" }, { status: 400 })
  }
}
