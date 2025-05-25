"use client";

import { JornaleroList } from "@/components/JornaleroList";
import { JornaleroForm } from "@/components/JornaleroForm";
import { Separator } from "@/components/ui/separator";
import { useJornaleroStore } from "@/lib/store";
import { useEffect } from "react";

export default function JornalerosPage() {
    const { fetchJornaleros } = useJornaleroStore();

    useEffect(() => {
        fetchJornaleros();
    }, [fetchJornaleros]);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Gestión de Jornaleros</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Agregar Nuevo Jornalero
                    </h2>
                    <JornaleroForm />
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-4">
                        Lista de Jornaleros
                    </h2>
                    <Separator className="my-4" />
                    <JornaleroList />
                </div>
            </div>
        </div>
    );
}
