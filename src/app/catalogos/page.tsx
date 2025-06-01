"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Grape, Package, Settings, Plus } from "lucide-react";
import Link from "next/link";

export default function CatalogosPage() {
    const catalogos = [
        {
            title: "Clientes",
            description: "Gestión de clientes y empresas",
            icon: <Building className="h-8 w-8" />,
            href: "/catalogos/clientes",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Variedades",
            description: "Tipos de uva y variedades cultivadas",
            icon: <Grape className="h-8 w-8" />,
            href: "/catalogos/variedades",
            color: "text-purple-600",
            bgColor: "bg-purple-50",
        },
        {
            title: "Tipos de Empaque",
            description: "Formatos y tipos de empaque disponibles",
            icon: <Package className="h-8 w-8" />,
            href: "/catalogos/tipos-empaque",
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Tipos de Uva",
            description: "Clasificación de tipos de uva",
            icon: <Grape className="h-8 w-8" />,
            href: "/catalogos/tipos-uva",
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
    ];

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
                    <p className="text-muted-foreground mt-2">
                        Gestiona los catálogos y configuraciones básicas del sistema
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-muted-foreground" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {catalogos.map((catalogo) => (
                    <Card key={catalogo.href} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${catalogo.bgColor}`}>
                                    <div className={catalogo.color}>
                                        {catalogo.icon}
                                    </div>
                                </div>
                                <Link href={catalogo.href}>
                                    <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Gestionar
                                    </Button>
                                </Link>
                            </div>
                            <CardTitle className="text-xl">{catalogo.title}</CardTitle>
                            <CardDescription className="text-sm">
                                {catalogo.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href={catalogo.href}>
                                <Button variant="ghost" className="w-full justify-start">
                                    Ver todos los {catalogo.title.toLowerCase()}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg">Flujo de Trabajo Recomendado</CardTitle>
                    <CardDescription>
                        Para un funcionamiento óptimo del sistema, sigue este orden:
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                1
                            </div>
                            <div>
                                <p className="font-medium">Configurar Catálogos</p>
                                <p className="text-sm text-muted-foreground">
                                    Primero configura clientes, variedades y tipos de empaque
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                2
                            </div>
                            <div>
                                <p className="font-medium">Crear Temporadas</p>
                                <p className="text-sm text-muted-foreground">
                                    Define las temporadas de trabajo con fechas específicas
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                3
                            </div>
                            <div>
                                <p className="font-medium">Organizar Cuadrillas</p>
                                <p className="text-sm text-muted-foreground">
                                    Crea cuadrillas asignadas a temporadas y variedades
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                4
                            </div>
                            <div>
                                <p className="font-medium">Registrar Jornaleros</p>
                                <p className="text-sm text-muted-foreground">
                                    Añade trabajadores y asígnalos a cuadrillas
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                                5
                            </div>
                            <div>
                                <p className="font-medium">Registrar Producción</p>
                                <p className="text-sm text-muted-foreground">
                                    Comienza a registrar la producción diaria
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 