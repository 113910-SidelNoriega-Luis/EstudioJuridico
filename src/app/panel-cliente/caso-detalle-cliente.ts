// caso-detalle-cliente.ts - COMPONENTE CORREGIDO
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CasoService, Caso, DatosPago } from '../services/caso.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface Documento {
  id: number;
  nombre: string;
  tipo: string;
  tamano: string;
  fecha: string;
  autor: string;
  tipoAutor: 'asesor' | 'cliente';
  url?: string;
}

@Component({
  selector: 'app-caso-detalle-cliente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './caso-detalle-cliente.component.html',
  styleUrls: ['./caso-detalle-cliente.component.css'],
})
export class CasoDetalleClienteComponent implements OnInit {
  caso: Caso | null = null;
  documentos: Documento[] = [];
  tabActiva: 'general' | 'documentos' = 'general';
  procesandoPago: boolean = false;
  datosPago: DatosPago | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private casosService: CasoService,
  ) {}

  ngOnInit() {
    // Si no hay ID valido en la ruta, usa 1 por defecto
    const rawId = this.route.snapshot.params['id'];
    const parsedId = rawId ? Number(rawId) : NaN;
    const casoId = Number.isFinite(parsedId) ? parsedId : 1;

    console.log('🔍 Cargando caso ID:', casoId);

    this.cargarDocumentos(casoId);

    // Cargar caso y datos de pago en paralelo
    forkJoin({
      caso: this.casosService.obtenerCasoPorId(casoId),
      pago: this.casosService.obtenerDatosPago(casoId).pipe(
        catchError(() => of(null)), // Si falla la carga de pago, continuar sin error
      ),
    }).subscribe({
      next: (result: any) => {
        this.caso = result.caso;
        this.datosPago = result.pago;
        console.log('✅ Caso cargado:', this.caso);
        console.log('✅ Datos de pago cargados:', this.datosPago);

        // Integrar datos de pago en el objeto caso
        if (this.caso && this.datosPago) {
          this.caso.pagoHabilitado = this.datosPago.pagoHabilitado;
          this.caso.pagado = this.datosPago.pagado;
          this.caso.montoPago = this.datosPago.montoPago;
          this.caso.conceptoPago = this.datosPago.conceptoPago;
          this.caso.initPoint = this.datosPago.initPoint;
          this.caso.preferenceId = this.datosPago.preferenceId;
          this.caso.estadoPago = this.datosPago.estadoPago;
        }
      },
      error: (error: any) => {
        console.error('❌ Error al cargar caso:', error);
        alert('Error al cargar el caso. Revisa la consola para más detalles.');
      },
    });
  }

  cargarCaso(id: number) {
    console.log('📡 Llamando al backend para caso:', id);

    this.casosService.obtenerCasoPorId(id).subscribe({
      next: (caso: Caso) => {
        this.caso = caso;
        console.log('✅ Caso cargado exitosamente:', caso);
      },
      error: (error: any) => {
        console.error('❌ Error al cargar caso:', error);
        console.error('Detalle del error:', error.message);
        alert('Error al cargar el caso. Revisa la consola para más detalles.');
      },
    });
  }

  cargarDocumentos(casoId: number) {
    // TODO: Implementar carga de documentos desde el backend
    this.documentos = [
      {
        id: 1,
        nombre: 'Carta Documento.pdf',
        tipo: 'application/pdf',
        tamano: '2.5 MB',
        fecha: '2024-11-16',
        autor: 'Dra. María González',
        tipoAutor: 'asesor',
        url: '#',
      },
      {
        id: 2,
        nombre: 'Recibos de Sueldo.pdf',
        tipo: 'application/pdf',
        tamano: '1.2 MB',
        fecha: '2024-11-20',
        autor: 'Juan Pérez',
        tipoAutor: 'cliente',
        url: '#',
      },
    ];
  }

  cargarDatosPago(casoId: number) {
    this.casosService.obtenerDatosPago(casoId).subscribe({
      next: (datos: DatosPago) => {
        this.datosPago = datos;
        // Integrar datos de pago en el objeto caso
        if (this.caso) {
          this.caso.pagoHabilitado = datos.pagoHabilitado;
          this.caso.pagado = datos.pagado;
          this.caso.montoPago = datos.montoPago;
          this.caso.conceptoPago = datos.conceptoPago;
          this.caso.initPoint = datos.initPoint;
          this.caso.preferenceId = datos.preferenceId;
          this.caso.estadoPago = datos.estadoPago;
        }
        console.log('✅ Datos de pago cargados e integrados:', datos);
      },
      error: (error: any) => {
        console.error('⚠️ No hay datos de pago disponibles:', error);
        // No mostramos alerta porque es normal que no haya pago habilitado
      },
    });
  }

  cambiarTab(tab: 'general' | 'documentos') {
    this.tabActiva = tab;
  }

  // ============================================
  // MERCADO PAGO - FLUJO DE PAGO
  // ============================================

  pagarConMercadoPago() {
    const initPoint = this.getPagoInitPoint();

    if (!initPoint || this.procesandoPago) {
      console.warn('⚠️ No se puede procesar el pago:', {
        tieneInitPoint: !!initPoint,
        estaProcesando: this.procesandoPago,
      });
      return;
    }

    this.procesandoPago = true;

    console.log('💳 Redirigiendo a Mercado Pago...');
    console.log('Init Point:', initPoint);

    // Redirigir al checkout de Mercado Pago
    window.location.href = initPoint;
  }

  hasPagoHabilitado(): boolean {
    const estadoPago = (this.datosPago?.estadoPago || this.caso?.estadoPago || '').toLowerCase();
    const habilitadoPorEstado =
      estadoPago === 'habilitado' || estadoPago === 'pending' || estadoPago === 'pendiente';
    const tieneInitPoint = !!this.getPagoInitPoint();
    const pagado = this.isPagoCompletado();
    return (
      !pagado &&
      (this.datosPago?.pagoHabilitado === true ||
        this.caso?.pagoHabilitado === true ||
        habilitadoPorEstado ||
        tieneInitPoint)
    );
  }

  isPagoCompletado(): boolean {
    const estadoPago = (this.datosPago?.estadoPago || this.caso?.estadoPago || '').toLowerCase();
    return (
      this.datosPago?.pagado === true ||
      this.caso?.pagado === true ||
      estadoPago === 'pagado' ||
      estadoPago === 'approved' ||
      estadoPago === 'completado'
    );
  }

  getPagoInitPoint(): string {
    return this.datosPago?.initPoint || this.caso?.initPoint || '';
  }

  getMontoPago(): number {
    return this.datosPago?.montoPago ?? this.caso?.montoPago ?? 0;
  }

  getConceptoPago(): string {
    return this.datosPago?.conceptoPago || this.caso?.conceptoPago || 'Honorarios';
  }

  // ============================================
  // GESTIÓN DE DOCUMENTOS
  // ============================================

  descargarDocumento(documento: Documento) {
    console.log('📥 Descargando:', documento.nombre);
    alert(`Descargando: ${documento.nombre}`);
  }

  // ============================================
  // HELPERS
  // ============================================

  getEstadoBadgeClass(): string {
    if (!this.caso) return 'bg-secondary';
    const classes: Record<string, string> = {
      activo: 'bg-success',
      en_proceso: 'bg-primary',
      pendiente: 'bg-warning',
      finalizado: 'bg-secondary',
      completado: 'bg-success',
    };
    return classes[this.caso.estado.toLowerCase()] || 'bg-secondary';
  }

  getPrioridadBadgeClass(): string {
    if (!this.caso || !this.caso.prioridad) return 'bg-secondary';
    const classes: Record<string, string> = {
      alta: 'bg-danger',
      media: 'bg-warning',
      baja: 'bg-info',
    };
    return classes[this.caso.prioridad.toLowerCase()] || 'bg-secondary';
  }

  getEstadoTexto(): string {
    if (!this.caso) return '';
    const textos: Record<string, string> = {
      activo: 'Activo',
      en_proceso: 'En Proceso',
      pendiente: 'Pendiente',
      finalizado: 'Finalizado',
      completado: 'Completado',
    };
    return textos[this.caso.estado.toLowerCase()] || this.caso.estado;
  }

  getIconoTipoArchivo(tipo: string): string {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('docx')) return '📝';
    if (tipo.includes('excel') || tipo.includes('xlsx')) return '📊';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  }

  formatearFecha(fecha: number[] | string | null | undefined): string {
    if (!fecha) return 'N/A';

    if (Array.isArray(fecha)) {
      // Formato del backend: [año, mes, día, hora, minuto]
      const [year, month, day] = fecha;
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }

    // Si es string, devolverla tal cual
    return fecha;
  }

  volverAMisCasos() {
    this.router.navigate(['/panel-cliente/casos']);
  }

  contactarAsesor() {
    if (this.caso && this.caso.asesor) {
      const email = this.caso.asesor.email || 'contacto@estudiojuridico.com';
      window.location.href = `mailto:${email}`;
    }
  }
}
