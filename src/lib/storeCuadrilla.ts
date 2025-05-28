import { create } from 'zustand';
import {
  obtenerCuadrillas,
  insertarCuadrilla,
  actualizarCuadrilla,
  obtenerCuadrillaPorId,
  eliminarCuadrilla,
} from '@/api/cuadrilla_api';
import type { Cuadrilla, CuadrillaData } from '@/api/cuadrilla_api';
import { obtenerJornalerosPorCuadrilla } from '@/api/jornalero_api';
import type { Jornalero } from '@/api/jornalero_api';

interface CuadrillaStore {
  cuadrillas: Cuadrilla[];
  loading: boolean;
  error: string | null;
  jornalerosPorCuadrilla: Record<number, Jornalero[]>;

  fetchCuadrillas: () => Promise<void>;
  addCuadrilla: (data: CuadrillaData) => Promise<string>;
  updateCuadrilla: (id: number, data: CuadrillaData) => Promise<string>;
  getCuadrillaById: (id: number) => Promise<Cuadrilla | null>;
  deleteCuadrilla: (id: number) => Promise<string>;
  fetchJornalerosByCuadrillaId: (cuadrillaId: number) => Promise<void>;
}

export const useCuadrillaStore = create<CuadrillaStore>((set, get) => ({
  cuadrillas: [],
  loading: false,
  error: null,
  jornalerosPorCuadrilla: {},

  fetchCuadrillas: async () => {
    try {
      set({ loading: true, error: null });
      const data = await obtenerCuadrillas();
      set({ cuadrillas: data, loading: false });
    } catch (error) {
      console.error('Error fetching cuadrillas:', error);
      set({ error: 'Error al cargar las cuadrillas', loading: false });
    }
  },

  addCuadrilla: async (data: CuadrillaData) => {
    try {
      set({ loading: true, error: null });
      const result = await insertarCuadrilla(data);
      await get().fetchCuadrillas();
      return result;
    } catch (error) {
      console.error('Error adding cuadrilla:', error);
      set({ error: 'Error al agregar cuadrilla', loading: false });
      throw error;
    }
  },

  updateCuadrilla: async (id: number, data: CuadrillaData) => {
    try {
      set({ loading: true, error: null });
      const result = await actualizarCuadrilla(id, data);
      await get().fetchCuadrillas();
      return result;
    } catch (error) {
      console.error('Error updating cuadrilla:', error);
      set({ error: 'Error al actualizar cuadrilla', loading: false });
      throw error;
    }
  },

  getCuadrillaById: async (id: number) => {
    try {
      return await obtenerCuadrillaPorId(id);
    } catch (error) {
      console.error('Error getting cuadrilla by id:', error);
      set({ error: 'Error al obtener cuadrilla por ID' });
      return null;
    }
  },

  deleteCuadrilla: async (id: number) => {
    try {
      set((state) => ({
        cuadrillas: state.cuadrillas.filter(c => c.id !== id),
        error: null
      }));
      const result = await eliminarCuadrilla(id);
      return result;
    } catch (error) {
      console.error('Error deleting cuadrilla:', error);
      await get().fetchCuadrillas();
      set({ error: 'Error al eliminar cuadrilla' });
      throw error;
    }
  },

  fetchJornalerosByCuadrillaId: async (cuadrillaId: number) => {
    try {
      set({ loading: true, error: null });
      const jornalerosFiltered = await obtenerJornalerosPorCuadrilla(cuadrillaId);

      set(state => ({
        jornalerosPorCuadrilla: {
          ...state.jornalerosPorCuadrilla,
          [cuadrillaId]: jornalerosFiltered
        },
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching jornaleros by cuadrilla:', error);
      set({
        error: "Error al cargar jornaleros por cuadrilla",
        loading: false,
      });
    }
  },
}));
