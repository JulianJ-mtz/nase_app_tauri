import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    Cloud,
    Upload,
    CheckCircle,
    ExternalLink,
    Loader2,
} from "lucide-react";
import {
    useGoogleDriveUpload,
    exportAndUploadCSV,
    exportAndUploadExcel,
    exportAndUploadMetricsExcel,
    exportAndUploadProductionExcel,
} from "@/lib/uploadFromDrive";

interface GoogleDriveUploaderProps {
    data?: any[];
    headers?: string[];
    fileName?: string;
    workbook?: any; // XLSX.WorkBook
    type: "csv" | "excel";
    onUploadComplete?: (result: any) => void;
}

export default function GoogleDriveUploader({
    data,
    headers,
    fileName = "export",
    workbook,
    type,
    onUploadComplete,
}: GoogleDriveUploaderProps) {
    const { isAuthenticated, isUploading, isInitializing, authenticate, uploadWithProgress } =
        useGoogleDriveUpload();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<any>(null);

    const handleAuthenticate = async () => {
        try {
            const success = await authenticate();
            if (success) {
                console.log("Conectado a Google Drive exitosamente");
            } else {
                console.error("Error al conectar con Google Drive");
            }
        } catch (error) {
            console.error("Error:", error);
            console.error("Error al conectar con Google Drive");
        }
    };

    const handleUpload = async () => {
        try {
            setUploadResult(null);
            setUploadProgress(0);

            const result = await uploadWithProgress(async () => {
                if (type === "csv" && data && headers) {
                    return await exportAndUploadCSV(data, headers, fileName);
                } else if (type === "excel" && workbook) {
                    // Detectar el tipo de archivo por el nombre
                    const isMetricsFile = fileName.includes('metricas_completas');
                    const isProductionFile = fileName.includes('registros_produccion');
                    
                    if (isMetricsFile) {
                        return await exportAndUploadMetricsExcel(workbook, fileName);
                    } else if (isProductionFile) {
                        return await exportAndUploadProductionExcel(workbook, fileName);
                    } else {
                        // Fallback para otros archivos Excel
                        return await exportAndUploadExcel(workbook, fileName);
                    }
                } else {
                    throw new Error("Datos insuficientes para la subida");
                }
            }, setUploadProgress);

            setUploadResult(result);
            console.log("Archivo subido exitosamente a Google Drive");

            if (onUploadComplete) {
                onUploadComplete(result);
            }
        } catch (error) {
            console.error("Error subiendo archivo:", error);
            console.error("Error al subir archivo a Google Drive");
        }
    };

    // Show loading state while initializing
    if (isInitializing) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center p-8">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Verificando conexión con Google Drive...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated, show authentication step
    if (!isAuthenticated) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <Cloud className="h-5 w-5 text-muted-foreground" />
                        <div>
                            <p className="text-sm font-medium">Google Drive</p>
                            <p className="text-xs text-muted-foreground">
                                Conecta para subir tu archivo
                            </p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No conectado
                    </Badge>
                </div>
                
                <Button 
                    onClick={handleAuthenticate} 
                    className="w-full"
                    variant="outline"
                >
                    <Cloud className="h-4 w-4 mr-2" />
                    Conectar con Google Drive
                </Button>
            </div>
        );
    }

    // If authenticated, show upload interface
    return (
        <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                    <Cloud className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="text-sm font-medium text-green-900">Google Drive</p>
                        <p className="text-xs text-green-700">
                            Listo para subir archivo
                        </p>
                    </div>
                </div>
                <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Conectado
                </Badge>
            </div>

            {/* Upload Progress */}
            {isUploading && (
                <div className="space-y-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">
                            Subiendo archivo...
                        </span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-blue-700 text-center">
                        {uploadProgress}% completado
                    </p>
                </div>
            )}

            {/* Upload Success */}
            {uploadResult && !isUploading && (
                <div className="space-y-3 p-4 border rounded-lg bg-green-50 border-green-200">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">
                            ¡Archivo subido exitosamente!
                        </span>
                    </div>
                    
                    {uploadResult.cloud && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">
                                {uploadResult.cloud.name}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 h-8"
                                asChild
                            >
                                <a
                                    href={uploadResult.cloud.webViewLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    Abrir
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Button */}
            <Button
                onClick={handleUpload}
                disabled={isUploading || (!data && !workbook)}
                className="w-full"
                size="lg"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Subiendo...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4 mr-2" />
                        Subir a Google Drive
                    </>
                )}
            </Button>

            {/* Info */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>• El archivo se guardará localmente y en Google Drive</p>
                <p>• El archivo será accesible desde cualquier dispositivo</p>
            </div>
        </div>
    );
}
