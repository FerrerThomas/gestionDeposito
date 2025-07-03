"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package2, RefreshCw } from "lucide-react"
import CSVImporter from "./CSVImporter"
import StockUpdater from "./StockUpdater"

interface StockManagementProps {
  onDataRefresh: () => Promise<void>
}

export default function StockManagement({ onDataRefresh }: StockManagementProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package2 className="h-5 w-5 mr-2" />
            Gestión de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs para diferentes tipos de gestión de stock */}
          <Tabs defaultValue="import" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import" className="flex items-center">
                <Package2 className="h-4 w-4 mr-2" />
                Importar Productos Nuevos
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Stock Semanal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="import" className="space-y-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">Importación de Nueva Guía de Producción</h3>
                <p className="text-sm text-blue-800">
                  Reemplaza todos los productos existentes con una nueva guía de producción completa (~320 productos).
                </p>
              </div>
              <CSVImporter onImportComplete={onDataRefresh} />
            </TabsContent>

            <TabsContent value="stock" className="space-y-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900 mb-2">Actualización Semanal de Stock</h3>
                <p className="text-sm text-green-800">
                  Actualiza únicamente las cantidades de stock de los productos existentes sin modificar otros datos.
                </p>
              </div>
              <StockUpdater onUpdateComplete={onDataRefresh} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
