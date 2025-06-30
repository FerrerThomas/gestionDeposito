// Modelo de Producto para MongoDB
export class Product {
  constructor(data) {
    this.codigo = data.codigo
    this.name = data.name
    this.sector_id = data.sector_id
    this.quantity = data.quantity || 0
    this.format = data.format
    this.type = data.type
    this.min_stock = data.min_stock || 0
    this.monthly_demand = data.monthly_demand || 0
    this.total_demand = data.total_demand || 0
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }

  static validate(data) {
    const errors = []

    if (!data.codigo) errors.push("Código es requerido")
    if (!data.name) errors.push("Nombre es requerido")
    if (!data.sector_id) errors.push("Sector es requerido")
    if (data.quantity < 0) errors.push("Cantidad no puede ser negativa")
    if (data.min_stock < 0) errors.push("Stock mínimo no puede ser negativo")

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export class Sector {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.color = data.color
    this.x = data.x
    this.y = data.y
    this.width = data.width
    this.height = data.height
    this.created_at = data.created_at || new Date()
    this.updated_at = data.updated_at || new Date()
  }
}

export class StockMovement {
  constructor(data) {
    this.product_id = data.product_id
    this.movement_type = data.movement_type // 'entrada', 'salida', 'ajuste', 'transferencia'
    this.quantity = data.quantity
    this.previous_quantity = data.previous_quantity
    this.new_quantity = data.new_quantity
    this.reason = data.reason
    this.user_name = data.user_name
    this.created_at = data.created_at || new Date()
  }
}
