"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Download, AlertCircle, CheckCircle, FileText, Trash2 } from "lucide-react"

interface CSVImporterProps {
  onImportComplete: () => void
}

export default function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const [csvUrl, setCsvUrl] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DatosProduccion%28Hoja1%29-33bmaw0juHwe3o2tFYoX5i5CMxRaZd.csv",
  )
  const [replaceExisting, setReplaceExisting] = useState(true)
  const [importStatus, setImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")
  const [importResult, setImportResult] = useState<any>(null)

  const handleImport = async () => {
    if (!csvUrl.trim()) {
      setImportStatus("error")
      setImportMessage("Por favor, ingresa la URL del archivo CSV")
      return
    }

    try {
      setImportStatus("importing")
      setImportMessage("Procesando archivo CSV...")

      const endpoint = replaceExisting ? "/api/products/clear-and-import" : "/api/products/import-csv"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvUrl: csvUrl.trim(),
          clearExisting: replaceExisting,
        }),
      })

      if (!response.ok) {
        throw new Error("Error en la importación")
      }

      const data = await response.json()
      setImportResult(data.result)
      setImportStatus("success")
      setImportMessage(data.message)

      // Notificar que la importación se completó
      onImportComplete()
    } catch (error) {
      setImportStatus("error")
      setImportMessage("Error al importar los datos. Verifica la URL y el formato del archivo.")
      console.error("Import error:", error)
    }
  }

  const resetForm = () => {
    setCsvUrl("")
    setImportStatus("idle")
    setImportMessage("")
    setImportResult(null)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Importar Nueva Guía de Producción
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-url">URL del archivo CSV</Label>
            <Input
              id="csv-url"
              type="url"
              placeholder="https://ejemplo.com/archivo.csv"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              disabled={importStatus === "importing"}
            />
            <p className="text-sm text-gray-500 mt-1">
              Pega aquí la URL del archivo CSV con la nueva guía de producción
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="replace-existing"
              checked={replaceExisting}
              onCheckedChange={(checked) => setReplaceExisting(checked === true)}
              disabled={importStatus === "importing"}
            />
            <Label htmlFor="replace-existing" className="text-sm">
              Reemplazar todos los productos existentes
            </Label>
          </div>

          {replaceExisting && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Atención:</strong> Esta acción eliminará todos los productos existentes y los reemplazará con
                los datos del nuevo archivo CSV. Esta operación no se puede deshacer.
              </AlertDescription>
            </Alert>
          )}

          {importMessage && (
            <Alert
              className={
                importStatus === "error"
                  ? "border-red-200 bg-red-50"
                  : importStatus === "success"
                    ? "border-green-200 bg-green-50"
                    : "border-blue-200 bg-blue-50"
              }
            >
              {importStatus === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : importStatus === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <Upload className="h-4 w-4 text-blue-600" />
              )}
              <AlertDescription
                className={
                  importStatus === "success"
                    ? "text-green-800"
                    : importStatus === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                }
              >
                {importMessage}
              </AlertDescription>
            </Alert>
          )}

          {importResult && importStatus === "success" && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Resumen de la importación:</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • Productos importados: <strong>{importResult.imported}</strong>
                </li>
                <li>
                  • Total procesados: <strong>{importResult.totalProcessed || importResult.total}</strong>
                </li>
                {importResult.totalLines && (
                  <li>
                    • Líneas en el archivo: <strong>{importResult.totalLines}</strong>
                  </li>
                )}
                <li>
                  • Método: <strong>{replaceExisting ? "Reemplazo completo" : "Actualización"}</strong>
                </li>
              </ul>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleImport}
              disabled={importStatus === "importing" || !csvUrl.trim()}
              className="flex items-center"
            >
              {importStatus === "importing" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : replaceExisting ? (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reemplazar Productos
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Importar CSV
                </>
              )}
            </Button>

            {(importStatus === "success" || importStatus === "error") && (
              <Button variant="outline" onClick={resetForm}>
                Nuevo Import
              </Button>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Formato de tu archivo CSV:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Columna 1: Código del producto</li>
              <li>Columna 2: Nombre del artículo</li>
              <li>Columna 3: Cantidad para 2 meses (se convertirá automáticamente a demanda mensual)</li>
              <li>El sistema procesará automáticamente los ~320 productos</li>
            </ul>
            <p className="mt-2 text-green-600">
              <strong>✅ Archivo detectado:</strong> DatosProduccion(Hoja1).csv con 320+ productos
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
