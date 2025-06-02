"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { CuadrillaForm } from "@/components/forms/CuadrillaForm";
import { createColumns } from "./columsTableCuadrilla";
import { DataTable } from "@/components/ui/data-table";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useJornaleroStore } from "@/lib/storeJornalero";
import {
    DeleteConfirmationModal,
    CuadrillaViewModal,
    FormModal,
} from "@/components/modals";
import { PageLayout, FormSection, DataSection } from "@/components/layout";
import { useCrudOperations } from "@/hooks/useCrudOperations";
import { Cuadrilla } from "@/api/cuadrilla_api";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { obtenerVariedades, Variedad } from "@/api/variedad_api";
import { CuadrillaFilters } from "./CuadrillaFilters";

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
    const { temporadas } = useTemporadaStore();
    const [variedades, setVariedades] = useState<Variedad[]>([]);

    const [selectedCuadrillaId, setSelectedCuadrillaId] = useState<
        number | null
    >(null);
    const [showJornalerosDialog, setShowJornalerosDialog] = useState(false);

    // Estados para filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTemporadaFilter, setSelectedTemporadaFilter] =
        useState<string>("all");
    const [selectedVariedadFilter, setSelectedVariedadFilter] =
        useState<string>("all");

    // Estados para los diálogos de eliminación
    const [forceDeleteDialogOpen, setForceDeleteDialogOpen] = useState(false);
    const [deleteWarning, setDeleteWarning] = useState<string>("");
    const [deleteError, setDeleteError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [requiresForceDelete, setRequiresForceDelete] =
        useState<boolean>(false);

    const crud = useCrudOperations<Cuadrilla>({
        fetchData: async () => {
            await fetchCuadrillas();
            await fetchJornaleros();
            const variedades = await obtenerVariedades();
            setVariedades(variedades);
        },
        deleteFunction: async (id: number) => {
            // Limpiar estados de operaciones anteriores
            setDeleteWarning("");
            setDeleteError("");
            setRequiresForceDelete(false);

            try {
                const warning = await getDeleteWarning(id);
                setDeleteWarning(warning);

                if (warning.includes("producción están asociados")) {
                    setRequiresForceDelete(true);
                    setForceDeleteDialogOpen(true);
                    console.log("Requiere eliminación forzada");
                } else {
                    return await deleteCuadrilla(id);
                }
            } catch (error) {
                throw error;
            }
        },
        entityName: "Cuadrilla",
    });

    useEffect(() => {
        crud.handleFormSuccess();
    }, []);

    // Helper functions para filtrado
    const getLiderName = useCallback(
        (liderId: number | null) => {
            if (!liderId) return "";
            const lider = jornaleros.find((j) => j.id === liderId);
            return lider ? lider.nombre : "";
        },
        [jornaleros]
    );

    const getVariedadNombre = useCallback(
        (cuadrilla: Cuadrilla) => {
            if (!cuadrilla || !cuadrilla.variedad_id) return "";
            const variedad = variedades.find(
                (v) => v.id === cuadrilla.variedad_id
            );
            return variedad ? variedad.nombre : "";
        },
        [variedades]
    );

    // Datos filtrados con useMemo
    const filteredCuadrillas = useMemo(() => {
        if (!cuadrillas || cuadrillas.length === 0) return [];

        return cuadrillas.filter((cuadrilla) => {
            const liderNombre = getLiderName(
                cuadrilla.lider_cuadrilla_id
            ).toLowerCase();
            const variedadNombre = getVariedadNombre(cuadrilla).toLowerCase();
            const lote = cuadrilla.lote?.toLowerCase() || "";
            const cuadrillaId = cuadrilla.id.toString();

            const matchesSearch =
                searchTerm === "" ||
                lote.includes(searchTerm.toLowerCase()) ||
                liderNombre.includes(searchTerm.toLowerCase()) ||
                variedadNombre.includes(searchTerm.toLowerCase()) ||
                cuadrillaId.includes(searchTerm);

            const matchesTemporada =
                selectedTemporadaFilter === "all" ||
                cuadrilla.temporada_id?.toString() === selectedTemporadaFilter;

            const matchesVariedad =
                selectedVariedadFilter === "all" ||
                (selectedVariedadFilter === "sin_variedad" &&
                    !cuadrilla.variedad_id) ||
                cuadrilla.variedad_id?.toString() === selectedVariedadFilter;

            const today = new Date();

            let matchesDate = true;

            return (
                matchesSearch &&
                matchesTemporada &&
                matchesVariedad &&
                matchesDate
            );
        });
    }, [
        cuadrillas,
        searchTerm,
        selectedTemporadaFilter,
        selectedVariedadFilter,
        getLiderName,
        getVariedadNombre,
    ]);

    const handleViewJornaleros = (cuadrillaId: number) => {
        setSelectedCuadrillaId(cuadrillaId);
        setShowJornalerosDialog(true);
    };

    // Función personalizada para manejar el cierre del modal de eliminación
    const handleDeleteModalChange = (open: boolean) => {
        crud.setShowDeleteDialog(open);
        if (!open) {
            // Limpiar estados cuando se cierra el modal
            setDeleteWarning("");
            setDeleteError("");
            setRequiresForceDelete(false);
        }
    };

    // Función personalizada para manejar el cierre del modal de eliminación forzada
    const handleForceDeleteModalChange = (open: boolean) => {
        setForceDeleteDialogOpen(open);
        if (!open) {
            // Limpiar estados cuando se cierra el modal
            setDeleteWarning("");
            setDeleteError("");
            setRequiresForceDelete(false);
        }
    };

    const handleForceDeleteConfirm = async () => {
        if (!crud.entityToDelete) return;

        try {
            const result = await forceDeleteCuadrilla(crud.entityToDelete.id);
            setForceDeleteDialogOpen(false);
            crud.setEntityToDelete(null);
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
        handleEdit: (id: number) => {
            const cuadrilla = cuadrillas.find((c) => c.id === id);
            if (cuadrilla) crud.handleEdit(cuadrilla);
        },
        handleDelete: (id: number) => {
            const cuadrilla = cuadrillas.find((c) => c.id === id);
            if (cuadrilla) crud.handleDelete(cuadrilla);
        },
        handleViewJornaleros,
        jornaleros,
        temporadas,
        variedades,
    });

    // Calculate stats
    const jornalerosAsignados = jornaleros.filter(
        (j) => j.cuadrilla_id !== null
    ).length;
    const cuadrillasConLider = filteredCuadrillas.filter(
        (c) => c.lider_cuadrilla_id !== null
    ).length;

    const tabs = [
        {
            value: "lista",
            label: "Lista de Cuadrillas",
            content: (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <FormSection
                        title="Crear Nueva Cuadrilla"
                        description="Registra una nueva cuadrilla en el sistema"
                        className="lg:col-span-1"
                    >
                        <CuadrillaForm onSuccess={crud.handleFormSuccess} />
                    </FormSection>

                    <DataSection
                        title="Cuadrillas Registradas"
                        description={`${filteredCuadrillas.length} de ${cuadrillas.length} cuadrillas`}
                        className="lg:col-span-2"
                    >
                        <CuadrillaFilters
                            searchTerm={searchTerm}
                            selectedTemporadaFilter={selectedTemporadaFilter}
                            selectedVariedadFilter={selectedVariedadFilter}
                            temporadas={temporadas}
                            variedades={variedades}
                            onSearchChange={setSearchTerm}
                            onTemporadaFilterChange={setSelectedTemporadaFilter}
                            onVariedadFilterChange={setSelectedVariedadFilter}
                        />

                        <DataTable
                            columns={columns}
                            data={filteredCuadrillas}
                            emptyMessage="No hay cuadrillas registradas"
                            showSearch={false}
                        />
                    </DataSection>
                </div>
            ),
        },
        {
            value: "stats",
            label: "Estadísticas",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DataSection
                        title="Total Cuadrillas"
                        description="Cuadrillas registradas"
                    >
                        <div className="text-3xl font-bold text-blue-600">
                            {cuadrillas.length}
                        </div>
                    </DataSection>

                    <DataSection
                        title="Con Líder Asignado"
                        description="Cuadrillas con liderazgo"
                    >
                        <div className="text-3xl font-bold text-green-600">
                            {cuadrillasConLider}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            {filteredCuadrillas.length > 0
                                ? `${(
                                      (cuadrillasConLider /
                                          filteredCuadrillas.length) *
                                      100
                                  ).toFixed(1)}% del total filtrado`
                                : "0% del total"}
                        </div>
                    </DataSection>

                    <DataSection
                        title="Jornaleros Asignados"
                        description="Total en cuadrillas"
                    >
                        <div className="text-3xl font-bold text-purple-600">
                            {jornalerosAsignados}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            Jornaleros distribuidos en cuadrillas
                        </div>
                    </DataSection>

                    <DataSection
                        title="Promedio por Cuadrilla"
                        description="Jornaleros por cuadrilla"
                        className="md:col-span-3"
                    >
                        <div className="text-3xl font-bold text-orange-600">
                            {filteredCuadrillas.length > 0
                                ? (
                                      jornalerosAsignados /
                                      filteredCuadrillas.length
                                  ).toFixed(1)
                                : 0}
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                            Promedio de jornaleros por cuadrilla filtrada
                        </div>
                    </DataSection>
                </div>
            ),
        },
    ];

    return (
        <>
            <PageLayout
                title="Gestión de Cuadrillas"
                description="Administre cuadrillas y asigne jornaleros"
                tabs={tabs}
                defaultTab="lista"
                errors={error ? [error] : []}
                success={successMessage ? [successMessage] : []}
            >
                <div />
            </PageLayout>

            {/* Modals */}
            <DeleteConfirmationModal
                open={crud.showDeleteDialog}
                onOpenChange={handleDeleteModalChange}
                title="Confirmar Eliminación"
                itemName={
                    crud.entityToDelete
                        ? `Cuadrilla ${crud.entityToDelete.id}`
                        : undefined
                }
                description="¿Estás seguro de que deseas eliminar esta cuadrilla?"
                permanentDelete
                warning={deleteWarning}
                error={deleteError}
                onConfirm={crud.confirmDelete}
                loading={crud.isDeleting}
            />

            <FormModal
                open={crud.showEditDialog}
                onOpenChange={crud.setShowEditDialog}
                title="Editar Cuadrilla"
                description="Actualice la información de la cuadrilla"
                maxWidth="max-w-xl"
            >
                {crud.selectedEntity && (
                    <CuadrillaForm
                        cuadrillaId={crud.selectedEntity.id}
                        onSuccess={crud.handleFormSuccess}
                    />
                )}
            </FormModal>

            <CuadrillaViewModal
                open={showJornalerosDialog}
                onOpenChange={setShowJornalerosDialog}
                cuadrillaId={selectedCuadrillaId ?? undefined}
                onClose={() => setShowJornalerosDialog(false)}
            />

            {/* Modal for force deleting cuadrilla */}
            <DeleteConfirmationModal
                open={forceDeleteDialogOpen}
                onOpenChange={handleForceDeleteModalChange}
                title="Eliminación Forzada Requerida"
                description="Esta cuadrilla tiene dependencias que requieren eliminación forzada. Esto eliminará todas las dependencias asociadas."
                warning={deleteWarning}
                error={deleteError}
                onConfirm={handleForceDeleteConfirm}
            />
        </>
    );
}
