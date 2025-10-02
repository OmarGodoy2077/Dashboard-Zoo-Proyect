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

// Servicio para entradas de visitantes al zoológico
const entradaService = {
  async getAllEntradas(filters = {}) {
    try {
      let query = supabase
        .from('entradas')
        .select('*')
        .order('fecha_venta', { ascending: false });

      // Aplicar filtros - solo si tienen valor real
      if (filters.tipo_ticket && filters.tipo_ticket.trim() !== '') {
        query = query.eq('tipo_ticket', filters.tipo_ticket);
      }
      if (filters.metodo_pago && filters.metodo_pago.trim() !== '') {
        query = query.eq('metodo_pago', filters.metodo_pago);
      }
      if (filters.fecha_inicio && filters.fecha_inicio.trim() !== '' && 
          filters.fecha_fin && filters.fecha_fin.trim() !== '') {
        query = query.gte('fecha_venta', filters.fecha_inicio).lte('fecha_venta', filters.fecha_fin);
      }
      if (filters.fecha_venta && filters.fecha_venta.trim() !== '') {
        query = query.eq('fecha_venta', filters.fecha_venta);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error obteniendo entradas desde Supabase', { error: error.message });
        throw error;
      }

      logger.info('Entradas obtenidas exitosamente', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Error en getAllEntradas', { error: error.message });
      throw error;
    }
  },

  async createEntrada(data) {
    try {
      // Validar datos requeridos
      if (!data.tipo_ticket || !data.precio_unitario || !data.cantidad) {
        throw new Error('tipo_ticket, precio_unitario y cantidad son requeridos');
      }

      // Convertir y validar valores numéricos
      const precioUnitario = parseFloat(data.precio_unitario);
      const cantidad = parseInt(data.cantidad);
      
      if (isNaN(precioUnitario) || precioUnitario < 0) {
        throw new Error('precio_unitario debe ser un número válido mayor o igual a 0');
      }
      
      if (isNaN(cantidad) || cantidad <= 0) {
        throw new Error('cantidad debe ser un número entero mayor a 0');
      }

      // Calcular el total automáticamente si no viene o calcular basado en precio y cantidad
      let total_venta;
      if (data.total_venta !== undefined && data.total_venta !== null) {
        total_venta = parseFloat(data.total_venta);
        if (isNaN(total_venta) || total_venta < 0) {
          throw new Error('total_venta debe ser un número válido mayor o igual a 0');
        }
      } else {
        total_venta = precioUnitario * cantidad;
      }
      
      const entradaData = {
        tipo_ticket: data.tipo_ticket,
        precio_unitario: precioUnitario,
        cantidad: cantidad,
        total_venta: total_venta,
        fecha_venta: data.fecha_venta || getLocalDate(),
        metodo_pago: data.metodo_pago || 'efectivo'
      };

      logger.info('Creando entrada con datos', { entradaData });

      const { data: nuevaEntrada, error } = await supabase
        .from('entradas')
        .insert([entradaData])
        .select()
        .single();

      if (error) {
        logger.error('Error creando entrada en Supabase', { error: error.message });
        throw error;
      }

      logger.info('Entrada creada exitosamente', { id: nuevaEntrada.id });
      return nuevaEntrada;
    } catch (error) {
      logger.error('Error en createEntrada', { error: error.message, data });
      throw error;
    }
  },

  async getEntradaById(id) {
    try {
      const { data, error } = await supabase
        .from('entradas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Entrada no encontrada', { id });
          return null;
        }
        logger.error('Error obteniendo entrada por ID desde Supabase', { error: error.message, id });
        throw error;
      }

      logger.info('Entrada obtenida por ID', { id });
      return data;
    } catch (error) {
      logger.error('Error en getEntradaById', { error: error.message, id });
      throw error;
    }
  },

  async updateEntrada(id, data) {
    try {
      const updateData = {};
      
      // Validar y convertir valores numéricos si están presentes
      if (data.precio_unitario !== undefined) {
        const precioUnitario = parseFloat(data.precio_unitario);
        if (isNaN(precioUnitario) || precioUnitario < 0) {
          throw new Error('precio_unitario debe ser un número válido mayor o igual a 0');
        }
        updateData.precio_unitario = precioUnitario;
      }
      
      if (data.cantidad !== undefined) {
        const cantidad = parseInt(data.cantidad);
        if (isNaN(cantidad) || cantidad <= 0) {
          throw new Error('cantidad debe ser un número entero mayor a 0');
        }
        updateData.cantidad = cantidad;
      }
      
      if (data.tipo_ticket !== undefined) updateData.tipo_ticket = data.tipo_ticket;
      if (data.metodo_pago !== undefined) updateData.metodo_pago = data.metodo_pago;
      if (data.fecha_venta !== undefined) updateData.fecha_venta = data.fecha_venta;
      
      // Recalcular total si cambió precio o cantidad
      if (data.precio_unitario !== undefined || data.cantidad !== undefined) {
        const entrada = await this.getEntradaById(id);
        if (!entrada) {
          throw new Error('Entrada no encontrada');
        }
        const precio = data.precio_unitario !== undefined ? parseFloat(data.precio_unitario) : entrada.precio_unitario;
        const cantidad = data.cantidad !== undefined ? parseInt(data.cantidad) : entrada.cantidad;
        
        if (isNaN(precio) || precio < 0 || isNaN(cantidad) || cantidad <= 0) {
          throw new Error('Valores inválidos para recalcular total');
        }
        
        updateData.total_venta = precio * cantidad;
      } else if (data.total_venta !== undefined) {
        const totalVenta = parseFloat(data.total_venta);
        if (isNaN(totalVenta) || totalVenta < 0) {
          throw new Error('total_venta debe ser un número válido mayor o igual a 0');
        }
        updateData.total_venta = totalVenta;
      }

      logger.info('Actualizando entrada', { id, updateData });

      const { data: entradaActualizada, error } = await supabase
        .from('entradas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Entrada no encontrada para actualizar', { id });
          return null;
        }
        logger.error('Error actualizando entrada en Supabase', { error: error.message, id });
        throw error;
      }

      logger.info('Entrada actualizada exitosamente', { id });
      return entradaActualizada;
    } catch (error) {
      logger.error('Error en updateEntrada', { error: error.message, id, data });
      throw error;
    }
  },

  async deleteEntrada(id) {
    try {
      const { error } = await supabase
        .from('entradas')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Error eliminando entrada en Supabase', { error: error.message, id });
        throw error;
      }

      logger.info('Entrada eliminada exitosamente', { id });
      return true;
    } catch (error) {
      logger.error('Error en deleteEntrada', { error: error.message, id });
      throw error;
    }
  },

  // Obtener estadísticas de entradas
  async getEstadisticas(fechaInicio, fechaFin) {
    try {
      let query = supabase
        .from('entradas')
        .select('tipo_ticket, cantidad, total_venta, fecha_venta, metodo_pago');

      if (fechaInicio && fechaFin) {
        query = query.gte('fecha_venta', fechaInicio).lte('fecha_venta', fechaFin);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_visitantes: data.reduce((sum, e) => sum + (parseInt(e.cantidad) || 0), 0),
        total_ingresos: data.reduce((sum, e) => sum + (parseFloat(e.total_venta) || 0), 0),
        por_tipo_ticket: {},
        por_metodo_pago: {},
        por_fecha: {}
      };

      data.forEach(entrada => {
        const cantidad = parseInt(entrada.cantidad) || 0;
        const totalVenta = parseFloat(entrada.total_venta) || 0;

        // Por tipo de ticket
        if (!stats.por_tipo_ticket[entrada.tipo_ticket]) {
          stats.por_tipo_ticket[entrada.tipo_ticket] = { cantidad: 0, ingresos: 0 };
        }
        stats.por_tipo_ticket[entrada.tipo_ticket].cantidad += cantidad;
        stats.por_tipo_ticket[entrada.tipo_ticket].ingresos += totalVenta;

        // Por método de pago
        if (!stats.por_metodo_pago[entrada.metodo_pago]) {
          stats.por_metodo_pago[entrada.metodo_pago] = { cantidad: 0, ingresos: 0 };
        }
        stats.por_metodo_pago[entrada.metodo_pago].cantidad += cantidad;
        stats.por_metodo_pago[entrada.metodo_pago].ingresos += totalVenta;

        // Por fecha
        if (!stats.por_fecha[entrada.fecha_venta]) {
          stats.por_fecha[entrada.fecha_venta] = { cantidad: 0, ingresos: 0 };
        }
        stats.por_fecha[entrada.fecha_venta].cantidad += cantidad;
        stats.por_fecha[entrada.fecha_venta].ingresos += totalVenta;
      });

      return stats;
    } catch (error) {
      logger.error('Error obteniendo estadísticas', { error: error.message });
      throw error;
    }
  }
};

module.exports = entradaService;