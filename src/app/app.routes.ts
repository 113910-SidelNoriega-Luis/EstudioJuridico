import { Routes } from '@angular/router';
import { App } from './app';
import { Login } from './auth/login/login';
import { Home } from './home/home';
import { Turnos } from './cliente/turnos/turnos';
import { Consultas } from './cliente/consultas/consultas';
import { Casos } from './cliente/casos/casos';
import { Inicio } from './inicio/inicio';
import { PanelAsesorComponent } from './panel-asesor/panel-asesor';
import { Documentos } from './cliente/documentos/documentos';
import { DocumentosAsesorComponent } from './panel-asesor/documentos/documentos-asesor';
import { CasoDetalleComponent} from './components/caso-detalle/caso-detalle';
import { PaymentSuccessComponent } from './components/payment-success/payment-success.component';
import { SelectorUsuarioComponent } from './components/selector-usuario/selector-usuario.component';
import { MisCasosComponent } from './cliente/mis-casos/mis-casos';


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
  { path: 'panel-cliente/casos', component: MisCasosComponent },
  { path: 'panel-cliente/documentos', component: Documentos },
  { path: 'panel-cliente/mis-casos', component: MisCasosComponent },

  // Rutas del Asesor (para más adelante)
  { path: 'panel-asesor', component: PanelAsesorComponent },
  { path: 'panel-asesor/documentos', component: DocumentosAsesorComponent },
  
  // Ruta 404
  { path: '**', redirectTo: '/inicio' },

   // Pantalla inicial (selector de usuario)
  {
    path: '',
    component: SelectorUsuarioComponent
  },
  
  // Rutas para asesor
  {
    path: 'asesor/casos/:id',
    component: CasoDetalleComponent
  },
  
  // Rutas para cliente
  {
    path: 'cliente/casos/:id',
    component: CasoDetalleComponent
  },

  // Confirmación de pago
  {
    path: 'payment/success',
    component: PaymentSuccessComponent
  },

  // Redirect default
  {
    path: '**',
    redirectTo: ''
  }
];

export class AppComponent {
}

