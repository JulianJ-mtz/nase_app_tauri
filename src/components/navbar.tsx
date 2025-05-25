"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Menu, BarChart3, Users, Sprout, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import Image from "next/image";

export function Navbar() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const routes = [
        {
            href: "/production",
            label: "Producción",
            icon: <Sprout className="mr-2 h-5 w-5" />,
            active: pathname === "/production",
        },
        {
            href: "/record",
            label: "Registro",
            icon: <Users className="mr-2 h-5 w-5" />,
            active: pathname === "/record",
        },
        {
            href: "/metrics",
            label: "Métricas",
            icon: <BarChart3 className="mr-2 h-5 w-5" />,
            active: pathname === "/metrics",
        },
        {
            href: "/jornaleros",
            label: "Jornaleros",
            icon: <UserRound className="mr-2 h-5 w-5" />,
            active: pathname === "/jornaleros",
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[#5a7852]/20 bg-[#f8f9f4]">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2">
                    <Leaf className="h-6 w-6 text-[#2c5e1a]" />
                    <span className="text-lg font-bold text-[#2c5e1a] hidden md:inline-block">
                        NASE
                    </span>
                </Link>
                <div className="flex items-center">
                    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-[#f0f4eb] hover:text-[#2c5e1a] ${
                                    route.active
                                        ? "bg-[#f0f4eb] text-[#2c5e1a]"
                                        : "text-[#5a7852]"
                                }`}
                            >
                                {route.icon}
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-4">
                        <OnlineStatusIndicator />
                    </div>
                </div>
                <div className="md:hidden flex flex-1 items-center justify-end">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="md:hidden border-[#5a7852]/20"
                            >
                                <Menu className="h-5 w-5 text-[#5a7852]" />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="bg-[#f8f9f4] ps-5 "
                        >
                            <div className="flex items-center gap-2 mb-8 mt-4">
                                <Leaf className="h-6 w-6 text-[#2c5e1a]" />
                                <span className="text-lg font-bold text-[#2c5e1a]">
                                    NASE
                                </span>
                            </div>
                            <nav className="flex flex-col gap-4">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-[#f0f4eb] hover:text-[#2c5e1a] ${
                                            route.active
                                                ? "bg-[#f0f4eb] text-[#2c5e1a]"
                                                : "text-[#5a7852]"
                                        }`}
                                    >
                                        {route.icon}
                                        {route.label}
                                    </Link>
                                ))}
                            </nav>
                            <div className="mt-6">
                                <OnlineStatusIndicator />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
