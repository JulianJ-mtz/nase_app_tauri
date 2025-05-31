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
import { Loader2, Package } from "lucide-react";
import { insertarTipoEmpaque, actualizarTipoEmpaque, obtenerTipoEmpaquePorId, type TipoEmpaqueData } from "@/api/tipo_empaque_api";

interface TipoEmpaqueFormProps {
    tipoEmpaqueId?: number;
    onSuccess?: () => void;
}

export function TipoEmpaqueForm({ tipoEmpaqueId, onSuccess }: TipoEmpaqueFormProps) {
    const [formData, setFormData] = useState<TipoEmpaqueData>({
        codigo: 0,
        nombre: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (tipoEmpaqueId) {
            const fetchTipoEmpaque = async () => {
                try {
                    setFetchLoading(true);
                    const tipoEmpaque = await obtenerTipoEmpaquePorId(tipoEmpaqueId);
                    if (tipoEmpaque) {
                        setFormData({
                            codigo: tipoEmpaque.codigo,
                            nombre: tipoEmpaque.nombre,
                        });
                    }
                } catch (error) {
                    console.error("Error al cargar tipo de empaque:", error);
                    toast.error("Error al cargar datos del tipo de empaque");
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchTipoEmpaque();
        }
    }, [tipoEmpaqueId]);

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
            if (tipoEmpaqueId) {
                result = await actualizarTipoEmpaque(tipoEmpaqueId, formData);
            } else {
                result = await insertarTipoEmpaque(formData);
            }
            
            toast.success(result);
            
            if (onSuccess) {
                onSuccess();
            }

            if (!tipoEmpaqueId) {
                setFormData({
                    codigo: 0,
                    nombre: "",
                });
            }
        } catch (error) {
            console.error("Error en la operación de tipo de empaque:", error);
            toast.error(
                tipoEmpaqueId
                    ? "Error al actualizar tipo de empaque. Inténtelo de nuevo."
                    : "Error al crear tipo de empaque. Inténtelo de nuevo."
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
                        Obteniendo información del tipo de empaque
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información del tipo de empaque...
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
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>
                        {tipoEmpaqueId ? "Editar Tipo de Empaque" : "Nuevo Tipo de Empaque"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {tipoEmpaqueId
                        ? "Actualiza la información del tipo de empaque"
                        : "Ingresa los datos para registrar un nuevo tipo de empaque"}
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
                                placeholder="Código del tipo de empaque"
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
                                placeholder="Nombre del tipo de empaque"
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
                                {tipoEmpaqueId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Package className="mr-2 h-4 w-4" />
                                {tipoEmpaqueId ? "Actualizar Tipo de Empaque" : "Crear Tipo de Empaque"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 