"use client";

import { useState, useEffect } from "react";
import type { JornaleroData } from "@/lib/api";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useJornaleroStore } from "@/lib/store";

interface JornaleroFormProps {
    jornaleroId?: number;
    onSuccess?: () => void;
}

export function JornaleroForm({ jornaleroId, onSuccess }: JornaleroFormProps) {
    const { addJornalero, updateJornalero, getJornaleroById } = useJornaleroStore();
    const [formData, setFormData] = useState<JornaleroData>({
        nombre: "",
        edad: 18,
        produccion: null,
        errores: 0,
        activo: true,
    });
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    // Efecto para cargar datos del jornalero si se proporciona un ID
    useEffect(() => {
        if (jornaleroId) {
            const fetchJornalero = async () => {
                try {
                    setFetchLoading(true);
                    const jornalero = await getJornaleroById(jornaleroId);
                    
                    if (jornalero) {
                        setFormData({
                            nombre: jornalero.nombre,
                            edad: jornalero.edad,
                            produccion: jornalero.produccion,
                            errores: jornalero.errores,
                            activo: jornalero.activo === null ? true : jornalero.activo,
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
    }, [jornaleroId, getJornaleroById]);

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

    const handleCheckboxChange = (checked: boolean) => {
        setFormData({
            ...formData,
            activo: checked,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica
        if (!formData.nombre.trim()) {
            toast.error("El nombre es requerido");
            return;
        }

        if (formData.edad < 16) {
            toast.error("La edad debe ser al menos 16 años");
            return;
        }

        try {
            // Iniciar carga
            setLoading(true);

            console.log("Enviando datos al servidor:", formData);

            let result;
            // Usar la función correcta según si es creación o actualización
            if (jornaleroId) {
                // Actualizar jornalero existente
                result = await updateJornalero(jornaleroId, formData);
            } else {
                // Insertar nuevo jornalero
                result = await addJornalero(formData);
            }

            console.log("Respuesta del servidor:", result);

            // Mostrar mensaje de éxito
            toast.success(result);

            // Llamar al callback de éxito si existe
            if (onSuccess) {
                onSuccess();
            }

            // Si no hay un ID, resetear el formulario (solo para creación)
            if (!jornaleroId) {
                // Pequeño retraso antes de resetear
                await new Promise((resolve) => setTimeout(resolve, 500));

                // Resetear formulario
                setFormData({
                    nombre: "",
                    edad: 18,
                    produccion: null,
                    errores: 0,
                    activo: true,
                });
            }
        } catch (error) {
            console.error("Error completo:", error);
            toast.error(jornaleroId 
                ? "Error al actualizar jornalero. Inténtelo de nuevo." 
                : "Error al insertar jornalero. Inténtelo de nuevo."
            );
        } finally {
            // Finalizar carga
            setLoading(false);
        }
    };

    // Mostrar carga durante la obtención de datos
    if (fetchLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Cargando datos...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center py-6">
                        <div className="animate-pulse">Cargando información del jornalero...</div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{jornaleroId ? "Editar Jornalero" : "Nuevo Jornalero"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            placeholder="Nombre del jornalero"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edad">Edad</Label>
                        <Input
                            id="edad"
                            name="edad"
                            type="number"
                            min={16}
                            value={formData.edad}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="produccion">
                            Producción (opcional)
                        </Label>
                        <Input
                            id="produccion"
                            name="produccion"
                            type="number"
                            min={0}
                            value={
                                formData.produccion === null
                                    ? ""
                                    : formData.produccion
                            }
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="errores">Errores</Label>
                        <Input
                            id="errores"
                            name="errores"
                            type="number"
                            min={0}
                            value={formData.errores}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="activo"
                            checked={formData.activo === true}
                            onCheckedChange={handleCheckboxChange}
                        />
                        <Label htmlFor="activo">Activo</Label>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : jornaleroId ? "Actualizar Jornalero" : "Guardar Jornalero"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
