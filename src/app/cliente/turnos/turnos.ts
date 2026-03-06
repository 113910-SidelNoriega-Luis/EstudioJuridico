import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, Usuario } from '../../auth/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { FechaSeleccionada } from '../../components/selector-fecha.component';

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

interface TurnoOcupado {
  fecha: string;
  hora: string;
}

// clave para localStorage
const LS_TURNOS_KEY = 'turnos_ocupados';

@Component({
  selector: 'app-turnos-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './turnos.html',
  styleUrls: ['./turnos.css'],
})
export class Turnos implements OnInit {
  semanaOffset: number = 0;

  usuario: Usuario | null = null;

  // Tabs
  tabActivo: 'agendar' | 'misturnos' | 'historial' = 'agendar';

  // Selector de fechas
  fechaSeleccionadaCalendario: FechaSeleccionada | null = null;
  fechasConTurnos: string[] = [];
  mostrarSelectorFecha: boolean = true;

  // Datos de la agenda
  horarios: string[] = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  dias: DiaAgenda[] = [];

  agendaSlots: { [hora: string]: SlotHorario[] } = {};

  turnosOcupados: TurnoOcupado[] = [];

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
    { value: 'otro', label: 'Otro' },
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
      estado: 'confirmado',
    },
    {
      id: 2,
      fecha: '2024-11-18',
      hora: '20:30',
      horaFin: '21:00',
      motivo: 'Seguimiento - Caso Civil',
      asesor: 'Dr. Carlos Rodríguez',
      estado: 'confirmado',
    },
    {
      id: 3,
      fecha: '2024-11-20',
      hora: '19:30',
      horaFin: '20:00',
      motivo: 'Revisión de Documentos',
      asesor: 'Dra. María González',
      estado: 'pendiente',
    },
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
      estado: 'completado',
    },
    {
      id: 5,
      fecha: '2024-11-05',
      hora: '20:00',
      horaFin: '20:30',
      motivo: 'Primera Consulta',
      descripcion: 'Cancelado por el cliente',
      asesor: 'Dra. María González',
      estado: 'cancelado',
    },
  ];

  // Modal
  mostrarModal: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();

    if (!this.usuario || !this.authService.esCliente()) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.generarDiasSemanaActual();
    this.cargarTurnosDesdeLocalStorage();

    this.generarAgenda();
    this.generarFechasDisponibles();
    this.ordenarProximosTurnosMasNuevosPrimero();
  }

  private ordenarProximosTurnosMasNuevosPrimero(): void {
    this.proximosTurnos.sort((a, b) => this.getTurnoTimestamp(b) - this.getTurnoTimestamp(a));
  }

  private getTurnoTimestamp(turno: Turno): number {
    const [anio, mes, dia] = turno.fecha.split('-').map(Number);
    const [hora, minuto] = turno.hora.split(':').map(Number);
    return new Date(anio, (mes || 1) - 1, dia || 1, hora || 0, minuto || 0, 0, 0).getTime();
  }

  private generarDiasSemanaActual(): void {
    const hoy = new Date();

    hoy.setDate(hoy.getDate() + this.semanaOffset * 7);

    const diaSemana = hoy.getDay();

    const diferencia = diaSemana === 0 ? -6 : 1 - diaSemana;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() + diferencia);

    const nombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    this.dias = [];

    for (let i = 0; i < 6; i++) {
      const d = new Date(lunes);
      d.setDate(lunes.getDate() + i);

      const dia = d.getDate().toString().padStart(2, '0');
      const mes = (d.getMonth() + 1).toString().padStart(2, '0');

      this.dias.push({
        nombre: `${nombres[i]} ${dia}/${mes}`,
        fecha: this.formatearFechaISO(d),
      });
    }
  }

  siguienteSemana(): void {
    this.semanaOffset++;
    this.generarDiasSemanaActual();
    this.generarAgenda();
    this.generarFechasDisponibles();
  }

  anteriorSemana(): void {
    if (this.semanaOffset === 0) {
      return;
    }

    this.semanaOffset--;
    this.generarDiasSemanaActual();
    this.generarAgenda();
    this.generarFechasDisponibles();
  }

  generarFechasDisponibles(): void {
    this.fechasConTurnos = [];
    const hoy = new Date();

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      if (fecha.getDay() !== 0) {
        const fechaISO = this.formatearFechaISO(fecha);

        const turnosOcupadosEnFecha = this.turnosOcupados.filter(
          (t) => t.fecha === fechaISO,
        ).length;
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

    this.horarios.forEach((hora) => {
      this.agendaSlots[hora] = this.dias.map((dia) => {
        const ocupado = this.turnosOcupados.find((t) => t.fecha === dia.fecha && t.hora === hora);

        return {
          fecha: dia.fecha,
          fechaTexto: dia.nombre,
          hora: hora,
          disponible: !ocupado,
        };
      });
    });
  }

  private cargarTurnosDesdeLocalStorage(): void {
    const data = localStorage.getItem(LS_TURNOS_KEY);
    if (data) {
      const turnosGuardados = JSON.parse(data) as Array<{ fecha?: string; hora?: string }>;
      this.turnosOcupados = turnosGuardados
        .filter((t) => !!t.fecha && !!t.hora)
        .map((t) => ({
          fecha: this.normalizarFecha(t.fecha as string),
          hora: this.normalizarHora(t.hora as string),
        }));
    } else {
      this.turnosOcupados = [];
    }
  }
  private normalizarFecha(fecha: string): string {
    // Acepta formatos tipo yyyy-mm-dd o yyyy-mm-ddTHH:mm:ss
    return fecha.slice(0, 10);
  }

  private normalizarHora(hora: string): string {
    // Acepta formatos tipo HH:mm o HH:mm:ss
    return hora.slice(0, 5);
  }

  private liberarReservaAgenda(turno: Turno): void {
    const fechaTurno = this.normalizarFecha(turno.fecha);
    const horaTurno = this.normalizarHora(turno.hora);

    this.turnosOcupados = this.turnosOcupados.filter((t) => {
      const fechaOcupada = this.normalizarFecha(t.fecha);
      const horaOcupada = this.normalizarHora(t.hora);
      return !(fechaOcupada === fechaTurno && horaOcupada === horaTurno);
    });
  }

  private guardarTurnosEnLocalStorage(): void {
    localStorage.setItem(LS_TURNOS_KEY, JSON.stringify(this.turnosOcupados));
  }

  cambiarTab(tab: 'agendar' | 'misturnos' | 'historial'): void {
    this.tabActivo = tab;
  }

  seleccionarTurno(slot: SlotHorario): void {
    if (!slot.disponible) {
      return;
    }

    this.turnoSeleccionado = {
      fechaTexto: slot.fechaTexto,
      fecha: slot.fecha,
      hora: slot.hora,
      horaFin: this.calcularHoraFin(slot.hora),
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

    this.turnosOcupados.push({
      fecha: this.turnoSeleccionado.fecha,
      hora: this.turnoSeleccionado.hora,
    });

    this.guardarTurnosEnLocalStorage();

    const nuevoTurno: Turno = {
      id: Date.now(),
      fecha: this.turnoSeleccionado.fecha,
      hora: this.turnoSeleccionado.hora,
      horaFin: this.turnoSeleccionado.horaFin,
      motivo: this.motivosDisponibles.find((m) => m.value === this.motivoSeleccionado)?.label || '',
      descripcion: this.descripcionTurno,
      asesor: 'Por asignar',
      estado: 'pendiente',
    };

    this.proximosTurnos.push(nuevoTurno);
    this.ordenarProximosTurnosMasNuevosPrimero();

    this.notificacionesService
      .enviarConfirmacionTurnoBack(this.turnoSeleccionado.fecha, this.turnoSeleccionado.hora)
      .subscribe({
        next: () => {
          this.notificacionesService.mostrarNotificacion(
            '📧 Correo enviado correctamente',
            'success',
          );
        },
        error: (error) => {
          console.error('Error al enviar email:', error);
          this.notificacionesService.mostrarNotificacion(
            '⚠️ Turno creado, pero no se pudo enviar el email',
            'error',
          );
        },
      });

    alert('✅ ¡Turno confirmado exitosamente!\n\nRecibirás un email de confirmación.');

    this.cerrarModal();
    this.turnoSeleccionado = null;

    this.generarAgenda();
    this.generarFechasDisponibles();

    this.cambiarTab('misturnos');
  }

  cancelarTurno(turno: Turno): void {
    if (confirm('¿Estás seguro que deseas cancelar este turno?')) {
      this.proximosTurnos = this.proximosTurnos.filter((t) => t.id !== turno.id);

      turno.estado = 'cancelado';
      this.historialTurnos.unshift(turno);

      this.liberarReservaAgenda(turno);

      this.guardarTurnosEnLocalStorage();

      this.generarAgenda();
      this.generarFechasDisponibles();

      this.notificacionesService.enviarCancelacionTurno(turno.fecha, turno.hora).subscribe({
        next: () => {
          this.notificacionesService.mostrarNotificacion(
            '📧 Te enviamos un correo con la cancelación del turno.',
            'success',
          );
        },
        error: (error) => {
          console.error('Error al enviar email de cancelación:', error);
        },
      });

      alert('Turno cancelado exitosamente');
    }
  }

  confirmarTurnoPendiente(turno: Turno): void {
    turno.estado = 'confirmado';
    alert('Turno confirmado exitosamente');
  }

  verDetallesTurno(turno: Turno): void {
    alert(
      `Detalles del Turno:\n\nFecha: ${this.formatearFecha(turno.fecha)}\nHorario: ${
        turno.hora
      } - ${turno.horaFin}\nMotivo: ${turno.motivo}\nAsesor: ${
        turno.asesor
      }\nEstado: ${this.getEstadoTexto(turno.estado)}`,
    );
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return fechaObj.toLocaleDateString('es-AR', opciones);
  }

  getDiaMes(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.getDate().toString();
  }

  getMesCorto(fecha: string): string {
    const fechaObj = new Date(fecha);
    const meses = [
      'ENE',
      'FEB',
      'MAR',
      'ABR',
      'MAY',
      'JUN',
      'JUL',
      'AGO',
      'SEP',
      'OCT',
      'NOV',
      'DIC',
    ];
    return meses[fechaObj.getMonth()];
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      confirmado: 'status-confirmado',
      pendiente: 'status-pendiente',
      cancelado: 'status-cancelado',
      completado: 'bg-secondary',
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      confirmado: 'Confirmado',
      pendiente: 'Pendiente Confirmación',
      cancelado: 'Cancelado',
      completado: 'Completado',
    };
    return textos[estado] || estado;
  }

  getCalendarIconColor(estado: string): string {
    const colores: { [key: string]: string } = {
      confirmado: '#198754',
      pendiente: '#ffc107',
      cancelado: '#dc3545',
      completado: '#6c757d',
    };
    return colores[estado] || '#198754';
  }

  isSlotSeleccionado(slot: SlotHorario): boolean {
    if (!this.turnoSeleccionado) return false;
    return this.turnoSeleccionado.fecha === slot.fecha && this.turnoSeleccionado.hora === slot.hora;
  }

  onFechaSeleccionada(fecha: FechaSeleccionada): void {
    this.fechaSeleccionadaCalendario = fecha;

    this.notificacionesService.mostrarNotificacion(
      `📅 Fecha seleccionada: ${fecha.fechaTexto}`,
      'info',
    );
  }

  getIniciales(nombre: string): string {
    const palabras = nombre.trim().split(' ').filter(Boolean);
    if (palabras.length >= 2) {
      return (palabras[0][0] + palabras[1][0]).toUpperCase();
    }

    const primera = palabras[0] ?? 'U';
    return (primera[0] + (primera[1] || '')).toUpperCase();
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
