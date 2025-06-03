import { invoke } from '@tauri-apps/api/core';

// Define the Produccion interface to match the Rust ProduccionResponse struct
export interface Produccion {
    id: number;
    cuadrilla_id: number;
    temporada_id: number;
    tipo_uva_id: number;
    tipo_empaque_id: number;
    cliente_id: number;
    // lote: string;
    cantidad: number;
    cajas_no_aceptadas: number;
    fecha: string; // Added field to match the backend
    created_at?: string; // Optional field
    updated_at?: string; // Optional field
}

// Define the ProduccionData interface for inserting new records
export interface ProduccionData {
    cuadrilla_id: number;
    temporada_id: number;
    tipo_uva_id: number;
    tipo_empaque_id: number;
    cliente_id: number;
    // lote: string;
    cantidad: number; // Adjust type if using Decimal in Rust
    cajas_no_aceptadas: number;
    fecha: string; // Add this required field - use ISO date format (YYYY-MM-DD)
}

// Function to obtain all Produccion records
export async function obtenerProducciones(): Promise<Produccion[]> {
    try {
        return await invoke<Produccion[]>('get_produccion');
    } catch (error) {
        console.error('Error al obtener Producciones:', error);
        throw error;
    }
}

// Function to obtain a Produccion by ID
export async function obtenerProduccionPorId(id: number): Promise<Produccion | null> {
    try {
        return await invoke<Produccion | null>('get_produccion_by_id', { id });
    } catch (error) {
        console.error('Error al obtener Produccion por ID:', error);
        throw error;
    }
}

// Function to insert a new Produccion
export async function insertarProduccion(datos: ProduccionData): Promise<Produccion> {
    try {
        return await invoke<Produccion>('post_produccion', { data: datos });
    } catch (error) {
        console.error('Error al insertar Produccion:', error);
        throw error;
    }
}

// Function to update an existing Produccion
export async function actualizarProduccion(id: number, datos: ProduccionData): Promise<Produccion> {
    try {
        return await invoke<Produccion>('put_produccion', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar Produccion:', error);
        throw error;
    }
}

// Function to delete a Produccion
export async function eliminarProduccion(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_produccion', { id });
    } catch (error) {
        console.error('Error al eliminar Produccion:', error);
        throw error;
    }
}