import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, Usuario } from '../../auth/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';

interface Documento {
  id: number;
  nombre: string;
  tipo: 'pdf' | 'doc' | 'img' | 'escrito';
  extension: string;
  tamanio: string;
  fecha: string;
  descripcion?: string;
}

interface Movimiento {
  id: number;
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo: 'actuacion' | 'escrito' | 'notificacion' | 'audiencia' | 'pago';
  icono: string;
}

interface Pago {
  id: number;
  concepto: string;
  monto: number;
  estado: 'pendiente' | 'habilitado' | 'pagado' | 'vencido';
  fechaVencimiento?: string;
  fechaPago?: string;
  metodoPago?: string;
  linkMercadoPago?: string;
}

interface Caso {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  tipoBadgeColor: string;
  estado: 'en_proceso' | 'pendiente_asignacion' | 'completado' | 'archivado';
  progreso: number;
  asesor: { nombre: string; email: string; telefono: string; foto?: string; } | null;
  fechaInicio: string;
  ultimaActualizacion: string;
  proximaAudiencia?: { fecha: string; hora: string; lugar: string; tipo: string; };
  documentos: Documento[];
  movimientos: Movimiento[];
  pagos: Pago[];
  notas?: string;
}

@Component({
  selector: 'app-mis-casos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './mis-casos.html',
  styleUrls: ['./mis-casos.css']
})
export class MisCasosComponent implements OnInit {

  usuario: Usuario | null = null;
  vistaActual: 'lista' | 'detalle' = 'lista';
  tabListaActivo: 'activos' | 'completados' = 'activos';
  tabDetalleActivo: 'resumen' | 'documentos' | 'movimientos' | 'pagos' = 'resumen';
  casoSeleccionado: Caso | null = null;
  estadisticas = { total: 5, enProceso: 3, completados: 2 };
  mostrarModalPago = false;
  pagoSeleccionado: Pago | null = null;
  procesandoPago = false;
  mostrarModalDocumento = false;
  documentoSeleccionado: Documento | null = null;

