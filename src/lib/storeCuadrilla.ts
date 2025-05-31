import { create } from 'zustand';
import {
  obtenerCuadrillas,
  insertarCuadrilla,
  actualizarCuadrilla,
  obtenerCuadrillaPorId,
  eliminarCuadrilla,
  obtenerWarningEliminacionCuadrilla,
  forceEliminarCuadrilla,
  reasignarJornalerosDeCuadrilla,
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
  getDeleteWarning: (id: number) => Promise<string>;
  forceDeleteCuadrilla: (id: number) => Promise<string>;
  reassignJornalerosFromCuadrilla: (cuadrillaId: number) => Promise<string>;
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

  getDeleteWarning: async (id: number) => {
    try {
      return await obtenerWarningEliminacionCuadrilla(id);
    } catch (error) {
      console.error('Error getting delete warning:', error);
      set({ error: 'Error al obtener advertencia de eliminación' });
      throw error;
    }
  },

  deleteCuadrilla: async (id: number) => {
    try {
      set({ loading: true, error: null });
      console.log("Store: Eliminando cuadrilla con ID:", id);
      const result = await eliminarCuadrilla(id);
      console.log("Store: Resultado de eliminación:", result);
      
      // Solo actualizar el estado si la eliminación fue exitosa
      set((state) => ({
        cuadrillas: state.cuadrillas.filter(c => c.id !== id),
        loading: false,
        error: null
      }));
      
      return result;
    } catch (error) {
      console.error('Error deleting cuadrilla:', error);
      set({ 
        loading: false, 
        error: `Error al eliminar cuadrilla: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
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

  forceDeleteCuadrilla: async (id: number) => {
    try {
      set({ loading: true, error: null });
      console.log("Store: Eliminación forzada de cuadrilla con ID:", id);
      const result = await forceEliminarCuadrilla(id);
      console.log("Store: Resultado de eliminación forzada:", result);
      
      // Solo actualizar el estado si la eliminación fue exitosa
      set((state) => ({
        cuadrillas: state.cuadrillas.filter(c => c.id !== id),
        loading: false,
        error: null
      }));
      
      return result;
    } catch (error) {
      console.error('Error force deleting cuadrilla:', error);
      set({ 
        loading: false, 
        error: `Error al eliminar cuadrilla forzadamente: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      });
      throw error;
    }
  },

  reassignJornalerosFromCuadrilla: async (cuadrillaId: number) => {
    try {
      set({ loading: true, error: null });
      const result = await reasignarJornalerosDeCuadrilla(cuadrillaId);
      await get().fetchCuadrillas();
      return result;
    } catch (error) {
      console.error('Error reassigning jornaleros from cuadrilla:', error);
      set({ error: 'Error al reasignar jornaleros de cuadrilla', loading: false });
      throw error;
    }
  },
}));
