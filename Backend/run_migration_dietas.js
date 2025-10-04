// Script para ejecutar la migración de dietas automáticas
const { supabase } = require('./config/database');
const DateUtils = require('./utils/dateUtils');
const { logger } = require('./middleware/logger');

async function runMigration() {
  console.log('🔄 Ejecutando migración de dietas automáticas...\n');

  try {
    // Paso 1: Agregar columnas si no existen (esto debe hacerse manualmente en Supabase)
    console.log('📝 Nota: Las columnas ultima_ejecucion y proxima_ejecucion deben agregarse manualmente si no existen');
    console.log('SQL para agregar columnas:');
    console.log('ALTER TABLE horarios_alimentacion ADD COLUMN IF NOT EXISTS ultima_ejecucion TIMESTAMP, ADD COLUMN IF NOT EXISTS proxima_ejecucion TIMESTAMP;');
    console.log('CREATE INDEX IF NOT EXISTS idx_horarios_ejecucion ON horarios_alimentacion(proxima_ejecucion) WHERE activo = TRUE;');
    console.log('');

    // Paso 2: Corregir proxima_ejecucion para todos los horarios activos
    console.log('🔄 Corrigiendo próximas ejecuciones...');

    const { data: horarios, error } = await supabase
      .from('horarios_alimentacion')
      .select('id, hora, frecuencia, proxima_ejecucion')
      .eq('activo', true);

    if (error) {
      console.error('❌ Error obteniendo horarios:', error);
      return;
    }

    console.log(`� Encontrados ${horarios.length} horarios activos para corregir`);

    let corrected = 0;
    let errors = 0;

    for (const horario of horarios) {
      try {
        // Calcular la nueva próxima ejecución usando DateUtils
        const nuevaProximaEjecucion = DateUtils.calcularProximaEjecucion(horario.frecuencia, horario.hora, false);

        // Actualizar el registro
        const { error: updateError } = await supabase
          .from('horarios_alimentacion')
          .update({
            proxima_ejecucion: DateUtils.toISOString(nuevaProximaEjecucion)
          })
          .eq('id', horario.id);

        if (updateError) {
          console.error(`❌ Error actualizando horario ${horario.id}:`, updateError);
          errors++;
        } else {
          console.log(`✅ Corregido horario ${horario.id}: ${horario.hora} -> próxima ejecución ${nuevaProximaEjecucion.toISOString()}`);
          corrected++;
        }
      } catch (error) {
        console.error(`❌ Error procesando horario ${horario.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📊 Resumen de la migración:`);
    console.log(`✅ Horarios corregidos: ${corrected}`);
    console.log(`❌ Errores: ${errors}`);

    if (corrected > 0) {
      console.log('✅ Migración completada exitosamente');
    }

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
  }
}

runMigration();