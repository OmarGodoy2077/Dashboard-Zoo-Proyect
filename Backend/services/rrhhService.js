const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');
const { validateVacacionesData, validateInasistenciasData, validateDescuentosData, validateBonosData } = require('../utils/validation');

// Función helper para obtener fecha local en formato YYYY-MM-DD (zona horaria de Guatemala GMT-6)
const getLocalDate = () => {
  const now = new Date();
  // Ajustar a zona horaria de Guatemala (UTC-6)
  const guatemalaOffset = -6 * 60; // -6 horas en minutos
  const localTime = new Date(now.getTime() + (guatemalaOffset - now.getTimezoneOffset()) * 60000);

  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Función helper para verificar solapamiento de vacaciones
const verificarSolapamientoVacaciones = async (empleadoId, fechaInicio, fechaFin, excludeId = null) => {
  try {
    let query = supabase
      .from('vacaciones')
      .select('id, fecha_inicio, fecha_fin')
      .eq('empleado_id', empleadoId)
      .in('estado', ['aprobada', 'solicitada']);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data: vacacionesExistentes, error } = await query;

    if (error) {
      throw error;
    }

    // Comparar fechas como strings YYYY-MM-DD para evitar problemas de zona horaria
    const nuevaInicio = fechaInicio;
    const nuevaFin = fechaFin;

    // Verificar solapamiento con vacaciones existentes
    for (const vacacion of vacacionesExistentes) {
      const existenteInicio = vacacion.fecha_inicio;
      const existenteFin = vacacion.fecha_fin;

      // Verificar si hay solapamiento comparando strings
      if (nuevaInicio <= existenteFin && nuevaFin >= existenteInicio) {
        return true; // Hay solapamiento
      }
    }

    return false; // No hay solapamiento
  } catch (error) {
    logger.error('Error verificando solapamiento de vacaciones', { empleadoId, fechaInicio, fechaFin, error: error.message });
    throw error;
  }
};

