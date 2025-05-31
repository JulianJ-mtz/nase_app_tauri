"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Trash, AlertTriangle } from "lucide-react";
import { CuadrillaForm } from "@/components/forms/CuadrillaForm";
import { createColumns } from "./columsTableCuadrilla";
import { DataTableCuadrilla } from "./dataTableCuadrilla";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { CuadrillaJornaleros } from "@/components/CuadrillaJornaleros";
import { Spinner } from "@/components/ui/spinner";
import { 
    DeleteConfirmationModal, 
    CuadrillaViewModal,
    FormModal 
} from "@/components/modals";
import { Cuadrilla } from "@/api/cuadrilla_api";

export default function CuadrillasPage() {
    const {
        cuadrillas,
        fetchCuadrillas,
        loading,
        deleteCuadrilla,
        forceDeleteCuadrilla,
        getDeleteWarning,
        error,
    } = useCuadrillaStore();
    const { jornaleros, fetchJornaleros } = useJornaleroStore();
    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<
        number | null
    >(null);
    const [showJornalerosDialog, setShowJornalerosDialog] = useState(false);

    // Estados para edición
    const [selectedCuadrilla, setSelectedCuadrilla] = useState<Cuadrilla | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);

    // Estados para los diálogos de eliminación
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
    const [cuadrillaToDelete, setCuadrillaToDelete] = useState<number | null>(
        null
    );
    const [deleteWarning, setDeleteWarning] = useState<string>("");
    const [deleteError, setDeleteError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [requiresForceDelete, setRequiresForceDelete] =
        useState<boolean>(false);

    useEffect(() => {
        fetchCuadrillas();
        fetchJornaleros();
    }, [fetchCuadrillas, fetchJornaleros]);

    // Debug: Log cuadrillas data
    useEffect(() => {
        console.log("Cuadrillas data:", cuadrillas);
        console.log("Jornaleros data:", jornaleros);
        console.log("Loading:", loading);
        console.log("Error:", error);
    }, [cuadrillas, jornaleros, loading, error]);

    const handleViewJornaleros = (cuadrillaId: number) => {
        setSelectedCuadrillaId(cuadrillaId);
        setShowJornalerosDialog(true);
    };

    const handleEdit = (id: number) => {
        const cuadrilla = cuadrillas.find((c) => c.id === id);
        if (cuadrilla) {
            setSelectedCuadrilla(cuadrilla);
            setShowEditDialog(true);
        }
    };

    const handleDeleteClick = async (id: number) => {
        setCuadrillaToDelete(id);
        setDeleteError("");
        setSuccessMessage("");
        setDeleteWarning("");
        setRequiresForceDelete(false);

        try {
            // Obtener warning preventivo
            const warning = await getDeleteWarning(id);
            setDeleteWarning(warning);

            // Verificar si requiere eliminación forzada
            if (warning.includes("producción están asociados")) {
                setRequiresForceDelete(true);
                setForceDeleteDialogOpen(true);
            } else {
                setDeleteDialogOpen(true);
            }
        } catch (error) {
            console.error("Error al obtener warning:", error);
            setDeleteError("Error al verificar dependencias de la cuadrilla");
        }
    };

    const handleDeleteConfirm = async () => {
        if (!cuadrillaToDelete) return;

        try {
            console.log("Eliminando cuadrilla con ID:", cuadrillaToDelete);
            const result = await deleteCuadrilla(cuadrillaToDelete);
            console.log("Resultado de eliminación:", result);

            setDeleteDialogOpen(false);
            setCuadrillaToDelete(null);
            setDeleteWarning("");
            setDeleteError("");
            await fetchCuadrillas();
            await fetchJornaleros(); // Actualizar jornaleros también

            setSuccessMessage(result);
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error("Error al eliminar cuadrilla:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Error desconocido";
            setDeleteError(errorMessage);
        }
    };

    const handleForceDeleteConfirm = async () => {
        if (!cuadrillaToDelete) return;

        try {
            console.log(
                "Eliminación forzada de cuadrilla con ID:",
                cuadrillaToDelete
            );
            const result = await forceDeleteCuadrilla(cuadrillaToDelete);
            console.log("Resultado de eliminación forzada:", result);

            setForceDeleteDialogOpen(false);
            setCuadrillaToDelete(null);
            setDeleteWarning("");
            setDeleteError("");
            await fetchCuadrillas();
            await fetchJornaleros();

            setSuccessMessage(result);
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error("Error en eliminación forzada:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Error desconocido";
            setDeleteError(errorMessage);
        }
    };

    const columns = createColumns({
        handleEdit,
        handleDelete: handleDeleteClick,
        handleViewJornaleros,
        jornaleros,
    });

    return (
        <div className="container mx-auto py-10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cuadrillas</h1>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Cuadrilla
                </Button>
            </div>

            <div>
                <CuadrillaForm
                    onSuccess={() => {
                        fetchCuadrillas();
                        fetchJornaleros();
                    }}
                />
            </div>

            {/* Debug info */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Error: {error}
                </div>
            )}

            {/* Mensajes de éxito/error para eliminación */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage("")}
                        className="text-green-700 hover:text-green-900"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* DEBUG: Mostrar estados de modales
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded text-xs">
                <strong>DEBUG:</strong> deleteDialog:{" "}
                {deleteDialogOpen.toString()}, forceDialog:{" "}
                {forceDeleteDialogOpen.toString()}, cuadrilla:{" "}
                {cuadrillaToDelete}, warning: {deleteWarning}
            </div> */}

            {deleteError && !deleteDialogOpen && !forceDeleteDialogOpen && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
                    <span>{deleteError}</span>
                    <button
                        onClick={() => setDeleteError("")}
                        className="text-red-700 hover:text-red-900"
                    >
                        ×
                    </button>
                </div>
            )}

            <Card>
                <CardContent className="p-4">
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            {/* Debug: Show cuadrillas count */}
                            <div className="mb-4 text-sm text-gray-600">
                                Total cuadrillas: {cuadrillas.length} | Total
                                jornaleros: {jornaleros.length}
                            </div>
                            <DataTableCuadrilla
                                columns={columns}
                                data={cuadrillas}
                            />
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Modal for viewing cuadrilla jornaleros */}
            <CuadrillaViewModal
                open={showJornalerosDialog}
                onOpenChange={setShowJornalerosDialog}
                cuadrillaId={selectedCuadrillaId ?? undefined}
                onClose={() => setShowJornalerosDialog(false)}
            />

            {/* Modal for editing cuadrilla */}
            <FormModal
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                title="Editar Cuadrilla"
                description="Actualice la información de la cuadrilla"
                maxWidth="max-w-xl"
            >
                {selectedCuadrilla && (
                    <CuadrillaForm
                        cuadrillaId={selectedCuadrilla.id}
                        onSuccess={() => {
                            fetchCuadrillas();
                            fetchJornaleros();
                            setShowEditDialog(false);
                        }}
                    />
                )}
            </FormModal>

            {/* Modal for deleting cuadrilla */}
            <DeleteConfirmationModal
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Confirmar Eliminación"
                description="¿Estás seguro de que deseas eliminar esta cuadrilla?"
                warning={deleteWarning}
                error={deleteError}
                onConfirm={handleDeleteConfirm}
            />

            {/* Modal for force deleting cuadrilla */}
            <DeleteConfirmationModal
                open={forceDeleteDialogOpen}
                onOpenChange={setForceDeleteDialogOpen}
                title="Eliminación Forzada Requerida"
                description="Esta cuadrilla tiene dependencias que requieren eliminación forzada. Esto eliminará todas las dependencias asociadas."
                warning={deleteWarning}
                error={deleteError}
                onConfirm={handleForceDeleteConfirm}
            />
        </div>
    );
}
