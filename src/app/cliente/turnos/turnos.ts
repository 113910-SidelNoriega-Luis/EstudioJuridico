import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, Usuario } from '../../auth/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { SelectorFechaComponent , FechaSeleccionada} from '../../components/selector-fecha.component';

interface Turno {
  id: number;
  fecha: string;
  hora: string;
  horaFin: string;
  motivo: string;
  descripcion?: string;
  asesor: string;
  estado: 'confirmado' | 'pendiente' | 'cancelado' | 'completado';
}

interface SlotHorario {
  fecha: string;
  fechaTexto: string;
  hora: string;
  disponible: boolean;
}

interface DiaAgenda {
  nombre: string;
  fecha: string;
}

@Component({
  selector: 'app-turnos-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule, SelectorFechaComponent],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css']
})
export class Turnos implements OnInit {
  
  usuario: Usuario | null = null;
  
  // Tabs
  tabActivo: 'agendar' | 'misturnos' | 'historial' = 'agendar';

  // Selector de fechas
  fechaSeleccionadaCalendario: FechaSeleccionada | null = null;
  fechasConTurnos: string[] = []; // Fechas que tienen turnos disponibles
  mostrarSelectorFecha: boolean = true;

  // Datos de la agenda
  horarios: string[] = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
  
  dias: DiaAgenda[] = [
    { nombre: 'Lun 25/11', fecha: '2024-11-25' },
    { nombre: 'Mar 26/11', fecha: '2024-11-26' },
    { nombre: 'Mié 27/11', fecha: '2024-11-27' },
    { nombre: 'Jue 28/11', fecha: '2024-11-28' },
    { nombre: 'Vie 29/11', fecha: '2024-11-29' },
    { nombre: 'Sáb 30/11', fecha: '2024-11-30' }
  ];

  agendaSlots: { [hora: string]: SlotHorario[] } = {};

  turnosOcupados: { fecha: string; hora: string }[] = [
    { fecha: '2024-11-25', hora: '19:30' },
    { fecha: '2024-11-26', hora: '20:00' },
    { fecha: '2024-11-27', hora: '19:00' }
  ];

  // Turno seleccionado
  turnoSeleccionado: {
    fechaTexto: string;
    fecha: string;
    hora: string;
    horaFin: string;
  } | null = null;

  // Formulario de confirmación
  motivoSeleccionado: string = '';
  descripcionTurno: string = '';

  motivosDisponibles = [
    { value: 'laboral', label: 'Derecho Laboral' },
    { value: 'civil', label: 'Derecho Civil' },
    { value: 'penal', label: 'Derecho Penal' },
    { value: 'familiar', label: 'Derecho Familiar' },
    { value: 'comercial', label: 'Derecho Comercial' },
    { value: 'otro', label: 'Otro' }
  ];

  // Mis turnos
  proximosTurnos: Turno[] = [
    {
      id: 1,
      fecha: '2024-11-15',
      hora: '19:00',
      horaFin: '19:30',
      motivo: 'Consulta Inicial - Derecho Laboral',
      asesor: 'Dra. María González',
      estado: 'confirmado'
    },
    {
      id: 2,
      fecha: '2024-11-18',
      hora: '20:30',
      horaFin: '21:00',
      motivo: 'Seguimiento - Caso Civil',
      asesor: 'Dr. Carlos Rodríguez',
      estado: 'confirmado'
    },
    {
      id: 3,
      fecha: '2024-11-20',
      hora: '19:30',
      horaFin: '20:00',
      motivo: 'Revisión de Documentos',
      asesor: 'Dra. María González',
      estado: 'pendiente'
    }
  ];

  // Historial de turnos
  historialTurnos: Turno[] = [
    {
      id: 4,
      fecha: '2024-11-10',
      hora: '19:00',
      horaFin: '19:30',
      motivo: 'Consulta General',
      asesor: 'Dra. María González',
      estado: 'completado'
    },
    {
      id: 5,
      fecha: '2024-11-05',
      hora: '20:00',
      horaFin: '20:30',
      motivo: 'Primera Consulta',
      descripcion: 'Cancelado por el cliente',
      asesor: 'Dra. María González',
      estado: 'cancelado'
    }
  ];

