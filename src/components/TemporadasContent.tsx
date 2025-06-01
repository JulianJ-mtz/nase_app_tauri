"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar, Edit, Plus } from "lucide-react";
import { TemporadaForm } from "@/components/forms";
import { Badge } from "@/components/ui/badge";

interface TemporadasTabProps {
    temporadas: any[];
    temporadasLoading: boolean;
    onTemporadaSuccess: () => void;
}

export function TemporadasTab({
    temporadas,
    temporadasLoading,
    onTemporadaSuccess,
}: TemporadasTabProps) {
    const [editingTemporadaId, setEditingTemporadaId] = useState<number | undefined>(undefined);
    const [showCreateForm, setShowCreateForm] = useState(true);

    const handleEditClick = (temporadaId: number) => {
        setEditingTemporadaId(temporadaId);
        setShowCreateForm(false);
    };

    const handleCancelEdit = () => {
        setEditingTemporadaId(undefined);
        setShowCreateForm(true);
    };

    const handleSuccess = () => {
        setEditingTemporadaId(undefined);
        setShowCreateForm(true);
        onTemporadaSuccess();
    };

    const isTemporadaActive = (temporada: any) => {
        return !temporada.fecha_final || new Date(temporada.fecha_final) >= new Date();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {editingTemporadaId ? "Editar Temporada" : "Nueva Temporada"}
                        </CardTitle>
                        <CardDescription>
                            {editingTemporadaId 
                                ? "Modifica las fechas de la temporada seleccionada"
                                : "Crea una nueva temporada de trabajo"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {editingTemporadaId && (
                            <div className="mb-4">
                                <Button 
                                    variant="outline" 
                                    onClick={handleCancelEdit}
                                    className="w-full"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Cancelar y Crear Nueva
                                </Button>
                            </div>
                        )}
                        <TemporadaForm 
                            temporadaId={editingTemporadaId}
                            onSuccess={handleSuccess} 
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Temporadas Registradas</CardTitle>
                        <CardDescription>
                            Lista de todas las temporadas ({temporadas.length} total)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {temporadasLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ) : temporadas.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No hay temporadas registradas</p>
                                <p className="text-sm">Crea la primera temporada para comenzar</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {temporadas.map((temporada) => {
                                    const isActive = isTemporadaActive(temporada);
                                    const isCurrentlyEditing = editingTemporadaId === temporada.id;
                                    
                                    return (
                                        <Card 
                                            key={temporada.id} 
                                            className={`p-4 transition-all ${
                                                isCurrentlyEditing 
                                                    ? 'ring-2 ring-primary bg-primary/5' 
                                                    : 'hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-medium">Temporada {temporada.id}</h3>
                                                        {isCurrentlyEditing && (
                                                            <Badge variant="default" className="text-xs">
                                                                Editando
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {temporada.fecha_inicial} 
                                                        {temporada.fecha_final ? ` - ${temporada.fecha_final}` : ' - Activa'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant={isCurrentlyEditing ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => {
                                                            if (isCurrentlyEditing) {
                                                                handleCancelEdit();
                                                            } else {
                                                                handleEditClick(temporada.id);
                                                            }
                                                        }}
                                                        title={isCurrentlyEditing ? "Cancelar edición" : "Editar temporada"}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        {isCurrentlyEditing ? "Cancelar" : "Editar"}
                                                    </Button>
                                                    {isActive ? (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                            Activa
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                                                            Finalizada
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 