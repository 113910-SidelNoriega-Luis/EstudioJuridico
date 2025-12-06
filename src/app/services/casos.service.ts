import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Documento {
  id: number;
  nombre: string;
  tipo: 'documento' | 'plantilla';
  tamano: string;
  fecha: string;
  autor: string;
}

export interface Caso {
  id: number;
  numero: string;
  titulo: string;
  cliente: {
    nombre: string;
    documento: string;
    email: string;
  };
  asesor: {
    nombre: string;
    documento: string;
    email: string;
  };
  tipo: string;
  estado: 'activo' | 'en_proceso' | 'pagado';
  fechaInicio: string;
  descripcion: string;
  pagoHabilitado: boolean;
  pagado: boolean;
  documentos: Documento[];
  movimientos: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CasosService {
  
  private casosSubject = new BehaviorSubject<Caso[]>(this.getCasosIniciales());
  public casos$ = this.casosSubject.asObservable();

  constructor() {
    // Cargar casos desde localStorage si existen
    const casosGuardados = localStorage.getItem('casos');
    if (casosGuardados) {
      this.casosSubject.next(JSON.parse(casosGuardados));
    }
  }

  private getCasosIniciales(): Caso[] {
    return [
      {
        id: 1,
        numero: 'C-2024-001',
        titulo: 'Despido Injustificado - Reclamo Laboral',
        cliente: {
          nombre: 'Juan Pérez',
          documento: '12345678',
          email: 'juan.perez@email.com'
        },
        asesor: {
          nombre: 'Dr. María González',
          documento: '87654321',
          email: 'maria.gonzalez@estudio.com'
        },
        tipo: 'Laboral',
        estado: 'en_proceso',
        fechaInicio: '15/11/2024',
        descripcion: 'Reclamo por despido sin causa justificada. El cliente trabajó durante 5 años en la empresa XYZ S.A.',
        pagoHabilitado: false,
        pagado: false,
        documentos: [],
        movimientos: [
          {
            id: 1,
            fecha: new Date().toLocaleString('es-AR'),
            tipo: 'actualizacion',
            descripcion: 'Caso creado y asignado',
            autor: 'Sistema'
          }
        ]
      }
    ];
  }

  getCasoById(id: number): Caso | undefined {
    return this.casosSubject.value.find(c => c.id === id);
  }

  actualizarCaso(caso: Caso): void {
    const casos = this.casosSubject.value;
    const index = casos.findIndex(c => c.id === caso.id);
    if (index !== -1) {
      casos[index] = caso;
      this.casosSubject.next([...casos]);
      this.guardarEnLocalStorage();
    }
  }

  agregarDocumento(casoId: number, documento: Documento): void {
    const caso = this.getCasoById(casoId);
    if (caso) {
      caso.documentos.push(documento);
      
      // Agregar movimiento
      caso.movimientos.unshift({
        id: caso.movimientos.length + 1,
        fecha: new Date().toLocaleString('es-AR'),
        tipo: 'documento',
        descripcion: `Documento agregado: ${documento.nombre}`,
        autor: caso.asesor.nombre
      });

      this.actualizarCaso(caso);
    }
  }

  eliminarDocumento(casoId: number, documentoId: number): void {
    const caso = this.getCasoById(casoId);
    if (caso) {
      const documento = caso.documentos.find(d => d.id === documentoId);
      caso.documentos = caso.documentos.filter(d => d.id !== documentoId);
      
      // Agregar movimiento
      if (documento) {
        caso.movimientos.unshift({
          id: caso.movimientos.length + 1,
          fecha: new Date().toLocaleString('es-AR'),
          tipo: 'documento',
          descripcion: `Documento eliminado: ${documento.nombre}`,
          autor: caso.asesor.nombre
        });
      }

      this.actualizarCaso(caso);
    }
  }

  habilitarPago(casoId: number): void {
    const caso = this.getCasoById(casoId);
    if (caso) {
      caso.pagoHabilitado = true;
      
      // Agregar movimiento
      caso.movimientos.unshift({
        id: caso.movimientos.length + 1,
        fecha: new Date().toLocaleString('es-AR'),
        tipo: 'pago',
        descripcion: 'Pago habilitado para el cliente',
        autor: caso.asesor.nombre
      });

      this.actualizarCaso(caso);
    }
  }

  marcarComoPagado(casoId: number, paymentId?: string): void {
    const caso = this.getCasoById(casoId);
    if (caso) {
      caso.pagado = true;
      caso.estado = 'pagado';
      
      // Agregar movimiento
      caso.movimientos.unshift({
        id: caso.movimientos.length + 1,
        fecha: new Date().toLocaleString('es-AR'),
        tipo: 'pago',
        descripcion: `Pago realizado exitosamente${paymentId ? ` - ID: ${paymentId}` : ''}`,
        autor: caso.cliente.nombre
      });

      this.actualizarCaso(caso);
    }
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('casos', JSON.stringify(this.casosSubject.value));
  }

  // Para resetear los datos (útil para demostración)
  resetearCasos(): void {
    this.casosSubject.next(this.getCasosIniciales());
    this.guardarEnLocalStorage();
  }
}
