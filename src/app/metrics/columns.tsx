"use client"
 
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { MoreHorizontal } from "lucide-react"
import { Temporada } from "./metrics.type"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { parse } from "path"
import { Badge } from "@/components/ui/badge"
 
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string
  amount: number
  status: "pending" | "processing" | "success" | "failed"
  email: string
}
 
export const columns: ColumnDef<Temporada>[] = [
  {
    accessorKey: "id",
     header: () => <div className="text-center">ID</div>,
     cell: ({ row }) => <div className="flex items-center justify-center"><Badge variant="outline">#{row.original.id}</Badge></div>,
  },
  {
    accessorKey: "año",
    header: ({ column }) => {
      return (
        <Button

          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Año
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "fechaInicio",
    header: "Fecha Inicial",
    cell: ({row}) => {
      const fechaInicio = row.getValue("fechaInicio") as Date
      const dia = String(fechaInicio.getDate()).padStart(2,"0")
      const mes = String(fechaInicio.getMonth() + 1).padStart(2,"0")
      const fechaFormateada = `${dia}-${mes}`  
      return <div>{fechaFormateada}</div>
    }
  },
  {
    accessorKey: "fechaFinal",
    header: "Fecha Final",
    cell: ({row}) => {
      const fechaInicio = row.getValue("fechaInicio") as Date
      const dia = String(fechaInicio.getDate()).padStart(2,"0")
      const mes = String(fechaInicio.getMonth() + 1).padStart(2,"0")
      const fechaFormateada = `${dia}-${mes}`  
      return <div>{fechaFormateada}</div>
    }
  },
  {
    accessorKey: "estado",
    header: "Estado",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
  // ...
]