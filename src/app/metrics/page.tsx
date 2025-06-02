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
                <ExportButton 
                    onClick={handleExportAll}
                    disabled={loading || !selectedTemporada}
                    variant="default"
                    size="default"
                    children="Exportar Excel Completo"
                />
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
        </div>
    );
}
