const { query } = require('../config/database');
const { logger } = require('../middleware/logger');
const XLSX = require('xlsx');

class ReportService {
  
  // Reporte de animales por estado de salud
  async getAnimalHealthReport(filters = {}) {
    try {
      let queryText = `
        SELECT 
          a.id,
          a.nombre,
          a.especie,
          a.habitat,
          a.estado_salud,
          a.peso,
          a.altura,
          a.fecha_nacimiento,
          a.sexo,
          e.nombre as veterinario,
          COUNT(t.id) as tratamientos_activos
        FROM animales a
        LEFT JOIN empleados e ON a.veterinario_id = e.id
        LEFT JOIN tratamientos t ON a.id = t.animal_id AND t.estado = 'activo'
      `;

      const conditions = [];
      const values = [];
      let paramCount = 0;

      if (filters.estado_salud) {
        paramCount++;
        conditions.push(`a.estado_salud = $${paramCount}`);
        values.push(filters.estado_salud);
      }

      if (filters.especie) {
        paramCount++;
        conditions.push(`a.especie ILIKE $${paramCount}`);
        values.push(`%${filters.especie}%`);
      }

      if (conditions.length > 0) {
        queryText += ` WHERE ${conditions.join(' AND ')}`;
      }

      queryText += ` GROUP BY a.id, e.nombre ORDER BY a.nombre`;

      const result = await query(queryText, values);
      return result.rows;
    } catch (error) {
      logger.error('Error getting animal health report', { error: error.message });
      throw error;
    }
  }

