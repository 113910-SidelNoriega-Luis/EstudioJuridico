import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, Usuario } from '../../auth/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { CasoService, DatosPago } from '../../services/caso.service';

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
  asesor: { nombre: string; email: string; telefono: string; foto?: string } | null;
  fechaInicio: string;
  ultimaActualizacion: string;
  proximaAudiencia?: { fecha: string; hora: string; lugar: string; tipo: string };
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
  styleUrls: ['./mis-casos.css'],
})
export class MisCasosComponent implements OnInit {
  usuario: Usuario | null = null;
  vistaActual: 'lista' | 'detalle' = 'lista';
  tabListaActivo: 'activos' | 'completados' = 'activos';
  tabDetalleActivo: 'resumen' | 'documentos' | 'movimientos' | 'pagos' = 'resumen';
  casoSeleccionado: Caso | null = null;
  estadisticas = { total: 1, enProceso: 1, completados: 0 };
  mostrarModalPago = false;
  pagoSeleccionado: Pago | null = null;
  procesandoPago = false;
  mostrarModalDocumento = false;
  documentoSeleccionado: Documento | null = null;
  mostrarModalNuevoCaso = false;

  nuevoCaso = {
    titulo: '',
    tipo: '',
    descripcion: '',
  };

  casos: Caso[] = [
    {
      id: '1',
      numero: '2024-002',
      titulo: 'Divorcio de Mutuo Acuerdo',
      descripcion: 'Trámite de divorcio vincular por mutuo acuerdo. Incluye convenio regulador.',
      tipo: 'Derecho Familiar',
      tipoBadgeColor: '#8b5cf6',
      estado: 'en_proceso',
      progreso: 40,
      asesor: {
        nombre: 'Dr. Carlos Rodríguez',
        email: 'carlos.rodriguez@estudio.com',
        telefono: '+54 351 456-7891',
      },
      fechaInicio: '15/10/2024',
      ultimaActualizacion: 'Ayer',
      proximaAudiencia: {
        fecha: '20/12/2024',
        hora: '11:30',
        lugar: 'Juzgado de Familia N°5',
        tipo: 'Audiencia de Ratificación',
      },
      documentos: [
        {
          id: 1,
          nombre: 'Acta de Matrimonio',
          tipo: 'pdf',
          extension: 'PDF',
          tamanio: '450 KB',
          fecha: '15/10/2024',
        },
        {
          id: 2,
          nombre: 'Partidas de Nacimiento Hijos',
          tipo: 'pdf',
          extension: 'PDF',
          tamanio: '890 KB',
          fecha: '15/10/2024',
        },
        {
          id: 3,
          nombre: 'Convenio Regulador',
          tipo: 'pdf',
          extension: 'PDF',
          tamanio: '1.2 MB',
          fecha: '20/10/2024',
        },
        {
          id: 4,
          nombre: 'Escrito Solicitud Divorcio',
          tipo: 'escrito',
          extension: 'DOC',
          tamanio: '85 KB',
          fecha: '25/10/2024',
        },
        {
          id: 5,
          nombre: 'Inventario de Bienes',
          tipo: 'pdf',
          extension: 'PDF',
          tamanio: '2.1 MB',
          fecha: '01/11/2024',
        },
        {
          id: 6,
          nombre: 'DNI Ambos Cónyuges',
          tipo: 'img',
          extension: 'JPG',
          tamanio: '2.5 MB',
          fecha: '15/10/2024',
        },
        {
          id: 7,
          nombre: 'Escrito SOLICITA Audiencia',
          tipo: 'escrito',
          extension: 'DOC',
          tamanio: '38 KB',
          fecha: '15/11/2024',
        },
        {
          id: 8,
          nombre: 'Cédula Citación Audiencia',
          tipo: 'pdf',
          extension: 'PDF',
          tamanio: '320 KB',
          fecha: '25/11/2024',
        },
      ],
      movimientos: [
        {
          id: 1,
          fecha: '25/11/2024',
          titulo: 'Audiencia Fijada',
          descripcion: 'Se fijó audiencia de ratificación para el 20/12/2024.',
          tipo: 'notificacion',
          icono: '📅',
        },
        {
          id: 2,
          fecha: '15/11/2024',
          titulo: 'Solicitud de Audiencia',
          descripcion: 'Se solicitó fijación de audiencia de ratificación.',
          tipo: 'escrito',
          icono: '📝',
        },
        {
          id: 3,
          fecha: '01/11/2024',
          titulo: 'Convenio Aprobado',
          descripcion: 'El juzgado tuvo por presentado el convenio regulador.',
          tipo: 'actuacion',
          icono: '✅',
        },
        {
          id: 4,
          fecha: '25/10/2024',
          titulo: 'Demanda Presentada',
          descripcion: 'Se presentó solicitud de divorcio.',
          tipo: 'escrito',
          icono: '📋',
        },
        {
          id: 5,
          fecha: '15/10/2024',
          titulo: 'Inicio del Trámite',
          descripcion: 'Se recibió documentación.',
          tipo: 'actuacion',
          icono: '🚀',
        },
      ],
      pagos: [
        {
          id: 1,
          concepto: 'Honorarios Divorcio - Pago Único',
          monto: 80000,
          estado: 'pagado',
          fechaPago: '15/10/2024',
          metodoPago: 'Mercado Pago',
        },
        {
          id: 2,
          concepto: 'Tasa de Justicia',
          monto: 15000,
          estado: 'pagado',
          fechaPago: '20/10/2024',
          metodoPago: 'Efectivo',
        },
        {
          id: 3,
          concepto: 'Gastos de Inscripción Sentencia',
          monto: 12000,
          estado: 'pendiente',
          fechaVencimiento: '15/01/2025',
        },
      ],
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionesService: NotificacionesService,
    private casoService: CasoService,
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual();
    if (!this.usuario) {
      this.router.navigate(['/inicio']);
      return;
    }

    this.actualizarEstadisticas();
  }

  // Navegación
  volverDashboard(): void {
    this.router.navigate(['/panel-cliente']);
  }
  cerrarSesion(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/inicio']);
    }
  }

