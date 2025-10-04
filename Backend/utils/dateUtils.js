// Utilidades para manejo de fechas y zona horaria
// Guatemala está en GMT-6

class DateUtils {
  // Obtener la fecha/hora actual en zona horaria de Guatemala
  static getGuatemalaTime() {
    const now = new Date();
    // GMT-6 = UTC-6
    const guatemalaOffset = -6 * 60; // minutos
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (guatemalaOffset * 60000));
  }

  // Convertir fecha a zona horaria de Guatemala
  static toGuatemalaTime(date) {
    if (!date) return null;
    const d = new Date(date);
    const guatemalaOffset = -6 * 60; // minutos
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    return new Date(utc + (guatemalaOffset * 60000));
  }

  // Formatear fecha para base de datos (ISO string en UTC)
  static toISOString(date) {
    if (!date) return null;
    return new Date(date).toISOString();
  }

  // Calcular próxima ejecución en zona horaria de Guatemala
  // Para creación inicial: siempre devuelve hoy a la hora especificada
  // Para recalculo después de ejecución: calcula la siguiente según frecuencia
  static calcularProximaEjecucion(frecuencia, hora, esRecalculo = false) {
    const ahora = this.getGuatemalaTime();
    const [horas, minutos] = hora.split(':').map(Number);
    const horaHoy = new Date(ahora);
    horaHoy.setHours(horas, minutos, 0, 0);

    let proximaEjecucion;

    if (!esRecalculo) {
      // Para creación inicial: siempre hoy a la hora configurada
      proximaEjecucion = new Date(horaHoy);
    } else {
      // Para recalculo después de ejecución: calcular siguiente período
      switch (frecuencia) {
        case 'diario':
          proximaEjecucion = new Date(horaHoy);
          proximaEjecucion.setDate(proximaEjecucion.getDate() + 1);
          break;

        case 'semanal':
          proximaEjecucion = new Date(horaHoy);
          proximaEjecucion.setDate(proximaEjecucion.getDate() + 7);
          break;

        case 'cada_dos_dias':
          proximaEjecucion = new Date(horaHoy);
          proximaEjecucion.setDate(proximaEjecucion.getDate() + 2);
          break;

        case 'cada_tres_dias':
          proximaEjecucion = new Date(horaHoy);
          proximaEjecucion.setDate(proximaEjecucion.getDate() + 3);
          break;

        default:
          // Por defecto diario
          proximaEjecucion = new Date(horaHoy);
          proximaEjecucion.setDate(proximaEjecucion.getDate() + 1);
      }
    }

    return proximaEjecucion;
  }

  // Formatear fecha para display en zona horaria de Guatemala
  static formatForDisplay(dateString) {
    if (!dateString) return 'Nunca';
    const date = this.toGuatemalaTime(dateString);
    return date.toLocaleString('es-GT', {
      timeZone: 'America/Guatemala',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

module.exports = DateUtils;