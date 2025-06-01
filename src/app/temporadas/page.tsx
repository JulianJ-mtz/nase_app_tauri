"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar } from "lucide-react";
import { TemporadaForm } from "@/components/forms";
import { useTemporadaStore } from "@/lib/storeTemporada";
import { TemporadasTab } from "@/components/TemporadasContent";

export default function TemporadasPage() {
    const {
        temporadas,
        loading: temporadasLoading,
        fetchTemporadas,
    } = useTemporadaStore();

    const [isTemporadaDialogOpen, setIsTemporadaDialogOpen] = useState(false);

    const handleTemporadaSuccess = useCallback(() => {
        setIsTemporadaDialogOpen(false);
        fetchTemporadas();
    }, [fetchTemporadas]);

    useEffect(() => {
        const loadBasicData = async () => {
            try {
                fetchTemporadas();
            } catch (error) {
                console.error("Error cargando datos básicos:", error);
            }
        };

        loadBasicData();
    }, [fetchTemporadas]);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Temporadas</h1>
                    <p className="text-muted-foreground">
                        Gestiona las temporadas de trabajo
                    </p>
                </div>
            </div>

            {temporadasLoading ? (
                <div className="flex justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-sm text-muted-foreground">
                            Cargando temporadas...
                        </p>
                    </div>
                </div>
            ) : (
                <TemporadasTab
                    temporadas={temporadas}
                    temporadasLoading={temporadasLoading}
                    onTemporadaSuccess={handleTemporadaSuccess}
                />
            )}
        </div>
    );
}
