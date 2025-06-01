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
import { Loader2, Building } from "lucide-react";
import { insertarCliente, actualizarCliente, obtenerClientePorId, type ClienteData } from "@/api/cliente_api";

interface ClienteFormProps {
    clienteId?: number;
    onSuccess?: () => void;
}

export function ClienteForm({ clienteId, onSuccess }: ClienteFormProps) {
    const [formData, setFormData] = useState<ClienteData>({
        codigo: 0,
        nombre: "",
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);

    useEffect(() => {
        if (clienteId) {
            const fetchCliente = async () => {
                try {
                    setFetchLoading(true);
                    const cliente = await obtenerClientePorId(clienteId);
                    if (cliente) {
                        setFormData({
                            codigo: cliente.codigo,
                            nombre: cliente.nombre,
                        });
                    }
                } catch (error) {
                    console.error("Error al cargar cliente:", error);
                    toast.error("Error al cargar datos del cliente");
                } finally {
                    setFetchLoading(false);
                }
            };
            fetchCliente();
        }
    }, [clienteId]);

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
            if (clienteId) {
                result = await actualizarCliente(clienteId, formData);
            } else {
                result = await insertarCliente(formData);
            }
            
            toast.success(result);
            
            if (onSuccess) {
                onSuccess();
            }

            if (!clienteId) {
                setFormData({
                    codigo: 0,
                    nombre: "",
                });
            }
        } catch (error) {
            console.error("Error en la operación de cliente:", error);
            toast.error(
                clienteId
                    ? "Error al actualizar cliente. Inténtelo de nuevo."
                    : "Error al crear cliente. Inténtelo de nuevo."
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
                        Obteniendo información del cliente
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Cargando información del cliente...
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
                    <Building className="h-5 w-5 text-primary" />
                    <CardTitle>
                        {clienteId ? "Editar Cliente" : "Nuevo Cliente"}
                    </CardTitle>
                </div>
                <CardDescription>
                    {clienteId
                        ? "Actualiza la información del cliente"
                        : "Ingresa los datos para registrar un nuevo cliente"}
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
                                placeholder="Código del cliente"
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
                                placeholder="Nombre del cliente"
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
                                {clienteId ? "Actualizando..." : "Creando..."}
                            </>
                        ) : (
                            <>
                                <Building className="mr-2 h-4 w-4" />
                                {clienteId ? "Actualizar Cliente" : "Crear Cliente"}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
} 