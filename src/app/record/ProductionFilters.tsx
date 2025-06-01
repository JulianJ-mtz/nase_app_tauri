"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface ProductionFiltersProps {
    searchTerm: string;
    selectedTemporadaFilter: string;
    selectedClienteFilter: string;
    dateFilter: string;
    temporadas: any[];
    clientes: any[];
    onSearchChange: (value: string) => void;
    onTemporadaFilterChange: (value: string) => void;
    onClienteFilterChange: (value: string) => void;
    onDateFilterChange: (value: string) => void;
}

export function ProductionFilters({
    searchTerm,
    selectedTemporadaFilter,
    selectedClienteFilter,
    dateFilter,
    temporadas,
    clientes,
    onSearchChange,
    onTemporadaFilterChange,
    onClienteFilterChange,
    onDateFilterChange,
}: ProductionFiltersProps) {
    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cuadrilla, cliente o variedad..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label
                        htmlFor="temporada"
                        className="text-sm font-medium text-muted-foreground"
                    >
                        Temporada
                    </Label>
                    <Select
                        value={selectedTemporadaFilter}
                        onValueChange={onTemporadaFilterChange}
                    >
                        <SelectTrigger className="w-[150px] h-10">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {temporadas.map((temporada) => (
                                <SelectItem
                                    key={temporada.id}
                                    value={temporada.id.toString()}
                                >
                                    T-{temporada.id}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label
                        htmlFor="cliente"
                        className="text-sm font-medium text-muted-foreground"
                    >
                        Cliente
                    </Label>
                    <Select
                        value={selectedClienteFilter}
                        onValueChange={onClienteFilterChange}
                    >
                        <SelectTrigger className="w-[150px] h-10">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {clientes.map((cliente) => (
                                <SelectItem
                                    key={cliente.id}
                                    value={cliente.id.toString()}
                                >
                                    {cliente.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label
                        htmlFor="fecha"
                        className="text-sm font-medium text-muted-foreground"
                    >
                        Fecha
                    </Label>
                    <Select
                        value={dateFilter}
                        onValueChange={onDateFilterChange}
                    >
                        <SelectTrigger className="w-[140px] h-10">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="week">Última semana</SelectItem>
                            <SelectItem value="month">Último mes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
