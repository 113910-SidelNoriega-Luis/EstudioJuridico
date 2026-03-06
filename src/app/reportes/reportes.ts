import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  computed,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from './reportes.service';
import { GraficoComponent } from './grafico/grafico';
import { TablaDatosComponent } from './tabla-datos/tabla-datos';
import { DatosMes } from './mock-reportes';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, GraficoComponent, TablaDatosComponent],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportesComponent implements OnInit {
  private reportesService = inject(ReportesService);

  mesSeleccionado = signal<number>(new Date().getMonth()); // 0-11
  anioSeleccionado = signal<number>(new Date().getFullYear());

  cargando = computed(() => this.reportesService.cargando());
  error = computed(() => this.reportesService.error());

  datosMes = computed<DatosMes | undefined>(() => {
    return this.reportesService.obtenerMes(this.mesSeleccionado(), this.anioSeleccionado());
  });

  etiquetasGrafico = computed(() => {
    const datos = this.datosMes();
    if (!datos) return [];
    return datos.semanas.map((s) => s.nombre.split('(')[0].trim());
  });

  datasetsGrafico = computed(() => {
    const datos = this.datosMes();
    if (!datos) return [];
    return [
      { label: 'Casos Nuevos', datos: datos.semanas.map((s) => s.casosNuevos), color: '#007bff' },
      {
        label: 'Casos Cerrados',
        datos: datos.semanas.map((s) => s.casosCerrados),
        color: '#28a745',
      },
      { label: 'En Proceso', datos: datos.semanas.map((s) => s.casosEnProceso), color: '#ffc107' },
    ];
  });

  datasetTotalSemanal = computed(() => {
    const datos = this.datosMes();
    if (!datos) return [];
    return [{ label: 'Total Casos', datos: datos.semanas.map((s) => s.total), color: '#6f42c1' }];
  });

  // Gráfico de tendencia: atendidos vs cerrados por mes
  etiquetasTendencia = computed(() => {
    const todos = this.reportesService.datosPorMes();
    return todos.map((d) => d.nombre.split(' ')[0]);
  });

  datasetsTendencia = computed(() => {
    const todos = this.reportesService.datosPorMes();
    if (todos.length === 0) return [];
    return [
      { label: 'Casos Atendidos', datos: todos.map((d) => d.totalCasos), color: '#007bff' },
      { label: 'Casos Cerrados', datos: todos.map((d) => d.casosCerrados), color: '#28a745' },
    ];
  });

  // Distribución por tipo de caso — gráfico de dona (proporcional al mes seleccionado)
  etiquetasTiposCaso = computed(() => ['Civil', 'Penal', 'Laboral', 'Familiar', 'Comercial']);
  datasetsTiposCaso = computed(() => {
    const datos = this.datosMes();
    const total = datos?.totalCasos ?? 105;
    // Proporciones fijas: Civil 30%, Penal 20%, Laboral 25%, Familiar 15%, Comercial 10%
    return [
      {
        label: 'Distribución de Casos',
        datos: [
          Math.round(total * 0.3),
          Math.round(total * 0.2),
          Math.round(total * 0.25),
          Math.round(total * 0.15),
          Math.round(total * 0.1),
        ],
        colores: ['#4e73df', '#e74a3b', '#1cc88a', '#f6c23e', '#858796'],
      },
    ];
  });

  // Tasa de cierre mensual — gráfico de área
  datasetsTasaCierre = computed(() => {
    const todos = this.reportesService.datosPorMes();
    if (todos.length === 0) return [];
    return [
      {
        label: 'Tasa de Cierre (%)',
        datos: todos.map((d) =>
          d.totalCasos > 0 ? Math.round((d.casosCerrados / d.totalCasos) * 100) : 0,
        ),
        color: 'rgba(28,200,138,0.25)',
        borderColor: '#1cc88a',
      },
    ];
  });

  // KPIs extras del mes
  kpisMes = computed(() => {
    const datos = this.datosMes();
    if (!datos) return null;
    const tasaCierre =
      datos.totalCasos > 0 ? ((datos.casosCerrados / datos.totalCasos) * 100).toFixed(1) : '0';
    const promSemana = (datos.totalCasos / datos.semanas.length).toFixed(1);
    return {
      tasaCierre,
      promSemana,
      consultasTotales: Math.floor(datos.totalCasos * 1.8),
      turnosAtendidos: Math.floor(datos.totalCasos * 2.3),
      satisfaccion: 92,
      tiempoPromDias: Math.floor(datos.totalCasos * 1.5 + 8),
    };
  });

  ngOnInit() {
    this.reportesService.cargarDatos();
  }

  cambiarMes(direccion: 'anterior' | 'siguiente') {
    const mesActual = this.mesSeleccionado();
    const anioActual = this.anioSeleccionado();

    if (direccion === 'anterior') {
      if (mesActual === 0) {
        this.mesSeleccionado.set(11);
        this.anioSeleccionado.set(anioActual - 1);
      } else {
        this.mesSeleccionado.set(mesActual - 1);
      }
    } else {
      if (mesActual === 11) {
        this.mesSeleccionado.set(0);
        this.anioSeleccionado.set(anioActual + 1);
      } else {
        this.mesSeleccionado.set(mesActual + 1);
      }
    }
  }

  obtenerNombreMes(): string {
    const meses = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return meses[this.mesSeleccionado()];
  }
}
