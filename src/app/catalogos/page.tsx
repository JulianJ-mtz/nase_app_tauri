"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grape, Package, Building, Layers } from "lucide-react";
import Link from "next/link";

export default function CatalogosPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Catálogos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grape className="h-5 w-5" />
              Variedades
            </CardTitle>
            <CardDescription>
              Gestiona las variedades de cultivos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Administra el catálogo de variedades disponibles.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/catalogos/variedades">Ir a Variedades</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grape className="h-5 w-5" />
              Tipos de Uva
            </CardTitle>
            <CardDescription>
              Gestiona los tipos de uva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Administra el catálogo de tipos de uva disponibles.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/catalogos/tipos-uva">Ir a Tipos de Uva</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Tipos de Empaque
            </CardTitle>
            <CardDescription>
              Gestiona los tipos de empaque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Administra el catálogo de tipos de empaque para los productos.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/catalogos/tipos-empaque">Ir a Tipos de Empaque</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>
              Gestiona los clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Administra el catálogo de clientes que reciben la producción.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/catalogos/clientes">Ir a Clientes</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 