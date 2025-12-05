import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    NgbModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {

  title = 'estudio-juridico';
  vistaActual: string = 'inicio';

  mostrarVista(vista: string) {
    this.vistaActual = vista;
    window.scrollTo(0, 0);
  }
}