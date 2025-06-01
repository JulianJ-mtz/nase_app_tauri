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
import { insertarTipoUva, actualizarTipoUva, obtenerTipoUvaPorId, type TipoUvaData } from "@/api/tipo_uva_api";

interface TipoUvaFormProps {
    tipoUvaId?: number;
    onSuccess?: () => void;
}

export function TipoUvaForm({ tipoUvaId, onSuccess }: TipoUvaFormProps) {
    const [formData, setFormData] = useState<TipoUvaData>({
        codigo: 0,
        nombre: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (tipoUvaId) {
            const fetchTipoUva = async () => {
                try {
                    setFetchLoading(true);
                    const tipoUva = await obtenerTipoUvaPorId(tipoUvaId);
                    if (tipoUva) {
                        setFormData({
                            codigo: tipoUva.codigo,
                            nombre: tipoUva.nombre,
                        });
                    }
                } catch (error) {
                    console.error("Error al cargar tipo de uva:", error);
                    toast.error("Error al cargar datos del tipo de uva");
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchTipoUva();
        }
    }, [tipoUvaId]);

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
            if (tipoUvaId) {
                result = await actualizarTipoUva(tipoUvaId, formData);
            } else {
                result = await insertarTipoUva(formData);
            }
            
            toast.success(result);
            
            if (onSuccess) {
                onSuccess();
            }

            if (!tipoUvaId) {
                setFormData({
                    codigo: 0,
                    nombre: "",
                });
            }
        } catch (error) {
            console.error("Error en la operación de tipo de uva:", error);
            toast.error(
                tipoUvaId
                    ? "Error al actualizar tipo de uva. Inténtelo de nuevo."
                    : "Error al crear tipo de uva. Inténtelo de nuevo."
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
                        Obteniendo información del tipo de uva
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información del tipo de uva...
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
                        {tipoUvaId ? "Editar Tipo de Uva" : "Nuevo Tipo de Uva"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {tipoUvaId
                        ? "Actualiza la información del tipo de uva"
                        : "Ingresa los datos para registrar un nuevo tipo de uva"}
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
                                placeholder="Código del tipo de uva"
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
                                placeholder="Nombre del tipo de uva"
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
                                {tipoUvaId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Grape className="mr-2 h-4 w-4" />
                                {tipoUvaId ? "Actualizar Tipo de Uva" : "Crear Tipo de Uva"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 