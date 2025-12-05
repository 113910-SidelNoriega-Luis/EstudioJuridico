import { Component, OnInit } from '@angular/core';
declare var bootstrap: any; // Para usar modals de Bootstrap

interface Turno {
  id: number;
  fecha: string;
  fechaTexto: string;
  hora: string;
  horaFin: string;
  cliente: string;
  email: string;
  telefono: string;
  motivo: string;
}

interface Dia {
  nombre: string;
  fecha: string;
}
@Component({
  selector: 'app-agenda',
  imports: [],
  templateUrl: './agenda.html',
  styleUrl: './agenda.css',
})
export class Agenda implements OnInit {

   turnos: Turno[] = [
    {
      id: 1,
      fecha: '2024-11-12',
      fechaTexto: 'Mié 12/11',
      hora: '19:00',
      horaFin: '19:30',
      cliente: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '351-123-4567',
      motivo: 'Consulta sobre derecho laboral'
    },
    {
      id: 2,
      fecha: '2024-11-13',
      fechaTexto: 'Jue 13/11',
      hora: '20:00',
      horaFin: '20:30',
      cliente: 'María González',
      email: 'maria.gonzalez@email.com',
      telefono: '351-987-6543',
      motivo: 'Asesoramiento civil'
    }
  ];

  turnoSeleccionadoActual: HTMLElement | null = null;
  turnoActualData: any = null;

  horarios: string[] = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
  dias: Dia[] = [
    { nombre: 'Lun 10/11', fecha: '2024-11-10' },
    { nombre: 'Mar 11/11', fecha: '2024-11-11' },
    { nombre: 'Mié 12/11', fecha: '2024-11-12' },
    { nombre: 'Jue 13/11', fecha: '2024-11-13' },
    { nombre: 'Vie 14/11', fecha: '2024-11-14' },
    { nombre: 'Sáb 15/11', fecha: '2024-11-15' },
    { nombre: 'Dom 16/11', fecha: '2024-11-16' }
  ];

