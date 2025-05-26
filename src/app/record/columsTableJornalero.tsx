import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Jornalero } from "@/lib/api";

interface ColumnHandlers {
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
}

export const createColumns = ({
    handleEdit,
    handleDelete,
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
        accessorKey: "produccion",
        header: "Producción",
        cell: ({ row }) => row.original.produccion_jornalero ?? "N/A",
    },
    {
        accessorKey: "errores",
        header: "Errores",
    },
    {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => (row.original.estado ? "Activo" : "Inactivo"),
    },
    {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => (
            <div className="flex flex-row gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(row.original.id)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(row.original.id)}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];
