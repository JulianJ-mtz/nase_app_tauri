"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Leaf,
    Menu,
    BarChart3,
    Users,
    Sprout,
    UserRound,
    Calendar,
    Package,
    Layers,
    Building,
    Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { ModeToggle } from "@/components/themeToggle";

export function Navbar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const routes = [
        // Main workflow - following database dependencies
        {
            href: "/temporadas",
            label: "Temporadas",
            icon: <Calendar className="mr-2 h-5 w-5" />,
            active: pathname === "/temporadas",
            description: "Gestión de temporadas de trabajo",
        },
        {
            href: "/cuadrillas",
            label: "Cuadrillas",
            icon: <Users className="mr-2 h-5 w-5" />,
            active: pathname === "/cuadrillas",
            description: "Organización de equipos de trabajo",
        },
        {
            href: "/jornaleros",
            label: "Jornaleros",
            icon: <UserRound className="mr-2 h-5 w-5" />,
            active: pathname === "/jornaleros",
            description: "Gestión de trabajadores",
        },
        {
            href: "/record",
            label: "Producción",
            icon: <Sprout className="mr-2 h-5 w-5" />,
            active: pathname === "/record",
            description: "Registro de producción diaria",
        },
        // Analytics and reports
        {
            href: "/metrics",
            label: "Métricas",
            icon: <BarChart3 className="mr-2 h-5 w-5" />,
            active: pathname === "/metrics",
            description: "Análisis y reportes",
        },
        // Configuration
        {
            href: "/catalogos",
            label: "Configuración",
            icon: <Settings className="mr-2 h-5 w-5" />,
            active:
                pathname === "/catalogos" || pathname.startsWith("/catalogos/"),
            description: "Catálogos y configuración del sistema",
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-lg font-bold text-primary hidden md:inline-block">
                        <img
                            src="/logo.png"
                            alt="NASE"
                            width={100}
                            height={100}
                            className="cursor-pointer"
                        />
                    </span>
                </Link>

                <div className="flex items-center">
                    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                                    route.active
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                                title={route.description}
                            >
                                {route.icon}
                                {route.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-4">
                        <OnlineStatusIndicator />
                    </div>

                    <div className="ml-4 hidden md:block">
                        <ModeToggle />
                    </div>
                </div>

                <div className="md:hidden flex flex-1 items-center justify-end">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="left" className="ps-5">
                            <div className="flex items-center gap-2 mb-8 mt-4">
                                <Leaf className="h-6 w-6 text-primary" />
                                <span className="text-lg font-bold text-primary">
                                    NASE
                                </span>
                            </div>

                            <nav className="flex flex-col gap-4">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex flex-col px-3 py-3 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground ${
                                            route.active
                                                ? "bg-accent text-accent-foreground"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            {route.icon}
                                            {route.label}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 ml-7">
                                            {route.description}
                                        </p>
                                    </Link>
                                ))}
                            </nav>

                            <div className="mt-6">
                                <OnlineStatusIndicator />
                            </div>

                            <div className="mt-4">
                                <ModeToggle />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
