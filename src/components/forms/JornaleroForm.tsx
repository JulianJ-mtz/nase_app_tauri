"use client";

import { useState, useEffect } from "react";
import type { JornaleroData } from "@/api/jornalero_api";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { UserIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";

interface JornaleroFormProps {
    jornaleroId?: number;
    onSuccess?: () => void;
}

export function JornaleroForm({ jornaleroId, onSuccess }: JornaleroFormProps) {
    const { addJornalero, updateJornalero, getJornaleroById } = useJornaleroStore();
    const { cuadrillas, fetchCuadrillas } = useCuadrillaStore();

    const today = new Date();
    const formattedToday = format(today, "yyyy-MM-dd");

    const [formData, setFormData] = useState<JornaleroData>({
        nombre: "",
        edad: 18,
        estado: "Activo",
        fecha_contratacion: formattedToday,
        errores: 0,
        cuadrilla_id: null,
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    // Función helper para verificar si el jornalero es líder de una cuadrilla
    const isJornaleroLider = (jornaleroId?: number) => {
        if (!jornaleroId) return null;
        return cuadrillas.find(cuadrilla => cuadrilla.lider_cuadrilla_id === jornaleroId);
    };

    // Determinar si el jornalero actual es líder
    const cuadrillaLiderada = isJornaleroLider(jornaleroId);
    const isCurrentlyLider = Boolean(cuadrillaLiderada);

    useEffect(() => {
        fetchCuadrillas();

        if (jornaleroId) {
            const fetchJornalero = async () => {
                try {
                    setFetchLoading(true);
                    const jornalero = await getJornaleroById(jornaleroId);

                    if (jornalero) {
                        setFormData({
                            nombre: jornalero.nombre,
                            edad: jornalero.edad,
                            estado: jornalero.estado,
                            fecha_contratacion: jornalero.fecha_contratacion,
                            errores: jornalero.errores || 0,
                            cuadrilla_id: jornalero.cuadrilla_id,
                        });
                    }
                } catch (error) {
                    console.error("Error al cargar jornalero:", error);
                    toast.error("Error al cargar datos del jornalero");
                } finally {
                    setFetchLoading(false);
                }
            };

            fetchJornalero();
        }
    }, [jornaleroId, getJornaleroById, fetchCuadrillas]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;

        if (type === "number") {
            setFormData({
                ...formData,
                [name]: value === "" ? null : Number(value),
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSelectChange = (value: string | null, field: string) => {
        if (field === "cuadrilla_id") {
            // Validar que si es líder, no pueda desasignarse de su cuadrilla
            if (isCurrentlyLider && cuadrillaLiderada) {
                const nuevaCuadrillaId = value === "null" ? null : value ? parseInt(value) : null;
                
                // Si es líder y trata de desasignarse o cambiar de cuadrilla
                if (nuevaCuadrillaId !== cuadrillaLiderada.id) {
                    toast.error(
                        `No puede desasignarse de la cuadrilla ${cuadrillaLiderada.id} porque es el líder de esta cuadrilla. ` +
                        `Primero debe asignar otro líder a la cuadrilla.`
                    );
                    return; // No permitir el cambio
                }
            }

            setFormData({
                ...formData,
                [field]: value === "null" ? null : value ? parseInt(value) : null,
            });
        } else {
            setFormData({
                ...formData,
                [field]: value === "null" ? null : value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        if (formData.edad < 16) {
            toast.error("La edad debe ser al menos 16 años");
            return;
        }

        // Validación adicional para líderes
        if (jornaleroId && isCurrentlyLider && cuadrillaLiderada) {
            if (formData.cuadrilla_id !== cuadrillaLiderada.id) {
                toast.error(
                    `No puede desasignar este jornalero de la cuadrilla ${cuadrillaLiderada.id} porque es el líder. ` +
                    `Primero debe asignar otro líder en la gestión de cuadrillas.`
                );
                return;
            }
        }

        try {
            setLoading(true);

            const dataToSend = {
                ...formData,
                edad: Number(formData.edad),
                errores: formData.errores === null || formData.errores === undefined ? null : Number(formData.errores),
                cuadrilla_id: formData.cuadrilla_id === null || formData.cuadrilla_id === undefined ? null : Number(formData.cuadrilla_id),
            };

            let result;
            if (jornaleroId) {
                result = await updateJornalero(jornaleroId, dataToSend);
            } else {
                result = await addJornalero(dataToSend);
            }

            toast.success(result);

            if (onSuccess) {
                onSuccess();
            }

            if (!jornaleroId) {
                await new Promise((resolve) => setTimeout(resolve, 500));

                setFormData({
                    nombre: "",
                    edad: 18,
                    estado: "Activo",
                    fecha_contratacion: formattedToday,
                    errores: 0,
                    cuadrilla_id: null,
                });
            }
        } catch (error) {
            console.error("Error completo:", error);
            toast.error(
                jornaleroId
                    ? "Error al actualizar jornalero. Inténtelo de nuevo."
                    : "Error al insertar jornalero. Inténtelo de nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <Card className="w-full">
                <CardHeader className="pb-3">
                    <CardTitle>Cargando datos</CardTitle>
                    <CardDescription>
                        Obteniendo información del jornalero
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información del jornalero...
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
                    <UserIcon className="h-5 w-5 text-primary" />
                    <CardTitle>
                        {jornaleroId ? "Editar Jornalero" : "Nuevo Jornalero"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {jornaleroId
                        ? "Actualiza la información del jornalero"
                        : "Ingresa los datos para registrar un nuevo jornalero"}
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                    {/* Información Personal */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="nombre" className="text-sm font-medium">
                                Nombre Completo *
                            </Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                placeholder="Nombre completo del jornalero"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="edad" className="text-sm font-medium">
                                    Edad *
                                </Label>
                                <Input
                                    id="edad"
                                    name="edad"
                                    type="number"
                                    min="16"
                                    max="80"
                                    placeholder="Edad"
                                    value={formData.edad}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="estado" className="text-sm font-medium">
                                    Estado *
                                </Label>
                                <Select
                                    value={formData.estado}
                                    onValueChange={(value) => handleSelectChange(value, "estado")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Activo">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="w-2 h-2 p-0 bg-green-500" />
                                                Activo
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Inactivo">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="w-2 h-2 p-0 bg-red-500" />
                                                Inactivo
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Suspendido">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="default" className="w-2 h-2 p-0 bg-yellow-500" />
                                                Suspendido
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="fecha_contratacion" className="text-sm font-medium">
                                Fecha de Contratación *
                            </Label>
                            <Input
                                id="fecha_contratacion"
                                name="fecha_contratacion"
                                type="date"
                                value={formData.fecha_contratacion}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Asignación y Rendimiento */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                            Asignación y Rendimiento
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label htmlFor="cuadrilla_id" className="text-sm font-medium">
                                    Cuadrilla Asignada
                                    {isCurrentlyLider && (
                                        <Badge variant="secondary" className="ml-2">
                                            Líder
                                        </Badge>
                                    )}
                                </Label>
                                <Select
                                    value={formData.cuadrilla_id?.toString() || "null"}
                                    onValueChange={(value) => handleSelectChange(value, "cuadrilla_id")}
                                    disabled={isCurrentlyLider && cuadrillaLiderada?.id === formData.cuadrilla_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una cuadrilla" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Sin asignar</SelectItem>
                                        {cuadrillas.map((cuadrilla) => (
                                            <SelectItem key={cuadrilla.id} value={cuadrilla.id.toString()}>
                                                Cuadrilla {cuadrilla.id} - {cuadrilla.lote}
                                                {cuadrilla.lider_cuadrilla_id === jornaleroId && (
                                                    <span className="text-xs text-muted-foreground ml-1">(Líder)</span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {isCurrentlyLider && cuadrillaLiderada && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        ⚠️ Este jornalero es líder de la Cuadrilla {cuadrillaLiderada.id}. 
                                        No puede desasignarse mientras mantenga el liderazgo.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="errores" className="text-sm font-medium">
                                    Número de Errores
                                </Label>
                                <Input
                                    id="errores"
                                    name="errores"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.errores || ""}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="border-t pt-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {jornaleroId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <UserIcon className="mr-2 h-4 w-4" />
                                {jornaleroId ? "Actualizar Jornalero" : "Crear Jornalero"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 