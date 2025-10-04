const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');
const alimentoService = require('./alimentoService');

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

      // Verificar que el alimento existe y tiene stock suficiente
      const { data: alimentoData, error: alimentoError } = await supabase
        .from('alimentos')
        .select('id, stock_actual, stock_minimo')
        .eq('id', alimento_id)
        .single();

      if (alimentoError || !alimentoData) {
        throw new Error('Alimento no encontrado');
      }

      // Calcular cantidad a consumir basada en frecuencia
      let cantidadAConsumir = cantidad;
      switch (frecuencia) {
        case 'diario':
          cantidadAConsumir = cantidad;
          break;
        case 'semanal':
          cantidadAConsumir = cantidad / 7;
          break;
        case 'cada_dos_dias':
          cantidadAConsumir = cantidad / 2;
          break;
        case 'cada_tres_dias':
          cantidadAConsumir = cantidad / 3;
          break;
        default:
          cantidadAConsumir = cantidad;
      }

      // Verificar stock suficiente
      if (alimentoData.stock_actual < cantidadAConsumir) {
        throw new Error(`Stock insuficiente. Disponible: ${alimentoData.stock_actual}, requerido: ${cantidadAConsumir}`);
      }

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
          activo: true
        })
        .select()
        .single();

      if (error) throw error;

      // Restar el stock del alimento
      try {
        await alimentoService.updateStock(alimento_id, -cantidadAConsumir, 'salida');
        logger.info('Stock actualizado después de crear horario de alimentación', {
          alimentoId: alimento_id,
          cantidadConsumida: cantidadAConsumir,
          horarioId: result.id
        });
      } catch (stockError) {
        logger.error('Error actualizando stock después de crear horario:', stockError);
        // Si falla la actualización de stock, podríamos eliminar el horario creado
        // Pero por ahora solo logueamos el error
      }

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

      // Obtener el horario actual para calcular diferencias de stock
      const { data: horarioActual, error: getError } = await supabase
        .from('horarios_alimentacion')
        .select('alimento_id, cantidad, frecuencia')
        .eq('id', id)
        .single();

      if (getError) throw getError;
      if (!horarioActual) {
        throw new Error('Horario de alimentación no encontrado');
      }

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

      // Calcular y ajustar stock si cambió alimento, cantidad o frecuencia
      try {
        let cantidadAAjustar = 0;

        // Si cambió el alimento, devolver al anterior y restar del nuevo
        if (alimento_id !== horarioActual.alimento_id) {
          // Devolver al alimento anterior
          let cantidadAnterior = horarioActual.cantidad;
          switch (horarioActual.frecuencia) {
            case 'diario': cantidadAnterior = horarioActual.cantidad; break;
            case 'semanal': cantidadAnterior = horarioActual.cantidad / 7; break;
            case 'cada_dos_dias': cantidadAnterior = horarioActual.cantidad / 2; break;
            case 'cada_tres_dias': cantidadAnterior = horarioActual.cantidad / 3; break;
          }
          await alimentoService.updateStock(horarioActual.alimento_id, cantidadAnterior, 'entrada');

          // Restar del nuevo alimento
          let cantidadNueva = cantidad;
          switch (frecuencia) {
            case 'diario': cantidadNueva = cantidad; break;
            case 'semanal': cantidadNueva = cantidad / 7; break;
            case 'cada_dos_dias': cantidadNueva = cantidad / 2; break;
            case 'cada_tres_dias': cantidadNueva = cantidad / 3; break;
          }
          await alimentoService.updateStock(alimento_id, -cantidadNueva, 'salida');
        } else {
          // Mismo alimento, calcular diferencia
          let cantidadActual = horarioActual.cantidad;
          switch (horarioActual.frecuencia) {
            case 'diario': cantidadActual = horarioActual.cantidad; break;
            case 'semanal': cantidadActual = horarioActual.cantidad / 7; break;
            case 'cada_dos_dias': cantidadActual = horarioActual.cantidad / 2; break;
            case 'cada_tres_dias': cantidadActual = horarioActual.cantidad / 3; break;
          }

          let cantidadNueva = cantidad;
          switch (frecuencia) {
            case 'diario': cantidadNueva = cantidad; break;
            case 'semanal': cantidadNueva = cantidad / 7; break;
            case 'cada_dos_dias': cantidadNueva = cantidad / 2; break;
            case 'cada_tres_dias': cantidadNueva = cantidad / 3; break;
          }

          cantidadAAjustar = cantidadActual - cantidadNueva;
          if (cantidadAAjustar !== 0) {
            await alimentoService.updateStock(alimento_id, cantidadAAjustar, cantidadAAjustar > 0 ? 'entrada' : 'salida');
          }
        }

        logger.info('Stock ajustado después de actualizar horario de alimentación', {
          horarioId: id,
          cantidadAjustada: cantidadAAjustar
        });
      } catch (stockError) {
        logger.error('Error ajustando stock después de actualizar horario:', stockError);
      }

      return result;
    } catch (error) {
      logger.error('Error actualizando horario de alimentación:', error);
      throw error;
    }
  }

  // Eliminar horario de alimentación (desactivar)
  async deleteHorario(id) {
    try {
      // Primero obtener el horario para saber cuánto devolver al stock
      const { data: horario, error: getError } = await supabase
        .from('horarios_alimentacion')
        .select('alimento_id, cantidad, frecuencia')
        .eq('id', id)
        .single();

      if (getError) throw getError;
      if (!horario) {
        throw new Error('Horario de alimentación no encontrado');
      }

      // Calcular cantidad a devolver basada en frecuencia
      let cantidadADevolver = horario.cantidad;
      switch (horario.frecuencia) {
        case 'diario':
          cantidadADevolver = horario.cantidad;
          break;
        case 'semanal':
          cantidadADevolver = horario.cantidad / 7;
          break;
        case 'cada_dos_dias':
          cantidadADevolver = horario.cantidad / 2;
          break;
        case 'cada_tres_dias':
          cantidadADevolver = horario.cantidad / 3;
          break;
        default:
          cantidadADevolver = horario.cantidad;
      }

      // Desactivar el horario
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

      // Devolver el stock del alimento
      try {
        await alimentoService.updateStock(horario.alimento_id, cantidadADevolver, 'entrada');
        logger.info('Stock devuelto después de eliminar horario de alimentación', {
          alimentoId: horario.alimento_id,
          cantidadDevuelta: cantidadADevolver,
          horarioId: id
        });
      } catch (stockError) {
        logger.error('Error devolviendo stock después de eliminar horario:', stockError);
      }

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