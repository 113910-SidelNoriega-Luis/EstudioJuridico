import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, Usuario } from '../auth/auth.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { SelectorFechaComponent, FechaSeleccionada } from '../components/selector-fecha.component';
import { CasosAsesorComponent } from './casos-asesor/casos-asesor';
import { CasosAsesorDetalleComponent } from './caso-detalle-asesor/casos-asesor-detaller';

// Interfaces
interface Turno {
  id: number;
  clienteNombre: string;
  clienteEmail: string;
  asunto: string;
  fecha: string;
  hora: string;
  horaFin: string;
  caso?: string;  // ✅ Agregado
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  motivo?: string;
  fechaCreacion?: string;  // ✅ Agregado
  fechaConfirmacion?: string;  // ✅ Agregado
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
  titulo: string;  // ✅ Agregado
  cliente: string;  // ✅ Agregado (alias de clienteNombre)
  clienteNombre?: string;
  tipo: string;
  estado: 'activo' | 'en_proceso' | 'finalizado';
  fechaInicio: string;
  ultimaActualizacion?: string;
}

interface DiaAgenda {
  nombre: string;
  fecha: string;
}

interface SlotAgenda {
  hora: string;
  slots: {  // ✅ Agregado - estructura simplificada
    disponible: boolean;
    turno?: Turno;
    fecha: string;
  }[];
}

@Component({
  selector: 'app-panel-asesor',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorFechaComponent, CasosAsesorComponent,
    CasosAsesorDetalleComponent, RouterOutlet],  // ✅ FormsModule agregado
  templateUrl: './panel-asesor.html',
  styleUrls: ['./panel-asesor.css']
})
export class PanelAsesorComponent implements OnInit {
  
  // Usuario actual
  usuario: Usuario | null = null;

  // Control de vistas
  vistaActiva: 'dashboard' | 'agenda' | 'consultas' | 'casos' | 'clientes' = 'dashboard';

  // Estadísticas
  estadisticas = {
    turnosSemana: 3,
    consultasPendientes: 2,
    casosActivos: 5,
    clientesTotales: 12
  };

  // Selector de fechas
  fechaSeleccionadaCalendario: FechaSeleccionada | null = null;
  fechasConTurnos: string[] = [];
  mostrarSelectorFecha: boolean = false;

  // Días de la semana para la agenda
  dias: DiaAgenda[] = [  // ✅ Agregado
    { nombre: 'Lun 25/11', fecha: '2024-11-25' },
    { nombre: 'Mar 26/11', fecha: '2024-11-26' },
    { nombre: 'Mié 27/11', fecha: '2024-11-27' },
    { nombre: 'Jue 28/11', fecha: '2024-11-28' },
    { nombre: 'Vie 29/11', fecha: '2024-11-29' },
    { nombre: 'Sáb 30/11', fecha: '2024-11-30' }
  ];

