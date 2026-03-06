import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { DATOS_CASOS_POR_MES, DatosMes } from './mock-reportes';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  datosPorMes = signal<DatosMes[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando.set(true);
    this.datosPorMes.set(DATOS_CASOS_POR_MES);
    this.error.set(null);
    this.cargando.set(false);
  }

  obtenerMes(mes: number, anio: number): DatosMes | undefined {
    return this.datosPorMes().find((d) => d.mes === mes && d.anio === anio);
  }
}
