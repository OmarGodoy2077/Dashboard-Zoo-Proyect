const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');

class EmpleadoService {
  async getAllEmpleados(filters = {}) {
    try {
      logger.info('Getting all empleados', { filters });
      
      let query = supabase
        .from('empleados')
        .select('*, usuario:usuarios(email, rol)');
      
      // Aplicar filtros - solo si tienen valor real
      if (filters.puesto && filters.puesto.trim() !== '') {
        query = query.eq('puesto', filters.puesto);
      }

      if (filters.estado && filters.estado.trim() !== '') {
        query = query.eq('estado', filters.estado);
      }

      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      // Ordenamiento
      const sortBy = filters.sortBy || 'nombre';
      const sortOrder = filters.sortOrder === 'DESC' ? { ascending: false } : { ascending: true };
      query = query.order(sortBy, sortOrder);

      // Paginación
      if (filters.limit) {
        query = query.limit(parseInt(filters.limit));
        
        if (filters.offset) {
          query = query.range(parseInt(filters.offset), parseInt(filters.offset) + parseInt(filters.limit) - 1);
        }
      }

      const { data, error } = await query;
      
      if (error) {
        logger.error('Supabase error getting empleados', { error: error.message });
        throw error;
      }
      
      logger.info('Empleados fetched successfully', { count: data?.length || 0 });
      
      // Formatear datos para compatibilidad
      const formattedData = data?.map(e => ({
        ...e,
        usuario_email: e.usuario?.email || null,
        usuario_rol: e.usuario?.rol || null
      })) || [];
      
      return formattedData;
    } catch (error) {
      logger.error('Error getting empleados', { error: error.message });
      throw error;
    }
  }

  async getEmpleadoById(id) {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .select('*, usuario:usuarios(email, rol)')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      return {
        ...data,
        usuario_email: data.usuario?.email || null,
        usuario_rol: data.usuario?.rol || null
      };
    } catch (error) {
      logger.error('Error getting empleado by id', { id, error: error.message });
      throw error;
    }
  }

  async createEmpleado(empleadoData) {
    try {
      const {
        usuario_id, nombre, puesto, salario, fecha_contratacion,
        fecha_nacimiento, direccion, telefono, email,
        vacaciones_disponibles = 0, estado = 'activo'
      } = empleadoData;

      const { data, error } = await supabase
        .from('empleados')
        .insert([{
          usuario_id,
          nombre,
          puesto,
          salario,
          fecha_contratacion,
          fecha_nacimiento,
          direccion,
          telefono,
          email,
          vacaciones_disponibles,
          estado
        }])
        .select()
        .single();
      
      if (error) throw error;

      logger.info('Empleado created', { empleadoId: data.id, nombre });
      return data;
    } catch (error) {
      logger.error('Error creating empleado', { empleadoData, error: error.message });
      throw error;
    }
  }

  async updateEmpleado(id, empleadoData) {
    try {
      const {
        nombre, puesto, salario, direccion, telefono, email,
        vacaciones_disponibles, inasistencias, suspensiones, estado
      } = empleadoData;

      const updateData = {
        fecha_actualizacion: new Date().toISOString()
      };
      
      if (nombre !== undefined) updateData.nombre = nombre;
      if (puesto !== undefined) updateData.puesto = puesto;
      if (salario !== undefined) updateData.salario = salario;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (email !== undefined) updateData.email = email;
      if (vacaciones_disponibles !== undefined) updateData.vacaciones_disponibles = vacaciones_disponibles;
      if (inasistencias !== undefined) updateData.inasistencias = inasistencias;
      if (suspensiones !== undefined) updateData.suspensiones = suspensiones;
      if (estado !== undefined) updateData.estado = estado;

      const { data, error } = await supabase
        .from('empleados')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return null;

      logger.info('Empleado updated', { empleadoId: id });
      return data;
    } catch (error) {
      logger.error('Error updating empleado', { id, empleadoData, error: error.message });
      throw error;
    }
  }

  async deleteEmpleado(id) {
    try {
      const { data, error } = await supabase
        .from('empleados')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return null;

      logger.info('Empleado deleted', { empleadoId: id });
      return data;
    } catch (error) {
      logger.error('Error deleting empleado', { id, error: error.message });
      throw error;
    }
  }

  async getEstadisticasEmpleados() {
    try {
      const { data: empleados, error } = await supabase
        .from('empleados')
        .select('puesto, estado, salario');
      
      if (error) throw error;
      
      const total = empleados?.length || 0;
      
      // Agrupar por puesto
      const porPuesto = {};
      const porEstado = {};
      const salariosPorPuesto = {};
      
      empleados?.forEach(emp => {
        // Por puesto
        const puesto = emp.puesto || 'sin_puesto';
        porPuesto[puesto] = (porPuesto[puesto] || 0) + 1;
        
        // Por estado
        const estado = emp.estado || 'desconocido';
        porEstado[estado] = (porEstado[estado] || 0) + 1;
        
        // Salarios por puesto (solo activos)
        if (emp.estado === 'activo' && emp.salario) {
          if (!salariosPorPuesto[puesto]) {
            salariosPorPuesto[puesto] = [];
          }
          salariosPorPuesto[puesto].push(parseFloat(emp.salario));
        }
      });
      
      return {
        total,
        por_puesto: Object.keys(porPuesto).map(puesto => ({
          puesto,
          cantidad: porPuesto[puesto]
        })).sort((a, b) => b.cantidad - a.cantidad),
        por_estado: Object.keys(porEstado).map(estado => ({
          estado,
          cantidad: porEstado[estado]
        })),
        salarios: Object.keys(salariosPorPuesto).map(puesto => {
          const salarios = salariosPorPuesto[puesto];
          return {
            puesto,
            salario_promedio: salarios.reduce((a, b) => a + b, 0) / salarios.length,
            salario_minimo: Math.min(...salarios),
            salario_maximo: Math.max(...salarios)
          };
        })
      };
    } catch (error) {
      logger.error('Error getting estadísticas empleados', { error: error.message });
      throw error;
    }
  }
}

module.exports = new EmpleadoService();