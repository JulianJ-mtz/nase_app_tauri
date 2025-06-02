"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useMetrics } from "@/hooks/useMetrics";
import {
    ProductionByCrewChart,
    ProductionByVarietyChart,
    ProductionByGrapeTypeChart,
    ProductionByClientChart,
    ClientVarietyChart,
    ClientGrapeTypeChart,
    TrendsChart,
} from "@/components/metrics";
import { ExportButton } from "@/components/ui/export-button";
import { exportAllMetricsAsExcel } from "@/lib/csvExport";
import { Button } from "@/components/ui/button";
import { Cloud, Download } from "lucide-react";
import { useState } from "react";
import { GoogleDriveUploadModal } from "@/components/modals";
import * as XLSX from "xlsx";
import { useOnlineStatus } from "@/context/OnlineStatusContext";

export default function MetricsPage() {
    const {
        loading,
        selectedTemporada,
        temporadas,
        variedades,
        tiposUva,
        clientes,
        produccionPorCuadrilla,
        produccionPorVariedad,
        produccionPorTipoUva,
        produccionPorCliente,
        produccionClienteVariedad,
        produccionClienteTipoUva,
        tendenciaProduccion,
        tendenciaClientes,
        tendenciaVariedades,
        tendenciaTipos,
        handleTemporadaChange,
    } = useMetrics();
    const isOnline = useOnlineStatus(); 
    const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

    const handleExportAll = async () => {
        await exportAllMetricsAsExcel({
            produccionPorCuadrilla,
            produccionPorVariedad,
            produccionPorTipoUva,
            produccionPorCliente,
            produccionClienteVariedad,
            produccionClienteTipoUva,
            tendenciaProduccion,
            tendenciaClientes,
            tendenciaVariedades,
            tendenciaTipos,
            clientes,
            variedades,
            tiposUva,
            temporadaSeleccionada: selectedTemporada,
        });
    };

    // Función para crear el workbook de métricas
    const createMetricsWorkbook = () => {
        if (!selectedTemporada) return null;

        console.log('Creando workbook de métricas...');
        
        // Crear un nuevo workbook
        const workbook = XLSX.utils.book_new();
        
        // 1. Hoja: Producción por Cuadrilla
        const cuadrillaData = produccionPorCuadrilla.map(item => ({
            'Cuadrilla': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const cuadrillaWS = XLSX.utils.json_to_sheet(cuadrillaData);
        XLSX.utils.book_append_sheet(workbook, cuadrillaWS, 'Producción por Cuadrilla');
        
        // 2. Hoja: Producción por Variedad
        const variedadData = produccionPorVariedad.map(item => ({
            'Variedad': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const variedadWS = XLSX.utils.json_to_sheet(variedadData);
        XLSX.utils.book_append_sheet(workbook, variedadWS, 'Producción por Variedad');
        
        // 3. Hoja: Producción por Tipo de Uva
        const tipoUvaData = produccionPorTipoUva.map(item => ({
            'Tipo_Uva': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const tipoUvaWS = XLSX.utils.json_to_sheet(tipoUvaData);
        XLSX.utils.book_append_sheet(workbook, tipoUvaWS, 'Producción por Tipo Uva');
        
        // 4. Hoja: Producción por Cliente
        const clienteData = produccionPorCliente.map(item => ({
            'Cliente': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const clienteWS = XLSX.utils.json_to_sheet(clienteData);
        XLSX.utils.book_append_sheet(workbook, clienteWS, 'Producción por Cliente');
        
        // 5. Hoja: Cliente × Variedad
        const clienteVariedadData: any[] = [];
        produccionClienteVariedad.forEach(clienteData => {
            clienteData.variedades.forEach((variedad: any) => {
                clienteVariedadData.push({
                    'Cliente': clienteData.cliente,
                    'Variedad': variedad.variedad,
                    'Produccion_Cajas': variedad.cantidad,
                    'Total_Cliente_Cajas': clienteData.total
                });
            });
        });
        const clienteVariedadWS = XLSX.utils.json_to_sheet(clienteVariedadData);
        XLSX.utils.book_append_sheet(workbook, clienteVariedadWS, 'Cliente × Variedad');
        
        // 6. Hoja: Cliente × Tipo de Uva
        const clienteTipoData: any[] = [];
        produccionClienteTipoUva.forEach(clienteData => {
            clienteData.tipos.forEach((tipo: any) => {
                clienteTipoData.push({
                    'Cliente': clienteData.cliente,
                    'Tipo_Uva': tipo.tipo,
                    'Produccion_Cajas': tipo.cantidad,
                    'Total_Cliente_Cajas': clienteData.total
                });
            });
        });
        const clienteTipoWS = XLSX.utils.json_to_sheet(clienteTipoData);
        XLSX.utils.book_append_sheet(workbook, clienteTipoWS, 'Cliente × Tipo Uva');
        
        // 7. Hoja: Tendencia Producción Total
        const tendenciaData = tendenciaProduccion.map(item => ({
            'Fecha': item.fecha,
            'Produccion_Cajas': item.produccion
        }));
        const tendenciaWS = XLSX.utils.json_to_sheet(tendenciaData);
        XLSX.utils.book_append_sheet(workbook, tendenciaWS, 'Tendencia Producción');
        
        // 8. Hoja: Tendencia por Clientes
        const tendenciaClientesWS = XLSX.utils.json_to_sheet(tendenciaClientes);
        XLSX.utils.book_append_sheet(workbook, tendenciaClientesWS, 'Tendencia Clientes');
        
        // 9. Hoja: Tendencia por Variedades
        const tendenciaVariedadesWS = XLSX.utils.json_to_sheet(tendenciaVariedades);
        XLSX.utils.book_append_sheet(workbook, tendenciaVariedadesWS, 'Tendencia Variedades');
        
        // 10. Hoja: Tendencia por Tipos
        const tendenciaTiposWS = XLSX.utils.json_to_sheet(tendenciaTipos);
        XLSX.utils.book_append_sheet(workbook, tendenciaTiposWS, 'Tendencia Tipos');

        return workbook;
    };

    if (loading) {
        return (
            <div className="container mx-auto py-10">
                <div className="flex justify-center items-center h-64">
                    <p>Cargando métricas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Métricas de Producción</h1>
                <div className="flex gap-3">
                    <ExportButton 
                        onClick={handleExportAll}
                        disabled={loading || !selectedTemporada}
                        variant="outline"
                        size="default"
                    >
                        Exportar Local
                    </ExportButton>
                    <Button
                        onClick={() => setIsGoogleDriveModalOpen(true)}
                        disabled={loading || !selectedTemporada || !isOnline}
                        variant="default"
                        size="default"
                    >
                        <Cloud className="h-4 w-4 mr-2" />
                        Subir a Drive
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-4">
                    <Label htmlFor="temporada">Temporada:</Label>
                    <Select
                        value={selectedTemporada}
                        onValueChange={handleTemporadaChange}
                    >
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Selecciona una temporada" />
                        </SelectTrigger>
                        <SelectContent>
                            {temporadas.map((temporada) => (
                                <SelectItem
                                    key={temporada.id}
                                    value={temporada.id.toString()}
                                >
                                    {`Temporada ${temporada.id} (${new Date(
                                        temporada.fecha_inicial
                                    ).toLocaleDateString()} - ${
                                        temporada.fecha_final
                                            ? new Date(
                                                  temporada.fecha_final
                                              ).toLocaleDateString()
                                            : "Actual"
                                    })`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs defaultValue="cuadrillas">
                <TabsList className="mb-6">
                    <TabsTrigger value="cuadrillas">Por Cuadrilla</TabsTrigger>
                    <TabsTrigger value="variedades">Por Variedad</TabsTrigger>
                    <TabsTrigger value="tipos">Por Tipo de Uva</TabsTrigger>
                    <TabsTrigger value="clientes">Por Cliente</TabsTrigger>
                    <TabsTrigger value="cliente-variedad">
                        Cliente × Variedad
                    </TabsTrigger>
                    <TabsTrigger value="cliente-tipo">
                        Cliente × Tipo
                    </TabsTrigger>
                    <TabsTrigger value="tendencias">
                        Tendencias Temporales
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="cuadrillas">
                    <ProductionByCrewChart data={produccionPorCuadrilla} />
                </TabsContent>

                <TabsContent value="variedades">
                    <ProductionByVarietyChart data={produccionPorVariedad} />
                </TabsContent>

                <TabsContent value="tipos">
                    <ProductionByGrapeTypeChart data={produccionPorTipoUva} />
                </TabsContent>

                <TabsContent value="clientes">
                    <ProductionByClientChart data={produccionPorCliente} />
                </TabsContent>

                <TabsContent value="cliente-variedad">
                    <ClientVarietyChart data={produccionClienteVariedad} />
                </TabsContent>

                <TabsContent value="cliente-tipo">
                    <ClientGrapeTypeChart data={produccionClienteTipoUva} />
                </TabsContent>

                <TabsContent value="tendencias">
                    <TrendsChart
                        tendenciaProduccion={tendenciaProduccion}
                        tendenciaClientes={tendenciaClientes}
                        tendenciaVariedades={tendenciaVariedades}
                        tendenciaTipos={tendenciaTipos}
                        clientes={clientes}
                        variedades={variedades}
                        tiposUva={tiposUva}
                    />
                </TabsContent>
            </Tabs>

            {/* Google Drive Upload Modal */}
            <GoogleDriveUploadModal
                open={isGoogleDriveModalOpen}
                onOpenChange={setIsGoogleDriveModalOpen}
                workbook={createMetricsWorkbook()}
                fileName={`metricas_completas_temporada_${selectedTemporada}_${
                    new Date().toISOString().split("T")[0]
                }`}
                onUploadComplete={(result) => {
                    console.log("Métricas subidas a Google Drive:", result);
                }}
            />
        </div>
    );
}
