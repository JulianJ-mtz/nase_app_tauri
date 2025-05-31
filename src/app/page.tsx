"use client";

import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { Button } from "@/components/ui/button";
import { UserRound, Users, Calendar, LineChart, Layers, Package, Grape, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Bienvenido a NASE</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Temporadas
                        </CardTitle>
                        <CardDescription>
                            Gestiona los periodos de trabajo agrícola
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Crea y administra temporadas de producción con fechas de inicio y fin.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/temporadas">Ir a Temporadas</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Cuadrillas
                        </CardTitle>
                        <CardDescription>
                            Administra grupos de trabajo
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Gestiona las cuadrillas y sus asignaciones a temporadas específicas.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/cuadrillas">Ir a Cuadrillas</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserRound className="h-5 w-5" />
                            Jornaleros
                        </CardTitle>
                        <CardDescription>
                            Administra la información de tus jornaleros
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Registra nuevos jornaleros y consulta la información existente.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/jornaleros">Ir a Jornaleros</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Producción
                        </CardTitle>
                        <CardDescription>
                            Registra y consulta la producción diaria
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Gestiona los registros de producción de cada jornalero.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/record">Ir a Producción</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Layers className="h-5 w-5" />
                            Catálogos
                        </CardTitle>
                        <CardDescription>
                            Administra los catálogos del sistema
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Gestiona variedades, tipos de uva, empaques y clientes.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/catalogos">Ir a Catálogos</Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LineChart className="h-5 w-5" />
                            Métricas
                        </CardTitle>
                        <CardDescription>
                            Visualiza estadísticas y reportes
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Consulta métricas de producción y rendimiento.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/metrics">Ir a Métricas</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="mt-6">
                <OnlineStatusIndicator />
            </div>
        </div>
    );
}
