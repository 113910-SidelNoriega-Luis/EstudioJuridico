import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

// Agregar interfaz
export interface TurnoPaymentData {
  turnoId: string;
  clienteNombre: string;
  consultaAsunto: string;
  consultaDescripcion: string;
  fecha: string;
  hora: string;
}

export interface PaymentRequest {
  title: string;
  description: string;
  price: number;
  quantity: number;
  externalReference: string;
}

export interface PaymentResponse {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  externalReference: string;
}

export interface PaymentInfo {
  id: number;
  status: string;
  statusDetail: string;
  transactionAmount: number;
  externalReference: string;
  dateCreated: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/payment`;

  constructor(private http: HttpClient) {}

  /**
   * Crea preferencia de pago para un turno
   */
  createPreferenceForTurno(turnoData: TurnoPaymentData): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-preference`, turnoData);
  }

  /**
   * Obtiene información de un pago
   */
  getPaymentInfo(paymentId: number): Observable<PaymentInfo> {
    return this.http.get<PaymentInfo>(`${this.apiUrl}/info/${paymentId}`);
  }
}
