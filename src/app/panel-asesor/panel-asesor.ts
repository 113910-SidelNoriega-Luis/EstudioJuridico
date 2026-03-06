import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, Usuario } from '../auth/auth.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { SelectorFechaComponent, FechaSeleccionada } from '../components/selector-fecha.component';
import { CasosAsesorComponent } from './casos-asesor/casos-asesor';
import { CasoDetalleAsesorComponent } from './caso-detalle-asesor/caso-detalle-asesor-actualizado';
import { ReportesComponent } from '../reportes/reportes';
import { DocumentosAsesorComponent } from './documentos/documentos-asesor';

interface DiaAgenda {
  nombre: string; // Ej: "Lun 09/12"
  fecha: string; // "2025-12-09"
}

const LS_TURNOS_KEY = 'turnos_ocupados';

interface TurnoAgenda {
  fecha: string;
  hora: string;
  horaFin: string;
  clienteNombre: string;
  asunto: string;
  estado: 'pendiente' | 'confirmado' | 'completado' | 'cancelado';
  caso: number;
  fechaCreacion: string;
  fechaConfirmacion?: string;
}

interface SlotAgendaAsesor {
  fecha: string;
  disponible: boolean;
  turno?: TurnoAgenda;
}

interface FilaAgenda {
  hora: string;
  slots: SlotAgendaAsesor[];
}

// Interfaces
interface Turno {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  asunto: string;
  fecha: string;
  hora: string;
  horaFin: string;
  caso?: string; // ✅ Agregado
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  motivo?: string;
  fechaCreacion?: string; // ✅ Agregado
  fechaConfirmacion?: string; // ✅ Agregado
}

interface Consulta {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  asunto: string;
  mensaje: string;
  fecha: string;
  urgente: boolean;
  respondida: boolean;
  respuesta?: string;
}

interface Caso {
  id: number;
  numero: string;
  titulo: string; // ✅ Agregado
  cliente: string; // ✅ Agregado (alias de clienteNombre)
  clienteNombre?: string;
  tipo: string;
  estado: 'activo' | 'en_proceso' | 'finalizado';
  fechaInicio: string;
  ultimaActualizacion?: string;
}

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  casosActivos: number;
  ultimaConsulta: string;
}

interface DiaAgenda {
  nombre: string;
  fecha: string;
}

interface SlotAgenda {
  hora: string;
  slots: {
    // ✅ Agregado - estructura simplificada
    disponible: boolean;
    turno?: Turno;
    fecha: string;
  }[];
}

@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    ReportesComponent,
    DocumentosAsesorComponent,
  ],
  templateUrl: './panel-asesor.html',
  styleUrls: ['./panel-asesor.css'],
})
export class PanelAsesorComponent implements OnInit {
  mostrarSelectorFecha: boolean = false; // o true si querés que se vea

  // si usás el selector de fechas también necesitarás:
  fechasConTurnos: string[] = [];

