"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload, Database, CheckCircle, AlertCircle } from "lucide-react"

interface DatabaseImportProps {
  onImport: () => Promise<void>
  isLoading: boolean
}

export default function DatabaseImport({ onImport, isLoading }: DatabaseImportProps) {
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importMessage, setImportMessage] = useState("")

  const handleImport = async () => {
    try {
      setImportStatus("idle")
      setImportMessage("Importando datos del CSV...")

      await onImport()

      setImportStatus("success")
      setImportMessage("¡Datos importados exitosamente!")
    } catch (error) {
      setImportStatus("error")
      setImportMessage("Error al importar los datos. Por favor, intenta nuevamente.")
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Importación de Datos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Importa todos los productos desde el archivo CSV a la base de datos para tener persistencia completa.
          </p>

          {importMessage && (
            <Alert className={importStatus === "error" ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
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

          <div className="flex space-x-2">
            <Button onClick={handleImport} disabled={isLoading} className="flex items-center">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Importar desde CSV
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>
              <strong>Nota:</strong> Esta acción:
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Importará todos los productos del CSV</li>
              <li>Actualizará productos existentes si ya están en la base de datos</li>
              <li>Configurará el stock mínimo basado en la demanda mensual</li>
              <li>Generará alertas automáticas para productos con stock bajo</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
