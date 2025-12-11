import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TurnoService {
  private apiUrl = 'http://localhost:8080/api/turnos';

  constructor(private http: HttpClient) {}

  /**
   * Marca un turno como pagado
   */
  marcarTurnoPagado(turnoId: string, paymentId: string, externalReference: string): Observable<any> {
    const payload = {
      paymentId: paymentId,
      externalReference: externalReference
    };
    
    console.log('💳 Marcando turno como pagado:', turnoId, payload);
    
    return this.http.put(`${this.apiUrl}/${turnoId}/marcar-pagado`, payload);
  }

  /**
   * Obtiene el estado de pago de un turno
   */
  getEstadoPago(turnoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${turnoId}/estado-pago`);
  }

  /**
   * Obtiene un turno por ID
   */
  getTurnoById(turnoId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${turnoId}`);
  }
}