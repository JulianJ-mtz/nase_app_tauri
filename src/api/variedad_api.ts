import { invoke } from '@tauri-apps/api/core';

export interface Variedad {
    id: number;
    codigo: number;
    nombre: string;
    created_at: string;
    updated_at: string;
}

export interface VariedadData {
    codigo: number;
    nombre: string;
}

export async function obtenerVariedades(): Promise<Variedad[]> {
    try {
        return await invoke<Variedad[]>('get_variedad');
    } catch (error) {
        console.error('Error al obtener variedades:', error);
        throw error;
    }
}

export async function obtenerVariedadPorId(id: number): Promise<Variedad | null> {
    try {
        return await invoke<Variedad | null>('get_variedad_by_id', { id });
    } catch (error) {
        console.error('Error al obtener variedad por ID:', error);
        throw error;
    }
}

export async function insertarVariedad(datos: VariedadData): Promise<string> {
    try {
        return await invoke<string>('post_variedad', { data: datos });
    } catch (error) {
        console.error('Error al insertar variedad:', error);
        throw error;
    }
}

export async function actualizarVariedad(id: number, datos: VariedadData): Promise<string> {
    try {
        return await invoke<string>('put_variedad', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar variedad:', error);
        throw error;
    }
}

export async function eliminarVariedad(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_variedad', { id });
    } catch (error) {
        console.error('Error al eliminar variedad:', error);
        throw error;
    }
} 