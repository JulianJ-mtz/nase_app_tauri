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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Temporada,
    TemporadaData,
    obtenerTemporadas,
    insertarTemporada,
    actualizarTemporada,
    eliminarTemporada,
} from "@/api/temporada_api";
import { toast } from "@/components/ui/use-toast";

export default function TemporadasPage() {
    const [temporadas, setTemporadas] = useState<Temporada[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTemporada, setCurrentTemporada] = useState<Temporada | null>(
        null
    );

    // Form state
    const [fechaInicial, setFechaInicial] = useState<Date | undefined>(
        undefined
    );
    const [fechaFinal, setFechaFinal] = useState<Date | undefined>(undefined);

    useEffect(() => {
        loadTemporadas();
    }, []);

    const loadTemporadas = async () => {
        try {
            setLoading(true);
            const data = await obtenerTemporadas();
            setTemporadas(data);
        } catch (error) {
            console.error("Error cargando temporadas:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar las temporadas",
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFechaInicial(undefined);
        setFechaFinal(undefined);
        setCurrentTemporada(null);
        setEditMode(false);
    };

    const handleOpenChange = (open: boolean) => {
        setOpen(open);
        if (!open) {
            resetForm();
        }
    };

    const handleEditTemporada = (temporada: Temporada) => {
        setCurrentTemporada(temporada);
        setFechaInicial(
            temporada.fecha_inicial
                ? new Date(temporada.fecha_inicial)
                : undefined
        );
        setFechaFinal(
            temporada.fecha_final ? new Date(temporada.fecha_final) : undefined
        );
        setEditMode(true);
        setOpen(true);
    };

    const handleDeleteTemporada = async (id: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar esta temporada?")) {
            try {
                await eliminarTemporada(id);
                toast({
                    title: "Éxito",
                    description: "Temporada eliminada correctamente",
                });
                loadTemporadas();
            } catch (error) {
                console.error("Error eliminando temporada:", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "No se pudo eliminar la temporada",
                });
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fechaInicial) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "La fecha inicial es obligatoria",
            });
            return;
        }

        const temporadaData: TemporadaData = {
            fecha_inicial: fechaInicial.toISOString().split("T")[0],
            fecha_final: fechaFinal
                ? fechaFinal.toISOString().split("T")[0]
                : undefined,
        };

        try {
            if (editMode && currentTemporada) {
                await actualizarTemporada(currentTemporada.id, temporadaData);
                toast({
                    title: "Éxito",
                    description: "Temporada actualizada correctamente",
                });
            } else {
                await insertarTemporada(temporadaData);
                toast({
                    title: "Éxito",
                    description: "Temporada creada correctamente",
                });
            }

            setOpen(false);
            resetForm();
            loadTemporadas();
        } catch (error) {
            console.error("Error guardando temporada:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo guardar la temporada",
            });
        }
    };

    const calculateMeses = () => {
        if (fechaInicial && fechaFinal) {
            const diffTime = Math.abs(
                fechaFinal.getTime() - fechaInicial.getTime()
            );
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diffMonths = Math.ceil(diffDays / 30);
        }
    };

    useEffect(() => {
        calculateMeses();
    }, [fechaInicial, fechaFinal]);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Temporadas</h1>
                <Dialog open={open} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>Nueva Temporada</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editMode
                                    ? "Editar Temporada"
                                    : "Nueva Temporada"}
                            </DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 pt-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="fechaInicial">
                                    Fecha Inicial *
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !fechaInicial &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {fechaInicial
                                                ? format(fechaInicial, "PPP", {
                                                      locale: es,
                                                  })
                                                : "Seleccionar fecha"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={fechaInicial}
                                            onSelect={setFechaInicial}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fechaFinal">Fecha Final</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !fechaFinal &&
                                                    "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {fechaFinal
                                                ? format(fechaFinal, "PPP", {
                                                      locale: es,
                                                  })
                                                : "Seleccionar fecha"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={fechaFinal}
                                            onSelect={setFechaFinal}
                                            initialFocus
                                            disabled={(date) =>
                                                fechaInicial
                                                    ? date < fechaInicial
                                                    : false
                                            }
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="meses">Meses</Label>
                                <Input
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                    }}
                                    id="meses"
                                    type="number"
                                    value={""}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="produccionTotal">
                                    Producción Total
                                </Label>
                                <Input
                                    onChange={(e) => {
                                        console.log(e.target.value);
                                    }}
                                    id="produccionTotal"
                                    type="number"
                                    step="0.01"
                                    value={""}
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">
                                    {editMode ? "Actualizar" : "Crear"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Temporadas</CardTitle>
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
                                    <TableHead>Fecha Inicial</TableHead>
                                    <TableHead>Fecha Final</TableHead>
                                    <TableHead className="text-right">
                                        Acciones
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {temporadas.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center"
                                        >
                                            No hay temporadas registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    temporadas.map((temporada) => (
                                        <TableRow key={temporada.id}>
                                            <TableCell>
                                                {temporada.id}
                                            </TableCell>
                                            <TableCell>
                                                {temporada.fecha_inicial
                                                    ? format(
                                                          new Date(
                                                              temporada.fecha_inicial
                                                          ),
                                                          "dd/MM/yyyy"
                                                      )
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                {temporada.fecha_final
                                                    ? format(
                                                          new Date(
                                                              temporada.fecha_final
                                                          ),
                                                          "dd/MM/yyyy"
                                                      )
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditTemporada(
                                                                temporada
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDeleteTemporada(
                                                                temporada.id
                                                            )
                                                        }
                                                    >
                                                        Eliminar
                                                    </Button>
                                                </div>
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
