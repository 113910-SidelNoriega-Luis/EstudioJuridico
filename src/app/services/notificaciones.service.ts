import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface NotificacionEmail {
  destinatario: string;
  asunto: string;
  mensaje: string;
  tipo: 'confirmacion' | 'recordatorio' | 'cancelacion' | 'modificacion';
}

export interface ResultadoEmail {
  exito: boolean;
  mensaje: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {

  constructor(private http: HttpClient) {}

  private linkBackend = 'http://localhost:8080/consultations';

  enviarConfirmacionTurnoBack(date: string, time: string) {
    const body = {
      clientId: 1, // podés cambiarlo luego si querés hacerlo dinámico
      lawyerId: 1,
      date: date,
      time: time,
    };

    return this.http.post('http://localhost:8080/consultations/confirm', body);
  }

  enviarCancelacionTurno(date: string, time: string) {
  const body = {
    clientId: 1,
    lawyerId: 1,
    date: date,
    time: time
  };

  return this.http.post(this.linkBackend+'/cancel', body);
}


  /**
   * Envía un email de confirmación de turno
   */
  enviarConfirmacionTurno(
    email: string,
    nombreCliente: string,
    fecha: string,
    hora: string,
    horaFin: string,
    motivo: string,
    asesor: string
  ): Observable<ResultadoEmail> {
    const mensaje = this.generarMensajeConfirmacion(
      nombreCliente,
      fecha,
      hora,
      horaFin,
      motivo,
      asesor
    );

    return this.enviarEmail({
      destinatario: email,
      asunto: '✅ Confirmación de Turno - Estudio Jurídico',
      mensaje: mensaje,
      tipo: 'confirmacion',
    });
  }

  /**
   * Envía un email de cancelación de turno
   */
  // enviarCancelacionTurno(
  //   email: string,
  //   nombreCliente: string,
  //   fecha: string,
  //   hora: string,
  //   motivo: string
  // ): Observable<ResultadoEmail> {
  //   const mensaje = this.generarMensajeCancelacion(nombreCliente, fecha, hora, motivo);

  //   return this.enviarEmail({
  //     destinatario: email,
  //     asunto: '❌ Cancelación de Turno - Estudio Jurídico',
  //     mensaje: mensaje,
  //     tipo: 'cancelacion',
  //   });
  // }

  /**
   * Envía un email de recordatorio de turno
   */
  enviarRecordatorioTurno(
    email: string,
    nombreCliente: string,
    fecha: string,
    hora: string,
    horaFin: string,
    asesor: string
  ): Observable<ResultadoEmail> {
    const mensaje = this.generarMensajeRecordatorio(nombreCliente, fecha, hora, horaFin, asesor);

    return this.enviarEmail({
      destinatario: email,
      asunto: '⏰ Recordatorio de Turno - Estudio Jurídico',
      mensaje: mensaje,
      tipo: 'recordatorio',
    });
  }

  /**
   * Método privado para simular envío de email
   * En producción, esto llamaría a un backend real
   */
  private enviarEmail(notificacion: NotificacionEmail): Observable<ResultadoEmail> {
    console.log('📧 Enviando email:', notificacion);

    // Simulación de envío con delay de 1 segundo
    return of({
      exito: true,
      mensaje: `Email enviado exitosamente a ${notificacion.destinatario}`,
      timestamp: new Date(),
    }).pipe(delay(1000));

    /* 
    // Ejemplo de implementación real con HttpClient:
    return this.http.post<ResultadoEmail>('/api/notificaciones/email', notificacion);
    */
  }

  /**
   * Genera el mensaje HTML de confirmación
   */
  private generarMensajeConfirmacion(
    nombreCliente: string,
    fecha: string,
    hora: string,
    horaFin: string,
    motivo: string,
    asesor: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #0d6efd; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #0d6efd; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
          .button { background-color: #0d6efd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚖️ Estudio Jurídico</h1>
            <h2>Confirmación de Turno</h2>
          </div>
          
          <div class="content">
            <p>Estimado/a <strong>${nombreCliente}</strong>,</p>
            
            <p>Su turno ha sido confirmado exitosamente. A continuación los detalles:</p>
            
            <div class="info-box">
              <p><strong>📅 Fecha:</strong> ${this.formatearFechaLegible(fecha)}</p>
              <p><strong>🕐 Horario:</strong> ${hora} a ${horaFin} hs</p>
              <p><strong>📋 Motivo:</strong> ${motivo}</p>
              <p><strong>👨‍💼 Asesor:</strong> ${asesor}</p>
            </div>
            
            <p><strong>Importante:</strong></p>
            <ul>
              <li>Por favor llegue 5 minutos antes de su turno</li>
              <li>Traiga documentación relevante si la tiene</li>
              <li>Si necesita cancelar, hágalo con 24hs de anticipación</li>
            </ul>
            
            <p>¿Necesita reprogramar? Ingrese a su panel de cliente:</p>
            <a href="https://estudiojuridico.com/panel-cliente/turnos" class="button">Ver mis turnos</a>
          </div>
          
          <div class="footer">
            <p>Estudio Jurídico - Calle Ejemplo 123, Córdoba</p>
            <p>Tel: (0351) 123-4567 | Email: contacto@estudiojuridico.com</p>
            <p style="font-size: 12px; color: #999;">
              Este es un email automático, por favor no responda a este mensaje.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el mensaje HTML de cancelación
   */
  private generarMensajeCancelacion(
    nombreCliente: string,
    fecha: string,
    hora: string,
    motivo: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #dc3545; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
          .button { background-color: #0d6efd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚖️ Estudio Jurídico</h1>
            <h2>Turno Cancelado</h2>
          </div>
          
          <div class="content">
            <p>Estimado/a <strong>${nombreCliente}</strong>,</p>
            
            <p>Su turno ha sido cancelado según lo solicitado.</p>
            
            <div class="info-box">
              <p><strong>📅 Fecha:</strong> ${this.formatearFechaLegible(fecha)}</p>
              <p><strong>🕐 Horario:</strong> ${hora} hs</p>
              <p><strong>📋 Motivo:</strong> ${motivo}</p>
            </div>
            
            <p>¿Necesita agendar un nuevo turno?</p>
            <a href="https://estudiojuridico.com/panel-cliente/turnos" class="button">Agendar nuevo turno</a>
          </div>
          
          <div class="footer">
            <p>Estudio Jurídico - Calle Ejemplo 123, Córdoba</p>
            <p>Tel: (0351) 123-4567 | Email: contacto@estudiojuridico.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Genera el mensaje HTML de recordatorio
   */
  private generarMensajeRecordatorio(
    nombreCliente: string,
    fecha: string,
    hora: string,
    horaFin: string,
    asesor: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ffc107; color: #000; padding: 20px; text-align: center; }
          .content { background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-top: 20px; }
          .info-box { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #ffc107; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚖️ Estudio Jurídico</h1>
            <h2>⏰ Recordatorio de Turno</h2>
          </div>
          
          <div class="content">
            <p>Estimado/a <strong>${nombreCliente}</strong>,</p>
            
            <p>Le recordamos que tiene un turno programado:</p>
            
            <div class="info-box">
              <p><strong>📅 Fecha:</strong> ${this.formatearFechaLegible(fecha)}</p>
              <p><strong>🕐 Horario:</strong> ${hora} a ${horaFin} hs</p>
              <p><strong>👨‍💼 Asesor:</strong> ${asesor}</p>
            </div>
            
            <p><strong>Recuerde:</strong></p>
            <ul>
              <li>Llegar 5 minutos antes</li>
              <li>Traer documentación necesaria</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Estudio Jurídico - Calle Ejemplo 123, Córdoba</p>
            <p>Tel: (0351) 123-4567</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Formatea una fecha ISO a texto legible
   */
  private formatearFechaLegible(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return fechaObj.toLocaleDateString('es-AR', opciones);
  }

  /**
   * Muestra una notificación toast en la UI
   */
  mostrarNotificacion(mensaje: string, tipo: 'success' | 'error' | 'info' = 'success'): void {
    // Implementación simple con alert
    // En producción, usar una librería de toasts como ngx-toastr
    const iconos = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
    };

    console.log(`${iconos[tipo]} ${mensaje}`);

    // Opcional: Crear elemento toast en el DOM
    this.crearToast(mensaje, tipo);
  }

  /**
   * Crea un toast visual en el DOM
   */
  private crearToast(mensaje: string, tipo: 'success' | 'error' | 'info'): void {
    const colores = {
      success: '#198754',
      error: '#dc3545',
      info: '#0dcaf0',
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: ${colores[tipo]};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
      font-family: Arial, sans-serif;
    `;
    toast.textContent = mensaje;

    // Agregar animación
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    // Remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
