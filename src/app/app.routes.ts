import { Routes } from '@angular/router';
import { App } from './app';
import { CasoDetalleClienteComponent } from './panel-cliente/caso-detalle-cliente';
import { Login } from './auth/login/login';
import { Home } from './home/home';
import { Turnos } from './cliente/turnos/turnos';
import { Consultas } from './cliente/consultas/consultas';
import { Inicio } from './inicio/inicio';
import { PanelAsesorComponent } from './panel-asesor/panel-asesor';
import { Documentos } from './cliente/documentos/documentos';
import { DocumentosAsesorComponent } from './panel-asesor/documentos/documentos-asesor';
import { CasoDetalleComponent } from './components/caso-detalle/caso-detalle';
import { SelectorUsuarioComponent } from './components/selector-usuario/selector-usuario.component';
import { MisCasosComponent } from './cliente/mis-casos/mis-casos';
import { CasosAsesorComponent } from './panel-asesor/casos-asesor/casos-asesor';
import { CasoDetalleAsesorComponent } from './panel-asesor/caso-detalle-asesor/caso-detalle-asesor-actualizado';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { PaymentPendingComponent } from './components/payment-pending/payment-components';
import { PaymentFailureComponent } from './components/payment-failure/payment-components';

export const routes: Routes = [
  // Ruta raíz - redirige al inicio o login
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },

  // Rutas públicas
  { path: 'inicio', component: /* HomeComponent */ Inicio }, // Temporal
  { path: 'login', component: Login },
  { path: 'registro', component: Login },

  // Rutas del Cliente
  { path: 'panel-cliente', component: Home },
  { path: 'panel-cliente/dashboard', component: Home },
  { path: 'panel-cliente/turnos', component: Turnos },
  { path: 'panel-cliente/consultas', component: Consultas },
  { path: 'panel-cliente/caso/:id', component: CasoDetalleComponent }, // ✅ RUTA AGREGADA
  { path: 'panel-cliente/documentos', component: Documentos },
  { path: 'panel-cliente/casos', component: CasoDetalleClienteComponent },
  { path: 'panel-cliente/mis-casos', component: CasoDetalleClienteComponent },

  // En el array de rutas:
{ path: 'payment/success', component: PaymentSuccessComponent },
{ path: 'payment/pending', component: PaymentPendingComponent },
{ path: 'payment/failure', component: PaymentFailureComponent },

  // RUTAS DEL PANEL ASESOR
  {
    path: 'panel-asesor',
    component: PanelAsesorComponent,
    children: [
      {
        path: 'casos',
        component: CasosAsesorComponent,
      },
      {
        path: 'caso/:id',
        component: CasoDetalleAsesorComponent,
      },
    ],
  },

  // Rutas del Asesor (para más adelante)
  { path: 'panel-asesor/documentos', component: DocumentosAsesorComponent },

  // Rutas para asesor
  {
    path: 'asesor/casos/:id',
    component: CasoDetalleComponent,
  },

  // Rutas para cliente
  {
    path: 'cliente/casos/:id',
    component: CasoDetalleComponent,
  },

  // Pantalla inicial (selector de usuario)
  {
    path: 'selector',
    component: SelectorUsuarioComponent,
  },

  // Ruta 404
  { path: '**', redirectTo: '/inicio' },
];

export class AppComponent {}
