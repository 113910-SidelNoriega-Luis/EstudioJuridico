import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabla-datos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tabla-contenedor">
      @if (titulo) {
        <h6 class="tabla-titulo">{{ titulo }}</h6>
      }
      <div class="tabla-scroll">
        <table class="tabla-datos">
          <thead>
            <tr>
              @for (encabezado of encabezados; track encabezado) {
                <th>{{ encabezado }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (fila of datos; track $index) {
              <tr [class.fila-par]="$index % 2 === 0">
                @for (valor of obtenerValores(fila); track valor) {
                  <td class="celda-datos">
                    {{ formatearValor(valor) }}
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      .tabla-contenedor {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 20px 0;
      }

      .tabla-titulo {
        padding: 15px 20px;
        margin: 0;
        background-color: #f8f9fa;
        color: #333;
        font-weight: 600;
        border-bottom: 1px solid #dee2e6;
      }

      .tabla-scroll {
        overflow-x: auto;
      }

      .tabla-datos {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.95rem;
      }

      thead {
        background-color: #f8f9fa;
        position: sticky;
        top: 0;
      }

      th {
        padding: 12px 15px;
        text-align: left;
        font-weight: 600;
        color: #495057;
        border-bottom: 2px solid #dee2e6;
        white-space: nowrap;
      }

      td {
        padding: 12px 15px;
        border-bottom: 1px solid #dee2e6;
      }

      .fila-par {
        background-color: #fafbfc;
      }

      tbody tr:hover {
        background-color: #f0f1f2;
      }

      .celda-datos {
        color: #333;
      }

      @media (max-width: 768px) {
        th,
        td {
          padding: 8px 10px;
          font-size: 0.85rem;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaDatosComponent {
  @Input() titulo?: string;
  @Input() encabezados: string[] = [];
  @Input() datos: any[] = [];

  obtenerValores(fila: any): any[] {
    return Object.values(fila);
  }

  formatearValor(valor: any): string {
    if (typeof valor === 'number') {
      if (Number.isInteger(valor)) {
        return valor.toString();
      }
      return valor.toFixed(1);
    }
    return String(valor);
  }
}
