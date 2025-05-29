import { invoke } from '@tauri-apps/api/core';

export interface Cliente {
    id: number;
    codigo: number;
    nombre: string;
    created_at: string;
    updated_at: string;
}

export interface ClienteData {
    codigo: number;
    nombre: string;
}

export async function obtenerClientes(): Promise<Cliente[]> {
    try {
        return await invoke<Cliente[]>('get_cliente');
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        throw error;
    }
}

export async function obtenerClientePorId(id: number): Promise<Cliente | null> {
    try {
        return await invoke<Cliente | null>('get_cliente_by_id', { id });
    } catch (error) {
        console.error('Error al obtener cliente por ID:', error);
        throw error;
    }
}

export async function insertarCliente(datos: ClienteData): Promise<string> {
    try {
        return await invoke<string>('post_cliente', { data: datos });
    } catch (error) {
        console.error('Error al insertar cliente:', error);
        throw error;
    }
}

export async function actualizarCliente(id: number, datos: ClienteData): Promise<string> {
    try {
        return await invoke<string>('put_cliente', { id, data: datos });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        throw error;
    }
}

export async function eliminarCliente(id: number): Promise<string> {
    try {
        return await invoke<string>('delete_cliente', { id });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        throw error;
    }
} 