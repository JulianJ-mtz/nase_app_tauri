"use client";

import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { Button } from "@/components/ui/button";
import { UserRound, Users, Calendar, LineChart, Layers, Package, Grape, Building, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { useProduccionStore } from "@/lib/storeProduccion";

export default function Home() {
    const { jornaleros, fetchJornaleros } = useJornaleroStore();
    const { cuadrillas, fetchCuadrillas } = useCuadrillaStore();
    const { temporadas, fetchTemporadas } = useTemporadaStore();
    const { producciones, fetchProducciones, getTotalProduccion } = useProduccionStore();
    const [stats, setStats] = useState({
        jornalerosActivos: 0,
        cuadrillasActivas: 0,
        temporadaActual: null as any,
        produccionTotal: 0,
    });

    // Helper function to safely format numbers
    const formatNumber = (value: any, decimals: number = 1): string => {
        const num = Number(value);
        return isNaN(num) ? "0" : num.toFixed(decimals);
    };

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                fetchJornaleros(),
                fetchCuadrillas(),
                fetchTemporadas(),
                fetchProducciones(),
            ]);
        };
        loadData();
    }, [fetchJornaleros, fetchCuadrillas, fetchTemporadas, fetchProducciones]);

    useEffect(() => {
        const jornalerosActivos = jornaleros.filter(j => j.estado === "Activo").length;
        const cuadrillasActivas = cuadrillas.length;
        // Find active season: one without fecha_final or with fecha_final in the future
        const temporadaActual = temporadas.find(t => 
            !t.fecha_final || new Date(t.fecha_final) >= new Date()
        );
        // Get total production from cuadrillas, not individual jornaleros
        const produccionTotalRaw = getTotalProduccion();
        const produccionTotal = Number(produccionTotalRaw) || 0; // Ensure it's always a valid number

        setStats({
            jornalerosActivos,
            cuadrillasActivas,
            temporadaActual,
            produccionTotal,
        });
    }, [jornaleros, cuadrillas, temporadas, producciones, getTotalProduccion]);

    const quickAccessModules = [
        {
            title: "Temporadas",
            description: "Gestiona los periodos de trabajo agrícola",
            icon: Calendar,
            href: "/temporadas",
            color: "bg-blue-500",
            stats: `${temporadas.length} temporadas`,
            priority: 1,
        },
        {
            title: "Cuadrillas",
            description: "Administra grupos de trabajo",
            icon: Users,
            href: "/cuadrillas",
            color: "bg-green-500",
            stats: `${stats.cuadrillasActivas} cuadrillas activas`,
            priority: 2,
        },
        {
            title: "Jornaleros",
            description: "Administra la información de tus jornaleros",
            icon: UserRound,
            href: "/jornaleros",
            color: "bg-purple-500",
            stats: `${stats.jornalerosActivos} jornaleros activos`,
            priority: 2,
        },
        {
            title: "Producción",
            description: "Registra y consulta la producción diaria",
            icon: LineChart,
            href: "/record",
            color: "bg-orange-500",
            stats: `${formatNumber(stats.produccionTotal)} kg totales`,
            priority: 3,
        },
        {
            title: "Catálogos",
            description: "Administra los catálogos del sistema",
            icon: Layers,
            href: "/catalogos",
            color: "bg-cyan-500",
            stats: "Variedades, tipos, empaques",
            priority: 4,
        },
        {
            title: "Métricas",
            description: "Visualiza estadísticas y reportes",
            icon: TrendingUp,
            href: "/metrics",
            color: "bg-pink-500",
            stats: "Reportes y análisis",
            priority: 4,
        },
    ];

    // const workflowSteps = [
    //     { title: "Configurar Temporadas", icon: Calendar, href: "/temporadas" },
    //     { title: "Crear Cuadrillas", icon: Users, href: "/cuadrillas" },
    //     { title: "Registrar Jornaleros", icon: UserRound, href: "/jornaleros" },
    //     { title: "Registrar Producción", icon: LineChart, href: "/record" },
    // ];

    return (
        <div className="container mx-auto py-10 space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    Bienvenido a NASE
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Sistema integral para la gestión de producción agrícola, jornaleros y cuadrillas de trabajo
                </p>
                <OnlineStatusIndicator />
            </div>

            {/* Stats Overview */}
            {stats.temporadaActual && (
                <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Temporada Actual: ID {stats.temporadaActual.id}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.jornalerosActivos}</div>
                                <div className="text-sm text-muted-foreground">Jornaleros Activos</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.cuadrillasActivas}</div>
                                <div className="text-sm text-muted-foreground">Cuadrillas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{formatNumber(stats.produccionTotal)} kg</div>
                                <div className="text-sm text-muted-foreground">Producción Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {stats.cuadrillasActivas > 0 ? formatNumber(stats.produccionTotal / stats.cuadrillasActivas) : 0} kg
                                </div>
                                <div className="text-sm text-muted-foreground">Promedio por Cuadrilla</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Workflow Guide
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Flujo de Trabajo Recomendado</h2>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                            {workflowSteps.map((step, index) => (
                                <div key={step.title} className="flex items-center space-x-4">
                                    <Link href={step.href}>
                                        <Button variant="outline" className="flex items-center gap-2 h-16 px-6">
                                            <step.icon className="h-6 w-6" />
                                            <div className="text-left">
                                                <div className="font-medium">{index + 1}. {step.title}</div>
                                            </div>
                                        </Button>
                                    </Link>
                                    {index < workflowSteps.length - 1 && (
                                        <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div> */}

            {/* Main Modules Grid */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Módulos del Sistema</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quickAccessModules.map((module) => (
                        <Card key={module.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform`}>
                                        <module.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div>{module.title}</div>
                                        <Badge variant="secondary" className="text-xs mt-1">
                                            {module.stats}
                                        </Badge>
                                    </div>
                                </CardTitle>
                                <CardDescription className="mt-2">
                                    {module.description}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href={module.href}>
                                        Acceder
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>
                        Accesos directos a las tareas más comunes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button asChild variant="outline" className="h-16">
                            <Link href="/jornaleros">
                                <div className="text-center">
                                    <UserRound className="h-6 w-6 mx-auto mb-1" />
                                    <div className="text-sm">Nuevo Jornalero</div>
                                </div>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-16">
                            <Link href="/cuadrillas">
                                <div className="text-center">
                                    <Users className="h-6 w-6 mx-auto mb-1" />
                                    <div className="text-sm">Nueva Cuadrilla</div>
                                </div>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-16">
                            <Link href="/record/produccion">
                                <div className="text-center">
                                    <LineChart className="h-6 w-6 mx-auto mb-1" />
                                    <div className="text-sm">Registrar Producción</div>
                                </div>
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-16">
                            <Link href="/metrics">
                                <div className="text-center">
                                    <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                                    <div className="text-sm">Ver Métricas</div>
                                </div>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
