import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Consultas } from '../consultas/consultas';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule,
    NgbModule,
    Consultas
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio {

}
