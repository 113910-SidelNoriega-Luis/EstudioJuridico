import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TurnoPaymentDTO {
  turnoId: string;
  clienteNombre: string;
  consultaAsunto: string;
  consultaDescripcion: string;
  fecha: string;
  hora: string;
}

export interface PaymentResponseDTO {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  externalReference: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private apiUrl = 'http://localhost:8080/api/payment'; // Tu backend

  constructor(private http: HttpClient) {}

  /**
   * Crea una preferencia de pago en Mercado Pago a través del backend
   */
  crearPreferenciaPago(casoId: number, casoTitulo: string, clienteNombre: string): Observable<PaymentResponseDTO> {
    const turnoData: TurnoPaymentDTO = {
      turnoId: `CASO-${casoId}`,
      clienteNombre: clienteNombre,
      consultaAsunto: casoTitulo,
      consultaDescripcion: 'Pago de honorarios profesionales',
      fecha: new Date().toLocaleDateString('es-AR'),
      hora: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };

    return this.http.post<PaymentResponseDTO>(
      `${this.apiUrl}/create-preference`,
      turnoData
    );
  }

  /**
   * Obtiene información de un pago
   */
  obtenerInfoPago(paymentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/info/${paymentId}`);
  }
}
