"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, Package, Trash, Cloud } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { ProductionStatistics } from "./ProductionStatistics";
import { ProductionForm } from "../../components/forms/ProductionForm";
import { ProductionFilters } from "./ProductionFilters";
import { ColumnDef } from "@tanstack/react-table";
import { formatCreatedAt } from "@/lib/utils";
import { toast } from "sonner";
import { ExportButton } from "@/components/ui/export-button";
import { exportProductionRecords } from "@/lib/csvExport";
import { GoogleDriveUploadModal } from "@/components/modals";
import * as XLSX from "xlsx";

// Stores
import { useTemporadaStore } from "@/lib/storeTemporada";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useProduccionStore } from "@/lib/storeProduccion";
import { useJornaleroStore } from "@/lib/storeJornalero";

// APIs
import { obtenerVariedades, Variedad } from "@/api/variedad_api";
import { obtenerClientes, Cliente } from "@/api/cliente_api";
import { obtenerTiposUva, TipoUva } from "@/api/tipo_uva_api";
import { obtenerTiposEmpaque, TipoEmpaque } from "@/api/tipo_empaque_api";

// Hooks
import { useDriveUpload } from "@/hooks/useDriveUpload";

// Context
import { useOnlineStatus } from "@/context/OnlineStatusContext";

interface ProductionTabProps {
    onNewTemporada: () => void;
    onSuccess?: () => void;
}

