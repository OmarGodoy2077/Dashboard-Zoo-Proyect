const { supabase } = require('../config/database');
const { logger } = require('../middleware/logger');

class AlimentoService {
  async getAllAlimentos(filters = {}) {
    try {
      let query = supabase
        .from('alimentos')
        .select('*, proveedor:proveedores(nombre)');
      
      // Filtros opcionales
      if (filters.tipo) {
        query = query.ilike('tipo', `%${filters.tipo}%`);
      }

      // Nota: filtro de stock_bajo se aplicará después de obtener los datos
      // porque Supabase no soporta comparación entre columnas

      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`);
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
      
      if (error) throw error;
      
      // Aplicar filtro de stock bajo si se solicitó
      let resultados = data || [];
      if (filters.stock_bajo) {
        resultados = resultados.filter(a => a.stock_actual <= a.stock_minimo);
      }
      
      // Formatear datos para compatibilidad
      return resultados.map(a => ({
        ...a,
        proveedor_nombre: a.proveedor?.nombre || null
      }));
    } catch (error) {
      logger.error('Error getting alimentos', { error: error.message });
      throw error;
    }
  }

  async getAlimentoById(id) {
    try {
      const { data, error } = await supabase
        .from('alimentos')
        .select('*, proveedor:proveedores(nombre, contacto)')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      return {
        ...data,
        proveedor_nombre: data.proveedor?.nombre || null,
        proveedor_contacto: data.proveedor?.contacto || null
      };
    } catch (error) {
      logger.error('Error getting alimento by id', { id, error: error.message });
      throw error;
    }
  }

  async createAlimento(alimentoData) {
    try {
      const {
        nombre, tipo, descripcion, unidad_medida,
        stock_actual = 0, stock_minimo = 0,
        proveedor_id, precio_unitario
      } = alimentoData;

      const { data, error } = await supabase
        .from('alimentos')
        .insert([{
          nombre,
          tipo,
          descripcion,
          unidad_medida,
          stock_actual,
          stock_minimo,
          proveedor_id,
          precio_unitario
        }])
        .select()
        .single();
      
      if (error) throw error;

      logger.info('Alimento created', { alimentoId: data.id, nombre });
      return data;
    } catch (error) {
      logger.error('Error creating alimento', { alimentoData, error: error.message });
      throw error;
    }
  }

  async updateAlimento(id, alimentoData) {
    try {
      const {
        nombre, tipo, descripcion, unidad_medida,
        stock_actual, stock_minimo, proveedor_id, precio_unitario
      } = alimentoData;

      const updateData = {
        fecha_actualizacion: new Date().toISOString()
      };
      
      if (nombre !== undefined) updateData.nombre = nombre;
      if (tipo !== undefined) updateData.tipo = tipo;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (unidad_medida !== undefined) updateData.unidad_medida = unidad_medida;
      if (stock_actual !== undefined) updateData.stock_actual = stock_actual;
      if (stock_minimo !== undefined) updateData.stock_minimo = stock_minimo;
      if (proveedor_id !== undefined) updateData.proveedor_id = proveedor_id;
      if (precio_unitario !== undefined) updateData.precio_unitario = precio_unitario;

      const { data, error } = await supabase
        .from('alimentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return null;

      logger.info('Alimento updated', { alimentoId: id });
      return data;
    } catch (error) {
      logger.error('Error updating alimento', { id, alimentoData, error: error.message });
      throw error;
    }
  }

  async deleteAlimento(id) {
    try {
      // Verificar si hay horarios de alimentación asociados
      const { data: horarios, error: horariosError } = await supabase
        .from('horarios_alimentacion')
        .select('id')
        .eq('alimento_id', id)
        .limit(1);
      
      if (horariosError) throw horariosError;

      if (horarios && horarios.length > 0) {
        throw new Error('No se puede eliminar el alimento porque tiene horarios de alimentación asociados');
      }

      const { data, error } = await supabase
        .from('alimentos')
        .delete()
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      if (!data) return null;

      logger.info('Alimento deleted', { alimentoId: id });
      return data;
    } catch (error) {
      logger.error('Error deleting alimento', { id, error: error.message });
      throw error;
    }
  }

  async updateStock(id, cantidad, tipo = 'entrada') {
    try {
      // Obtener stock actual
      const { data: alimento, error: getError } = await supabase
        .from('alimentos')
        .select('stock_actual')
        .eq('id', id)
        .single();
      
      if (getError) throw getError;
      if (!alimento) throw new Error('Alimento no encontrado');
      
      const cantidadAbs = Math.abs(cantidad);
      let nuevoStock;
      
      if (tipo === 'entrada') {
        nuevoStock = alimento.stock_actual + cantidadAbs;
      } else {
        if (alimento.stock_actual < cantidadAbs) {
          throw new Error('Stock insuficiente');
        }
        nuevoStock = alimento.stock_actual - cantidadAbs;
      }
      
      const { data, error } = await supabase
        .from('alimentos')
        .update({
          stock_actual: nuevoStock,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      logger.info('Stock updated', { alimentoId: id, cantidad, tipo, nuevoStock });
      return data;
    } catch (error) {
      logger.error('Error updating stock', { id, cantidad, tipo, error: error.message });
      throw error;
    }
  }

  async getAlimentosBajoStock() {
    try {
      const { data: alimentos, error } = await supabase
        .from('alimentos')
        .select('*, proveedor:proveedores(nombre)')
        .order('stock_actual', { ascending: true });
      
      if (error) throw error;

      // Filtrar en JavaScript
      const bajoStock = alimentos
        ?.filter(a => a.stock_actual <= a.stock_minimo)
        .map(a => ({
          ...a,
          proveedor_nombre: a.proveedor?.nombre || null
        })) || [];
      
      return bajoStock;
    } catch (error) {
      logger.error('Error getting alimentos bajo stock', { error: error.message });
      throw error;
    }
  }

  async getEstadisticasAlimentos() {
    try {
      const { data: alimentos, error } = await supabase
        .from('alimentos')
        .select('tipo, stock_actual, stock_minimo');
      
      if (error) throw error;
      
      const total = alimentos?.length || 0;
      
      // Agrupar por tipo
      const porTipo = {};
      let bajoStock = 0;
      let stockNormal = 0;
      
      alimentos?.forEach(alimento => {
        const tipo = alimento.tipo || 'sin_tipo';
        porTipo[tipo] = (porTipo[tipo] || 0) + 1;
        
        if (alimento.stock_actual <= alimento.stock_minimo) {
          bajoStock++;
        } else {
          stockNormal++;
        }
      });

      return {
        total,
        por_tipo: Object.keys(porTipo).map(tipo => ({
          tipo,
          cantidad: porTipo[tipo]
        })).sort((a, b) => b.cantidad - a.cantidad),
        estado_stock: {
          bajo_stock: bajoStock,
          stock_normal: stockNormal
        }
      };
    } catch (error) {
      logger.error('Error getting estadísticas alimentos', { error: error.message });
      throw error;
    }
  }
}

module.exports = new AlimentoService();