  // Agenda semanal
  agendaSemanal: SlotAgenda[] = [];  // ✅ Agregado

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
      fechaConfirmacion: undefined
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
      fechaConfirmacion: '2024-11-19'
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
      fechaConfirmacion: '2024-11-22'
    }
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
      respondida: false
    },
    {
      id: 2,
      clienteNombre: 'Pedro López',
      clienteEmail: 'pedro@email.com',
      asunto: 'Consulta sobre herencia',
      mensaje: 'Necesito información sobre el proceso de sucesión',
      fecha: '2024-11-19',
      urgente: false,
      respondida: false
    }
  ];

  // Casos
  casos: Caso[] = [  // ✅ Agregado
    {
      id: 1,
      numero: '2024-001',
      titulo: 'Despido Injustificado',
      cliente: 'Juan Pérez',
      clienteNombre: 'Juan Pérez',
      tipo: 'Laboral',
      estado: 'activo',
      fechaInicio: '2024-10-01'
    },
    {
      id: 2,
      numero: '2024-002',
      titulo: 'Contrato de Alquiler',
      cliente: 'María González',
      clienteNombre: 'María González',
      tipo: 'Civil',
      estado: 'en_proceso',
      fechaInicio: '2024-10-15'
    },
    {
      id: 3,
      numero: '2024-003',
      titulo: 'Divorcio de Mutuo Acuerdo',
      cliente: 'Carlos Ramírez',
      clienteNombre: 'Carlos Ramírez',
      tipo: 'Familiar',
      estado: 'activo',
      fechaInicio: '2024-11-01'
    }
  ];

  // Clientes
  clientes = [
    {
      id: 1,
      nombre: 'Juan Pérez',
      email: 'juan@email.com',
      telefono: '351-123-4567',
      casosActivos: 1,
      ultimaConsulta: '2024-11-20'
    },
    {
      id: 2,
      nombre: 'María González',
      email: 'maria@email.com',
      telefono: '351-987-6543',
      casosActivos: 1,
      ultimaConsulta: '2024-11-18'
    }
  ];

  // Modal de consulta
  mostrarModalConsulta: boolean = false;
  consultaSeleccionada: Consulta | null = null;
  respuestaConsulta: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {
    this.usuario = this.authService.getUsuarioActual();
  }

  ngOnInit(): void {
    if (!this.usuario || !this.authService.esAsesor()) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.generarAgendaSemanal();
    this.generarFechasConTurnos();
  }

  generarAgendaSemanal(): void {
    const horarios = ['19:00', '19:30', '20:00', '20:30', '21:00', '21:30'];
    
    this.agendaSemanal = horarios.map(hora => {
      const slots = this.dias.map(dia => {
        const turno = this.proximosTurnos.find(
          t => t.fecha === dia.fecha && t.hora === hora
        );
        
        return {
          disponible: !turno,
          turno: turno,
          fecha: dia.fecha
        };
      });

      return {
        hora: hora,
        slots: slots
      };
    });
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

  formatearFechaISO(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cambiarVista(vista: 'dashboard' | 'agenda' | 'consultas' | 'casos' | 'clientes'): void {
    this.vistaActiva = vista;
    this.mostrarSelectorFecha = vista === 'agenda';
    window.scrollTo(0, 0);
  }

  onFechaSeleccionada(fecha: FechaSeleccionada): void {
    this.fechaSeleccionadaCalendario = fecha;
    
    const turnosDelDia = this.proximosTurnos.filter(t => t.fecha === fecha.fecha);
    
    this.notificacionesService.mostrarNotificacion(
      `📅 Mostrando turnos del ${fecha.fechaTexto}: ${turnosDelDia.length} turnos`,
      'info'
    );
  }

  verDetallesTurno(turno: Turno): void {
    alert(`Ver detalles del turno:\n${turno.clienteNombre}\n${turno.asunto}\n${turno.hora}`);
  }

  confirmarTurno(turno: Turno): void {
    if (confirm(`¿Confirmar turno de ${turno.clienteNombre}?`)) {
      turno.estado = 'confirmado';
      turno.fechaConfirmacion = new Date().toISOString().split('T')[0];
      
      this.notificacionesService.enviarConfirmacionTurno(
        turno.clienteEmail,
        turno.clienteNombre,
        turno.fecha,
        turno.hora,
        turno.horaFin,
        turno.motivo || turno.asunto,
        this.usuario?.nombre || 'Asesor'
      ).subscribe({
        next: () => {
          this.notificacionesService.mostrarNotificacion(
            '✅ Turno confirmado y email enviado al cliente',
            'success'
          );
        }
      });
    }
  }

  marcarTurnoCompletado(turno: Turno): void {
    if (confirm(`¿Marcar turno de ${turno.clienteNombre} como completado?`)) {
      turno.estado = 'completado';
      this.notificacionesService.mostrarNotificacion(
        '✅ Turno marcado como completado',
        'success'
      );
      
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

  enviarRespuestaConsulta(): void {
    if (!this.consultaSeleccionada || !this.respuestaConsulta.trim()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    this.consultaSeleccionada.respondida = true;
    this.consultaSeleccionada.respuesta = this.respuestaConsulta;

    this.notificacionesService.mostrarNotificacion(
      `✅ Respuesta enviada a ${this.consultaSeleccionada.clienteNombre}`,
      'success'
    );

    this.estadisticas.consultasPendientes--;
    this.cerrarModalConsulta();
  }

  verDetalleCaso(caso: Caso): void {
    alert(`Caso ${caso.numero}\nCliente: ${caso.cliente}\nTipo: ${caso.tipo}\nEstado: ${caso.estado}`);
  }

  verDetalleCliente(cliente: any): void {
    alert(`Cliente: ${cliente.nombre}\nEmail: ${cliente.email}\nTeléfono: ${cliente.telefono}\nCasos activos: ${cliente.casosActivos}`);
  }

  clickSlotAgenda(slot: any): void {
    if (slot.disponible) {
      alert(`Slot disponible\n¿Deseas agendar un turno para un cliente?`);
    } else if (slot.turno) {
      alert(`Turno ocupado:\nCliente: ${slot.turno.clienteNombre}\nMotivo: ${slot.turno.asunto}`);
    }
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
    return this.proximosTurnos.filter(t => t.fecha >= hoy).slice(0, 5);
  }

  getConsultasPendientes(): Consulta[] {
    return this.consultas.filter(c => !c.respondida);
  }

  getTurnosDelDia(): Turno[] {
    if (!this.fechaSeleccionadaCalendario) return [];
    return this.proximosTurnos.filter(t => t.fecha === this.fechaSeleccionadaCalendario!.fecha);
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'status-pendiente',
      'confirmado': 'status-confirmado',
      'activo': 'status-proceso',
      'en_proceso': 'status-proceso',
      'cancelado': 'status-urgente',
      'completado': 'bg-secondary'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'activo': 'Activo',
      'en_proceso': 'En Proceso',
      'cancelado': 'Cancelado',
      'finalizado': 'Finalizado',
      'completado': 'Completado'
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
}
