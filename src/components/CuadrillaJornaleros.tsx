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
import { UserPlus, UserMinus, RefreshCcw } from "lucide-react";

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
    } = useCuadrillaStore();
    const { jornaleros, updateJornalero } = useJornaleroStore();
    const [cuadrilla, setCuadrilla] = useState<Cuadrilla | null>(null);
    const [jornalerosDisponibles, setJornalerosDisponibles] = useState<
        Jornalero[]
    >([]);

    useEffect(() => {
        // Cargar los jornaleros de esta cuadrilla
        fetchJornalerosByCuadrillaId(cuadrillaId);

        // Cargar información de la cuadrilla
        getCuadrillaById(cuadrillaId).then((data) => {
            if (data) setCuadrilla(data);
        });

        // Filtrar jornaleros disponibles (sin cuadrilla o con otra cuadrilla)
        const disponibles = jornaleros.filter(
            (j) => j.cuadrilla_id === null || j.cuadrilla_id !== cuadrillaId
        );
        setJornalerosDisponibles(disponibles);
    }, [
        cuadrillaId,
        fetchJornalerosByCuadrillaId,
        getCuadrillaById,
        jornaleros,
    ]);

    const handleAddJornalero = async (jornalero: Jornalero) => {
        try {
            await updateJornalero(jornalero.id, {
                ...jornalero,
                cuadrilla_id: cuadrillaId,
            });
            // Actualizar la lista de jornaleros de esta cuadrilla
            fetchJornalerosByCuadrillaId(cuadrillaId);
        } catch (error) {
            console.error("Error al agregar jornalero a la cuadrilla:", error);
        }
    };

    const handleRemoveJornalero = async (jornalero: Jornalero) => {
        try {
            await updateJornalero(jornalero.id, {
                ...jornalero,
                cuadrilla_id: null,
            });
            // Actualizar la lista de jornaleros de esta cuadrilla
            fetchJornalerosByCuadrillaId(cuadrillaId);
        } catch (error) {
            console.error("Error al remover jornalero de la cuadrilla:", error);
        }
    };

    const jornalerosEnCuadrilla = jornalerosPorCuadrilla[cuadrillaId] || [];

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                    {cuadrilla?.LiderCuadrilla || `ID de la cuadrilla: ${cuadrillaId}`}
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
                            Jornaleros Asignados
                        </h3>
                        {jornalerosEnCuadrilla.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Edad</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Producción</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jornalerosEnCuadrilla.map((jornalero) => (
                                        <TableRow key={jornalero.id}>
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
                                                {jornalero.produccion_jornalero ||
                                                    0}
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
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground my-4">
                                No hay jornaleros asignados a esta cuadrilla.
                            </p>
                        )}

                        <h3 className="text-lg font-semibold mt-6 mb-2">
                            Jornaleros Disponibles
                        </h3>
                        {jornalerosDisponibles.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Nombre</TableHead>
                                        <TableHead>Edad</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jornalerosDisponibles.map((jornalero) => (
                                        <TableRow key={jornalero.id}>
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
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        handleAddJornalero(
                                                            jornalero
                                                        )
                                                    }
                                                >
                                                    <UserPlus className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <p className="text-muted-foreground my-4">
                                No hay jornaleros disponibles.
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
