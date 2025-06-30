"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Upload, AlertCircle, CheckCircle, TrendingUp, TrendingDown, ArrowRight, FileUp } from "lucide-react"

interface StockUpdaterProps {
  onUpdateComplete: () => void
}

export default function StockUpdater({ onUpdateComplete }: StockUpdaterProps) {
  const [csvUrl, setCsvUrl] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/StockActual%201%28Sheet%29-vHmUmZMUnVHRd110sjUibnqR15VHOb.csv",
  )
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [updateMethod, setUpdateMethod] = useState<"url" | "file">("url")
  const [updateStatus, setUpdateStatus] = useState<"idle" | "updating" | "success" | "error">("idle")
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateResult, setUpdateResult] = useState<any>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    } else {
      alert("Por favor selecciona un archivo CSV válido")
    }
  }

  const handleStockUpdate = async () => {
    if (updateMethod === "url" && !csvUrl.trim()) {
      setUpdateStatus("error")
      setUpdateMessage("Por favor, ingresa la URL del archivo de stock")
      return
    }

    if (updateMethod === "file" && !csvFile) {
      setUpdateStatus("error")
      setUpdateMessage("Por favor, selecciona un archivo CSV")
      return
    }

    try {
      setUpdateStatus("updating")
      setUpdateMessage("Actualizando stock de productos...")

      let csvData = ""

      if (updateMethod === "url") {
        // Método por URL (actual)
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
      } else {
        // Método por archivo local
        csvData = await csvFile!.text()

        const response = await fetch("/api/products/update-stock-file", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            csvData: csvData,
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
      }

      // Esperar un poco antes de refrescar para que la BD se actualice
      setTimeout(async () => {
        await onUpdateComplete()
      }, 1000)
    } catch (error) {
      setUpdateStatus("error")
      setUpdateMessage(
        error instanceof Error ? error.message : "Error al actualizar el stock. Verifica el archivo y el formato.",
      )
      console.error("Stock update error:", error)
    }
  }

  const resetForm = () => {
    setUpdateStatus("idle")
    setUpdateMessage("")
    setUpdateResult(null)
    setCsvFile(null)
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
          {/* Tabs para elegir método */}
          <Tabs value={updateMethod} onValueChange={(value) => setUpdateMethod(value as "url" | "file")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">Desde URL</TabsTrigger>
              <TabsTrigger value="file">Subir Archivo</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label htmlFor="stock-file">Seleccionar archivo CSV</Label>
                <Input
                  id="stock-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={updateStatus === "updating"}
                  className="cursor-pointer"
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Archivo seleccionado: {csvFile.name} ({Math.round(csvFile.size / 1024)} KB)
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Selecciona tu archivo CSV local con los datos de stock actualizados
                </p>
              </div>
            </TabsContent>
          </Tabs>

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
              disabled={
                updateStatus === "updating" ||
                (updateMethod === "url" && !csvUrl.trim()) ||
                (updateMethod === "file" && !csvFile)
              }
              className="flex items-center"
            >
              {updateStatus === "updating" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  {updateMethod === "file" ? (
                    <FileUp className="h-4 w-4 mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
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

          {/* Información sobre el formato */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📋 Formato requerido del CSV:</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="bg-white p-3 rounded border font-mono text-xs">
                <div className="text-gray-600 mb-1">Ejemplo de archivo CSV:</div>
                <div>CODIGO,DESCRIPCION,PRECIO,COSTO,GANANCIA,MARGEN,STOCK</div>
                <div>218,Mix de Semillas 250gr,850,400,450,52.94,28</div>
                <div>116,Almendras Peladas 500gr,1200,600,600,50.00,45</div>
                <div>500,Nueces Mariposa 1kg,2500,1200,1300,52.00,12</div>
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Separador:</strong> Coma (,) o punto y coma (;) - se detecta automáticamente
                </li>
                <li>
                  <strong>Columna CODIGO:</strong> Código del producto (se normalizan automáticamente los ceros
                  iniciales)
                </li>
                <li>
                  <strong>Columna STOCK:</strong> Nueva cantidad de stock (debe ser numérica)
                </li>
                <li>
                  <strong>Encabezados:</strong> Primera fila debe contener los nombres de las columnas
                </li>
                <li>
                  <strong>Codificación:</strong> UTF-8 preferible
                </li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                <p className="text-yellow-800 text-xs">
                  <strong>💡 Tip:</strong> El sistema busca automáticamente las columnas "CODIGO" y "STOCK" sin importar
                  su posición en el archivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
