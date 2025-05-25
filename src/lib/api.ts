import { invoke } from '@tauri-apps/api/core';


export interface Jornalero {
    id: number;
    nombre: string;
    edad: number;
    produccion: number | null;
    errores: number;
    activo: boolean | null;
}

export interface JornaleroData {
    nombre: string;
    edad: number;
    produccion?: number | null;
    errores: number;
    activo?: boolean | null;
}

export async function obtenerJornaleros(): Promise<Jornalero[]> {
    try {
        return await invoke<Jornalero[]>('obtener_jornaleros');
    } catch (error) {
        console.error('Error al obtener jornaleros:', error);
        throw error;
    }
}

export async function obtenerJornaleroPorId(id: number): Promise<Jornalero | null> {
    try {
        return await invoke<Jornalero | null>('obtener_jornalero_por_id', { id });
    } catch (error) {
        console.error('Error al obtener jornalero por ID:', error);
        throw error;
    }
}

// Función para insertar un nuevo jornalero
export async function insertarJornalero(datos: JornaleroData): Promise<string> {
    try {
        return await invoke<string>('insertar_jornalero', {
            nombre: datos.nombre,
            edad: datos.edad,
            produccion: datos.produccion,
            errores: datos.errores,
            activo: datos.activo
        });
    } catch (error) {
        console.error('Error al insertar jornalero:', error);
        throw error;
    }
}

// Función para actualizar un jornalero existente
export async function actualizarJornalero(id: number, datos: JornaleroData): Promise<string> {
    try {
        return await invoke<string>('actualizar_jornalero', {
            id,
            nombre: datos.nombre,
            edad: datos.edad,
            produccion: datos.produccion,
            errores: datos.errores,
            activo: datos.activo
        });
    } catch (error) {
        console.error('Error al actualizar jornalero:', error);
        throw error;
    }
}