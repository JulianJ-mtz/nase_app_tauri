"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, Plus, Search, Edit, Trash2 } from "lucide-react";
import { ClienteForm } from "@/components/forms";
import { obtenerClientes, eliminarCliente, type Cliente } from "@/api/cliente_api";
import { toast } from "sonner";
import { FormModal, DeleteConfirmationModal } from "@/components/modals";

export default function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

    const fetchClientes = async () => {
        try {
            setLoading(true);
            const data = await obtenerClientes();
            setClientes(data);
            setFilteredClientes(data);
        } catch (error) {
            toast.error("Error al cargar clientes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    useEffect(() => {
        const filtered = clientes.filter(cliente =>
            cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.codigo.toString().includes(searchTerm)
        );
        setFilteredClientes(filtered);
    }, [searchTerm, clientes]);

    const handleEdit = (cliente: Cliente) => {
        setEditingCliente(cliente);
        setDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await eliminarCliente(id);
            toast.success("Cliente eliminado exitosamente");
            fetchClientes();
            setDeleteDialogOpen(false);
            setClienteToDelete(null);
        } catch (error) {
            toast.error("Error al eliminar cliente");
        }
    };

    const handleFormSuccess = () => {
        setDialogOpen(false);
        setEditingCliente(null);
        fetchClientes();
    };

    const handleNewCliente = () => {
        setEditingCliente(null);
        setDialogOpen(true);
    };

    const handleDeleteConfirmation = (cliente: Cliente) => {
        setClienteToDelete(cliente);
        setDeleteDialogOpen(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
                    <p className="text-muted-foreground mt-2">
                        Administra el catálogo de clientes y empresas
                    </p>
                </div>
                <Button onClick={handleNewCliente}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Lista de Clientes
                    </CardTitle>
                    <CardDescription>
                        Total de clientes registrados: {clientes.length}
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
                            <p className="text-muted-foreground">Cargando clientes...</p>
                        </div>
                    ) : filteredClientes.length === 0 ? (
                        <div className="text-center py-8">
                            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                {searchTerm ? "No se encontraron clientes" : "No hay clientes registrados"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredClientes.map((cliente) => (
                                <Card key={cliente.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{cliente.nombre}</CardTitle>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(cliente)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteConfirmation(cliente)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardDescription>
                                            Código: {cliente.codigo}
                                        </CardDescription>
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
                title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"}
                description={editingCliente 
                    ? "Actualiza la información del cliente"
                    : "Ingresa los datos del nuevo cliente"}
                maxWidth="max-w-2xl"
            >
                <ClienteForm
                    clienteId={editingCliente?.id}
                    onSuccess={handleFormSuccess}
                />
            </FormModal>

            <DeleteConfirmationModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="¿Eliminar cliente?"
                itemName={clienteToDelete?.nombre}
                description="Esta acción no se puede deshacer. Se eliminará permanentemente el cliente."
                onConfirm={() => clienteToDelete && handleDelete(clienteToDelete.id)}
            />
        </div>
    );
} 