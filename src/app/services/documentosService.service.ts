// documentos.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Documento {
  id: number;
  nombre: string;
  extension: string;
  tipo: 'pdf' | 'doc' | 'img' | 'escrito';
  tamanio: string;
  fecha: string;
  clienteId?: number;
  clienteNombre?: string;
  casoId?: number;
  caso?: string | number;
  downloadUrl: string;
}


@Injectable({ providedIn: 'root' })
export class DocumentosService {
  private apiUrl = 'http://localhost:8080/api/documentos';

  constructor(private http: HttpClient) {}

  subirDocumentos(formData: FormData): Observable<Documento[]> {
    return this.http.post<Documento[]>(`${this.apiUrl}/upload`, formData);
  }

  listarDocumentos(): Observable<Documento[]> {
    return this.http.get<Documento[]>(this.apiUrl);
  }

  descargarDocumento(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
