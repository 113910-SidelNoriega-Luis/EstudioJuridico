import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ConsultasService } from '../services/consultas.service';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas.html',
  styleUrl: './consultas.css'
})
export class Consultas {

  // modelo del formulario
  form = {
    nombre: '',
    correo: '',
    celular: '',
    consulta: ''
  };

  enviando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(private consultasService: ConsultasService) {}

  onSubmit(formRef: NgForm): void {
    if (formRef.invalid) {
      this.mensajeError = 'Por favor completa todos los campos.';
      this.mensajeExito = '';
      return;
    }

    this.enviando = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    this.consultasService.enviarConsulta(this.form).subscribe({
      next: () => {
        this.mensajeExito = '✅ Tu consulta fue enviada correctamente. Te contactaremos a la brevedad.';
        this.mensajeError = '';
        this.enviando = false;
        formRef.resetForm(); // limpia el formulario
      },
      error: (err) => {
        console.error('Error al enviar consulta', err);
        this.mensajeError = '⚠️ Ocurrió un error al enviar la consulta. Inténtalo nuevamente.';
        this.mensajeExito = '';
        this.enviando = false;
      }
    });
  }
}
