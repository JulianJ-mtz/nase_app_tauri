"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Cloud, Upload } from "lucide-react";
import GoogleDriveUploader from "@/components/GoogleDriveUploader";
import * as XLSX from "xlsx";

interface GoogleDriveUploadModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workbook: XLSX.WorkBook | null;
    fileName: string;
    onUploadComplete?: (result: any) => void;
}

export function GoogleDriveUploadModal({
    open,
    onOpenChange,
    workbook,
    fileName,
    onUploadComplete,
}: GoogleDriveUploadModalProps) {
    const [uploadComplete, setUploadComplete] = useState(false);

    const handleUploadComplete = (result: any) => {
        setUploadComplete(true);
        if (onUploadComplete) {
            onUploadComplete(result);
        }
        
        // Close modal after a short delay to show success
        setTimeout(() => {
            onOpenChange(false);
            setUploadComplete(false);
        }, 3000);
    };

    const handleClose = () => {
        onOpenChange(false);
        setUploadComplete(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-blue-500" />
                        Subir a Google Drive
                    </DialogTitle>
                    <DialogDescription>
                        Conecta con Google Drive y sube tu archivo a la nube.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                    {!workbook ? (
                        <div className="text-center py-8">
                            <div className="text-sm text-muted-foreground">
                                No hay datos para exportar
                            </div>
                        </div>
                    ) : (
                        <GoogleDriveUploader
                            workbook={workbook}
                            fileName={fileName}
                            type="excel"
                            onUploadComplete={handleUploadComplete}
                        />
                    )}
                    
                    {!uploadComplete && (
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" onClick={handleClose}>
                                Cancelar
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 