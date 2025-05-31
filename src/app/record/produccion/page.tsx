"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Temporada, obtenerTemporadas } from "@/api/temporada_api";
import { obtenerVariedades, Variedad } from "@/api/variedad_api";
import { obtenerTiposUva, TipoUva } from "@/api/tipo_uva_api";
import { obtenerTiposEmpaque, TipoEmpaque } from "@/api/tipo_empaque_api";
import { obtenerClientes, Cliente } from "@/api/cliente_api";
import {
    Produccion,
    ProduccionData,
    obtenerProducciones,
    insertarProduccion,
    eliminarProduccion,
} from "@/api/produccion_api";
import { Cuadrilla, obtenerCuadrillas } from "@/api/cuadrilla_api";
import { Jornalero, obtenerJornaleros } from "@/api/jornalero_api";

export default function ProduccionPage() {
    const [producciones, setProducciones] = useState<Produccion[]>([]);
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [variedades, setVariedades] = useState<Variedad[]>([]);
    const [tiposUva, setTiposUva] = useState<TipoUva[]>([]);
    const [tiposEmpaque, setTiposEmpaque] = useState<TipoEmpaque[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    // Form state
    const [temporadaId, setTemporadaId] = useState<number | undefined>(
        undefined
    );
    const [tipoUvaId, setTipoUvaId] = useState<number | undefined>(undefined);
    const [tipoEmpaqueId, setTipoEmpaqueId] = useState<number | undefined>(
        undefined
    );
    const [clienteId, setClienteId] = useState<number | undefined>(undefined);
    // const [lote, setLote] = useState("");
    const [cantidad, setCantidad] = useState<number | undefined>(undefined);
    const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
    const [cuadrillaId, setCuadrillaId] = useState<number | undefined>(
        undefined
    );
    const [jornaleros, setJornaleros] = useState<Jornalero[]>([]);
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [
                prodData,
                cuadrillaData,
                tempData,
                varData,
                tipoUvaData,
                tipoEmpData,
                clienteData,
                jornaleroData,
            ] = await Promise.all([
                obtenerProducciones(),
                obtenerCuadrillas(),
                obtenerTemporadas(),
                obtenerVariedades(),
                obtenerTiposUva(),
                obtenerTiposEmpaque(),
                obtenerClientes(),
                obtenerJornaleros(),
            ]);

            setProducciones(prodData);
            setCuadrillas(cuadrillaData);
            setTemporadas(tempData);
            setVariedades(varData);
            setTiposUva(tipoUvaData);
            setTiposEmpaque(tipoEmpData);
            setClientes(clienteData);
            setJornaleros(jornaleroData);
            // Seleccionar la temporada más reciente por defecto
            if (tempData.length > 0) {
                const latestTemporada = tempData.reduce((latest, current) => {
                    return new Date(current.fecha_inicial) >
                        new Date(latest.fecha_inicial)
                        ? current
                        : latest;
                }, tempData[0]);

                setTemporadaId(latestTemporada.id);
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los datos necesarios",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCuadrillaId(undefined);
        setTipoUvaId(undefined);
        setTipoEmpaqueId(undefined);
        setClienteId(undefined);
        setCantidad(undefined);
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            resetForm();
        }
    };

    const handleDeleteProduccion = async (id: number) => {
        if (
            confirm(
                "¿Estás seguro de que deseas eliminar este registro de producción?"
            )
        ) {
            try {
                await eliminarProduccion(id);
                toast({
                    title: "Éxito",
                    description:
                        "Registro de producción eliminado correctamente",
                });
                loadData();
            } catch (error) {
                console.error("Error eliminando producción:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        "No se pudo eliminar el registro de producción",
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !cuadrillaId ||
            !temporadaId ||
            !tipoUvaId ||
            !tipoEmpaqueId ||
            !clienteId ||
            !cantidad
        ) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Todos los campos son obligatorios",
            });
            return;
        }

        const produccionData: ProduccionData = {
            cuadrilla_id: cuadrillaId,
            temporada_id: temporadaId,
            tipo_uva_id: tipoUvaId,
            tipo_empaque_id: tipoEmpaqueId,
            cliente_id: clienteId,
            // lote,
            cantidad,
            fecha: new Date().toISOString().split("T")[0], // Format as YYYY-MM-DD
        };

        try {
            await insertarProduccion(produccionData);
            toast({
                title: "Éxito",
                description: "Producción registrada correctamente",
            });

            setOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error("Error guardando producción:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo guardar el registro de producción",
            });
        }
    };

    const getCuadrillaNombre = (id: number) => {
        const cuadrilla = cuadrillas.find((c) => c.id === id);
        return cuadrilla
            ? getJornaleroNombre(cuadrilla.lider_cuadrilla_id)
            : "Desconocida";
    };

    const getVariedadNombre = (id: number) => {
        const variedad = variedades.find((v) => v.id === id);
        return variedad ? variedad.nombre : "Desconocida";
    };

    const getTipoUvaNombre = (id: number) => {
        const tipoUva = tiposUva.find((t) => t.id === id);
        return tipoUva ? tipoUva.nombre : "Desconocido";
    };

    const getTipoEmpaqueNombre = (id: number) => {
        const tipoEmpaque = tiposEmpaque.find((t) => t.id === id);
        return tipoEmpaque ? tipoEmpaque.nombre : "Desconocido";
    };

    const getClienteNombre = (id: number) => {
        const cliente = clientes.find((c) => c.id === id);
        return cliente ? cliente.nombre : "Desconocido";
    };

    const getJornaleroNombre = (id: number | string) => {
        const numId = typeof id === "string" ? Number(id) : id;
        const jornalero = jornaleros.find((j) => j.id === numId);
        return jornalero ? jornalero.nombre : "Desconocido";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Registro de Producción</h1>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>Nuevo Registro</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>
                                Nuevo Registro de Producción
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cuadrilla">
                                        Cuadrilla *
                                    </Label>
                                    <Select
                                        value={cuadrillaId?.toString()}
                                        onValueChange={(value) =>
                                            setCuadrillaId(Number(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar cuadrilla" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loading ? (
                                                <div>
                                                    Cargando cuadrillas...
                                                </div>
                                            ) : (
                                                cuadrillas.map((cuadrilla) => (
                                                    <SelectItem
                                                        key={cuadrilla.id}
                                                        value={cuadrilla.id.toString()}
                                                    >
                                                        {getJornaleroNombre(
                                                            cuadrilla.lider_cuadrilla_id
                                                        )}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="temporada">
                                        Temporada *
                                    </Label>
                                    <Select
                                        value={temporadaId?.toString()}
                                        onValueChange={(value) =>
                                            setTemporadaId(Number(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar temporada" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {temporadas.map((temporada) => (
                                                <SelectItem
                                                    key={temporada.id}
                                                    value={temporada.id.toString()}
                                                >
                                                    Temporada {temporada.id} (
                                                    {formatDate(
                                                        temporada.fecha_inicial
                                                    )}
                                                    )
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoUva">
                                        Tipo de Uva *
                                    </Label>
                                    <Select
                                        value={tipoUvaId?.toString()}
                                        onValueChange={(value) =>
                                            setTipoUvaId(Number(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo de uva" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposUva.map((tipoUva) => (
                                                <SelectItem
                                                    key={tipoUva.id}
                                                    value={tipoUva.id.toString()}
                                                >
                                                    {tipoUva.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tipoEmpaque">
                                        Tipo de Empaque *
                                    </Label>
                                    <Select
                                        value={tipoEmpaqueId?.toString()}
                                        onValueChange={(value) =>
                                            setTipoEmpaqueId(Number(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tipo de empaque" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tiposEmpaque.map((tipoEmpaque) => (
                                                <SelectItem
                                                    key={tipoEmpaque.id}
                                                    value={tipoEmpaque.id.toString()}
                                                >
                                                    {tipoEmpaque.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="cliente">Cliente *</Label>
                                    <Select
                                        value={clienteId?.toString()}
                                        onValueChange={(value) =>
                                            setClienteId(Number(value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar cliente" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {clientes.map((cliente) => (
                                                <SelectItem
                                                    key={cliente.id}
                                                    value={cliente.id.toString()}
                                                >
                                                    {cliente.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cantidad">
                                        Cantidad (kg) *
                                    </Label>
                                    <Input
                                        id="cantidad"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={cantidad ?? ""}
                                        onChange={(e) =>
                                            setCantidad(
                                                e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined
                                            )
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Guardar</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registros de Producción</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            Cargando...
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Cuadrilla</TableHead>
                                    <TableHead>Variedad</TableHead>
                                    <TableHead>Tipo Uva</TableHead>
                                    <TableHead>Empaque</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Lote</TableHead>
                                    <TableHead>Cantidad (kg)</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {producciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="text-center"
                                        >
                                            No hay registros de producción
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    producciones.map((produccion) => (
                                        <TableRow key={produccion.id}>
                                            <TableCell>
                                                {produccion.id}
                                            </TableCell>
                                            <TableCell>
                                                {getCuadrillaNombre(
                                                    produccion.cuadrilla_id
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const cuadrilla =
                                                        cuadrillas.find(
                                                            (c) =>
                                                                c.id ===
                                                                produccion.cuadrilla_id
                                                        );
                                                    if (
                                                        !cuadrilla ||
                                                        !(
                                                            "variedad_id" in
                                                            cuadrilla
                                                        )
                                                    )
                                                        return "Desconocida";
                                                    return getVariedadNombre(
                                                        (cuadrilla as any)
                                                            .variedad_id
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {getTipoUvaNombre(
                                                    produccion.tipo_uva_id
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getTipoEmpaqueNombre(
                                                    produccion.tipo_empaque_id
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getClienteNombre(
                                                    produccion.cliente_id
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const cuadrilla =
                                                        cuadrillas.find(
                                                            (c) =>
                                                                c.id ===
                                                                produccion.cuadrilla_id
                                                        );
                                                    return cuadrilla
                                                        ? cuadrilla.lote
                                                        : "Desconocido";
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                {produccion.cantidad}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteProduccion(
                                                            produccion.id
                                                        )
                                                    }
                                                >
                                                    Eliminar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