// Servicios para vacaciones
const getAllVacaciones = async (filters = {}) => {
  try {
    let query = supabase
      .from('vacaciones')
      .select('*')
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.empleado_id) {
      query = query.eq('empleado_id', filters.empleado_id);
    }
    if (filters.estado) {
      query = query.eq('estado', filters.estado);
    }
    if (filters.fecha_inicio && filters.fecha_fin) {
      query = query.gte('fecha_inicio', filters.fecha_inicio).lte('fecha_fin', filters.fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Obtener los nombres de los empleados por separado para evitar ambigüedad
    const transformedData = await Promise.all(data.map(async (vacacion) => {
      let empleadoNombre = null;
      let aprobadorNombre = null;
      
      // Obtener nombre del empleado solicitante
      if (vacacion.empleado_id) {
        const { data: empleadoData, error: empleadoError } = await supabase
          .from('empleados')
          .select('nombre')
          .eq('id', vacacion.empleado_id)
          .single();
          
        if (!empleadoError && empleadoData) {
          empleadoNombre = empleadoData.nombre;
        }
      }
      
      // Obtener nombre del empleado que aprobó
      if (vacacion.aprobado_por) {
        const { data: aprobadorData, error: aprobadorError } = await supabase
          .from('empleados')
          .select('nombre')
          .eq('id', vacacion.aprobado_por)
          .single();
          
        if (!aprobadorError && aprobadorData) {
          aprobadorNombre = aprobadorData.nombre;
        }
      }
      
      return {
        ...vacacion,
        empleado: empleadoNombre,
        aprobado_por_nombre: aprobadorNombre
      };
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error getting all vacaciones', { filters, error: error.message });
    throw error;
  }
};

const getVacacionById = async (id) => {
  try {
    const { data: vacacion, error } = await supabase
      .from('vacaciones')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    let empleadoNombre = null;
    let aprobadorNombre = null;
    
    // Obtener nombre del empleado solicitante
    if (vacacion.empleado_id) {
      const { data: empleadoData, error: empleadoError } = await supabase
        .from('empleados')
        .select('nombre')
        .eq('id', vacacion.empleado_id)
        .single();
        
      if (!empleadoError && empleadoData) {
        empleadoNombre = empleadoData.nombre;
      }
    }
    
    // Obtener nombre del empleado que aprobó
    if (vacacion.aprobado_por) {
      const { data: aprobadorData, error: aprobadorError } = await supabase
        .from('empleados')
        .select('nombre')
        .eq('id', vacacion.aprobado_por)
        .single();
        
      if (!aprobadorError && aprobadorData) {
        aprobadorNombre = aprobadorData.nombre;
      }
    }
    
    const data = {
      ...vacacion,
      empleado: empleadoNombre,
      aprobado_por_nombre: aprobadorNombre
    };

    if (error) {
      throw error;
    }

    return {
      ...data,
      empleado: data.solicitante ? data.solicitante.nombre : null,
      aprobado_por_nombre: data.aprobador ? data.aprobador.nombre : null
    };
  } catch (error) {
    logger.error('Error getting vacacion by id', { id, error: error.message });
    throw error;
  }
};

const createVacacion = async (vacacionData) => {
  try {
    // Validar datos de entrada
    const validatedData = validateVacacionesData(vacacionData);

    // Verificar solapamiento de vacaciones para el mismo empleado
    if (validatedData.estado === 'aprobada' || validatedData.estado === 'solicitada') {
      const solapamiento = await verificarSolapamientoVacaciones(
        validatedData.empleado_id,
        validatedData.fecha_inicio,
        validatedData.fecha_fin
      );

      if (solapamiento) {
        throw new Error('El empleado ya tiene vacaciones programadas en este período');
      }
    }

    const { data, error } = await supabase
      .from('vacaciones')
      .insert([{
        empleado_id: validatedData.empleado_id,
        fecha_inicio: validatedData.fecha_inicio,
        fecha_fin: validatedData.fecha_fin,
        estado: validatedData.estado || 'solicitada',
        comentarios: validatedData.comentarios,
        aprobado_por: validatedData.aprobado_por
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Si se crea una vacación ya aprobada y estamos en el período, actualizar estado del empleado
    if (validatedData.estado === 'aprobada') {
      const hoy = new Date();
      const fechaInicio = new Date(validatedData.fecha_inicio);
      const fechaFin = new Date(validatedData.fecha_fin);

      if (hoy >= fechaInicio && hoy <= fechaFin) {
        await supabase
          .from('empleados')
          .update({ estado: 'vacaciones', fecha_actualizacion: new Date().toISOString() })
          .eq('id', validatedData.empleado_id);
        logger.info('Empleado actualizado inmediatamente a estado "vacaciones" al crear vacación aprobada', {
          empleadoId: validatedData.empleado_id,
          vacacionId: data.id
        });
      }
    }

    // Si se creó aprobada, actualizar estados de todos los empleados para asegurar consistencia
    if (validatedData.estado === 'aprobada') {
      await actualizarEstadoEmpleadosVacaciones();
    }

    logger.info('Vacación creada exitosamente', { vacacionId: data.id, empleadoId: data.empleado_id });
    return data;
  } catch (error) {
    logger.error('Error creating vacacion', { vacacionData, error: error.message });
    throw error;
  }
};

const updateVacacion = async (id, vacacionData) => {
 try {
    // Validar datos de entrada
    const validatedData = validateVacacionesData(vacacionData, true);

    // Obtener la vacación actual antes de actualizar
    const { data: vacacionActual, error: getError } = await supabase
      .from('vacaciones')
      .select('estado, empleado_id, fecha_inicio, fecha_fin')
      .eq('id', id)
      .single();

    if (getError) {
      throw getError;
    }

    // Verificar solapamiento si se están cambiando las fechas y el estado es aprobado o solicitado
    if ((validatedData.fecha_inicio !== undefined || validatedData.fecha_fin !== undefined) &&
        (vacacionActual.estado === 'aprobada' || vacacionActual.estado === 'solicitada' ||
         validatedData.estado === 'aprobada' || validatedData.estado === 'solicitada')) {

      const nuevaFechaInicio = validatedData.fecha_inicio || vacacionActual.fecha_inicio;
      const nuevaFechaFin = validatedData.fecha_fin || vacacionActual.fecha_fin;

      const solapamiento = await verificarSolapamientoVacaciones(
        vacacionActual.empleado_id,
        nuevaFechaInicio,
        nuevaFechaFin,
        id // Excluir la vacación actual de la verificación
      );

      if (solapamiento) {
        throw new Error('El empleado ya tiene vacaciones programadas en este período');
      }
    }

    const updateData = {};
    if (validatedData.fecha_inicio !== undefined) updateData.fecha_inicio = validatedData.fecha_inicio;
    if (validatedData.fecha_fin !== undefined) updateData.fecha_fin = validatedData.fecha_fin;
    if (validatedData.estado !== undefined) updateData.estado = validatedData.estado;
    if (validatedData.comentarios !== undefined) updateData.comentarios = validatedData.comentarios;
    if (validatedData.aprobado_por !== undefined) updateData.aprobado_por = validatedData.aprobado_por;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vacaciones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Lógica para actualizar el estado del empleado basado en el estado de la vacación
    const nuevoEstado = validatedData.estado !== undefined ? validatedData.estado : vacacionActual.estado;
    const empleadoId = vacacionActual.empleado_id;

    if (nuevoEstado === 'aprobada' && vacacionActual.estado !== 'aprobada') {
      // Si se aprueba la vacación, verificar si estamos en el período de vacaciones
      const hoy = getLocalDate(); // Usar fecha local
      const fechaInicio = data.fecha_inicio;
      const fechaFin = data.fecha_fin;

      if (hoy >= fechaInicio && hoy <= fechaFin) {
        // Estamos en período de vacaciones, cambiar estado del empleado
        const { error: updateEmpleadoError } = await supabase
          .from('empleados')
          .update({ estado: 'vacaciones', fecha_actualizacion: new Date().toISOString() })
          .eq('id', empleadoId);

        if (updateEmpleadoError) {
          logger.error('Error actualizando empleado a vacaciones', {
            empleadoId,
            vacacionId: id,
            error: updateEmpleadoError.message
          });
        } else {
          logger.info('Empleado actualizado inmediatamente a estado "vacaciones"', { empleadoId, vacacionId: id });
        }
      }
    } else if ((nuevoEstado === 'cancelada' || nuevoEstado === 'rechazada') && vacacionActual.estado === 'aprobada') {
      // Si se cancela o rechaza una vacación aprobada, restaurar estado del empleado a activo
      const { error: updateEmpleadoError } = await supabase
        .from('empleados')
        .update({ estado: 'activo', fecha_actualizacion: new Date().toISOString() })
        .eq('id', empleadoId);

      if (updateEmpleadoError) {
        logger.error('Error restaurando empleado a activo', {
          empleadoId,
          vacacionId: id,
          error: updateEmpleadoError.message
        });
      } else {
        logger.info('Empleado restaurado inmediatamente a estado "activo"', { empleadoId, vacacionId: id });
      }
    }

    // Si se cambió a aprobada, actualizar estados de todos los empleados
    if (nuevoEstado === 'aprobada' && vacacionActual.estado !== 'aprobada') {
      await actualizarEstadoEmpleadosVacaciones();
    }

    logger.info('Vacación actualizada exitosamente', { vacacionId: id, changes: vacacionData });
    return data;
 } catch (error) {
    logger.error('Error updating vacacion', { id, vacacionData, error: error.message });
    throw error;
  }
};

const deleteVacacion = async (id) => {
  try {
    const { data, error } = await supabase
      .from('vacaciones')
      .delete()
      .eq('id', id)
      .select('id, empleado_id')
      .single();

    if (error) {
      throw error;
    }

    logger.info('Vacación eliminada exitosamente', { vacacionId: data.id, empleadoId: data.empleado_id });
    return { message: 'Vacación eliminada exitosamente' };
  } catch (error) {
    logger.error('Error deleting vacacion', { id, error: error.message });
    throw error;
 }
};

// Servicios para inasistencias
const getAllInasistencias = async (filters = {}) => {
 try {
    let query = supabase
      .from('inasistencias')
      .select(`
        *,
        empleado:empleados!inasistencias_empleado_id_fkey(nombre)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.empleado_id) {
      query = query.eq('empleado_id', filters.empleado_id);
    }
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters.fecha) {
      query = query.eq('fecha', filters.fecha);
    }
    if (filters.fecha_inicio && filters.fecha_fin) {
      query = query.gte('fecha', filters.fecha_inicio).lte('fecha', filters.fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transformar los datos para que el empleado aparezca solo con el nombre
    const transformedData = data.map(inasistencia => ({
      ...inasistencia,
      empleado: inasistencia.empleado ? inasistencia.empleado.nombre : null
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error getting all inasistencias', { filters, error: error.message });
    throw error;
  }
};

const getInasistenciaById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('inasistencias')
      .select(`
        *,
        empleado:empleados!inasistencias_empleado_id_fkey(nombre)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      empleado: data.empleado ? data.empleado.nombre : null
    };
  } catch (error) {
    logger.error('Error getting inasistencia by id', { id, error: error.message });
    throw error;
  }
};

const createInasistencia = async (inasistenciaData) => {
  try {
    // Validar datos de entrada
    const validatedData = validateInasistenciasData(inasistenciaData);

    const { data, error } = await supabase
      .from('inasistencias')
      .insert([{
        empleado_id: validatedData.empleado_id,
        fecha: validatedData.fecha,
        tipo: validatedData.tipo,
        motivo: validatedData.motivo,
        evidencia_url: validatedData.evidencia_url
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Inasistencia creada exitosamente', { inasistenciaId: data.id, empleadoId: data.empleado_id });
    return data;
  } catch (error) {
    logger.error('Error creating inasistencia', { inasistenciaData, error: error.message });
    throw error;
  }
};

const updateInasistencia = async (id, inasistenciaData) => {
 try {
    // Validar datos de entrada
    const validatedData = validateInasistenciasData(inasistenciaData, true);

    const updateData = {};
    if (validatedData.fecha !== undefined) updateData.fecha = validatedData.fecha;
    if (validatedData.tipo !== undefined) updateData.tipo = validatedData.tipo;
    if (validatedData.motivo !== undefined) updateData.motivo = validatedData.motivo;
    if (validatedData.evidencia_url !== undefined) updateData.evidencia_url = validatedData.evidencia_url;
    updateData.created_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('inasistencias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Inasistencia actualizada exitosamente', { inasistenciaId: id, changes: inasistenciaData });
    return data;
 } catch (error) {
    logger.error('Error updating inasistencia', { id, inasistenciaData, error: error.message });
    throw error;
 }
};

const deleteInasistencia = async (id) => {
  try {
    const { data, error } = await supabase
      .from('inasistencias')
      .delete()
      .eq('id', id)
      .select('id, empleado_id')
      .single();

    if (error) {
      throw error;
    }

    logger.info('Inasistencia eliminada exitosamente', { inasistenciaId: data.id, empleadoId: data.empleado_id });
    return { message: 'Inasistencia eliminada exitosamente' };
  } catch (error) {
    logger.error('Error deleting inasistencia', { id, error: error.message });
    throw error;
  }
};

// Servicios para descuentos
const getAllDescuentos = async (filters = {}) => {
  try {
    let query = supabase
      .from('descuentos')
      .select(`
        *,
        empleado:empleados!descuentos_empleado_id_fkey(nombre)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.empleado_id) {
      query = query.eq('empleado_id', filters.empleado_id);
    }
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters.fecha_inicio && filters.fecha_fin) {
      query = query.gte('fecha_aplicacion', filters.fecha_inicio).lte('fecha_aplicacion', filters.fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transformar los datos para que el empleado aparezca solo con el nombre
    const transformedData = data.map(descuento => ({
      ...descuento,
      empleado: descuento.empleado ? descuento.empleado.nombre : null
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error getting all descuentos', { filters, error: error.message });
    throw error;
  }
};

const getDescuentoById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('descuentos')
      .select(`
        *,
        empleado:empleados!descuentos_empleado_id_fkey(nombre)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      empleado: data.empleado ? data.empleado.nombre : null
    };
  } catch (error) {
    logger.error('Error getting descuento by id', { id, error: error.message });
    throw error;
  }
};

const createDescuento = async (descuentoData) => {
  try {
    // Validar datos de entrada
    const validatedData = validateDescuentosData(descuentoData);

    const { data, error } = await supabase
      .from('descuentos')
      .insert([{
        empleado_id: validatedData.empleado_id,
        concepto: validatedData.concepto,
        monto: validatedData.monto,
        fecha_aplicacion: validatedData.fecha_aplicacion,
        tipo: validatedData.tipo
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Descuento creado exitosamente', { descuentoId: data.id, empleadoId: data.empleado_id });
    return data;
  } catch (error) {
    logger.error('Error creating descuento', { descuentoData, error: error.message });
    throw error;
  }
};

const updateDescuento = async (id, descuentoData) => {
  try {
    // Validar datos de entrada
    const validatedData = validateDescuentosData(descuentoData, true);

    const updateData = {};
    if (validatedData.concepto !== undefined) updateData.concepto = validatedData.concepto;
    if (validatedData.monto !== undefined) updateData.monto = validatedData.monto;
    if (validatedData.fecha_aplicacion !== undefined) updateData.fecha_aplicacion = validatedData.fecha_aplicacion;
    if (validatedData.tipo !== undefined) updateData.tipo = validatedData.tipo;
    updateData.created_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('descuentos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Descuento actualizado exitosamente', { descuentoId: id, changes: descuentoData });
    return data;
  } catch (error) {
    logger.error('Error updating descuento', { id, descuentoData, error: error.message });
    throw error;
 }
};

const deleteDescuento = async (id) => {
  try {
    const { data, error } = await supabase
      .from('descuentos')
      .delete()
      .eq('id', id)
      .select('id, empleado_id')
      .single();

    if (error) {
      throw error;
    }

    logger.info('Descuento eliminado exitosamente', { descuentoId: data.id, empleadoId: data.empleado_id });
    return { message: 'Descuento eliminado exitosamente' };
 } catch (error) {
    logger.error('Error deleting descuento', { id, error: error.message });
    throw error;
  }
};

// Servicios para bonos
const getAllBonos = async (filters = {}) => {
  try {
    let query = supabase
      .from('bonos')
      .select(`
        *,
        empleado:empleados!bonos_empleado_id_fkey(nombre)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters.empleado_id) {
      query = query.eq('empleado_id', filters.empleado_id);
    }
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo);
    }
    if (filters.fecha_inicio && filters.fecha_fin) {
      query = query.gte('fecha_otorgamiento', filters.fecha_inicio).lte('fecha_otorgamiento', filters.fecha_fin);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transformar los datos para que el empleado aparezca solo con el nombre
    const transformedData = data.map(bono => ({
      ...bono,
      empleado: bono.empleado ? bono.empleado.nombre : null
    }));

    return transformedData;
  } catch (error) {
    logger.error('Error getting all bonos', { filters, error: error.message });
    throw error;
  }
};

const getBonoById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('bonos')
      .select(`
        *,
        empleado:empleados!bonos_empleado_id_fkey(nombre)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      empleado: data.empleado ? data.empleado.nombre : null
    };
  } catch (error) {
    logger.error('Error getting bono by id', { id, error: error.message });
    throw error;
  }
};

const createBono = async (bonoData) => {
  try {
    // Validar datos de entrada
    const validatedData = validateBonosData(bonoData);

    const { data, error } = await supabase
      .from('bonos')
      .insert([{
        empleado_id: validatedData.empleado_id,
        concepto: validatedData.concepto,
        monto: validatedData.monto,
        fecha_otorgamiento: validatedData.fecha_otorgamiento,
        tipo: validatedData.tipo
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Bono creado exitosamente', { bonoId: data.id, empleadoId: data.empleado_id });
    return data;
  } catch (error) {
    logger.error('Error creating bono', { bonoData, error: error.message });
    throw error;
  }
};

const updateBono = async (id, bonoData) => {
  try {
    // Validar datos de entrada
    const validatedData = validateBonosData(bonoData, true);

    const updateData = {};
    if (validatedData.concepto !== undefined) updateData.concepto = validatedData.concepto;
    if (validatedData.monto !== undefined) updateData.monto = validatedData.monto;
    if (validatedData.fecha_otorgamiento !== undefined) updateData.fecha_otorgamiento = validatedData.fecha_otorgamiento;
    if (validatedData.tipo !== undefined) updateData.tipo = validatedData.tipo;
    updateData.created_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('bonos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Bono actualizado exitosamente', { bonoId: id, changes: bonoData });
    return data;
  } catch (error) {
    logger.error('Error updating bono', { id, bonoData, error: error.message });
    throw error;
 }
};

const deleteBono = async (id) => {
  try {
    const { data, error } = await supabase
      .from('bonos')
      .delete()
      .eq('id', id)
      .select('id, empleado_id')
      .single();

    if (error) {
      throw error;
    }

    logger.info('Bono eliminado exitosamente', { bonoId: data.id, empleadoId: data.empleado_id });
    return { message: 'Bono eliminado exitosamente' };
 } catch (error) {
    logger.error('Error deleting bono', { id, error: error.message });
    throw error;
  }
};

// Servicio para generar planilla mensual
const getPlanillaMensual = async (mes, anio, filters = {}) => {
  try {
    // Obtener empleados activos
    const { data: empleados, error: empleadosError } = await supabase
      .from('empleados')
      .select('id, nombre, puesto, salario')
      .eq('estado', 'activo');

    if (empleadosError) {
      throw empleadosError;
    }

    // Para cada empleado, calcular bonos, descuentos y total
    const planilla = await Promise.all(empleados.map(async (empleado) => {
      // Obtener bonos del mes/año
      const { data: bonos, error: bonosError } = await supabase
        .from('bonos')
        .select('monto')
        .eq('empleado_id', empleado.id)
        .gte('fecha_otorgamiento', `${anio}-${mes.toString().padStart(2, '0')}-01`)
        .lt('fecha_otorgamiento', `${anio}-${(parseInt(mes) + 1).toString().padStart(2, '0')}-01`);

      if (bonosError) throw bonosError;

      // Obtener descuentos del mes/año
      const { data: descuentos, error: descuentosError } = await supabase
        .from('descuentos')
        .select('monto')
        .eq('empleado_id', empleado.id)
        .gte('fecha_aplicacion', `${anio}-${mes.toString().padStart(2, '0')}-01`)
        .lt('fecha_aplicacion', `${anio}-${(parseInt(mes) + 1).toString().padStart(2, '0')}-01`);

      if (descuentosError) throw descuentosError;

      const bonosTotales = bonos.reduce((sum, bono) => sum + parseFloat(bono.monto || 0), 0);
      const descuentosTotales = descuentos.reduce((sum, descuento) => sum + parseFloat(descuento.monto || 0), 0);
      const totalAPagar = parseFloat(empleado.salario) + bonosTotales - descuentosTotales;

      // Obtener estado de pago de nómina si existe
      const { data: nomina, error: nominaError } = await supabase
        .from('nominas')
        .select('estado_pago')
        .eq('empleado_id', empleado.id)
        .eq('periodo_mes', mes)
        .eq('periodo_anio', anio)
        .single();

      return {
        empleado_id: empleado.id,
        nombre: empleado.nombre,
        puesto: empleado.puesto,
        salario_base: parseFloat(empleado.salario),
        bonos_totales: bonosTotales,
        descuentos_totales: descuentosTotales,
        total_a_pagar: totalAPagar,
        estado_pago: nomina ? nomina.estado_pago : 'pendiente',
        bonos_detalle: bonos,
        descuentos_detalle: descuentos
      };
    }));

    return planilla;
  } catch (error) {
    logger.error('Error getting planilla mensual', { mes, anio, filters, error: error.message });
    throw error;
  }
};

// Servicio para actualizar automáticamente el estado de empleados basado en vacaciones activas
const actualizarEstadoEmpleadosVacaciones = async () => {
  try {
    logger.info('Iniciando actualización automática de estado de empleados por vacaciones');

    const hoy = getLocalDate(); // Usar fecha local
    const hoyString = hoy; // Ya está en formato YYYY-MM-DD

    // Obtener todas las vacaciones aprobadas
    const { data: vacacionesAprobadas, error: vacacionesError } = await supabase
      .from('vacaciones')
      .select('id, empleado_id, fecha_inicio, fecha_fin')
      .eq('estado', 'aprobada');

    if (vacacionesError) {
      throw vacacionesError;
    }

    logger.info(`Encontradas ${vacacionesAprobadas.length} vacaciones aprobadas`);

    // Procesar cada vacación
    for (const vacacion of vacacionesAprobadas) {
      // Verificar si hoy está dentro del período de vacaciones usando comparación de strings
      const estaEnVacaciones = hoyString >= vacacion.fecha_inicio && hoyString <= vacacion.fecha_fin;

      if (estaEnVacaciones) {
        // El empleado debería estar en estado "vacaciones"
        const { error: updateError } = await supabase
          .from('empleados')
          .update({ estado: 'vacaciones', fecha_actualizacion: new Date().toISOString() })
          .eq('id', vacacion.empleado_id);

        if (updateError) {
          logger.error('Error actualizando empleado a vacaciones', {
            empleadoId: vacacion.empleado_id,
            vacacionId: vacacion.id,
            error: updateError.message
          });
        } else {
          logger.info('Empleado actualizado a estado "vacaciones"', {
            empleadoId: vacacion.empleado_id,
            vacacionId: vacacion.id
          });
        }
      } else if (hoyString < vacacion.fecha_inicio) {
        // Las vacaciones aún no han comenzado - no hacer nada
        logger.info('Vacaciones aún no iniciadas', {
          empleadoId: vacacion.empleado_id,
          vacacionId: vacacion.id,
          fechaInicio: vacacion.fecha_inicio
        });
      } else {
        // El período de vacaciones terminó, restaurar a "activo"
        const { error: updateError } = await supabase
          .from('empleados')
          .update({ estado: 'activo', fecha_actualizacion: new Date().toISOString() })
          .eq('id', vacacion.empleado_id);

        if (updateError) {
          logger.error('Error restaurando empleado a activo', {
            empleadoId: vacacion.empleado_id,
            vacacionId: vacacion.id,
            error: updateError.message
          });
        } else {
          logger.info('Empleado restaurado a estado "activo"', {
            empleadoId: vacacion.empleado_id,
            vacacionId: vacacion.id
          });
        }
      }
    }

    logger.info('Actualización automática de estado de empleados completada');
    return { success: true, procesadas: vacacionesAprobadas.length };

  } catch (error) {
    logger.error('Error en actualizarEstadoEmpleadosVacaciones', { error: error.message });
    throw error;
  }
};

// Servicio para generar reporte de planilla en Excel
const generatePlanillaExcel = async (mes, anio) => {
  try {
    const planilla = await getPlanillaMensual(mes, anio);
    
    // Crear libro de trabajo
    const { utils, writeFile } = require('xlsx');
    const wb = utils.book_new();
    
    // Crear hoja de planilla
    const wsData = planilla.map(item => ({
      'Empleado ID': item.empleado_id,
      'Nombre': item.nombre,
      'Puesto': item.puesto,
      'Salario Base': item.salario_base,
      'Bonos Totales': item.bonos_totales,
      'Descuentos Totales': item.descuentos_totales,
      'Total a Pagar': item.total_a_pagar,
      'Estado de Pago': item.estado_pago
    }));
    
    const ws = utils.json_to_sheet(wsData);
    utils.book_append_sheet(wb, ws, 'Planilla Mensual');
    
    // Crear hoja de gráficos
    const chartData = [
      { 'Categoría': 'Bonos', 'Total': planilla.reduce((sum, item) => sum + item.bonos_totales, 0) },
      { 'Categoría': 'Descuentos', 'Total': planilla.reduce((sum, item) => sum + item.descuentos_totales, 0) }
    ];
    
    const wsChart = utils.json_to_sheet(chartData);
    utils.book_append_sheet(wb, wsChart, 'Gráficos');
    
    // Generar buffer
    const buffer = writeFile(wb, 'planilla.xlsx', { bookType: 'xlsx', type: 'buffer' });
    
    return buffer;
  } catch (error) {
    logger.error('Error generating planilla Excel', { mes, anio, error: error.message });
    throw error;
  }
};

module.exports = {
  // Servicios para vacaciones
 getAllVacaciones,
  getVacacionById,
  createVacacion,
  updateVacacion,
  deleteVacacion,
  
  // Servicios para inasistencias
  getAllInasistencias,
  getInasistenciaById,
  createInasistencia,
  updateInasistencia,
  deleteInasistencia,
  
 // Servicios para descuentos
 getAllDescuentos,
  getDescuentoById,
  createDescuento,
  updateDescuento,
  deleteDescuento,
  
  // Servicios para bonos
  getAllBonos,
  getBonoById,
  createBono,
  updateBono,
  deleteBono,
  
  // Servicios para planilla
  getPlanillaMensual,
  generatePlanillaExcel,
  
  // Servicio para actualizar estado de empleados por vacaciones
  actualizarEstadoEmpleadosVacaciones
};