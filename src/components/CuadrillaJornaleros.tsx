import { useState, useEffect } from "react";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { Jornalero } from "@/api/jornalero_api";
import { Cuadrilla } from "@/api/cuadrilla_api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { Button } from "./ui/button";
import { UserPlus, UserMinus, RefreshCcw, Crown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CuadrillaJornalerosProps {
    cuadrillaId: number;
    onClose?: () => void;
}

export function CuadrillaJornaleros({
    cuadrillaId,
    onClose,
}: CuadrillaJornalerosProps) {
    const {
        jornalerosPorCuadrilla,
        fetchJornalerosByCuadrillaId,
        loading,
        getCuadrillaById,
        cuadrillas,
    } = useCuadrillaStore();
    const { jornaleros, updateJornalero } = useJornaleroStore();
    const [cuadrilla, setCuadrilla] = useState<Cuadrilla | null>(null);
    const [jornalerosDisponibles, setJornalerosDisponibles] = useState<
        Jornalero[]
    >([]);

    const isLiderDeEstaCuadrilla = (jornaleroId: number) => {
        return cuadrilla?.lider_cuadrilla_id === jornaleroId;
    };

    const getLiderazgoInfo = (jornaleroId: number) => {
        const cuadrillaLiderada = cuadrillas.find(
            (c) => c.lider_cuadrilla_id === jornaleroId
        );
        return {
            esLider: Boolean(cuadrillaLiderada),
            cuadrillaLiderada,
            esLiderDeOtra: cuadrillaLiderada
                ? cuadrillaLiderada.id !== cuadrillaId
                : false,
        };
    };

    useEffect(() => {
        fetchJornalerosByCuadrillaId(cuadrillaId);

        getCuadrillaById(cuadrillaId).then((data) => {
            if (data) setCuadrilla(data);
        });

        // Mejorar la lógica de filtrado y agregar deduplicación
        const disponibles = jornaleros
            .filter((j) => {
                if (j.cuadrilla_id === cuadrillaId) return false;
                if (j.cuadrilla_id === null) return true;
                
                const liderazgo = getLiderazgoInfo(j.id);
                if (liderazgo.esLiderDeOtra) return false;
                
                return true;
            })
            // Deduplicar por ID para evitar duplicados
            .filter((jornalero, index, self) => 
                index === self.findIndex(j => j.id === jornalero.id)
            );
            
        setJornalerosDisponibles(disponibles);
    }, [
        cuadrillaId,
        fetchJornalerosByCuadrillaId,
        getCuadrillaById,
        jornaleros,
        cuadrillas,
    ]);

    const handleAddJornalero = async (jornalero: Jornalero) => {
        const liderazgo = getLiderazgoInfo(jornalero.id);

        if (liderazgo.esLiderDeOtra) {
            toast.error(
                `No se puede agregar a ${jornalero.nombre} porque es líder de la Cuadrilla ${liderazgo.cuadrillaLiderada?.id}. ` +
                    `Primero debe asignar otro líder a esa cuadrilla.`
            );
            return;
        }

        try {
            await updateJornalero(jornalero.id, {
                ...jornalero,
                cuadrilla_id: cuadrillaId,
            });

            fetchJornalerosByCuadrillaId(cuadrillaId);

            setJornalerosDisponibles((prev) =>
                prev.filter((j) => j.id !== jornalero.id)
            );

            toast.success(
                `${jornalero.nombre} agregado a la cuadrilla exitosamente`
            );
        } catch (error: any) {
            console.error("Error al agregar jornalero a la cuadrilla:", error);

            const errorMessage =
                error?.message || error?.toString?.() || String(error);

            if (errorMessage.includes("líder de la cuadrilla")) {
                toast.error(
                    `No se puede mover a ${jornalero.nombre} porque es líder de otra cuadrilla. ` +
                        `Primero debe asignar otro líder a esa cuadrilla.`
                );
            } else {
                toast.error(
                    `Error al agregar ${jornalero.nombre} a la cuadrilla: ${errorMessage}`
                );
            }
        }
    };

    const handleRemoveJornalero = async (jornalero: Jornalero) => {
        if (isLiderDeEstaCuadrilla(jornalero.id)) {
            toast.error(
                `No se puede remover a ${jornalero.nombre} porque es el líder de esta cuadrilla. ` +
                    `Primero debe asignar otro líder.`
            );
            return;
        }

        try {
            await updateJornalero(jornalero.id, {
                ...jornalero,
                cuadrilla_id: null,
            });

            fetchJornalerosByCuadrillaId(cuadrillaId);

            // Mejorar: Solo agregar si no existe ya en la lista
            setJornalerosDisponibles((prev) => {
                const exists = prev.find(j => j.id === jornalero.id);
                return exists ? prev : [...prev, jornalero];
            });

            toast.success(
                `${jornalero.nombre} removido de la cuadrilla exitosamente`
            );
        } catch (error: any) {
            console.error("Error al remover jornalero de la cuadrilla:", error);

            const errorMessage =
                error?.message || error?.toString?.() || String(error);

            if (errorMessage.includes("líder de la cuadrilla")) {
                toast.error(
                    `No se puede remover a ${jornalero.nombre} porque es líder de esta cuadrilla. ` +
                        `Primero debe asignar otro líder.`
                );
            } else {
                toast.error(
                    `Error al remover ${jornalero.nombre} de la cuadrilla: ${errorMessage}`
                );
            }
        }
    };

    const jornalerosEnCuadrilla = jornalerosPorCuadrilla[cuadrillaId] || [];

    console.log(
        "Jornaleros en cuadrilla:",
        jornalerosEnCuadrilla.map((j) => j.id)
    );
    console.log(
        "Jornaleros disponibles:",
        jornalerosDisponibles.map((j) => j.id)
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    {cuadrilla ? (
                        <div className="flex items-center gap-2">
                            <span>
                                Cuadrilla {cuadrilla.id} - {cuadrilla.lote}
                            </span>
                            {cuadrilla.lider_cuadrilla_id && (
                                <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1"
                                >
                                    <Crown className="h-3 w-3" />
                                    Líder:{" "}
                                    {jornaleros.find(
                                        (j) =>
                                            j.id ===
                                            cuadrilla.lider_cuadrilla_id
                                    )?.nombre ||
                                        `ID: ${cuadrilla.lider_cuadrilla_id}`}
                                </Badge>
                            )}
                        </div>
                    ) : (
                        `Cuadrilla ${cuadrillaId}`
                    )}
                </CardTitle>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            fetchJornalerosByCuadrillaId(cuadrillaId)
                        }
                    >
                        <RefreshCcw className="h-4 w-4 mr-1" />
                        Actualizar
                    </Button>
                    {onClose && (
                        <Button size="sm" variant="outline" onClick={onClose}>
                            Cerrar
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-4">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <h3 className="text-lg font-semibold mb-2">
                            Jornaleros Asignados ({jornalerosEnCuadrilla.length}
                            )
                        </h3>
                        {jornalerosEnCuadrilla.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Edad</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Rol</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jornalerosEnCuadrilla.map((jornalero) => {
                                        const esLider = isLiderDeEstaCuadrilla(
                                            jornalero.id
                                        );
                                        return (
                                            <TableRow
                                                key={`assigned-${jornalero.id}`}
                                            >
                                                <TableCell>
                                                    {jornalero.id}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {jornalero.nombre}
                                                        {esLider && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="flex items-center gap-1"
                                                            >
                                                                <Crown className="h-3 w-3" />
                                                                Líder
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {jornalero.edad}
                                                </TableCell>
                                                <TableCell>
                                                    {jornalero.estado}
                                                </TableCell>
                                                <TableCell>
                                                    {esLider
                                                        ? "Líder"
                                                        : "Miembro"}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleRemoveJornalero(
                                                                jornalero
                                                            )
                                                        }
                                                        disabled={esLider}
                                                        title={
                                                            esLider
                                                                ? "No se puede remover al líder"
                                                                : "Remover de la cuadrilla"
                                                        }
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground my-4">
                                No hay jornaleros asignados a esta cuadrilla.
                            </p>
                        )}

                        <h3 className="text-lg font-semibold mt-6 mb-2">
                            Jornaleros Disponibles (
                            {jornalerosDisponibles.length})
                        </h3>
                        {jornalerosDisponibles.length > 0 ? (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    * Los líderes de otras cuadrillas no
                                    aparecen aquí hasta que se asigne otro líder
                                    a su cuadrilla.
                                </p>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Edad</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>
                                                Cuadrilla Actual
                                            </TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {jornalerosDisponibles.map(
                                            (jornalero) => (
                                                <TableRow
                                                    key={`available-${jornalero.id}`}
                                                >
                                                    <TableCell>
                                                        {jornalero.id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {jornalero.nombre}
                                                    </TableCell>
                                                    <TableCell>
                                                        {jornalero.edad}
                                                    </TableCell>
                                                    <TableCell>
                                                        {jornalero.estado}
                                                    </TableCell>
                                                    <TableCell>
                                                        {jornalero.cuadrilla_id
                                                            ? `Cuadrilla ${jornalero.cuadrilla_id}`
                                                            : "Sin asignar"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleAddJornalero(
                                                                    jornalero
                                                                )
                                                            }
                                                            title="Agregar a esta cuadrilla"
                                                        >
                                                            <UserPlus className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground my-4">
                                No hay jornaleros disponibles para agregar.
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
