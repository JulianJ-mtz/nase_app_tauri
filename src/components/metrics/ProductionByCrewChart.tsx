import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ExportButton } from "@/components/ui/export-button";
import { exportProduccionPorCuadrilla } from "@/lib/csvExport";

interface ProductionByCrewChartProps {
    data: any[];
}

export const ProductionByCrewChart = ({ data }: ProductionByCrewChartProps) => {
    const handleExport = async () => {
        await exportProduccionPorCuadrilla(data);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Producción por Cuadrilla</CardTitle>
                <ExportButton onClick={handleExport} disabled={data.length === 0} />
            </CardHeader>
            <CardContent>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 70,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={70}
                            />
                            <YAxis />
                            <Tooltip
                                formatter={(value) => [
                                    `${value} cajas`,
                                    "Producción",
                                ]}
                            />
                            <Legend />
                            <Bar
                                dataKey="produccion"
                                name="Producción (cajas)"
                                fill="#82ca9d"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}; 