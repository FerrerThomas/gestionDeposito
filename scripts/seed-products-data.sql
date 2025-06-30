-- Insertar productos de ejemplo basados en el CSV
-- Nota: Estos son productos de ejemplo, se reemplazarán con los datos reales del CSV

INSERT INTO products (codigo, name, sector_id, quantity, format, type, min_stock, monthly_demand, total_demand) VALUES
  ('CHIA100', 'Chia Semilla de 100gr', 'A', 45, '100gr', 'semillas', 91, 91, 1092),
  ('ALM500', 'Almendras 500gr', 'B', 120, '500gr', 'frutos-secos', 65, 65, 780),
  ('NUEZ1K', 'Nueces 1kg', 'C', 30, '1kg', 'frutos-secos', 45, 45, 540),
  ('PASA250', 'Pasas 250gr', 'D', 80, '250gr', 'frutas-secas', 35, 35, 420),
  ('GIRA1K', 'Semillas de Girasol 1kg', 'E', 25, '1kg', 'semillas', 40, 40, 480),
  ('AVEL500', 'Avellanas 500gr', 'A', 15, '500gr', 'frutos-secos', 30, 30, 360),
  ('PIST250', 'Pistachos 250gr', 'B', 18, '250gr', 'frutos-secos', 25, 25, 300),
  ('SESAM500', 'Semillas de Sésamo 500gr', 'C', 35, '500gr', 'semillas', 20, 20, 240),
  ('ARAND200', 'Arándanos Secos 200gr', 'D', 12, '200gr', 'frutas-secas', 28, 28, 336),
  ('ANAC1K', 'Anacardos 1kg', 'E', 28, '1kg', 'frutos-secos', 22, 22, 264)
ON CONFLICT (codigo) DO UPDATE SET
  name = EXCLUDED.name,
  sector_id = EXCLUDED.sector_id,
  quantity = EXCLUDED.quantity,
  format = EXCLUDED.format,
  type = EXCLUDED.type,
  min_stock = EXCLUDED.min_stock,
  monthly_demand = EXCLUDED.monthly_demand,
  total_demand = EXCLUDED.total_demand;
