import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FechaSeleccionada {
  fecha: string; // YYYY-MM-DD
  fechaTexto: string; // Ej: "Lun 25/11"
  diaSemana: string; // Ej: "Lunes"
  disponible: boolean;
}

@Component({
  selector: 'app-selector-fecha',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="selector-fecha">
      <div class="selector-header">
        <button class="btn-nav" (click)="semanaAnterior()" [disabled]="!puedeRetroceder()">
          &#8249; Anterior
        </button>
        <h5 class="mes-anio">{{ mesAnioActual }}</h5>
        <button class="btn-nav" (click)="semanaSiguiente()">
          Siguiente &#8250;
        </button>
      </div>

      <div class="dias-semana">
        <div *ngFor="let dia of diasSemana" 
             class="dia-card"
             [class.seleccionado]="esFechaSeleccionada(dia)"
             [class.hoy]="esHoy(dia)"
             [class.no-disponible]="!dia.disponible"
             (click)="seleccionarFecha(dia)">
          <div class="dia-numero">{{ getDiaNumero(dia.fecha) }}</div>
          <div class="dia-nombre">{{ dia.diaSemana }}</div>
          <div class="dia-mes">{{ getMesCorto(dia.fecha) }}</div>
          <div class="disponibilidad" *ngIf="dia.disponible">
            <span class="badge-disponible">Disponible</span>
          </div>
          <div class="disponibilidad" *ngIf="!dia.disponible">
            <span class="badge-no-disponible">Sin turnos</span>
          </div>
        </div>
      </div>

      <div class="vista-rapida">
        <button class="btn-rapido" (click)="irAHoy()">
          📅 Hoy
        </button>
        <button class="btn-rapido" (click)="irAManana()">
          🌅 Mañana
        </button>
        <button class="btn-rapido" (click)="irAProximaSemana()">
          📆 Próxima semana
        </button>
      </div>
    </div>
  `,
  styles: [`
    .selector-fecha {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      margin-bottom: 20px;
    }

    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #e9ecef;
    }

    .mes-anio {
      margin: 0;
      font-weight: 700;
      color: #212529;
      font-size: 1.2rem;
    }

    .btn-nav {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      color: #495057;
    }

    .btn-nav:hover:not(:disabled) {
      background: #0d6efd;
      color: white;
      border-color: #0d6efd;
      transform: scale(1.05);
    }

    .btn-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dias-semana {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .dia-card {
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      border-radius: 12px;
      padding: 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
    }

    .dia-card:hover:not(.no-disponible) {
      transform: translateY(-5px);
      box-shadow: 0 6px 16px rgba(13,110,253,0.2);
      border-color: #0d6efd;
    }

    .dia-card.seleccionado {
      background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
      color: white;
      border-color: #0d6efd;
      box-shadow: 0 6px 16px rgba(13,110,253,0.3);
    }

    .dia-card.hoy {
      border-color: #ffc107;
      border-width: 3px;
    }

    .dia-card.hoy::after {
      content: "HOY";
      position: absolute;
      top: 5px;
      right: 5px;
      background: #ffc107;
      color: #000;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .dia-card.no-disponible {
      opacity: 0.5;
      cursor: not-allowed;
      background: #e9ecef;
    }

    .dia-numero {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 5px;
    }

    .dia-nombre {
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .dia-mes {
      font-size: 0.75rem;
      opacity: 0.8;
      margin-bottom: 8px;
    }

    .disponibilidad {
      margin-top: 8px;
    }

    .badge-disponible {
      background: #d1e7dd;
      color: #0f5132;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .dia-card.seleccionado .badge-disponible {
      background: rgba(255,255,255,0.3);
      color: white;
    }

    .badge-no-disponible {
      background: #f8d7da;
      color: #842029;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .vista-rapida {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-rapido {
      background: white;
      border: 2px solid #0d6efd;
      color: #0d6efd;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .btn-rapido:hover {
      background: #0d6efd;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(13,110,253,0.3);
    }

    @media (max-width: 768px) {
      .dias-semana {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 10px;
      }

      .dia-numero {
        font-size: 1.5rem;
      }

      .selector-header {
        flex-direction: column;
        gap: 10px;
      }

      .btn-nav {
        width: 100%;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dia-card {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class SelectorFechaComponent implements OnInit {
  
  @Input() fechasDisponibles: string[] = []; // Fechas con turnos disponibles
  @Output() fechaSeleccionadaEvent = new EventEmitter<FechaSeleccionada>();

  diasSemana: FechaSeleccionada[] = [];
  fechaSeleccionada: string | null = null;
  fechaInicio: Date = new Date();
  mesAnioActual: string = '';

  ngOnInit(): void {
    this.generarDiasSemana();
  }

  generarDiasSemana(): void {
    this.diasSemana = [];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(this.fechaInicio);
      fecha.setDate(this.fechaInicio.getDate() + i);
      
      const fechaISO = this.formatearFechaISO(fecha);
      const disponible = this.esFechaDisponible(fechaISO);
      
      this.diasSemana.push({
        fecha: fechaISO,
        fechaTexto: `${dias[fecha.getDay()]} ${fecha.getDate()}/${fecha.getMonth() + 1}`,
        diaSemana: dias[fecha.getDay()],
        disponible: disponible
      });
    }

    this.actualizarMesAnio();
  }

  seleccionarFecha(dia: FechaSeleccionada): void {
    if (!dia.disponible) {
      return;
    }

    this.fechaSeleccionada = dia.fecha;
    this.fechaSeleccionadaEvent.emit(dia);
  }

  semanaAnterior(): void {
    if (!this.puedeRetroceder()) return;
    this.fechaInicio.setDate(this.fechaInicio.getDate() - 7);
    this.generarDiasSemana();
  }

  semanaSiguiente(): void {
    this.fechaInicio.setDate(this.fechaInicio.getDate() + 7);
    this.generarDiasSemana();
  }

  puedeRetroceder(): boolean {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const primerDiaSemana = new Date(this.fechaInicio);
    primerDiaSemana.setHours(0, 0, 0, 0);
    return primerDiaSemana > hoy;
  }

  irAHoy(): void {
    this.fechaInicio = new Date();
    this.generarDiasSemana();
  }

  irAManana(): void {
    this.fechaInicio = new Date();
    this.fechaInicio.setDate(this.fechaInicio.getDate() + 1);
    this.generarDiasSemana();
  }

  irAProximaSemana(): void {
    this.fechaInicio = new Date();
    this.fechaInicio.setDate(this.fechaInicio.getDate() + 7);
    this.generarDiasSemana();
  }

  esFechaSeleccionada(dia: FechaSeleccionada): boolean {
    return this.fechaSeleccionada === dia.fecha;
  }

  esHoy(dia: FechaSeleccionada): boolean {
    const hoy = this.formatearFechaISO(new Date());
    return dia.fecha === hoy;
  }

  esFechaDisponible(fecha: string): boolean {
    // Si no se proporcionaron fechas disponibles, todas están disponibles
    if (this.fechasDisponibles.length === 0) {
      return true;
    }
    return this.fechasDisponibles.includes(fecha);
  }

  getDiaNumero(fecha: string): string {
    return new Date(fecha).getDate().toString();
  }

  getMesCorto(fecha: string): string {
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 
                   'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[new Date(fecha).getMonth()];
  }

  actualizarMesAnio(): void {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const primerDia = new Date(this.diasSemana[0].fecha);
    const ultimoDia = new Date(this.diasSemana[6].fecha);
    
    if (primerDia.getMonth() === ultimoDia.getMonth()) {
      this.mesAnioActual = `${meses[primerDia.getMonth()]} ${primerDia.getFullYear()}`;
    } else {
      this.mesAnioActual = `${meses[primerDia.getMonth()]} - ${meses[ultimoDia.getMonth()]} ${primerDia.getFullYear()}`;
    }
  }

  formatearFechaISO(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
