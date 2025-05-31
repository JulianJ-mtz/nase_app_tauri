import { create } from 'zustand';
import { 
    obtenerJornaleros, 
    obtenerTodosLosJornaleros,
    obtenerJornalerosInactivos,
    insertarJornalero, 
    actualizarJornalero, 
    obtenerJornaleroPorId, 
    eliminarJornalero,
    reactivarJornalero 
} from '@/api/jornalero_api';
import type { Jornalero, JornaleroData } from '@/api/jornalero_api';

interface JornaleroStore {
    // Estado
    jornaleros: Jornalero[];
    jornalerosInactivos: Jornalero[];
    loading: boolean;
    error: string | null;

    // Acciones
    fetchJornaleros: () => Promise<void>;
    fetchAllJornaleros: () => Promise<void>;
    fetchJornalerosInactivos: () => Promise<void>;
    addJornalero: (data: JornaleroData) => Promise<string>;
    updateJornalero: (id: number, data: JornaleroData) => Promise<string>;
    getJornaleroById: (id: number) => Promise<Jornalero | null>;
    deleteJornalero: (id: number) => Promise<string>;
    reactivateJornalero: (id: number) => Promise<string>;
}

export const useJornaleroStore = create<JornaleroStore>((set, get) => ({
    jornaleros: [],
    jornalerosInactivos: [],
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

    fetchAllJornaleros: async () => {
        try {
            set({ loading: true, error: null });
            const data = await obtenerTodosLosJornaleros();
            // Separar activos e inactivos
            const activos = data.filter(j => j.estado === 'Activo');
            const inactivos = data.filter(j => j.estado === 'Inactivo');
            set({ jornaleros: activos, jornalerosInactivos: inactivos, loading: false });
        } catch (error) {
            console.error('Error fetching all jornaleros:', error);
            set({ error: 'Error al cargar todos los jornaleros', loading: false });
        }
    },

    fetchJornalerosInactivos: async () => {
        try {
            set({ loading: true, error: null });
            const data = await obtenerJornalerosInactivos();
            set({ jornalerosInactivos: data, loading: false });
        } catch (error) {
            console.error('Error fetching inactive jornaleros:', error);
            set({ error: 'Error al cargar los jornaleros inactivos', loading: false });
        }
    },

    addJornalero: async (data: JornaleroData) => {
        try {
            set({ loading: true, error: null });
            const result = await insertarJornalero(data);
            // Refrescar ambas listas después de agregar
            await get().fetchJornaleros();
            await get().fetchJornalerosInactivos();
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
            // Refrescar ambas listas después de actualizar
            await get().fetchJornaleros();
            await get().fetchJornalerosInactivos();
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
    },

    deleteJornalero: async (id: number) => {
        try {
            // Optimistic update: remove from UI first
            set((state) => ({
                jornaleros: state.jornaleros.filter(j => j.id !== id),
                error: null
            }));

            // Luego hacemos la petición a la API (soft delete)
            const result = await eliminarJornalero(id);
            
            // Refrescar ambas listas para asegurar consistencia
            await get().fetchJornaleros();
            await get().fetchJornalerosInactivos();
            
            return result;
        } catch (error) {
            console.error('Error deleting jornalero:', error);
            // Si hay error, volvemos a cargar los datos para asegurar consistencia
            await get().fetchJornaleros();
            set({ error: 'Error al desactivar jornalero' });
            throw error;
        }
    },

    reactivateJornalero: async (id: number) => {
        try {
            set({ loading: true, error: null });
            const result = await reactivarJornalero(id);
            
            // Refrescar ambas listas
            await get().fetchJornaleros();
            await get().fetchJornalerosInactivos();
            
            return result;
        } catch (error) {
            console.error('Error reactivating jornalero:', error);
            set({ error: 'Error al reactivar jornalero', loading: false });
            throw error;
        }
    }
}));