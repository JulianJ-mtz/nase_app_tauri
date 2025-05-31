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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { TemporadaForm } from "@/components/forms";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { toast } from "sonner";

export default function TemporadasPage() {
    const { temporadas, loading, fetchTemporadas, deleteTemporada } = useTemporadaStore();
    const [open, setOpen] = useState(false);
    const [editTemporadaId, setEditTemporadaId] = useState<number | undefined>(undefined);

    useEffect(() => {
        fetchTemporadas();
    }, [fetchTemporadas]);

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            setEditTemporadaId(undefined);
        }
    };

    const handleEditTemporada = (id: number) => {
        setEditTemporadaId(id);
        setOpen(true);
    };

    const handleDeleteTemporada = async (id: number) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta temporada?")) {
            try {
                await deleteTemporada(id);
                toast.success("Temporada eliminada correctamente");
            } catch (error) {
                console.error("Error eliminando temporada:", error);
                toast.error("No se pudo eliminar la temporada");
            }
        }
    };

    const handleFormSuccess = () => {
        setOpen(false);
        setEditTemporadaId(undefined);
        fetchTemporadas();
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Temporadas</h1>
                    <p className="text-muted-foreground">
                        Gestiona las temporadas de trabajo
                    </p>
                </div>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Temporada
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editTemporadaId ? "Editar Temporada" : "Nueva Temporada"}
                            </DialogTitle>
                        </DialogHeader>
                        <TemporadaForm
                            temporadaId={editTemporadaId}
                            onSuccess={handleFormSuccess}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Lista de Temporadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">Cargando temporadas...</p>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Fecha Inicial</TableHead>
                                    <TableHead>Fecha Final</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {temporadas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="flex flex-col items-center gap-2">
                                                <Calendar className="h-12 w-12 text-muted-foreground opacity-50" />
                                                <p className="text-muted-foreground">No hay temporadas registradas</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Crea la primera temporada para comenzar
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    temporadas.map((temporada) => {
                                        const isActive = !temporada.fecha_final || 
                                            new Date(temporada.fecha_final) >= new Date();
                                        
                                        return (
                                            <TableRow key={temporada.id}>
                                                <TableCell className="font-medium">
                                                    {temporada.id}
                                                </TableCell>
                                                <TableCell>
                                                    {temporada.fecha_inicial
                                                        ? format(new Date(temporada.fecha_inicial), "dd/MM/yyyy")
                                                        : "N/A"}
                                                </TableCell>
                                                <TableCell>
                                                    {temporada.fecha_final
                                                        ? format(new Date(temporada.fecha_final), "dd/MM/yyyy")
                                                        : "Sin finalizar"}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {isActive ? "Activa" : "Finalizada"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditTemporada(temporada.id)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleDeleteTemporada(temporada.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
