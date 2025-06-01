"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package, FileSpreadsheet, Users, TrendingUp } from "lucide-react";

interface ProductionStatisticsProps {
    estadisticas: {
        totalFiltered: number;
        registrosFiltered: number;
        clientesUnicos: number;
        promedioProduccion: number;
    };
    formatNumber: (value: number, decimals?: number) => string;
}

export function ProductionStatistics({
    estadisticas,
    formatNumber,
}: ProductionStatisticsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Producción
                            </p>
                            <p className="text-lg font-bold">
                                {estadisticas.totalFiltered} cajas
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Registros
                            </p>
                            <p className="text-lg font-bold">
                                {estadisticas.registrosFiltered}{" "}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Clientes Activos
                            </p>
                            <p className="text-lg font-bold">
                                {estadisticas.clientesUnicos}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Promedio
                            </p>
                            <p className="text-lg font-bold">
                                {formatNumber(estadisticas.promedioProduccion)}{" "}
                                kg
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