  // Reporte de consumo de alimentos
  async getFoodConsumptionReport(fechaInicio, fechaFin) {
    try {
      const result = await query(`
        SELECT 
          a.nombre as alimento,
          a.tipo,
          a.unidad_medida,
          SUM(CASE WHEN mi.tipo_movimiento = 'salida' THEN mi.cantidad ELSE 0 END) as consumido,
          SUM(CASE WHEN mi.tipo_movimiento = 'entrada' THEN mi.cantidad ELSE 0 END) as ingresado,
          a.stock_actual,
          a.stock_minimo,
          ROUND(AVG(CASE WHEN mi.tipo_movimiento = 'salida' THEN mi.cantidad ELSE NULL END), 2) as promedio_diario
        FROM alimentos a
        LEFT JOIN movimientos_inventario mi ON a.id = mi.producto_id
        WHERE mi.fecha_movimiento BETWEEN $1 AND $2
        GROUP BY a.id, a.nombre, a.tipo, a.unidad_medida, a.stock_actual, a.stock_minimo
        ORDER BY consumido DESC
      `, [fechaInicio, fechaFin]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting food consumption report', { error: error.message });
      throw error;
    }
  }

  // Reporte financiero de entradas
  async getFinancialReport(fechaInicio, fechaFin) {
    try {
      const [dailyResult, monthlyResult, ticketTypeResult] = await Promise.all([
        query(`
          SELECT 
            fecha_venta,
            COUNT(*) as total_entradas,
            SUM(total_venta) as ingresos_dia,
            AVG(precio_unitario) as precio_promedio
          FROM entradas
          WHERE fecha_venta BETWEEN $1 AND $2
          GROUP BY fecha_venta
          ORDER BY fecha_venta
        `, [fechaInicio, fechaFin]),
        
        query(`
          SELECT 
            DATE_TRUNC('month', fecha_venta) as mes,
            COUNT(*) as total_entradas,
            SUM(total_venta) as ingresos_mes
          FROM entradas
          WHERE fecha_venta BETWEEN $1 AND $2
          GROUP BY DATE_TRUNC('month', fecha_venta)
          ORDER BY mes
        `, [fechaInicio, fechaFin]),
        
        query(`
          SELECT 
            tipo_ticket,
            COUNT(*) as cantidad,
            SUM(total_venta) as ingresos,
            AVG(precio_unitario) as precio_promedio
          FROM entradas
          WHERE fecha_venta BETWEEN $1 AND $2
          GROUP BY tipo_ticket
          ORDER BY ingresos DESC
        `, [fechaInicio, fechaFin])
      ]);

      return {
        ingresos_diarios: dailyResult.rows,
        ingresos_mensuales: monthlyResult.rows,
        por_tipo_ticket: ticketTypeResult.rows,
        resumen: {
          total_ingresos: dailyResult.rows.reduce((sum, row) => sum + parseFloat(row.ingresos_dia), 0),
          total_entradas: dailyResult.rows.reduce((sum, row) => sum + parseInt(row.total_entradas), 0),
          promedio_diario: dailyResult.rows.reduce((sum, row) => sum + parseFloat(row.ingresos_dia), 0) / dailyResult.rows.length
        }
      };
    } catch (error) {
      logger.error('Error getting financial report', { error: error.message });
      throw error;
    }
  }

  // Reporte de empleados y nómina
  async getEmployeeReport(mes, anio) {
    try {
      const result = await query(`
        SELECT 
          e.id,
          e.nombre,
          e.puesto,
          e.salario,
          e.estado,
          e.inasistencias,
          e.suspensiones,
          e.vacaciones_disponibles,
          n.sueldo_base,
          n.bonos,
          n.descuentos,
          n.total_neto,
          n.estado_pago
        FROM empleados e
        LEFT JOIN nominas n ON e.id = n.empleado_id 
          AND n.periodo_mes = $1 
          AND n.periodo_anio = $2
        ORDER BY e.nombre
      `, [mes, anio]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting employee report', { error: error.message });
      throw error;
    }
  }

  // Reporte de limpieza
  async getCleaningReport(fechaInicio, fechaFin) {
    try {
      const result = await query(`
        SELECT 
          l.area,
          l.tipo_area,
          l.fecha_programada,
          l.fecha_ejecucion,
          l.estado,
          l.calificacion,
          e.nombre as responsable,
          CASE 
            WHEN l.fecha_ejecucion IS NULL THEN NULL
            ELSE l.fecha_ejecucion - l.fecha_programada
          END as dias_retraso
        FROM limpiezas l
        LEFT JOIN empleados e ON l.responsable_id = e.id
        WHERE l.fecha_programada BETWEEN $1 AND $2
        ORDER BY l.fecha_programada DESC
      `, [fechaInicio, fechaFin]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting cleaning report', { error: error.message });
      throw error;
    }
  }

  // Reporte de tratamientos veterinarios
  async getVeterinaryReport(fechaInicio, fechaFin) {
    try {
      const result = await query(`
        SELECT 
          t.id,
          a.nombre as animal,
          a.especie,
          t.diagnostico,
          t.tratamiento,
          t.fecha_inicio,
          t.fecha_fin,
          t.estado,
          e.nombre as veterinario,
          m.nombre as medicamento,
          t.dosis,
          t.frecuencia,
          t.duracion_dias
        FROM tratamientos t
        JOIN animales a ON t.animal_id = a.id
        JOIN empleados e ON t.veterinario_id = e.id
        LEFT JOIN medicamentos m ON t.medicamento_id = m.id
        WHERE t.fecha_inicio BETWEEN $1 AND $2
        ORDER BY t.fecha_inicio DESC
      `, [fechaInicio, fechaFin]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting veterinary report', { error: error.message });
      throw error;
    }
  }

  // Generar reporte en Excel
  async generateExcelReport(reportType, data, filters = {}) {
    try {
      const workbook = XLSX.utils.book_new();
      let sheetName, headers;

      switch (reportType) {
        case 'animals':
          sheetName = 'Reporte de Animales';
          headers = ['ID', 'Nombre', 'Especie', 'Habitat', 'Estado Salud', 'Peso', 'Altura', 'Veterinario', 'Tratamientos Activos'];
          break;
        case 'food':
          sheetName = 'Consumo de Alimentos';
          headers = ['Alimento', 'Tipo', 'Unidad', 'Consumido', 'Ingresado', 'Stock Actual', 'Stock Mínimo', 'Promedio Diario'];
          break;
        case 'financial':
          sheetName = 'Reporte Financiero';
          headers = ['Fecha', 'Total Entradas', 'Ingresos', 'Precio Promedio'];
          break;
        case 'employees':
          sheetName = 'Reporte de Empleados';
          headers = ['ID', 'Nombre', 'Puesto', 'Salario', 'Estado', 'Inasistencias', 'Total Neto'];
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      // Crear worksheet con headers
      const worksheet = XLSX.utils.aoa_to_sheet([headers]);
      
      // Agregar datos
      data.forEach((row, index) => {
        const rowData = Object.values(row);
        XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: index + 1 });
      });

      // Agregar worksheet al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generar buffer del archivo Excel
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      logger.info('Excel report generated', { reportType, rows: data.length });
      return excelBuffer;
    } catch (error) {
      logger.error('Error generating Excel report', { reportType, error: error.message });
      throw error;
    }
  }

  // Generar reporte consolidado
  async getConsolidatedReport(fechaInicio, fechaFin) {
    try {
      const [animalReport, foodReport, financialReport, cleaningReport] = await Promise.all([
        this.getAnimalHealthReport(),
        this.getFoodConsumptionReport(fechaInicio, fechaFin),
        this.getFinancialReport(fechaInicio, fechaFin),
        this.getCleaningReport(fechaInicio, fechaFin)
      ]);

      return {
        periodo: { inicio: fechaInicio, fin: fechaFin },
        animales: animalReport,
        alimentos: foodReport,
        finanzas: financialReport,
        limpieza: cleaningReport,
        generado_en: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error generating consolidated report', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ReportService();