import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Colores para los gráficos
const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#8dd1e1",
];

interface ClientGrapeTypeChartProps {
    data: any[];
}

export const ClientGrapeTypeChart = ({ data }: ClientGrapeTypeChartProps) => {
    return (
        <div className="space-y-6">
            {data.map((clienteData, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>
                            {clienteData.cliente} - Total: {clienteData.total.toFixed(2)} cajas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={clienteData.tipos}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 50,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="tipo"
                                            angle={-45}
                                            textAnchor="end"
                                            height={50}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            formatter={(value) => [
                                                `${value} cajas`,
                                                "Producción",
                                            ]}
                                        />
                                        <Bar
                                            dataKey="cantidad"
                                            fill={COLORS[(index + 2) % COLORS.length]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={clienteData.tipos}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ tipo, cantidad }) =>
                                                `${tipo}: ${cantidad.toFixed(0)} cajas`
                                            }
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="cantidad"
                                        >
                                            {clienteData.tipos.map(
                                                (entry: any, tipoIndex: number) => (
                                                    <Cell
                                                        key={`cell-${tipoIndex}`}
                                                        fill={
                                                            COLORS[
                                                                tipoIndex % COLORS.length
                                                            ]
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [
                                                `${value} cajas`,
                                                "Producción",
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}; 