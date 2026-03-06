import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface KPI {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono?: string;
  variacion?: string;
  tendencia?: 'positiva' | 'negativa' | 'neutral';
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="estadisticas-grid">
      @for (kpi of estadisticas; track $index) {
        <div [class.tendencia-positiva]="kpi.tendencia === 'positiva'" [class.tendencia-negativa]="kpi.tendencia === 'negativa'" class="kpi-card">
          <div class="kpi-header">
            <h6 class="kpi-titulo">{{ kpi.titulo }}</h6>
            @if (kpi.variacion) {
              <span class="variacion" [class.positiva]="kpi.tendencia === 'positiva'" [class.negativa]="kpi.tendencia === 'negativa'">{{ kpi.variacion }}</span>
            }
          </div>
          <div class="kpi-contenido">
            @if (kpi.icono) {
              <span class="icono">{{ kpi.icono }}</span>
            }
            <div class="valor-contenedor">
              <p class="valor">{{ kpi.valor }}</p>
              @if (kpi.subtitulo) {
                <p class="subtitulo">{{ kpi.subtitulo }}</p>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .estadisticas-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin: 20px 0;
      }

      .kpi-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #007bff;
        transition: transform 0.3s, box-shadow 0.3s;
      }

      .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .kpi-card.tendencia-positiva {
        border-left-color: #28a745;
      }

      .kpi-card.tendencia-negativa {
        border-left-color: #dc3545;
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .kpi-titulo {
        margin: 0;
        color: #666;
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .variacion {
        font-size: 0.8rem;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 4px;
      }

      .variacion.positiva {
        color: #28a745;
        background-color: #e8f5e9;
      }

      .variacion.negativa {
        color: #dc3545;
        background-color: #ffebee;
      }

      .kpi-contenido {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .icono {
        font-size: 2.5rem;
        line-height: 1;
      }

      .valor-contenedor {
        flex: 1;
      }

      .valor {
        margin: 0;
        font-size: 1.8rem;
        font-weight: 700;
        color: #333;
      }

      .subtitulo {
        margin: 4px 0 0 0;
        font-size: 0.85rem;
        color: #999;
      }

      @media (max-width: 768px) {
        .estadisticas-grid {
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .valor {
          font-size: 1.4rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EstadisticasComponent {
  @Input() estadisticas: KPI[] = [];
}
