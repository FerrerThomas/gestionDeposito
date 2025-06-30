-- Crear tabla de sectores
CREATE TABLE IF NOT EXISTS sectors (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7) NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sector_id VARCHAR(10) REFERENCES sectors(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  format VARCHAR(50),
  type VARCHAR(100),
  min_stock INTEGER NOT NULL DEFAULT 0,
  monthly_demand INTEGER NOT NULL DEFAULT 0,
  total_demand INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de movimientos de stock (historial)
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entrada', 'salida', 'ajuste', 'transferencia')),
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason VARCHAR(255),
  user_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de alertas de stock
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('stock_bajo', 'stock_critico', 'sin_stock')),
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Insertar sectores iniciales
INSERT INTO sectors (id, name, color, x, y, width, height) VALUES
  ('D', 'D', '#eab308', 20, 20, 180, 80),
  ('C', 'C', '#22c55e', 220, 20, 180, 80),
  ('B', 'B', '#3b82f6', 420, 20, 160, 80),
  ('A', 'A', '#ef4444', 600, 20, 120, 320),
  ('E', 'E', '#a855f7', 220, 220, 280, 120)
ON CONFLICT (id) DO NOTHING;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_products_sector ON products(sector_id);
CREATE INDEX IF NOT EXISTS idx_products_codigo ON products(codigo);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(quantity, min_stock);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product ON stock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_unresolved ON stock_alerts(is_resolved) WHERE is_resolved = FALSE;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear función para generar alertas automáticas
CREATE OR REPLACE FUNCTION check_stock_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Eliminar alertas resueltas para este producto
    UPDATE stock_alerts 
    SET is_resolved = TRUE, resolved_at = NOW()
    WHERE product_id = NEW.id AND is_resolved = FALSE;
    
    -- Crear nueva alerta si es necesario
    IF NEW.quantity = 0 THEN
        INSERT INTO stock_alerts (product_id, alert_type, message)
        VALUES (NEW.id, 'sin_stock', 'Producto sin stock: ' || NEW.name);
    ELSIF NEW.quantity < (NEW.min_stock * 0.5) THEN
        INSERT INTO stock_alerts (product_id, alert_type, message)
        VALUES (NEW.id, 'stock_critico', 'Stock crítico para: ' || NEW.name || ' (Stock: ' || NEW.quantity || ', Mínimo: ' || NEW.min_stock || ')');
    ELSIF NEW.quantity < NEW.min_stock THEN
        INSERT INTO stock_alerts (product_id, alert_type, message)
        VALUES (NEW.id, 'stock_bajo', 'Stock bajo para: ' || NEW.name || ' (Stock: ' || NEW.quantity || ', Mínimo: ' || NEW.min_stock || ')');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para alertas automáticas
CREATE TRIGGER trigger_stock_alerts AFTER INSERT OR UPDATE OF quantity, min_stock ON products
    FOR EACH ROW EXECUTE FUNCTION check_stock_alerts();
