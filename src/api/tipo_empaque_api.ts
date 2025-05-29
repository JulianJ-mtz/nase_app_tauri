import { invoke } from '@tauri-apps/api/core';

export interface TipoEmpaque {
    id: number;
    codigo: number;
    nombre: string;
    created_at: string;
    updated_at: string;
}

export interface TipoEmpaqueData {
    codigo: number;
    nombre: string;
}

export async function obtenerTiposEmpaque(): Promise<TipoEmpaque[]> {
    try {
        return await invoke<TipoEmpaque[]>('get_tipo_empaque');
    } catch (error) {
        console.error('Error al obtener tipos de empaque:', error);
        throw error;
    }
}

export async function obtenerTipoEmpaquePorId(id: number): Promise<TipoEmpaque | null> {
    try {
        return await invoke<TipoEmpaque | null>('get_tipo_empaque_by_id', { id });
    } catch (error) {
        console.error('Error al obtener tipo de empaque por ID:', error);
        throw error;
    }
}

export async function insertarTipoEmpaque(datos: TipoEmpaqueData): Promise<string> {
    try {
        return await invoke<string>('post_tipo_empaque', { data: datos });
    } catch (error) {
        console.error('Error al insertar tipo de empaque:', error);
        throw error;
    }
}

export async function actualizarTipoEmpaque(id: number, datos: TipoEmpaqueData): Promise<string> {
    try {
        return await invoke<string>('put_tipo_empaque', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar tipo de empaque:', error);
        throw error;
    }
}

export async function eliminarTipoEmpaque(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_tipo_empaque', { id });
    } catch (error) {
        console.error('Error al eliminar tipo de empaque:', error);
        throw error;
    }
} 