import { invoke } from '@tauri-apps/api/core';

export interface TipoUva {
    id: number;
    codigo: number;
    nombre: string;
    created_at: string;
    updated_at: string;
}

export interface TipoUvaData {
    codigo: number;
    nombre: string;
}

export async function obtenerTiposUva(): Promise<TipoUva[]> {
    try {
        return await invoke<TipoUva[]>('get_tipo_uva');
    } catch (error) {
        console.error('Error al obtener tipos de uva:', error);
        throw error;
    }
}

export async function obtenerTipoUvaPorId(id: number): Promise<TipoUva | null> {
    try {
        return await invoke<TipoUva | null>('get_tipo_uva_by_id', { id });
    } catch (error) {
        console.error('Error al obtener tipo de uva por ID:', error);
        throw error;
    }
}

export async function insertarTipoUva(datos: TipoUvaData): Promise<string> {
    try {
        return await invoke<string>('post_tipo_uva', { data: datos });
    } catch (error) {
        console.error('Error al insertar tipo de uva:', error);
        throw error;
    }
}

export async function actualizarTipoUva(id: number, datos: TipoUvaData): Promise<string> {
    try {
        return await invoke<string>('put_tipo_uva', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar tipo de uva:', error);
        throw error;
    }
}

export async function eliminarTipoUva(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_tipo_uva', { id });
    } catch (error) {
        console.error('Error al eliminar tipo de uva:', error);
        throw error;
    }
} 