import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnoService } from '../../services/turno.service';
import { CasoService } from '../../services/caso.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container min-vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="mb-4">
          <div class="success-icon">✅</div>
        </div>

        <h1 class="mb-3 text-success">¡Pago Exitoso!</h1>
        <p class="lead mb-4">Tu pago ha sido procesado correctamente.</p>

        <div class="card mb-4" style="max-width: 500px; margin: 0 auto;">
          <div class="card-body">
            <p class="mb-2" *ngIf="paymentId"><strong>ID de Pago:</strong> {{ paymentId }}</p>
            <p class="mb-2" *ngIf="externalReference">
              <strong>Referencia:</strong> {{ externalReference }}
            </p>
            <p class="mb-2" *ngIf="casoId"><strong>Caso ID:</strong> {{ casoId }}</p>
            <p class="mb-2" *ngIf="turnoId"><strong>Turno ID:</strong> {{ turnoId }}</p>
            <p class="mb-0">
              <strong>Estado:</strong> <span class="badge bg-success">Aprobado</span>
            </p>
          </div>
        </div>

        <!-- Mensaje de actualización -->
        <div
          class="alert alert-info mb-4"
          style="max-width: 500px; margin: 0 auto;"
          *ngIf="actualizando"
        >
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          Actualizando estado del {{ tipoPago }}...
        </div>

        <div
          class="alert alert-success mb-4"
          style="max-width: 500px; margin: 0 auto;"
          *ngIf="actualizado"
        >
          ✅ Tu {{ tipoPago }} ha sido marcado como pagado correctamente.
        </div>

        <div class="d-flex gap-3 justify-content-center">
          <button class="btn btn-primary btn-lg" (click)="irAPrincipal()">
            {{ isCaso ? '📁 Ver Mis Casos' : '📅 Ver Mis Turnos' }}
          </button>
          <button class="btn btn-outline-secondary btn-lg" (click)="volverAlInicio()">
            🏠 Volver al Inicio
          </button>
        </div>

        <p class="text-muted mt-4 small">Redirigiendo en {{ countdown }} segundos...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .success-icon {
        font-size: 5rem;
        animation: scaleIn 0.5s ease-out;
      }

      @keyframes scaleIn {
        from {
          transform: scale(0);
        }
        to {
          transform: scale(1);
        }
      }
    `,
  ],
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  externalReference: string | null = null;
  casoId: string | null = null;
  turnoId: string | null = null;
  isCaso: boolean = false;
  tipoPago: string = '';
  countdown: number = 10;
  actualizando: boolean = false;
  actualizado: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turnoService: TurnoService,
    private casoService: CasoService,
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      this.paymentId = params['payment_id'] || params['paymentId'];
      this.externalReference = params['external_reference'] || params['externalReference'];
      this.casoId = params['caso_id'] || params['casoId'];

      console.log('✅ Pago exitoso recibido');
      console.log('Payment ID:', this.paymentId);
      console.log('External Reference:', this.externalReference);
      console.log('Caso ID:', this.casoId);

      // Determinar si es un caso o un turno
      if (this.casoId) {
        this.isCaso = true;
        this.tipoPago = 'caso';
        console.log('Tipo: Caso');

        // Marcar el caso como pagado
        if (this.paymentId) {
          this.marcarCasoPagado();
        }
      } else if (this.externalReference) {
        this.isCaso = false;
        this.tipoPago = 'turno';
        this.turnoId = this.extractTurnoId(this.externalReference);
        console.log('Tipo: Turno');
        console.log('Turno ID extraído:', this.turnoId);

        // Marcar el turno como pagado
        if (this.turnoId && this.paymentId) {
          this.marcarTurnoPagado();
        }
      }
    });

    // Countdown para redirección automática
    this.startCountdown();
  }

  /**
   * Extrae el ID del turno de la external reference
   * Formato esperado: "TURNO-001-20241207120000" → "TURNO-001"
   * O formato: "1-20241207120000" → "1"
   */
  extractTurnoId(externalReference: string): string {
    // Si tiene formato con timestamp, extraer la primera parte
    const parts = externalReference.split('-');

    if (parts.length >= 2) {
      // Verificar si la primera parte es numérica (ID directo)
      if (!isNaN(Number(parts[0]))) {
        return parts[0];
      }
      // O devolver la primera y segunda parte (ej: "TURNO-001")
      return `${parts[0]}-${parts[1]}`;
    }

    // Si no tiene guiones, asumir que es el ID completo
    return externalReference;
  }

  /**
   * Marca el caso como pagado (simulado)
   */
  marcarCasoPagado() {
    this.actualizando = true;

    // Simular actualización exitosa
    setTimeout(() => {
      console.log('✅ Pago confirmado exitosamente');
      this.actualizando = false;
      this.actualizado = true;
    }, 500);
  }

  /**
   * Marca el turno como pagado en el backend
   */
  marcarTurnoPagado() {
    this.actualizando = true;

    this.turnoService
      .marcarTurnoPagado(this.turnoId!, this.paymentId!, this.externalReference!)
      .subscribe({
        next: (response) => {
          console.log('✅ Turno marcado como pagado:', response);
          this.actualizando = false;
          this.actualizado = true;
        },
        error: (error) => {
          console.error('❌ Error al marcar turno como pagado:', error);
          this.actualizando = false;
          // Continuar de todos modos, el webhook lo procesará
        },
      });
  }

  startCountdown() {
    const interval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.irAPrincipal();
      }
    }, 1000);
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  irAPrincipal() {
    if (this.isCaso) {
      this.router.navigate(['/panel-cliente/casos']);
    } else {
      this.router.navigate(['/panel-cliente/turnos']);
    }
  }
}
