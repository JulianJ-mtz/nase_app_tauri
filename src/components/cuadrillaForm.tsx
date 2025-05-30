"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { format } from "date-fns";
import type { CuadrillaData } from "@/api/cuadrilla_api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface CuadrillaFormProps {
    cuadrillaId?: number;
    onSuccess?: () => void;
}

export function CuadrillaForm({ cuadrillaId, onSuccess }: CuadrillaFormProps) {
    const { addCuadrilla, updateCuadrilla, getCuadrillaById } =
        useCuadrillaStore();
    const { jornaleros, fetchJornaleros } = useJornaleroStore();

    const today = new Date();
    const formattedToday = format(today, "yyyy-MM-dd");

    const [formData, setFormData] = useState<CuadrillaData>({
        lote: "",
        // variedad: "",
        // integrantes: null,
        // empaque: null,
        temporada_id: null,
        lider_cuadrilla: null,
        produccion_cuadrilla: null,
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        // Fetch jornaleros to select a leader
        fetchJornaleros();

        if (cuadrillaId) {
            const fetchCuadrilla = async () => {
                try {
                    setFetchLoading(true);
                    const cuadrilla = await getCuadrillaById(cuadrillaId);
                    if (cuadrilla) {
                        // Convert from API response to our form data structure
                        setFormData({
                            lote: cuadrilla.Lote ?? "",
                            // variedad: cuadrilla.Variedad ?? "",
                            // integrantes:
                            //     parseInt(cuadrilla.Integrantes) || null,
                            // empaque: cuadrilla.Empaque ?? null,
                            temporada_id: cuadrilla.TemporadaId ?? null,
                            lider_cuadrilla:
                                parseInt(cuadrilla.LiderCuadrilla) || null,
                            produccion_cuadrilla:
                                cuadrilla.ProduccionCuadrilla ?? null,
                        });
                    }
                } catch (error) {
                    toast.error("Error al cargar datos de la cuadrilla");
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchCuadrilla();
        }
    }, [cuadrillaId, getCuadrillaById, fetchJornaleros]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" && value !== "" ? Number(value) : value,
        }));
    };

    const handleSelectChange = (value: string | null, fieldName: string) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: value === "null" ? null : value ? Number(value) : null,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.lote.trim()) {
            toast.error("El lote es requerido");
            return;
        }
        // if (!formData.variedad.trim()) {
        //     toast.error("La variedad es requerida");
        //     return;
        // }

        try {
            setLoading(true);
            let result;
            if (cuadrillaId) {
                result = await updateCuadrilla(cuadrillaId, formData);
            } else {
                result = await addCuadrilla(formData);
            }
            toast.success(result);
            if (onSuccess) onSuccess();
            if (!cuadrillaId) {
                setFormData({
                    lote: "",
                    // variedad: "",
                    // integrantes: null,
                    // empaque: null,
                    temporada_id: null,
                    lider_cuadrilla: null,
                    produccion_cuadrilla: null,
                });
            }
        } catch (error) {
            console.error("Error en la operación de cuadrilla:", error);
            toast.error(
                cuadrillaId
                    ? "Error al actualizar cuadrilla. Inténtelo de nuevo."
                    : "Error al crear cuadrilla. Inténtelo de nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    // Filter available jornaleros for the leader (active jornaleros)
    const activeJornaleros = jornaleros.filter((j) => j.estado === "Activo");

    if (fetchLoading) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-3">
                    <CardTitle>Cargando datos</CardTitle>
                    <CardDescription>
                        Obteniendo información de la cuadrilla
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información de la cuadrilla...
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full shadow-md">
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>
                        {cuadrillaId ? "Editar Cuadrilla" : "Nueva Cuadrilla"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {cuadrillaId
                        ? "Actualiza la información de la cuadrilla"
                        : "Ingresa los datos para registrar una nueva cuadrilla"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                    <div className="space-y-1">
                        <Label htmlFor="lote" className="text-sm font-medium">
                            Lote
                        </Label>
                        <Input
                            id="lote"
                            name="lote"
                            placeholder="Lote"
                            value={formData.lote}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* <div className="space-y-1">
                        <Label
                            htmlFor="variedad"
                            className="text-sm font-medium"
                        >
                            Variedad
                        </Label>
                        <Input
                            id="variedad"
                            name="variedad"
                            placeholder="Variedad"
                            value={formData.variedad}
                            onChange={handleChange}
                            required
                        />
                    </div> */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="lider_cuadrilla"
                                className="text-sm font-medium"
                            >
                                Líder de Cuadrilla
                            </Label>
                            <Select
                                value={
                                    formData.lider_cuadrilla?.toString() ||
                                    "null"
                                }
                                onValueChange={(value) =>
                                    handleSelectChange(
                                        value === "null" ? null : value,
                                        "lider_cuadrilla"
                                    )
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar líder" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">
                                        Sin líder asignado
                                    </SelectItem>
                                    {activeJornaleros.map((jornalero) => (
                                        <SelectItem
                                            key={jornalero.id}
                                            value={jornalero.id.toString()}
                                        >
                                            {jornalero.nombre} (ID:{" "}
                                            {jornalero.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                                El líder debe ser un jornalero activo
                            </p>
                        </div>
                        {/* <div className="space-y-1">
                            <Label
                                htmlFor="integrantes"
                                className="text-sm font-medium"
                            >
                                Capacidad de Integrantes
                            </Label>
                            <Input
                                 id="integrantes"
                                 name="integrantes"
                                 type="number"
                                 placeholder="Capacidad máxima"
                                 value={formData.integrantes ?? ""}
                                 onChange={handleChange}
                             />
                        </div> */}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* <div className="space-y-1">
                            <Label
                                htmlFor="produccion_cuadrilla"
                                className="text-sm font-medium"
                            >
                                Producción de la Cuadrilla (kg)
                            </Label>
                            <Input
                                id="produccion_cuadrilla"
                                name="produccion_cuadrilla"
                                type="number"
                                placeholder="Producción total"
                                value={formData.produccion_cuadrilla ?? ""}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Meta de producción para esta cuadrilla
                            </p>
                        </div> */}
                        {/* <div className="space-y-1">
                            <Label
                                htmlFor="empaque"
                                className="text-sm font-medium"
                            >
                                Empaque
                            </Label>
                             <Input
                                 id="empaque"
                                 name="empaque"
                                 type="text"
                                 placeholder="Tipo de empaque"
                                 value={formData.empaque ?? ""}
                                 onChange={handleChange}
                             />
                        </div> */}
                    </div>
                    <div className="space-y-1">
                        <Label
                            htmlFor="temporada_id"
                            className="text-sm font-medium"
                        >
                            ID Temporada
                        </Label>
                        <Input
                            id="temporada_id"
                            name="temporada_id"
                            type="number"
                            placeholder="ID de la temporada"
                            value={formData.temporada_id ?? ""}
                            onChange={handleChange}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto"
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {cuadrillaId
                            ? "Actualizar Cuadrilla"
                            : "Crear Cuadrilla"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
