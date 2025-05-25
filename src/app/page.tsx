import { OnlineStatusIndicator } from "@/components/OnlineStatusIndicator";
import { Button } from "@/components/ui/button";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Bienvenido a NASE</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserRound className="h-5 w-5" />
                            Gestión de Jornaleros
                        </CardTitle>
                        <CardDescription>
                            Administra la información de tus jornaleros
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Registra nuevos jornaleros y consulta la información existente.</p>
                    </CardContent>
                    <CardFooter>
                        <Button asChild>
                            <Link href="/jornaleros">Ir a Jornaleros</Link>
                        </Button>
                    </CardFooter>
                </Card>
                
                {/* Más tarjetas pueden ser añadidas aquí para otras secciones */}
            </div>
            
            <div className="mt-6">
                <OnlineStatusIndicator />
            </div>
        </div>
    );
}
