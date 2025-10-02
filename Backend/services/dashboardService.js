const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');

// Función helper para obtener fecha local en formato YYYY-MM-DD
const getLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función helper para obtener fecha de mañana local
const getTomorrowLocalDate = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función helper para obtener fecha local de un Date object
const getLocalDateFromDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

class DashboardService {
  
  // Obtener estadísticas generales del zoológico
  async getGeneralStats() {
    try {
      logger.info('Starting getGeneralStats');
      
      // Obtener total de animales y enfermos
      const { data: animales, error: animalesError } = await supabase
        .from('animales')
        .select('id, estado_salud');
      
      if (animalesError) {
        logger.error('Error fetching animales', { error: animalesError.message });
        // Continuar con valores por defecto en lugar de fallar
      }
      
      const totalAnimales = animales?.length || 0;
      // Contar animales enfermos (incluyendo diferentes estados problemáticos)
      const enfermos = animales?.filter(a => {
        const estado = a.estado_salud?.toLowerCase() || '';
        return estado === 'enfermo' || estado === 'critico' || estado === 'en tratamiento';
      }).length || 0;
      logger.info('Animales stats', { totalAnimales, enfermos });
      
      // Obtener total de empleados y activos
      const { data: empleados, error: empleadosError } = await supabase
        .from('empleados')
        .select('id, estado');
      
      if (empleadosError) {
        logger.error('Error fetching empleados', { error: empleadosError.message });
      }
      
      const totalEmpleados = empleados?.length || 0;
      const activosEmpleados = empleados?.filter(e => e.estado === 'activo').length || 0;
      logger.info('Empleados stats', { totalEmpleados, activosEmpleados });
      
      // Obtener visitantes de hoy
      const fechaHoy = getLocalDate();
      const fechaMañana = getTomorrowLocalDate();
      const { data: entradas, error: entradasError } = await supabase
        .from('entradas')
        .select('cantidad, total_venta')
        .gte('fecha_venta', fechaHoy)
        .lt('fecha_venta', fechaMañana);
      
      if (entradasError) {
        logger.error('Error fetching entradas', { error: entradasError.message });
      }
      
      const totalVisitantesHoy = entradas?.reduce((sum, e) => sum + (parseInt(e.cantidad) || 0), 0) || 0;
      const ingresosHoy = entradas?.reduce((sum, e) => sum + (parseFloat(e.total_venta) || 0), 0) || 0;
      logger.info('Visitantes stats', { totalVisitantesHoy, ingresosHoy });
      
      // Obtener alimentos y bajo stock
      const { data: alimentos, error: alimentosError } = await supabase
        .from('alimentos')
        .select('id, stock_actual, stock_minimo');
      
      if (alimentosError) {
        logger.error('Error fetching alimentos', { error: alimentosError.message });
      }
      
      const totalAlimentos = alimentos?.length || 0;
      const bajoStock = alimentos?.filter(a => a.stock_actual <= a.stock_minimo).length || 0;
      logger.info('Alimentos stats', { totalAlimentos, bajoStock });
      
      // Obtener tratamientos
      const { data: tratamientos, error: tratamientosError } = await supabase
        .from('tratamientos')
        .select('id, estado');
      
      if (tratamientosError) {
        logger.error('Error fetching tratamientos', { error: tratamientosError.message });
      }
      
      const totalTratamientos = tratamientos?.length || 0;
      const activosTratamientos = tratamientos?.filter(t => t.estado === 'activo').length || 0;
      logger.info('Tratamientos stats', { totalTratamientos, activosTratamientos });

      // Obtener tareas de limpieza activas y pendientes
      const { data: limpiezas, error: limpiezasError } = await supabase
        .from('tareas_limpieza')
        .select('id, estado, activo, proxima_fecha');
      
      if (limpiezasError) {
        logger.error('Error fetching limpiezas', { error: limpiezasError.message });
      }
      
      // Filtrar solo tareas activas, no completadas y no vencidas
      const now = new Date();
      const tareasActivas = limpiezas?.filter(l => 
        l.activo !== false && 
        l.estado !== 'completada' && 
        new Date(l.proxima_fecha) > now
      ) || [];
      const totalLimpiezas = tareasActivas.length;
      const pendientesLimpiezas = tareasActivas.filter(l => l.estado === 'pendiente').length;
      // Buscar ambas variantes: 'en_proceso' y 'en_progreso'
      const enProcesoLimpiezas = tareasActivas.filter(l => l.estado === 'en_proceso' || l.estado === 'en_progreso').length;
      logger.info('Limpiezas stats', { totalLimpiezas, pendientesLimpiezas, enProcesoLimpiezas });

      return {
        animales: {
          total: totalAnimales,
          enfermos: enfermos,
          sanos: totalAnimales - enfermos
        },
        empleados: {
          total: totalEmpleados,
          activos: activosEmpleados
        },
        visitantes: {
          hoy: totalVisitantesHoy,
          ingresos_hoy: ingresosHoy
        },
        alimentos: {
          total: totalAlimentos,
          bajo_stock: bajoStock
        },
        tratamientos: {
          total: totalTratamientos,
          activos: activosTratamientos
        },
        limpiezas: {
          total: totalLimpiezas,
          pendientes: pendientesLimpiezas,
          en_proceso: enProcesoLimpiezas,
          activas: pendientesLimpiezas + enProcesoLimpiezas
        }
      };
    } catch (error) {
      logger.error('Error getting general stats', { error: error.message });
      throw error;
    }
  }

