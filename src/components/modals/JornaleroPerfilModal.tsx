import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useJornaleroStore } from "@/lib/storeJornalero";
import { useCuadrillaStore } from "@/lib/storeCuadrilla";
import { Jornalero } from "@/api/jornalero_api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, AlertTriangle, Users, Crown } from "lucide-react";
import { formatCreatedAt } from "@/lib/utils";

interface JornaleroPerfilModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jornalero: Jornalero | null;
}

export function JornaleroPerfilModal({
    open,
    onOpenChange,
    jornalero,
}: JornaleroPerfilModalProps) {
    const { cuadrillas } = useCuadrillaStore();

    if (!jornalero) return null;

    const cuadrilla = jornalero.cuadrilla_id
        ? cuadrillas.find((c) => c.id === jornalero.cuadrilla_id)
        : null;

    // Verificar si el jornalero es líder de alguna cuadrilla
    const cuadrillaLiderada = cuadrillas.find(
        (c) => c.lider_cuadrilla_id === jornalero.id
    );
    const isLider = Boolean(cuadrillaLiderada);

    const getStatusColor = (estado: string) => {
        switch (estado) {
            case "Activo":
                return "bg-green-100 text-green-800 border-green-200";
            case "Inactivo":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Perfil del Jornalero
                        {isLider && (
                            <Crown className="h-5 w-5 text-yellow-600" />
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Información detallada del jornalero
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Nombre
                                </label>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    {jornalero.nombre}
                                    {isLider && (
                                        <Badge
                                            variant="secondary"
                                            className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                        >
                                            <Crown className="h-3 w-3 mr-1" />
                                            Líder
                                        </Badge>
                                    )}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    ID
                                </label>
                                <p className="flex items-center gap-2">
                                    <Badge variant="outline">
                                        #{jornalero.id}
                                    </Badge>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Edad
                                </label>
                                <p className="text-base">
                                    {jornalero.edad} años
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Estado
                                </label>
                                <p>
                                    <Badge
                                        className={getStatusColor(
                                            jornalero.estado
                                        )}
                                    >
                                        {jornalero.estado}
                                    </Badge>
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Fecha de Contratación
                                </label>
                                <p className="text-base">
                                    {formatCreatedAt(
                                        jornalero.fecha_contratacion
                                    )}
                                </p>
                            </div>

                            {jornalero.errores !== null && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                        <AlertTriangle className="h-4 w-4" />
                                        Errores Reportados
                                    </label>
                                    <p className="text-base">
                                        <Badge
                                            variant={
                                                jornalero.errores > 0
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                        >
                                            {jornalero.errores}
                                        </Badge>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Información de liderazgo */}
                    {isLider && cuadrillaLiderada ? (
                        <>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3">
                                    <Crown className="h-4 w-4" />
                                    Liderazgo de Cuadrilla
                                </label>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <span className="text-sm text-muted-foreground">
                                                Cuadrilla que Lidera:
                                            </span>
                                            <p className="font-medium">
                                                #{cuadrillaLiderada.id}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">
                                                Lote:
                                            </span>
                                            <p className="font-medium">
                                                {cuadrillaLiderada.lote ||
                                                    "No especificado"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />
                        </>
                    ) : (
                        <>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-3">
                                    <Users className="h-4 w-4" />
                                    Asignación de Cuadrilla
                                </label>

                                {cuadrilla ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    Cuadrilla ID:
                                                </span>
                                                <p className="font-medium">
                                                    #{cuadrilla.id}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-sm text-muted-foreground">
                                                    Lote:
                                                </span>
                                                <p className="font-medium">
                                                    {cuadrilla.lote ||
                                                        "No especificado"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                        <p className="text-muted-foreground">
                                            No asignado a ninguna cuadrilla
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Información adicional */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">
                            Información del Sistema
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {jornalero.created_at && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Registrado:
                                    </span>
                                    <p className="font-medium">
                                        {formatCreatedAt(jornalero.created_at)}
                                    </p>
                                </div>
                            )}
                            {jornalero.updated_at && (
                                <div>
                                    <span className="text-sm text-muted-foreground">
                                        Última Actualización:
                                    </span>
                                    <p className="font-medium">
                                        {formatCreatedAt(jornalero.updated_at)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
