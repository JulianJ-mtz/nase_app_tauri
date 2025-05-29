import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Image from "next/image";
import { Payment, columns } from "./columns";
import { Temporada } from "./metrics.type";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

 
export const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  // ...
]

export const Temporadas: Temporada[] = [
  {
    id: "1",
    año: 2024,
    fechaInicio: new Date(), 
    fechaFinal: new Date(),
    estado: "En Proceso"
  },
  {
    id: "2",
    año: 2025,
    fechaInicio: new Date(), 
    fechaFinal: new Date(),
    estado: "En Proceso"
  },
  {
    id: "3",
    año: 2026,
    fechaInicio: new Date(), 
    fechaFinal: new Date(),
    estado: "Terminada"
  },
]


export default function Metrics() {
    return <div className="flex-col justify-center p-10">
        
            <div>
                <DataTable columns={columns} data={Temporadas}></DataTable>
            </div>
        
        
        </div>;
}
