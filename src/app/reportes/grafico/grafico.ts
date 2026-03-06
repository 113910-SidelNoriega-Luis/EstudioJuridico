import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectionStrategy,
  OnDestroy,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-grafico',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafico-container">
      @if (titulo) {
        <h5 class="grafico-titulo">{{ titulo }}</h5>
      }
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [
    `
      .grafico-container {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 15px 0;
      }
      .grafico-titulo {
        margin-bottom: 15px;
        color: #333;
        font-weight: 600;
      }
      canvas {
        max-height: 300px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() titulo?: string;
  @Input() tipo: 'linea' | 'barras' | 'columnas' | 'pastel' | 'dona' | 'area' = 'barras';
  @Input() etiquetas: string[] = [];
  @Input() datasets: any[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;

  ngAfterViewInit() {
    this.crearGrafico();
  }

  ngOnChanges() {
    if (this.chartCanvas) {
      this.crearGrafico();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private crearGrafico() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const tipoGrafico = this.obtenerTipoGrafico();
    const datosFormateados = this.formatearDatos();

    this.chart = new Chart(ctx, {
      type: tipoGrafico as any,
      data: {
        labels: this.etiquetas,
        datasets: datosFormateados,
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales:
          tipoGrafico === 'pie' || tipoGrafico === 'doughnut'
            ? undefined
            : {
                y: {
                  beginAtZero: true,
                },
              },
      } as any,
    });
  }

  private obtenerTipoGrafico(): string {
    switch (this.tipo) {
      case 'linea':
        return 'line';
      case 'barras':
        return 'bar';
      case 'columnas':
        return 'bar';
      case 'pastel':
        return 'pie';
      case 'dona':
        return 'doughnut';
      case 'area':
        return 'line';
      default:
        return 'bar';
    }
  }

  private formatearDatos(): any[] {
    const colores = this.generarColores();
    return this.datasets.map((dataset, index) => {
      const esDona = this.tipo === 'dona' || this.tipo === 'pastel';
      const bgColor = esDona
        ? (dataset.colores ?? colores.slice(0, dataset.datos.length))
        : (dataset.color ?? colores[index % colores.length]);
      return {
        label: dataset.label,
        data: dataset.datos,
        backgroundColor: bgColor,
        borderColor: esDona ? '#fff' : (dataset.color ?? colores[index % colores.length]),
        borderWidth: esDona ? 2 : 2,
        fill: this.tipo === 'area',
        tension: this.tipo === 'linea' || this.tipo === 'area' ? 0.4 : 0,
      };
    });
  }

  private generarColores(): string[] {
    return ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#17a2b8', '#6c757d'];
  }
}
