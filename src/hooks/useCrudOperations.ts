"use client";

import { useState } from "react";
import { toast } from "sonner";

interface CrudEntity {
    id: number;
    [key: string]: any;
}

interface CrudOperationsProps<T extends CrudEntity> {
    fetchData: () => Promise<void>;
    deleteFunction: (id: number) => Promise<void | string>;
    reactivateFunction?: (id: number) => Promise<void | string>;
    entityName: string;
    entityNamePlural?: string;
}

export function useCrudOperations<T extends CrudEntity>({
    fetchData,
    deleteFunction,
    reactivateFunction,
    entityName,
    entityNamePlural,
}: CrudOperationsProps<T>) {
    // Modal states
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showReactivateDialog, setShowReactivateDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);

    // Entity states
    const [selectedEntity, setSelectedEntity] = useState<T | null>(null);
    const [entityToDelete, setEntityToDelete] = useState<T | null>(null);
    const [entityToReactivate, setEntityToReactivate] = useState<T | null>(null);

    // Loading states
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReactivating, setIsReactivating] = useState(false);

    const handleEdit = (entity: T) => {
        setSelectedEntity(entity);
        setShowEditDialog(true);
    };

    const handleDelete = (entity: T) => {
        setEntityToDelete(entity);
        setShowDeleteDialog(true);
    };

    const handleReactivate = (entity: T) => {
        if (!reactivateFunction) return;
        setEntityToReactivate(entity);
        setShowReactivateDialog(true);
    };

    const handleView = (entity: T) => {
        setSelectedEntity(entity);
        setShowViewDialog(true);
    };

    const confirmDelete = async () => {
        if (!entityToDelete) return;
        
        setIsDeleting(true);
        try {
            const result = await deleteFunction(entityToDelete.id);
            const message = typeof result === 'string' ? result : `${entityName} eliminado con éxito`;
            toast.success(message);
            setShowDeleteDialog(false);
            setEntityToDelete(null);
            await fetchData();
        } catch (error) {
            console.error(`Error al eliminar ${entityName}:`, error);
            const errorMessage = typeof error === 'string' ? error : 
                               (error as any)?.message || `Error al eliminar ${entityName}`;
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const confirmReactivate = async () => {
        if (!entityToReactivate || !reactivateFunction) return;
        
        setIsReactivating(true);
        try {
            const result = await reactivateFunction(entityToReactivate.id);
            const message = typeof result === 'string' ? result : `${entityName} reactivado con éxito`;
            toast.success(message);
            setShowReactivateDialog(false);
            setEntityToReactivate(null);
            await fetchData();
        } catch (error) {
            console.error(`Error al reactivar ${entityName}:`, error);
            const errorMessage = typeof error === 'string' ? error : 
                               (error as any)?.message || `Error al reactivar ${entityName}`;
            toast.error(errorMessage);
        } finally {
            setIsReactivating(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
        setEntityToDelete(null);
    };

    const cancelReactivate = () => {
        setShowReactivateDialog(false);
        setEntityToReactivate(null);
    };

    const closeEdit = () => {
        setShowEditDialog(false);
        setSelectedEntity(null);
    };

    const closeView = () => {
        setShowViewDialog(false);
        setSelectedEntity(null);
    };

    const handleFormSuccess = async () => {
        await fetchData();
        closeEdit();
        toast.success(`${entityName} guardado con éxito`);
    };

    const handleDataRefresh = async () => {
        try {
            await fetchData();
        } catch (error) {
            console.error(`Error al actualizar datos:`, error);
        }
    };

    return {
        // States
        showEditDialog,
        showDeleteDialog,
        showReactivateDialog,
        showViewDialog,
        selectedEntity,
        entityToDelete,
        entityToReactivate,
        isDeleting,
        isReactivating,

        // Handlers
        handleEdit,
        handleDelete,
        handleReactivate,
        handleView,
        confirmDelete,
        confirmReactivate,
        cancelDelete,
        cancelReactivate,
        closeEdit,
        closeView,
        handleFormSuccess,
        handleDataRefresh,

        // Setters for manual control if needed
        setShowEditDialog,
        setShowDeleteDialog,
        setShowReactivateDialog,
        setShowViewDialog,
        setSelectedEntity,
        setEntityToDelete,
        setEntityToReactivate,
    };
} 