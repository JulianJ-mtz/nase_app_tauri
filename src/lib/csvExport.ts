// Utilidades para exportar datos a CSV y Excel en Tauri

import { writeTextFile, writeFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import * as XLSX from 'xlsx';

export const convertToCSV = (data: any[], headers: string[]): string => {
    if (!data || data.length === 0) {
        return headers.join(',') + '\n';
    }

    const csvContent = [
        headers.join(','), // Headers
        ...data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                // Escapar valores que contienen comas o comillas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    return csvContent;
};

export const downloadCSV = async (csvContent: string, filename: string): Promise<void> => {
    try {
        // Usar el diálogo de Tauri para seleccionar dónde guardar el archivo
        const filePath = await save({
            defaultPath: `${filename}.csv`,
            filters: [{
                name: 'CSV',
                extensions: ['csv']
            }]
        });

        if (filePath) {
            // Escribir el archivo usando la API de Tauri
            await writeTextFile(filePath, csvContent);
            console.log(`Archivo guardado exitosamente: ${filePath}`);
        }
    } catch (error) {
        console.error('Error guardando archivo CSV:', error);
        // Fallback para desarrollo en navegador
        if (typeof window !== 'undefined' && window.document) {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `${filename}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
};

// Nueva función para crear y descargar archivo Excel
export const downloadExcel = async (workbook: XLSX.WorkBook, filename: string): Promise<void> => {
    try {
        // Usar el diálogo de Tauri para seleccionar dónde guardar el archivo
        const filePath = await save({
            defaultPath: `${filename}.xlsx`,
            filters: [{
                name: 'Excel',
                extensions: ['xlsx']
            }]
        });

        if (filePath) {
            // Convertir el workbook a buffer de bytes
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            
            try {
                // Intentar escribir usando writeFile
                const uint8Array = new Uint8Array(buffer);
                await writeFile(filePath, uint8Array);
                console.log(`Archivo Excel guardado exitosamente: ${filePath}`);
            } catch (writeError) {
                console.warn('Error con writeFile, intentando método alternativo:', writeError);
                
                // Método alternativo: convertir a base64 y usar función de Rust
                const base64String = btoa(
                    String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)))
                );
                
                try {
                    await invoke('write_excel_file', { 
                        path: filePath, 
                        data: base64String 
                    });
                    console.log(`Archivo Excel guardado exitosamente (método alternativo): ${filePath}`);
                } catch (invokeError) {
                    console.warn('Error con invoke, usando fallback a navegador');
                    throw invokeError;
                }
            }
        }
    } catch (error) {
        console.error('Error guardando archivo Excel:', error);
        // Fallback para desarrollo en navegador
        if (typeof window !== 'undefined' && window.document) {
            const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `${filename}.xlsx`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
};

// Funciones específicas para cada tipo de dato de métricas (mantener compatibilidad)

export const exportProduccionPorCuadrilla = async (data: any[]) => {
    const headers = ['Cuadrilla', 'Produccion_Cajas'];
    const csvData = data.map(item => ({
        'Cuadrilla': item.name,
        'Produccion_Cajas': item.produccion
    }));
    
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'produccion_por_cuadrilla');
};

export const exportProduccionPorVariedad = async (data: any[]) => {
    const headers = ['Variedad', 'Produccion_Cajas'];
    const csvData = data.map(item => ({
        'Variedad': item.name,
        'Produccion_Cajas': item.produccion
    }));
    
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'produccion_por_variedad');
};

export const exportProduccionPorTipoUva = async (data: any[]) => {
    const headers = ['Tipo_Uva', 'Produccion_Cajas'];
    const csvData = data.map(item => ({
        'Tipo_Uva': item.name,
        'Produccion_Cajas': item.produccion
    }));
    
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'produccion_por_tipo_uva');
};

export const exportProduccionPorCliente = async (data: any[]) => {
    const headers = ['Cliente', 'Produccion_Cajas'];
    const csvData = data.map(item => ({
        'Cliente': item.name,
        'Produccion_Cajas': item.produccion
    }));
    
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'produccion_por_cliente');
};

export const exportClienteVariedad = async (data: any[]) => {
    const csvData: any[] = [];
    
    data.forEach(clienteData => {
        clienteData.variedades.forEach((variedad: any) => {
            csvData.push({
                'Cliente': clienteData.cliente,
                'Variedad': variedad.variedad,
                'Produccion_Cajas': variedad.cantidad,
                'Total_Cliente_Cajas': clienteData.total
            });
        });
    });
    
    const headers = ['Cliente', 'Variedad', 'Produccion_Cajas', 'Total_Cliente_Cajas'];
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'cliente_por_variedad');
};

export const exportClienteTipoUva = async (data: any[]) => {
    const csvData: any[] = [];
    
    data.forEach(clienteData => {
        clienteData.tipos.forEach((tipo: any) => {
            csvData.push({
                'Cliente': clienteData.cliente,
                'Tipo_Uva': tipo.tipo,
                'Produccion_Cajas': tipo.cantidad,
                'Total_Cliente_Cajas': clienteData.total
            });
        });
    });
    
    const headers = ['Cliente', 'Tipo_Uva', 'Produccion_Cajas', 'Total_Cliente_Cajas'];
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'cliente_por_tipo_uva');
};

export const exportTendenciaProduccion = async (data: any[]) => {
    const headers = ['Fecha', 'Produccion_Cajas'];
    const csvData = data.map(item => ({
        'Fecha': item.fecha,
        'Produccion_Cajas': item.produccion
    }));
    
    const csvContent = convertToCSV(csvData, headers);
    await downloadCSV(csvContent, 'tendencia_produccion_total');
};

export const exportTendenciaClientes = async (data: any[], clientes: any[]) => {
    const headers = ['Fecha', ...clientes.map(c => c.nombre)];
    const csvContent = convertToCSV(data, headers);
    await downloadCSV(csvContent, 'tendencia_por_clientes');
};

export const exportTendenciaVariedades = async (data: any[], variedades: any[]) => {
    const headers = ['Fecha', ...variedades.map(v => v.nombre)];
    const csvContent = convertToCSV(data, headers);
    await downloadCSV(csvContent, 'tendencia_por_variedades');
};

export const exportTendenciaTipos = async (data: any[], tiposUva: any[]) => {
    const headers = ['Fecha', ...tiposUva.map(t => t.nombre)];
    const csvContent = convertToCSV(data, headers);
    await downloadCSV(csvContent, 'tendencia_por_tipos_uva');
};

// Nueva función para exportar todas las métricas en un archivo Excel con múltiples hojas
export const exportAllMetricsAsExcel = async (metricsData: {
    produccionPorCuadrilla: any[];
    produccionPorVariedad: any[];
    produccionPorTipoUva: any[];
    produccionPorCliente: any[];
    produccionClienteVariedad: any[];
    produccionClienteTipoUva: any[];
    tendenciaProduccion: any[];
    tendenciaClientes: any[];
    tendenciaVariedades: any[];
    tendenciaTipos: any[];
    clientes: any[];
    variedades: any[];
    tiposUva: any[];
    temporadaSeleccionada: string;
}) => {
    try {
        console.log('Iniciando exportación de todas las métricas a Excel...');
        
        // Crear un nuevo workbook
        const workbook = XLSX.utils.book_new();
        
        // 1. Hoja: Producción por Cuadrilla
        const cuadrillaData = metricsData.produccionPorCuadrilla.map(item => ({
            'Cuadrilla': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const cuadrillaWS = XLSX.utils.json_to_sheet(cuadrillaData);
        XLSX.utils.book_append_sheet(workbook, cuadrillaWS, 'Producción por Cuadrilla');
        
        // 2. Hoja: Producción por Variedad
        const variedadData = metricsData.produccionPorVariedad.map(item => ({
            'Variedad': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const variedadWS = XLSX.utils.json_to_sheet(variedadData);
        XLSX.utils.book_append_sheet(workbook, variedadWS, 'Producción por Variedad');
        
        // 3. Hoja: Producción por Tipo de Uva
        const tipoUvaData = metricsData.produccionPorTipoUva.map(item => ({
            'Tipo_Uva': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const tipoUvaWS = XLSX.utils.json_to_sheet(tipoUvaData);
        XLSX.utils.book_append_sheet(workbook, tipoUvaWS, 'Producción por Tipo Uva');
        
        // 4. Hoja: Producción por Cliente
        const clienteData = metricsData.produccionPorCliente.map(item => ({
            'Cliente': item.name,
            'Produccion_Cajas': item.produccion
        }));
        const clienteWS = XLSX.utils.json_to_sheet(clienteData);
        XLSX.utils.book_append_sheet(workbook, clienteWS, 'Producción por Cliente');
        
        // 5. Hoja: Cliente × Variedad
        const clienteVariedadData: any[] = [];
        metricsData.produccionClienteVariedad.forEach(clienteData => {
            clienteData.variedades.forEach((variedad: any) => {
                clienteVariedadData.push({
                    'Cliente': clienteData.cliente,
                    'Variedad': variedad.variedad,
                    'Produccion_Cajas': variedad.cantidad,
                    'Total_Cliente_Cajas': clienteData.total
                });
            });
        });
        const clienteVariedadWS = XLSX.utils.json_to_sheet(clienteVariedadData);
        XLSX.utils.book_append_sheet(workbook, clienteVariedadWS, 'Cliente × Variedad');
        
        // 6. Hoja: Cliente × Tipo de Uva
        const clienteTipoData: any[] = [];
        metricsData.produccionClienteTipoUva.forEach(clienteData => {
            clienteData.tipos.forEach((tipo: any) => {
                clienteTipoData.push({
                    'Cliente': clienteData.cliente,
                    'Tipo_Uva': tipo.tipo,
                    'Produccion_Cajas': tipo.cantidad,
                    'Total_Cliente_Cajas': clienteData.total
                });
            });
        });
        const clienteTipoWS = XLSX.utils.json_to_sheet(clienteTipoData);
        XLSX.utils.book_append_sheet(workbook, clienteTipoWS, 'Cliente × Tipo Uva');
        
        // 7. Hoja: Tendencia Producción Total
        const tendenciaData = metricsData.tendenciaProduccion.map(item => ({
            'Fecha': item.fecha,
            'Produccion_Cajas': item.produccion
        }));
        const tendenciaWS = XLSX.utils.json_to_sheet(tendenciaData);
        XLSX.utils.book_append_sheet(workbook, tendenciaWS, 'Tendencia Producción');
        
        // 8. Hoja: Tendencia por Clientes
        const tendenciaClientesWS = XLSX.utils.json_to_sheet(metricsData.tendenciaClientes);
        XLSX.utils.book_append_sheet(workbook, tendenciaClientesWS, 'Tendencia Clientes');
        
        // 9. Hoja: Tendencia por Variedades
        const tendenciaVariedadesWS = XLSX.utils.json_to_sheet(metricsData.tendenciaVariedades);
        XLSX.utils.book_append_sheet(workbook, tendenciaVariedadesWS, 'Tendencia Variedades');
        
        // 10. Hoja: Tendencia por Tipos
        const tendenciaTiposWS = XLSX.utils.json_to_sheet(metricsData.tendenciaTipos);
        XLSX.utils.book_append_sheet(workbook, tendenciaTiposWS, 'Tendencia Tipos');
        
        // Generar nombre del archivo con timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `metricas_completas_temporada_${metricsData.temporadaSeleccionada}_${timestamp}`;
        
        // Descargar el archivo Excel
        await downloadExcel(workbook, filename);
        
        console.log('Exportación Excel completada exitosamente');
    } catch (error) {
        console.error('Error durante la exportación Excel:', error);
    }
};

// Función para exportar todos los datos en múltiples archivos CSV (mantener compatibilidad)
export const exportAllMetrics = async (metricsData: {
    produccionPorCuadrilla: any[];
    produccionPorVariedad: any[];
    produccionPorTipoUva: any[];
    produccionPorCliente: any[];
    produccionClienteVariedad: any[];
    produccionClienteTipoUva: any[];
    tendenciaProduccion: any[];
    tendenciaClientes: any[];
    tendenciaVariedades: any[];
    tendenciaTipos: any[];
    clientes: any[];
    variedades: any[];
    tiposUva: any[];
    temporadaSeleccionada: string;
}) => {
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
        // Mostrar mensaje al usuario que la exportación comenzó
        console.log('Iniciando exportación de todas las métricas...');
        
        // Exportar cada tipo de datos secuencialmente para evitar problemas de concurrencia
        await exportProduccionPorCuadrilla(metricsData.produccionPorCuadrilla);
        await exportProduccionPorVariedad(metricsData.produccionPorVariedad);
        await exportProduccionPorTipoUva(metricsData.produccionPorTipoUva);
        await exportProduccionPorCliente(metricsData.produccionPorCliente);
        await exportClienteVariedad(metricsData.produccionClienteVariedad);
        await exportClienteTipoUva(metricsData.produccionClienteTipoUva);
        await exportTendenciaProduccion(metricsData.tendenciaProduccion);
        await exportTendenciaClientes(metricsData.tendenciaClientes, metricsData.clientes);
        await exportTendenciaVariedades(metricsData.tendenciaVariedades, metricsData.variedades);
        await exportTendenciaTipos(metricsData.tendenciaTipos, metricsData.tiposUva);
        
        console.log('Exportación completada exitosamente');
    } catch (error) {
        console.error('Error durante la exportación:', error);
    }
};

// Nueva función para exportar registros de producción completos
export const exportProductionRecords = async (
    producciones: any[],
    getCuadrillaNombre: (id: number) => string,
    getVariedadNombre: (cuadrillaId: number) => string,
    getClienteNombre: (id: number) => string,
    getTipoUvaNombre: (id: number | null) => string,
    getTipoEmpaqueNombre: (id: number | null) => string,
    estadisticas: any,
    filtrosAplicados: {
        searchTerm?: string;
        temporada?: string;
        cliente?: string;
        fecha?: string;
    }
) => {
    try {
        console.log('Iniciando exportación de registros de producción...');
        
        // Crear un nuevo workbook
        const workbook = XLSX.utils.book_new();
        
        // 1. Hoja: Resumen/Estadísticas
        const resumenData = [
            { 'Métrica': 'Total Producción', 'Valor': `${estadisticas.totalFiltered} cajas` },
            { 'Métrica': 'Número de Registros', 'Valor': estadisticas.registrosFiltered },
            { 'Métrica': 'Clientes Únicos', 'Valor': estadisticas.clientesUnicos },
            { 'Métrica': 'Cuadrillas Activas', 'Valor': estadisticas.cuadrillasActivas },
            { 'Métrica': 'Promedio por Registro', 'Valor': `${estadisticas.promedioProduccion.toFixed(1)} cajas` },
            { 'Métrica': '', 'Valor': '' }, // Línea vacía
            { 'Métrica': 'FILTROS APLICADOS', 'Valor': '' },
            { 'Métrica': 'Búsqueda', 'Valor': filtrosAplicados.searchTerm || 'Ninguna' },
            { 'Métrica': 'Temporada', 'Valor': filtrosAplicados.temporada || 'Todas' },
            { 'Métrica': 'Cliente', 'Valor': filtrosAplicados.cliente || 'Todos' },
            { 'Métrica': 'Período', 'Valor': filtrosAplicados.fecha || 'Todos' }
        ];
        const resumenWS = XLSX.utils.json_to_sheet(resumenData);
        XLSX.utils.book_append_sheet(workbook, resumenWS, 'Resumen');
        
        // 2. Hoja: Registros de Producción Detallados
        const produccionData = producciones.map(produccion => ({
            'ID': produccion.id,
            'Cuadrilla': getCuadrillaNombre(produccion.cuadrilla_id),
            'Variedad': getVariedadNombre(produccion.cuadrilla_id),
            'Cliente': getClienteNombre(produccion.cliente_id),
            'Cantidad_Cajas': parseFloat(produccion.cantidad),
            'Fecha': new Date(produccion.fecha).toLocaleDateString('es-ES'),
            'Temporada_ID': produccion.temporada_id,
            'Tipo_Uva': getTipoUvaNombre(produccion.tipo_uva_id),
            'Tipo_Empaque': getTipoEmpaqueNombre(produccion.tipo_empaque_id)
        }));
        const produccionWS = XLSX.utils.json_to_sheet(produccionData);
        XLSX.utils.book_append_sheet(workbook, produccionWS, 'Registros de Producción');
        
        // 3. Hoja: Producción por Cuadrilla (agrupado)
        const cuadrillaGroups = producciones.reduce((acc: any, prod) => {
            const cuadrillaNombre = getCuadrillaNombre(prod.cuadrilla_id);
            if (!acc[cuadrillaNombre]) {
                acc[cuadrillaNombre] = {
                    cuadrilla: cuadrillaNombre,
                    variedad: getVariedadNombre(prod.cuadrilla_id),
                    totalCajas: 0,
                    numeroRegistros: 0
                };
            }
            acc[cuadrillaNombre].totalCajas += parseFloat(prod.cantidad);
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
        
        // 4. Hoja: Producción por Cliente (agrupado)
        const clienteGroups = producciones.reduce((acc: any, prod) => {
            const clienteNombre = getClienteNombre(prod.cliente_id);
            if (!acc[clienteNombre]) {
                acc[clienteNombre] = {
                    cliente: clienteNombre,
                    totalCajas: 0,
                    numeroRegistros: 0,
                    cuadrillasUnicas: new Set()
                };
            }
            acc[clienteNombre].totalCajas += parseFloat(prod.cantidad);
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
        
        // 5. Hoja: Producción por Fecha (agrupado)
        const fechaGroups = producciones.reduce((acc: any, prod) => {
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
            acc[fecha].totalCajas += parseFloat(prod.cantidad);
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
        
        // Generar nombre del archivo con timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `registros_produccion_${timestamp}`;
        
        // Descargar el archivo Excel
        await downloadExcel(workbook, filename);
        
        console.log('Exportación de registros de producción completada exitosamente');
    } catch (error) {
        console.error('Error durante la exportación de registros de producción:', error);
    }
}; 