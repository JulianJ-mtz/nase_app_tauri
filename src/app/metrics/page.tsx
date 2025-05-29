"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { obtenerProducciones } from "@/api/produccion_api";
import { obtenerJornaleros } from "@/api/jornalero_api";
import { obtenerCuadrillas } from "@/api/cuadrilla_api";
import { obtenerTemporadas } from "@/api/temporada_api";

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function MetricsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedTemporada, setSelectedTemporada] = useState<string>("");
  const [temporadas, setTemporadas] = useState<any[]>([]);
  const [producciones, setProducciones] = useState<any[]>([]);
  const [jornaleros, setJornaleros] = useState<any[]>([]);
  const [cuadrillas, setCuadrillas] = useState<any[]>([]);
  
  // Datos procesados para los gráficos
  const [produccionPorJornalero, setProduccionPorJornalero] = useState<any[]>([]);
  const [produccionPorCuadrilla, setProduccionPorCuadrilla] = useState<any[]>([]);
  const [produccionPorVariedad, setProduccionPorVariedad] = useState<any[]>([]);
  const [produccionPorTipoUva, setProduccionPorTipoUva] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Cargar datos
        const tempData = await obtenerTemporadas();
        const prodData = await obtenerProducciones();
        const jornData = await obtenerJornaleros();
        const cuadData = await obtenerCuadrillas();
        
        setTemporadas(tempData);
        setProducciones(prodData);
        setJornaleros(jornData);
        setCuadrillas(cuadData);
        
        // Seleccionar la temporada más reciente por defecto
        if (tempData.length > 0) {
          const latestTemporada = tempData.reduce((latest, current) => {
            return new Date(current.fecha_inicial) > new Date(latest.fecha_inicial) ? current : latest;
          }, tempData[0]);
          
          setSelectedTemporada(latestTemporada.id.toString());
          processData(latestTemporada.id.toString(), prodData, jornData, cuadData);
        }
      } catch (error) {
        console.error("Error cargando datos para métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const processData = (temporadaId: string, prodData: any[], jornData: any[], cuadData: any[]) => {
    const temporadaIdNum = parseInt(temporadaId);
    
    // Filtrar producciones por temporada seleccionada
    const produccionesFiltradas = prodData.filter(p => p.temporada_id === temporadaIdNum);
    
    // Procesar datos para producción por jornalero
    const produccionJornalero = jornData.map(jornalero => {
      const produccionesJornalero = produccionesFiltradas.filter(p => p.jornalero_id === jornalero.id);
      const totalProduccion = produccionesJornalero.reduce((sum, p) => sum + p.cantidad, 0);
      
      return {
        name: jornalero.nombre,
        produccion: totalProduccion
      };
    }).filter(item => item.produccion > 0).sort((a, b) => b.produccion - a.produccion).slice(0, 10);
    
    setProduccionPorJornalero(produccionJornalero);
    
    // Procesar datos para producción por cuadrilla
    const produccionCuadrilla = cuadData.map(cuadrilla => {
      const jornaleroCuadrilla = jornData.filter(j => j.cuadrilla_id === cuadrilla.id).map(j => j.id);
      const produccionesCuadrilla = produccionesFiltradas.filter(p => jornaleroCuadrilla.includes(p.jornalero_id));
      const totalProduccion = produccionesCuadrilla.reduce((sum, p) => sum + p.cantidad, 0);
      
      return {
        name: `Cuadrilla ${cuadrilla.id}`,
        produccion: totalProduccion
      };
    }).filter(item => item.produccion > 0).sort((a, b) => b.produccion - a.produccion);
    
    setProduccionPorCuadrilla(produccionCuadrilla);
    
    // Procesar datos para producción por variedad
    const produccionVariedad = produccionesFiltradas.reduce((acc: any[], prod) => {
      const existingVariedad = acc.find(item => item.name === prod.variedad);
      
      if (existingVariedad) {
        existingVariedad.produccion += prod.cantidad;
      } else {
        acc.push({
          name: prod.variedad,
          produccion: prod.cantidad
        });
      }
      
      return acc;
    }, []).sort((a: any, b: any) => b.produccion - a.produccion);
    
    setProduccionPorVariedad(produccionVariedad);
    
    // Procesar datos para producción por tipo de uva
    const produccionTipoUva = produccionesFiltradas.reduce((acc: any[], prod) => {
      const existingTipo = acc.find(item => item.name === prod.tipo);
      
      if (existingTipo) {
        existingTipo.produccion += prod.cantidad;
      } else {
        acc.push({
          name: prod.tipo,
          produccion: prod.cantidad
        });
      }
      
      return acc;
    }, []).sort((a: any, b: any) => b.produccion - a.produccion);
    
    setProduccionPorTipoUva(produccionTipoUva);
  };

  const handleTemporadaChange = (value: string) => {
    setSelectedTemporada(value);
    processData(value, producciones, jornaleros, cuadrillas);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex justify-center items-center h-64">
          <p>Cargando métricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Métricas de Producción</h1>
      
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="temporada">Temporada:</Label>
          <Select value={selectedTemporada} onValueChange={handleTemporadaChange}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecciona una temporada" />
            </SelectTrigger>
            <SelectContent>
              {temporadas.map((temporada) => (
                <SelectItem key={temporada.id} value={temporada.id.toString()}>
                  {`Temporada ${temporada.id} (${new Date(temporada.fecha_inicial).toLocaleDateString()} - ${
                    temporada.fecha_final ? new Date(temporada.fecha_final).toLocaleDateString() : 'Actual'
                  })`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="jornaleros">
        <TabsList className="mb-6">
          <TabsTrigger value="jornaleros">Por Jornalero</TabsTrigger>
          <TabsTrigger value="cuadrillas">Por Cuadrilla</TabsTrigger>
          <TabsTrigger value="variedades">Por Variedad</TabsTrigger>
          <TabsTrigger value="tipos">Por Tipo de Uva</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jornaleros">
          <Card>
            <CardHeader>
              <CardTitle>Producción por Jornalero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={produccionPorJornalero}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg`, 'Producción']} />
                    <Legend />
                    <Bar dataKey="produccion" name="Producción (kg)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cuadrillas">
          <Card>
            <CardHeader>
              <CardTitle>Producción por Cuadrilla</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={produccionPorCuadrilla}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg`, 'Producción']} />
                    <Legend />
                    <Bar dataKey="produccion" name="Producción (kg)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="variedades">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Producción por Variedad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={produccionPorVariedad}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kg`, 'Producción']} />
                      <Legend />
                      <Bar dataKey="produccion" name="Producción (kg)" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Variedad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={produccionPorVariedad}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="produccion"
                      >
                        {produccionPorVariedad.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} kg`, 'Producción']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tipos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Producción por Tipo de Uva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={produccionPorTipoUva}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kg`, 'Producción']} />
                      <Legend />
                      <Bar dataKey="produccion" name="Producción (kg)" fill="#8dd1e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Tipo de Uva</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={produccionPorTipoUva}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="produccion"
                      >
                        {produccionPorTipoUva.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} kg`, 'Producción']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
