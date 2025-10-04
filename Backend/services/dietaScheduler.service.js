const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');
const alimentoService = require('./alimentoService');
const DateUtils = require('../utils/dateUtils');

class DietaSchedulerService {
  // Procesar alimentaciones pendientes que deben ejecutarse ahora
  async procesarAlimentacionesPendientes() {
    try {
      const ahora = DateUtils.getGuatemalaTime();

      // Obtener horarios que deben ejecutarse ahora o antes
      const { data: horariosPendientes, error } = await supabase
        .from('horarios_alimentacion')
        .select(`
          id, animal_id, alimento_id, hora, frecuencia, cantidad,
          ultima_ejecucion, proxima_ejecucion,
          animales!inner(nombre),
          alimentos!inner(nombre, stock_actual, stock_minimo)
        `)
        .eq('activo', true)
        .lte('proxima_ejecucion', DateUtils.toISOString(ahora));

      if (error) throw error;

      logger.info(`Procesando ${horariosPendientes?.length || 0} alimentaciones pendientes`);

      const resultados = [];

      for (const horario of horariosPendientes || []) {
        try {
          const resultado = await this.ejecutarAlimentacion(horario);
          resultados.push({ id: horario.id, success: true, resultado });
        } catch (error) {
          logger.error(`Error ejecutando alimentación ${horario.id}:`, error.message);
          resultados.push({ id: horario.id, success: false, error: error.message });
        }
      }

      return resultados;
    } catch (error) {
      logger.error('Error procesando alimentaciones pendientes:', error);
      throw error;
    }
  }

  // Ejecutar una alimentación específica
  async ejecutarAlimentacion(horario) {
    try {
      const ahora = DateUtils.getGuatemalaTime();

      // Calcular cantidad a consumir
      let cantidadAConsumir = horario.cantidad;
      switch (horario.frecuencia) {
        case 'diario':
          cantidadAConsumir = horario.cantidad;
          break;
        case 'semanal':
          cantidadAConsumir = horario.cantidad / 7;
          break;
        case 'cada_dos_dias':
          cantidadAConsumir = horario.cantidad / 2;
          break;
        case 'cada_tres_dias':
          cantidadAConsumir = horario.cantidad / 3;
          break;
        default:
          cantidadAConsumir = horario.cantidad;
      }

      // Verificar stock suficiente
      if (horario.alimentos.stock_actual < cantidadAConsumir) {
        throw new Error(`Stock insuficiente para ${horario.alimentos.nombre}. Disponible: ${horario.alimentos.stock_actual}, requerido: ${cantidadAConsumir}`);
      }

      // Restar el stock
      await alimentoService.updateStock(horario.alimento_id, -cantidadAConsumir, 'salida');

      // Calcular próxima ejecución
      const proximaEjecucion = DateUtils.calcularProximaEjecucion(horario.frecuencia, horario.hora);

      // Actualizar el horario con la ejecución
      const { error: updateError } = await supabase
        .from('horarios_alimentacion')
        .update({
          ultima_ejecucion: DateUtils.toISOString(ahora),
          proxima_ejecucion: DateUtils.toISOString(proximaEjecucion),
          fecha_actualizacion: DateUtils.toISOString(ahora)
        })
        .eq('id', horario.id);

      if (updateError) throw updateError;

      logger.info(`Alimentación ejecutada: ${horario.animales.nombre} - ${horario.alimentos.nombre} - ${cantidadAConsumir} unidades - Próxima: ${DateUtils.formatForDisplay(proximaEjecucion)}`);

      return {
        animal: horario.animales.nombre,
        alimento: horario.alimentos.nombre,
        cantidadConsumida: cantidadAConsumir,
        proximaEjecucion: DateUtils.formatForDisplay(proximaEjecucion)
      };
    } catch (error) {
      logger.error(`Error ejecutando alimentación ${horario.id}:`, error);
      throw error;
    }
  }

  // Calcular la próxima ejecución basada en la frecuencia
  calcularProximaEjecucion(frecuencia, hora) {
    return DateUtils.calcularProximaEjecucion(frecuencia, hora);
  }

  // Actualizar la próxima ejecución cuando se crea o modifica un horario
  async actualizarProximaEjecucion(horarioId) {
    try {
      // Obtener el horario
      const { data: horario, error } = await supabase
        .from('horarios_alimentacion')
        .select('frecuencia, hora')
        .eq('id', horarioId)
        .single();

      if (error) throw error;
      if (!horario) throw new Error('Horario no encontrado');

      const proximaEjecucion = DateUtils.calcularProximaEjecucion(horario.frecuencia, horario.hora);

      // Actualizar
      const { error: updateError } = await supabase
        .from('horarios_alimentacion')
        .update({
          proxima_ejecucion: DateUtils.toISOString(proximaEjecucion),
          fecha_actualizacion: DateUtils.toISOString(DateUtils.getGuatemalaTime())
        })
        .eq('id', horarioId);

      if (updateError) throw updateError;

      return proximaEjecucion;
    } catch (error) {
      logger.error(`Error actualizando próxima ejecución para horario ${horarioId}:`, error);
      throw error;
    }
  }

  // Obtener estadísticas de ejecuciones
  async getEstadisticasEjecuciones() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);

      // Alimentaciones ejecutadas hoy
      const { count: ejecutadasHoy, error: countError } = await supabase
        .from('horarios_alimentacion')
        .select('*', { count: 'exact', head: true })
        .gte('ultima_ejecucion', hoy.toISOString())
        .lt('ultima_ejecucion', mañana.toISOString());

      if (countError) throw countError;

      // Próximas alimentaciones
      const { data: proximas, error: proximasError } = await supabase
        .from('horarios_alimentacion')
        .select(`
          id, proxima_ejecucion, hora,
          animales!inner(nombre),
          alimentos!inner(nombre)
        `)
        .eq('activo', true)
        .not('proxima_ejecucion', 'is', null)
        .order('proxima_ejecucion')
        .limit(10);

      if (proximasError) throw proximasError;

      return {
        ejecutadasHoy: ejecutadasHoy || 0,
        proximasEjecuciones: proximas || []
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de ejecuciones:', error);
      throw error;
    }
  }
}

module.exports = new DietaSchedulerService();