"use client";

import { useEffect, useState } from "react";
// import { getEmpleados, deleteEmpleado, executeQuery } from "@/lib/api";
// import type { Employee } from "@/lib/api";

export default function Record() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<Employee[] | null>(null);

    useEffect(() => {
        async function initDb() {
            try {
                // Asegúrate de que el nombre coincida con el de main.rs
                const db = await Database.load("sqlite:test_nase.db");
                console.log("Database loaded successfully");

                // Opcional: verifica si la tabla existe
                const result = await db.select<Employee[]>("SELECT * FROM empleadosTest");
                console.log("Database result:", result);
                setData(result);

                setLoading(false);
            } catch (err) {
                console.error("Database error:", err);
                setError(String(err));
                setLoading(false);
            }
        }

        initDb();
    }, []);

    if (loading) return <div>Cargando base de datos...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                "Loading database..."
            )}
        </div>
    );
}
