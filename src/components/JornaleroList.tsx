"use client";

import { useState, useEffect } from "react";
import type { Jornalero } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { JornaleroForm } from "./JornaleroForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { useJornaleroStore } from "@/lib/store";

export function JornaleroList() {
  const { jornaleros, loading, error, fetchJornaleros } = useJornaleroStore();
  const [editJornaleroId, setEditJornaleroId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchJornaleros();
  }, [fetchJornaleros]);

  const handleEdit = (id: number) => {
    setEditJornaleroId(id);
    setIsDialogOpen(true);
  };

  const handleEditSuccess = () => {
    // Cerrar el diálogo
    setIsDialogOpen(false);
    // Ya no necesitamos recargar explícitamente porque la tienda se actualiza automáticamente
    // Limpiar el ID seleccionado
    setEditJornaleroId(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Jornaleros Registrados</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchJornaleros}
          >
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : jornaleros.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No hay jornaleros registrados.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Producción</TableHead>
                  <TableHead>Errores</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jornaleros.map((jornalero) => (
                  <TableRow key={jornalero.id}>
                    <TableCell>{jornalero.id}</TableCell>
                    <TableCell className="font-medium">{jornalero.nombre}</TableCell>
                    <TableCell>{jornalero.edad}</TableCell>
                    <TableCell>{jornalero.produccion ?? 'N/A'}</TableCell>
                    <TableCell>{jornalero.errores}</TableCell>
                    <TableCell>{jornalero.activo ? 'Activo' : 'Inactivo'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(jornalero.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de edición */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Jornalero</DialogTitle>
            <DialogDescription>
              Modifique los datos del jornalero y guarde los cambios.
            </DialogDescription>
          </DialogHeader>
          {editJornaleroId && (
            <JornaleroForm jornaleroId={editJornaleroId} onSuccess={handleEditSuccess} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 