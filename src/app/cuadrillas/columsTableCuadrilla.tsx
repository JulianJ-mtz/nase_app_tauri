import { Cuadrilla } from "@/api/cuadrilla_api";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash, Users } from "lucide-react";

interface ColumnHandlers {
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
    handleViewJornaleros?: (id: number) => void;
}

export const createColumns = ({
    handleEdit,
    handleDelete,
    handleViewJornaleros,
}: ColumnHandlers): ColumnDef<Cuadrilla>[] => [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "LiderCuadrilla",
        header: "Lider",
    },
    {
        accessorKey: "Empaque",
        header: "Empaque",
    },
    {
        accessorKey: "Lote",
        header: "Lote",
    },
    {
        accessorKey: "Variedad",
        header: "Variedad",
    },
    {
        accessorKey: "Integrantes",
        header: "Integrantes",
    },
    {
        accessorKey: "ProduccionCuadrilla",
        header: "Produccion",
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
                        onClick={() => handleViewJornaleros(row.original.id)}
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
