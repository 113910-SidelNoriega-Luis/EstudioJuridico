
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container min-vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="mb-4">
          <div class="failure-icon">❌</div>
        </div>
        
        <h1 class="mb-3">Pago Rechazado</h1>
        <p class="lead mb-4">No pudimos procesar tu pago.</p>
        
        <div class="alert alert-danger mb-4">
          <p class="mb-2"><strong>Posibles causas:</strong></p>
          <ul class="text-start mb-0" style="max-width: 400px; margin: 0 auto;">
            <li>Fondos insuficientes</li>
            <li>Datos de tarjeta incorrectos</li>
            <li>Límite de compra excedido</li>
          </ul>
        </div>
        
        <div class="d-flex gap-3 justify-content-center">
          <button class="btn btn-primary btn-lg" (click)="reintentar()">
            Reintentar Pago
          </button>
          <button class="btn btn-outline-secondary btn-lg" (click)="volverACasos()">
            Volver a Mis Casos
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .failure-icon {
      font-size: 5rem;
      animation: shake 0.5s;
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  `]
})
export class PaymentFailureComponent {
  constructor(private router: Router) {}
  
  volverACasos() {
    this.router.navigate(['/panel-cliente/casos']);
  }
  
  reintentar() {
    // Volver al detalle del caso para que pueda intentar pagar nuevamente
    this.router.navigate(['/panel-cliente/casos']);
  }
}
