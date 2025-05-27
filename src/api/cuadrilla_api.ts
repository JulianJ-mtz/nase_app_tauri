import { invoke } from "@tauri-apps/api/core";

export interface Cuadrilla {
    id: number;
    LiderCuadrilla: string;
    ProduccionCuadrilla: number;
    Lote: string;
    Variedad: string;
    Integrantes: string;
    Empaque: string | null;
    TemporadaId: number;
    CreatedAt: string;
    UpdatedAt: string;
}


export interface CuadrillaData {
    LiderCuadrilla: string;
    ProduccionCuadrilla: number | null;
    Lote: string;
    Variedad: string;
    Integrantes: string;
    Empaque: string | null;
    TemporadaId: number | null;
}


export async function obtenerCuadrillas(): Promise<Cuadrilla[]> {
    try {
        return await invoke<Cuadrilla[]>('get_cuadrillas');
    } catch (error) {
        console.error('Error al obtener cuadrillas:', error);
        throw error;
    }
}

export async function obtenerCuadrillaPorId(id: number): Promise<Cuadrilla | null> {
    try {
        return await invoke<Cuadrilla | null>('get_cuadrilla_by_id', { id });
    } catch (error) {
        console.error('Error al obtener cuadrilla por ID:', error);
        throw error;
    }
}


export async function insertarCuadrilla(datos: CuadrillaData): Promise<string> {
    try {
        return await invoke<string>('post_cuadrilla', { data: datos });
    } catch (error) {
        console.error('Error al insertar cuadrilla:', error);
        throw error;
    }
}

export async function actualizarCuadrilla(id: number, datos: CuadrillaData): Promise<string> {
    try {
        return await invoke<string>('put_cuadrilla', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar cuadrilla:', error);
        throw error;
    }
}

export async function eliminarCuadrilla(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_cuadrilla', { id });
    } catch (error) {
        console.error('Error al eliminar cuadrilla:', error);
        throw error;
    }
}