  // 🔹 AGENDA SEMANAL
  horarios: string[] = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];

  dias: DiaAgenda[] = [];
  agendaSemanal: FilaAgenda[] = [];

  // semanaOffset: 0 = semana actual, 1 = próxima, etc.
  semanaOffset: number = 0;

  // si usás el selector de fecha del día
  fechaSeleccionadaCalendario: { fechaISO: string; fechaTexto: string } | null = null;

  turnosAgendados: TurnoAgenda[] = [
    {
      fecha: '2025-12-11',
      hora: '19:00',
      horaFin: '19:30',
      clienteNombre: 'Juan Pérez',
      asunto: 'Consulta laboral',
      estado: 'pendiente',
      caso: 101,
      fechaCreacion: '2025-12-10 15:30',
      fechaConfirmacion: '',
    },
    // ... otros turnos
  ];

  // Usuario actual
  usuario: Usuario | null = null;

  // Control de vistas
  vistaActiva:
    | 'dashboard'
    | 'agenda'
    | 'consultas'
    | 'casos'
    | 'clientes'
    | 'reportes'
    | 'documentos' = 'dashboard';

  // Estadísticas
  estadisticas = {
    turnosSemana: 3,
    consultasPendientes: 2,
    casosActivos: 5,
    clientesTotales: 12,
  };

  // Turnos
  proximosTurnos: Turno[] = [
    {
      id: 1,
      clienteNombre: 'Juan Pérez',
      clienteEmail: 'juan@email.com',
      asunto: 'Consulta Laboral',
      fecha: '2024-11-25',
      hora: '19:00',
      horaFin: '19:30',
      caso: '2024-001',
      estado: 'pendiente',
      motivo: 'Despido injustificado',
      fechaCreacion: '2024-11-20',
      fechaConfirmacion: undefined,
    },
    {
      id: 2,
      clienteNombre: 'María González',
      clienteEmail: 'maria@email.com',
      asunto: 'Asesoría Civil',
      fecha: '2024-11-25',
      hora: '20:30',
      horaFin: '21:00',
      caso: '2024-002',
      estado: 'confirmado',
      motivo: 'Contrato de alquiler',
      fechaCreacion: '2024-11-18',
      fechaConfirmacion: '2024-11-19',
    },
    {
      id: 3,
      clienteNombre: 'Carlos Ramírez',
      clienteEmail: 'carlos@email.com',
      asunto: 'Seguimiento Caso Familiar',
      fecha: '2024-11-26',
      hora: '19:30',
      horaFin: '20:00',
      caso: '2024-003',
      estado: 'confirmado',
      motivo: 'Divorcio',
      fechaCreacion: '2024-11-21',
      fechaConfirmacion: '2024-11-22',
    },
  ];

  // Consultas
  consultas: Consulta[] = [
    {
      id: 1,
      clienteNombre: 'Ana Martínez',
      clienteEmail: 'ana@email.com',
      asunto: '¿Cómo proceder con un despido?',
      mensaje: 'Me despidieron sin previo aviso después de 3 años. ¿Qué puedo hacer?',
      fecha: '2024-11-20',
      urgente: true,
      respondida: false,
    },
    {
      id: 2,
      clienteNombre: 'Pedro López',
      clienteEmail: 'pedro@email.com',
      asunto: 'Consulta sobre herencia',
      mensaje: 'Necesito información sobre el proceso de sucesión',
      fecha: '2024-11-19',
      urgente: false,
      respondida: false,
    },
  ];

  // Casos
  casos: Caso[] = [
    // ✅ Agregado
    {
      id: 1,
      numero: '2024-001',
      titulo: 'Despido Injustificado',
      cliente: 'Juan Pérez',
      clienteNombre: 'Juan Pérez',
      tipo: 'Laboral',
      estado: 'activo',
      fechaInicio: '2024-10-01',
    },
    {
      id: 2,
      numero: '2024-002',
      titulo: 'Contrato de Alquiler',
      cliente: 'María González',
      clienteNombre: 'María González',
      tipo: 'Civil',
      estado: 'en_proceso',
      fechaInicio: '2024-10-15',
    },
    {
      id: 3,
      numero: '2024-003',
      titulo: 'Divorcio de Mutuo Acuerdo',
      cliente: 'Carlos Ramírez',
      clienteNombre: 'Carlos Ramírez',
      tipo: 'Familiar',
      estado: 'activo',
      fechaInicio: '2024-11-01',
    },
  ];

  // Clientes
  clientes: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      telefono: '351-123-4567',
      casosActivos: 1,
      ultimaConsulta: '2024-11-20',
    },
    {
      id: 2,
      nombre: 'María González',
      email: 'maria@email.com',
      telefono: '351-987-6543',
      casosActivos: 1,
      ultimaConsulta: '2024-11-18',
    },
  ];

  // Modal de consulta
  mostrarModalConsulta: boolean = false;
  consultaSeleccionada: Consulta | null = null;
  respuestaConsulta: string = '';

  // Modal de cliente
  mostrarModalCliente: boolean = false;
  clienteSeleccionado: Cliente | null = null;

  // Modal de detalle de turno
  mostrarModalTurno: boolean = false;
  turnoSeleccionado: TurnoAgenda | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService,
  ) {
    this.usuario = this.authService.getUsuarioActual();
  }

  ngOnInit(): void {
    if (!this.usuario || !this.authService.esAsesor()) {
      this.router.navigate(['/inicio']);
      return;
    }
    this.cargarTurnosDesdeLocalStorage();
    this.generarDiasSemanaActual();
    this.generarAgendaSemanal();
    this.generarFechasConTurnos();
  }

  private generarDiasSemanaActual(): void {
    const hoy = new Date();

    // aplicamos el offset de semanas (0 = actual, 1 = próxima, etc.)
    hoy.setDate(hoy.getDate() + this.semanaOffset * 7);

    const diaSemana = hoy.getDay(); // 0=Dom,1=Lun,...,6=Sab

    // buscamos el lunes de esa semana
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

  private formatearFechaISO(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generarAgendaSemanal(): void {
    this.agendaSemanal = [];

    for (const hora of this.horarios) {
      const fila: FilaAgenda = {
        hora,
        slots: [],
      };

      for (const dia of this.dias) {
        // buscamos si hay turno en ese día/hora
        const turno = this.turnosAgendados.find((t) => t.fecha === dia.fecha && t.hora === hora);

        fila.slots.push({
          fecha: dia.fecha,
          disponible: !turno,
          turno: turno,
        });
      }

      this.agendaSemanal.push(fila);
    }
  }

  generarFechasConTurnos(): void {
    this.fechasConTurnos = [];
    const hoy = new Date();

    for (let i = 0; i < 30; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);

      if (fecha.getDay() !== 0) {
        const fechaISO = this.formatearFechaISO(fecha);
        this.fechasConTurnos.push(fechaISO);
      }
    }
  }

  siguienteSemana(): void {
    this.semanaOffset++;
    this.generarDiasSemanaActual();
    this.generarAgendaSemanal();
  }

  anteriorSemana(): void {
    if (this.semanaOffset === 0) return; // no ir antes de la semana actual

    this.semanaOffset--;
    this.generarDiasSemanaActual();
    this.generarAgendaSemanal();
  }

  cambiarVista(
    vista: 'dashboard' | 'agenda' | 'consultas' | 'casos' | 'clientes' | 'reportes' | 'documentos',
  ): void {
    this.vistaActiva = vista;
    this.mostrarSelectorFecha = vista === 'agenda';
    window.scrollTo(0, 0);

    // Navegar a la ruta base del panel-asesor si estamos en una subruta
    if (this.estoyEnRutaCasos()) {
      this.router.navigate(['/panel-asesor']);
    }
  }

  irADocumentos(): void {
    this.cambiarVista('documentos');
  }

  irAMisCasos(): void {
    window.scrollTo(0, 0);
    this.router.navigate(['/panel-asesor/casos']);
  }

  // onFechaSeleccionada(fecha: FechaSeleccionada): void {
  //   this.fechaSeleccionadaCalendario = fecha;

  //   const turnosDelDia = this.proximosTurnos.filter((t) => t.fecha === fecha.fecha);

  //   this.notificacionesService.mostrarNotificacion(
  //     `📅 Mostrando turnos del ${fecha.fechaTexto}: ${turnosDelDia.length} turnos`,
  //     'info'
  //   );
  // }

  verDetallesTurno(turno: Turno): void {
    alert(`Ver detalles del turno:\n${turno.clienteNombre}\n${turno.asunto}\n${turno.hora}`);
  }

  confirmarTurno(turno: Turno): void {
    if (confirm(`¿Confirmar turno de ${turno.clienteNombre}?`)) {
      turno.estado = 'confirmado';
      turno.fechaConfirmacion = new Date().toISOString().split('T')[0];

      this.notificacionesService
        .enviarConfirmacionTurno(
          turno.clienteEmail,
          turno.clienteNombre,
          turno.fecha,
          turno.hora,
          turno.horaFin,
          turno.motivo || turno.asunto,
          this.usuario?.nombre || 'Asesor',
        )
        .subscribe({
          next: () => {
            this.notificacionesService.mostrarNotificacion(
              '✅ Turno confirmado y email enviado al cliente',
              'success',
            );
          },
        });
    }
  }

  marcarTurnoCompletado(turno: Turno): void {
    if (confirm(`¿Marcar turno de ${turno.clienteNombre} como completado?`)) {
      turno.estado = 'completado';
      this.notificacionesService.mostrarNotificacion('✅ Turno marcado como completado', 'success');

      this.estadisticas.turnosSemana--;
    }
  }

  abrirModalRespuesta(consulta: Consulta): void {
    this.consultaSeleccionada = consulta;
    this.respuestaConsulta = '';
    this.mostrarModalConsulta = true;
  }

  cerrarModalConsulta(): void {
    this.mostrarModalConsulta = false;
    this.consultaSeleccionada = null;
    this.respuestaConsulta = '';
  }
  estoyEnRutaCasos(): boolean {
    return (
      this.router.url.includes('/panel-asesor/casos') ||
      this.router.url.includes('/panel-asesor/caso/')
    );
  }

  enviarRespuestaConsulta(): void {
    if (!this.consultaSeleccionada || !this.respuestaConsulta.trim()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    this.consultaSeleccionada.respondida = true;
    this.consultaSeleccionada.respuesta = this.respuestaConsulta;

    this.notificacionesService.mostrarNotificacion(
      `✅ Respuesta enviada a ${this.consultaSeleccionada.clienteNombre}`,
      'success',
    );

    this.estadisticas.consultasPendientes--;
    this.cerrarModalConsulta();
  }

  verDetalleCaso(caso: Caso): void {
    alert(
      `Caso ${caso.numero}\nCliente: ${caso.cliente}\nTipo: ${caso.tipo}\nEstado: ${caso.estado}`,
    );
  }

  verDetalleCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
    this.mostrarModalCliente = true;
  }

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
    this.clienteSeleccionado = null;
  }

  clickSlotAgenda(slot: any): void {
    if (slot.disponible) {
      this.notificacionesService.mostrarNotificacion('Slot disponible para agendar', 'info');
    } else if (slot.turno) {
      this.abrirModalTurno(slot.turno);
    }
  }

  abrirModalTurno(turno: TurnoAgenda): void {
    this.turnoSeleccionado = turno;
    this.mostrarModalTurno = true;
  }

  cerrarModalTurno(): void {
    this.mostrarModalTurno = false;
    this.turnoSeleccionado = null;
  }

  aceptarTurno(turno: TurnoAgenda): void {
    turno.estado = 'confirmado';
    turno.fechaConfirmacion =
      new Date().toISOString().split('T')[0] +
      ' ' +
      new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    this.notificacionesService.mostrarNotificacion(
      `✅ Turno de ${turno.clienteNombre} confirmado exitosamente`,
      'success',
    );

    this.generarAgendaSemanal(); // Actualizar vista
    this.cerrarModalTurno();
  }

  cancelarTurno(turno: TurnoAgenda): void {
    if (!confirm(`¿Estás seguro de cancelar el turno de ${turno.clienteNombre}?`)) {
      return;
    }

    // Eliminar el turno del array turnosAgendados
    const index = this.turnosAgendados.findIndex(
      (t) =>
        t.fecha === turno.fecha && t.hora === turno.hora && t.clienteNombre === turno.clienteNombre,
    );

    if (index !== -1) {
      this.turnosAgendados.splice(index, 1);
    }

    // Eliminar de localStorage si existe
    this.liberarTurnoEnLocalStorage(turno.fecha, turno.hora);

    this.notificacionesService.mostrarNotificacion(
      `❌ Turno de ${turno.clienteNombre} cancelado y slot liberado`,
      'success',
    );

    // Regenerar agenda para mostrar slot disponible
    this.generarAgendaSemanal();
    this.cerrarModalTurno();
  }

  private liberarTurnoEnLocalStorage(fecha: string, hora: string): void {
    const data = localStorage.getItem(LS_TURNOS_KEY);
    if (!data) return;

    const reservas = JSON.parse(data);
    const nuevasReservas = reservas.filter((r: any) => !(r.fecha === fecha && r.hora === hora));

    localStorage.setItem(LS_TURNOS_KEY, JSON.stringify(nuevasReservas));
  }

  cerrarSesion(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  // Métodos helper para el template
  getProximosTurnos(): Turno[] {
    const hoy = new Date().toISOString().split('T')[0];
    return this.proximosTurnos.filter((t) => t.fecha >= hoy).slice(0, 5);
  }

  getConsultasPendientes(): Consulta[] {
    return this.consultas.filter((c) => !c.respondida);
  }

  getTurnosDelDia(): Turno[] {
    if (!this.fechaSeleccionadaCalendario) return [];
    return this.proximosTurnos.filter(
      (t) => t.fecha === this.fechaSeleccionadaCalendario!.fechaISO,
    );
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      pendiente: 'status-pendiente',
      confirmado: 'status-confirmado',
      activo: 'status-proceso',
      en_proceso: 'status-proceso',
      cancelado: 'status-urgente',
      completado: 'bg-secondary',
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      activo: 'Activo',
      en_proceso: 'En Proceso',
      cancelado: 'Cancelado',
      finalizado: 'Finalizado',
      completado: 'Completado',
    };
    return textos[estado] || estado;
  }

  // Métodos de navegación de agenda
  semanaAnterior(): void {
    this.notificacionesService.mostrarNotificacion('Mostrando semana anterior', 'info');
  }

  semanaSiguiente(): void {
    this.notificacionesService.mostrarNotificacion('Mostrando semana siguiente', 'info');
  }

  irAHoy(): void {
    this.notificacionesService.mostrarNotificacion('Volviendo a la semana actual', 'info');
  }

  private cargarTurnosDesdeLocalStorage(): void {
    const data = localStorage.getItem(LS_TURNOS_KEY);
    if (!data) {
      return;
    }

    // Esto es lo que guarda el front del cliente:
    // [{ fecha: "2025-12-11", hora: "19:00" }, ...]
    const reservas: { fecha: string; hora: string }[] = JSON.parse(data);

    const ahora = new Date().toISOString().substring(0, 16).replace('T', ' ');

    const turnosDesdeLocal: TurnoAgenda[] = reservas.map((r, index) => ({
      fecha: r.fecha,
      hora: r.hora,
      horaFin: this.calcularHoraFin(r.hora),
      clienteNombre: 'Cliente de la plataforma',
      asunto: 'Consulta agendada online',
      estado: 'pendiente',
      caso: 1000 + index, // número de caso de ejemplo
      fechaCreacion: ahora,
      fechaConfirmacion: '',
    }));

    // Si ya tenías turnosAgendados mock, los conservamos y sumamos estos
    this.turnosAgendados = [...this.turnosAgendados, ...turnosDesdeLocal];
  }

  private calcularHoraFin(horaInicio: string): string {
    const [h, m] = horaInicio.split(':').map(Number);
    let minutos = m + 30;
    let horas = h;

    if (minutos >= 60) {
      minutos -= 60;
      horas += 1;
    }

    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }
}
