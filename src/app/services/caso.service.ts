// ============================================
// SERVICIO DE CASOS - ANGULAR - VERSIÓN COMPLETA
// ============================================
// Archivo: src/app/services/caso.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment.prod';

export interface HabilitarPagoRequest {
  monto: number;
  concepto: string;
}

export interface PaymentResponseDTO {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
  externalReference: string;
}

export interface DatosPago {
  pagoHabilitado: boolean;
  pagado: boolean;
  montoPago: number;
  conceptoPago: string;
  initPoint: string;
  preferenceId: string;
  estadoPago: string;
}

// ✅ INTERFACES CORREGIDAS PARA COINCIDIR CON EL BACKEND
export interface Cliente {
  id?: number;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  documentNumber?: string;
}

export interface Asesor {
  id?: number;
  name: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  documentNumber?: string;
}

// ✅ INTERFAZ CASO COMPLETA CON TODOS LOS CAMPOS
export interface Caso {
  id: number;
  titulo: string;
  descripcion: string;
  tipoCaso: string;
  estado: string;
  prioridad?: string; // ✅ Opcional
  fechaInicio?: number[] | string; // ✅ Puede ser array o string
  cliente: Cliente;
  asesor: Asesor;
  
  // ✅ CAMPOS DE PAGO - TODOS OPCIONALES
  pagoHabilitado?: boolean;
  pagado?: boolean;
  montoPago?: number;
  conceptoPago?: string;
  initPoint?: string;
  preferenceId?: string;
  estadoPago?: string;
  fechaHabilitacionPago?: number[] | string | null; // ✅ AGREGADO
  fechaPago?: number[] | string | null; // ✅ AGREGADO
  paymentId?: string; // ✅ AGREGADO
  metodoPago?: string; // ✅ AGREGADO
  montoPagado?: number; // ✅ AGREGADO
}

@Injectable({
  providedIn: 'root',
})
export class CasoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ============================================
  // OBTENER CASOS
  // ============================================

  obtenerCasoPorId(id: number): Observable<Caso> {
    return this.http.get<Caso>(`${this.apiUrl}/casos/${id}`);
  }

  obtenerCasosPorAsesor(documentNumber: string): Observable<Caso[]> {
    return this.http.get<Caso[]>(`${this.apiUrl}/casos/asesor/${documentNumber}`);
  }

  obtenerCasosPorCliente(documentNumber: string): Observable<Caso[]> {
    return this.http.get<Caso[]>(`${this.apiUrl}/casos/cliente/${documentNumber}`);
  }

  // ============================================
  // GESTIÓN DE PAGOS (ASESOR)
  // ============================================

  habilitarPago(casoId: number, data: HabilitarPagoRequest): Observable<PaymentResponseDTO> {
    return this.http.post<PaymentResponseDTO>(
      `${this.apiUrl}/casos/${casoId}/habilitar-pago`,
      data
    );
  }

  deshabilitarPago(casoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/casos/${casoId}/deshabilitar-pago`);
  }

  // ============================================
  // OBTENER DATOS DE PAGO (CLIENTE)
  // ============================================

  obtenerDatosPago(casoId: number): Observable<DatosPago> {
    return this.http.get<DatosPago>(`${this.apiUrl}/casos/${casoId}/pago`);
  }
}
