import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-reporte',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reporte.html',
  styleUrls: ['./crear-reporte.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'crear-reporte-container',
  },
})
export class CrearReporteComponent {
  cerrado = output<void>();

  tipoReporte = '';
  titulo = '';
  descripcion = '';
  autor = '';

  tipos: Array<'casos' | 'clientes' | 'finanzas' | 'general'> = [
    'casos',
    'clientes',
    'finanzas',
    'general',
  ];

  guardar() {
    if (this.validarFormulario()) {
      this.limpiarFormulario();
      this.cerrado.emit();
    }
  }

  cancelar() {
    this.limpiarFormulario();
    this.cerrado.emit();
  }

  validarFormulario(): boolean {
    return (
      this.titulo.trim() !== '' &&
      this.descripcion.trim() !== '' &&
      this.tipoReporte !== '' &&
      this.autor.trim() !== ''
    );
  }

  private limpiarFormulario() {
    this.titulo = '';
    this.descripcion = '';
    this.tipoReporte = '';
    this.autor = '';
  }
}
