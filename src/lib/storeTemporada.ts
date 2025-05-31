import { create } from "zustand";
import {
    insertarTemporada,
    obtenerTemporadas,
    actualizarTemporada,
    eliminarTemporada,
    obtenerTemporadaPorId,
    type TemporadaData,
    type Temporada,
} from "@/api/temporada_api";

interface TemporadaState {
    temporadas: Temporada[];
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchTemporadas: () => Promise<void>;
    addTemporada: (data: TemporadaData) => Promise<string>;
    updateTemporada: (id: number, data: TemporadaData) => Promise<string>;
    deleteTemporada: (id: number) => Promise<string>;
    getTemporadaById: (id: number) => Promise<Temporada | null>;
    clearError: () => void;
}

export const useTemporadaStore = create<TemporadaState>((set, get) => ({
    temporadas: [],
    loading: false,
    error: null,

    fetchTemporadas: async () => {
        try {
            set({ loading: true, error: null });
            const temporadas = await obtenerTemporadas();
            set({ temporadas, loading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error desconocido";
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    addTemporada: async (data: TemporadaData) => {
        try {
            set({ loading: true, error: null });
            const message = await insertarTemporada(data);
            // Refresh the list
            await get().fetchTemporadas();
            set({ loading: false });
            return message;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error al agregar temporada";
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    updateTemporada: async (id: number, data: TemporadaData) => {
        try {
            set({ loading: true, error: null });
            const message = await actualizarTemporada(id, data);
            // Refresh the list
            await get().fetchTemporadas();
            set({ loading: false });
            return message;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error al actualizar temporada";
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    deleteTemporada: async (id: number) => {
        try {
            set({ loading: true, error: null });
            const message = await eliminarTemporada(id);
            // Refresh the list
            await get().fetchTemporadas();
            set({ loading: false });
            return message;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error al eliminar temporada";
            set({ error: errorMessage, loading: false });
            throw error;
        }
    },

    getTemporadaById: async (id: number) => {
        try {
            return await obtenerTemporadaPorId(id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Error al obtener temporada";
            set({ error: errorMessage });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
})); 