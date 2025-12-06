import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CasosService } from '../../services/casos.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card text-center payment-success-card">
            <div class="card-body p-5">
              <div class="success-icon mb-4">
                ✅
              </div>
              <h1 class="text-success mb-3">¡Pago Exitoso!</h1>
              <p class="lead mb-4">Su pago ha sido procesado correctamente</p>
              
              <div class="payment-details mb-4">
                <div class="detail-item" *ngIf="paymentId">
                  <span class="label">ID de Pago:</span>
                  <span class="value">{{ paymentId }}</span>
                </div>
                <div class="detail-item" *ngIf="externalReference">
                  <span class="label">Referencia:</span>
                  <span class="value">{{ externalReference }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">Monto:</span>
                  <span class="value text-success">$50.000</span>
                </div>
              </div>

              <div class="alert alert-info">
                <strong>📧 Confirmación enviada</strong>
                <p class="mb-0 mt-2">Recibirá un email con los detalles del pago</p>
              </div>

              <button class="btn btn-primary btn-lg w-100 mt-3" (click)="volverAlCaso()">
                Ver Mi Caso
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-success-card {
      border: none;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-radius: 12px;
    }

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

    .payment-details {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #dee2e6;
    }

    .detail-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }

    .detail-item .label {
      color: #6c757d;
      font-weight: 500;
    }

    .detail-item .value {
      font-weight: 700;
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  
  casoId: number = 0;
  paymentId: string = '';
  externalReference: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casosService: CasosService
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['payment_id'] || '';
      this.externalReference = params['external_reference'] || '';
      const preference_id = params['preference_id'];

      // Extraer ID del caso desde external_reference: "CASO-1"
      if (this.externalReference) {
        const match = this.externalReference.match(/CASO-(\d+)/);
        if (match) {
          this.casoId = parseInt(match[1]);
          
          // Marcar el caso como pagado
          this.casosService.marcarComoPagado(this.casoId, this.paymentId);
        }
      }

      console.log('Pago exitoso:', {
        paymentId: this.paymentId,
        externalReference: this.externalReference,
        casoId: this.casoId
      });
    });
  }

  volverAlCaso() {
    if (this.casoId) {
      this.router.navigate(['/cliente/casos', this.casoId]);
    } else {
      this.router.navigate(['/cliente/casos']);
    }
  }
}