  // Modal
  mostrarModal: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
    
    if (!this.usuario || !this.authService.esCliente()) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.generarAgenda();
    this.generarFechasDisponibles();
  }

  /**
   * Genera la lista de fechas que tienen turnos disponibles
   */
  generarFechasDisponibles(): void {
    // Generar fechas para los próximos 30 días
    this.fechasConTurnos = [];
    const hoy = new Date();
    
    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      
      // Excluir domingos (día 0)
      if (fecha.getDay() !== 0) {
        const fechaISO = this.formatearFechaISO(fecha);
        
        // Verificar que no sea un día completamente ocupado
        const turnosOcupadosEnFecha = this.turnosOcupados.filter(t => t.fecha === fechaISO).length;
        if (turnosOcupadosEnFecha < this.horarios.length) {
          this.fechasConTurnos.push(fechaISO);
        }
      }
    }
  }

  formatearFechaISO(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generarAgenda(): void {
    this.agendaSlots = {};

    this.horarios.forEach(hora => {
      this.agendaSlots[hora] = this.dias.map(dia => {
        const ocupado = this.turnosOcupados.find(
          t => t.fecha === dia.fecha && t.hora === hora
        );

        return {
          fecha: dia.fecha,
          fechaTexto: dia.nombre,
          hora: hora,
          disponible: !ocupado
        };
      });
    });
  }

  cambiarTab(tab: 'agendar' | 'misturnos' | 'historial'): void {
    this.tabActivo = tab;
  }

  seleccionarTurno(slot: SlotHorario): void {
    if (!slot.disponible) {
      return;
    }

    // Limpiar selección anterior
    this.turnoSeleccionado = null;

    // Seleccionar nuevo turno
    this.turnoSeleccionado = {
      fechaTexto: slot.fechaTexto,
      fecha: slot.fecha,
      hora: slot.hora,
      horaFin: this.calcularHoraFin(slot.hora)
    };
  }

  calcularHoraFin(horaInicio: string): string {
    const [h, m] = horaInicio.split(':');
    const minutos = parseInt(m) + 30;
    if (minutos >= 60) {
      const nuevaHora = parseInt(h) + 1;
      return `${nuevaHora}:${(minutos - 60).toString().padStart(2, '0')}`;
    }
    return `${h}:${minutos.toString().padStart(2, '0')}`;
  }

  abrirModalConfirmar(): void {
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.motivoSeleccionado = '';
    this.descripcionTurno = '';
  }

  confirmarTurno(): void {
    if (!this.motivoSeleccionado) {
      alert('Por favor selecciona el motivo de la consulta');
      return;
    }

    if (!this.turnoSeleccionado) {
      alert('No has seleccionado ningún turno');
      return;
    }

    // Agregar a turnos ocupados
    this.turnosOcupados.push({
      fecha: this.turnoSeleccionado.fecha,
      hora: this.turnoSeleccionado.hora
    });

    // Crear objeto del turno
    const nuevoTurno: Turno = {
      id: Date.now(),
      fecha: this.turnoSeleccionado.fecha,
      hora: this.turnoSeleccionado.hora,
      horaFin: this.turnoSeleccionado.horaFin,
      motivo: this.motivosDisponibles.find(m => m.value === this.motivoSeleccionado)?.label || '',
      descripcion: this.descripcionTurno,
      asesor: 'Por asignar',
      estado: 'pendiente'
    };

    this.proximosTurnos.push(nuevoTurno);

    // Enviar email de confirmación
    if (this.usuario?.email) {
      this.notificacionesService.enviarConfirmacionTurno(
        this.usuario.email,
        this.usuario.nombre,
        this.turnoSeleccionado.fecha,
        this.turnoSeleccionado.hora,
        this.turnoSeleccionado.horaFin,
        nuevoTurno.motivo,
        nuevoTurno.asesor
      ).subscribe({
        next: (resultado) => {
          console.log('Email enviado:', resultado);
          this.notificacionesService.mostrarNotificacion(
            '✅ ¡Turno confirmado! Revisa tu email para más detalles.',
            'success'
          );
        },
        error: (error) => {
          console.error('Error al enviar email:', error);
          this.notificacionesService.mostrarNotificacion(
            '⚠️ Turno confirmado, pero hubo un error al enviar el email.',
            'info'
          );
        }
      });
    }

    alert('✅ ¡Turno confirmado exitosamente!\n\nRecibirás un email de confirmación.');

    // Limpiar y cerrar
    this.cerrarModal();
    this.turnoSeleccionado = null;

    // Regenerar agenda y fechas disponibles
    this.generarAgenda();
    this.generarFechasDisponibles();

    // Cambiar a tab "Mis Turnos"
    this.cambiarTab('misturnos');
  }

  cancelarTurno(turno: Turno): void {
    if (confirm('¿Estás seguro que deseas cancelar este turno?')) {
      // Remover de próximos turnos
      this.proximosTurnos = this.proximosTurnos.filter(t => t.id !== turno.id);
      
      // Agregar al historial como cancelado
      turno.estado = 'cancelado';
      this.historialTurnos.unshift(turno);

      // Liberar el horario
      this.turnosOcupados = this.turnosOcupados.filter(
        t => !(t.fecha === turno.fecha && t.hora === turno.hora)
      );

      this.generarAgenda();
      this.generarFechasDisponibles();
      
      // Enviar email de cancelación
      if (this.usuario?.email) {
        this.notificacionesService.enviarCancelacionTurno(
          this.usuario.email,
          this.usuario.nombre,
          turno.fecha,
          turno.hora,
          turno.motivo
        ).subscribe({
          next: (resultado) => {
            console.log('Email de cancelación enviado:', resultado);
            this.notificacionesService.mostrarNotificacion(
              '✅ Turno cancelado. Te hemos enviado un email de confirmación.',
              'success'
            );
          },
          error: (error) => {
            console.error('Error al enviar email:', error);
          }
        });
      }
      
      alert('Turno cancelado exitosamente');
    }
  }

  confirmarTurnoPendiente(turno: Turno): void {
    turno.estado = 'confirmado';
    alert('Turno confirmado exitosamente');
  }

  verDetallesTurno(turno: Turno): void {
    alert(`Detalles del Turno:\n\nFecha: ${this.formatearFecha(turno.fecha)}\nHorario: ${turno.hora} - ${turno.horaFin}\nMotivo: ${turno.motivo}\nAsesor: ${turno.asesor}\nEstado: ${this.getEstadoTexto(turno.estado)}`);
  }

  // Helpers
  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return fechaObj.toLocaleDateString('es-AR', opciones);
  }

  getDiaMes(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.getDate().toString();
  }

  getMesCorto(fecha: string): string {
    const fechaObj = new Date(fecha);
    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return meses[fechaObj.getMonth()];
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'confirmado': 'status-confirmado',
      'pendiente': 'status-pendiente',
      'cancelado': 'status-cancelado',
      'completado': 'bg-secondary'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'confirmado': 'Confirmado',
      'pendiente': 'Pendiente Confirmación',
      'cancelado': 'Cancelado',
      'completado': 'Completado'
    };
    return textos[estado] || estado;
  }

  getCalendarIconColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'confirmado': '#198754',
      'pendiente': '#ffc107',
      'cancelado': '#dc3545',
      'completado': '#6c757d'
    };
    return colores[estado] || '#198754';
  }

  isSlotSeleccionado(slot: SlotHorario): boolean {
    if (!this.turnoSeleccionado) return false;
    return this.turnoSeleccionado.fecha === slot.fecha && 
           this.turnoSeleccionado.hora === slot.hora;
  }

  /**
   * Maneja la selección de fecha desde el selector de fechas
   */
  onFechaSeleccionada(fecha: FechaSeleccionada): void {
    this.fechaSeleccionadaCalendario = fecha;
    
    // Actualizar la agenda para mostrar solo la fecha seleccionada
    // O aplicar filtros según la fecha
    console.log('Fecha seleccionada:', fecha);
    
    // Mostrar notificación
    this.notificacionesService.mostrarNotificacion(
      `📅 Fecha seleccionada: ${fecha.fechaTexto}`,
      'info'
    );
  }
}
