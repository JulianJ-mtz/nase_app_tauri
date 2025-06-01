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
import { Loader2, Grape } from "lucide-react";
import { insertarVariedad, actualizarVariedad, obtenerVariedadPorId, type VariedadData } from "@/api/variedad_api";

interface VariedadFormProps {
    variedadId?: number;
    onSuccess?: () => void;
}

export function VariedadForm({ variedadId, onSuccess }: VariedadFormProps) {
    const [formData, setFormData] = useState<VariedadData>({
        codigo: 0,
        nombre: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (variedadId) {
            const fetchVariedad = async () => {
                try {
                    setFetchLoading(true);
                    const variedad = await obtenerVariedadPorId(variedadId);
                    if (variedad) {
                        setFormData({
                            codigo: variedad.codigo,
                            nombre: variedad.nombre,
                        });
                    }
                } catch (error) {
                    console.error("Error al cargar variedad:", error);
                    toast.error("Error al cargar datos de la variedad");
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchVariedad();
        }
    }, [variedadId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        if (!formData.codigo || formData.codigo <= 0) {
            toast.error("El código debe ser un número positivo");
            return;
        }

        try {
            setLoading(true);
            let result;
            if (variedadId) {
                result = await actualizarVariedad(variedadId, formData);
            } else {
                result = await insertarVariedad(formData);
            }
            
            toast.success(result);
            
            if (onSuccess) {
                onSuccess();
            }

            if (!variedadId) {
                setFormData({
                    codigo: 0,
                    nombre: "",
                });
            }
        } catch (error) {
            console.error("Error en la operación de variedad:", error);
            toast.error(
                variedadId
                    ? "Error al actualizar variedad. Inténtelo de nuevo."
                    : "Error al crear variedad. Inténtelo de nuevo."
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
                        Obteniendo información de la variedad
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información de la variedad...
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
                    <Grape className="h-5 w-5 text-primary" />
                    <CardTitle>
                        {variedadId ? "Editar Variedad" : "Nueva Variedad"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {variedadId
                        ? "Actualiza la información de la variedad"
                        : "Ingresa los datos para registrar una nueva variedad"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="codigo" className="text-sm font-medium">
                                Código *
                            </Label>
                            <Input
                                id="codigo"
                                name="codigo"
                                type="number"
                                min="1"
                                placeholder="Código de la variedad"
                                value={formData.codigo}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="nombre" className="text-sm font-medium">
                                Nombre *
                            </Label>
                            <Input
                                id="nombre"
                                name="nombre"
                                placeholder="Nombre de la variedad"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
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
                                {variedadId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Grape className="mr-2 h-4 w-4" />
                                {variedadId ? "Actualizar Variedad" : "Crear Variedad"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 