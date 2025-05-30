
import { invoke } from '@tauri-apps/api/core';

export interface Temporada {
    id: number,
    fecha_inicial: string,
    fecha_final?: string,
    created_at: string,
    updated_at: string,
}

export interface TemporadaData {
    fecha_inicial: string,
    fecha_final?: string,
}

export async function obtenerTemporadas(): Promise<Temporada[]> {
    try {
        return await invoke<Temporada[]>('get_temporadas');
    } catch (error) {
        console.error('Error al obtener Temporadas:', error);
        throw error;
    }
}

export async function obtenerTemporadaPorId(id: number): Promise<Temporada | null> {
    try {
        return await invoke<Temporada | null>('get_temporada_by_id', { id });
    } catch (error) {
        console.error('Error al obtener Temporada por ID:', error);
        throw error;
    }
}

// Función para insertar un nuevo Temporada
export async function insertarTemporada(datos: TemporadaData): Promise<string> {
    try {
        return await invoke<string>('post_temporada', { data: datos });
    } catch (error) {
        console.error('Error al insertar Temporada:', error);
        throw error;
    }
}

// Función para actualizar un Temporada existente
export async function actualizarTemporada(id: number, datos: TemporadaData): Promise<string> {
    try {
        return await invoke<string>('put_temporada', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar Temporada:', error);
        throw error;
    }
}

export async function eliminarTemporada(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_temporada', { id });
    } catch (error) {
        console.error('Error al eliminar Temporada:', error);
        throw error;
    }
}