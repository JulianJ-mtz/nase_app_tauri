"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grape, Plus, Search, Edit, Trash2 } from "lucide-react";
import { TipoUvaForm } from "@/components/forms";
import { obtenerTiposUva, eliminarTipoUva, type TipoUva } from "@/api/tipo_uva_api";
import { toast } from "sonner";
import { FormModal, DeleteConfirmationModal } from "@/components/modals";

export default function TiposUvaPage() {
    const [tiposUva, setTiposUva] = useState<TipoUva[]>([]);
    const [filteredTiposUva, setFilteredTiposUva] = useState<TipoUva[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTipoUva, setEditingTipoUva] = useState<TipoUva | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tipoToDelete, setTipoToDelete] = useState<TipoUva | null>(null);

    const fetchTiposUva = async () => {
        try {
            setLoading(true);
            const data = await obtenerTiposUva();
            setTiposUva(data);
            setFilteredTiposUva(data);
        } catch (error) {
            toast.error("Error al cargar tipos de uva");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiposUva();
    }, []);

    useEffect(() => {
        const filtered = tiposUva.filter(tipo =>
            tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTiposUva(filtered);
    }, [searchTerm, tiposUva]);

    const handleEdit = (tipoUva: TipoUva) => {
        setEditingTipoUva(tipoUva);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await eliminarTipoUva(id);
            toast.success("Tipo de uva eliminado exitosamente");
            fetchTiposUva();
            setDeleteDialogOpen(false);
            setTipoToDelete(null);
        } catch (error) {
            toast.error("Error al eliminar tipo de uva");
        }
    };

    const handleFormSuccess = () => {
        setDialogOpen(false);
        setEditingTipoUva(null);
        fetchTiposUva();
    };

    const handleNewTipoUva = () => {
        setEditingTipoUva(null);
        setDialogOpen(true);
    };

    const handleDeleteConfirmation = (tipo: TipoUva) => {
        setTipoToDelete(tipo);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Tipos de Uva</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra el catálogo de tipos de uva disponibles
                    </p>
                </div>
                <Button onClick={handleNewTipoUva}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Tipo de Uva
                </Button>
                <FormModal
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    title={editingTipoUva ? "Editar Tipo de Uva" : "Nuevo Tipo de Uva"}
                    description={editingTipoUva 
                        ? "Actualiza la información del tipo de uva"
                        : "Ingresa los datos del nuevo tipo de uva"}
                    maxWidth="max-w-2xl"
                >
                    <TipoUvaForm
                        tipoUvaId={editingTipoUva?.id}
                        onSuccess={handleFormSuccess}
                    />
                </FormModal>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Grape className="h-5 w-5" />
                        Lista de Tipos de Uva
                    </CardTitle>
                    <CardDescription>
                        Total de tipos de uva registrados: {tiposUva.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Cargando tipos de uva...</p>
                        </div>
                    ) : filteredTiposUva.length === 0 ? (
                        <div className="text-center py-8">
                            <Grape className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? "No se encontraron tipos de uva" : "No hay tipos de uva registrados"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTiposUva.map((tipoUva) => (
                                <Card key={tipoUva.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{tipoUva.nombre}</CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(tipoUva)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteConfirmation(tipoUva)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DeleteConfirmationModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="¿Eliminar tipo de uva?"
                itemName={tipoToDelete?.nombre}
                description="Esta acción no se puede deshacer. Se eliminará permanentemente el tipo de uva."
                onConfirm={() => tipoToDelete && handleDelete(tipoToDelete.id)}
            />
        </div>
    );
} 