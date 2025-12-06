import { CommonModule } from '@angular/common';
import { Component, inject} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-root',
  imports: [CommonModule, NgbModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private router: Router) {}

  get isPanel(): boolean {
    return this.router.url.startsWith('/panel-asesor')
        || this.router.url.startsWith('/panel-cliente');
  }

  title = 'estudio-juridico';
  vistaActual: string = 'inicio';

  mostrarVista(vista: string) {
    this.vistaActual = vista;
    window.scrollTo(0, 0);
  }
}
