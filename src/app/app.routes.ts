import { Routes } from '@angular/router';
import { App } from './app';
import { Login } from './auth/login/login';
import { Home } from './home/home';
import { Turnos } from './cliente/turnos/turnos';
import { Consultas } from './cliente/consultas/consultas';
import { Casos } from './cliente/casos/casos';
import { Inicio } from './inicio/inicio';
import { PanelAsesorComponent } from './panel-asesor/panel-asesor';

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
  { path: 'panel-cliente/casos', component: Casos },
  // { path: 'panel-cliente/documentos', component: DocumentosComponent }

  // Rutas del Asesor (para más adelante)
  { path: 'panel-asesor', component: PanelAsesorComponent },
  
  // Ruta 404
  { path: '**', redirectTo: '/inicio' }
];

export class AppComponent {
}

