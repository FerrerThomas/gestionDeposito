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
