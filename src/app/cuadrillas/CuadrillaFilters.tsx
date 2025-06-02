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

interface CuadrillaFiltersProps {
    searchTerm: string;
    selectedTemporadaFilter: string;
    selectedVariedadFilter: string;
    temporadas: any[];
    variedades: any[];
    onSearchChange: (value: string) => void;
    onTemporadaFilterChange: (value: string) => void;
    onVariedadFilterChange: (value: string) => void;
}

export function CuadrillaFilters({
    searchTerm,
    selectedTemporadaFilter,
    selectedVariedadFilter,
    temporadas,
    variedades,
    onSearchChange,
    onTemporadaFilterChange,
    onVariedadFilterChange,
}: CuadrillaFiltersProps) {
    return (
        <div className="space-y-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por lote, líder o ID..."
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
                        <SelectTrigger className="w-[170px] h-10">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {temporadas.map((temporada) => (
                                <SelectItem
                                    key={temporada.id}
                                    value={temporada.id.toString()}
                                >
                                    T-{temporada.id} (
                                    {temporada.fecha_inicial?.slice(0, 4) ||
                                        "N/A"}
                                    )
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col space-y-2">
                    <Label
                        htmlFor="variedad"
                        className="text-sm font-medium text-muted-foreground"
                    >
                        Variedad
                    </Label>
                    <Select
                        value={selectedVariedadFilter}
                        onValueChange={onVariedadFilterChange}
                    >
                        <SelectTrigger className="w-[150px] h-10">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="sin_variedad">
                                Sin variedad
                            </SelectItem>
                            {variedades.map((variedad) => (
                                <SelectItem
                                    key={variedad.id}
                                    value={variedad.id.toString()}
                                >
                                    {variedad.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
