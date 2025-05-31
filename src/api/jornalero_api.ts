import { invoke } from '@tauri-apps/api/core';

export interface Jornalero {
    id: number;
    nombre: string;
    edad: number;
    estado: string;
    fecha_contratacion: string;
    produccion_jornalero: number | null;
    errores: number | null;
    cuadrilla_id: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface JornaleroData {
    nombre: string;
    edad: number;
    estado: string;
    fecha_contratacion: string;
    errores?: number | null;
    cuadrilla_id?: number | null;
}

export async function obtenerJornaleros(): Promise<Jornalero[]> {
    try {
        return await invoke<Jornalero[]>('get_jornaleros');
    } catch (error) {
        console.error('Error al obtener jornaleros:', error);
        throw error;
    }
}

export async function obtenerTodosLosJornaleros(): Promise<Jornalero[]> {
    try {
        return await invoke<Jornalero[]>('get_all_jornaleros');
    } catch (error) {
        console.error('Error al obtener todos los jornaleros:', error);
        throw error;
    }
}

export async function obtenerJornalerosInactivos(): Promise<Jornalero[]> {
    try {
        return await invoke<Jornalero[]>('get_inactive_jornaleros');
    } catch (error) {
        console.error('Error al obtener jornaleros inactivos:', error);
        throw error;
    }
}

export async function obtenerJornaleroPorId(id: number): Promise<Jornalero | null> {
    try {
        return await invoke<Jornalero | null>('get_jornalero_by_id', { id });
    } catch (error) {
        console.error('Error al obtener jornalero por ID:', error);
        throw error;
    }
}

export async function obtenerJornalerosPorCuadrilla(cuadrillaId: number): Promise<Jornalero[]> {
    try {
        return await invoke<Jornalero[]>('get_jornaleros_by_cuadrilla', { cuadrillaId });
    } catch (error) {
        console.error('Error al obtener jornaleros por cuadrilla:', error);
        throw error;
    }
}

// Función para insertar un nuevo jornalero
export async function insertarJornalero(datos: JornaleroData): Promise<string> {
    try {
        return await invoke<string>('post_jornalero', { data: datos });
    } catch (error) {
        console.error('Error al insertar jornalero:', error);
        throw error;
    }
}

// Función para actualizar un jornalero existente
export async function actualizarJornalero(id: number, datos: JornaleroData): Promise<string> {
    try {
        return await invoke<string>('put_jornalero', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar jornalero:', error);
        throw error;
    }
}

export async function eliminarJornalero(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_jornalero', { id });
    } catch (error) {
        console.error('Error al eliminar jornalero:', error);
        throw error;
    }
}

export async function reactivarJornalero(id: number): Promise<string> {
    try {
        return await invoke<string>('reactivate_jornalero', { id });
    } catch (error) {
        console.error('Error al reactivar jornalero:', error);
        throw error;
    }
}