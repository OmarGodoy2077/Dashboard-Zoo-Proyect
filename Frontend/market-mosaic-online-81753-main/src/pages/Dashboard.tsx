import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import io from 'socket.io-client';
import { getToken } from '../utils/auth';
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Briefcase, Eye, AlertCircle, TrendingUp, Package, Siren, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, WS_BASE_URL } from '../config/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const socket = io(WS_BASE_URL);

interface Stats {
  totalAnimales: number;
  totalEmpleados: number;
  empleadosActivos?: number;
  visitantesHoy: number;
  visitantesAyer?: number;
  alertasMedicas: number;
  tareasLimpiezaActivas?: number;
}

// Helper function to create gradient for charts
const createGradient = (ctx: CanvasRenderingContext2D, chartArea: any) => {
  if (!chartArea) {
    return 'rgba(59, 130, 246, 0.5)';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
  gradient.addColorStop(1, 'rgba(59, 130, 246, 0.8)');
  return gradient;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [visitantesChartData, setVisitantesChartData] = useState<any>(null);
  const [alimentosChartData, setAlimentosChartData] = useState<any>(null);
  const chartRef = useRef<ChartJS<'bar'>>(null);

  useEffect(() => {
    let isMounted = true;
    
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
            headers: { 'Authorization': `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (!isMounted) return;
          
          const statsData = data.data?.stats || data.stats || {
            totalAnimales: 0, totalEmpleados: 0, empleadosActivos: 0,
            visitantesHoy: 0, visitantesAyer: 0, alertasMedicas: 0, tareasLimpiezaActivas: 0
          };
          setStats(statsData);
          setVisitantesChartData(data.data?.visitantesChart || data.visitantesChart);
          setAlimentosChartData(data.data?.alimentosChart || data.alimentosChart);
        } else {
          if (isMounted) {
            if (response.status === 401) {
              toast({ variant: "destructive", title: "Sesión expirada", description: "Por favor, inicia sesión nuevamente" });
              localStorage.removeItem('token');
              navigate('/login');
            } else {
              toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos del dashboard" });
              setStats({ totalAnimales: 0, totalEmpleados: 0, visitantesHoy: 0, visitantesAyer: 0, alertasMedicas: 0, tareasLimpiezaActivas: 0 });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        if (isMounted) {
          setError('No se pudo conectar con el servidor. Por favor, verifica que el backend esté funcionando.');
          toast({ variant: "destructive", title: "Error de conexión", description: "No se pudo conectar con el servidor" });
          setStats({ totalAnimales: 0, totalEmpleados: 0, visitantesHoy: 0, visitantesAyer: 0, alertasMedicas: 0, tareasLimpiezaActivas: 0 });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    socket.on('dashboard-update', (data) => {
      if (!isMounted || !data) return;
      
      const newStats = data.stats?.animales ? {
        totalAnimales: data.stats.animales?.total || 0,
        totalEmpleados: data.stats.empleados?.total || 0,
        empleadosActivos: data.stats.empleados?.activos || 0,
        visitantesHoy: data.stats.visitantes?.hoy || 0,
        visitantesAyer: data.stats.visitantes?.ayer || 0,
        alertasMedicas: data.stats.animales?.enfermos || 0,
        tareasLimpiezaActivas: data.stats.limpiezas?.activas || 0
      } : data.stats;

      if (newStats) setStats(newStats);
    });
    
    socket.on('charts-update', (data) => {
      if (isMounted && data) {
        if (data.visitantesChart) setVisitantesChartData(data.visitantesChart);
        if (data.alimentosChart) setAlimentosChartData(data.alimentosChart);
      }
    });

    return () => {
      isMounted = false;
      socket.off('dashboard-update');
      socket.off('charts-update');
    };
  }, [navigate, toast]);

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#ddd',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#e0e0e0' }, beginAtZero: true },
    },
    elements: {
      bar: {
        borderRadius: 5,
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
        }
      },
    },
  };

  const visitantesDataWithGradient = visitantesChartData && {
    ...visitantesChartData,
    datasets: visitantesChartData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: (context: any) => {
        const {ctx, chartArea} = context.chart;
        if (!chartArea) return null;
        return createGradient(ctx, chartArea);
      },
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
    })),
  };

  const alimentosDataWithColors = alimentosChartData && {
    ...alimentosChartData,
    datasets: alimentosChartData.datasets.map((dataset: any) => ({
      ...dataset,
      backgroundColor: [
        '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#3B82F6', '#EC4899', '#6EE7B7', '#FBBF24', '#A78BFA'
      ],
      borderColor: '#fff',
      borderWidth: 2,
    })),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-lg w-full shadow-lg">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <Siren className="h-6 w-6" /> Error de Conexión
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full bg-blue-600 hover:bg-blue-700">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard del Zoológico</h1>
          <p className="text-muted-foreground mt-1">Vista general en tiempo real de las operaciones.</p>
        </header>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard icon={Users} title="Total de Animales" value={stats?.totalAnimales} subtitle="En el zoológico" color="text-blue-500" onClick={() => navigate('/animales')} />
          <StatCard icon={Briefcase} title="Empleados Activos" value={stats?.empleadosActivos} subtitle={`${stats?.totalEmpleados || 0} empleados totales`} color="text-green-500" onClick={() => navigate('/empleados')} />
          <StatCard icon={Eye} title="Visitantes Hoy" value={stats?.visitantesHoy} subtitle={`Hoy, ${new Date().toLocaleDateString()}`} color="text-purple-500" onClick={() => navigate('/entradas')} comparison={stats?.visitantesAyer !== undefined ? stats.visitantesHoy - stats.visitantesAyer : null} />
          <StatCard icon={AlertCircle} title="Alertas Médicas" value={stats?.alertasMedicas} subtitle="Animales enfermos" color="text-red-500" valueColor="text-red-600" onClick={() => navigate('/alertas-medicas')} />
          <StatCard icon={Package} title="Tareas de Limpieza" value={stats?.tareasLimpiezaActivas} subtitle="Tareas activas" color="text-yellow-500" valueColor="text-green-600" onClick={() => navigate('/limpieza')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-3 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                Visitantes (Últimos 7 días)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {visitantesDataWithGradient ? (
                <Bar ref={chartRef} data={visitantesDataWithGradient} options={barChartOptions} />
              ) : <ChartPlaceholder />}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                Distribución de Alimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              {alimentosDataWithColors ? (
                <Pie data={alimentosDataWithColors} options={pieChartOptions} />
              ) : <ChartPlaceholder />}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, title, value, subtitle, color, valueColor, onClick, comparison }: any) => {
  const getComparisonDisplay = () => {
    if (comparison === null || comparison === undefined) return null;
    
    const absComparison = Math.abs(comparison);
    const isPositive = comparison > 0;
    const isNegative = comparison < 0;
    
    const ComparisonIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
    const comparisonColor = isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500';
    
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${comparisonColor} ml-2`}>
        <ComparisonIcon className="h-3 w-3" />
        {absComparison}
      </span>
    );
  };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer" onClick={onClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${valueColor || ''}`}>
          {value === undefined || value === null ? <Loader2 className="h-8 w-8 animate-spin" /> : value}
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          {subtitle}
          {getComparisonDisplay()}
        </p>
      </CardContent>
    </Card>
  );
};

const ChartPlaceholder = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
      <p>Cargando datos del gráfico...</p>
    </div>
  </div>
);
