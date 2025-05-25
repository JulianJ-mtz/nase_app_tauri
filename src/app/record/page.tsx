"use client";

import { useEffect, useState } from "react";
// import { getEmpleados, deleteEmpleado, executeQuery } from "@/lib/api";
// import type { Employee } from "@/lib/api";
import { obtenerJornaleros, obtenerJornaleroPorId } from "@/lib/api";
import { Jornalero } from "@/lib/api";

export default function Record() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataEmployee, setDataEmployee] = useState<Jornalero[] | null>(null);

    const cargarJornaleros = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await obtenerJornaleros();
            setDataEmployee(data);
        } catch (err) {
            setError("Error al cargar los jornaleros. Intente nuevamente.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarJornaleros();
    }, []);

    if (loading) return <div>Cargando base de datos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {dataEmployee ? (
                <pre>{JSON.stringify(dataEmployee, null, 2)}</pre>
            ) : (
                "Loading database..."
            )}
        </div>
    );
}
