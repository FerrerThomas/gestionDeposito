import clientPromise from "../mongodb.js"
import { Product } from "../models/Product.js"
import { StockMovement } from "../models/StockMovement.js" // Import StockMovement

export class ProductService {
  static async getDatabase() {
    const client = await clientPromise
    return client.db("warehouse_management")
  }

  // Limpiar todos los productos (para reemplazo completo)
  static async clearAllProducts() {
    try {
      const db = await this.getDatabase()
      const result = await db.collection("products").deleteMany({})
      console.log(`Eliminados ${result.deletedCount} productos existentes`)
      return result
    } catch (error) {
      console.error("Error clearing products:", error)
      throw error
    }
  }

  // Obtener todos los productos
  static async getAllProducts() {
    try {
      const db = await this.getDatabase()
      const products = await db.collection("products").find({}).toArray()
      return products
    } catch (error) {
      console.error("Error getting products:", error)
      throw error
    }
  }

  // Obtener producto por código
  static async getProductByCode(codigo) {
    try {
      const db = await this.getDatabase()
      const product = await db.collection("products").findOne({ codigo })
      return product
    } catch (error) {
      console.error("Error getting product by code:", error)
      throw error
    }
  }

  // Buscar productos
  static async searchProducts(query) {
    try {
      const db = await this.getDatabase()
      const products = await db
        .collection("products")
        .find({
          $or: [{ name: { $regex: query, $options: "i" } }, { codigo: { $regex: query, $options: "i" } }],
        })
        .toArray()
      return products
    } catch (error) {
      console.error("Error searching products:", error)
      throw error
    }
  }

  // Obtener productos por sector
  static async getProductsBySector(sectorId) {
    try {
      const db = await this.getDatabase()
      const products = await db.collection("products").find({ sector_id: sectorId }).toArray()
      return products
    } catch (error) {
      console.error("Error getting products by sector:", error)
      throw error
    }
  }

  // Obtener productos con stock bajo
  static async getLowStockProducts() {
    try {
      const db = await this.getDatabase()
      const products = await db
        .collection("products")
        .find({
          $expr: { $lt: ["$quantity", "$min_stock"] },
        })
        .toArray()
      return products
    } catch (error) {
      console.error("Error getting low stock products:", error)
      throw error
    }
  }

  // Crear producto
  static async createProduct(productData) {
    try {
      const validation = Product.validate(productData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
      }

      const db = await this.getDatabase()

      // Verificar que no exista un producto con el mismo código
      const existingProduct = await this.getProductByCode(productData.codigo)
      if (existingProduct) {
        throw new Error("Ya existe un producto con este código")
      }

      const product = new Product(productData)
      const result = await db.collection("products").insertOne(product)

      return { ...product, _id: result.insertedId }
    } catch (error) {
      console.error("Error creating product:", error)
      throw error
    }
  }

  // Actualizar producto
  static async updateProduct(codigo, updateData) {
    try {
      const db = await this.getDatabase()

      // Obtener producto actual para el historial
      const currentProduct = await this.getProductByCode(codigo)
      if (!currentProduct) {
        throw new Error("Producto no encontrado")
      }

      // 🔧 ARREGLO: Remover _id y otros campos inmutables del updateData
      const cleanUpdateData = { ...updateData }
      delete cleanUpdateData._id
      delete cleanUpdateData.created_at // También remover created_at si existe

      // Agregar updated_at
      cleanUpdateData.updated_at = new Date()

      console.log("Actualizando producto:", codigo)
      console.log("Datos limpios para actualizar:", cleanUpdateData)

      const result = await db.collection("products").updateOne({ codigo }, { $set: cleanUpdateData })

      if (result.matchedCount === 0) {
        throw new Error("Producto no encontrado")
      }

      console.log("Producto actualizado exitosamente:", result)

      // Si cambió la cantidad, registrar movimiento
      if (cleanUpdateData.quantity !== undefined && cleanUpdateData.quantity !== currentProduct.quantity) {
        await this.recordStockMovement({
          product_id: currentProduct._id,
          movement_type: "ajuste",
          quantity: cleanUpdateData.quantity - currentProduct.quantity,
          previous_quantity: currentProduct.quantity,
          new_quantity: cleanUpdateData.quantity,
          reason: "Ajuste desde productos a envasar",
          user_name: "Sistema",
        })
      }

      return await this.getProductByCode(codigo)
    } catch (error) {
      console.error("Error updating product:", error)
      throw error
    }
  }

  // Eliminar producto
  static async deleteProduct(codigo) {
    try {
      const db = await this.getDatabase()
      const result = await db.collection("products").deleteOne({ codigo })

      if (result.deletedCount === 0) {
        throw new Error("Producto no encontrado")
      }

      return { success: true }
    } catch (error) {
      console.error("Error deleting product:", error)
      throw error
    }
  }

  // Registrar movimiento de stock
  static async recordStockMovement(movementData) {
    try {
      const db = await this.getDatabase()
      const movement = new StockMovement(movementData)
      await db.collection("stock_movements").insertOne(movement)
      return movement
    } catch (error) {
      console.error("Error recording stock movement:", error)
      throw error
    }
  }

  // Obtener historial de movimientos
  static async getStockMovements(productId = null, limit = 50) {
    try {
      const db = await this.getDatabase()
      const query = {}

      if (productId) {
        query.product_id = productId
      }

      const movements = await db
        .collection("stock_movements")
        .find(query)
        .sort({ created_at: -1 })
        .limit(limit)
        .toArray()

      return movements
    } catch (error) {
      console.error("Error getting stock movements:", error)
      throw error
    }
  }

  // Importar productos desde CSV (con opción de reemplazar)
  static async importProductsFromCSV(csvData, replaceExisting = false) {
    try {
      const db = await this.getDatabase()

      if (replaceExisting) {
        // Limpiar productos existentes
        await this.clearAllProducts()
      }

      const products = []

      for (const productData of csvData) {
        const validation = Product.validate(productData)
        if (validation.isValid) {
          const product = new Product(productData)
          products.push(product)
        } else {
          console.warn(`Producto inválido: ${productData.codigo} - ${validation.errors.join(", ")}`)
        }
      }

      if (products.length > 0) {
        if (replaceExisting) {
          // Insertar todos los productos nuevos
          const result = await db.collection("products").insertMany(products)
          return {
            imported: result.insertedCount,
            total: products.length,
            method: "replace",
          }
        } else {
          // Usar upsert para actualizar productos existentes o crear nuevos
          const bulkOps = products.map((product) => ({
            updateOne: {
              filter: { codigo: product.codigo },
              update: { $set: product },
              upsert: true,
            },
          }))

          const result = await db.collection("products").bulkWrite(bulkOps)
          return {
            imported: result.upsertedCount + result.modifiedCount,
            total: products.length,
            method: "upsert",
          }
        }
      }

      return { imported: 0, total: 0 }
    } catch (error) {
      console.error("Error importing products from CSV:", error)
      throw error
    }
  }
}