  // Obtener datos para gráficas de visitantes por mes
  async getVisitantesChart(dias = 30) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - dias);
      const fechaInicioStr = getLocalDateFromDate(fechaInicio);
      
      const { data: entradas, error } = await supabase
        .from('entradas')
        .select('fecha_venta, cantidad, total_venta')
        .gte('fecha_venta', fechaInicioStr)
        .order('fecha_venta', { ascending: true });
      
      if (error) throw error;
      
      // Agrupar por día
      const diasData = {};
      entradas?.forEach(entrada => {
        const dia = entrada.fecha_venta; // YYYY-MM-DD
        if (!diasData[dia]) {
          diasData[dia] = {
            total_visitantes: 0,
            ingresos: 0
          };
        }
        diasData[dia].total_visitantes += parseInt(entrada.cantidad) || 0;
        diasData[dia].ingresos += parseFloat(entrada.total_venta) || 0;
      });
      
      return Object.keys(diasData).sort().map(dia => ({
        dia,
        visitantes: diasData[dia].total_visitantes,
        ingresos: diasData[dia].ingresos
      }));
    } catch (error) {
      logger.error('Error getting visitantes chart data', { error: error.message });
      throw error;
    }
  }

  // Obtener estado de salud de animales para gráfica de pie
  async getAnimalesSaludChart() {
    try {
      const { data: animales, error } = await supabase
        .from('animales')
        .select('estado_salud');
      
      if (error) throw error;
      
      // Agrupar por estado de salud
      const estadosCount = {};
      const total = animales?.length || 0;
      
      animales?.forEach(animal => {
        const estado = animal.estado_salud || 'desconocido';
        estadosCount[estado] = (estadosCount[estado] || 0) + 1;
      });
      
      return Object.keys(estadosCount).map(estado => ({
        estado,
        cantidad: estadosCount[estado],
        porcentaje: total > 0 ? parseFloat(((estadosCount[estado] / total) * 100).toFixed(2)) : 0
      })).sort((a, b) => b.cantidad - a.cantidad);
    } catch (error) {
      logger.error('Error getting animales salud chart data', { error: error.message });
      throw error;
    }
  }

  // Obtener consumo de alimentos por semana
  async getConsumoAlimentosChart(semanas = 8) {
    try {
      const fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - (semanas * 7));
      const fechaInicioStr = getLocalDateFromDate(fechaInicio);
      
      const { data: movimientos, error: movError } = await supabase
        .from('movimientos_inventario')
        .select('fecha_movimiento, tipo_movimiento, cantidad, producto_id')
        .gte('fecha_movimiento', fechaInicioStr)
        .eq('tipo_movimiento', 'salida');
      
      if (movError) throw movError;
      
      // Obtener información de alimentos
      const productosIds = [...new Set(movimientos?.map(m => m.producto_id) || [])];
      const { data: alimentos, error: alimError } = await supabase
        .from('alimentos')
        .select('id, tipo')
        .in('id', productosIds);
      
      if (alimError) throw alimError;
      
      // Crear mapa de productos
      const productoMap = {};
      alimentos?.forEach(alim => {
        productoMap[alim.id] = alim.tipo;
      });
      
      // Agrupar por semana
      const semanas_data = {};
      movimientos?.forEach(mov => {
        const fecha = new Date(mov.fecha_movimiento);
        const semana = getLocalDateFromDate(this.getWeekStart(fecha));
        const tipoAlimento = productoMap[mov.producto_id] || 'otros';
        
        if (!semanas_data[semana]) {
          semanas_data[semana] = {};
        }
        semanas_data[semana][tipoAlimento] = (semanas_data[semana][tipoAlimento] || 0) + parseFloat(mov.cantidad || 0);
      });

      return Object.keys(semanas_data).sort().map(semana => ({
        semana,
        ...semanas_data[semana]
      }));
    } catch (error) {
      logger.error('Error getting consumo alimentos chart data', { error: error.message });
      throw error;
    }
  }
  
  // Función auxiliar para obtener el inicio de la semana
  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que el lunes sea el primer día
    return new Date(d.setDate(diff));
  }

  // Obtener empleados por departamento
  async getEmpleadosPorDepartamento() {
    try {
      const { data: empleados, error } = await supabase
        .from('empleados')
        .select('puesto, estado, salario');
      
      if (error) throw error;
      
      // Agrupar por puesto
      const puestosData = {};
      empleados?.forEach(emp => {
        const puesto = emp.puesto || 'sin_puesto';
        if (!puestosData[puesto]) {
          puestosData[puesto] = {
            total: 0,
            activos: 0,
            salarios: []
          };
        }
        puestosData[puesto].total++;
        if (emp.estado === 'activo') {
          puestosData[puesto].activos++;
        }
        if (emp.salario) {
          puestosData[puesto].salarios.push(parseFloat(emp.salario));
        }
      });
      
      return Object.keys(puestosData).map(puesto => ({
        departamento: puesto,
        total: puestosData[puesto].total,
        activos: puestosData[puesto].activos,
        salario_promedio: puestosData[puesto].salarios.length > 0
          ? (puestosData[puesto].salarios.reduce((a, b) => a + b, 0) / puestosData[puesto].salarios.length).toFixed(2)
          : '0.00'
      })).sort((a, b) => b.total - a.total);
    } catch (error) {
      logger.error('Error getting empleados por departamento data', { error: error.message });
      throw error;
    }
  }

  // Obtener alertas del sistema
  async getAlertas() {
    try {
      const hoy = getLocalDate();
      
      // Alimentos bajo stock
      const { data: todosAlimentos } = await supabase
        .from('alimentos')
        .select('nombre, stock_actual, stock_minimo');
      
      // Filtrar en JavaScript
      const alimentosBajoStock = todosAlimentos
        ?.filter(a => a.stock_actual <= a.stock_minimo)
        .sort((a, b) => a.stock_actual - b.stock_actual)
        .slice(0, 5);
      
      // Animales enfermos
      const { data: animalesEnfermos } = await supabase
        .from('animales')
        .select('nombre, especie, estado_salud')
        .in('estado_salud', ['enfermo', 'en tratamiento'])
        .limit(5);
      
      // Tratamientos vencidos
      const { data: tratamientos } = await supabase
        .from('tratamientos')
        .select('id, animal_id, fecha_fin, diagnostico')
        .eq('estado', 'activo')
        .lt('fecha_fin', hoy)
        .limit(5);
      
      // Obtener nombres de animales para tratamientos
      let tratamientosVencidos = [];
      if (tratamientos && tratamientos.length > 0) {
        const animalIds = tratamientos.map(t => t.animal_id);
        const { data: animalesTrat } = await supabase
          .from('animales')
          .select('id, nombre')
          .in('id', animalIds);
        
        const animalMap = {};
        animalesTrat?.forEach(a => {
          animalMap[a.id] = a.nombre;
        });
        
        tratamientosVencidos = tratamientos.map(t => ({
          id: t.id,
          animal: animalMap[t.animal_id] || 'Desconocido',
          fecha_fin: t.fecha_fin,
          diagnostico: t.diagnostico
        }));
      }
      
      // Limpiezas atrasadas
      const { data: limpiezasAtrasadas } = await supabase
        .from('tareas_limpieza')
        .select('area, proxima_fecha, estado')
        .eq('estado', 'pendiente')
        .eq('activo', true)
        .lt('proxima_fecha', hoy)
        .limit(5);

      return {
        alimentos_bajo_stock: alimentosBajoStock || [],
        animales_enfermos: animalesEnfermos || [],
        tratamientos_vencidos: tratamientosVencidos || [],
        limpiezas_atrasadas: limpiezasAtrasadas || []
      };
    } catch (error) {
      logger.error('Error getting alertas data', { error: error.message });
      throw error;
    }
  }

  // Obtener datos en tiempo real (para WebSocket)
  async getRealTimeData() {
    try {
      const [generalStats, alertas] = await Promise.all([
        this.getGeneralStats(),
        this.getAlertas()
      ]);

      return {
        timestamp: new Date().toISOString(),
        stats: generalStats,
        alertas,
        system: {
          uptime: process.uptime(),
          memory_usage: process.memoryUsage(),
          cpu_usage: process.cpuUsage()
        }
      };
    } catch (error) {
      logger.error('Error getting real time data', { error: error.message });
      throw error;
    }
  }

  // Obtener métricas de rendimiento del sistema
  async getSystemMetrics() {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      return {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
          external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        node_version: process.version,
        platform: process.platform
      };
    } catch (error) {
      logger.error('Error getting system metrics', { error: error.message });
      throw error;
    }
  }

  // Generar reporte completo
  async generateFullReport() {
    try {
      const [
        generalStats,
        visitantesChart,
        animalesSaludChart,
        consumoAlimentosChart,
        empleadosPorDepartamento,
        alertas,
        systemMetrics
      ] = await Promise.all([
        this.getGeneralStats(),
        this.getVisitantesChart(),
        this.getAnimalesSaludChart(),
        this.getConsumoAlimentosChart(),
        this.getEmpleadosPorDepartamento(),
        this.getAlertas(),
        this.getSystemMetrics()
      ]);

      return {
        timestamp: new Date().toISOString(),
        general_stats: generalStats,
        charts: {
          visitantes: visitantesChart,
          animales_salud: animalesSaludChart,
          consumo_alimentos: consumoAlimentosChart,
          empleados_departamento: empleadosPorDepartamento
        },
        alertas,
        system_metrics: systemMetrics
      };
    } catch (error) {
      logger.error('Error generating full report', { error: error.message });
      throw error;
    }
  }
}

module.exports = new DashboardService();