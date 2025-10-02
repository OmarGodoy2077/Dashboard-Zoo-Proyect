import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import io from 'socket.io-client';
import { getToken } from '../utils/auth';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Briefcase, Eye, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, WS_BASE_URL } from '../config/api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const socket = io(WS_BASE_URL);

interface Stats {
  totalAnimales: number;
  totalEmpleados: number;
  visitantesHoy: number;
  alertasMedicas: number;
  tareasLimpiezaActivas?: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // OPTIMIZADO: stats inicia como null para saber si aún no se ha cargado
  const [stats, setStats] = useState<Stats | null>(null);
  const [visitantesChartData, setVisitantesChartData] = useState<any>(null);
  const [alimentosChartData, setAlimentosChartData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true; // Para evitar actualizaciones de estado en componente desmontado
    
    // Function to fetch initial data
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          if (isMounted) {
            toast({
              variant: "destructive",
              title: "No autorizado",
              description: "Por favor, inicia sesión",
            });
            navigate('/login');
          }
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/dashboard/data`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        
        if (response.ok) {
          const data = await response.json();
          // ...existing code...
          
          if (!isMounted) return; // No actualizar si el componente se desmontó
          
          // MEJORADO: El backend devuelve { success: true, data: { stats: {...}, visitantesChart: {...}, alimentosChart: {...} } }
          if (data.success && data.data && data.data.stats) {
            // ...existing code...
            setStats(data.data.stats);
            setVisitantesChartData(data.data.visitantesChart);
            setAlimentosChartData(data.data.alimentosChart);
          } else if (data.data && data.data.stats) {
            // ...existing code...
            setStats(data.data.stats);
            setVisitantesChartData(data.data.visitantesChart);
            setAlimentosChartData(data.data.alimentosChart);
          } else if (data.stats) {
            // ...existing code...
            setStats(data.stats);
            setVisitantesChartData(data.visitantesChart);
            setAlimentosChartData(data.alimentosChart);
          } else {
            // ...existing code...
            // MEJORADO: Si no hay estructura válida, establecer datos por defecto
            setStats({
              totalAnimales: 0,
              totalEmpleados: 0,
              visitantesHoy: 0,
              alertasMedicas: 0,
              tareasLimpiezaActivas: 0
            });
          }
        } else {
          if (response.status === 401) {
            if (isMounted) {
              toast({
                variant: "destructive",
                title: "Sesión expirada",
                description: "Por favor, inicia sesión nuevamente",
              });
              localStorage.removeItem('token');
              navigate('/login');
            }
          } else {
            if (isMounted) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los datos del dashboard",
              });
              // Usar datos por defecto para evitar pantalla en blanco
              setStats({
                totalAnimales: 0,
                totalEmpleados: 0,
                visitantesHoy: 0,
                alertasMedicas: 0,
                tareasLimpiezaActivas: 0
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (isMounted) {
          setError('No se pudo conectar con el servidor. Por favor, verifica que el backend esté funcionando en http://localhost:3000');
          toast({
            variant: "destructive",
            title: "Error de conexión",
            description: "No se pudo conectar con el servidor",
          });
          // Datos de respaldo para evitar pantalla en blanco
          setStats({
            totalAnimales: 0,
            totalEmpleados: 0,
            visitantesHoy: 0,
            alertasMedicas: 0,
            tareasLimpiezaActivas: 0
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // OPTIMIZADO: Listen for WebSocket updates - SOLO actualizar si hay datos válidos
    socket.on('dashboard-update', (data) => {
      if (!isMounted || !data) return;
      
  // ...existing code...
      
      // Verificar si los datos vienen en formato backend (con estructura anidada)
      if (data.stats && data.stats.animales) {
        // Transformar formato backend a formato frontend
        const transformedStats = {
          totalAnimales: data.stats.animales?.total || 0,
          totalEmpleados: data.stats.empleados?.total || 0,
          visitantesHoy: data.stats.visitantes?.hoy || 0,
          alertasMedicas: data.stats.animales?.enfermos || 0,
          totalAlimentos: data.stats.alimentos?.total || 0,
          tareasLimpiezaActivas: data.stats.limpiezas?.activas || 0
        };
  // ...existing code...
        setStats(transformedStats);
      } else if (data.stats && data.stats.totalAnimales !== undefined) {
        // Los datos ya vienen en formato frontend
  // ...existing code...
        setStats(data.stats);
      } else {
  // ...existing code...
        // No actualizar si el formato es desconocido
      }
    });
    
    socket.on('charts-update', (data) => {
      if (isMounted && data) {
        if (data.visitantesChart) setVisitantesChartData(data.visitantesChart);
        if (data.alimentosChart) setAlimentosChartData(data.alimentosChart);
      }
    });

    return () => {
      isMounted = false; // Marcar componente como desmontado
      socket.off('dashboard-update');
      socket.off('charts-update');
    };
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error de Conexión</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard del Zoológico</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate('/animales')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Animales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats === null ? (
                <Loader2 className="h-6 w-6 animate-spin inline" />
              ) : (
                stats.totalAnimales || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              En el zoológico · Click para ver más
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate('/empleados')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empleados</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats === null ? (
                <Loader2 className="h-6 w-6 animate-spin inline" />
              ) : (
                stats.totalEmpleados || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Personal activo · Click para ver más
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate('/entradas')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitantes Hoy</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats === null ? (
                <Loader2 className="h-6 w-6 animate-spin inline" />
              ) : (
                stats.visitantesHoy || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoy, {new Date().toLocaleDateString()} · Click para ver más
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate('/alertas-medicas')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Médicas</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats === null ? (
                <Loader2 className="h-6 w-6 animate-spin inline" />
              ) : (
                stats.alertasMedicas || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Animales enfermos · Click para ver más
            </p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate('/limpieza')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas de Limpieza</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground">
              <path d="M3 12h18"/>
              <path d="M3 18h18"/>
              <path d="M3 6h18"/>
              <circle cx="9" cy="12" r="1"/>
              <circle cx="15" cy="12" r="1"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats === null ? (
                <Loader2 className="h-6 w-6 animate-spin inline" />
              ) : (
                stats.tareasLimpiezaActivas || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Tareas activas · Click para ver más
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitantes (Últimos 7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            {visitantesChartData ? (
              <Bar data={visitantesChartData} options={{
                responsive: true,
                maintainAspectRatio: true,
              }} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos de visitantes disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Alimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {alimentosChartData ? (
              <Pie data={alimentosChartData} options={{
                responsive: true,
                maintainAspectRatio: true,
              }} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos de alimentos disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