  // Vistas y tabs
  getCasosActivos(): Caso[] {
    return this.casos.filter((c) => c.estado !== 'completado' && c.estado !== 'archivado');
  }

  getCasosCompletados(): Caso[] {
    return this.casos.filter((c) => c.estado === 'completado' || c.estado === 'archivado');
  }

  abrirModalNuevoCaso(): void {
    this.mostrarModalNuevoCaso = true;
  }

  cerrarModalNuevoCaso(): void {
    this.mostrarModalNuevoCaso = false;
    this.nuevoCaso = {
      titulo: '',
      tipo: '',
      descripcion: '',
    };
  }

  crearNuevoCaso(): void {
    if (
      !this.nuevoCaso.titulo.trim() ||
      !this.nuevoCaso.tipo ||
      !this.nuevoCaso.descripcion.trim()
    ) {
      this.notificacionesService.mostrarNotificacion(
        'Completa todos los campos para crear el caso.',
        'info',
      );
      return;
    }

    const nuevoId = (Math.max(...this.casos.map((c) => Number(c.id)), 0) + 1).toString();
    const nuevoNumero = `${new Date().getFullYear()}-${String(this.casos.length + 1).padStart(3, '0')}`;
    const hoy = new Date();
    const fechaInicio = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${hoy.getFullYear()}`;

    const caso: Caso = {
      id: nuevoId,
      numero: nuevoNumero,
      titulo: this.nuevoCaso.titulo.trim(),
      descripcion: this.nuevoCaso.descripcion.trim(),
      tipo: this.nuevoCaso.tipo,
      tipoBadgeColor: this.getColorTipoCaso(this.nuevoCaso.tipo),
      estado: 'pendiente_asignacion',
      progreso: 5,
      asesor: null,
      fechaInicio,
      ultimaActualizacion: 'Hoy',
      documentos: [],
      movimientos: [
        {
          id: Date.now(),
          fecha: fechaInicio,
          titulo: 'Caso creado por cliente',
          descripcion: 'El cliente inició un nuevo caso y está pendiente de asignación.',
          tipo: 'actuacion',
          icono: '🆕',
        },
      ],
      pagos: [],
      notas: 'Caso creado desde el panel del cliente.',
    };

    this.casos.unshift(caso);
    this.actualizarEstadisticas();
    this.cerrarModalNuevoCaso();
    this.notificacionesService.mostrarNotificacion('Nuevo caso creado correctamente.', 'success');
  }

  private actualizarEstadisticas(): void {
    this.estadisticas = {
      total: this.casos.length,
      enProceso: this.casos.filter(
        (c) => c.estado === 'en_proceso' || c.estado === 'pendiente_asignacion',
      ).length,
      completados: this.casos.filter((c) => c.estado === 'completado' || c.estado === 'archivado')
        .length,
    };
  }

  private getColorTipoCaso(tipo: string): string {
    const colores: { [key: string]: string } = {
      'Derecho Familiar': '#8b5cf6',
      'Derecho Laboral': '#2563eb',
      'Derecho Civil': '#0ea5e9',
      'Derecho Penal': '#ef4444',
      'Derecho Comercial': '#14b8a6',
      Otro: '#64748b',
    };
    return colores[tipo] || '#64748b';
  }

  verDetalleCaso(caso: Caso): void {
    this.casoSeleccionado = caso;
    this.vistaActual = 'detalle';
    this.tabDetalleActivo = 'resumen';
    this.cargarDatosPagoCasoSeleccionado();
    window.scrollTo(0, 0);
  }

  private cargarDatosPagoCasoSeleccionado(): void {
    if (!this.casoSeleccionado) {
      return;
    }

    const casoIdNumerico = Number(this.casoSeleccionado.id);
    if (!Number.isFinite(casoIdNumerico)) {
      return;
    }

    this.casoService.obtenerDatosPago(casoIdNumerico).subscribe({
      next: (datosPago: DatosPago) => {
        if (!this.casoSeleccionado) {
          return;
        }

        const pagosSinDinamicos = this.casoSeleccionado.pagos.filter((p) => p.id !== 99999);

        if (datosPago.pagoHabilitado && !datosPago.pagado) {
          pagosSinDinamicos.push({
            id: 99999,
            concepto: datosPago.conceptoPago || 'Pago habilitado',
            monto: datosPago.montoPago || 0,
            estado: 'habilitado',
            linkMercadoPago: datosPago.initPoint,
          });
        }

        this.casoSeleccionado.pagos = pagosSinDinamicos;
      },
      error: () => {
        // Si no hay pago habilitado, se mantienen los pagos del caso sin bloquear la vista.
      },
    });
  }

  volverALista(): void {
    this.vistaActual = 'lista';
    this.casoSeleccionado = null;
  }

  cambiarTabLista(tab: 'activos' | 'completados'): void {
    this.tabListaActivo = tab;
  }
  cambiarTabDetalle(tab: 'resumen' | 'documentos' | 'movimientos' | 'pagos'): void {
    this.tabDetalleActivo = tab;
  }

  // Estado visual
  getEstadoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      en_proceso: 'estado-proceso',
      pendiente_asignacion: 'estado-pendiente',
      completado: 'estado-completado',
      archivado: 'estado-archivado',
    };
    return clases[estado] || '';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      en_proceso: 'En Proceso',
      pendiente_asignacion: 'Pendiente Asignación',
      completado: 'Completado',
      archivado: 'Archivado',
    };
    return textos[estado] || estado;
  }

  getIconoDocumento(tipo: string): string {
    const iconos: { [key: string]: string } = { pdf: '📕', doc: '📘', img: '🖼️', escrito: '📝' };
    return iconos[tipo] || '📄';
  }

  getClaseMovimiento(tipo: string): string {
    const clases: { [key: string]: string } = {
      actuacion: 'mov-actuacion',
      escrito: 'mov-escrito',
      notificacion: 'mov-notificacion',
      audiencia: 'mov-audiencia',
      pago: 'mov-pago',
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
    return (
      this.casoSeleccionado?.pagos.filter(
        (p) => p.estado === 'habilitado' || (p.estado === 'pendiente' && !!p.linkMercadoPago),
      ) || []
    );
  }

  getPagosPendientes(): Pago[] {
    return this.casoSeleccionado?.pagos.filter((p) => p.estado === 'pendiente') || [];
  }

  getPagosPagados(): Pago[] {
    return this.casoSeleccionado?.pagos.filter((p) => p.estado === 'pagado') || [];
  }

  getTotalPagado(): number {
    return (
      this.casoSeleccionado?.pagos
        .filter((p) => p.estado === 'pagado')
        .reduce((sum, p) => sum + p.monto, 0) || 0
    );
  }

  getTotalPendiente(): number {
    return (
      this.casoSeleccionado?.pagos
        .filter(
          (p) => p.estado === 'habilitado' || (p.estado === 'pendiente' && !!p.linkMercadoPago),
        )
        .reduce((sum, p) => sum + p.monto, 0) || 0
    );
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(monto);
  }

  getEstadoPagoClase(estado: string): string {
    const clases: { [key: string]: string } = {
      pendiente: 'pago-pendiente',
      habilitado: 'pago-habilitado',
      pagado: 'pago-pagado',
      vencido: 'pago-vencido',
    };
    return clases[estado] || '';
  }

  getEstadoPagoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      pendiente: 'Pendiente de Habilitar',
      habilitado: 'Habilitado para Pagar',
      pagado: 'Pagado',
      vencido: 'Vencido',
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
    if (!this.pagoSeleccionado || !this.pagoSeleccionado.linkMercadoPago) {
      return;
    }

    this.procesandoPago = true;

    // Simular confirmacion de pago y actualizar el estado local del caso.
    setTimeout(() => {
      window.open(this.pagoSeleccionado!.linkMercadoPago, '_blank');
      this.registrarPagoRealizado(this.pagoSeleccionado!);
      this.procesandoPago = false;
      this.cerrarModalPago();
      this.cambiarTabDetalle('pagos');
      this.notificacionesService.mostrarNotificacion('Pago registrado como realizado.', 'success');
    }, 1000);
  }

  private registrarPagoRealizado(pago: Pago): void {
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();

    pago.estado = 'pagado';
    pago.fechaPago = `${dia}/${mes}/${anio}`;
    pago.metodoPago = 'Mercado Pago';

    // Reasignar el array para que Angular detecte el cambio
    if (this.casoSeleccionado) {
      this.casoSeleccionado.pagos = [...this.casoSeleccionado.pagos];
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
    return caso.pagos
      ? caso.pagos.filter(
          (p) => p.estado === 'habilitado' || (p.estado === 'pendiente' && !!p.linkMercadoPago),
        ).length
      : 0;
  }

  // Método para verificar si un caso tiene pagos habilitados
  tienePagosHabilitados(caso: Caso): boolean {
    return caso.pagos
      ? caso.pagos.some(
          (p) => p.estado === 'habilitado' || (p.estado === 'pendiente' && !!p.linkMercadoPago),
        )
      : false;
  }
}
