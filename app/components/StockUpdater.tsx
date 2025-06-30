"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RefreshCw, Upload, AlertCircle, CheckCircle, TrendingUp, TrendingDown, ArrowRight } from "lucide-react"

interface StockUpdaterProps {
  onUpdateComplete: () => void
}

export default function StockUpdater({ onUpdateComplete }: StockUpdaterProps) {
  const [csvUrl, setCsvUrl] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StockActual%201%28Sheet%29-vHmUmZMUnVHRd110sjUibnqR15VHOb.csv",
  )
  const [updateStatus, setUpdateStatus] = useState<"idle" | "updating" | "success" | "error">("idle")
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateResult, setUpdateResult] = useState<any>(null)

  const handleStockUpdate = async () => {
    if (!csvUrl.trim()) {
      setUpdateStatus("error")
      setUpdateMessage("Por favor, ingresa la URL del archivo de stock")
      return
    }

    try {
      setUpdateStatus("updating")
      setUpdateMessage("Actualizando stock de productos...")

      const response = await fetch("/api/products/update-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvUrl: csvUrl.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error en la actualización")
      }

      const data = await response.json()
      setUpdateResult(data.result)
      setUpdateStatus("success")
      setUpdateMessage(data.message)

      // Esperar un poco antes de refrescar para que la BD se actualice
      setTimeout(async () => {
        await onUpdateComplete()
      }, 1000)
    } catch (error) {
      setUpdateStatus("error")
      setUpdateMessage(
        error instanceof Error
          ? error.message
          : "Error al actualizar el stock. Verifica la URL y el formato del archivo.",
      )
      console.error("Stock update error:", error)
    }
  }

  const resetForm = () => {
    setUpdateStatus("idle")
    setUpdateMessage("")
    setUpdateResult(null)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <RefreshCw className="h-5 w-5 mr-2" />
          Actualización Semanal de Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="stock-url">URL del archivo de stock actual</Label>
            <Input
              id="stock-url"
              type="url"
              placeholder="https://ejemplo.com/stock-actual.csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              disabled={updateStatus === "updating"}
            />
            <p className="text-sm text-gray-500 mt-1">
              Archivo CSV con códigos de productos y stock actual para actualización semanal
            </p>
          </div>

          {updateMessage && (
            <Alert
              className={
                updateStatus === "error"
                  ? "border-red-200 bg-red-50"
                  : updateStatus === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"
              }
            >
              {updateStatus === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : updateStatus === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <Upload className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription
                className={
                  updateStatus === "success"
                    ? "text-green-800"
                    : updateStatus === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                }
              >
                {updateMessage}
              </AlertDescription>
            </Alert>
          )}

          {updateResult && updateStatus === "success" && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Resumen de la actualización:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-100 p-3 rounded">
                    <p className="font-medium text-blue-800">Procesados</p>
                    <p className="text-2xl font-bold text-blue-600">{updateResult.processed || 0}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <p className="font-medium text-green-800">Actualizados</p>
                    <p className="text-2xl font-bold text-green-600">{updateResult.updated || 0}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded">
                    <p className="font-medium text-orange-800">No encontrados</p>
                    <p className="text-2xl font-bold text-orange-600">{updateResult.notFound || 0}</p>
                  </div>
                </div>
              </div>

              {updateResult.updates && updateResult.updates.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    Últimas actualizaciones ({updateResult.totalUpdates || updateResult.updates.length}):
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {updateResult.updates.map((update: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-gray-500 text-xs">{update.codigoOriginal}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-xs">{update.codigoEncontrado}</span>
                          </div>
                          <span className="text-gray-600 text-xs">{update.descripcion}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">{update.stockAnterior}</span>
                          <span>→</span>
                          <span className="font-medium">{update.stockNuevo}</span>
                          {update.diferencia !== 0 && (
                            <span
                              className={`flex items-center ${
                                update.diferencia > 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {update.diferencia > 0 ? (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              )}
                              {Math.abs(update.diferencia)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {updateResult.totalUpdates > updateResult.updates.length && (
                    <p className="text-center text-gray-500 mt-2 text-sm">
                      Y {updateResult.totalUpdates - updateResult.updates.length} actualizaciones más...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleStockUpdate}
              disabled={updateStatus === "updating" || !csvUrl.trim()}
              className="flex items-center"
            >
              {updateStatus === "updating" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar Stock
                </>
              )}
            </Button>

            {(updateStatus === "success" || updateStatus === "error") && (
              <Button variant="outline" onClick={resetForm}>
                Nueva Actualización
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Formato del archivo de stock:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Columna CÓDIGO: Código del producto (se normalizarán automáticamente los ceros iniciales)</li>
              <li>Columna STOCK: Nuevo valor de stock</li>
              <li>Solo se actualizará el stock, el resto de datos permanecen igual</li>
              <li>Los productos no encontrados se reportarán pero no causarán errores</li>
            </ul>
            <p className="mt-2 text-blue-600">
              <strong>🔧 Normalización automática:</strong> "000215" → "215", "000116" → "116"
            </p>
            <p className="text-green-600">
              <strong>📋 Archivo detectado:</strong> StockActual con códigos y cantidades actuales
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
