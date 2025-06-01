import { create } from 'zustand';
import { 
    Produccion, 
    ProduccionData,
    obtenerProducciones,
    obtenerProduccionPorId,
    insertarProduccion,
    actualizarProduccion,
    eliminarProduccion
} from '@/api/produccion_api';

interface ProduccionStore {
    producciones: Produccion[];
    loading: boolean;
    error: string | null;
    
    // Fetch functions
    fetchProducciones: () => Promise<void>;
    fetchProduccionById: (id: number) => Promise<Produccion | null>;
    
    // CRUD operations
    createProduccion: (data: ProduccionData) => Promise<Produccion>;
    updateProduccion: (id: number, data: ProduccionData) => Promise<Produccion>;
    deleteProduccion: (id: number) => Promise<string>;
    
    // Utility functions
    clearError: () => void;
    getProduccionByCuadrilla: (cuadrillaId: number) => Produccion[];
    getProduccionByTemporada: (temporadaId: number) => Produccion[];
    getTotalProduccion: () => number;
    getProduccionTotalByCuadrilla: (cuadrillaId: number) => number;
}

export const useProduccionStore = create<ProduccionStore>((set, get) => ({
    producciones: [],
    loading: false,
    error: null,

    fetchProducciones: async () => {
        set({ loading: true, error: null });
        try {
            const producciones = await obtenerProducciones();
            set({ producciones, loading: false });
        } catch (error) {
            console.error('Error fetching producciones:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Error desconocido',
                loading: false 
            });
        }
    },

    fetchProduccionById: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const produccion = await obtenerProduccionPorId(id);
            set({ loading: false });
            return produccion;
        } catch (error) {
            console.error('Error fetching produccion by ID:', error);
            set({ 
                error: error instanceof Error ? error.message : 'Error desconocido',
                loading: false 
            });
            return null;
        }
    },

    createProduccion: async (data: ProduccionData) => {
        set({ loading: true, error: null });
        try {
            const nuevaProduccion = await insertarProduccion(data);
            set(state => ({
                producciones: [...state.producciones, nuevaProduccion],
                loading: false
            }));
            return nuevaProduccion;
        } catch (error) {
            console.error('Error creating produccion:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    },

    updateProduccion: async (id: number, data: ProduccionData) => {
        set({ loading: true, error: null });
        try {
            const produccionActualizada = await actualizarProduccion(id, data);
            set(state => ({
                producciones: state.producciones.map(p => 
                    p.id === id ? produccionActualizada : p
                ),
                loading: false
            }));
            return produccionActualizada;
        } catch (error) {
            console.error('Error updating produccion:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    },

    deleteProduccion: async (id: number) => {
        set({ loading: true, error: null });
        try {
            const message = await eliminarProduccion(id);
            set(state => ({
                producciones: state.producciones.filter(p => p.id !== id),
                loading: false
            }));
            return message;
        } catch (error) {
            console.error('Error deleting produccion:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            set({ error: errorMessage, loading: false });
            throw new Error(errorMessage);
        }
    },

    clearError: () => set({ error: null }),

    getProduccionByCuadrilla: (cuadrillaId: number) => {
        return get().producciones.filter(p => p.cuadrilla_id === cuadrillaId);
    },

    getProduccionByTemporada: (temporadaId: number) => {
        return get().producciones.filter(p => p.temporada_id === temporadaId);
    },

    getTotalProduccion: () => {
        return get().producciones.reduce((total, p) => {
            const cantidad = Number(p.cantidad) || 0;
            return total + cantidad;
        }, 0);
    },

    getProduccionTotalByCuadrilla: (cuadrillaId: number) => {
        return get().producciones
            .filter(p => p.cuadrilla_id === cuadrillaId)
            .reduce((total, p) => {
                const cantidad = Number(p.cantidad) || 0;
                return total + cantidad;
            }, 0);
    },
})); 