  ngOnInit() {
    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
      this.generarTabla();
      this.mostrarMisTurnos();
    }, 100);
  }

  generarTabla() {
    const tbody = document.getElementById('tablaTurnos');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    this.horarios.forEach(hora => {
      const tr = document.createElement('tr');
      
      // Columna de hora
      const tdHora = document.createElement('td');
      tdHora.className = 'time-column';
      tdHora.textContent = hora;
      tr.appendChild(tdHora);

      // Columnas de días
      this.dias.forEach(dia => {
        const td = document.createElement('td');
        const turnoExiste = this.turnos.find(t => t.fecha === dia.fecha && t.hora === hora);
        
        if (turnoExiste) {
          td.className = 'time-slot ocupado';
          td.textContent = 'Ocupado';
          td.onclick = () => this.verDetallesTurno(turnoExiste);
        } else {
          td.className = 'time-slot disponible';
          td.textContent = 'Disponible';
          td.onclick = () => this.seleccionarTurno(td, dia.nombre, dia.fecha, hora);
        }
        
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  seleccionarTurno(elemento: HTMLElement, fechaTexto: string, fecha: string, hora: string) {
    // Remover selección anterior
    if (this.turnoSeleccionadoActual) {
      this.turnoSeleccionadoActual.classList.remove('seleccionado');
      this.turnoSeleccionadoActual.classList.add('disponible');
      this.turnoSeleccionadoActual.textContent = 'Disponible';
    }

    // Marcar nuevo turno seleccionado
    elemento.classList.remove('disponible');
    elemento.classList.add('seleccionado');
    elemento.textContent = 'Seleccionado';
    this.turnoSeleccionadoActual = elemento;
    this.turnoActualData = { fechaTexto, fecha, hora };

    // Mostrar información del turno
    const divTurnoSeleccionado = document.getElementById('turnoSeleccionado');
    const infoTurno = document.getElementById('infoTurno');
    const confirmarInfo = document.getElementById('confirmarInfo');
    
    if (divTurnoSeleccionado) divTurnoSeleccionado.style.display = 'block';
    if (infoTurno) infoTurno.innerHTML = `<strong>${fechaTexto}</strong> a las <strong>${hora} hs</strong>`;
    if (confirmarInfo) confirmarInfo.innerHTML = `Está por reservar el turno del <strong>${fechaTexto}</strong> a las <strong>${hora} hs</strong>`;
  }

  confirmarReserva() {
    const nombre = (document.getElementById('nombreCliente') as HTMLInputElement)?.value;
    const email = (document.getElementById('emailCliente') as HTMLInputElement)?.value;
    const telefono = (document.getElementById('telefonoCliente') as HTMLInputElement)?.value;
    const motivo = (document.getElementById('motivoConsulta') as HTMLTextAreaElement)?.value;

    if (!nombre || !email || !telefono) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Calcular hora de fin
    const [h, m] = this.turnoActualData.hora.split(':');
    const horaFin = `${h}:${(parseInt(m) + 30).toString().padStart(2, '0')}`;

    // Agregar turno a la base de datos simulada
    const nuevoTurno: Turno = {
      id: this.turnos.length + 1,
      fecha: this.turnoActualData.fecha,
      fechaTexto: this.turnoActualData.fechaTexto,
      hora: this.turnoActualData.hora,
      horaFin: horaFin,
      cliente: nombre,
      email: email,
      telefono: telefono,
      motivo: motivo || 'Sin especificar'
    };

    this.turnos.push(nuevoTurno);

    alert('¡Turno confirmado exitosamente! Recibirá un email de confirmación.');
    
    // Cerrar modal
    const modalElement = document.getElementById('confirmarTurnoModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    // Limpiar formulario
    const form = document.getElementById('formTurno') as HTMLFormElement;
    if (form) form.reset();

    // Regenerar tabla
    this.generarTabla();
    this.mostrarMisTurnos();

    // Ocultar panel de turno seleccionado
    const divTurnoSeleccionado = document.getElementById('turnoSeleccionado');
    if (divTurnoSeleccionado) divTurnoSeleccionado.style.display = 'none';
    this.turnoSeleccionadoActual = null;
  }

  verDetallesTurno(turno: Turno) {
    const body = document.getElementById('detallesTurnoBody');
    if (!body) return;

    body.innerHTML = `
      <div class="mb-3">
        <strong>Fecha:</strong> ${turno.fechaTexto}<br>
        <strong>Horario:</strong> ${turno.hora} - ${turno.horaFin}<br>
        <strong>Cliente:</strong> ${turno.cliente}<br>
        <strong>Email:</strong> ${turno.email}<br>
        <strong>Teléfono:</strong> ${turno.telefono}<br>
        <strong>Motivo:</strong> ${turno.motivo}
      </div>
    `;
    
    this.turnoActualData = turno;
    const modalElement = document.getElementById('detallesTurnoModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  cancelarTurno() {
    if (confirm('¿Está seguro que desea cancelar este turno?')) {
      this.turnos = this.turnos.filter(t => t.id !== this.turnoActualData.id);
      
      const modalElement = document.getElementById('detallesTurnoModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
      
      this.generarTabla();
      this.mostrarMisTurnos();
      
      alert('Turno cancelado exitosamente');
    }
  }

  mostrarMisTurnos() {
    const container = document.getElementById('listaTurnos');
    if (!container) return;
    
    if (this.turnos.length === 0) {
      container.innerHTML = '<div class="col-12"><div class="alert alert-info">No tienes turnos agendados</div></div>';
      return;
    }

    const meses = ['', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    container.innerHTML = this.turnos.map(turno => {
      const [dia, mes] = turno.fechaTexto.split(' ')[1].split('/');
      
      return `
        <div class="col-md-6 mb-3">
          <div class="card turno-card">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <div class="d-flex gap-3">
                  <div class="calendar-icon">
                    <div class="calendar-day">${dia}</div>
                    <div class="calendar-month">${meses[parseInt(mes)]}</div>
                  </div>
                  <div>
                    <h6 class="mb-1">${turno.fechaTexto}</h6>
                    <p class="mb-1"><strong>${turno.hora} - ${turno.horaFin}</strong></p>
                    <p class="mb-0 text-muted small">${turno.motivo}</p>
                  </div>
                </div>
                <a href="#" class="ver-detalles" onclick="event.preventDefault();">
                  Ver<br>Detalles ▼
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
}

// Funciones globales para los onclick en HTML
(window as any).confirmarReserva = function() {
  // Esta función se llama desde el HTML
  // Necesitas acceder a la instancia del componente
  console.log('Confirmar reserva desde HTML');
};

(window as any).cancelarTurno = function() {
  console.log('Cancelar turno desde HTML');
};

