"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    Card,
    CardFooter,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Stores
import { useTemporadaStore } from "@/lib/storeTemporada";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useProduccionStore } from "@/lib/storeProduccion";
import { useJornaleroStore } from "@/lib/storeJornalero";

// APIs
import { obtenerVariedades, Variedad } from "@/api/variedad_api";
import { obtenerTiposUva, TipoUva } from "@/api/tipo_uva_api";
import { obtenerTiposEmpaque, TipoEmpaque } from "@/api/tipo_empaque_api";
import { obtenerClientes, Cliente } from "@/api/cliente_api";
import { ProduccionData } from "@/api/produccion_api";

interface ProductionFormProps {
    onSuccess?: () => void;
}

interface FormData {
    cuadrillaId?: number;
    temporadaId?: number;
    tipoUvaId?: number;
    tipoEmpaqueId?: number;
    clienteId?: number;
    cantidad?: number;
}

export function ProductionForm({ onSuccess }: ProductionFormProps) {
    // Stores
    const { temporadas, fetchTemporadas } = useTemporadaStore();
    const { cuadrillas, fetchCuadrillas } = useCuadrillaStore();
    const { createProduccion } = useProduccionStore();
    const { jornaleros, fetchJornaleros } = useJornaleroStore();

    // Estados para datos de catálogo
    const [variedades, setVariedades] = useState<Variedad[]>([]);
    const [tiposUva, setTiposUva] = useState<TipoUva[]>([]);
    const [tiposEmpaque, setTiposEmpaque] = useState<TipoEmpaque[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [catalogLoading, setCatalogLoading] = useState(true);

    // Estados del formulario
    const [formData, setFormData] = useState<FormData>({});
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // Cargar datos del catálogo
    const loadCatalogData = useCallback(async () => {
        try {
            setCatalogLoading(true);
            const [varData, tipoUvaData, tipoEmpData, clienteData] =
                await Promise.all([
                    obtenerVariedades(),
                    obtenerTiposUva(),
                    obtenerTiposEmpaque(),
                    obtenerClientes(),
                ]);

            setVariedades(varData);
            setTiposUva(tipoUvaData);
            setTiposEmpaque(tipoEmpData);
            setClientes(clienteData);
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
        loadCatalogData();
    }, [fetchTemporadas, fetchCuadrillas, fetchJornaleros, loadCatalogData]);

    // Seleccionar temporada activa por defecto
    useEffect(() => {
        const activeTemporada = temporadas.find(
            (t) => !t.fecha_final || new Date(t.fecha_final) >= new Date()
        );
        if (activeTemporada && !formData.temporadaId) {
            setFormData((prev) => ({
                ...prev,
                temporadaId: activeTemporada.id,
            }));
        }
    }, [temporadas, formData.temporadaId]);

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

    const getTemporadaNombre = useCallback(
        (id: number) => {
            const temporada = temporadas.find((t) => t.id === id);
            return temporada ? `Temporada ${temporada.id}` : "Desconocida";
        },
        [temporadas]
    );

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }, []);

    // Validación
    const validateForm = useCallback(() => {
        const errors: Record<string, string> = {};

        if (!formData.cuadrillaId)
            errors.cuadrilla = "Selecciona una cuadrilla";
        if (!formData.temporadaId)
            errors.temporada = "Selecciona una temporada";
        if (!formData.tipoUvaId) errors.tipoUva = "Selecciona un tipo de uva";
        if (!formData.tipoEmpaqueId)
            errors.tipoEmpaque = "Selecciona un tipo de empaque";
        if (!formData.clienteId) errors.cliente = "Selecciona un cliente";
        if (!formData.cantidad || formData.cantidad <= 0)
            errors.cantidad = "Ingresa una cantidad válida";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    // Validación en tiempo real
    useEffect(() => {
        if (Object.keys(formErrors).length > 0) {
            validateForm();
        }
    }, [formData, formErrors, validateForm]);

    // Handlers
    const handleFieldChange = (
        field: keyof FormData,
        value: number | undefined
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const resetForm = useCallback(() => {
        const activeTemporada = temporadas.find(
            (t) => !t.fecha_final || new Date(t.fecha_final) >= new Date()
        );

        setFormData({
            temporadaId: activeTemporada?.id,
            cuadrillaId: undefined,
            tipoUvaId: undefined,
            tipoEmpaqueId: undefined,
            clienteId: undefined,
            cantidad: undefined,
        });
        setFormErrors({});
    }, [temporadas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Por favor corrige los errores en el formulario");
            return;
        }

        const produccionData: ProduccionData = {
            cuadrilla_id: formData.cuadrillaId!,
            temporada_id: formData.temporadaId!,
            tipo_uva_id: formData.tipoUvaId!,
            tipo_empaque_id: formData.tipoEmpaqueId!,
            cliente_id: formData.clienteId!,
            cantidad: formData.cantidad!,
            fecha: new Date().toISOString().split("T")[0],
        };

        try {
            setLoading(true);
            await createProduccion(produccionData);
            toast.success("✅ Producción registrada correctamente");
            resetForm();

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error guardando producción:", error);
            toast.error("❌ No se pudo guardar el registro de producción");
        } finally {
            setLoading(false);
        }
    };

    // Mostrar cuadrilla con variedad
    const getCuadrillaDisplay = useCallback(
        (cuadrilla: any) => {
            const nombreCuadrilla = getCuadrillaNombre(cuadrilla.id);
            const variedad = getVariedadNombre(cuadrilla.id);
            return (
                <div className="flex flex-col">
                    <span>{nombreCuadrilla}</span>
                    <span className="text-xs text-muted-foreground">
                        Variedad: {variedad}
                    </span>
                </div>
            );
        },
        [getCuadrillaNombre, getVariedadNombre]
    );

    if (catalogLoading) {
        return (
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Nuevo Registro de Producción
                    </CardTitle>
                    <CardDescription>
                        Cargando datos del sistema...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando catálogos de datos...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl shadow-md">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>Nuevo Registro de Producción</CardTitle>
                </div>
                <CardDescription>
                    Registra la producción de una cuadrilla con todos los
                    detalles
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {/* Información de Asignación */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Información de Asignación
                        </h3>

                        {/* Cuadrilla */}
                        <div className="space-y-1">
                            <Label
                                htmlFor="cuadrilla"
                                className="text-sm font-medium"
                            >
                                Cuadrilla *
                            </Label>
                            <Select
                                value={formData.cuadrillaId?.toString()}
                                onValueChange={(value) =>
                                    handleFieldChange(
                                        "cuadrillaId",
                                        Number(value)
                                    )
                                }
                            >
                                <SelectTrigger
                                    className={
                                        formErrors.cuadrilla
                                            ? "border-red-500"
                                            : ""
                                    }
                                >
                                    <SelectValue placeholder="Seleccionar cuadrilla" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cuadrillas.map((cuadrilla) => (
                                        <SelectItem
                                            key={cuadrilla.id}
                                            value={cuadrilla.id.toString()}
                                        >
                                            {getCuadrillaDisplay(cuadrilla)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.cuadrilla && (
                                <p className="text-sm text-red-500">
                                    {formErrors.cuadrilla}
                                </p>
                            )}
                        </div>

                        {/* Temporada */}
                        <div className="space-y-1">
                            <Label
                                htmlFor="temporada"
                                className="text-sm font-medium"
                            >
                                Temporada *
                            </Label>
                            <Select
                                value={formData.temporadaId?.toString()}
                                onValueChange={(value) =>
                                    handleFieldChange(
                                        "temporadaId",
                                        Number(value)
                                    )
                                }
                            >
                                <SelectTrigger
                                    className={
                                        formErrors.temporada
                                            ? "border-red-500"
                                            : ""
                                    }
                                >
                                    <SelectValue placeholder="Seleccionar temporada" />
                                </SelectTrigger>
                                <SelectContent>
                                    {temporadas.map((temporada) => (
                                        <SelectItem
                                            key={temporada.id}
                                            value={temporada.id.toString()}
                                        >
                                            <div className="flex items-center gap-2">
                                                {getTemporadaNombre(
                                                    temporada.id
                                                )}{" "}
                                                (
                                                {formatDate(
                                                    temporada.fecha_inicial
                                                )}
                                                )
                                                {(!temporada.fecha_final ||
                                                    new Date(
                                                        temporada.fecha_final
                                                    ) >= new Date()) && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Activa
                                                    </Badge>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.temporada && (
                                <p className="text-sm text-red-500">
                                    {formErrors.temporada}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Detalles del Producto */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Detalles del Producto
                        </h3>

                        {/* Tipo de Uva */}
                        <div className="space-y-1">
                            <Label
                                htmlFor="tipoUva"
                                className="text-sm font-medium"
                            >
                                Tipo de Uva *
                            </Label>
                            <Select
                                value={formData.tipoUvaId?.toString()}
                                onValueChange={(value) =>
                                    handleFieldChange(
                                        "tipoUvaId",
                                        Number(value)
                                    )
                                }
                            >
                                <SelectTrigger
                                    className={
                                        formErrors.tipoUva
                                            ? "border-red-500"
                                            : ""
                                    }
                                >
                                    <SelectValue placeholder="Seleccionar tipo de uva" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposUva.map((tipoUva) => (
                                        <SelectItem
                                            key={tipoUva.id}
                                            value={tipoUva.id.toString()}
                                        >
                                            {tipoUva.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.tipoUva && (
                                <p className="text-sm text-red-500">
                                    {formErrors.tipoUva}
                                </p>
                            )}
                        </div>

                        {/* Tipo de Empaque */}
                        <div className="space-y-1">
                            <Label
                                htmlFor="tipoEmpaque"
                                className="text-sm font-medium"
                            >
                                Tipo de Empaque *
                            </Label>
                            <Select
                                value={formData.tipoEmpaqueId?.toString()}
                                onValueChange={(value) =>
                                    handleFieldChange(
                                        "tipoEmpaqueId",
                                        Number(value)
                                    )
                                }
                            >
                                <SelectTrigger
                                    className={
                                        formErrors.tipoEmpaque
                                            ? "border-red-500"
                                            : ""
                                    }
                                >
                                    <SelectValue placeholder="Seleccionar tipo de empaque" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposEmpaque.map((tipoEmpaque) => (
                                        <SelectItem
                                            key={tipoEmpaque.id}
                                            value={tipoEmpaque.id.toString()}
                                        >
                                            {tipoEmpaque.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.tipoEmpaque && (
                                <p className="text-sm text-red-500">
                                    {formErrors.tipoEmpaque}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Información de Venta */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Información de Venta
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cliente */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="cliente"
                                    className="text-sm font-medium"
                                >
                                    Cliente *
                                </Label>
                                <Select
                                    value={formData.clienteId?.toString()}
                                    onValueChange={(value) =>
                                        handleFieldChange(
                                            "clienteId",
                                            Number(value)
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        className={
                                            formErrors.cliente
                                                ? "border-red-500"
                                                : ""
                                        }
                                    >
                                        <SelectValue placeholder="Seleccionar cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clientes.map((cliente) => (
                                            <SelectItem
                                                key={cliente.id}
                                                value={cliente.id.toString()}
                                            >
                                                {cliente.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formErrors.cliente && (
                                    <p className="text-sm text-red-500">
                                        {formErrors.cliente}
                                    </p>
                                )}
                            </div>

                            {/* Cantidad */}
                            <div className="space-y-1">
                                <Label
                                    htmlFor="cantidad"
                                    className="text-sm font-medium"
                                >
                                    Cantidad (# de cajas) *
                                </Label>
                                <Input
                                    id="cantidad"
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={formData.cantidad ?? ""}
                                    onChange={(e) =>
                                        handleFieldChange(
                                            "cantidad",
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    className={
                                        formErrors.cantidad
                                            ? "border-red-500"
                                            : ""
                                    }
                                    placeholder="Ingresa la cantidad en # de cajas"
                                    required
                                />
                                {formErrors.cantidad && (
                                    <p className="text-sm text-red-500">
                                        {formErrors.cantidad}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="border-t pt-4 mt-4">
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar Producción
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