  casos: Caso[] = [
    {
      id: '2024-001', numero: '2024-001', titulo: 'Despido Injustificado',
      descripcion: 'Reclamo por despido sin causa justificada. Se solicita indemnización completa según Ley de Contrato de Trabajo.',
      tipo: 'Derecho Laboral', tipoBadgeColor: '#3b82f6', estado: 'en_proceso', progreso: 65,
      asesor: { nombre: 'Dra. María González', email: 'maria.gonzalez@estudio.com', telefono: '+54 351 456-7890' },
      fechaInicio: '01/10/2024', ultimaActualizacion: 'Hace 2 días',
      proximaAudiencia: { fecha: '15/12/2024', hora: '10:00', lugar: 'Juzgado Laboral N°3 - Sala 2', tipo: 'Audiencia de Conciliación' },
      documentos: [
        { id: 1, nombre: 'Contrato de Trabajo Original', tipo: 'pdf', extension: 'PDF', tamanio: '1.2 MB', fecha: '01/10/2024', descripcion: 'Contrato firmado al inicio de la relación laboral' },
        { id: 2, nombre: 'Recibos de Sueldo (últimos 12 meses)', tipo: 'pdf', extension: 'PDF', tamanio: '3.5 MB', fecha: '01/10/2024' },
        { id: 3, nombre: 'Telegrama de Despido', tipo: 'img', extension: 'JPG', tamanio: '850 KB', fecha: '05/10/2024' },
        { id: 4, nombre: 'Carta Documento Respuesta', tipo: 'pdf', extension: 'PDF', tamanio: '420 KB', fecha: '10/10/2024' },
        { id: 5, nombre: 'Demanda Laboral', tipo: 'escrito', extension: 'DOC', tamanio: '125 KB', fecha: '20/10/2024' },
        { id: 6, nombre: 'Cédula de Notificación', tipo: 'pdf', extension: 'PDF', tamanio: '380 KB', fecha: '05/11/2024' },
        { id: 7, nombre: 'Certificado de Trabajo', tipo: 'pdf', extension: 'PDF', tamanio: '290 KB', fecha: '10/11/2024' },
        { id: 8, nombre: 'Escrito AGREGA Documentación', tipo: 'escrito', extension: 'DOC', tamanio: '45 KB', fecha: '15/11/2024' },
        { id: 9, nombre: 'Liquidación Pretendida', tipo: 'pdf', extension: 'PDF', tamanio: '180 KB', fecha: '18/11/2024' },
        { id: 10, nombre: 'Acta Audiencia Preliminar', tipo: 'pdf', extension: 'PDF', tamanio: '520 KB', fecha: '25/11/2024' },
        { id: 11, nombre: 'DNI Frente', tipo: 'img', extension: 'JPG', tamanio: '1.1 MB', fecha: '01/10/2024' },
        { id: 12, nombre: 'DNI Dorso', tipo: 'img', extension: 'JPG', tamanio: '1.0 MB', fecha: '01/10/2024' }
      ],
      movimientos: [
        { id: 1, fecha: '25/11/2024', titulo: 'Audiencia Preliminar Realizada', descripcion: 'Se llevó a cabo audiencia preliminar. La demandada no aceptó conciliación.', tipo: 'audiencia', icono: '🏛️' },
        { id: 2, fecha: '20/11/2024', titulo: 'Contestación de Demanda', descripcion: 'La parte demandada presentó contestación de demanda.', tipo: 'actuacion', icono: '📋' },
        { id: 3, fecha: '15/11/2024', titulo: 'Documentación Agregada', descripcion: 'Se agregaron recibos de sueldo adicionales.', tipo: 'escrito', icono: '📎' },
        { id: 4, fecha: '05/11/2024', titulo: 'Demanda Notificada', descripcion: 'Se notificó la demanda al domicilio de la empresa.', tipo: 'notificacion', icono: '📬' },
        { id: 5, fecha: '20/10/2024', titulo: 'Demanda Presentada', descripcion: 'Se presentó demanda laboral ante el Juzgado Laboral N°3.', tipo: 'escrito', icono: '📝' },
        { id: 6, fecha: '10/10/2024', titulo: 'Respuesta a Telegrama', descripcion: 'Se envió carta documento impugnando el despido.', tipo: 'notificacion', icono: '📨' },
        { id: 7, fecha: '01/10/2024', titulo: 'Inicio del Caso', descripcion: 'Se recibió documentación inicial.', tipo: 'actuacion', icono: '🚀' }
      ],
      pagos: [
        { id: 1, concepto: 'Honorarios Iniciales - Apertura de Caso', monto: 50000, estado: 'pagado', fechaPago: '01/10/2024', metodoPago: 'Mercado Pago' },
        { id: 2, concepto: 'Tasa de Justicia', monto: 25000, estado: 'pagado', fechaPago: '18/10/2024', metodoPago: 'Transferencia' },
        { id: 3, concepto: 'Honorarios Segunda Etapa - Contestación', monto: 35000, estado: 'habilitado', fechaVencimiento: '10/12/2024', linkMercadoPago: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=123456789' },
        { id: 4, concepto: 'Gastos de Notificación', monto: 8500, estado: 'habilitado', fechaVencimiento: '15/12/2024', linkMercadoPago: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=987654321' },
        { id: 5, concepto: 'Honorarios Audiencia de Vista de Causa', monto: 45000, estado: 'pendiente', fechaVencimiento: '20/01/2025' }
      ],
      notas: 'El caso avanza favorablemente. Buenas probabilidades de sentencia favorable.'
    },
    {
      id: '2024-002', numero: '2024-002', titulo: 'Divorcio de Mutuo Acuerdo',
      descripcion: 'Trámite de divorcio vincular por mutuo acuerdo. Incluye convenio regulador.',
      tipo: 'Derecho Familiar', tipoBadgeColor: '#8b5cf6', estado: 'en_proceso', progreso: 40,
      asesor: { nombre: 'Dr. Carlos Rodríguez', email: 'carlos.rodriguez@estudio.com', telefono: '+54 351 456-7891' },
      fechaInicio: '15/10/2024', ultimaActualizacion: 'Ayer',
      proximaAudiencia: { fecha: '20/12/2024', hora: '11:30', lugar: 'Juzgado de Familia N°5', tipo: 'Audiencia de Ratificación' },
      documentos: [
        { id: 1, nombre: 'Acta de Matrimonio', tipo: 'pdf', extension: 'PDF', tamanio: '450 KB', fecha: '15/10/2024' },
        { id: 2, nombre: 'Partidas de Nacimiento Hijos', tipo: 'pdf', extension: 'PDF', tamanio: '890 KB', fecha: '15/10/2024' },
        { id: 3, nombre: 'Convenio Regulador', tipo: 'pdf', extension: 'PDF', tamanio: '1.2 MB', fecha: '20/10/2024' },
        { id: 4, nombre: 'Escrito Solicitud Divorcio', tipo: 'escrito', extension: 'DOC', tamanio: '85 KB', fecha: '25/10/2024' },
        { id: 5, nombre: 'Inventario de Bienes', tipo: 'pdf', extension: 'PDF', tamanio: '2.1 MB', fecha: '01/11/2024' },
        { id: 6, nombre: 'DNI Ambos Cónyuges', tipo: 'img', extension: 'JPG', tamanio: '2.5 MB', fecha: '15/10/2024' },
        { id: 7, nombre: 'Escrito SOLICITA Audiencia', tipo: 'escrito', extension: 'DOC', tamanio: '38 KB', fecha: '15/11/2024' },
        { id: 8, nombre: 'Cédula Citación Audiencia', tipo: 'pdf', extension: 'PDF', tamanio: '320 KB', fecha: '25/11/2024' }
      ],
      movimientos: [
        { id: 1, fecha: '25/11/2024', titulo: 'Audiencia Fijada', descripcion: 'Se fijó audiencia de ratificación para el 20/12/2024.', tipo: 'notificacion', icono: '📅' },
        { id: 2, fecha: '15/11/2024', titulo: 'Solicitud de Audiencia', descripcion: 'Se solicitó fijación de audiencia de ratificación.', tipo: 'escrito', icono: '📝' },
        { id: 3, fecha: '01/11/2024', titulo: 'Convenio Aprobado', descripcion: 'El juzgado tuvo por presentado el convenio regulador.', tipo: 'actuacion', icono: '✅' },
        { id: 4, fecha: '25/10/2024', titulo: 'Demanda Presentada', descripcion: 'Se presentó solicitud de divorcio.', tipo: 'escrito', icono: '📋' },
        { id: 5, fecha: '15/10/2024', titulo: 'Inicio del Trámite', descripcion: 'Se recibió documentación.', tipo: 'actuacion', icono: '🚀' }
      ],
      pagos: [
        { id: 1, concepto: 'Honorarios Divorcio - Pago Único', monto: 80000, estado: 'pagado', fechaPago: '15/10/2024', metodoPago: 'Mercado Pago' },
        { id: 2, concepto: 'Tasa de Justicia', monto: 15000, estado: 'pagado', fechaPago: '20/10/2024', metodoPago: 'Efectivo' },
        { id: 3, concepto: 'Gastos de Inscripción Sentencia', monto: 12000, estado: 'pendiente', fechaVencimiento: '15/01/2025' }
      ]
    },
    {
      id: '2024-003', numero: '2024-003', titulo: 'Contrato de Alquiler - Cláusulas Abusivas',
      descripcion: 'Revisión y reclamo por cláusulas abusivas en contrato de alquiler.',
      tipo: 'Derecho Civil', tipoBadgeColor: '#10b981', estado: 'pendiente_asignacion', progreso: 10,
      asesor: null, fechaInicio: '18/11/2024', ultimaActualizacion: 'Hoy',
      documentos: [
        { id: 1, nombre: 'Contrato de Alquiler', tipo: 'pdf', extension: 'PDF', tamanio: '2.8 MB', fecha: '18/11/2024' },
        { id: 2, nombre: 'Recibos de Pago', tipo: 'pdf', extension: 'PDF', tamanio: '1.5 MB', fecha: '18/11/2024' },
        { id: 3, nombre: 'Comunicaciones con Propietario', tipo: 'img', extension: 'JPG', tamanio: '3.2 MB', fecha: '20/11/2024' }
      ],
      movimientos: [
        { id: 1, fecha: '20/11/2024', titulo: 'Documentación Adicional', descripcion: 'Se agregaron capturas de conversaciones.', tipo: 'actuacion', icono: '📎' },
        { id: 2, fecha: '18/11/2024', titulo: 'Caso Registrado', descripcion: 'Pendiente asignación de asesor.', tipo: 'actuacion', icono: '📋' }
      ],
      pagos: [
        { id: 1, concepto: 'Consulta Inicial', monto: 15000, estado: 'habilitado', fechaVencimiento: '25/11/2024', linkMercadoPago: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=456789123' }
      ]
    },
    {
      id: '2023-045', numero: '2023-045', titulo: 'Sucesión - Herencia Familiar',
      descripcion: 'Trámite sucesorio por fallecimiento. Declaratoria de herederos.',
      tipo: 'Derecho Sucesorio', tipoBadgeColor: '#f59e0b', estado: 'completado', progreso: 100,
      asesor: { nombre: 'Dra. María González', email: 'maria.gonzalez@estudio.com', telefono: '+54 351 456-7890' },
      fechaInicio: '15/03/2023', ultimaActualizacion: '10/09/2024',
      documentos: [
        { id: 1, nombre: 'Partida de Defunción', tipo: 'pdf', extension: 'PDF', tamanio: '380 KB', fecha: '15/03/2023' },
        { id: 2, nombre: 'Testamento', tipo: 'pdf', extension: 'PDF', tamanio: '1.2 MB', fecha: '15/03/2023' },
        { id: 3, nombre: 'Declaratoria de Herederos', tipo: 'pdf', extension: 'PDF', tamanio: '890 KB', fecha: '20/06/2023' },
        { id: 4, nombre: 'Escritura de Adjudicación', tipo: 'pdf', extension: 'PDF', tamanio: '2.5 MB', fecha: '15/08/2024' },
        { id: 5, nombre: 'Inscripción Registral', tipo: 'pdf', extension: 'PDF', tamanio: '450 KB', fecha: '10/09/2024' }
      ],
      movimientos: [
        { id: 1, fecha: '10/09/2024', titulo: 'Caso Finalizado', descripcion: 'Trámite sucesorio finalizado.', tipo: 'actuacion', icono: '✅' },
        { id: 2, fecha: '15/08/2024', titulo: 'Escritura Firmada', descripcion: 'Se firmó escritura de adjudicación.', tipo: 'actuacion', icono: '✍️' },
        { id: 3, fecha: '20/06/2023', titulo: 'Declaratoria Dictada', descripcion: 'El juzgado dictó declaratoria de herederos.', tipo: 'actuacion', icono: '⚖️' }
      ],
      pagos: [
        { id: 1, concepto: 'Honorarios Sucesión', monto: 150000, estado: 'pagado', fechaPago: '20/03/2023', metodoPago: 'Transferencia' },
        { id: 2, concepto: 'Tasa de Justicia', monto: 45000, estado: 'pagado', fechaPago: '25/03/2023', metodoPago: 'Efectivo' },
        { id: 3, concepto: 'Gastos Escribanía', monto: 85000, estado: 'pagado', fechaPago: '10/08/2024', metodoPago: 'Mercado Pago' },
        { id: 4, concepto: 'Inscripción Registral', monto: 25000, estado: 'pagado', fechaPago: '05/09/2024', metodoPago: 'Mercado Pago' }
      ]
    },
    {
      id: '2023-032', numero: '2023-032', titulo: 'Accidente de Tránsito - Daños y Perjuicios',
      descripcion: 'Reclamo por daños materiales y lesiones en accidente de tránsito.',
      tipo: 'Derecho Civil', tipoBadgeColor: '#10b981', estado: 'completado', progreso: 100,
      asesor: { nombre: 'Dr. Carlos Rodríguez', email: 'carlos.rodriguez@estudio.com', telefono: '+54 351 456-7891' },
      fechaInicio: '10/05/2023', ultimaActualizacion: '25/07/2024',
      documentos: [
        { id: 1, nombre: 'Denuncia Policial', tipo: 'pdf', extension: 'PDF', tamanio: '1.1 MB', fecha: '10/05/2023' },
        { id: 2, nombre: 'Informe Médico', tipo: 'pdf', extension: 'PDF', tamanio: '2.3 MB', fecha: '15/05/2023' },
        { id: 3, nombre: 'Presupuesto Reparación', tipo: 'pdf', extension: 'PDF', tamanio: '890 KB', fecha: '20/05/2023' },
        { id: 4, nombre: 'Acuerdo Transaccional', tipo: 'pdf', extension: 'PDF', tamanio: '1.5 MB', fecha: '20/07/2024' }
      ],
      movimientos: [
        { id: 1, fecha: '25/07/2024', titulo: 'Caso Cerrado', descripcion: 'Caso finalizado satisfactoriamente.', tipo: 'pago', icono: '💰' },
        { id: 2, fecha: '20/07/2024', titulo: 'Acuerdo Firmado', descripcion: 'Se firmó acuerdo por $850.000.', tipo: 'actuacion', icono: '🤝' },
        { id: 3, fecha: '10/05/2023', titulo: 'Inicio del Reclamo', descripcion: 'Se inició reclamo extrajudicial.', tipo: 'actuacion', icono: '🚀' }
      ],
      pagos: [
        { id: 1, concepto: 'Honorarios (20% de lo obtenido)', monto: 170000, estado: 'pagado', fechaPago: '25/07/2024', metodoPago: 'Transferencia' }
      ]
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
    if (!this.usuario) {
      this.router.navigate(['/inicio']);
    }
  }

  // Navegación
  volverDashboard(): void { this.router.navigate(['/panel-cliente']); }
  cerrarSesion(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  // Vistas y tabs
  getCasosActivos(): Caso[] { return this.casos.filter(c => c.estado !== 'completado' && c.estado !== 'archivado'); }
  getCasosCompletados(): Caso[] { return this.casos.filter(c => c.estado === 'completado' || c.estado === 'archivado'); }

  verDetalleCaso(caso: Caso): void {
    this.casoSeleccionado = caso;
    this.vistaActual = 'detalle';
    this.tabDetalleActivo = 'resumen';
    window.scrollTo(0, 0);
  }

  volverALista(): void {
    this.vistaActual = 'lista';
    this.casoSeleccionado = null;
  }

  cambiarTabLista(tab: 'activos' | 'completados'): void { this.tabListaActivo = tab; }
  cambiarTabDetalle(tab: 'resumen' | 'documentos' | 'movimientos' | 'pagos'): void { this.tabDetalleActivo = tab; }

  // Estado visual
  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'en_proceso': 'estado-proceso',
      'pendiente_asignacion': 'estado-pendiente',
      'completado': 'estado-completado',
      'archivado': 'estado-archivado'
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'en_proceso': 'En Proceso',
      'pendiente_asignacion': 'Pendiente Asignación',
      'completado': 'Completado',
      'archivado': 'Archivado'
    };
    return textos[estado] || estado;
  }

  getIconoDocumento(tipo: string): string {
    const iconos: { [key: string]: string } = { 'pdf': '📕', 'doc': '📘', 'img': '🖼️', 'escrito': '📝' };
    return iconos[tipo] || '📄';
  }

  getClaseMovimiento(tipo: string): string {
    const clases: { [key: string]: string } = {
      'actuacion': 'mov-actuacion',
      'escrito': 'mov-escrito',
      'notificacion': 'mov-notificacion',
      'audiencia': 'mov-audiencia',
      'pago': 'mov-pago'
    };
    return clases[tipo] || '';
  }

  // Documentos
  verDocumento(doc: Documento): void {
    this.documentoSeleccionado = doc;
    this.mostrarModalDocumento = true;
  }

  descargarDocumento(doc: Documento): void {
    this.notificacionesService.mostrarNotificacion(`⬇️ Descargando ${doc.nombre}...`, 'info');
  }

  cerrarModalDocumento(): void {
    this.mostrarModalDocumento = false;
    this.documentoSeleccionado = null;
  }

  // Pagos
  getPagosHabilitados(): Pago[] {
    return this.casoSeleccionado?.pagos.filter(p => p.estado === 'habilitado') || [];
  }

  getPagosPendientes(): Pago[] {
    return this.casoSeleccionado?.pagos.filter(p => p.estado === 'pendiente') || [];
  }

  getPagosPagados(): Pago[] {
    return this.casoSeleccionado?.pagos.filter(p => p.estado === 'pagado') || [];
  }

  getTotalPagado(): number {
    return this.casoSeleccionado?.pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + p.monto, 0) || 0;
  }

  getTotalPendiente(): number {
    return this.casoSeleccionado?.pagos.filter(p => p.estado !== 'pagado').reduce((sum, p) => sum + p.monto, 0) || 0;
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(monto);
  }

  getEstadoPagoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'pago-pendiente',
      'habilitado': 'pago-habilitado',
      'pagado': 'pago-pagado',
      'vencido': 'pago-vencido'
    };
    return clases[estado] || '';
  }

  getEstadoPagoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'pendiente': 'Pendiente de Habilitar',
      'habilitado': 'Habilitado para Pagar',
      'pagado': 'Pagado',
      'vencido': 'Vencido'
    };
    return textos[estado] || estado;
  }

  abrirModalPago(pago: Pago): void {
    this.pagoSeleccionado = pago;
    this.mostrarModalPago = true;
  }

  cerrarModalPago(): void {
    this.mostrarModalPago = false;
    this.pagoSeleccionado = null;
    this.procesandoPago = false;
  }

  pagarConMercadoPago(): void {
    if (this.pagoSeleccionado?.linkMercadoPago) {
      this.procesandoPago = true;
      // Simular procesamiento
      setTimeout(() => {
        window.open(this.pagoSeleccionado!.linkMercadoPago, '_blank');
        this.procesandoPago = false;
      }, 1000);
    }
  }

  // Utilidades
  getIniciales(nombre: string): string {
    const palabras = nombre.split(' ');
    if (palabras.length >= 2) {
      return palabras[0][0] + palabras[1][0];
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  contactarAsesor(): void {
    if (this.casoSeleccionado?.asesor) {
      window.location.href = `mailto:${this.casoSeleccionado.asesor.email}`;
    }
  }

  llamarAsesor(): void {
    if (this.casoSeleccionado?.asesor) {
      window.location.href = `tel:${this.casoSeleccionado.asesor.telefono}`;
    }
  }

  irADocumentos(): void {
    this.router.navigate(['/panel-cliente/documentos']);
  }

  // Método para contar pagos habilitados de un caso específico
  contarPagosHabilitados(caso: Caso): number {
    return caso.pagos ? caso.pagos.filter(p => p.estado === 'habilitado').length : 0;
  }

  // Método para verificar si un caso tiene pagos habilitados
  tienePagosHabilitados(caso: Caso): boolean {
    return caso.pagos ? caso.pagos.some(p => p.estado === 'habilitado') : false;
  }
}
