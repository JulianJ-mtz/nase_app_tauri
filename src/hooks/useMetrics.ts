import { useState, useEffect } from "react";
import { obtenerProducciones } from "@/api/produccion_api";
import { obtenerCuadrillas } from "@/api/cuadrilla_api";
import { obtenerTemporadas } from "@/api/temporada_api";
import { obtenerVariedades } from "@/api/variedad_api";
import { obtenerTiposUva } from "@/api/tipo_uva_api";
import { obtenerClientes } from "@/api/cliente_api";

export const useMetrics = () => {
    const [loading, setLoading] = useState(true);
    const [selectedTemporada, setSelectedTemporada] = useState<string>("");
    const [temporadas, setTemporadas] = useState<any[]>([]);
    const [producciones, setProducciones] = useState<any[]>([]);
    const [cuadrillas, setCuadrillas] = useState<any[]>([]);
    const [variedades, setVariedades] = useState<any[]>([]);
    const [tiposUva, setTiposUva] = useState<any[]>([]);
    const [clientes, setClientes] = useState<any[]>([]);

    // Datos procesados para los gráficos
    const [produccionPorCuadrilla, setProduccionPorCuadrilla] = useState<any[]>([]);
    const [produccionPorVariedad, setProduccionPorVariedad] = useState<any[]>([]);
    const [produccionPorTipoUva, setProduccionPorTipoUva] = useState<any[]>([]);
    const [produccionPorCliente, setProduccionPorCliente] = useState<any[]>([]);
    const [produccionClienteVariedad, setProduccionClienteVariedad] = useState<any[]>([]);
    const [produccionClienteTipoUva, setProduccionClienteTipoUva] = useState<any[]>([]);
    
    // Datos temporales para area charts
    const [tendenciaProduccion, setTendenciaProduccion] = useState<any[]>([]);
    const [tendenciaClientes, setTendenciaClientes] = useState<any[]>([]);
    const [tendenciaVariedades, setTendenciaVariedades] = useState<any[]>([]);
    const [tendenciaTipos, setTendenciaTipos] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Cargar todos los datos necesarios
                const [tempData, prodData, cuadData, varData, tipoUvaData, clienteData] =
                    await Promise.all([
                        obtenerTemporadas(),
                        obtenerProducciones(),
                        obtenerCuadrillas(),
                        obtenerVariedades(),
                        obtenerTiposUva(),
                        obtenerClientes(),
                    ]);

                setTemporadas(tempData);
                setProducciones(prodData);
                setCuadrillas(cuadData);
                setVariedades(varData);
                setTiposUva(tipoUvaData);
                setClientes(clienteData);

                // Seleccionar la temporada más reciente por defecto
                if (tempData.length > 0) {
                    const latestTemporada = tempData.reduce(
                        (latest, current) => {
                            return new Date(current.fecha_inicial) >
                                new Date(latest.fecha_inicial)
                                ? current
                                : latest;
                        },
                        tempData[0]
                    );

                    setSelectedTemporada(latestTemporada.id.toString());
                    processData(
                        latestTemporada.id.toString(),
                        prodData,
                        cuadData,
                        varData,
                        tipoUvaData,
                        clienteData
                    );
                }
            } catch (error) {
                console.error("Error cargando datos para métricas:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processData = (
        temporadaId: string,
        prodData: any[],
        cuadData: any[],
        varData: any[],
        tipoUvaData: any[],
        clienteData: any[]
    ) => {
        const temporadaIdNum = parseInt(temporadaId);

        // Filtrar producciones por temporada seleccionada
        const produccionesFiltradas = prodData.filter(
            (p) => p.temporada_id === temporadaIdNum
        );

        // Procesar datos para producción por cuadrilla
        const produccionCuadrilla = cuadData
            .map((cuadrilla) => {
                const produccionesCuadrilla = produccionesFiltradas.filter(
                    (p) => p.cuadrilla_id === cuadrilla.id
                );
                const totalProduccion = produccionesCuadrilla.reduce(
                    (sum, p) => sum + parseFloat(p.cantidad),
                    0
                );

                return {
                    name: `Cuadrilla ${cuadrilla.id} - ${cuadrilla.lote}`,
                    produccion: totalProduccion,
                };
            })
            .filter((item) => item.produccion > 0)
            .sort((a, b) => b.produccion - a.produccion);

        setProduccionPorCuadrilla(produccionCuadrilla);

        // Procesar datos para producción por variedad usando las cuadrillas
        const produccionVariedad = cuadData
            .reduce((acc: any[], cuadrilla) => {
                if (!cuadrilla.variedad_id) return acc;

                const variedad = varData.find(
                    (v) => v.id === cuadrilla.variedad_id
                );
                if (!variedad) return acc;

                const produccionesCuadrilla = produccionesFiltradas.filter(
                    (p) => p.cuadrilla_id === cuadrilla.id
                );
                const totalProduccion = produccionesCuadrilla.reduce(
                    (sum, p) => sum + parseFloat(p.cantidad),
                    0
                );

                if (totalProduccion > 0) {
                    const existingVariedad = acc.find(
                        (item) => item.name === variedad.nombre
                    );

                    if (existingVariedad) {
                        existingVariedad.produccion += totalProduccion;
                    } else {
                        acc.push({
                            name: variedad.nombre,
                            produccion: totalProduccion,
                        });
                    }
                }

                return acc;
            }, [])
            .sort((a: any, b: any) => b.produccion - a.produccion);

        setProduccionPorVariedad(produccionVariedad);

        // Procesar datos para producción por tipo de uva
        const produccionTipoUva = produccionesFiltradas
            .reduce((acc: any[], prod) => {
                if (!prod.tipo_uva_id) return acc;

                const tipoUva = tipoUvaData.find(
                    (t) => t.id === prod.tipo_uva_id
                );
                if (!tipoUva) return acc;

                const cantidad = parseFloat(prod.cantidad);
                const existingTipo = acc.find(
                    (item) => item.name === tipoUva.nombre
                );

                if (existingTipo) {
                    existingTipo.produccion += cantidad;
                } else {
                    acc.push({
                        name: tipoUva.nombre,
                        produccion: cantidad,
                    });
                }

                return acc;
            }, [])
            .sort((a: any, b: any) => b.produccion - a.produccion);

        setProduccionPorTipoUva(produccionTipoUva);

        // Procesar datos para producción por cliente
        const produccionCliente = produccionesFiltradas
            .reduce((acc: any[], prod) => {
                if (!prod.cliente_id) return acc;

                const cliente = clienteData.find(
                    (c) => c.id === prod.cliente_id
                );
                if (!cliente) return acc;

                const cantidad = parseFloat(prod.cantidad);
                const existingCliente = acc.find(
                    (item) => item.name === cliente.nombre
                );

                if (existingCliente) {
                    existingCliente.produccion += cantidad;
                } else {
                    acc.push({
                        name: cliente.nombre,
                        produccion: cantidad,
                    });
                }

                return acc;
            }, [])
            .sort((a: any, b: any) => b.produccion - a.produccion);

        setProduccionPorCliente(produccionCliente);

        // Procesar datos para producción por cliente y variedad
        const produccionClienteVar = [];
        for (const cliente of clienteData) {
            const producciones = produccionesFiltradas.filter(
                (p) => p.cliente_id === cliente.id
            );

            const variedadesDelCliente = producciones.reduce((acc: any[], prod) => {
                const cuadrilla = cuadData.find((c) => c.id === prod.cuadrilla_id);
                if (!cuadrilla || !cuadrilla.variedad_id) return acc;

                const variedad = varData.find((v) => v.id === cuadrilla.variedad_id);
                if (!variedad) return acc;

                const cantidad = parseFloat(prod.cantidad);
                const existing = acc.find((item) => item.variedad === variedad.nombre);

                if (existing) {
                    existing.cantidad += cantidad;
                } else {
                    acc.push({
                        variedad: variedad.nombre,
                        cantidad: cantidad,
                    });
                }

                return acc;
            }, []);

            if (variedadesDelCliente.length > 0) {
                produccionClienteVar.push({
                    cliente: cliente.nombre,
                    variedades: variedadesDelCliente,
                    total: variedadesDelCliente.reduce((sum, v) => sum + v.cantidad, 0),
                });
            }
        }

        setProduccionClienteVariedad(produccionClienteVar.sort((a, b) => b.total - a.total));

        // Procesar datos para producción por cliente y tipo de uva
        const produccionClienteTipo = [];
        for (const cliente of clienteData) {
            const producciones = produccionesFiltradas.filter(
                (p) => p.cliente_id === cliente.id
            );

            const tiposDelCliente = producciones.reduce((acc: any[], prod) => {
                if (!prod.tipo_uva_id) return acc;

                const tipoUva = tipoUvaData.find((t) => t.id === prod.tipo_uva_id);
                if (!tipoUva) return acc;

                const cantidad = parseFloat(prod.cantidad);
                const existing = acc.find((item) => item.tipo === tipoUva.nombre);

                if (existing) {
                    existing.cantidad += cantidad;
                } else {
                    acc.push({
                        tipo: tipoUva.nombre,
                        cantidad: cantidad,
                    });
                }

                return acc;
            }, []);

            if (tiposDelCliente.length > 0) {
                produccionClienteTipo.push({
                    cliente: cliente.nombre,
                    tipos: tiposDelCliente,
                    total: tiposDelCliente.reduce((sum, t) => sum + t.cantidad, 0),
                });
            }
        }

        setProduccionClienteTipoUva(produccionClienteTipo.sort((a, b) => b.total - a.total));

        // Procesar tendencias temporales
        processTendenciasTemporales(produccionesFiltradas, cuadData, varData, tipoUvaData, clienteData);
    };

    const processTendenciasTemporales = (
        produccionesFiltradas: any[],
        cuadData: any[],
        varData: any[],
        tipoUvaData: any[],
        clienteData: any[]
    ) => {
        // Agrupar producciones por fecha
        const produccionesPorFecha = produccionesFiltradas.reduce((acc: any, prod) => {
            const fecha = new Date(prod.fecha).toISOString().split('T')[0]; // Solo fecha YYYY-MM-DD
            if (!acc[fecha]) {
                acc[fecha] = {
                    fecha,
                    total: 0,
                    clientes: {},
                    variedades: {},
                    tipos: {}
                };
            }

            const cantidad = parseFloat(prod.cantidad);
            acc[fecha].total += cantidad;

            // Agregar por cliente
            if (prod.cliente_id) {
                const cliente = clienteData.find(c => c.id === prod.cliente_id);
                if (cliente) {
                    if (!acc[fecha].clientes[cliente.nombre]) {
                        acc[fecha].clientes[cliente.nombre] = 0;
                    }
                    acc[fecha].clientes[cliente.nombre] += cantidad;
                }
            }

            // Agregar por variedad (via cuadrilla)
            const cuadrilla = cuadData.find(c => c.id === prod.cuadrilla_id);
            if (cuadrilla && cuadrilla.variedad_id) {
                const variedad = varData.find(v => v.id === cuadrilla.variedad_id);
                if (variedad) {
                    if (!acc[fecha].variedades[variedad.nombre]) {
                        acc[fecha].variedades[variedad.nombre] = 0;
                    }
                    acc[fecha].variedades[variedad.nombre] += cantidad;
                }
            }

            // Agregar por tipo de uva
            if (prod.tipo_uva_id) {
                const tipoUva = tipoUvaData.find(t => t.id === prod.tipo_uva_id);
                if (tipoUva) {
                    if (!acc[fecha].tipos[tipoUva.nombre]) {
                        acc[fecha].tipos[tipoUva.nombre] = 0;
                    }
                    acc[fecha].tipos[tipoUva.nombre] += cantidad;
                }
            }

            return acc;
        }, {});

        // Convertir a arrays ordenados por fecha
        const fechasOrdenadas = Object.keys(produccionesPorFecha).sort();
        
        // Tendencia general de producción
        const tendenciaGeneral = fechasOrdenadas.map(fecha => ({
            fecha: new Date(fecha).toLocaleDateString(),
            produccion: produccionesPorFecha[fecha].total
        }));
        setTendenciaProduccion(tendenciaGeneral);

        // Tendencia por clientes (stacked)
        const todosClientes = [...new Set(clienteData.map(c => c.nombre))];
        const tendenciaClientesData = fechasOrdenadas.map(fecha => {
            const item: any = {
                fecha: new Date(fecha).toLocaleDateString()
            };
            todosClientes.forEach(cliente => {
                item[cliente] = produccionesPorFecha[fecha].clientes[cliente] || 0;
            });
            return item;
        });
        setTendenciaClientes(tendenciaClientesData);

        // Tendencia por variedades (stacked)
        const todasVariedades = [...new Set(varData.map(v => v.nombre))];
        const tendenciaVariedadesData = fechasOrdenadas.map(fecha => {
            const item: any = {
                fecha: new Date(fecha).toLocaleDateString()
            };
            todasVariedades.forEach(variedad => {
                item[variedad] = produccionesPorFecha[fecha].variedades[variedad] || 0;
            });
            return item;
        });
        setTendenciaVariedades(tendenciaVariedadesData);

        // Tendencia por tipos de uva (stacked)
        const todosTipos = [...new Set(tipoUvaData.map(t => t.nombre))];
        const tendenciaTiposData = fechasOrdenadas.map(fecha => {
            const item: any = {
                fecha: new Date(fecha).toLocaleDateString()
            };
            todosTipos.forEach(tipo => {
                item[tipo] = produccionesPorFecha[fecha].tipos[tipo] || 0;
            });
            return item;
        });
        setTendenciaTipos(tendenciaTiposData);
    };

    const handleTemporadaChange = (value: string) => {
        setSelectedTemporada(value);
        processData(value, producciones, cuadrillas, variedades, tiposUva, clientes);
    };

    return {
        loading,
        selectedTemporada,
        temporadas,
        cuadrillas,
        variedades,
        tiposUva,
        clientes,
        produccionPorCuadrilla,
        produccionPorVariedad,
        produccionPorTipoUva,
        produccionPorCliente,
        produccionClienteVariedad,
        produccionClienteTipoUva,
        tendenciaProduccion,
        tendenciaClientes,
        tendenciaVariedades,
        tendenciaTipos,
        handleTemporadaChange
    };
}; 