export function ProductionContent({
    onNewTemporada,
    onSuccess,
}: ProductionTabProps) {
    const isOnline = useOnlineStatus(); // Stores
    const { temporadas, fetchTemporadas } = useTemporadaStore();
    const { cuadrillas, fetchCuadrillas } = useCuadrillaStore();
    const {
        producciones,
        loading: produccionLoading,
        fetchProducciones,
        deleteProduccion,
    } = useProduccionStore();
    const { jornaleros, fetchJornaleros } = useJornaleroStore();

    // Ref to store fetchProducciones function to avoid dependency issues
    const fetchProduccionesRef = useRef(fetchProducciones);
    fetchProduccionesRef.current = fetchProducciones;

    // Estados para datos de catálogo
    const [variedades, setVariedades] = useState<Variedad[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [tiposUva, setTiposUva] = useState<TipoUva[]>([]);
    const [tiposEmpaque, setTiposEmpaque] = useState<TipoEmpaque[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(true);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTemporadaFilter, setSelectedTemporadaFilter] =
        useState<string>("all");
    const [selectedClienteFilter, setSelectedClienteFilter] =
        useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);

    // Cargar datos de catálogo
    const loadCatalogData = useCallback(async () => {
        try {
            setCatalogLoading(true);
            const [varData, clienteData, tiposUvaData, tiposEmpaqueData] =
                await Promise.all([
                    obtenerVariedades(),
                    obtenerClientes(),
                    obtenerTiposUva(),
                    obtenerTiposEmpaque(),
                ]);

            setVariedades(varData);
            setClientes(clienteData);
            setTiposUva(tiposUvaData);
            setTiposEmpaque(tiposEmpaqueData);
        } catch (error) {
            console.error("Error cargando datos de catálogo:", error);
            toast.error("No se pudieron cargar los datos de catálogo");
        } finally {
            setCatalogLoading(false);
        }
    }, []);

    // Cargar datos iniciales
    useEffect(() => {
        fetchTemporadas();
        fetchCuadrillas();
        fetchJornaleros();
        fetchProducciones();
        loadCatalogData();
    }, [
        fetchTemporadas,
        fetchCuadrillas,
        fetchJornaleros,
        fetchProducciones,
        loadCatalogData,
    ]);

    // Helper functions
    const getCuadrillaNombre = useCallback(
        (id: number) => {
            const cuadrilla = cuadrillas.find((c) => c.id === id);
            if (!cuadrilla) return "Desconocida";
            const lider = jornaleros.find(
                (j) => j.id === cuadrilla.lider_cuadrilla_id
            );
            return lider
                ? `${cuadrilla.lote} (${lider.nombre})`
                : cuadrilla.lote;
        },
        [cuadrillas, jornaleros]
    );

    const getVariedadNombre = useCallback(
        (cuadrillaId: number) => {
            const cuadrilla = cuadrillas.find((c) => c.id === cuadrillaId);
            if (!cuadrilla || !cuadrilla.variedad_id) return "No asignada";
            const variedad = variedades.find(
                (v) => v.id === cuadrilla.variedad_id
            );
            return variedad ? variedad.nombre : "Desconocida";
        },
        [cuadrillas, variedades]
    );

    const getClienteNombre = useCallback(
        (id: number) => {
            const cliente = clientes.find((c) => c.id === id);
            return cliente ? cliente.nombre : "Desconocido";
        },
        [clientes]
    );

    const getTipoUvaNombre = useCallback(
        (id: number | null) => {
            if (!id) return "No asignado";
            const tipoUva = tiposUva.find((t) => t.id === id);
            return tipoUva ? tipoUva.nombre : "Desconocido";
        },
        [tiposUva]
    );

    const getTipoEmpaqueNombre = useCallback(
        (id: number | null) => {
            if (!id) return "No asignado";
            const tipoEmpaque = tiposEmpaque.find((t) => t.id === id);
            return tipoEmpaque ? tipoEmpaque.nombre : "Desconocido";
        },
        [tiposEmpaque]
    );

    const getDate = useCallback((dateString: string | null) => {
        return formatCreatedAt(dateString);
    }, []);

    const formatNumber = useCallback(
        (value: number, decimals: number = 1): string => {
            if (typeof value !== "number" || isNaN(value)) {
                return "0.0";
            }
            return value.toFixed(decimals);
        },
        []
    );

    // Handle delete production
    const handleDeleteProduccion = useCallback(
        async (id: number) => {
            try {
                await deleteProduccion(id);
                toast.success("Registro de producción eliminado correctamente");
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                console.error("Error eliminando producción:", error);
                toast.error("No se pudo eliminar el registro de producción");
            }
        },
        [deleteProduccion, onSuccess]
    );

    // Handle production success - Fixed to avoid infinite loop
    const handleProductionSuccess = useCallback(() => {
        // Use ref to avoid dependency issues and infinite loops
        fetchProduccionesRef.current();
        if (onSuccess) {
            onSuccess();
        }
    }, [onSuccess]); // Only onSuccess as dependency

    // Datos filtrados y estadísticas (memoizados)
    const filteredProducciones = useMemo(() => {
        if (!producciones || producciones.length === 0) return [];

        return producciones.filter((produccion) => {
            const cuadrillaNombre = getCuadrillaNombre(
                produccion.cuadrilla_id
            ).toLowerCase();
            const clienteNombre = getClienteNombre(
                produccion.cliente_id
            ).toLowerCase();
            const variedadNombre = getVariedadNombre(
                produccion.cuadrilla_id
            ).toLowerCase();

            const matchesSearch =
                searchTerm === "" ||
                cuadrillaNombre.includes(searchTerm.toLowerCase()) ||
                clienteNombre.includes(searchTerm.toLowerCase()) ||
                variedadNombre.includes(searchTerm.toLowerCase());

            const matchesTemporada =
                selectedTemporadaFilter === "all" ||
                produccion.temporada_id.toString() === selectedTemporadaFilter;

            const matchesCliente =
                selectedClienteFilter === "all" ||
                produccion.cliente_id.toString() === selectedClienteFilter;

            const today = new Date();
            const produccionDate = new Date(produccion.fecha);
            let matchesDate = true;

            if (dateFilter === "week") {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                matchesDate = produccionDate >= weekAgo;
            } else if (dateFilter === "month") {
                const monthAgo = new Date(today);
                monthAgo.setMonth(today.getMonth() - 1);
                matchesDate = produccionDate >= monthAgo;
            }

            return (
                matchesSearch &&
                matchesTemporada &&
                matchesCliente &&
                matchesDate
            );
        });
    }, [
        producciones,
        searchTerm,
        selectedTemporadaFilter,
        selectedClienteFilter,
        dateFilter,
        getCuadrillaNombre,
        getClienteNombre,
        getVariedadNombre,
    ]);

    const estadisticas = useMemo(() => {
        if (!filteredProducciones || filteredProducciones.length === 0) {
            return {
                totalFiltered: 0,
                registrosFiltered: 0,
                clientesUnicos: 0,
                cuadrillasActivas: 0,
                promedioProduccion: 0,
            };
        }

        const totalFiltered = filteredProducciones.reduce((sum, p) => {
            const cantidad = Number(p.cantidad) || 0;
            return sum + cantidad;
        }, 0);

        const registrosFiltered = filteredProducciones.length;
        const clientesUnicos = new Set(
            filteredProducciones.map((p) => p.cliente_id)
        ).size;
        const cuadrillasActivas = new Set(
            filteredProducciones.map((p) => p.cuadrilla_id)
        ).size;
        const promedioProduccion =
            registrosFiltered > 0 ? totalFiltered / registrosFiltered : 0;

        return {
            totalFiltered: Number(totalFiltered) || 0,
            registrosFiltered: Number(registrosFiltered) || 0,
            clientesUnicos: Number(clientesUnicos) || 0,
            cuadrillasActivas: Number(cuadrillasActivas) || 0,
            promedioProduccion: Number(promedioProduccion) || 0,
        };
    }, [filteredProducciones]);

    // Use the hook to get the createProductionWorkbook function
    const { createProductionWorkbook } = useDriveUpload({
        filteredProducciones,
        selectedTemporadaFilter,
        selectedClienteFilter,
        dateFilter,
        searchTerm,
        temporadas,
        clientes,
        cuadrillas,
        jornaleros,
        variedades,
        tiposUva,
        tiposEmpaque,
        estadisticas,
    });

    // Handle export to Excel
    const handleExportToExcel = useCallback(async () => {
        if (!filteredProducciones || filteredProducciones.length === 0) {
            toast.error("No hay datos para exportar");
            return;
        }

        // Obtener nombres legibles de los filtros
        const temporadaNombre =
            selectedTemporadaFilter === "all"
                ? "Todas"
                : temporadas
                      .find((t) => t.id.toString() === selectedTemporadaFilter)
                      ?.id?.toString() || "Desconocida";

        const clienteNombre =
            selectedClienteFilter === "all"
                ? "Todos"
                : clientes.find(
                      (c) => c.id.toString() === selectedClienteFilter
                  )?.nombre || "Desconocido";

        const fechaNombre =
            dateFilter === "all"
                ? "Todos"
                : dateFilter === "week"
                ? "Última semana"
                : dateFilter === "month"
                ? "Último mes"
                : "Personalizado";

        const filtrosAplicados = {
            searchTerm: searchTerm || undefined,
            temporada: temporadaNombre,
            cliente: clienteNombre,
            fecha: fechaNombre,
        };

        await exportProductionRecords(
            filteredProducciones,
            getCuadrillaNombre,
            getVariedadNombre,
            getClienteNombre,
            getTipoUvaNombre,
            getTipoEmpaqueNombre,
            estadisticas,
            filtrosAplicados
        );

        toast.success("Exportación iniciada. Revisa tu carpeta de descargas.");
    }, [
        filteredProducciones,
        selectedTemporadaFilter,
        selectedClienteFilter,
        dateFilter,
        searchTerm,
        temporadas,
        clientes,
        getCuadrillaNombre,
        getVariedadNombre,
        getClienteNombre,
        getTipoUvaNombre,
        getTipoEmpaqueNombre,
        estadisticas,
    ]);

    // Columnas para la tabla de producción (memoizadas)
    const produccionColumns: ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({ row }) => (
                    <Badge variant="outline">#{row.original.id}</Badge>
                ),
            },
            {
                accessorKey: "cuadrilla_id",
                header: "Cuadrilla",
                cell: ({ row }) =>
                    getCuadrillaNombre(row.original.cuadrilla_id),
            },
            {
                accessorKey: "variedad",
                header: "Variedad",
                cell: ({ row }) => {
                    const nombre = getVariedadNombre(row.original.cuadrilla_id);
                    return <Badge variant="secondary">{nombre}</Badge>;
                },
            },
            {
                accessorKey: "cliente_id",
                header: "Cliente",
                cell: ({ row }) => getClienteNombre(row.original.cliente_id),
            },
            {
                accessorKey: "cantidad",
                header: "Cantidad",
                cell: ({ row }) => (
                    <div className="flex items-center gap-1">
                        <Package className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                            {row.original.cantidad} cajas
                        </span>
                    </div>
                ),
            },
            {
                accessorKey: "fecha",
                header: "Fecha",
                cell: ({ row }) => getDate(row.original.fecha),
            },
            {
                id: "acciones",
                header: "Acciones",
                cell: ({ row }) => (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduccion(row.original.id)}
                        title="Eliminar registro"
                    >
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                ),
            },
        ],
        [
            getCuadrillaNombre,
            getVariedadNombre,
            getClienteNombre,
            getDate,
            handleDeleteProduccion,
        ]
    );

    // Get active temporadas
    const activeTemporadas = useMemo(
        () =>
            temporadas.filter(
                (t) => !t.fecha_final || new Date(t.fecha_final) >= new Date()
            ),
        [temporadas]
    );

    if (catalogLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Registro de Producción
                    </CardTitle>
                    <CardDescription>
                        Cargando datos del sistema...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">
                            Cargando datos de producción...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (activeTemporadas.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Registro de Producción
                    </CardTitle>
                    <CardDescription>
                        Registra la producción de las cuadrillas con todos los
                        detalles
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                    <div className="space-y-4">
                        <AlertCircle className="h-16 w-16 mx-auto text-orange-500 opacity-50" />
                        <div>
                            <h3 className="text-lg font-medium">
                                No hay temporadas activas
                            </h3>
                            <p className="text-muted-foreground">
                                Para registrar producción, primero necesitas
                                crear una temporada activa.
                            </p>
                        </div>
                        <Button onClick={onNewTemporada}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Crear Temporada
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <ProductionStatistics
                estadisticas={estadisticas}
                formatNumber={formatNumber}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProductionForm onSuccess={handleProductionSuccess} />

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2">
                                    <span>Registros de Producción</span>
                                    <Badge variant="outline">
                                        {estadisticas.registrosFiltered} de{" "}
                                        {producciones.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription>
                                    Total filtrado:{" "}
                                    {formatNumber(estadisticas.totalFiltered)}{" "}
                                    cajas
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <ExportButton
                                    onClick={handleExportToExcel}
                                    disabled={
                                        !filteredProducciones ||
                                        filteredProducciones.length === 0
                                    }
                                    variant="outline"
                                    size="sm"
                                    children="Exportar Local"
                                />

                                <Button
                                    onClick={() =>
                                        setIsGoogleDriveModalOpen(true)
                                    }
                                    disabled={
                                        !filteredProducciones ||
                                        filteredProducciones.length === 0 ||
                                        !isOnline
                                    }
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Cloud className="h-4 w-4" />
                                    Subir a Drive
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProductionFilters
                            searchTerm={searchTerm}
                            selectedTemporadaFilter={selectedTemporadaFilter}
                            selectedClienteFilter={selectedClienteFilter}
                            dateFilter={dateFilter}
                            temporadas={temporadas}
                            clientes={clientes}
                            onSearchChange={setSearchTerm}
                            onTemporadaFilterChange={setSelectedTemporadaFilter}
                            onClienteFilterChange={setSelectedClienteFilter}
                            onDateFilterChange={setDateFilter}
                        />

                        {produccionLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : (
                            <DataTable
                                columns={produccionColumns}
                                data={filteredProducciones}
                                emptyMessage="No hay registros de producción"
                                showSearch={false}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Google Drive Upload Modal */}
            <GoogleDriveUploadModal
                open={isGoogleDriveModalOpen}
                onOpenChange={setIsGoogleDriveModalOpen}
                workbook={createProductionWorkbook()}
                fileName={`registros_produccion_${
                    new Date().toISOString().split("T")[0]
                }`}
                onUploadComplete={(result) => {
                    console.log("Archivo subido a Google Drive:", result);
                    toast.success("Archivo subido exitosamente a Google Drive");
                }}
            />
        </div>
    );
}
