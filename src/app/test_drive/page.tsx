"use client";

import React, { useState } from "react";
import GoogleDriveUploader from "@/components/GoogleDriveUploader";
import * as XLSX from "xlsx";

export default function ExampleUsage() {
    const [csvData] = useState([
        { producto: "Laptop", precio: 1200, stock: 5 },
        { producto: "Mouse", precio: 25, stock: 100 },
        { producto: "Teclado", precio: 75, stock: 50 },
    ]);

    const csvHeaders = ["producto", "precio", "stock"];

    // Crear workbook para Excel
    const createExcelWorkbook = () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
        return workbook;
    };

    const handleUploadSuccess = (result: any) => {
        console.log("Archivo subido exitosamente:", result);
        if (result.cloud) {
            console.log("Ver en Google Drive:", result.cloud.webViewLink);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-2xl font-bold">Subir Archivos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subir como CSV */}
                <GoogleDriveUploader
                    type="csv"
                    data={csvData}
                    headers={csvHeaders}
                    fileName="inventario-csv"
                    onUploadComplete={handleUploadSuccess}
                />

                {/* Subir como Excel */}
                <GoogleDriveUploader
                    type="excel"
                    workbook={createExcelWorkbook()}
                    fileName="inventario-excel"
                    onUploadComplete={handleUploadSuccess}
                />
            </div>
        </div>
    );
}
