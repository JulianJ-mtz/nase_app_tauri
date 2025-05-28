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
    const { addJornalero, updateJornalero, getJornaleroById } =
        useJornaleroStore();
    const { cuadrillas, fetchCuadrillas } = useCuadrillaStore();

    const today = new Date();
    const formattedToday = format(today, "yyyy-MM-dd");

    const [formData, setFormData] = useState<JornaleroData>({
        nombre: "",
        edad: 18,
        estado: "Activo",
        fecha_contratacion: formattedToday,
        produccion_jornalero: null,
        errores: 0,
        cuadrilla_id: null,
    });

    const [date, setDate] = useState<Date>(today);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

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
                            produccion_jornalero:
                                jornalero.produccion_jornalero,
                            errores: jornalero.errores || 0,
                            cuadrilla_id: jornalero.cuadrilla_id,
                        });

                        setDate(new Date(jornalero.fecha_contratacion));
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
            setFormData({
                ...formData,
                [field]:
                    value === "null" ? null : value ? parseInt(value) : null,
            });
        } else {
            setFormData({
                ...formData,
                [field]: value === "null" ? null : value,
            });
        }
    };

    const handleDateChange = (date: Date | undefined) => {
        if (date) {
            setDate(date);
            setFormData({
                ...formData,
                fecha_contratacion: format(date, "yyyy-MM-dd"),
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

        try {
            setLoading(true);

            const dataToSend = {
                ...formData,
                edad: Number(formData.edad),
                produccion_jornalero:
                    formData.produccion_jornalero === null ||
                    formData.produccion_jornalero === undefined
                        ? null
                        : Number(formData.produccion_jornalero),
                errores:
                    formData.errores === null || formData.errores === undefined
                        ? null
                        : Number(formData.errores),
                cuadrilla_id:
                    formData.cuadrilla_id === null ||
                    formData.cuadrilla_id === undefined
                        ? null
                        : Number(formData.cuadrilla_id),
            };

            console.log("Enviando datos al servidor:", dataToSend);

            let result;
            if (jornaleroId) {
                result = await updateJornalero(jornaleroId, dataToSend);
            } else {
                result = await addJornalero(dataToSend);
            }

            console.log("Respuesta del servidor:", result);

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
                    produccion_jornalero: null,
                    errores: 0,
                    cuadrilla_id: null,
                });
                setDate(today);
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
                    <div className="space-y-1">
                        <Label htmlFor="nombre" className="text-sm font-medium">
                            Nombre completo
                        </Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            placeholder="Nombre del jornalero"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="focus-visible:ring-primary"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="edad"
                                className="text-sm font-medium"
                            >
                                Edad
                            </Label>
                            <Input
                                id="edad"
                                name="edad"
                                type="number"
                                min={16}
                                value={formData.edad}
                                onChange={handleChange}
                                className="focus-visible:ring-primary"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label
                                htmlFor="estado"
                                className="text-sm font-medium"
                            >
                                Estado
                            </Label>
                            <Select
                                value={formData.estado}
                                onValueChange={(value) =>
                                    handleSelectChange(value, "estado")
                                }
                            >
                                <SelectTrigger className="focus:ring-primary">
                                    <SelectValue placeholder="Seleccionar estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Activo">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-green-100 text-green-800 border-green-300"
                                            >
                                                Activo
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Inactivo">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-gray-100 text-gray-800 border-gray-300"
                                            >
                                                Inactivo
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Suspendido">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-yellow-100 text-yellow-800 border-yellow-300"
                                            >
                                                Suspendido
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="Vacaciones">
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-100 text-blue-800 border-blue-300"
                                            >
                                                Vacaciones
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="fecha_contratacion"
                            className="text-sm font-medium"
                        >
                            Fecha de Contratación
                        </Label>

                        <Input
                            id="fecha_contratacion"
                            name="fecha_contratacion"
                            type="date"
                            value={formData.fecha_contratacion}
                            onChange={(e) => {
                                handleChange(e);
                                setDate(new Date(e.target.value));
                            }}
                            className="focus-visible:ring-primary"
                            required
                        />
                    </div>

                    <Separator />

                    <div className="space-y-1">
                        <Label
                            htmlFor="cuadrilla_id"
                            className="text-sm font-medium"
                        >
                            Cuadrilla
                        </Label>
                        <Select
                            value={formData.cuadrilla_id?.toString() || "null"}
                            onValueChange={(value) =>
                                handleSelectChange(
                                    value === "null" ? null : value,
                                    "cuadrilla_id"
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar cuadrilla" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">
                                    Sin cuadrilla asignada
                                </SelectItem>
                                {cuadrillas.map((cuadrilla) => (
                                    <SelectItem
                                        key={cuadrilla.id}
                                        value={cuadrilla.id.toString()}
                                    >
                                        Cuadrilla {cuadrilla.id} -{" "}
                                        {cuadrilla.LiderCuadrilla ||
                                            "Sin líder"}
                                        ({cuadrilla.Lote})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label
                            htmlFor="produccion_jornalero"
                            className="text-sm font-medium"
                        >
                            Producción (kg)
                        </Label>
                        <Input
                            id="produccion_jornalero"
                            name="produccion_jornalero"
                            type="number"
                            placeholder="Producción individual"
                            value={formData.produccion_jornalero ?? ""}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Producción individual del jornalero
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label
                                htmlFor="errores"
                                className="text-sm font-medium"
                            >
                                Errores
                            </Label>
                            <Input
                                id="errores"
                                name="errores"
                                type="number"
                                min={0}
                                value={
                                    formData.errores === null
                                        ? 0
                                        : formData.errores
                                }
                                onChange={handleChange}
                                className="focus-visible:ring-primary"
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Cantidad de errores registrados
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end border-t pt-4 mt-6">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="relative"
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {loading
                            ? "Guardando..."
                            : jornaleroId
                            ? "Actualizar Jornalero"
                            : "Guardar Jornalero"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
