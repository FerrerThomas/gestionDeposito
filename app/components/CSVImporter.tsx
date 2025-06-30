"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Download, AlertCircle, CheckCircle, FileText, Trash2, FileUp } from "lucide-react"

interface CSVImporterProps {
  onImportComplete: () => void
}

export default function CSVImporter({ onImportComplete }: CSVImporterProps) {
  const [csvUrl, setCsvUrl] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DatosProduccion%28Hoja1%29-33bmaw0juHwe3o2tFYoX5i5CMxRaZd.csv",
  )
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [importMethod, setImportMethod] = useState<"url" | "file">("url")
  const [replaceExisting, setReplaceExisting] = useState(true)
  const [importStatus, setImportStatus] = useState<"idle" | "importing" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")
  const [importResult, setImportResult] = useState<any>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    } else {
      alert("Por favor selecciona un archivo CSV válido")
    }
  }

  const handleImport = async () => {
    if (importMethod === "url" && !csvUrl.trim()) {
      setImportStatus("error")
      setImportMessage("Por favor, ingresa la URL del archivo CSV")
      return
    }

    if (importMethod === "file" && !csvFile) {
      setImportStatus("error")
      setImportMessage("Por favor, selecciona un archivo CSV")
      return
    }

    try {
      setImportStatus("importing")
      setImportMessage("Procesando archivo CSV...")

      let response

      if (importMethod === "url") {
        // Método por URL (actual)
        const endpoint = replaceExisting ? "/api/products/clear-and-import" : "/api/products/import-csv"

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            csvUrl: csvUrl.trim(),
            clearExisting: replaceExisting,
          }),
        })
      } else {
        // Método por archivo local
        const csvData = await csvFile!.text()

        const endpoint = replaceExisting ? "/api/products/clear-and-import-file" : "/api/products/import-csv-file"

        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            csvData: csvData,
            clearExisting: replaceExisting,
          }),
        })
      }

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
      setImportMessage("Error al importar los datos. Verifica el archivo y el formato.")
      console.error("Import error:", error)
    }
  }

  const resetForm = () => {
    setCsvUrl("")
    setImportStatus("idle")
    setImportMessage("")
    setImportResult(null)
    setCsvFile(null)
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
          {/* Tabs para elegir método */}
          <Tabs value={importMethod} onValueChange={(value) => setImportMethod(value as "url" | "file")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url">Desde URL</TabsTrigger>
              <TabsTrigger value="file">Subir Archivo</TabsTrigger>
            </TabsList>

            <TabsContent value="url" className="space-y-4">
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
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div>
                <Label htmlFor="csv-file">Seleccionar archivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={importStatus === "importing"}
                  className="cursor-pointer"
                />
                {csvFile && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Archivo seleccionado: {csvFile.name} ({Math.round(csvFile.size / 1024)} KB)
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">Selecciona tu archivo CSV local con los datos de productos</p>
              </div>
            </TabsContent>
          </Tabs>

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
              disabled={
                importStatus === "importing" ||
                (importMethod === "url" && !csvUrl.trim()) ||
                (importMethod === "file" && !csvFile)
              }
              className="flex items-center"
            >
              {importStatus === "importing" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : replaceExisting ? (
                <>
                  {importMethod === "file" ? <FileUp className="h-4 w-4 mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Reemplazar Productos
                </>
              ) : (
                <>
                  {importMethod === "file" ? (
                    <FileUp className="h-4 w-4 mr-2" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
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

          {/* Información sobre el formato */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">📋 Formato requerido del CSV:</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="bg-white p-3 rounded border font-mono text-xs">
                <div className="text-gray-600 mb-1">Ejemplo de archivo CSV:</div>
                <div>CODIGO,ARTICULO,DEMANDA_MENSUAL</div>
                <div>218,Mix de Semillas 250gr,45</div>
                <div>116,Almendras Peladas 500gr,32</div>
                <div>500,Nueces Mariposa 1kg,28</div>
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Separador:</strong> Coma (,) o punto y coma (;) - se detecta automáticamente
                </li>
                <li>
                  <strong>CODIGO:</strong> Código único del producto
                </li>
                <li>
                  <strong>ARTICULO/NOMBRE:</strong> Nombre descriptivo del producto
                </li>
                <li>
                  <strong>DEMANDA_MENSUAL/STOCK_MINIMO:</strong> Cantidad mínima requerida
                </li>
                <li>
                  <strong>Opcionales:</strong> FORMATO, TIPO, SECTOR (se asignan automáticamente si no están)
                </li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 rounded border border-yellow-300">
                <p className="text-yellow-800 text-xs">
                  <strong>💡 Tip:</strong> El sistema detecta automáticamente las columnas y asigna sectores, formatos y
                  tipos basándose en el nombre del producto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
