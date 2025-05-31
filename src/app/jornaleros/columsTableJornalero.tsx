"use client";

import { Pencil, Trash, Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Jornalero } from "@/api/jornalero_api";
import { Badge } from "@/components/ui/badge";

interface ColumnHandlers {
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
    handleViewCuadrilla?: (id: number) => void;
}

interface InactiveColumnHandlers {
    handleReactivate: (id: number) => void;
}

export const createColumns = ({
    handleEdit,
    handleDelete,
    handleViewCuadrilla,
}: ColumnHandlers): ColumnDef<Jornalero>[] => [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
            <span className="font-medium">{row.original.nombre}</span>
        ),
    },
    {
        accessorKey: "edad",
        header: "Edad",
    },
    {
        accessorKey: "cuadrilla_id",
        header: "Cuadrilla",
        cell: ({ row }) => {
            const cuadrillaId = row.original.cuadrilla_id;
            return cuadrillaId ? (
                <Badge variant="outline" className="bg-primary/10">
                    {cuadrillaId}
                </Badge>
            ) : (
                <span className="text-muted-foreground text-sm">Sin asignar</span>
            );
        },
    },
    {
        accessorKey: "produccion_jornalero",
        header: "Producción",
        cell: ({ row }) => row.original.produccion_jornalero ?? "N/A",
    },
    {
        accessorKey: "errores",
        header: "Errores",
        cell: ({ row }) => row.original.errores ?? 0,
    },
    {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
            <Badge variant={row.original.estado === "Activo" ? "default" : "secondary"}>
                {row.original.estado}
            </Badge>
        ),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
            <div className="flex flex-row gap-2">
                {handleViewCuadrilla && row.original.cuadrilla_id && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewCuadrilla(row.original.cuadrilla_id as number)}
                        title="Ver cuadrilla"
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
                    title="Desactivar"
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];

export const createInactiveColumns = ({
    handleReactivate,
}: InactiveColumnHandlers): ColumnDef<Jornalero>[] => [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "nombre",
        header: "Nombre",
        cell: ({ row }) => (
            <span className="font-medium text-muted-foreground">{row.original.nombre}</span>
        ),
    },
    {
        accessorKey: "edad",
        header: "Edad",
    },
    {
        accessorKey: "fecha_contratacion",
        header: "Fecha Contratación",
        cell: ({ row }) => {
            const fecha = new Date(row.original.fecha_contratacion);
            return fecha.toLocaleDateString();
        },
    },
    {
        accessorKey: "produccion_jornalero",
        header: "Última Producción",
        cell: ({ row }) => row.original.produccion_jornalero ?? "N/A",
    },
    {
        accessorKey: "errores",
        header: "Errores",
        cell: ({ row }) => row.original.errores ?? 0,
    },
    {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                {row.original.estado}
            </Badge>
        ),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
            <div className="flex flex-row gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleReactivate(row.original.id)}
                    title="Reactivar jornalero"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                    <UserPlus className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];
