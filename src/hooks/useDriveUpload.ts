import { useCallback } from "react";
import * as XLSX from "xlsx";

// Types
import { Temporada } from "@/api/temporada_api";
import { Cliente } from "@/api/cliente_api";
import { Cuadrilla } from "@/api/cuadrilla_api";
import { Jornalero } from "@/api/jornalero_api";
import { Variedad } from "@/api/variedad_api";
import { TipoUva } from "@/api/tipo_uva_api";
import { TipoEmpaque } from "@/api/tipo_empaque_api";
import { Produccion } from "@/api/produccion_api";

interface UseDriveUploadProps {
    filteredProducciones: Produccion[];
    selectedTemporadaFilter: string;
    selectedClienteFilter: string;
    dateFilter: string;
    searchTerm: string;
    temporadas: Temporada[];
    clientes: Cliente[];
    cuadrillas: Cuadrilla[];
    jornaleros: Jornalero[];
    variedades: Variedad[];
    tiposUva: TipoUva[];
    tiposEmpaque: TipoEmpaque[];
    estadisticas: {
        totalFiltered: number;
        registrosFiltered: number;
        clientesUnicos: number;
        cuadrillasActivas: number;
        promedioProduccion: number;
    };
}

export function useDriveUpload({
    filteredProducciones,
    selectedTemporadaFilter,
    selectedClienteFilter,
    dateFilter,
    searchTerm,
    temporadas,
    clientes,
    cuadrillas,
    jornaleros,
    variedades,
    tiposUva,
    tiposEmpaque,
    estadisticas
}: UseDriveUploadProps) {

    // Helper functions
    const getCuadrillaNombre = useCallback(
        (id: number) => {
            const cuadrilla = cuadrillas.find((c) => c.id === id);
            if (!cuadrilla) return "Desconocida";
            const lider = jornaleros.find(
                (j) => j.id === cuadrilla.lider_cuadrilla_id
            );
            return lider
                ? `${cuadrilla.lote} (${lider.nombre})`
                : cuadrilla.lote;
        },
        [cuadrillas, jornaleros]
    );

    const getVariedadNombre = useCallback(
        (cuadrillaId: number) => {
            const cuadrilla = cuadrillas.find((c) => c.id === cuadrillaId);
            if (!cuadrilla || !cuadrilla.variedad_id) return "No asignada";
            const variedad = variedades.find(
                (v) => v.id === cuadrilla.variedad_id
            );
            return variedad ? variedad.nombre : "Desconocida";
        },
        [cuadrillas, variedades]
    );

    const getClienteNombre = useCallback(
        (id: number) => {
            const cliente = clientes.find((c) => c.id === id);
            return cliente ? cliente.nombre : "Desconocido";
        },
        [clientes]
    );

    const getTipoUvaNombre = useCallback(
        (id: number | null) => {
            if (!id) return "No asignado";
            const tipoUva = tiposUva.find((t) => t.id === id);
            return tipoUva ? tipoUva.nombre : "Desconocido";
        },
        [tiposUva]
    );

    const getTipoEmpaqueNombre = useCallback(
        (id: number | null) => {
            if (!id) return "No asignado";
            const tipoEmpaque = tiposEmpaque.find((t) => t.id === id);
            return tipoEmpaque ? tipoEmpaque.nombre : "Desconocido";
        },
        [tiposEmpaque]
    );

    const createProductionWorkbook = useCallback(() => {
        if (!filteredProducciones || filteredProducciones.length === 0) {
            return null;
        }

        // Get readable names for filters
        const temporadaNombre = selectedTemporadaFilter === "all" 
            ? "Todas" 
            : temporadas.find(t => t.id.toString() === selectedTemporadaFilter)?.id?.toString() || "Desconocida";
        
        const clienteNombre = selectedClienteFilter === "all"
            ? "Todos"
            : clientes.find(c => c.id.toString() === selectedClienteFilter)?.nombre || "Desconocido";
        
        const fechaNombre = dateFilter === "all" 
            ? "Todos"
            : dateFilter === "week" 
                ? "Última semana"
                : dateFilter === "month" 
                    ? "Último mes"
                    : "Personalizado";

        const filtrosAplicados = {
            searchTerm: searchTerm || undefined,
            temporada: temporadaNombre,
            cliente: clienteNombre,
            fecha: fechaNombre
        };

        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // 1. Summary/Statistics sheet
        const resumenData = [
            { 'Métrica': 'Total Producción', 'Valor': `${estadisticas.totalFiltered} cajas` },
            { 'Métrica': 'Número de Registros', 'Valor': estadisticas.registrosFiltered },
            { 'Métrica': 'Clientes Únicos', 'Valor': estadisticas.clientesUnicos },
            { 'Métrica': 'Cuadrillas Activas', 'Valor': estadisticas.cuadrillasActivas },
            { 'Métrica': 'Promedio por Registro', 'Valor': `${estadisticas.promedioProduccion.toFixed(1)} cajas` },
            { 'Métrica': '', 'Valor': '' }, // Empty line
            { 'Métrica': 'FILTROS APLICADOS', 'Valor': '' },
            { 'Métrica': 'Búsqueda', 'Valor': filtrosAplicados.searchTerm || 'Ninguna' },
            { 'Métrica': 'Temporada', 'Valor': filtrosAplicados.temporada || 'Todas' },
            { 'Métrica': 'Cliente', 'Valor': filtrosAplicados.cliente || 'Todos' },
            { 'Métrica': 'Período', 'Valor': filtrosAplicados.fecha || 'Todos' }
        ];
        const resumenWS = XLSX.utils.json_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(workbook, resumenWS, 'Resumen');
        
        // 2. Detailed Production Records sheet
        const produccionData = filteredProducciones.map(produccion => ({
            'ID': produccion.id.toString(),
            'Cuadrilla': getCuadrillaNombre(produccion.cuadrilla_id),
            'Variedad': getVariedadNombre(produccion.cuadrilla_id),
            'Cliente': getClienteNombre(produccion.cliente_id),
            'Cantidad_Cajas': parseFloat(produccion.cantidad.toString()),
            'Fecha': new Date(produccion.fecha).toLocaleDateString('es-ES'),
            'Tipo_Uva': getTipoUvaNombre(produccion.tipo_uva_id),
            'Tipo_Empaque': getTipoEmpaqueNombre(produccion.tipo_empaque_id),
            'Temporada_ID': produccion.temporada_id.toString(),
            'Cajas_No_Aceptadas': produccion.cajas_no_aceptadas,
        }));
        const produccionWS = XLSX.utils.json_to_sheet(produccionData);
        XLSX.utils.book_append_sheet(workbook, produccionWS, 'Registros de Producción');
        
        // 3. Production by Crew sheet (grouped)
        const cuadrillaGroups = filteredProducciones.reduce((acc: any, prod) => {
            const cuadrillaNombre = getCuadrillaNombre(prod.cuadrilla_id);
            if (!acc[cuadrillaNombre]) {
                acc[cuadrillaNombre] = {
                    cuadrilla: cuadrillaNombre,
                    variedad: getVariedadNombre(prod.cuadrilla_id),
                    totalCajas: 0,
                    numeroRegistros: 0
                };
            }
            acc[cuadrillaNombre].totalCajas += parseFloat(prod.cantidad.toString());
            acc[cuadrillaNombre].numeroRegistros += 1;
            return acc;
        }, {});
        
        const cuadrillaData = Object.values(cuadrillaGroups).map((group: any) => ({
            'Cuadrilla': group.cuadrilla,
            'Variedad': group.variedad,
            'Total_Cajas': group.totalCajas,
            'Numero_Registros': group.numeroRegistros,
            'Promedio_Por_Registro': (group.totalCajas / group.numeroRegistros).toFixed(1)
        }));
        const cuadrillaWS = XLSX.utils.json_to_sheet(cuadrillaData);
        XLSX.utils.book_append_sheet(workbook, cuadrillaWS, 'Por Cuadrilla');
        
        // 4. Production by Client sheet (grouped)
        const clienteGroups = filteredProducciones.reduce((acc: any, prod) => {
            const clienteNombre = getClienteNombre(prod.cliente_id);
            if (!acc[clienteNombre]) {
                acc[clienteNombre] = {
                    cliente: clienteNombre,
                    totalCajas: 0,
                    numeroRegistros: 0,
                    cuadrillasUnicas: new Set()
                };
            }
            acc[clienteNombre].totalCajas += parseFloat(prod.cantidad.toString());
            acc[clienteNombre].numeroRegistros += 1;
            acc[clienteNombre].cuadrillasUnicas.add(prod.cuadrilla_id);
            return acc;
        }, {});
        
        const clienteData = Object.values(clienteGroups).map((group: any) => ({
            'Cliente': group.cliente,
            'Total_Cajas': group.totalCajas,
            'Numero_Registros': group.numeroRegistros,
            'Cuadrillas_Diferentes': group.cuadrillasUnicas.size,
            'Promedio_Por_Registro': (group.totalCajas / group.numeroRegistros).toFixed(1)
        }));
        const clienteWS = XLSX.utils.json_to_sheet(clienteData);
        XLSX.utils.book_append_sheet(workbook, clienteWS, 'Por Cliente');
        
        // 5. Production by Date sheet (grouped)
        const fechaGroups = filteredProducciones.reduce((acc: any, prod) => {
            const fecha = new Date(prod.fecha).toLocaleDateString('es-ES');
            if (!acc[fecha]) {
                acc[fecha] = {
                    fecha: fecha,
                    totalCajas: 0,
                    numeroRegistros: 0,
                    cuadrillasUnicas: new Set(),
                    clientesUnicos: new Set()
                };
            }
            acc[fecha].totalCajas += parseFloat(prod.cantidad.toString());
            acc[fecha].numeroRegistros += 1;
            acc[fecha].cuadrillasUnicas.add(prod.cuadrilla_id);
            acc[fecha].clientesUnicos.add(prod.cliente_id);
            return acc;
        }, {});
        
        const fechaData = Object.values(fechaGroups)
            .map((group: any) => ({
                'Fecha': group.fecha,
                'Total_Cajas': group.totalCajas,
                'Numero_Registros': group.numeroRegistros,
                'Cuadrillas_Activas': group.cuadrillasUnicas.size,
                'Clientes_Atendidos': group.clientesUnicos.size
            }))
            .sort((a, b) => new Date(a.Fecha.split('/').reverse().join('-')).getTime() - 
                            new Date(b.Fecha.split('/').reverse().join('-')).getTime());
        const fechaWS = XLSX.utils.json_to_sheet(fechaData);
        XLSX.utils.book_append_sheet(workbook, fechaWS, 'Por Fecha');

        return workbook;
    }, [
        filteredProducciones,
        selectedTemporadaFilter,
        selectedClienteFilter,
        dateFilter,
        searchTerm,
        temporadas,
        clientes,
        getCuadrillaNombre,
        getVariedadNombre,
        getClienteNombre,
        getTipoUvaNombre,
        getTipoEmpaqueNombre,
        estadisticas
    ]);

    return {
        createProductionWorkbook
    };
}
