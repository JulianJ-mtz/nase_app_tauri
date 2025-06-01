"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Grape } from "lucide-react";
import {
    Variedad,
    obtenerVariedades,
    eliminarVariedad,
} from "@/api/variedad_api";
import { toast } from "sonner";
import { FormModal, DeleteConfirmationModal } from "@/components/modals";
import { VariedadForm } from "@/components/forms";

export default function VariedadesPage() {
    const [variedades, setVariedades] = useState<Variedad[]>([]);
    const [filteredVariedades, setFilteredVariedades] = useState<Variedad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVariedad, setEditingVariedad] = useState<Variedad | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [variedadToDelete, setVariedadToDelete] = useState<Variedad | null>(null);

    const fetchVariedades = async () => {
        try {
            setLoading(true);
            const data = await obtenerVariedades();
            setVariedades(data);
            setFilteredVariedades(data);
        } catch (error) {
            console.error("Error cargando variedades:", error);
            toast.error("Error al cargar variedades");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVariedades();
    }, []);

    useEffect(() => {
        const filtered = variedades.filter(variedad =>
            variedad.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            variedad.codigo.toString().includes(searchTerm)
        );
        setFilteredVariedades(filtered);
    }, [searchTerm, variedades]);

    const handleEdit = (variedad: Variedad) => {
        setEditingVariedad(variedad);
        setDialogOpen(true);
    };

    const handleNewVariedad = () => {
        setEditingVariedad(null);
        setDialogOpen(true);
    };

    const handleFormSuccess = () => {
        setDialogOpen(false);
        setEditingVariedad(null);
        fetchVariedades();
    };

    const handleDelete = async (id: number) => {
        try {
            await eliminarVariedad(id);
            toast.success("Variedad eliminada exitosamente");
            fetchVariedades();
            setDeleteDialogOpen(false);
            setVariedadToDelete(null);
        } catch (error) {
            console.error("Error eliminando variedad:", error);
            toast.error("Error al eliminar variedad");
        }
    };

    const handleDeleteConfirmation = (variedad: Variedad) => {
        setVariedadToDelete(variedad);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Variedades</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra el catálogo de variedades de uva
                    </p>
                </div>
                <Button onClick={handleNewVariedad}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Variedad
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Grape className="h-5 w-5" />
                        Lista de Variedades
                    </CardTitle>
                    <CardDescription>
                        Total de variedades registradas: {variedades.length}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">Cargando variedades...</p>
                        </div>
                    ) : filteredVariedades.length === 0 ? (
                        <div className="text-center py-8">
                            <Grape className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? "No se encontraron variedades" : "No hay variedades registradas"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredVariedades.map((variedad) => (
                                <Card key={variedad.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{variedad.nombre}</CardTitle>
                                                <p className="text-sm text-muted-foreground">Código: {variedad.codigo}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(variedad)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteConfirmation(variedad)}
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

            {/* Modals */}
            <FormModal
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title={editingVariedad ? "Editar Variedad" : "Nueva Variedad"}
                description={editingVariedad 
                    ? "Actualiza la información de la variedad"
                    : "Ingresa los datos de la nueva variedad"}
                maxWidth="max-w-2xl"
            >
                <VariedadForm
                    variedadId={editingVariedad?.id}
                    onSuccess={handleFormSuccess}
                />
            </FormModal>

            <DeleteConfirmationModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="¿Eliminar variedad?"
                itemName={variedadToDelete?.nombre}
                description="Esta acción no se puede deshacer. Se eliminará permanentemente la variedad."
                onConfirm={() => variedadToDelete && handleDelete(variedadToDelete.id)}
            />
        </div>
    );
}
