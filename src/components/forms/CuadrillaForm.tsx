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
import { useTemporadaStore } from "@/lib/storeTemporada";
import type { CuadrillaData } from "@/api/cuadrilla_api";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { obtenerVariedades, Variedad } from "@/api/variedad_api";
import { Separator } from "@/components/ui/separator";

interface CuadrillaFormProps {
    cuadrillaId?: number;
    onSuccess?: () => void;
}

export function CuadrillaForm({ cuadrillaId, onSuccess }: CuadrillaFormProps) {
    const { addCuadrilla, updateCuadrilla, getCuadrillaById } =
        useCuadrillaStore();
    const { jornaleros, fetchJornaleros } = useJornaleroStore();
    const { temporadas, fetchTemporadas } = useTemporadaStore();

    const [variedades, setVariedades] = useState<Variedad[]>([]);

    const [formData, setFormData] = useState<CuadrillaData>({
        lote: "",
        temporada_id: null,
        lider_cuadrilla_id: null,
        variedad_id: null,
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        // Fetch dependencies
        fetchJornaleros();
        fetchTemporadas();
        obtenerVariedades().then(setVariedades);

        if (cuadrillaId) {
            const fetchCuadrilla = async () => {
                try {
                    setFetchLoading(true);
                    const cuadrilla = await getCuadrillaById(cuadrillaId);
                    if (cuadrilla) {
                        setFormData({
                            lote: cuadrilla.lote ?? "",
                            temporada_id: cuadrilla.temporada_id ?? null,
                            lider_cuadrilla_id:
                                cuadrilla.lider_cuadrilla_id || null,
                            variedad_id: cuadrilla.variedad_id ?? null,
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
    }, [cuadrillaId, getCuadrillaById, fetchJornaleros, fetchTemporadas]);

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
        if (!formData.variedad_id) {
            toast.error("La variedad es requerida");
            return;
        }
        if (!formData.temporada_id) {
            toast.error("La temporada es requerida");
            return;
        }

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
                    temporada_id: null,
                    lider_cuadrilla_id: null,
                    variedad_id: null,
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

    // Filter available jornaleros for the leader (active jornaleros without cuadrilla)
    const availableLeaders = jornaleros.filter(
        (j) =>
            j.estado === "Activo" &&
            (!j.cuadrilla_id || j.id === formData.lider_cuadrilla_id)
    );

    // Filter active temporadas (those without fecha_final or with future fecha_final)
    const activeTemporadas = temporadas.filter(
        (t) => !t.fecha_final || new Date(t.fecha_final) >= new Date()
    );

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
                    {/* Información Básica */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="temporada_id"
                                className="text-sm font-medium"
                            >
                                Temporada *
                            </Label>
                            <Select
                                value={formData.temporada_id?.toString() || ""}
                                onValueChange={(value) =>
                                    handleSelectChange(value, "temporada_id")
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una temporada" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeTemporadas.map((temporada) => (
                                        <SelectItem
                                            key={temporada.id}
                                            value={temporada.id.toString()}
                                        >
                                            Temporada {temporada.id} (
                                            {temporada.fecha_inicial}
                                            {temporada.fecha_final
                                                ? ` - ${temporada.fecha_final}`
                                                : " - Activa"}
                                            )
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="lote"
                                    className="text-sm font-medium"
                                >
                                    Lote *
                                </Label>
                                <Input
                                    id="lote"
                                    name="lote"
                                    placeholder="Nombre del lote"
                                    value={formData.lote}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="variedad_id"
                                    className="text-sm font-medium"
                                >
                                    Variedad *
                                </Label>
                                <Select
                                    value={
                                        formData.variedad_id?.toString() || ""
                                    }
                                    onValueChange={(value) =>
                                        handleSelectChange(value, "variedad_id")
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una variedad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {variedades.map((variedad) => (
                                            <SelectItem
                                                key={variedad.id}
                                                value={variedad.id.toString()}
                                            >
                                                {variedad.nombre} (Código:{" "}
                                                {variedad.codigo})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Liderazgo */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Liderazgo
                        </h3>

                        <div className="space-y-1">
                            <Label
                                htmlFor="lider_cuadrilla_id"
                                className="text-sm font-medium"
                            >
                                Líder de Cuadrilla
                            </Label>

                            {availableLeaders.length > 0 ? (
                                <Select
                                    value={
                                        formData.lider_cuadrilla_id?.toString() ||
                                        ""
                                    }
                                    onValueChange={(value) =>
                                        handleSelectChange(
                                            value,
                                            "lider_cuadrilla_id"
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un líder" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">
                                            Sin líder asignado
                                        </SelectItem>
                                        {availableLeaders.map((jornalero) => (
                                            <SelectItem
                                                key={jornalero.id}
                                                value={jornalero.id.toString()}
                                            >
                                                {jornalero.nombre}
                                                {jornalero.edad &&
                                                    ` (Edad: ${jornalero.edad})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    value={
                                        "No hay jornaleros disponibles para asignar como líder"
                                    }
                                    disabled
                                    className="text-xs text-muted-foreground"
                                />
                            )}

                            <p className="text-xs text-muted-foreground">
                                Solo se muestran jornaleros activos disponibles
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {cuadrillaId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Users className="mr-2 h-4 w-4" />
                                {cuadrillaId
                                    ? "Actualizar Cuadrilla"
                                    : "Crear Cuadrilla"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
