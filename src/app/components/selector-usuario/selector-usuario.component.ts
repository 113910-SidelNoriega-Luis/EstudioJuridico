import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-selector-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">🎭 Selector de Usuario (Demo)</h4>
            </div>
            <div class="card-body">
              <p class="text-muted">
                Seleccione el tipo de usuario para acceder al sistema:
              </p>

              <div class="row mt-4">
                <div class="col-md-6 mb-3">
                  <div 
                    class="user-card asesor" 
                    [class.selected]="tipoSeleccionado === 'asesor'"
                    (click)="seleccionarUsuario('asesor')">
                    <div class="user-icon">👨‍💼</div>
                    <h5>Asesor Legal</h5>
                    <p class="small mb-0">Dr. María González</p>
                    <p class="small text-muted">Doc: 87654321</p>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div 
                    class="user-card cliente" 
                    [class.selected]="tipoSeleccionado === 'cliente'"
                    (click)="seleccionarUsuario('cliente')">
                    <div class="user-icon">👤</div>
                    <h5>Cliente</h5>
                    <p class="small mb-0">Juan Pérez</p>
                    <p class="small text-muted">Doc: 12345678</p>
                  </div>
                </div>
              </div>

              <button 
                class="btn btn-primary w-100 btn-lg mt-3"
                (click)="ingresar()"
                [disabled]="!tipoSeleccionado">
                Ingresar al Sistema
              </button>

              <div class="alert alert-info mt-4" *ngIf="tipoSeleccionado">
                <small>
                  <strong>Acceso como:</strong> 
                  {{ tipoSeleccionado === 'asesor' ? 'Dr. María González (Asesor)' : 'Juan Pérez (Cliente)' }}
                </small>
              </div>
            </div>
          </div>

          <!-- Instrucciones para la demo -->
          <div class="card mt-4">
            <div class="card-header bg-secondary text-white">
              <h6 class="mb-0">📝 Instrucciones para la Demo</h6>
            </div>
            <div class="card-body">
              <h6>Como Asesor:</h6>
              <ol class="small">
                <li>Subir un documento al caso</li>
                <li>Eliminar el documento</li>
                <li>Agregar una plantilla</li>
                <li>Habilitar el pago</li>
              </ol>

              <h6 class="mt-3">Como Cliente:</h6>
              <ol class="small">
                <li>Ver el caso</li>
                <li>Hacer clic en "Pagar $50.000"</li>
                <li>Confirmar pago con Mercado Pago</li>
                <li>Ver el caso como "Pagado"</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-card {
      border: 2px solid #dee2e6;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: white;
    }

    .user-card:hover {
      border-color: #0d6efd;
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .user-card.selected {
      border-color: #0d6efd;
      background: #e7f1ff;
      border-width: 3px;
    }

    .user-card.asesor.selected {
      border-color: #198754;
      background: #d1e7dd;
    }

    .user-card.cliente.selected {
      border-color: #0d6efd;
      background: #cfe2ff;
    }

    .user-icon {
      font-size: 4rem;
      margin-bottom: 15px;
    }

    .user-card h5 {
      margin-bottom: 10px;
      font-weight: 700;
    }
  `]
})
export class SelectorUsuarioComponent {
  
  tipoSeleccionado: 'asesor' | 'cliente' | null = null;

  constructor(private router: Router) {}

  seleccionarUsuario(tipo: 'asesor' | 'cliente') {
    this.tipoSeleccionado = tipo;
  }

  ingresar() {
    if (!this.tipoSeleccionado) return;

    // Guardar en localStorage
    localStorage.setItem('tipoUsuario', this.tipoSeleccionado);

    // Navegar al caso
    if (this.tipoSeleccionado === 'asesor') {
      this.router.navigate(['/asesor/casos/1']);
    } else {
      this.router.navigate(['/cliente/casos/1']);
    }
  }
}
