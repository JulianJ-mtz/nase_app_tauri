"use client";

import { Cuadrilla } from "@/api/cuadrilla_api";
import { Jornalero } from "@/api/jornalero_api";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash, Users } from "lucide-react";

interface ColumnHandlers {
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
    handleViewJornaleros?: (id: number) => void;
    jornaleros: Jornalero[];
}

export const createColumns = ({
    handleEdit,
    handleDelete,
    handleViewJornaleros,
    jornaleros,
}: ColumnHandlers): ColumnDef<Cuadrilla>[] => {
    // Helper function to get leader name
    const getLiderName = (liderId: number | null) => {
        if (!liderId) return "Sin líder";
        const lider = jornaleros.find((j) => j.id === liderId);
        return lider ? lider.nombre : `ID: ${liderId}`;
    };

    return [
        {
            accessorKey: "id",
            header: "ID",
            cell: ({ row }) => (
                <div className="text-center">{row.original.id}</div>
            ),
        },
        {
            accessorKey: "lider_cuadrilla_id",
            header: "Líder",
            cell: ({ row }) => (
                <div className="font-medium">
                    {getLiderName(row.original.lider_cuadrilla_id)}
                </div>
            ),
        },
        {
            accessorKey: "lote",
            header: "Lote",
            cell: ({ row }) => <div>{row.original.lote}</div>,
        },
        {
            accessorKey: "variedad_id",
            header: "Variedad (ID)",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.variedad_id || "Sin variedad"}
                </div>
            ),
        },
        {
            accessorKey: "temporada_id",
            header: "Temporada (ID)",
            cell: ({ row }) => (
                <div className="text-center">
                    {row.original.temporada_id || "Sin temporada"}
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: "Fecha Creación",
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.created_at
                        ? new Date(row.original.created_at).toLocaleDateString()
                        : "N/A"}
                </div>
            ),
        },
        {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
                <div className="flex flex-row gap-2">
                    {handleViewJornaleros && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                                handleViewJornaleros(row.original.id)
                            }
                            title="Ver jornaleros"
                        >
                            <Users className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(row.original.id)}
                        title="Editar"
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(row.original.id)}
                        title="Eliminar"
                    >
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ];
};
