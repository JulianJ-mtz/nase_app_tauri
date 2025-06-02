"use client";

import { Cuadrilla } from "@/api/cuadrilla_api";
import { Jornalero } from "@/api/jornalero_api";
import { Temporada } from "@/api/temporada_api";
import { Variedad } from "@/api/variedad_api";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCallback } from "react";
import { formatCreatedAt } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface ColumnHandlers {
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
    handleViewJornaleros?: (id: number) => void;
    jornaleros: Jornalero[];
    temporadas: Temporada[];
    variedades: Variedad[];
}

export const createColumns = ({
    handleEdit,
    handleDelete,
    handleViewJornaleros,
    jornaleros,
    temporadas,
    variedades,
}: ColumnHandlers): ColumnDef<Cuadrilla>[] => {
    
    
    const getDate = useCallback(
        (dateString: string | null) => {
            return formatCreatedAt(dateString);
        },
        []
    );
    
    
    const getLiderName = useCallback(
        (liderId: number | null) => {
            if (!liderId) return "Sin líder";
            const lider = jornaleros.find((j) => j.id === liderId);
            return lider ? lider.nombre : `ID: ${liderId}`;
        },
        [jornaleros]
    );

    const getTemporadaName = useCallback(
        (temporadaId: number | null) => {
            if (!temporadaId) return "Sin temporada";
            const temporada = temporadas.find((t) => t.id === temporadaId);
            return temporada ? `T-${temporada.id}` : `ID: ${temporadaId}`;
        },
        [temporadas]
    );

    const getVariedadNombre = useCallback(
        (cuadrilla: Cuadrilla) => {
            if (!cuadrilla || !cuadrilla.variedad_id) return "No asignada";
            const variedad = variedades.find(
                (v) => v.id === cuadrilla.variedad_id
            );
            return variedad ? variedad.nombre : "Desconocida";
        },
        [variedades]
    );

    return [
        {
            accessorKey: "id",
            header: () => <div className="text-center">ID</div>,
            cell: ({ row }) => <div className="flex items-center justify-center"><Badge variant="outline">#{row.original.id}</Badge></div>,
        },
        {
            accessorKey: "lider_cuadrilla_id",
            header: () => <div className="text-center">Líder</div>,
            cell: ({ row }) => (
                <div className="font-medium text-center">
                    {getLiderName(row.original.lider_cuadrilla_id)}
                </div>
            ),
        },
        {
            accessorKey: "lote",
            header: () => <div className="text-center">Lote</div>,
            cell: ({ row }) => (
                <div className="text-center">{row.original.lote}</div>
            ),
        },
        {
            accessorKey: "variedad_id",
            header: () => <div className="text-center">Variedad</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    {getVariedadNombre(row.original)}
                </div>
            ),
        },
        {
            accessorKey: "temporada_id",
            header: ({ column }) => {
      return (
        <div className="flex items-center justify-center">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Temporada
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
      )
    },
            cell: ({ row }) => (
                <div className="text-center">
                    {getTemporadaName(row.original.temporada_id)}
                </div>
            ),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => {
      return (
        <div className="flex items-center justify-center">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                Fecha de Creación
                {column.getIsSorted() === "asc" ? (
                    <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                    <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
            </Button>
        </div>
      )
    },
            cell: ({ row }) => (
                <div className="text-sm text-center ">
                    {getDate(row.original.created_at)}
                </div>
            ),
        },
        {
            id: "acciones",
            header: () => <div className="text-center">Acciones</div>,
            cell: ({ row }) => (
                <div className="flex flex-row gap-2 justify-center">
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
