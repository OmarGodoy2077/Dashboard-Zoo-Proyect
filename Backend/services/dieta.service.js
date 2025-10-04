const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');
const dietaScheduler = require('./dietaScheduler.service');
const DateUtils = require('../utils/dateUtils');

class DietaService {
  // Obtener todos los horarios de alimentación con filtros opcionales
  async getAllHorarios(filters = {}) {
    try {
      let query = supabase
        .from('horarios_alimentacion')
        .select(`
          *,
          animales!inner(nombre, especie),
          alimentos!inner(nombre, tipo, unidad_medida)
        `);

      if (filters.animal_id) {
        query = query.eq('animal_id', filters.animal_id);
      }

      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo);
      }

      query = query.order('animal_id').order('hora');

      const { data, error } = await query;

      if (error) throw error;

      // Transformar los datos para mantener compatibilidad
      return (data || []).map(item => ({
        ...item,
        animal_nombre: item.animales?.nombre,
        animal_especie: item.animales?.especie,
        alimento_nombre: item.alimentos?.nombre,
        alimento_tipo: item.alimentos?.tipo,
        unidad_medida: item.alimentos?.unidad_medida
      }));
    } catch (error) {
      logger.error('Error obteniendo horarios de alimentación:', error);
      throw error;
    }
  }

  // Obtener horarios por animal
  async getHorariosByAnimal(animalId) {
    try {
      const { data, error } = await supabase
        .from('horarios_alimentacion')
        .select(`
          *,
          alimentos!inner(nombre, tipo, unidad_medida)
        `)
        .eq('animal_id', animalId)
        .eq('activo', true)
        .order('hora');

      if (error) throw error;

      // Transformar los datos
      return (data || []).map(item => ({
        ...item,
        alimento_nombre: item.alimentos?.nombre,
        alimento_tipo: item.alimentos?.tipo,
        unidad_medida: item.alimentos?.unidad_medida
      }));
    } catch (error) {
      logger.error('Error obteniendo horarios por animal:', error);
      throw error;
    }
  }

  // Obtener horario por ID
  async getHorarioById(id) {
    try {
      const { data, error } = await supabase
        .from('horarios_alimentacion')
        .select(`
          *,
          animales!inner(nombre, especie),
          alimentos!inner(nombre, tipo, unidad_medida)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) return null;

      // Transformar los datos
      return {
        ...data,
        animal_nombre: data.animales?.nombre,
        animal_especie: data.animales?.especie,
        alimento_nombre: data.alimentos?.nombre,
        alimento_tipo: data.alimentos?.tipo,
        unidad_medida: data.alimentos?.unidad_medida
      };
    } catch (error) {
      logger.error('Error obteniendo horario por ID:', error);
      throw error;
    }
  }

  // Crear nuevo horario de alimentación
  async createHorario(data) {
    try {
      const { animal_id, alimento_id, hora, frecuencia, cantidad, observaciones } = data;

      // Verificar que el animal existe
      const { data: animalData, error: animalError } = await supabase
        .from('animales')
        .select('id')
        .eq('id', animal_id)
        .single();

      if (animalError || !animalData) {
        throw new Error('Animal no encontrado');
      }

      // Verificar que el alimento existe y tiene stock suficiente para al menos una alimentación
      const { data: alimentoData, error: alimentoError } = await supabase
        .from('alimentos')
        .select('id, stock_actual, stock_minimo')
        .eq('id', alimento_id)
        .single();

      if (alimentoError || !alimentoData) {
        throw new Error('Alimento no encontrado');
      }

      // Calcular cantidad necesaria para una alimentación
      let cantidadPorAlimentacion = cantidad;
      switch (frecuencia) {
        case 'diario':
          cantidadPorAlimentacion = cantidad;
          break;
        case 'semanal':
          cantidadPorAlimentacion = cantidad / 7;
          break;
        case 'cada_dos_dias':
          cantidadPorAlimentacion = cantidad / 2;
          break;
        case 'cada_tres_dias':
          cantidadPorAlimentacion = cantidad / 3;
          break;
        default:
          cantidadPorAlimentacion = cantidad;
      }

      // Verificar stock mínimo para una alimentación
      if (alimentoData.stock_actual < cantidadPorAlimentacion) {
        throw new Error(`Stock insuficiente para la primera alimentación. Disponible: ${alimentoData.stock_actual}, requerido: ${cantidadPorAlimentacion}`);
      }

      // Calcular próxima ejecución
      const proximaEjecucion = DateUtils.calcularProximaEjecucion(frecuencia, hora);

      // Crear el horario
      const { data: result, error } = await supabase
        .from('horarios_alimentacion')
        .insert({
          animal_id,
          alimento_id,
          hora,
          frecuencia,
          cantidad,
          observaciones: observaciones || '',
          activo: true,
          proxima_ejecucion: DateUtils.toISOString(proximaEjecucion)
        })
        .select()
        .single();

      if (error) throw error;

      logger.info(`Horario de alimentación creado: ${result.id} - Próxima ejecución: ${proximaEjecucion.toISOString()}`);

      return result;
    } catch (error) {
      logger.error('Error creando horario de alimentación:', error);
      throw error;
    }
  }

  // Actualizar horario de alimentación
  async updateHorario(id, data) {
    try {
      const { animal_id, alimento_id, hora, frecuencia, cantidad, observaciones, activo } = data;

      const updateData = {
        animal_id,
        alimento_id,
        hora,
        frecuencia,
        cantidad,
        observaciones: observaciones || '',
        activo: activo !== undefined ? activo : true,
        fecha_actualizacion: new Date().toISOString()
      };

      // Si cambió la frecuencia o hora, recalcular próxima ejecución
      if (frecuencia || hora) {
        const nuevaFrecuencia = frecuencia || (await supabase.from('horarios_alimentacion').select('frecuencia').eq('id', id).single()).data?.frecuencia;
        const nuevaHora = hora || (await supabase.from('horarios_alimentacion').select('hora').eq('id', id).single()).data?.hora;

        if (nuevaFrecuencia && nuevaHora) {
          const proximaEjecucion = DateUtils.calcularProximaEjecucion(nuevaFrecuencia, nuevaHora);
          updateData.proxima_ejecucion = DateUtils.toISOString(proximaEjecucion);
        }
      }

      const { data: result, error } = await supabase
        .from('horarios_alimentacion')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!result) {
        throw new Error('Horario de alimentación no encontrado');
      }

      logger.info(`Horario de alimentación actualizado: ${id}`);

      return result;
    } catch (error) {
      logger.error('Error actualizando horario de alimentación:', error);
      throw error;
    }
  }

  // Eliminar horario de alimentación (desactivar)
  async deleteHorario(id) {
    try {
      const { data: result, error } = await supabase
        .from('horarios_alimentacion')
        .update({
          activo: false,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!result) {
        throw new Error('Horario de alimentación no encontrado');
      }

      logger.info(`Horario de alimentación desactivado: ${id}`);

      return result;
    } catch (error) {
      logger.error('Error eliminando horario de alimentación:', error);
      throw error;
    }
  }

  // Obtener estadísticas de dietas
  async getEstadisticasDietas() {
    try {
      // Obtener total de animales con dieta
      const { count: totalAnimalesConDieta, error: countError } = await supabase
        .from('horarios_alimentacion')
        .select('animal_id', { count: 'exact', head: true })
        .eq('activo', true);

      if (countError) throw countError;

      // Obtener estadísticas agregadas
      const { data: stats, error: statsError } = await supabase
        .from('horarios_alimentacion')
        .select('cantidad')
        .eq('activo', true);

      if (statsError) throw statsError;

      const totalHorarios = stats?.length || 0;
      const cantidadPromedio = totalHorarios > 0
        ? stats.reduce((sum, item) => sum + parseFloat(item.cantidad || 0), 0) / totalHorarios
        : 0;

      // Obtener alimentos utilizados
      const { data: alimentosData, error: alimentosError } = await supabase
        .from('horarios_alimentacion')
        .select('alimento_id')
        .eq('activo', true);

      if (alimentosError) throw alimentosError;

      const alimentosUtilizados = new Set(alimentosData?.map(item => item.alimento_id) || []).size;

      return {
        total_animales_con_dieta: totalAnimalesConDieta || 0,
        total_horarios: totalHorarios,
        cantidad_promedio: cantidadPromedio,
        alimentos_utilizados: alimentosUtilizados
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de dietas:', error);
      throw error;
    }
  }
}

module.exports = new DietaService();