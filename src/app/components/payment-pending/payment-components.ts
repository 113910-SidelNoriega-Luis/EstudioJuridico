// payment-pending.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-pending',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container min-vh-100 d-flex align-items-center justify-content-center">
      <div class="text-center">
        <div class="mb-4">
          <div class="pending-icon">⏳</div>
        </div>
        
        <h1 class="mb-3">Pago Pendiente</h1>
        <p class="lead mb-4">Tu pago está siendo procesado.</p>
        
        <div class="alert alert-warning mb-4">
          <p class="mb-0">Te notificaremos cuando se confirme el pago.</p>
        </div>
        
        <button class="btn btn-primary btn-lg" (click)="volverACasos()">
          Volver a Mis Casos
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pending-icon {
      font-size: 5rem;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class PaymentPendingComponent {
  constructor(private router: Router) {}
  
  volverACasos() {
    this.router.navigate(['/panel-cliente/casos']);
  }
}

