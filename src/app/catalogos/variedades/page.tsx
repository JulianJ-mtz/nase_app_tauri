"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Variedad,
    VariedadData,
    obtenerVariedades,
    insertarVariedad,
    actualizarVariedad,
    eliminarVariedad,
} from "@/api/variedad_api";
import { toast } from "@/components/ui/use-toast";

export default function VariedadesPage() {
    const [variedades, setVariedades] = useState<Variedad[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentVariedad, setCurrentVariedad] = useState<Variedad | null>(
        null
    );

    // Form state
    const [codigo, setCodigo] = useState<number | undefined>(undefined);
    const [nombre, setNombre] = useState("");

    useEffect(() => {
        loadVariedades();
    }, []);

    const loadVariedades = async () => {
        try {
            setLoading(true);
            const data = await obtenerVariedades();
            setVariedades(data);
        } catch (error) {
            console.error("Error cargando variedades:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las variedades",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCodigo(undefined);
        setNombre("");
        setCurrentVariedad(null);
        setEditMode(false);
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            resetForm();
        }
    };

    const handleEditVariedad = (variedad: Variedad) => {
        setCurrentVariedad(variedad);
        setCodigo(variedad.codigo);
        setNombre(variedad.nombre);
        setEditMode(true);
        setOpen(true);
    };

    const handleDeleteVariedad = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta variedad?")) {
            try {
                await eliminarVariedad(id);
                toast({
                    title: "Éxito",
                    description: "Variedad eliminada correctamente",
                });
                loadVariedades();
            } catch (error) {
                console.error("Error eliminando variedad:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo eliminar la variedad",
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!codigo || !nombre) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Todos los campos son obligatorios",
            });
            return;
        }

        const variedadData: VariedadData = {
            codigo,
            nombre,
        };

        try {
            if (editMode && currentVariedad) {
                await actualizarVariedad(currentVariedad.id, variedadData);
                toast({
                    title: "Éxito",
                    description: "Variedad actualizada correctamente",
                });
            } else {
                await insertarVariedad(variedadData);
                toast({
                    title: "Éxito",
                    description: "Variedad creada correctamente",
                });
            }

            setOpen(false);
            resetForm();
            loadVariedades();
        } catch (error) {
            console.error("Error guardando variedad:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo guardar la variedad",
            });
        }
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Variedades</h1>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>Nueva Variedad</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editMode
                                    ? "Editar Variedad"
                                    : "Nueva Variedad"}
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código *</Label>
                                <Input
                                    id="codigo"
                                    type="number"
                                    value={codigo ?? ""}
                                    onChange={(e) =>
                                        setCodigo(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : undefined
                                        )
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nombre">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editMode ? "Actualizar" : "Crear"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Variedades</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            Cargando...
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Código</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variedades.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            className="text-center"
                                        >
                                            No hay variedades registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    variedades.map((variedad) => (
                                        <TableRow key={variedad.id}>
                                            <TableCell>{variedad.id}</TableCell>
                                            <TableCell>
                                                {variedad.codigo}
                                            </TableCell>
                                            <TableCell>
                                                {variedad.nombre}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditVariedad(
                                                                variedad
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteVariedad(
                                                                variedad.id
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
