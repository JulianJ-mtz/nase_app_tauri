import { create } from 'zustand';
import { obtenerJornaleros, insertarJornalero, actualizarJornalero, obtenerJornaleroPorId } from './api';
import type { Jornalero, JornaleroData } from './api';

interface JornaleroStore {
    // Estado
    jornaleros: Jornalero[];
    loading: boolean;
    error: string | null;

    // Acciones
    fetchJornaleros: () => Promise<void>;
    addJornalero: (data: JornaleroData) => Promise<string>;
    updateJornalero: (id: number, data: JornaleroData) => Promise<string>;
    getJornaleroById: (id: number) => Promise<Jornalero | null>;
}

export const useJornaleroStore = create<JornaleroStore>((set, get) => ({
    jornaleros: [],
    loading: false,
    error: null,

    fetchJornaleros: async () => {
        try {
            set({ loading: true, error: null });
            const data = await obtenerJornaleros();
            set({ jornaleros: data, loading: false });
        } catch (error) {
            console.error('Error fetching jornaleros:', error);
            set({ error: 'Error al cargar los jornaleros', loading: false });
        }
    },

    addJornalero: async (data: JornaleroData) => {
        try {
            set({ loading: true, error: null });
            const result = await insertarJornalero(data);
            // Refrescar la lista después de agregar
            await get().fetchJornaleros();
            return result;
        } catch (error) {
            console.error('Error adding jornalero:', error);
            set({ error: 'Error al agregar jornalero', loading: false });
            throw error;
        }
    },

    updateJornalero: async (id: number, data: JornaleroData) => {
        try {
            set({ loading: true, error: null });
            const result = await actualizarJornalero(id, data);
            // Refrescar la lista después de actualizar
            await get().fetchJornaleros();
            return result;
        } catch (error) {
            console.error('Error updating jornalero:', error);
            set({ error: 'Error al actualizar jornalero', loading: false });
            throw error;
        }
    },

    getJornaleroById: async (id: number) => {
        try {
            return await obtenerJornaleroPorId(id);
        } catch (error) {
            console.error('Error getting jornalero by id:', error);
            set({ error: 'Error al obtener jornalero por ID' });
            return null;
        }
    }
})); 