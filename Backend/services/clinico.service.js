const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');

// Servicio para módulo clínico - Gestión de tratamientos veterinarios
const clinicoService = {
  // ===== TRATAMIENTOS =====
  
  async getAllTratamientos(filters = {}) {
    try {
      logger.info('Obteniendo todos los tratamientos', { filters });
      
      let query = supabase
        .from('tratamientos')
        .select(`
          *,
          animal:animales(id, nombre, especie, estado_salud, habitat, edad, fecha_ingreso)
        `)
        .order('fecha_inicio', { ascending: false });

      // Aplicar filtros
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      
      if (filters.animal_id) {
        query = query.eq('animal_id', filters.animal_id);
      }
      
      if (filters.fecha_inicio) {
        query = query.gte('fecha_inicio', filters.fecha_inicio);
      }
      
      if (filters.fecha_fin) {
        query = query.lte('fecha_fin', filters.fecha_fin);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error obteniendo tratamientos desde Supabase', { error: error.message });
        throw error;
      }

      logger.info('Tratamientos obtenidos exitosamente', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Error en getAllTratamientos', { error: error.message });
      throw error;
    }
  },

  async getTratamientoById(id) {
    try {
      const { data, error } = await supabase
        .from('tratamientos')
        .select(`
          *,
          animal:animales(id, nombre, especie, estado_salud, habitat, edad, fecha_ingreso)
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Tratamiento no encontrado', { id });
          return null;
        }
        logger.error('Error obteniendo tratamiento por ID', { error: error.message, id });
        throw error;
      }

      logger.info('Tratamiento obtenido por ID', { id });
      return data;
    } catch (error) {
      logger.error('Error en getTratamientoById', { error: error.message, id });
      throw error;
    }
  },

  async createTratamiento(data) {
    try {
      const tratamientoData = {
        animal_id: parseInt(data.animal_id),
        diagnostico: data.diagnostico,
        tratamiento: data.tratamiento,
        medicamento: data.medicamento || null,
        dosis: data.dosis || null,
        frecuencia: data.frecuencia || null,
        fecha_inicio: data.fecha_inicio || new Date().toISOString().split('T')[0],
        fecha_fin: data.fecha_fin,
        estado: data.estado || 'activo',
        veterinario: data.veterinario || null,
        notas: data.notas || null
      };

      logger.info('Creando tratamiento', { tratamientoData });

      const { data: nuevoTratamiento, error } = await supabase
        .from('tratamientos')
        .insert([tratamientoData])
        .select(`
          *,
          animal:animales(id, nombre, especie, estado_salud)
        `)
        .single();

      if (error) {
        logger.error('Error creando tratamiento en Supabase', { error: error.message });
        throw error;
      }

      logger.info('Tratamiento creado exitosamente', { id: nuevoTratamiento.id });
      return nuevoTratamiento;
    } catch (error) {
      logger.error('Error en createTratamiento', { error: error.message, data });
      throw error;
    }
  },

  async updateTratamiento(id, data) {
    try {
      const updateData = {};
      
      if (data.diagnostico !== undefined) updateData.diagnostico = data.diagnostico;
      if (data.tratamiento !== undefined) updateData.tratamiento = data.tratamiento;
      if (data.medicamento !== undefined) updateData.medicamento = data.medicamento;
      if (data.dosis !== undefined) updateData.dosis = data.dosis;
      if (data.frecuencia !== undefined) updateData.frecuencia = data.frecuencia;
      if (data.fecha_inicio !== undefined) updateData.fecha_inicio = data.fecha_inicio;
      if (data.fecha_fin !== undefined) updateData.fecha_fin = data.fecha_fin;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.veterinario !== undefined) updateData.veterinario = data.veterinario;
      if (data.notas !== undefined) updateData.notas = data.notas;
      
      updateData.updated_at = new Date().toISOString();

      logger.info('Actualizando tratamiento', { id, updateData });

      const { data: tratamientoActualizado, error } = await supabase
        .from('tratamientos')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          animal:animales(id, nombre, especie, estado_salud)
        `)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Tratamiento no encontrado para actualizar', { id });
          return null;
        }
        logger.error('Error actualizando tratamiento en Supabase', { error: error.message, id });
        throw error;
      }

      logger.info('Tratamiento actualizado exitosamente', { id });
      return tratamientoActualizado;
    } catch (error) {
      logger.error('Error en updateTratamiento', { error: error.message, id, data });
      throw error;
    }
  },

  async deleteTratamiento(id) {
    try {
      logger.info('Eliminando tratamiento', { id });

      const { error } = await supabase
        .from('tratamientos')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error eliminando tratamiento en Supabase', { error: error.message, id });
        throw error;
      }

      logger.info('Tratamiento eliminado exitosamente', { id });
      return true;
    } catch (error) {
      logger.error('Error en deleteTratamiento', { error: error.message, id });
      throw error;
    }
  },

  async getEstadisticasTratamientos() {
    try {
      logger.info('Obteniendo estadísticas de tratamientos');

      const { data, error } = await supabase
        .from('tratamientos')
        .select('*');

      if (error) {
        throw error;
      }

      const estadisticas = {
        total: data.length,
        activos: data.filter(t => t.estado === 'activo').length,
        completados: data.filter(t => t.estado === 'completado').length,
        cancelados: data.filter(t => t.estado === 'cancelado').length,
        por_estado: {}
      };

      // Agrupar por estado
      data.forEach(tratamiento => {
        if (!estadisticas.por_estado[tratamiento.estado]) {
          estadisticas.por_estado[tratamiento.estado] = 0;
        }
        estadisticas.por_estado[tratamiento.estado]++;
      });

      return estadisticas;
    } catch (error) {
      logger.error('Error en getEstadisticasTratamientos', { error: error.message });
      throw error;
    }
  },

  // ===== COMPATIBILIDAD CON REGISTROS CLÍNICOS =====
  
  async getAllRegistros() {
    // Alias para getAllTratamientos
    return this.getAllTratamientos();
  },

  async createRegistro(data) {
    // Alias para createTratamiento
    return this.createTratamiento(data);
  },

  async getRegistroById(id) {
    // Alias para getTratamientoById
    return this.getTratamientoById(id);
  },

  async updateRegistro(id, data) {
    // Alias para updateTratamiento
    return this.updateTratamiento(id, data);
  },

  async deleteRegistro(id) {
    // Alias para deleteTratamiento
    return this.deleteTratamiento(id);
  }
};

module.exports = clinicoService;