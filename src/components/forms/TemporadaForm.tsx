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
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { TemporadaData } from "@/api/temporada_api";
import { useTemporadaStore } from "@/lib/storeTemporada";

interface TemporadaFormProps {
    temporadaId?: number;
    onSuccess?: () => void;
}

export function TemporadaForm({ temporadaId, onSuccess }: TemporadaFormProps) {
    const { addTemporada, updateTemporada, getTemporadaById } = useTemporadaStore();
    
    const today = new Date();
    const formattedToday = format(today, "yyyy-MM-dd");

    const [formData, setFormData] = useState<TemporadaData>({
        fecha_inicial: formattedToday,
        fecha_final: undefined,
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (temporadaId) {
            const fetchTemporada = async () => {
                try {
                    setFetchLoading(true);
                    const temporada = await getTemporadaById(temporadaId);
                    if (temporada) {
                        setFormData({
                            fecha_inicial: temporada.fecha_inicial,
                            fecha_final: temporada.fecha_final,
                        });
                    }
                } catch (error) {
                    console.error("Error al cargar temporada:", error);
                    toast.error("Error al cargar datos de la temporada");
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchTemporada();
        }
    }, [temporadaId, getTemporadaById]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value || undefined,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fecha_inicial) {
            toast.error("La fecha inicial es requerida");
            return;
        }

        if (formData.fecha_final && formData.fecha_inicial > formData.fecha_final) {
            toast.error("La fecha final debe ser posterior a la fecha inicial");
            return;
        }

        try {
            setLoading(true);
            let result;
            if (temporadaId) {
                result = await updateTemporada(temporadaId, formData);
            } else {
                result = await addTemporada(formData);
            }
            
            toast.success(result);
            
            if (onSuccess) {
                onSuccess();
            }

            if (!temporadaId) {
                setFormData({
                    fecha_inicial: formattedToday,
                    fecha_final: undefined,
                });
            }
        } catch (error) {
            console.error("Error en la operación de temporada:", error);
            toast.error(
                temporadaId
                    ? "Error al actualizar temporada. Inténtelo de nuevo."
                    : "Error al crear temporada. Inténtelo de nuevo."
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
                        Obteniendo información de la temporada
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información de la temporada...
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
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle>
                        {temporadaId ? "Editar Temporada" : "Nueva Temporada"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {temporadaId
                        ? "Actualiza la información de la temporada"
                        : "Ingresa las fechas para crear una nueva temporada"}
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-5">
                    <div className="space-y-1">
                        <Label htmlFor="fecha_inicial" className="text-sm font-medium">
                            Fecha Inicial *
                        </Label>
                        <Input
                            id="fecha_inicial"
                            name="fecha_inicial"
                            type="date"
                            value={formData.fecha_inicial}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="fecha_final" className="text-sm font-medium">
                            Fecha Final
                        </Label>
                        <Input
                            id="fecha_final"
                            name="fecha_final"
                            type="date"
                            value={formData.fecha_final || ""}
                            onChange={handleChange}
                        />
                        <p className="text-xs text-muted-foreground">
                            Opcional - Deja vacío si la temporada aún está activa
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-4 mt-4">
                    <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {temporadaId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Calendar className="mr-2 h-4 w-4" />
                                {temporadaId ? "Actualizar Temporada" : "Crear Temporada"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 