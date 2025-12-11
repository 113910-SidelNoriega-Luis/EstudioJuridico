// src/app/services/consultas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ConsultaRequest {
  nombre: string;
  correo: string;
  celular: string;
  consulta: string;
}

@Injectable({ providedIn: 'root' })
export class ConsultasService {

  private apiUrl = 'http://localhost:8080/consultations'; // ajusta si tu back tiene otro path/base

  constructor(private http: HttpClient) {}

  enviarConsulta(data: ConsultaRequest): Observable<any> {
    // OJO: Adaptá los nombres a los que espera tu ConsultationRequest en el backend
    const body = {
      nombre: data.nombre,
      email: data.correo,
      celular: data.celular,
      consulta: data.consulta
    };

    return this.http.post(this.apiUrl, body);
  }
}
