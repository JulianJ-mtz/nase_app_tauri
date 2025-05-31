"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Plus, Search, Edit, Trash2 } from "lucide-react";
import { TipoEmpaqueForm } from "@/components/forms";
import { obtenerTiposEmpaque, eliminarTipoEmpaque, type TipoEmpaque } from "@/api/tipo_empaque_api";
import { toast } from "sonner";
import { FormModal, DeleteConfirmationModal } from "@/components/modals";

export default function TiposEmpaquePage() {
    const [tiposEmpaque, setTiposEmpaque] = useState<TipoEmpaque[]>([]);
    const [filteredTiposEmpaque, setFilteredTiposEmpaque] = useState<TipoEmpaque[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTipoEmpaque, setEditingTipoEmpaque] = useState<TipoEmpaque | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tipoToDelete, setTipoToDelete] = useState<TipoEmpaque | null>(null);

    const fetchTiposEmpaque = async () => {
        try {
            setLoading(true);
            const data = await obtenerTiposEmpaque();
            setTiposEmpaque(data);
            setFilteredTiposEmpaque(data);
        } catch (error) {
            toast.error("Error al cargar tipos de empaque");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiposEmpaque();
    }, []);

    useEffect(() => {
        const filtered = tiposEmpaque.filter(tipo =>
            tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTiposEmpaque(filtered);
    }, [searchTerm, tiposEmpaque]);

    const handleEdit = (tipoEmpaque: TipoEmpaque) => {
        setEditingTipoEmpaque(tipoEmpaque);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await eliminarTipoEmpaque(id);
            toast.success("Tipo de empaque eliminado exitosamente");
            fetchTiposEmpaque();
        } catch (error) {
            toast.error("Error al eliminar tipo de empaque");
        }
    };

    const handleFormSuccess = () => {
        setDialogOpen(false);
        setEditingTipoEmpaque(null);
        fetchTiposEmpaque();
    };

    const handleNewTipoEmpaque = () => {
        setEditingTipoEmpaque(null);
        setDialogOpen(true);
    };

    const handleDeleteConfirmation = (tipo: TipoEmpaque) => {
        setTipoToDelete(tipo);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Tipos de Empaque</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra el catálogo de tipos de empaque
                    </p>
                </div>
                <Button onClick={handleNewTipoEmpaque}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Tipo de Empaque
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Lista de Tipos de Empaque
                    </CardTitle>
                    <CardDescription>
                        Total de tipos de empaque registrados: {tiposEmpaque.length}
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
                            <p className="text-muted-foreground">Cargando tipos de empaque...</p>
                        </div>
                    ) : filteredTiposEmpaque.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? "No se encontraron tipos de empaque" : "No hay tipos de empaque registrados"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTiposEmpaque.map((tipoEmpaque) => (
                                <Card key={tipoEmpaque.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{tipoEmpaque.nombre}</CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(tipoEmpaque)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteConfirmation(tipoEmpaque)}
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

            <FormModal
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={editingTipoEmpaque ? "Editar Tipo de Empaque" : "Nuevo Tipo de Empaque"}
                description={editingTipoEmpaque 
                    ? "Actualiza la información del tipo de empaque"
                    : "Ingresa los datos del nuevo tipo de empaque"}
                maxWidth="max-w-2xl"
            >
                <TipoEmpaqueForm
                    tipoEmpaqueId={editingTipoEmpaque?.id}
                    onSuccess={handleFormSuccess}
                />
            </FormModal>

            <DeleteConfirmationModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="¿Eliminar tipo de empaque?"
                itemName={tipoToDelete?.nombre}
                description="Esta acción no se puede deshacer. Se eliminará permanentemente el tipo de empaque."
                onConfirm={() => tipoToDelete && handleDelete(tipoToDelete.id)}
            />
        </div>
    );
} 