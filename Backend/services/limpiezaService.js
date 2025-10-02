const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');
const { validateLimpiezaData } = require('../utils/validation');

const getAllTareasLimpieza = async (filters = {}) => {
  try {
    let query = supabase
      .from('tareas_limpieza')
      .select(`
        *,
        encargado:empleados(nombre)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.area) {
      query = query.eq('area', filters.area);
    }
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.encargado_id) {
      query = query.eq('encargado_id', filters.encargado_id);
    }
    if (filters.fecha_inicio && filters.fecha_fin) {
      query = query.gte('proxima_fecha', filters.fecha_inicio).lte('proxima_fecha', filters.fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transformar los datos para que el encargado aparezca solo con el nombre
    const transformedData = data.map(tarea => ({
      ...tarea,
      encargado: tarea.encargado ? tarea.encargado.nombre : null
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error getting all limpieza tasks', { filters, error: error.message });
    throw error;
  }
};

const getTareaLimpiezaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('tareas_limpieza')
      .select(`
        *,
        encargado:empleados(nombre)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      encargado: data.encargado ? data.encargado.nombre : null
    };
  } catch (error) {
    logger.error('Error getting limpieza task by id', { id, error: error.message });
    throw error;
  }
};

const createTareaLimpieza = async (tareaData) => {
  try {
    // Mapear campos del frontend al formato de la base de datos
    const mappedData = {
      area: tareaData.area,
      frecuencia: tareaData.frecuencia || 'diaria',
      ultima_fecha: tareaData.ultima_fecha || new Date().toISOString().split('T')[0],
      proxima_fecha: tareaData.proxima_fecha || tareaData.fecha_limite,
      estado: tareaData.estado || 'pendiente',
      notas: tareaData.notas || tareaData.descripcion,
      activo: tareaData.activo !== undefined ? tareaData.activo : true
    };
    
    // Solo incluir encargado_id si tiene valor válido
    if (tareaData.encargado_id && tareaData.encargado_id !== '' && tareaData.encargado_id !== 'none') {
      mappedData.encargado_id = parseInt(tareaData.encargado_id);
    }

    logger.info('Creating limpieza task with data:', mappedData);

    const { data, error } = await supabase
      .from('tareas_limpieza')
      .insert([mappedData])
      .select()
      .single();

    if (error) {
      logger.error('Supabase error creating task:', error);
      throw error;
    }

    logger.info('Limpieza task created successfully', { taskId: data.id, area: data.area });
    return data;
 } catch (error) {
    logger.error('Error creating limpieza task', { tareaData, error: error.message });
    throw error;
  }
};

const updateTareaLimpieza = async (id, tareaData) => {
  try {
    // Mapear campos del frontend al formato de la base de datos
    const updateData = {};
    if (tareaData.area !== undefined) updateData.area = tareaData.area;
    if (tareaData.encargado_id !== undefined) updateData.encargado_id = tareaData.encargado_id;
    if (tareaData.frecuencia !== undefined) updateData.frecuencia = tareaData.frecuencia;
    if (tareaData.ultima_fecha !== undefined) updateData.ultima_fecha = tareaData.ultima_fecha;
    if (tareaData.proxima_fecha !== undefined) updateData.proxima_fecha = tareaData.proxima_fecha;
    if (tareaData.fecha_limite !== undefined) updateData.proxima_fecha = tareaData.fecha_limite;
    if (tareaData.estado !== undefined) updateData.estado = tareaData.estado;
    if (tareaData.notas !== undefined) updateData.notas = tareaData.notas;
    if (tareaData.descripcion !== undefined) updateData.notas = tareaData.descripcion;
    if (tareaData.activo !== undefined) updateData.activo = tareaData.activo;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('tareas_limpieza')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Limpieza task updated successfully', { taskId: id, changes: tareaData });
    return data;
  } catch (error) {
    logger.error('Error updating limpieza task', { id, tareaData, error: error.message });
    throw error;
  }
};

const deleteTareaLimpieza = async (id) => {
  try {
    const { data, error } = await supabase
      .from('tareas_limpieza')
      .delete()
      .eq('id', id)
      .select('id, area')
      .single();

    if (error) {
      throw error;
    }

    logger.info('Limpieza task deleted successfully', { taskId: data.id, area: data.area });
    return { message: 'Tarea de limpieza eliminada exitosamente' };
  } catch (error) {
    logger.error('Error deleting limpieza task', { id, error: error.message });
    throw error;
 }
};

// Función para verificar tareas de limpieza vencidas
const checkTareasVencidas = async () => {
  try {
    const hoy = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    
    const { data, error } = await supabase
      .from('tareas_limpieza')
      .select('id, area, encargado_id, proxima_fecha, estado')
      .lt('proxima_fecha', hoy) // Fecha anterior a hoy
      .neq('estado', 'completada') // No completadas
      .eq('activo', true); // Activas

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      logger.warn('Tareas de limpieza vencidas detectadas', { count: data.length, tareas: data });
      return data;
    }

    return [];
  } catch (error) {
    logger.error('Error checking vencidas limpieza tasks', { error: error.message });
    throw error;
  }
};

module.exports = {
  getAllTareasLimpieza,
  getTareaLimpiezaById,
  createTareaLimpieza,
  updateTareaLimpieza,
  deleteTareaLimpieza,
  checkTareasVencidas
};