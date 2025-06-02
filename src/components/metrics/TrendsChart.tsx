import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
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

interface TrendsChartProps {
    tendenciaProduccion: any[];
    tendenciaClientes: any[];
    tendenciaVariedades: any[];
    tendenciaTipos: any[];
    clientes: any[];
    variedades: any[];
    tiposUva: any[];
}

export const TrendsChart = ({
    tendenciaProduccion,
    tendenciaClientes,
    tendenciaVariedades,
    tendenciaTipos,
    clientes,
    variedades,
    tiposUva,
}: TrendsChartProps) => {
    return (
        <div className="space-y-6">
            {/* Tendencia General de Producción */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolución de la Producción Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={tendenciaProduccion}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="fecha"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value) => [
                                        `${value} cajas`,
                                        "Producción",
                                    ]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="produccion"
                                    stroke="#0088FE"
                                    fill="#0088FE"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tendencia por Clientes */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolución por Cliente (Apilado)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={tendenciaClientes}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="fecha"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} cajas`,
                                        `${name}`,
                                    ]}
                                />
                                <Legend />
                                {clientes.map((cliente, index) => (
                                    <Area
                                        key={cliente.nombre}
                                        type="monotone"
                                        dataKey={cliente.nombre}
                                        stackId="1"
                                        stroke={COLORS[index % COLORS.length]}
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={0.6}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tendencia por Variedades */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolución por Variedad (Apilado)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={tendenciaVariedades}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="fecha"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} cajas`,
                                        `${name}`,
                                    ]}
                                />
                                <Legend />
                                {variedades.map((variedad, index) => (
                                    <Area
                                        key={variedad.nombre}
                                        type="monotone"
                                        dataKey={variedad.nombre}
                                        stackId="1"
                                        stroke={COLORS[index % COLORS.length]}
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={0.6}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Tendencia por Tipos de Uva */}
            <Card>
                <CardHeader>
                    <CardTitle>Evolución por Tipo de Uva (Apilado)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={tendenciaTipos}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="fecha"
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} cajas`,
                                        `Tipo ${name}`,
                                    ]}
                                />
                                <Legend />
                                {tiposUva.map((tipo, index) => (
                                    <Area
                                        key={tipo.nombre}
                                        type="monotone"
                                        dataKey={tipo.nombre}
                                        stackId="1"
                                        stroke={COLORS[index % COLORS.length]}
                                        fill={COLORS[index % COLORS.length]}
                                        fillOpacity={0.6}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 